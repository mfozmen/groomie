// Emit a self-contained <name>-groomed.html from a Groomie graph JSON by injecting it as
// window.__GROOMIE_GRAPH__ into the single-file visualizer build (dist/index.html).
//
//   node scripts/emit-html.mjs <graph.json> [out.html]
//
// The `emit` npm script runs `vite build --mode single` first, so dist/index.html is fresh.
// This keeps the export a companion-app feature — the prompt-only plugin still emits only JSON.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { argv } from 'node:process'

// Pure + testable. Escape `<` so a `</script>` inside any title/description can't break out of
// the injected tag (JS still parses < back to '<', so the graph is unchanged at runtime).
export function injectGraph(templateHtml, graph) {
  if (!templateHtml.includes('<head>')) {
    throw new Error('template has no <head> — run `npm run build:single` first')
  }
  const payload = JSON.stringify(graph).replace(/</g, '\\u003c')
  const tag = `<script>window.__GROOMIE_GRAPH__=${payload}</script>`
  return templateHtml.replace('<head>', `<head>${tag}`)
}

function main() {
  const [jsonPath, outArg] = argv.slice(2)
  if (!jsonPath) {
    console.error('usage: emit-html.mjs <graph.json> [out.html]')
    process.exit(1)
  }
  const graph = JSON.parse(readFileSync(jsonPath, 'utf8'))
  const tpl = readFileSync(fileURLToPath(new URL('../dist/index.html', import.meta.url)), 'utf8')
  const outPath = outArg ?? jsonPath.replace(/\.json$/, '.html')
  writeFileSync(outPath, injectGraph(tpl, graph))
  console.error(`wrote ${outPath}`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
