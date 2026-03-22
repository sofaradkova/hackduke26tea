import { NextRequest, NextResponse } from 'next/server'
import { classService } from '@/lib/services'
import { withETag } from '../../../_lib/hash'
import { formatAlertLine } from '../../../_lib/format'
import type { G1AlertsResponse, G1ErrorResponse } from '../../../_lib/types'

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
    const flagged = [...students]
      .filter((s) => s.status === 'flagged' && s.currentFlag)
      .sort((a, b) => {
        const aTime = a.currentFlag?.triggeredAt?.getTime() ?? 0
        const bTime = b.currentFlag?.triggeredAt?.getTime() ?? 0
        return bTime - aTime
      })

    const payload: Omit<G1AlertsResponse, 'data_hash' | 'timestamp'> = {
      class_id: classId,
      class_name: classData.name,
      alerts: flagged.map((s) => ({
        student_id: s.id,
        student_name: s.name,
        flag_reason: s.currentFlag!.reason,
        flag_category: s.currentFlag!.category,
        confidence: s.currentFlag!.confidenceScore,
        triggered_at: s.currentFlag!.triggeredAt.toISOString(),
        progress_percent: s.progressPercent,
        g1_text: formatAlertLine(s.name, s.currentFlag!.reason, s.progressPercent),
      })),
      total_flagged: flagged.length,
      total_students: students.length,
    }

    return withETag(request, payload)
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch alerts', g1_text: 'Error: fetch failed' },
      { status: 500 },
    )
  }
}
