'use client'

import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: {
      main: '#6B4F3A',
      light: '#8B7355',
      dark: '#4A3628',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#8B6914',
      light: '#B8932E',
      dark: '#614A0E',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#C62828',
      light: '#FFEBEE',
      dark: '#8E0000',
    },
    background: {
      default: '#FAF9F6',
      paper: '#F5F3EE',
    },
    text: {
      primary: '#2D2D2D',
      secondary: '#5F5F5F',
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '1.75rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    body1: {
      fontSize: '0.95rem',
    },
    caption: {
      fontSize: '0.75rem',
      color: '#5F5F5F',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          transition: 'box-shadow 200ms ease, transform 200ms ease',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
})
