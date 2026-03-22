import type { AppConfig } from '../types/app';
import type {
  G1AlertsResponse,
  G1ClassListResponse,
  G1StudentListResponse,
  G1SummaryResponse,
} from '../types/g1';
import type {
  CacheDebugView,
  ResourceDebugView,
  ResourceKey,
  ResourceSnapshot,
} from '../types/session';
import { countSnapshotItems, resourceClassId } from '../types/session';
import { createLogger } from '../utils/logger';
import { ClasswatchApiClient } from './classwatch-api';

const ALERT_ROTATION_MS = 6_000;
const STUDENT_PAGE_ROTATION_MS = 12_000;

type ResourceResponse = G1ClassListResponse | G1AlertsResponse | G1SummaryResponse | G1StudentListResponse;

type Fetcher<T extends ResourceResponse> = (etag?: string | null) => Promise<{
  status: number;
  etag: string | null;
  changed: boolean;
  data: T | null;
}>;

export class PollingCoordinator {
  private readonly logger;
  private readonly classesSnapshot: ResourceSnapshot<G1ClassListResponse> = this.createSnapshot('classes');
  private readonly alertsByClass = new Map<string, ResourceSnapshot<G1AlertsResponse>>();
  private readonly summaryByClass = new Map<string, ResourceSnapshot<G1SummaryResponse>>();
  private readonly studentsByClass = new Map<string, ResourceSnapshot<G1StudentListResponse>>();
  private readonly timers = new Map<string, ReturnType<typeof setInterval>>();
  private readonly inFlight = new Set<string>();

  constructor(
    private readonly config: AppConfig,
    private readonly apiClient: ClasswatchApiClient,
  ) {
    this.logger = createLogger('PollingCoordinator', config.logLevel);
  }

  start(): void {
    this.ensureTimer('classes', this.config.pollClassesMs, async () => {
      await this.refreshClasses();
      this.syncClassTimers();
    });
  }

  stop(): void {
    for (const timer of this.timers.values()) {
      clearInterval(timer);
    }
    this.timers.clear();
  }

  async refreshClasses(): Promise<ResourceSnapshot<G1ClassListResponse>> {
    await this.refreshSnapshot(this.classesSnapshot, (etag) => this.apiClient.fetchClasses(etag));
    return this.classesSnapshot;
  }

  getClasses(): ResourceSnapshot<G1ClassListResponse> {
    return this.classesSnapshot;
  }

  getAlerts(classId: string): ResourceSnapshot<G1AlertsResponse> | null {
    return this.alertsByClass.get(classId) || null;
  }

  getSummary(classId: string): ResourceSnapshot<G1SummaryResponse> | null {
    return this.summaryByClass.get(classId) || null;
  }

  getStudents(classId: string): ResourceSnapshot<G1StudentListResponse> | null {
    return this.studentsByClass.get(classId) || null;
  }

  async forceRefreshClass(classId: string): Promise<void> {
    const alerts = this.ensureClassSnapshot(this.alertsByClass, classId, 'alerts');
    const summary = this.ensureClassSnapshot(this.summaryByClass, classId, 'summary');
    const students = this.ensureClassSnapshot(this.studentsByClass, classId, 'students');

    await Promise.all([
      this.refreshSnapshot(alerts, (etag) => this.apiClient.fetchAlerts(classId, etag)),
      this.refreshSnapshot(summary, (etag) => this.apiClient.fetchSummary(classId, etag)),
      this.refreshSnapshot(students, (etag) => this.apiClient.fetchStudents(classId, etag)),
    ]);
  }

  rotateAlertsTick(): boolean {
    return Date.now() % ALERT_ROTATION_MS < 1_000;
  }

  rotateStudentsTick(): boolean {
    return Date.now() % STUDENT_PAGE_ROTATION_MS < 1_000;
  }

  async resolveStudent(classId: string, studentId: string) {
    const response = await this.apiClient.resolveStudent(classId, studentId);
    await this.forceRefreshClass(classId);
    return response;
  }

