import { supabase } from '@/lib/supabase'
import type { AIFlag, AnalyticsSnapshot, ClassData, FlagCategory, Student, StudentStatus } from '@/lib/types'
import { generateWhiteboardSvg } from '@/lib/whiteboard-thumbnails'
import type { ClassService } from './class-service'
import { MockClassService } from './mock-class-service'

const STORAGE_BUCKET = 'student_snapshots'
const SIGNED_URL_EXPIRY_SECONDS = 3600

interface SnapshotRow {
  id: string
  student_id: string
  class_id: string
  name: string | null
  avatar_url: string | null
  thumbnail_url: string | null
  storage_path: string | null
  status: string
  current_flag: unknown
  problem_set_title: string | null
  progress_percent: number
  last_checked_at: string
  captured_at: string
}

const mockService = new MockClassService()

async function getSignedThumbnailUrl(storagePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_EXPIRY_SECONDS)
  if (error || !data?.signedUrl) return null
  return data.signedUrl
}

function parseFlag(raw: unknown): AIFlag | null {
  if (!raw || typeof raw !== 'object') return null
  const f = raw as Record<string, unknown>
  if (!f.reason) return null
  return {
    id: String(f.id ?? crypto.randomUUID()),
    reason: String(f.reason),
    category: (f.category as FlagCategory) ?? 'wrong-approach',
    confidenceScore: typeof f.confidence_score === 'number' ? f.confidence_score : 0.85,
    triggeredAt: f.triggered_at ? new Date(String(f.triggered_at)) : new Date(),
    confusionHighlights: Array.isArray(f.confusion_highlights)
      ? (f.confusion_highlights as string[])
      : [],
  }
}

async function rowToStudent(row: SnapshotRow): Promise<Student> {
  let thumbnailUrl: string

  if (row.storage_path) {
    const signed = await getSignedThumbnailUrl(row.storage_path)
    thumbnailUrl = signed ?? generateWhiteboardSvg(row.student_id, row.problem_set_title ?? 'Problem Set', row.progress_percent, row.status === 'flagged')
  } else if (row.thumbnail_url) {
    thumbnailUrl = row.thumbnail_url
  } else {
    thumbnailUrl = generateWhiteboardSvg(row.student_id, row.problem_set_title ?? 'Problem Set', row.progress_percent, row.status === 'flagged')
  }

  const flag = row.status === 'flagged' ? parseFlag(row.current_flag) : null
  // DB 'loading' means "awaiting AI analysis" — show as 'ok' in the UI (no issues detected)
  const status: StudentStatus = row.status === 'flagged' ? 'flagged' : 'ok'

  return {
    id: row.student_id,
    name: row.name ?? `Student ${row.student_id}`,
    avatarUrl: row.avatar_url ?? null,
    thumbnailUrl,
    status,
    currentFlag: flag,
    problemSetTitle: row.problem_set_title ?? 'Problem Set',
    progressPercent: row.progress_percent ?? 0,
    lastCheckedAt: new Date(row.last_checked_at),
  }
}

function latestPerStudent(rows: SnapshotRow[]): SnapshotRow[] {
  const seen = new Map<string, SnapshotRow>()
  for (const row of rows) {
    const existing = seen.get(row.student_id)
    if (!existing || new Date(row.captured_at) > new Date(existing.captured_at)) {
      seen.set(row.student_id, row)
    }
  }
  return Array.from(seen.values())
}

function computeAnalytics(students: readonly Student[]): AnalyticsSnapshot {
  const flagged = students.filter((s) => s.status === 'flagged')
  const completed = students.filter((s) => s.progressPercent >= 90)

  const categoryCounts = new Map<string, number>()
  for (const s of flagged) {
    if (s.currentFlag) {
      const cat = s.currentFlag.category
      categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1)
    }
  }

  const categoryLabels: Record<string, string> = {
    'wrong-approach': 'Wrong approach or formula',
    'stuck': 'Students getting stuck',
    'off-topic': 'Working on wrong problem',
    'calculation-error': 'Calculation errors',
  }

  let mostCommonProblem = 'None detected'
  let maxCount = 0
  for (const [cat, count] of categoryCounts) {
    if (count > maxCount) {
      maxCount = count
      mostCommonProblem = categoryLabels[cat] ?? cat
    }
  }

  return {
    strugglingPercent: students.length > 0 ? Math.round((flagged.length / students.length) * 100) : 0,
    completionPercent: students.length > 0 ? Math.round((completed.length / students.length) * 100) : 0,
    mostCommonProblem,
    totalFlagged: flagged.length,
    totalStudents: students.length,
    computedAt: new Date(),
  }
}

async function fetchSupabaseStudents(classId: string): Promise<readonly Student[] | null> {
  const { data, error } = await supabase
    .from('student_snapshots')
    .select('*')
    .eq('class_id', classId)
    .order('captured_at', { ascending: false })

  if (error || !data || data.length === 0) return null

  const latest = latestPerStudent(data as SnapshotRow[])
  return Promise.all(latest.map(rowToStudent))
}

async function getSupabaseClassCounts(): Promise<Map<string, number>> {
  const { data, error } = await supabase
    .from('student_snapshots')
    .select('class_id, student_id')

  if (error || !data) return new Map()

  const counts = new Map<string, Set<string>>()
  for (const row of data as { class_id: string; student_id: string }[]) {
    const set = counts.get(row.class_id) ?? new Set()
    set.add(row.student_id)
    counts.set(row.class_id, set)
  }

  return new Map(Array.from(counts.entries()).map(([k, v]) => [k, v.size]))
}

export class SupabaseClassService implements ClassService {
  async getClasses(): Promise<readonly ClassData[]> {
    const [mockClasses, liveCounts] = await Promise.all([
      mockService.getClasses(),
      getSupabaseClassCounts(),
    ])

    return mockClasses.map((cls) => {
      const liveCount = liveCounts.get(cls.id)
      if (liveCount !== undefined) {
        return { ...cls, studentCount: liveCount }
      }
      return cls
    })
  }

  async getClass(classId: string): Promise<ClassData | null> {
    const cls = await mockService.getClass(classId)
    if (!cls) return null

    const students = await fetchSupabaseStudents(classId)
    if (students) {
      return { ...cls, studentCount: students.length, students }
    }
    return cls
  }

  async getStudents(classId: string): Promise<readonly Student[]> {
    const students = await fetchSupabaseStudents(classId)
    if (students) return students
    return mockService.getStudents(classId)
  }

  async getAnalytics(classId: string): Promise<AnalyticsSnapshot> {
    const students = await this.getStudents(classId)
    return computeAnalytics(students)
  }
}
