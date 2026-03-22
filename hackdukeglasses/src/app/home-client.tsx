'use client'

import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import type { ClassData } from '@/lib/types'
import AppShell from '@/components/layout/AppShell'
import TopBar from '@/components/layout/TopBar'
import ClassListGrid from '@/components/class-list/ClassListGrid'
import { APP_NAME } from '@/lib/constants'

interface HomeClientProps {
  readonly classes: readonly ClassData[]
}

export default function HomeClient({ classes }: HomeClientProps) {
  return (
    <AppShell topBar={<TopBar title={APP_NAME} />}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h1" sx={{ fontSize: '2rem', mb: 0.5 }}>
          Your Classes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Select a class to start monitoring
        </Typography>
      </Box>
      <ClassListGrid classes={classes} />
    </AppShell>
  )
}