  debugView(): CacheDebugView {
    return {
      classes: this.snapshotDebugView(this.classesSnapshot, 'classes'),
      alertsByClass: Array.from(this.alertsByClass.values()).map((snapshot) => this.snapshotDebugView(snapshot, 'alerts')),
      summaryByClass: Array.from(this.summaryByClass.values()).map((snapshot) => this.snapshotDebugView(snapshot, 'summary')),
      studentsByClass: Array.from(this.studentsByClass.values()).map((snapshot) => this.snapshotDebugView(snapshot, 'students')),
    };
  }

  private createSnapshot<T extends ResourceResponse>(key: string): ResourceSnapshot<T> {
    return {
      key,
      data: null,
      etag: null,
      lastFetchedAt: null,
      lastSuccessAt: null,
      error: null,
      status: null,
    };
  }

  private ensureClassSnapshot<T extends ResourceResponse>(
    map: Map<string, ResourceSnapshot<T>>,
    classId: string,
    resource: ResourceKey,
  ): ResourceSnapshot<T> {
    const existing = map.get(classId);
    if (existing) return existing;
    const created = this.createSnapshot<T>(`${resource}:${classId}`);
    map.set(classId, created);
    return created;
  }

  private ensureTimer(key: string, intervalMs: number, task: () => Promise<void>): void {
    if (this.timers.has(key)) return;

    const run = async () => {
      if (this.inFlight.has(key)) return;
      this.inFlight.add(key);
      try {
        await task();
      } catch (error) {
        this.logger.warn('Polling task failed', { key, error: String(error) });
      } finally {
        this.inFlight.delete(key);
      }
    };

    void run();
    this.timers.set(key, setInterval(run, intervalMs));
  }

  private syncClassTimers(): void {
    const classIds = new Set((this.classesSnapshot.data?.classes || []).map((entry) => entry.id));

    for (const classId of classIds) {
      this.ensureTimer(`alerts:${classId}`, this.config.pollAlertsMs, async () => {
        const snapshot = this.ensureClassSnapshot(this.alertsByClass, classId, 'alerts');
        await this.refreshSnapshot(snapshot, (etag) => this.apiClient.fetchAlerts(classId, etag));
      });

      this.ensureTimer(`summary:${classId}`, this.config.pollSummaryMs, async () => {
        const snapshot = this.ensureClassSnapshot(this.summaryByClass, classId, 'summary');
        await this.refreshSnapshot(snapshot, (etag) => this.apiClient.fetchSummary(classId, etag));
      });

      this.ensureTimer(`students:${classId}`, this.config.pollStudentsMs, async () => {
        const snapshot = this.ensureClassSnapshot(this.studentsByClass, classId, 'students');
        await this.refreshSnapshot(snapshot, (etag) => this.apiClient.fetchStudents(classId, etag));
      });
    }
  }

  private async refreshSnapshot<T extends ResourceResponse>(
    snapshot: ResourceSnapshot<T>,
    fetcher: Fetcher<T>,
  ): Promise<void> {
    snapshot.lastFetchedAt = Date.now();

    try {
      const result = await fetcher(snapshot.etag);
      snapshot.status = result.status;
      snapshot.etag = result.etag || snapshot.etag;
      snapshot.error = null;

      if (result.changed && result.data) {
        snapshot.data = result.data;
        snapshot.lastSuccessAt = Date.now();
      } else if (result.status === 304) {
        snapshot.lastSuccessAt = snapshot.lastSuccessAt || Date.now();
      }
    } catch (error) {
      snapshot.error = String(error);
      snapshot.status = null;
    }
  }

  private snapshotDebugView<T extends ResourceResponse>(
    snapshot: ResourceSnapshot<T>,
    screen: ResourceKey,
  ): ResourceDebugView<T> {
    return {
      key: snapshot.key,
      status: snapshot.status,
      etag: snapshot.etag,
      lastFetchedAt: snapshot.lastFetchedAt,
      lastSuccessAt: snapshot.lastSuccessAt,
      error: snapshot.error,
      hasData: Boolean(snapshot.data),
      itemCount: countSnapshotItems(snapshot.data),
      classId: resourceClassId(snapshot.data),
      screen,
      dataHash: snapshot.data?.data_hash || null,
    };
  }
}
