'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import MenuOpenIcon from '@mui/icons-material/MenuOpen'
import MenuIcon from '@mui/icons-material/Menu'
import { useSession } from '@/context/session-context'

interface TopBarProps {
  readonly title: string
  readonly activeTab?: number
  readonly onTabChange?: (tab: number) => void
  readonly showTabs?: boolean
  readonly showPanelToggle?: boolean
}

export default function TopBar({ title, activeTab = 0, onTabChange, showTabs = false, showPanelToggle = false }: TopBarProps) {
  const { isPanelCollapsed, togglePanel } = useSession()

  return (
    <Box
      sx={{
        height: 56,
        px: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        bgcolor: 'background.default',
      }}
    >
      <Typography variant="h1" sx={{ whiteSpace: 'nowrap' }}>
        {title}
      </Typography>

      {showTabs && (
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => onTabChange?.(newValue)}
          sx={{ ml: 4 }}
        >
          <Tab label="Students" />
          <Tab label="Analytics" />
        </Tabs>
      )}

      <Box sx={{ flexGrow: 1 }} />

      {showPanelToggle && (
        <Tooltip title={isPanelCollapsed ? 'Show alerts' : 'Hide alerts'}>
          <IconButton onClick={togglePanel} sx={{ color: 'text.secondary' }}>
            {isPanelCollapsed ? <MenuIcon /> : <MenuOpenIcon />}
          </IconButton>
        </Tooltip>
      )}
    </Box>
  )
}
