import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Kept separate from vite.config.ts: importing vitest/config there makes tsc check the build
// config against vitest's vendored vite types, which skew from the installed vite. This file is
// outside tsconfig's include, so it isn't type-checked in the build.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
      include: ['src/**/*.{ts,tsx}', 'scripts/**/*.mjs'],
      // main.tsx is the ReactDOM bootstrap; types.ts is type-only (no runtime). Nothing else is
      // excluded — the components, nodes, layout and graph logic are all unit-tested.
      exclude: ['**/*.test.{ts,tsx}', 'src/main.tsx', 'src/types.ts', 'src/vite-env.d.ts'],
    },
  },
})
