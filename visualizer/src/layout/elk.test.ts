import { describe, expect, it } from 'vitest'
import { layout, estimateItemHeight } from './elk'
import { toFlow } from '../graph/toFlow'
import type { EdgeData, FlowNode } from '../graph/toFlow'
import type { GroomedGraph } from '../types'

const item = (title: string): FlowNode =>
  ({ id: 'n', type: 'task', position: { x: 0, y: 0 }, data: { groom: { id: 'n', kind: 'task', title } } }) as FlowNode

describe('estimateItemHeight', () => {
  it('floors a short title at the node minimum', () => {
    expect(estimateItemHeight(item('a task'))).toBe(92)
  })

  it('grows a long, wrapping title well past the minimum (prevents overlap)', () => {
    const long = 'As a campaign editor, I want launch warnings to omit the "Locale 1:" prefix when localization is off.'
    const tall = estimateItemHeight(item(long))
    expect(tall).toBeGreaterThan(92)
    expect(tall).toBeGreaterThan(estimateItemHeight(item('short')))
  })

  it('tolerates a missing title', () => {
    const n = { id: 'n', type: 'task', position: { x: 0, y: 0 }, data: {} } as unknown as FlowNode
    expect(estimateItemHeight(n)).toBe(92)
  })
})

const graph: GroomedGraph = {
  nodes: [
    { id: 'E1', kind: 'epic', title: 'e' },
    { id: 'S1', kind: 'story', epicId: 'E1', title: 's' },
    { id: 'T1', kind: 'task', epicId: 'E1', title: 't' },
    { id: 'S9', kind: 'story', epicId: 'GONE', title: 'orphan' },
  ],
  edges: [{ source: 'T1', target: 'S1', kind: 'blocks' }],
}

describe('layout (ELK)', () => {
  it('positions every node and sizes the epic container', async () => {
    const { nodes } = toFlow(graph)
    const { nodes: laid } = await layout(nodes, toFlow(graph).edges)

    expect(laid).toHaveLength(nodes.length)
    for (const n of laid) {
      expect(Number.isFinite(n.position.x)).toBe(true)
      expect(Number.isFinite(n.position.y)).toBe(true)
    }

    const epic = laid.find((n) => n.id === 'E1')!
    expect(Number(epic.style?.width)).toBeGreaterThan(0)
    expect(Number(epic.style?.height)).toBeGreaterThan(0)

    // orphan (unresolved epicId) is emitted parentless and still gets a position
    const orphan = laid.find((n) => n.id === 'S9')!
    expect(orphan.parentId).toBeUndefined()
  })

  it('resolves without throwing on an empty graph', async () => {
    expect(await layout([], [])).toEqual({ nodes: [], edges: [] })
  })

  // The bug this routing fixes: an edge whose endpoints skip a layer (T1→T3 with T2 in the column
  // between them) must not be drawn straight through the middle node. ELK's orthogonal router
  // returns bend points that steer it around T2; layout attaches them to the edge as `data.points`.
  it('routes a layer-skipping edge around the node between its endpoints', async () => {
    const skip: GroomedGraph = {
      nodes: [
        { id: 'E1', kind: 'epic', title: 'e' },
        { id: 'T1', kind: 'task', epicId: 'E1', title: 't1' },
        { id: 'T2', kind: 'task', epicId: 'E1', title: 't2' },
        { id: 'T3', kind: 'task', epicId: 'E1', title: 't3' },
      ],
      edges: [
        { source: 'T1', target: 'T2', kind: 'blocks' },
        { source: 'T2', target: 'T3', kind: 'blocks' },
        { source: 'T1', target: 'T3', kind: 'blocks' }, // the skip edge
      ],
    }
    const flow = toFlow(skip)
    const { nodes: laid, edges } = await layout(flow.nodes, flow.edges)

    // T1→T3 is the third edge (id e2). It must carry routed bend points.
    const skipEdge = edges.find((e) => e.id === 'e2')!
    const pts = (skipEdge.data as EdgeData).points
    expect(pts).toBeDefined()
    expect(pts!.length).toBeGreaterThan(0)

    // The route must clear T2's box: some bend point sits outside T2's horizontal span (in absolute
    // flow coords). T2's absolute x-range is epicX + T2.x .. + T2.x + 240.
    const epic = laid.find((n) => n.id === 'E1')!
    const t2 = laid.find((n) => n.id === 'T2')!
    const t2Left = epic.position.x + t2.position.x
    const t2Right = t2Left + 240
    const clears = pts!.some((p) => p.x <= t2Left || p.x >= t2Right)
    expect(clears).toBe(true)
  })
})
