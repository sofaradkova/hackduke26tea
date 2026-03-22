import type { AnalyticsSnapshot, ClassData, Student } from '@/lib/types'

export interface ClassService {
  getClasses(): Promise<readonly ClassData[]>
  getClass(classId: string): Promise<ClassData | null>
  getStudents(classId: string): Promise<readonly Student[]>
  getAnalytics(classId: string): Promise<AnalyticsSnapshot>
  resolveStudent(classId: string, studentId: string): Promise<Student | null>
}
