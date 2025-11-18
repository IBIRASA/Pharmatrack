import { describe, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// mock static asset
vi.mock('../assets/logo.png', () => ({ default: 'logo.png' }))
// mock i18n
vi.mock('../i18n', () => ({ useTranslation: () => ({ t: (k: string) => k }) }))
// mock ThemeContext
vi.mock('../context/ThemeContext', () => ({ useTheme: () => ({ theme: 'light', toggle: () => {} }) }))

import Footer from '../components/Footer'

describe('Footer unit', () => {
  test('renders ThemeToggle button', () => {
    render(<Footer />)
    const btn = screen.getByRole('button')
    expect(btn).toBeTruthy()
  })
})
