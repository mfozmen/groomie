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
  const payload = JSON.stringify(graph).replaceAll('<', '\\u003c')
  const tag = `<script>globalThis.${GRAPH_GLOBAL}=${payload}</script>`
  // Function replacement: a plain replacement string would treat `$&`, `$\``, `$'`, `$$` in the
  // payload (e.g. a title containing `$'`) as special patterns and corrupt the injected JSON.
  return templateHtml.replace('<head>', () => `<head>${tag}`)
}

// Pure + testable. `npm --prefix visualizer run emit` runs with cwd=visualizer/, but INIT_CWD is
// where the user invoked npm, so paths are resolved against `base` (INIT_CWD) — that's what makes
// the documented command work from anywhere. Refuses to overwrite the input (a non-.json input
// makes the `.json`→`.html` derivation a no-op, which would otherwise clobber the source).
export function resolvePaths(jsonArg, outArg, base) {
  const abs = (p) => (isAbsolute(p) ? p : resolve(base, p))
  const jsonPath = abs(jsonArg)
  const outPath = abs(outArg ?? jsonArg.replace(/\.json$/, '.html'))
  if (outPath === jsonPath) {
    throw new Error(`refusing to overwrite the input (${jsonArg}); pass an explicit output path`)
  }
  return { jsonPath, outPath }
}

export function readGraph(jsonPath) {
  let text
  try {
    text = readFileSync(jsonPath, 'utf8')
  } catch {
    throw new Error(`cannot read ${jsonPath} — is the path correct?`)
  }
  try {
    return JSON.parse(text)
  } catch (e) {
    throw new Error(`${jsonPath} is not valid JSON: ${e.message}`)
  }
}

/* v8 ignore start -- CLI entry glue: argv + file IO orchestration, exercised end-to-end by
   `npm run emit`. Its logic (injectGraph, resolvePaths, readGraph) is unit-tested above. */
function main() {
  const [jsonArg, outArg] = argv.slice(2)
  if (!jsonArg) {
    console.error('usage: emit-html.mjs <graph.json> [out.html]')
    process.exit(1)
  }
  try {
    const { jsonPath, outPath } = resolvePaths(jsonArg, outArg, env.INIT_CWD ?? cwd())
    const graph = readGraph(jsonPath)
    const tpl = readFileSync(fileURLToPath(new URL('../dist/index.html', import.meta.url)), 'utf8')
    writeFileSync(outPath, injectGraph(tpl, graph))
    console.error(`wrote ${outPath}`)
  } catch (e) {
    console.error(`error: ${e.message}`)
    process.exit(1)
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
/* v8 ignore stop */
