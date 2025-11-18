import '@testing-library/jest-dom'
// Setup file for Vitest + Testing Library
import '@testing-library/jest-dom'

// Optionally polyfill or mock global APIs used by components
// e.g., window.matchMedia or geolocation can be mocked per-test as needed
import '@testing-library/jest-dom'

// Provide a minimal mock for the global fetch during tests if needed
if (!(global as any).fetch) {
  (global as any).fetch = () => Promise.resolve({ ok: true, json: async () => ({}) })
}
