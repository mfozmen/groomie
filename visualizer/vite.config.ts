import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `vite build --mode single` inlines everything into one self-contained index.html —
// the template Groomie's HTML export injects `window.__GROOMIE_GRAPH__` into.
// Vitest/coverage config lives in vitest.config.ts (kept separate so this file's build
// types stay pinned to vite, not vitest's vendored vite).
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: mode === 'single' ? [viteSingleFile()] : [],
}))
