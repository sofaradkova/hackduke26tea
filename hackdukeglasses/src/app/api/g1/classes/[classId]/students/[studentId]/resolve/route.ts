import { NextRequest, NextResponse } from 'next/server'
import { classService } from '@/lib/services'
import type { G1ErrorResponse, G1ResolveResponse } from '../../../../../_lib/types'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ classId: string; studentId: string }> },
) {
  try {
    const { classId, studentId } = await params
    const resolved = await classService.resolveStudent(classId, studentId)

    if (!resolved) {
      return NextResponse.json<G1ErrorResponse>(
        { success: false, error: 'Student not found', g1_text: 'Error: student not found' },
        { status: 404 },
      )
    }

    return NextResponse.json<G1ResolveResponse>({
      success: true,
      student_id: resolved.id,
      student_name: resolved.name,
      g1_text: `Resolved: ${resolved.name}`,
      timestamp: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to resolve student', g1_text: 'Error: resolve failed' },
      { status: 500 },
    )
  }
}
