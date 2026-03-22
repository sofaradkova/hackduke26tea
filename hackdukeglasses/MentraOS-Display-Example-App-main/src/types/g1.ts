export type FlagCategory = 'wrong-approach' | 'stuck' | 'off-topic' | 'calculation-error' | 'success' | 'unsure';
export type StudentStatus = 'ok' | 'flagged' | 'loading';

export interface G1ClassEntry {
  readonly id: string;
  readonly name: string;
  readonly subject: string;
  readonly student_count: number;
  readonly g1_text: string;
}

export interface G1ClassListResponse {
  readonly classes: readonly G1ClassEntry[];
  readonly data_hash: string;
  readonly timestamp: string;
}

export interface G1AlertEntry {
  readonly student_id: string;
  readonly student_name: string;
  readonly flag_reason: string;
  readonly flag_category: FlagCategory;
  readonly confidence: number;
  readonly triggered_at: string;
  readonly progress_percent: number;
  readonly confusion_highlights: readonly string[];
  readonly g1_text: string;
}

export interface G1AlertsResponse {
  readonly class_id: string;
  readonly class_name: string;
  readonly alerts: readonly G1AlertEntry[];
  readonly total_flagged: number;
  readonly total_students: number;
  readonly data_hash: string;
  readonly timestamp: string;
}

export interface G1SummaryResponse {
  readonly class_id: string;
  readonly class_name: string;
  readonly struggling_percent: number;
  readonly completion_percent: number;
  readonly most_common_problem: string;
  readonly total_flagged: number;
  readonly total_students: number;
  readonly computed_at: string;
  readonly g1_text: string;
  readonly data_hash: string;
  readonly timestamp: string;
}

export interface G1StudentEntry {
  readonly id: string;
  readonly name: string;
  readonly status: StudentStatus;
  readonly progress_percent: number;
  readonly flag_reason: string | null;
  readonly flag_category: FlagCategory | null;
  readonly problem_set: string;
  readonly last_checked_at: string;
  readonly g1_text: string;
}

export interface G1StudentListResponse {
  readonly class_id: string;
  readonly class_name: string;
  readonly students: readonly G1StudentEntry[];
  readonly data_hash: string;
  readonly timestamp: string;
}

export interface G1ResolveResponse {
  readonly success: boolean;
  readonly student_id: string;
  readonly student_name: string;
  readonly g1_text: string;
  readonly timestamp: string;
}

export interface G1ErrorResponse {
  readonly success: false;
  readonly error: string;
  readonly g1_text: string;
}

export type G1ApiError = G1ErrorResponse & {
  readonly status?: number;
};

export interface FetchResult<T> {
  readonly status: number;
  readonly etag: string | null;
  readonly changed: boolean;
  readonly data: T | null;
}
