'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import Avatar from '@mui/material/Avatar'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import { useSession } from '@/context/session-context'
import { TEACHER_NAME } from '@/lib/constants'
import NotificationEntry from './NotificationEntry'

export default function NotificationPanel() {
  const { notifications, isPanelCollapsed, setSelectedStudentId } = useSession()

  if (isPanelCollapsed) return null

  return (
    <Box
      sx={{
        width: 320,
        height: '100vh',
        bgcolor: 'background.paper',
        borderLeft: '1px solid rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Teacher profile summary */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
          {TEACHER_NAME.charAt(0)}
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight={600}>{TEACHER_NAME}</Typography>
          <Typography variant="caption" color="text.secondary">Teacher</Typography>
        </Box>
      </Box>

      {/* Alert header */}
      <Box sx={{ px: 2, pt: 2, pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <NotificationsActiveIcon sx={{ color: 'error.main', fontSize: 20 }} />
        <Typography variant="h3" sx={{ fontSize: '0.95rem' }}>
          Alerts
        </Typography>
        {notifications.length > 0 && (
          <Box
            sx={{
              bgcolor: 'error.main',
              color: 'white',
              borderRadius: '50%',
              width: 22,
              height: 22,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              fontWeight: 700,
            }}
          >
            {notifications.length}
          </Box>
        )}
      </Box>

      {/* Notification list */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 1 }}>
        {notifications.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ px: 1, py: 3, textAlign: 'center' }}>
            No alerts yet. Monitoring students...
          </Typography>
        ) : (
          <List disablePadding>
            {notifications.map((n) => (
              <NotificationEntry
                key={n.id}
                notification={n}
                onClick={setSelectedStudentId}
              />
            ))}
          </List>
        )}
      </Box>
    </Box>
  )
}
