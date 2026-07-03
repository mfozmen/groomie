import { describe, expect, it } from 'vitest'
import { layout } from './elk'
import { toFlow } from '../graph/toFlow'
import type { GroomedGraph } from '../types'

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
