'use client'

import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import type { Student } from '@/lib/types'

interface StudentCardProps {
  readonly student: Student
  readonly onClick: (studentId: string) => void
}

export default function StudentCard({ student, onClick }: StudentCardProps) {
  const isFlagged = student.status === 'flagged'
  const isLoading = student.status === 'loading'

  if (isLoading) {
    return (
      <Card>
        <Skeleton variant="rectangular" height={140} />
        <CardContent>
          <Skeleton width="60%" />
          <Skeleton width="40%" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      sx={{
        bgcolor: isFlagged ? 'error.light' : 'background.paper',
        border: isFlagged ? '2px solid' : '1px solid',
        borderColor: isFlagged ? 'error.main' : 'rgba(0,0,0,0.06)',
      }}
    >
      <CardActionArea
        onClick={() => onClick(student.id)}
        aria-label={`${student.name} — ${isFlagged ? 'needs help' : 'on track'}`}
      >
        <CardMedia
          component="img"
          height={140}
          image={student.thumbnailUrl}
          alt={`${student.name}'s whiteboard`}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
            {isFlagged ? (
              <ErrorOutlineIcon sx={{ color: 'error.main', fontSize: 18 }} />
            ) : (
              <CheckCircleOutlineIcon sx={{ color: '#4CAF50', fontSize: 18 }} />
            )}
            <Typography variant="body2" fontWeight={600} noWrap>
              {student.name}
            </Typography>
          </Box>
          {isFlagged && student.currentFlag && (
            <Typography
              variant="caption"
              sx={{ color: 'error.dark', fontStyle: 'italic', display: 'block', mt: 0.25 }}
              noWrap
            >
              {student.currentFlag.reason}
            </Typography>
          )}
          {!isFlagged && (
            <Typography variant="caption" color="text.secondary">
              {student.progressPercent}% complete
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
