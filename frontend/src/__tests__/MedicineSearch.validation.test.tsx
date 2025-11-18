import { describe, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
// ensure any static assets or external modules don't break imports
vi.mock('../../assets/logo.png', () => ({ default: 'logo.png' }))
import MedicineSearch from '../pages/PatientDashboard/MedicineSearch'
import { MemoryRouter } from 'react-router-dom'

describe('MedicineSearch validation', () => {
  test('shows error when submitting empty search', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <MemoryRouter>
        <MedicineSearch />
      </MemoryRouter>
    )

    const submit = container.querySelector('button[type="submit"]') as HTMLButtonElement
    await user.click(submit)

    // The component sets an error string when search is empty
    const err = await screen.findByText(/please enter a medicine name/i)
    expect(err).toBeTruthy()
  })
})


// Minimal i18n mock
vi.mock('../i18n', () => ({ useTranslation: () => ({ t: (k: string) => k }) }))
// Mock api utilities that may be imported but not used in validation path
vi.mock('../utils/api', () => ({ getMedicines: vi.fn(), getCurrentUser: vi.fn() }))
// Mock AuthContext
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ user: null }) }))

describe('MedicineSearch validation', () => {
  test('empty query shows validation error', async () => {
    render(<MedicineSearch />)
    const user = userEvent.setup()

    const submit = screen.getByRole('button', { name: /medicine_search.search_button/i }) || document.querySelector('button[type="submit"]') as HTMLButtonElement

    await user.click(submit)

    expect(await screen.findByText(/Please enter a medicine name/i)).toBeInTheDocument()
  })
})
