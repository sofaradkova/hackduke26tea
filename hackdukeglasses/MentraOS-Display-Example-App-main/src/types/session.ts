import type {
  G1AlertEntry,
  G1AlertsResponse,
  G1ClassEntry,
  G1ClassListResponse,
  G1ResolveResponse,
  G1StudentListResponse,
  G1SummaryResponse,
} from './g1';

export type ScreenName = 'classes' | 'alerts' | 'summary' | 'students';
export type ResourceKey = 'classes' | 'alerts' | 'summary' | 'students';

export interface SessionState {
  readonly sessionId: string;
  readonly userId: string;
  selectedClassId: string | null;
  activeScreen: ScreenName;
  alertIndex: number;
  studentPage: number;
  lastRenderedText: string | null;
  lastRenderAt: number | null;
  lastAlertRotationAt: number | null;
  lastStudentRotationAt: number | null;
}

export interface ResourceSnapshot<T> {
  readonly key: string;
  data: T | null;
  etag: string | null;
  lastFetchedAt: number | null;
  lastSuccessAt: number | null;
  error: string | null;
  status: number | null;
}

export interface SharedDataState {
  readonly classes: ResourceSnapshot<G1ClassListResponse>;
  readonly alertsByClass: ReadonlyMap<string, ResourceSnapshot<G1AlertsResponse>>;
  readonly summaryByClass: ReadonlyMap<string, ResourceSnapshot<G1SummaryResponse>>;
  readonly studentsByClass: ReadonlyMap<string, ResourceSnapshot<G1StudentListResponse>>;
}

export interface RenderContext {
  readonly now: number;
  readonly session: SessionState;
  readonly classes: ResourceSnapshot<G1ClassListResponse>;
  readonly alerts: ResourceSnapshot<G1AlertsResponse> | null;
  readonly summary: ResourceSnapshot<G1SummaryResponse> | null;
  readonly students: ResourceSnapshot<G1StudentListResponse> | null;
}

export interface SessionDebugView {
  readonly sessionId: string;
  readonly userId: string;
  readonly selectedClassId: string | null;
  readonly activeScreen: ScreenName;
  readonly alertIndex: number;
  readonly studentPage: number;
  readonly lastRenderAt: number | null;
}

export interface CacheDebugView {
  readonly classes: ResourceDebugView<G1ClassListResponse>;
  readonly alertsByClass: readonly ResourceDebugView<G1AlertsResponse>[];
  readonly summaryByClass: readonly ResourceDebugView<G1SummaryResponse>[];
  readonly studentsByClass: readonly ResourceDebugView<G1StudentListResponse>[];
}

export interface ResourceDebugView<T> {
  readonly key: string;
  readonly status: number | null;
  readonly etag: string | null;
  readonly lastFetchedAt: number | null;
  readonly lastSuccessAt: number | null;
  readonly error: string | null;
  readonly hasData: boolean;
  readonly itemCount: number | null;
  readonly classId: string | null;
  readonly screen: ResourceKey;
  readonly dataHash: string | null;
}

export interface ResolveActionResult {
  readonly classId: string;
  readonly response: G1ResolveResponse;
}

export function countSnapshotItems(
  resource: G1ClassListResponse | G1AlertsResponse | G1SummaryResponse | G1StudentListResponse | null,
): number | null {
  if (!resource) return null;
  if ('classes' in resource) return resource.classes.length;
  if ('alerts' in resource) return resource.alerts.length;
  if ('students' in resource) return resource.students.length;
  return 1;
}

export function resourceClassId(
  resource: G1ClassListResponse | G1AlertsResponse | G1SummaryResponse | G1StudentListResponse | null,
): string | null {
  if (!resource) return null;
  if ('class_id' in resource) return resource.class_id;
  return null;
}

export function latestAlert(resource: G1AlertsResponse | null, alertIndex: number): G1AlertEntry | null {
  if (!resource || resource.alerts.length === 0) return null;
  const safeIndex = ((alertIndex % resource.alerts.length) + resource.alerts.length) % resource.alerts.length;
  return resource.alerts[safeIndex] ?? null;
}
