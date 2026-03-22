import { NextRequest, NextResponse } from 'next/server'
import { classService } from '@/lib/services'
import { withETag } from '../_lib/hash'
import { formatClassLine } from '../_lib/format'
import type { G1ClassListResponse } from '../_lib/types'

export async function GET(request: NextRequest) {
  try {
    const allClasses = await classService.getClasses()

    const payload: Omit<G1ClassListResponse, 'data_hash' | 'timestamp'> = {
      classes: allClasses.map((cls) => ({
        id: cls.id,
        name: cls.name,
        subject: cls.subject,
        student_count: cls.studentCount,
        g1_text: formatClassLine(cls.name, cls.subject, cls.studentCount),
      })),
    }

    return withETag(request, payload)
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch classes', g1_text: 'Error: fetch failed' },
      { status: 500 },
    )
  }
}
