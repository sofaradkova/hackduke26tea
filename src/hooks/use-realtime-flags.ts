'use client'

import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useClassData } from '@/context/class-context'
import { useSession } from '@/context/session-context'
import type { AIFlag, FlagCategory, Notification, Student, StudentStatus } from '@/lib/types'

const STORAGE_BUCKET = 'student_snapshots'
const SIGNED_URL_EXPIRY = 3600

interface SnapshotPayload {
  id: string
  student_id: string
  class_id: string
  name: string | null
  avatar_url: string | null
  thumbnail_url: string | null
  storage_path: string | null
  status: string
  current_flag_id: string | null
  problem_set_title: string | null
  progress_percent: number
  last_checked_at: string
  captured_at: string
}

async function fetchFlag(flagId: string): Promise<AIFlag | null> {
  const { data, error } = await supabase
    .from('ai_flags')
    .select('id, reason, category, confidence_score, triggered_at, confusion_highlights')
    .eq('id', flagId)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    reason: data.reason,
    category: (data.category as FlagCategory) ?? 'wrong-approach',
    confidenceScore: data.confidence_score ?? 0.85,
    triggeredAt: data.triggered_at ? new Date(data.triggered_at) : new Date(),
    confusionHighlights: data.confusion_highlights ?? [],
  }
}

async function getSignedUrl(storagePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_EXPIRY)
  if (error || !data?.signedUrl) return null
  return data.signedUrl
}

async function payloadToStudent(row: SnapshotPayload): Promise<Student> {
  let thumbnailUrl = ''
  if (row.storage_path) {
    thumbnailUrl = (await getSignedUrl(row.storage_path)) ?? ''
  } else if (row.thumbnail_url) {
    thumbnailUrl = row.thumbnail_url
  }

  let flag: AIFlag | null = null
  const isActuallyFlagged = row.status === 'flagged' && row.current_flag_id != null
  if (isActuallyFlagged) {
    flag = await fetchFlag(row.current_flag_id!)
    // A 'success' flag means doing well — not actually flagged
    if (flag?.category === 'success') flag = null
  }

  const status: StudentStatus = flag ? 'flagged' : 'ok'

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

export function useRealtimeFlags(classId: string) {
  const { upsertStudent } = useClassData()
  const { addNotification } = useSession()
  // Track which students are already flagged so we only notify on transitions
  const flaggedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const channel = supabase
      .channel(`class-${classId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'student_snapshots',
          filter: `class_id=eq.${classId}`,
        },
        async (payload) => {
          const row = payload.new as SnapshotPayload
          const student = await payloadToStudent(row)
          upsertStudent(student)

          if (student.status === 'flagged' && student.currentFlag && !flaggedRef.current.has(student.id)) {
            flaggedRef.current.add(student.id)
            const notification: Notification = {
              id: `rt-${student.id}-${Date.now()}`,
              studentId: student.id,
              studentName: student.name,
              flagReason: student.currentFlag.reason,
              timestamp: new Date(),
            }
            addNotification(notification)
          } else if (student.status !== 'flagged') {
            flaggedRef.current.delete(student.id)
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'student_snapshots',
          filter: `class_id=eq.${classId}`,
        },
        async (payload) => {
          const row = payload.new as SnapshotPayload
          const student = await payloadToStudent(row)
          upsertStudent(student)

          if (student.status === 'flagged' && student.currentFlag && !flaggedRef.current.has(student.id)) {
            flaggedRef.current.add(student.id)
            const notification: Notification = {
              id: `rt-${student.id}-${Date.now()}`,
              studentId: student.id,
              studentName: student.name,
              flagReason: student.currentFlag.reason,
              timestamp: new Date(),
            }
            addNotification(notification)
          } else if (student.status !== 'flagged') {
            flaggedRef.current.delete(student.id)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [classId, upsertStudent, addNotification])
}
