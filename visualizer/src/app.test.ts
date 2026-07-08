import { beforeEach, describe, expect, it, vi } from 'vitest'
import { boot, showGraph, showLoader, type SvgRenderer } from './app'
import type { GroomedGraph } from './types'

const graph: GroomedGraph = {
  issueKey: 'PROJ-1',
  nodes: [
    { id: 'E1', kind: 'epic', title: 'The Feature', description: 'desc' },
    { id: 'T1', kind: 'task', epicId: 'E1', title: 'Do it', discipline: 'Backend' },
  ],
  edges: [],
}

// Stub renderer: what Graphviz emits, minimally — groups carrying our ids (cluster + node).
const fakeSvg = `<svg><g id="E1" class="cluster"><rect/></g><g id="T1" class="node"><text>T1</text></g><g class="edge"><path/></g></svg>`
const render: SvgRenderer = () => fakeSvg

let root: HTMLElement
beforeEach(() => {
  document.body.innerHTML = '<div id="root"></div>'
  root = document.getElementById('root')!
  globalThis.__GROOMIE_GRAPH__ = undefined
})

describe('showGraph', () => {
  it('renders the SVG and the panel header with the issue key', async () => {
    await showGraph(root, graph, render, () => {})
    expect(root.querySelector('.canvas svg')).toBeTruthy()
    expect(root.querySelector('.panel-head strong')!.textContent).toBe('PROJ-1')
    expect(root.querySelector('.panel-body')!.textContent).toContain('Click a node')
  })

  it('shows a node’s details when its SVG group is clicked', async () => {
    await showGraph(root, graph, render, () => {})
    const text = root.querySelector('#T1 text') as unknown as HTMLElement
    text.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(root.querySelector('.panel-body')!.innerHTML).toContain('T1 · Task')
    expect(root.querySelector('.panel-body')!.innerHTML).toContain('Backend')
  })

  it('resolves a click through a nested id to the enclosing epic cluster', async () => {
    await showGraph(root, graph, render, () => {})
    const rect = root.querySelector('#E1 rect') as unknown as HTMLElement
    rect.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(root.querySelector('.panel-body')!.innerHTML).toContain('E1 · Epic')
  })

  it('leaves the panel untouched when clicking empty canvas / an unknown group', async () => {
    await showGraph(root, graph, render, () => {})
    const edge = root.querySelector('g.edge path') as unknown as HTMLElement
    edge.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(root.querySelector('.panel-body')!.textContent).toContain('Click a node')
  })

  it('falls back to “Groomie” when the graph has no issue key', async () => {
    await showGraph(root, { ...graph, issueKey: undefined }, render, () => {})
    expect(root.querySelector('.panel-head strong')!.textContent).toBe('Groomie')
  })

  it('invokes onLoadNew from the header button', async () => {
    const onLoadNew = vi.fn()
    await showGraph(root, graph, render, onLoadNew)
    root.querySelector<HTMLButtonElement>('.load-new')!.click()
    expect(onLoadNew).toHaveBeenCalledOnce()
  })
})

const makeFile = (content: string) => new File([content], 'g.json', { type: 'application/json' })
const drop = (el: HTMLElement, file: File) => {
  const ev = new Event('drop', { bubbles: true, cancelable: true }) as DragEvent
  Object.defineProperty(ev, 'dataTransfer', { value: { files: [file] } })
  el.dispatchEvent(ev)
}
// The loader reads files via FileReader (polyfilled in jsdom), which resolves across several
// macrotasks — poll until a condition holds rather than guessing a single tick.
const waitFor = async (cond: () => boolean, ms = 1000) => {
  const start = Date.now()
  while (!cond()) {
    if (Date.now() - start > ms) throw new Error('waitFor timed out')
    await new Promise((r) => setTimeout(r, 5))
  }
}

describe('showLoader', () => {
  it('loads a valid dropped graph', async () => {
    const onLoad = vi.fn()
    showLoader(root, onLoad)
    drop(root.querySelector('.loader')!, makeFile(JSON.stringify(graph)))
    await waitFor(() => onLoad.mock.calls.length > 0)
    expect(onLoad).toHaveBeenCalledWith(expect.objectContaining({ issueKey: 'PROJ-1' }))
  })

  it('rejects JSON that is not a groomed graph and shows the error', async () => {
    const onLoad = vi.fn()
    showLoader(root, onLoad)
    drop(root.querySelector('.loader')!, makeFile('{"nope":true}'))
    await waitFor(() => !!root.querySelector('.error'))
    expect(onLoad).not.toHaveBeenCalled()
    expect(root.querySelector('.error')!.textContent).toContain('missing nodes/edges arrays')
  })

  it('shows a parse error for invalid JSON picked via the input', async () => {
    const onLoad = vi.fn()
    showLoader(root, onLoad)
    const input = root.querySelector<HTMLInputElement>('input[type=file]')!
    Object.defineProperty(input, 'files', { value: [makeFile('not json')] })
    input.dispatchEvent(new Event('change', { bubbles: true }))
    await waitFor(() => !!root.querySelector('.error'))
    expect(root.querySelector('.error')).toBeTruthy()
  })

  it('marks the dropzone while dragging over and clears it on leave', () => {
    showLoader(root, () => {})
    const loader = root.querySelector<HTMLElement>('.loader')!
    loader.dispatchEvent(new Event('dragover', { bubbles: true, cancelable: true }))
    expect(loader.classList.contains('over')).toBe(true)
    loader.dispatchEvent(new Event('dragleave', { bubbles: true }))
    expect(loader.classList.contains('over')).toBe(false)
  })
})

describe('boot', () => {
  it('renders the injected graph when __GROOMIE_GRAPH__ is present', async () => {
    globalThis.__GROOMIE_GRAPH__ = graph
    await boot(root, render)
    await waitFor(() => !!root.querySelector('.canvas svg'))
    expect(root.querySelector('.canvas svg')).toBeTruthy()
  })

  it('shows the loader when nothing is injected, then renders a loaded graph', async () => {
    await boot(root, render)
    expect(root.querySelector('.loader')).toBeTruthy()
    drop(root.querySelector('.loader')!, makeFile(JSON.stringify(graph)))
    await waitFor(() => !!root.querySelector('.canvas svg'))
    expect(root.querySelector('.canvas svg')).toBeTruthy()
  })

  it('falls back to the loader with an error when rendering throws', async () => {
    globalThis.__GROOMIE_GRAPH__ = graph
    const bad: SvgRenderer = () => {
      throw new Error('wasm exploded')
    }
    await boot(root, bad)
    await waitFor(() => !!root.querySelector('.error'))
    expect(root.querySelector('.error')!.textContent).toContain('wasm exploded')
  })

  it('"Load another" returns to the loader', async () => {
    globalThis.__GROOMIE_GRAPH__ = graph
    await boot(root, render)
    await waitFor(() => !!root.querySelector('.load-new'))
    root.querySelector<HTMLButtonElement>('.load-new')!.click()
    expect(root.querySelector('.loader')).toBeTruthy()
  })

  it('defaults to the real Graphviz renderer when none is injected', async () => {
    globalThis.__GROOMIE_GRAPH__ = graph
    await boot(root) // no renderer → loads the WASM build
    await waitFor(() => !!root.querySelector('.canvas [id="T1"]'), 25000)
    expect(root.querySelector('.canvas svg')).toBeTruthy()
    expect(root.querySelector('.canvas [id="T1"]')).toBeTruthy()
  }, 30000)
})
