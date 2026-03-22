export type MentraViewType = 'MAIN' | 'PINNED' | 'DEFAULT';

export interface AppConfig {
  readonly packageName: string;
  readonly mentraApiKey: string;
  readonly classwatchBaseUrl: string;
  readonly port: number;
  readonly defaultClassId: string | null;
  readonly pollClassesMs: number;
  readonly pollAlertsMs: number;
  readonly pollSummaryMs: number;
  readonly pollStudentsMs: number;
  readonly requestTimeoutMs: number;
  readonly logLevel: string;
  readonly mentraViewType: MentraViewType;
}
