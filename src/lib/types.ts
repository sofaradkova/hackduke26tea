export type FlagCategory = 'wrong-approach' | 'stuck' | 'off-topic' | 'calculation-error' | 'success' | 'unsure'

export type StudentStatus = 'ok' | 'flagged' | 'loading'

export interface AIFlag {
  readonly id: string
  readonly reason: string
  readonly category: FlagCategory
  readonly confidenceScore: number
  readonly triggeredAt: Date
  readonly confusionHighlights: readonly string[]
}

export interface Student {
  readonly id: string
  readonly name: string
  readonly avatarUrl: string | null
  readonly thumbnailUrl: string
  readonly status: StudentStatus
  readonly currentFlag: AIFlag | null
  readonly problemSetTitle: string
  readonly progressPercent: number
  readonly lastCheckedAt: Date
}

export interface ClassData {
  readonly id: string
  readonly name: string
  readonly subject: string
  readonly studentCount: number
  readonly students: readonly Student[]
}

export interface Notification {
  readonly id: string
  readonly studentId: string
  readonly studentName: string
  readonly flagReason: string
  readonly timestamp: Date
}

export interface AnalyticsSnapshot {
  readonly strugglingPercent: number
  readonly completionPercent: number
  readonly mostCommonProblem: string
  readonly totalFlagged: number
  readonly totalStudents: number
  readonly computedAt: Date
}
