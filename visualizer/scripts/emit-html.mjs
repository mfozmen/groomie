// Emit a self-contained <name>-groomed.html from a Groomie graph JSON by injecting it as
// window.__GROOMIE_GRAPH__ into the single-file visualizer build (dist/index.html).
//
//   node scripts/emit-html.mjs <graph.json> [out.html]
//
// The `emit` npm script runs `vite build --mode single` first, so dist/index.html is fresh.
// This keeps the export a companion-app feature — the prompt-only plugin still emits only JSON.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { argv, env, cwd } from 'node:process'
import { isAbsolute, resolve } from 'node:path'

// The global the visualizer reads on load. Must match App.tsx — this crosses the injected-HTML
// boundary, so a rename on one side would not be caught by any build/type check.
const GRAPH_GLOBAL = '__GROOMIE_GRAPH__'

// Pure + testable. Escape `<` so a `</script>` inside any title/description can't break out of
// the injected tag (JS still parses < back to '<', so the graph is unchanged at runtime).
export function injectGraph(templateHtml, graph) {
  if (!templateHtml.includes('<head>')) {
    throw new Error(
      'template has no <head> — dist/index.html is missing; `npm run emit` builds it first ' +
        '(or run `npm run build:single`)',
    )
  }
  const payload = JSON.stringify(graph).replace(/</g, '\\u003c')
  const tag = `<script>window.${GRAPH_GLOBAL}=${payload}</script>`
  // Function replacement: a plain replacement string would treat `$&`, `$\``, `$'`, `$$` in the
  // payload (e.g. a title containing `$'`) as special patterns and corrupt the injected JSON.
  return templateHtml.replace('<head>', () => `<head>${tag}`)
}

function main() {
  const [jsonArg, outArg] = argv.slice(2)
  if (!jsonArg) {
    console.error('usage: emit-html.mjs <graph.json> [out.html]')
    process.exit(1)
  }
  // `npm --prefix visualizer run emit` runs with cwd=visualizer/, but INIT_CWD is where the user
  // invoked npm — resolve their paths against that so the documented command works from anywhere.
  const base = env.INIT_CWD ?? cwd()
  const abs = (p) => (isAbsolute(p) ? p : resolve(base, p))
  const jsonPath = abs(jsonArg)
  const outPath = abs(outArg ?? jsonArg.replace(/\.json$/, '.html'))
  if (outPath === jsonPath) {
    console.error(`refusing to overwrite the input (${jsonArg}); pass an explicit output path`)
    process.exit(1)
  }
  const graph = JSON.parse(readFileSync(jsonPath, 'utf8'))
  const tpl = readFileSync(fileURLToPath(new URL('../dist/index.html', import.meta.url)), 'utf8')
  writeFileSync(outPath, injectGraph(tpl, graph))
  console.error(`wrote ${outPath}`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
