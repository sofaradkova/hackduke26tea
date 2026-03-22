'use client'

import Box from '@mui/material/Box'
import Sidebar from './Sidebar'
import NotificationPanel from './NotificationPanel'
import { useSession } from '@/context/session-context'

interface AppShellProps {
  readonly topBar: React.ReactNode
  readonly children: React.ReactNode
  readonly showPanel?: boolean
}

export default function AppShell({ topBar, children, showPanel = false }: AppShellProps) {
  const { isPanelCollapsed } = useSession()

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar />
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        {topBar}
        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          {children}
        </Box>
      </Box>
      {showPanel && !isPanelCollapsed && <NotificationPanel />}
    </Box>
  )
}
