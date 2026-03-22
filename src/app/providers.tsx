'use client'

import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import '@fontsource/inter/400.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import { theme } from '@/lib/theme'
import { SessionProvider } from '@/context/session-context'
import { ClassProvider } from '@/context/class-context'
import './globals.css'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SessionProvider>
        <ClassProvider>
          {children}
        </ClassProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
