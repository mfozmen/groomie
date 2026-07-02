import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `vite build --mode single` inlines everything into one self-contained index.html —
// the template Groomie's future HTML export injects `window.__GROOMIE_GRAPH__` into.
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react(), ...(mode === 'single' ? [viteSingleFile()] : [])],
}))
