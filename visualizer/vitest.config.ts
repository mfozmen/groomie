import { defineConfig } from 'vitest/config'

// Kept separate from vite.config.ts: importing vitest/config there makes tsc check the build
// config against vitest's vendored vite types, which skew from the installed vite. This file is
// outside tsconfig's include, so it isn't type-checked in the build.
//
// No plugins here — the current tests are plain .ts/.mjs. A test that renders a .tsx component
// would need `@vitejs/plugin-react` added to a `plugins: [react()]` array.
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
      include: ['src/**/*.{ts,tsx}', 'scripts/**/*.mjs'],
      exclude: ['**/*.test.ts', 'src/main.tsx', 'src/vite-env.d.ts'],
    },
  },
})
