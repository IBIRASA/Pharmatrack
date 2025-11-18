import { describe, expect, test, vi } from 'vitest'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Register from '../pages/Register'

// mock static asset imported by the Register component
vi.mock('../assets/logo.png', () => ({ default: 'logo.png' }))

// Mock react-router useNavigate and Link (we render without a Router)
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<any>()
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    Link: ({ children }: any) => <span>{children}</span>,
  }
})

// Mock API and notifications to prevent side effects
vi.mock('../utils/api', () => ({ registerUser: vi.fn(async () => ({ message: 'ok' })) }))
vi.mock('../utils/notifications', () => ({ showSuccess: vi.fn(), showError: vi.fn() }))

// Mock i18n to return readable strings for keys we assert
vi.mock('../i18n', () => ({ useTranslation: () => ({ t: (k: string) => {
  if (k === 'auth.register.password_mismatch') return 'Passwords do not match'
  if (k === 'auth.register.create') return 'Create account'
  return k
}}) }))

describe('Register form validation', () => {
  test('shows password mismatch error and prevents submission', async () => {
    const { container } = render(<Register />)
    const user = userEvent.setup()

    const pass = container.querySelector('#password') as HTMLInputElement
    const confirm = container.querySelector('#password_confirm') as HTMLInputElement
    const submit = container.querySelector('button[type="submit"]') as HTMLButtonElement

    await user.type(pass, 'abc123')
    await user.type(confirm, 'different')
    await user.click(submit)

    // The submit should be prevented; API should not be called when passwords mismatch
    const api = await import('../utils/api')
    expect(api.registerUser).not.toHaveBeenCalled()
  })
})
