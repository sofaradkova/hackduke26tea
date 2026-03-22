import { MockClassService } from './mock-class-service'
import type { ClassService } from './class-service'
import type { AnalyticsSnapshot, ClassData, FlagCategory, Student } from '@/lib/types'
import { generateWhiteboardSvg } from '@/lib/whiteboard-thumbnails'

const DEMO_CLASS_ID = 'class-demo'

interface BackendDemoResponse {
  classId: string
  problemSetTitle: string
  updatedAt: string
  students: Array<{
    id: string
    name: string
    status: 'ok' | 'flagged'
    progressPercent: number
    flagReason: string | null
    flagCategory: string | null
    confusionHighlights: string[]
    lastCheckedAt: string
    thumbnailUrl: string | null
  }>
}

function mapCategory(raw: string | null): FlagCategory {
  if (raw === 'calc-error') return 'calculation-error'
  if (raw === 'wrong-approach') return 'wrong-approach'
  if (raw === 'stuck') return 'stuck'
  if (raw === 'off-topic') return 'off-topic'
  return 'unsure'
}

function mode(items: string[]): string | undefined {
  const counts = new Map<string, number>()
  for (const item of items) {
    counts.set(item, (counts.get(item) ?? 0) + 1)
  }
  let best: string | undefined
  let bestCount = 0
  for (const [item, count] of counts) {
    if (count > bestCount) {
      bestCount = count
      best = item
    }
  }
  return best
}

function mapBackendStudent(
  student: BackendDemoResponse['students'][number],
  problemSetTitle: string,
): Student {
  return {
    id: student.id,
    name: student.name,
    avatarUrl: null,
    thumbnailUrl: student.thumbnailUrl
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3001'}${student.thumbnailUrl}`
      : generateWhiteboardSvg(
          student.id,
          problemSetTitle,
          student.progressPercent,
          student.status === 'flagged',
        ),
    status: student.status,
    currentFlag:
      student.status === 'flagged' && student.flagReason
        ? {
            id: `${student.id}-flag`,
            reason: student.flagReason,
            category: mapCategory(student.flagCategory),
            confidenceScore: 0.88,
            triggeredAt: new Date(student.lastCheckedAt),
            confusionHighlights: student.confusionHighlights,
          }
        : null,
    problemSetTitle,
    progressPercent: student.progressPercent,
    lastCheckedAt: new Date(student.lastCheckedAt),
  }
}

function computeAnalytics(students: readonly Student[]): AnalyticsSnapshot {
  const flagged = students.filter(s => s.status === 'flagged')
  const completed = students.filter(s => s.progressPercent >= 90)
  const categories = flagged
    .map(s => s.currentFlag?.category)
    .filter((c): c is FlagCategory => c !== undefined)
    .map(c => c as string)
  const mostCommon = categories.length > 0
    ? (mode(categories) ?? 'No common issue')
    : 'No issues detected'
  return {
    strugglingPercent: students.length ? Math.round(flagged.length / students.length * 100) : 0,
    completionPercent: students.length ? Math.round(completed.length / students.length * 100) : 0,
    mostCommonProblem: mostCommon,
    totalFlagged: flagged.length,
    totalStudents: students.length,
    computedAt: new Date(),
  }
}

export class DemoClassService implements ClassService {
  private readonly mock = new MockClassService()
  private cachedStudents: { students: readonly Student[]; ts: number } | null = null

  async getClasses(): Promise<readonly ClassData[]> {
    return this.mock.getClasses()
  }

  async getClass(classId: string): Promise<ClassData | null> {
    if (classId !== DEMO_CLASS_ID) return this.mock.getClass(classId)
    const mockClass = await this.mock.getClass(classId)
    const students = await this.getStudents(classId)
    return { ...(mockClass ?? { id: DEMO_CLASS_ID, name: 'Demo Class', subject: 'Mathematics', studentCount: 0, students: [] }), studentCount: students.length, students }
  }

  async getStudents(classId: string): Promise<readonly Student[]> {
    if (classId !== DEMO_CLASS_ID) return this.mock.getStudents(classId)

    const now = Date.now()
    if (this.cachedStudents && now - this.cachedStudents.ts < 500) {
      return this.cachedStudents.students
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 4000)
    let res: Response
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3001'
      res = await fetch(`${backendUrl}/api/demo/students`, { signal: controller.signal })
    } finally {
      clearTimeout(timer)
    }
    if (!res.ok) throw new Error(`Demo backend returned ${res.status}`)
    const data: BackendDemoResponse = await res.json()
    const students = data.students.map(s => mapBackendStudent(s, data.problemSetTitle))
    this.cachedStudents = { students, ts: Date.now() }
    return students
  }

  async getAnalytics(classId: string): Promise<AnalyticsSnapshot> {
    if (classId !== DEMO_CLASS_ID) return this.mock.getAnalytics(classId)
    const students = await this.getStudents(classId)
    return computeAnalytics(students)
  }

  async resolveStudent(classId: string, studentId: string): Promise<Student | null> {
    if (classId !== DEMO_CLASS_ID) return this.mock.resolveStudent(classId, studentId)
    return null  // no-op for demo
  }
}

