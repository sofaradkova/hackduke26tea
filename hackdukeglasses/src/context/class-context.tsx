'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { AnalyticsSnapshot, Student } from '@/lib/types'

interface ClassContextValue {
  readonly students: readonly Student[]
  readonly setStudents: (students: readonly Student[]) => void
  readonly analytics: AnalyticsSnapshot | null
  readonly setAnalytics: (analytics: AnalyticsSnapshot) => void
  readonly isLoading: boolean
  readonly setIsLoading: (loading: boolean) => void
  readonly resolveStudent: (studentId: string) => void
}

const ClassContext = createContext<ClassContextValue | null>(null)

export function ClassProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = useState<readonly Student[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const resolveStudent = useCallback((studentId: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId ? { ...s, status: 'ok', currentFlag: null } : s,
      ),
    )
  }, [])

  const value = useMemo(
    () => ({
      students,
      setStudents,
      analytics,
      setAnalytics,
      isLoading,
      setIsLoading,
      resolveStudent,
    }),
    [students, analytics, isLoading, resolveStudent],
  )

  return <ClassContext.Provider value={value}>{children}</ClassContext.Provider>
}

export function useClassData(): ClassContextValue {
  const context = useContext(ClassContext)
  if (!context) {
    throw new Error('useClassData must be used within a ClassProvider')
  }
  return context
}
