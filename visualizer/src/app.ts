import { Graphviz } from '@hpcc-js/wasm-graphviz'
import { buildDot, esc } from './dot'
import { detailsHtml } from './details'
import type { GroomedGraph, GroomNode } from './types'

// A single-file HTML export injects the graph here before the bundle runs.
declare global {
  // eslint-disable-next-line no-var
  var __GROOMIE_GRAPH__: GroomedGraph | undefined
}

// Renders a DOT program to SVG markup. Injectable so jsdom tests can stub it; the real one wraps
// the Graphviz WASM build (inlined in the bundle — no network, works over file://).
export type SvgRenderer = (dot: string) => string | Promise<string>

export async function graphvizRenderer(): Promise<SvgRenderer> {
  const gv = await Graphviz.load()
  return (dot) => gv.dot(dot)
}

// Graph view: Graphviz draws the diagram (layout + spline edge routing are entirely its job);
// clicking a node (or an epic container) shows its details in the side panel — Graphviz carries
// our node ids onto the SVG groups via the DOT `id` attributes, so the wiring is a lookup.
export async function showGraph(
  root: HTMLElement,
  graph: GroomedGraph,
  render: SvgRenderer,
  onLoadNew: () => void,
): Promise<void> {
  root.innerHTML = `<div class="app">
    <main class="canvas"></main>
    <aside class="panel">
      <div class="panel-head"><strong>${esc(graph.issueKey ?? 'Groomie')}</strong><button type="button" class="load-new">Load another</button></div>
      <div class="panel-body"><p class="muted">Click a node to see its details.</p></div>
    </aside>
  </div>`
  root.querySelector('.load-new')!.addEventListener('click', onLoadNew)

  const canvas = root.querySelector<HTMLElement>('.canvas')!
  canvas.innerHTML = await render(buildDot(graph))

  const byId = new Map(graph.nodes.map((n) => [n.id, n]))
  canvas.addEventListener('click', (ev) => {
    let node: GroomNode | undefined
    for (
      let el = (ev.target as Element | null)?.closest('[id]');
      el && !node;
      el = el.parentElement?.closest('[id]') ?? null
    ) {
      node = byId.get(el.getAttribute('id') ?? '')
    }
    if (node) root.querySelector('.panel-body')!.innerHTML = detailsHtml(node)
  })
}

// Loader view: drop or pick a `<ISSUE-KEY>-groomed.json`. Same validation the React loader had.
export function showLoader(
  root: HTMLElement,
  onLoad: (g: GroomedGraph) => void,
  error?: string | null,
): void {
  root.innerHTML = `<div class="loader">
    <div class="loader-card">
      <h1>Groomie — Breakdown Graph</h1>
      <p>Drop a <code>&lt;ISSUE-KEY&gt;-groomed.json</code> here, or pick a file.</p>
      <input type="file" accept="application/json,.json" />
      ${error ? `<p class="error">${esc(error)}</p>` : ''}
    </div>
  </div>`
  const loader = root.querySelector<HTMLElement>('.loader')!

  const handleFile = (file: File) => {
    file
      .text()
      .then((text) => {
        const g = JSON.parse(text) as GroomedGraph
        if (!Array.isArray(g.nodes) || !Array.isArray(g.edges)) {
          throw new TypeError('not a Groomie graph (missing nodes/edges arrays)')
        }
        onLoad(g)
      })
      .catch((e: unknown) => showLoader(root, onLoad, `Could not load: ${(e as Error).message}`))
  }

  loader.querySelector<HTMLInputElement>('input[type=file]')!.addEventListener('change', (ev) => {
    const f = (ev.target as HTMLInputElement).files?.[0]
    if (f) handleFile(f)
  })
  loader.addEventListener('dragover', (ev) => {
    ev.preventDefault()
    loader.classList.add('over')
  })
  loader.addEventListener('dragleave', () => loader.classList.remove('over'))
  loader.addEventListener('drop', (ev) => {
    ev.preventDefault()
    loader.classList.remove('over')
    const f = (ev as DragEvent).dataTransfer?.files[0]
    if (f) handleFile(f)
  })
}

// Entry: render the injected graph when present (the exported HTML), else the loader (dev/manual).
export async function boot(root: HTMLElement, render?: SvgRenderer): Promise<void> {
  const r = render ?? (await graphvizRenderer())
  const show = (g: GroomedGraph) => {
    showGraph(root, g, r, () => showLoader(root, show)).catch((e: unknown) =>
      showLoader(root, show, `Could not render this graph: ${(e as Error).message}`),
    )
  }
  const injected = globalThis.__GROOMIE_GRAPH__
  if (injected) show(injected)
  else showLoader(root, show)
}
