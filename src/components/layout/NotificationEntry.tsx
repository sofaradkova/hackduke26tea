'use client'

import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import type { Notification } from '@/lib/types'

interface NotificationEntryProps {
  readonly notification: Notification
  readonly onClick: (studentId: string) => void
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function NotificationEntry({ notification, onClick }: NotificationEntryProps) {
  return (
    <ListItemButton
      onClick={() => onClick(notification.studentId)}
      sx={{
        borderRadius: 2,
        mb: 0.5,
        '&:hover': { bgcolor: 'rgba(198,40,40,0.04)' },
      }}
    >
      <ListItemIcon sx={{ minWidth: 36 }}>
        <ErrorOutlineIcon sx={{ color: 'error.main', fontSize: 20 }} />
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography variant="body2" fontWeight={600}>
            {notification.studentName}
          </Typography>
        }
        secondary={
          <>
            <Typography variant="caption" component="span" display="block" sx={{ color: 'text.secondary' }}>
              {notification.flagReason}
            </Typography>
            <Typography variant="caption" component="span" sx={{ color: 'text.secondary', opacity: 0.7 }}>
              {formatTime(notification.timestamp)}
            </Typography>
          </>
        }
      />
    </ListItemButton>
  )
}
