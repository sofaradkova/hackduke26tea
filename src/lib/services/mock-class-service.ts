import { MOCK_CLASSES } from '@/data/mock-data'
import type { AIFlag, AnalyticsSnapshot, ClassData, FlagCategory, Student } from '@/lib/types'
import { generateWhiteboardSvg } from '@/lib/whiteboard-thumbnails'
import type { ClassService } from './class-service'

const FLAG_REASONS: readonly { reason: string; category: FlagCategory; highlights: string[] }[] = [
  { reason: 'Off track: using wrong formula', category: 'wrong-approach', highlights: ['Applied incorrect method'] },
  { reason: 'Stuck: no progress for 3+ minutes', category: 'stuck', highlights: ['Has not advanced past current step'] },
  { reason: 'Calculation error: arithmetic mistake in step 3', category: 'calculation-error', highlights: ['Incorrect multiplication result'] },
  { reason: 'Off topic: working on different problem', category: 'off-topic', highlights: ['Appears to be on the wrong page'] },
  { reason: 'Stuck: repeatedly erasing same work', category: 'stuck', highlights: ['Restarted step 2 three times'] },
  { reason: 'Off track: skipped critical step', category: 'wrong-approach', highlights: ['Missing step 1 entirely'] },
]

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297
  return x - Math.floor(x)
}

export class MockClassService implements ClassService {
  private readonly classStudentStates: Map<string, Student[]> = new Map()
  private readonly classCycleCounts: Map<string, number> = new Map()

  constructor() {
    for (const cls of MOCK_CLASSES) {
      this.classStudentStates.set(cls.id, [...cls.students])
      this.classCycleCounts.set(cls.id, 0)
    }
  }

  async getClasses(): Promise<readonly ClassData[]> {
    await this.delay()
    return MOCK_CLASSES.map((cls) => ({
      ...cls,
      students: this.classStudentStates.get(cls.id) ?? [...cls.students],
    }))
  }

  async getClass(classId: string): Promise<ClassData | null> {
    await this.delay()
    const cls = MOCK_CLASSES.find((c) => c.id === classId)
    if (!cls) return null
    return {
      ...cls,
      students: this.classStudentStates.get(cls.id) ?? [...cls.students],
    }
  }

  async getStudents(classId: string): Promise<readonly Student[]> {
    await this.delay()
    const students = this.classStudentStates.get(classId)
    if (!students) return []

    const cycle = (this.classCycleCounts.get(classId) ?? 0) + 1
    this.classCycleCounts.set(classId, cycle)

    const updated = this.applyFlagRotation(students, cycle)
    this.classStudentStates.set(classId, updated)
    return updated
  }

  async getAnalytics(classId: string): Promise<AnalyticsSnapshot> {
    await this.delay()
    const students = this.classStudentStates.get(classId) ?? []
    const flagged = students.filter((s) => s.status === 'flagged')
    const completed = students.filter((s) => s.progressPercent >= 90)

    const categoryCounts = new Map<string, number>()
    for (const s of flagged) {
      if (s.currentFlag) {
        const cat = s.currentFlag.category
        categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1)
      }
    }

    let mostCommonProblem = 'None detected'
    let maxCount = 0
    for (const [cat, count] of categoryCounts) {
      if (count > maxCount) {
        maxCount = count
        mostCommonProblem = this.categoryToLabel(cat)
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

  private applyFlagRotation(students: Student[], cycle: number): Student[] {
    const updated = students.map((s) => {
      const newProgress = Math.min(100, s.progressPercent + Math.floor(seededRandom(cycle * 100 + parseInt(s.id.replace(/\D/g, ''), 10)) * 5))
      return {
        ...s,
        thumbnailUrl: generateWhiteboardSvg(s.id + cycle, s.problemSetTitle, newProgress, s.status === 'flagged'),
        lastCheckedAt: new Date(),
        progressPercent: newProgress,
      }
    })

    const rand = seededRandom(cycle * 7)

    // Every cycle: chance to flag a new student
    if (cycle % 2 === 1) {
      const unflagged = updated.filter((s) => s.status === 'ok')
      if (unflagged.length > 0) {
        const idx = Math.floor(rand * unflagged.length)
        const target = unflagged[idx]
        const flagTemplate = FLAG_REASONS[cycle % FLAG_REASONS.length]
        const flag: AIFlag = {
          id: `flag-${cycle}-${target.id}`,
          reason: flagTemplate.reason,
          category: flagTemplate.category,
          confidenceScore: 0.7 + seededRandom(cycle * 13) * 0.25,
          triggeredAt: new Date(),
          confusionHighlights: flagTemplate.highlights,
        }
        const targetIdx = updated.findIndex((s) => s.id === target.id)
        updated[targetIdx] = { ...updated[targetIdx], status: 'flagged', currentFlag: flag }
      }
    }

    // Every 3rd cycle: clear one flag
    if (cycle % 3 === 0) {
      const flagged = updated.filter((s) => s.status === 'flagged')
      if (flagged.length > 1) {
        const idx = Math.floor(seededRandom(cycle * 11) * flagged.length)
        const target = flagged[idx]
        const targetIdx = updated.findIndex((s) => s.id === target.id)
        updated[targetIdx] = { ...updated[targetIdx], status: 'ok', currentFlag: null }
      }
    }

    return updated
  }

  async resolveStudent(classId: string, studentId: string): Promise<Student | null> {
    const students = this.classStudentStates.get(classId)
    if (!students) return null
    const idx = students.findIndex((s) => s.id === studentId)
    if (idx === -1) return null
    const resolved = { ...students[idx], status: 'ok' as const, currentFlag: null }
    const updated = [...students]
    updated[idx] = resolved
    this.classStudentStates.set(classId, updated)
    return resolved
  }

  private categoryToLabel(category: string): string {
    const labels: Record<string, string> = {
      'wrong-approach': 'Wrong approach or formula',
      'stuck': 'Students getting stuck',
      'off-topic': 'Working on wrong problem',
      'calculation-error': 'Calculation errors',
    }
    return labels[category] ?? category
  }

  private delay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 50))
  }
}
