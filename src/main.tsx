import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline, ThemeProvider } from '@mui/material'
import App from './App'
import { createAppTheme } from './theme'
import './styles.css'

function Root() {
  const [darkMode, setDarkMode] = useState(false)
  const activeTheme = createAppTheme(darkMode ? 'dark' : 'light')
  return (
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
      <App darkMode={darkMode} onToggleTheme={() => setDarkMode((current) => !current)} />
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')!).render(<StrictMode><Root /></StrictMode>)
