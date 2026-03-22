'use client'

import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import HomeIcon from '@mui/icons-material/Home'
import GroupIcon from '@mui/icons-material/Group'
import SettingsIcon from '@mui/icons-material/Settings'
import SchoolIcon from '@mui/icons-material/School'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const isClass = pathname.startsWith('/class/')

  return (
    <Box
      component="nav"
      sx={{
        width: 64,
        minHeight: '100vh',
        bgcolor: '#EDE8E0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 2,
        gap: 1,
        borderRight: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <Tooltip title="ClassWatch" placement="right">
        <IconButton sx={{ mb: 2 }}>
          <SchoolIcon sx={{ color: 'primary.main', fontSize: 28 }} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Home" placement="right">
        <IconButton
          component={Link}
          href="/"
          sx={{
            color: isHome ? 'primary.main' : 'text.secondary',
            bgcolor: isHome ? 'rgba(107,79,58,0.1)' : 'transparent',
            '&:hover': { bgcolor: 'rgba(107,79,58,0.08)' },
          }}
        >
          <HomeIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Current Class" placement="right">
        <IconButton
          sx={{
            color: isClass ? 'primary.main' : 'text.secondary',
            bgcolor: isClass ? 'rgba(107,79,58,0.1)' : 'transparent',
            '&:hover': { bgcolor: 'rgba(107,79,58,0.08)' },
          }}
        >
          <GroupIcon />
        </IconButton>
      </Tooltip>

      <Box sx={{ flexGrow: 1 }} />

      <Tooltip title="Settings" placement="right">
        <IconButton sx={{ color: 'text.secondary' }}>
          <SettingsIcon />
        </IconButton>
      </Tooltip>
    </Box>
  )
}
