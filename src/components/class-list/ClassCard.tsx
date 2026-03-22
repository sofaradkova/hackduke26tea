'use client'

import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import GroupIcon from '@mui/icons-material/Group'
import Link from 'next/link'
import type { ClassData } from '@/lib/types'
import { getSubjectColor } from '@/lib/constants'

interface ClassCardProps {
  readonly classData: ClassData
}

export default function ClassCard({ classData }: ClassCardProps) {
  const accentColor = getSubjectColor(classData.subject)

  return (
    <Card
      sx={{
        borderTop: `4px solid ${accentColor}`,
        bgcolor: 'background.paper',
      }}
    >
      <CardActionArea component={Link} href={`/class/${classData.id}`}>
        <CardContent sx={{ p: 3 }}>
          <Chip
            label={classData.subject}
            size="small"
            sx={{
              bgcolor: accentColor,
              color: '#2D2D2D',
              fontWeight: 600,
              mb: 1.5,
            }}
          />
          <Typography variant="h3" gutterBottom>
            {classData.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
            <GroupIcon sx={{ fontSize: 18 }} />
            <Typography variant="body2">
              {classData.studentCount} students
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
