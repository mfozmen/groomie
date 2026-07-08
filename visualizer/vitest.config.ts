import { defineConfig } from 'vitest/config'

// Kept separate from vite.config.ts: importing vitest/config there makes tsc check the build
// config against vitest's vendored vite types, which skew from the installed vite. This file is
// outside tsconfig's include, so it isn't type-checked in the build.
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
      include: ['src/**/*.{ts,tsx}', 'scripts/**/*.mjs'],
      // main.ts is the bootstrap; types.ts is type-only (no runtime);
      // build-plugin-template.mjs is build glue (shells out to `vite build` + writes the two
      // shipped assets) — its output contract is covered by plugin-template.test.ts, not by
      // unit-testing execSync/fs. Nothing else is excluded — the dot builder, details panel,
      // app wiring and emit logic are all unit-tested.
      exclude: [
        '**/*.test.{ts,tsx}',
        'src/main.ts',
        'src/types.ts',
        'src/vite-env.d.ts',
        'scripts/build-plugin-template.mjs',
      ],
    },
  },
})
