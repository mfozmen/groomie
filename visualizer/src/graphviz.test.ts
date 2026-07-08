// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { graphvizRenderer } from './app'
import { buildDot } from './dot'
import type { GroomedGraph } from './types'

// End-to-end through the REAL Graphviz WASM build (node env — jsdom isn't needed to lay out a
// graph): the generated DOT must compile, and the SVG must carry our ids for click wiring.
describe('graphviz renderer (real WASM)', () => {
  it('renders the groomed graph to SVG with node ids and edge labels', async () => {
    const graph: GroomedGraph = {
      issueKey: 'PROJ-1',
      nodes: [
        { id: 'E1', kind: 'epic', title: 'The Feature (api → store)' },
        { id: 'T1', kind: 'task', epicId: 'E1', title: 'Do the thing', discipline: 'Backend' },
        { id: 'T2', kind: 'task', epicId: 'E1', title: 'Do the next thing', discipline: 'Backend' },
        { id: 'S1', kind: 'story', epicId: 'E1', title: 'As a user, I want it, so that value.' },
        { id: 'B1', kind: 'bug', epicId: 'E1', title: 'It breaks' },
      ],
      edges: [
        { source: 'T1', target: 'T2', kind: 'blocks' },
        { source: 'T1', target: 'S1', kind: 'blocks' },
        { source: 'T2', target: 'S1', kind: 'blocks' },
        { source: 'B1', target: 'S1', kind: 'affects' },
      ],
    }
    const render = await graphvizRenderer()
    const svg = await render(buildDot(graph))

    expect(svg).toContain('<svg')
    for (const id of ['E1', 'T1', 'T2', 'S1', 'B1']) expect(svg).toContain(`id="${id}"`)
    expect(svg).toContain('blocks')
    expect(svg).toContain('affects')
    // the epic title must appear (HTML-like label survived) — the arrow is HTML-escaped by Graphviz
    expect(svg).toContain('Epic: The Feature')
  })
})
