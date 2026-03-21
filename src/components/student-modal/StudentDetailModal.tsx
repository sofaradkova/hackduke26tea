'use client'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import LinearProgress from '@mui/material/LinearProgress'
import Chip from '@mui/material/Chip'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import CloseIcon from '@mui/icons-material/Close'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import AssignmentIcon from '@mui/icons-material/Assignment'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import type { Student } from '@/lib/types'
import { useSession } from '@/context/session-context'
import { useClassData } from '@/context/class-context'

interface StudentDetailModalProps {
  readonly student: Student | null
  readonly open: boolean
  readonly onClose: () => void
}

function formatDateTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function StudentDetailModal({ student, open, onClose }: StudentDetailModalProps) {
  const { dismissNotification } = useSession()
  const { resolveStudent } = useClassData()

  if (!student) return null

  const isFlagged = student.status === 'flagged'

  const handleResolve = () => {
    resolveStudent(student.id)
    dismissNotification(student.id)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="student-detail-title"
    >
      <DialogTitle
        id="student-detail-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
        }}
      >
        <Box>
          <Typography variant="h3" component="span">
            {student.name}
          </Typography>
          {isFlagged && (
            <Chip
              label="Needs Help"
              color="error"
              size="small"
              sx={{ ml: 1.5, fontWeight: 600 }}
            />
          )}
        </Box>
        <IconButton onClick={onClose} aria-label="Close modal" size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Large whiteboard thumbnail */}
        <Box
          component="img"
          src={student.thumbnailUrl}
          alt={`${student.name}'s whiteboard`}
          sx={{
            width: '100%',
            height: 300,
            objectFit: 'cover',
            borderRadius: 2,
            mb: 2,
            bgcolor: '#E8E4DC',
          }}
        />

        {/* AI flag alert */}
        {isFlagged && student.currentFlag && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={600}>
              {student.currentFlag.reason}
            </Typography>
          </Alert>
        )}

        {/* Metadata row */}
        <Box sx={{ display: 'flex', gap: 3, mb: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AssignmentIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {student.problemSetTitle}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTimeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              Last checked: {formatDateTime(student.lastCheckedAt)}
            </Typography>
          </Box>
        </Box>

        {/* Progress indicator */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" fontWeight={600}>
              Progress
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {student.progressPercent}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={student.progressPercent}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'rgba(0,0,0,0.06)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                bgcolor: student.progressPercent >= 90 ? '#4CAF50' : 'primary.main',
              },
            }}
          />
        </Box>

        {/* Confusion highlights */}
        {isFlagged && student.currentFlag && student.currentFlag.confusionHighlights.length > 0 && (
          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
              Areas of Confusion
            </Typography>
            <List dense disablePadding>
              {student.currentFlag.confusionHighlights.map((highlight, idx) => (
                <ListItem key={idx} disablePadding sx={{ pl: 1 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <HelpOutlineIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={highlight}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>

      {isFlagged && (
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            variant="contained"
            startIcon={<CheckCircleIcon />}
            onClick={handleResolve}
            sx={{
              bgcolor: '#4CAF50',
              '&:hover': { bgcolor: '#388E3C' },
              borderRadius: 2,
            }}
          >
            Mark as Resolved
          </Button>
          <Button variant="text" onClick={onClose} sx={{ color: 'text.secondary' }}>
            Close
          </Button>
        </DialogActions>
      )}
    </Dialog>
  )
}
