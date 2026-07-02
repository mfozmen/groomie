import { describe, expect, it } from 'vitest'
import { toFlow } from './toFlow'
import type { GroomedGraph } from '../types'

const graph: GroomedGraph = {
  nodes: [
    { id: 'S1', kind: 'story', epicId: 'E1', title: 'a story', links: [], acceptanceCriteria: [], testCases: [] },
    { id: 'E1', kind: 'epic', title: 'an epic', description: '', businessValue: '', design: null },
    { id: 'T1', kind: 'task', epicId: 'E1', title: 'a task' },
    { id: 'B1', kind: 'bug', epicId: 'E1', title: 'a bug', repro: '', expected: '', actual: '' },
  ],
  edges: [
    { source: 'B1', target: 'S1', kind: 'affects' },
    { source: 'T1', target: 'S1', kind: 'blocks' },
  ],
}

describe('toFlow', () => {
  const { nodes, edges } = toFlow(graph)

  it('emits epics before their children (React Flow parent-first requirement)', () => {
    expect(nodes[0].id).toBe('E1')
    expect(nodes.findIndex((n) => n.id === 'E1')).toBeLessThan(nodes.findIndex((n) => n.id === 'S1'))
  })

  it('makes the epic a group node and nests others via parentId', () => {
    const epic = nodes.find((n) => n.id === 'E1')!
    const story = nodes.find((n) => n.id === 'S1')!
    expect(epic.type).toBe('epic')
    expect(epic.parentId).toBeUndefined()
    expect(story.parentId).toBe('E1')
    expect(story.extent).toBe('parent')
  })

  it('styles affects edges dashed/red/animated and blocks edges plain', () => {
    const affects = edges.find((e) => e.source === 'B1')!
    const blocks = edges.find((e) => e.source === 'T1')!
    expect(affects.animated).toBe(true)
    expect(affects.style?.strokeDasharray).toBe('6 4')
    expect(blocks.animated).toBe(false)
    expect(blocks.style?.strokeDasharray).toBeUndefined()
  })
})

describe('toFlow referential integrity (ELK rejects unknown shape ids)', () => {
  const { nodes, edges } = toFlow({
    nodes: [
      { id: 'E1', kind: 'epic', title: 'e' },
      { id: 'S9', kind: 'story', epicId: 'GONE', title: 'orphan' },
    ],
    edges: [{ source: 'S9', target: 'MISSING', kind: 'blocks' }],
  })

  it('leaves a node with an unresolved epicId parentless (still laid out, not dropped)', () => {
    const orphan = nodes.find((n) => n.id === 'S9')!
    expect(orphan.parentId).toBeUndefined()
    expect(orphan.extent).toBeUndefined()
  })

  it('drops edges whose endpoints are not real nodes', () => {
    expect(edges).toHaveLength(0)
  })
})
