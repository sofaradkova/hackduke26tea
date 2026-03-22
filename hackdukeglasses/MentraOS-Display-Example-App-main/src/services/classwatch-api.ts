import type { AppConfig } from '../types/app';
import type {
  FetchResult,
  G1AlertsResponse,
  G1ApiError,
  G1ClassListResponse,
  G1ResolveResponse,
  G1StudentListResponse,
  G1SummaryResponse,
} from '../types/g1';

interface RequestOptions {
  readonly etag?: string | null;
  readonly method?: 'GET' | 'POST';
}

export class ClasswatchApiClient {
  constructor(private readonly config: AppConfig) {}

  fetchClasses(etag?: string | null): Promise<FetchResult<G1ClassListResponse>> {
    return this.request<G1ClassListResponse>('/api/g1/classes', { etag });
  }

  fetchAlerts(classId: string, etag?: string | null): Promise<FetchResult<G1AlertsResponse>> {
    return this.request<G1AlertsResponse>(`/api/g1/classes/${encodeURIComponent(classId)}/alerts`, { etag });
  }

  fetchSummary(classId: string, etag?: string | null): Promise<FetchResult<G1SummaryResponse>> {
    return this.request<G1SummaryResponse>(`/api/g1/classes/${encodeURIComponent(classId)}/summary`, { etag });
  }

  fetchStudents(classId: string, etag?: string | null): Promise<FetchResult<G1StudentListResponse>> {
    return this.request<G1StudentListResponse>(`/api/g1/classes/${encodeURIComponent(classId)}/students`, { etag });
  }

  async resolveStudent(classId: string, studentId: string): Promise<G1ResolveResponse> {
    const result = await this.request<G1ResolveResponse>(
      `/api/g1/classes/${encodeURIComponent(classId)}/students/${encodeURIComponent(studentId)}/resolve`,
      { method: 'POST' },
    );

    if (!result.data) {
      throw new Error('Resolve request returned no data');
    }

    return result.data;
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<FetchResult<T>> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.requestTimeoutMs);

    try {
      const response = await fetch(`${this.config.classwatchBaseUrl}${path}`, {
        method: options.method || 'GET',
        headers: {
          Accept: 'application/json',
          ...(options.etag ? { 'If-None-Match': options.etag } : {}),
        },
        signal: controller.signal,
      });

      const etag = response.headers.get('etag');
      if (response.status === 304) {
        return {
          status: response.status,
          etag,
          changed: false,
          data: null,
        };
      }

      const body = await response.json();
      if (!response.ok) {
        const payload = body as Partial<G1ApiError>;
        const error = new Error(payload.error || `Request failed with status ${response.status}`);
        (error as Error & { status?: number }).status = response.status;
        throw error;
      }

      return {
        status: response.status,
        etag,
        changed: true,
        data: body as T,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timed out after ${this.config.requestTimeoutMs}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
