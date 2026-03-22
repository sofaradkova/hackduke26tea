'use client'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import ReportProblemIcon from '@mui/icons-material/ReportProblem'
import type { AnalyticsSnapshot } from '@/lib/types'
import MetricCard from './MetricCard'

interface AnalyticsViewProps {
  readonly analytics: AnalyticsSnapshot
}

export default function AnalyticsView({ analytics }: AnalyticsViewProps) {
  return (
    <Box>
      <Typography variant="h3" sx={{ mb: 3 }}>
        Class Analytics
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <MetricCard
            label="Students Struggling"
            value={analytics.strugglingPercent}
            suffix="%"
            icon={<WarningAmberIcon />}
            color={analytics.strugglingPercent > 30 ? '#C62828' : '#ED6C02'}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <MetricCard
            label="Completion Rate"
            value={analytics.completionPercent}
            suffix="%"
            icon={<CheckCircleIcon />}
            color="#4CAF50"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <MetricCard
            label="Total Flagged"
            value={analytics.totalFlagged}
            suffix={` / ${analytics.totalStudents}`}
            icon={<TrendingUpIcon />}
            color="primary.main"
          />
        </Grid>

        {/* Most common problem — wider card */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ReportProblemIcon sx={{ color: 'error.main' }} />
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  Most Common Issue
                </Typography>
                <Chip
                  label={`${analytics.totalFlagged} students affected`}
                  size="small"
                  sx={{ bgcolor: 'error.light', color: 'error.dark', fontWeight: 600 }}
                />
              </Box>
              <Typography variant="h3" sx={{ fontSize: '1.1rem' }}>
                {analytics.mostCommonProblem}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
