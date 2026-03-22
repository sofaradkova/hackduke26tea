import { NextRequest, NextResponse } from 'next/server'
import { classService } from '@/lib/services'
import { withETag } from '../../../_lib/hash'
import { formatSummaryText } from '../../../_lib/format'
import type { G1ErrorResponse, G1SummaryResponse } from '../../../_lib/types'

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

    const analytics = await classService.getAnalytics(classId)

    const payload: Omit<G1SummaryResponse, 'data_hash' | 'timestamp'> = {
      class_id: classId,
      class_name: classData.name,
      struggling_percent: analytics.strugglingPercent,
      completion_percent: analytics.completionPercent,
      most_common_problem: analytics.mostCommonProblem,
      total_flagged: analytics.totalFlagged,
      total_students: analytics.totalStudents,
      computed_at: analytics.computedAt.toISOString(),
      g1_text: formatSummaryText(analytics, classData.name),
    }

    return withETag(request, payload)
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch summary', g1_text: 'Error: fetch failed' },
      { status: 500 },
    )
  }
}
