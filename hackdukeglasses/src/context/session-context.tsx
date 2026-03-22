'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { Notification } from '@/lib/types'

interface SessionContextValue {
  readonly notifications: readonly Notification[]
  readonly addNotification: (notification: Notification) => void
  readonly dismissNotification: (studentId: string) => void
  readonly isPanelCollapsed: boolean
  readonly togglePanel: () => void
  readonly selectedStudentId: string | null
  readonly setSelectedStudentId: (id: string | null) => void
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<readonly Notification[]>([])
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev])
  }, [])

  const dismissNotification = useCallback((studentId: string) => {
    setNotifications((prev) => prev.filter((n) => n.studentId !== studentId))
  }, [])

  const togglePanel = useCallback(() => {
    setIsPanelCollapsed((prev) => !prev)
  }, [])

  const value = useMemo(
    () => ({
      notifications,
      addNotification,
      dismissNotification,
      isPanelCollapsed,
      togglePanel,
      selectedStudentId,
      setSelectedStudentId,
    }),
    [notifications, addNotification, dismissNotification, isPanelCollapsed, togglePanel, selectedStudentId],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}
