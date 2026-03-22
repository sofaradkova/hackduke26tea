'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import MenuOpenIcon from '@mui/icons-material/MenuOpen'
import MenuIcon from '@mui/icons-material/Menu'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PeopleIcon from '@mui/icons-material/People'
import ReportProblemIcon from '@mui/icons-material/ReportProblem'
import { useSession } from '@/context/session-context'
import type { AnalyticsSnapshot } from '@/lib/types'

interface AnalyticsHeaderProps {
  readonly title: string
  readonly analytics: AnalyticsSnapshot | null
  readonly showPanelToggle?: boolean
}

function StatItem({
  icon,
  label,
  value,
  suffix,
  color,
}: {
  readonly icon: React.ReactNode
  readonly label: string
  readonly value: string | number
  readonly suffix?: string
  readonly color: string
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: `${color}14`,
          color,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem', lineHeight: 1.3 }}>
          {label}
        </Typography>
        <Typography variant="h6" sx={{ color, fontWeight: 700, lineHeight: 1.2, fontSize: '1.15rem' }}>
          {value}
          {suffix && (
            <Typography component="span" sx={{ color: 'text.secondary', fontSize: '0.9rem', ml: 0.5 }}>
              {suffix}
            </Typography>
          )}
        </Typography>
      </Box>
    </Box>
  )
}

export default function AnalyticsHeader({ title, analytics, showPanelToggle = false }: AnalyticsHeaderProps) {
  const { isPanelCollapsed, togglePanel } = useSession()
  const strugglingColor = analytics && analytics.strugglingPercent > 30 ? '#C62828' : '#ED6C02'

  return (
    <Box
      sx={{
        bgcolor: '#FFFFFF',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        borderRadius: '0 0 16px 16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        px: 3.5,
        pt: 2.5,
        pb: 2.5,
      }}
    >
      {/* Top row: class name + panel toggle */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: analytics ? 2 : 0 }}>
        <Typography variant="h1" sx={{ whiteSpace: 'nowrap' }}>
          {title}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        {showPanelToggle && (
          <Tooltip title={isPanelCollapsed ? 'Show alerts' : 'Hide alerts'}>
            <IconButton onClick={togglePanel} sx={{ color: 'text.secondary' }}>
              {isPanelCollapsed ? <MenuIcon /> : <MenuOpenIcon />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Stats row */}
      {analytics && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: { xs: 2, md: 4 },
          }}
        >
          <StatItem
            icon={<WarningAmberIcon fontSize="small" />}
            label="Struggling"
            value={`${analytics.strugglingPercent}%`}
            color={strugglingColor}
          />

          <Box sx={{ width: '1px', height: 40, bgcolor: 'rgba(0,0,0,0.08)', display: { xs: 'none', sm: 'block' } }} />

          <StatItem
            icon={<CheckCircleIcon fontSize="small" />}
            label="Completed"
            value={`${analytics.completionPercent}%`}
            color="#4CAF50"
          />

          <Box sx={{ width: '1px', height: 40, bgcolor: 'rgba(0,0,0,0.08)', display: { xs: 'none', sm: 'block' } }} />

          <StatItem
            icon={<PeopleIcon fontSize="small" />}
            label="Flagged"
            value={analytics.totalFlagged}
            suffix={`/ ${analytics.totalStudents}`}
            color="#1976D2"
          />

          <Box sx={{ width: '1px', height: 40, bgcolor: 'rgba(0,0,0,0.08)', display: { xs: 'none', sm: 'block' } }} />

          {/* Common issue */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
            <ReportProblemIcon sx={{ color: 'error.main', fontSize: 20, flexShrink: 0 }} />
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                minWidth: 0,
                fontSize: '0.85rem',
              }}
            >
              {analytics.mostCommonProblem}
            </Typography>
            <Chip
              label={`${analytics.totalFlagged} affected`}
              size="small"
              sx={{
                bgcolor: 'error.light',
                color: 'error.dark',
                fontWeight: 600,
                fontSize: '0.7rem',
                height: 24,
                flexShrink: 0,
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  )
}
