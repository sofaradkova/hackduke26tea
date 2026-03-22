'use client'

import { useEffect, useRef } from 'react'
import { classService } from '@/lib/services'
import { useClassData } from '@/context/class-context'
import { useSession } from '@/context/session-context'
import { POLL_INTERVAL_MS } from '@/lib/constants'
import type { Notification, Student } from '@/lib/types'

export function useStudentPolling(classId: string) {
  const { setStudents, setAnalytics, setIsLoading } = useClassData()
  const { addNotification } = useSession()
  const previousStudentsRef = useRef<readonly Student[]>([])

  useEffect(() => {
    let active = true

    const tick = async () => {
      try {
        const [students, analytics] = await Promise.all([
          classService.getStudents(classId),
          classService.getAnalytics(classId),
        ])

        if (!active) return

        // Diff: find newly flagged students
        const previousMap = new Map(
          previousStudentsRef.current.map((s) => [s.id, s]),
        )

        for (const student of students) {
          const prev = previousMap.get(student.id)
          if (
            student.status === 'flagged' &&
            student.currentFlag &&
            prev?.status !== 'flagged'
          ) {
            const notification: Notification = {
              id: `notif-${student.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              studentId: student.id,
              studentName: student.name,
              flagReason: student.currentFlag.reason,
              timestamp: new Date(),
            }
            addNotification(notification)
          }
        }

        previousStudentsRef.current = students
        setStudents(students)
        setAnalytics(analytics)
        setIsLoading(false)
      } catch (error) {
        console.error('Polling error:', error)
      }
    }

    // Immediate first tick
    tick()

    const intervalId = setInterval(tick, POLL_INTERVAL_MS)

    return () => {
      active = false
      clearInterval(intervalId)
    }
  }, [classId, setStudents, setAnalytics, setIsLoading, addNotification])
}
