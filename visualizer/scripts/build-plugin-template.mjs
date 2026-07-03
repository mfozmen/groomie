// Build the single-file visualizer and split it at `<head>` into the two static assets the
// Groomie plugin ships. At groom time the skill concatenates:
//   visualizer-head.html  +  <script>globalThis.__GROOMIE_GRAPH__=…</script>  +  visualizer-tail.html
// producing a self-contained, offline <ISSUE-KEY>-groomed.html — no Node or build step needed on
// the end user's machine (just `sed` + `cat`).
//
// Regenerate whenever the visualizer changes:  npm run build:template
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const assets = join(root, '../skills/groomie/assets')

execSync('vite build --mode single', { cwd: root, stdio: 'inherit' })

const html = readFileSync(join(root, 'dist/index.html'), 'utf8')
const marker = '<head>'
const at = html.indexOf(marker)
if (at < 0) throw new Error('built template has no <head> to split on')
const cut = at + marker.length

mkdirSync(assets, { recursive: true })
writeFileSync(join(assets, 'visualizer-head.html'), html.slice(0, cut))
writeFileSync(join(assets, 'visualizer-tail.html'), html.slice(cut))
console.error(`wrote visualizer-head.html + visualizer-tail.html (${html.length} bytes total) to skills/groomie/assets/`)
