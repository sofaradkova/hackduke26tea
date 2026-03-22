'use client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

interface MetricCardProps {
  readonly label: string
  readonly value: string | number
  readonly suffix?: string
  readonly icon: React.ReactNode
  readonly color?: string
}

export default function MetricCard({ label, value, suffix = '', icon, color = 'primary.main' }: MetricCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Box sx={{ color }}>{icon}</Box>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {label}
          </Typography>
        </Box>
        <Typography variant="h2" sx={{ color, lineHeight: 1 }}>
          {value}
          {suffix && (
            <Typography component="span" variant="h3" sx={{ color: 'text.secondary', ml: 0.5 }}>
              {suffix}
            </Typography>
          )}
        </Typography>
      </CardContent>
    </Card>
  )
}
