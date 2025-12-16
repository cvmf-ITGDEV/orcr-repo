'use client'

import { createTheme } from '@mui/material/styles'

const royalBlue = {
  50: '#e8eaf6',
  100: '#c5cae9',
  200: '#9fa8da',
  300: '#7986cb',
  400: '#5c6bc0',
  500: '#3f51b5',
  600: '#1e3a8a',
  700: '#1a237e',
  800: '#162066',
  900: '#0d1642',
}

const accentYellow = {
  50: '#fffde7',
  100: '#fff9c4',
  200: '#fff59d',
  300: '#fff176',
  400: '#ffee58',
  500: '#ffc107',
  600: '#ffb300',
  700: '#ffa000',
  800: '#ff8f00',
  900: '#ff6f00',
}

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: royalBlue[600],
      light: royalBlue[400],
      dark: royalBlue[800],
      contrastText: '#ffffff',
    },
    secondary: {
      main: accentYellow[500],
      light: accentYellow[300],
      dark: accentYellow[700],
      contrastText: '#000000',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, padding: '8px 20px' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { backgroundColor: royalBlue[900], color: '#ffffff' },
      },
    },
  },
})

export const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  DRAFT: 'default',
  SUBMITTED: 'info',
  PENDING_VETTING: 'warning',
  APPROVED: 'success',
  FOR_DISBURSEMENT: 'primary',
  ACTIVE: 'success',
  FULLY_PAID: 'success',
  DISAPPROVED: 'error',
  CANCELLED: 'default',
}

export const statusLabels: Record<string, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  PENDING_VETTING: 'Pending Vetting',
  APPROVED: 'Approved',
  FOR_DISBURSEMENT: 'For Disbursement',
  ACTIVE: 'Active Loan',
  FULLY_PAID: 'Fully Paid',
  DISAPPROVED: 'Disapproved',
  CANCELLED: 'Cancelled',
}
