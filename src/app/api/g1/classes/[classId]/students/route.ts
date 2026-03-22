import { NextRequest, NextResponse } from 'next/server'
import { classService } from '@/lib/services'
import { withETag } from '../../../_lib/hash'
import { formatStudentLine } from '../../../_lib/format'
import type { G1ErrorResponse, G1StudentListResponse } from '../../../_lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> },
) {
  try {
    const { classId } = await params
    const classData = await classService.getClass(classId)

    if (!classData) {
      return NextResponse.json<G1ErrorResponse>(
        { success: false, error: 'Class not found', g1_text: 'Error: class not found' },
        { status: 404 },
      )
    }

    const students = await classService.getStudents(classId)

    const payload: Omit<G1StudentListResponse, 'data_hash' | 'timestamp'> = {
      class_id: classId,
      class_name: classData.name,
      students: students.map((s) => ({
        id: s.id,
        name: s.name,
        status: s.status,
        progress_percent: s.progressPercent,
        flag_reason: s.currentFlag?.reason ?? null,
        problem_set: s.problemSetTitle,
        last_checked_at: s.lastCheckedAt.toISOString(),
        g1_text: formatStudentLine(s.name, s.status, s.progressPercent),
      })),
    }

    return withETag(request, payload)
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch students', g1_text: 'Error: fetch failed' },
      { status: 500 },
    )
  }
}
