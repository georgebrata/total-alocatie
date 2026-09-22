import { createTheme } from '@mui/material/styles'

export function createAppTheme(mode: 'light' | 'dark') {
  const isDark = mode === 'dark'

  return createTheme({
  palette: {
    mode,
    primary: { main: isDark ? '#9db9ff' : '#304c89', dark: isDark ? '#c9d7ff' : '#20335e', contrastText: isDark ? '#111827' : '#ffffff' },
    secondary: { main: isDark ? '#63d5ca' : '#0b7a75', dark: isDark ? '#a5eee7' : '#075b57', contrastText: isDark ? '#092c2a' : '#ffffff' },
    background: { default: isDark ? '#10151f' : '#f8f7f3', paper: isDark ? '#1b2433' : '#ffffff' },
    text: { primary: isDark ? '#f5f7fb' : '#18202f', secondary: isDark ? '#d2d9e5' : '#5e6877' },
    divider: isDark ? '#46536a' : '#e6e4dc',
    success: { main: isDark ? '#73d7a7' : '#18794e' },
    warning: { main: isDark ? '#ffc777' : '#9a5d16' },
    info: { main: isDark ? '#8fc5ff' : '#1976d2' },
  },
  typography: {
    fontFamily: 'Georgia, "Times New Roman", serif',
    h1: { fontSize: 'clamp(2.4rem, 6vw, 5.2rem)', lineHeight: 0.98, letterSpacing: 0, fontWeight: 700 },
    h2: { fontSize: 'clamp(1.8rem, 4vw, 3.2rem)', lineHeight: 1.05, letterSpacing: 0, fontWeight: 700 },
    h3: { fontSize: '1.35rem', letterSpacing: 0, fontWeight: 700 },
    body1: { fontFamily: 'system-ui, sans-serif', lineHeight: 1.6 },
    body2: { fontFamily: 'system-ui, sans-serif', lineHeight: 1.5 },
    button: { fontFamily: 'system-ui, sans-serif', fontWeight: 700, letterSpacing: 0, textTransform: 'none' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 999, paddingInline: 20, minHeight: 44, boxShadow: 'none' } } },
    MuiCard: { styleOverrides: { root: { border: `1px solid ${isDark ? '#46536a' : '#e6e4dc'}`, boxShadow: isDark ? '0 16px 40px rgba(0, 0, 0, 0.28)' : '0 16px 40px rgba(24, 32, 47, 0.07)' } } },
    MuiTextField: { defaultProps: { fullWidth: true, size: 'small' } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 12, alignItems: 'flex-start' } } },
    MuiAccordion: { styleOverrides: { root: { margin: `0 auto`, border: `1px solid ${isDark ? '#46536a' : '#e6e4dc'}`, boxShadow: 'none', '&:before': { display: 'none' } } } },
  },
  })
}

export const theme = createAppTheme('light')
