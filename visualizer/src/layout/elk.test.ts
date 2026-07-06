import { describe, expect, it } from 'vitest'
import { layout, estimateItemHeight } from './elk'
import { toFlow } from '../graph/toFlow'
import type { FlowNode } from '../graph/toFlow'
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
    const { nodes, edges } = toFlow(graph)
    const laid = await layout(nodes, edges)

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
    expect(await layout([], [])).toEqual([])
  })
})
