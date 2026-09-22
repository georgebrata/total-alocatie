import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../src/App'

describe('calculator shell', () => {
  it('renders the Romanian guest journey and explains the current legal coverage', () => {
    render(<App darkMode={false} onToggleTheme={() => undefined} />)
    expect(screen.getByRole('heading', { level: 1, name: /total alocație/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/când s-a născut copilul/i)).toBeInTheDocument()
    expect(screen.queryByText(/rezultatul tău/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^calculează$/i })).toBeDisabled()
  })

  it('prefills answers from URL parameters', () => {
    window.history.replaceState(null, '', '/?birthdate=2020-02-29&asOfMonth=2024-06&disability=yes&confirmed=true')
    render(<App darkMode={false} onToggleTheme={() => undefined} />)

    expect(screen.getByLabelText(/când s-a născut copilul/i)).toHaveValue('2020-02-29')
    expect(screen.getByLabelText(/până în ce lună/i)).toHaveValue('2024-06')
    expect(screen.getByLabelText('Da', { selector: 'input' })).toBeChecked()
    expect(screen.getByLabelText(/da, copilul locuia în românia/i)).toBeChecked()
    expect(screen.getByText(/rezultatul calculului/i)).toBeInTheDocument()

    window.history.replaceState(null, '', '/')
  })
})
