import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    include: ['src/__tests__/**/*.test.tsx', 'src/__tests__/**/*.test.ts', 'src/**/__tests__/**/*.test.tsx', 'src/**/__tests__/**/*.test.ts'],
  },
})
