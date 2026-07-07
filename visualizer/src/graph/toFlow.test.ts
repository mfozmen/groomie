import { describe, expect, it } from 'vitest'
import { toFlow } from './toFlow'
import { EDGE_AFFECTS_INK, EDGE_BLOCKS_INK } from '../colors'
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

  it('labels each edge with its relationship, lifts it above nodes, and uses the custom edge', () => {
    const affects = edges.find((e) => e.source === 'B1')!
    const blocks = edges.find((e) => e.source === 'T1')!
    expect(blocks.label).toBe('blocks')
    expect(affects.label).toBe('affects')
    expect(blocks.type).toBe('labeled')
    expect((blocks.data as { labelColor?: string }).labelColor).toBe(EDGE_BLOCKS_INK)
    expect((affects.data as { labelColor?: string }).labelColor).toBe(EDGE_AFFECTS_INK)
    // z-order above nodes so an edge grazing a box stays visible
    expect(blocks.zIndex).toBeGreaterThan(0)
    expect(affects.zIndex).toBeGreaterThan(0)
  })

  it('staggers label distance for edges sharing a target so labels do not stack', () => {
    // B1→S1 and T1→S1 both point at S1; the two get different labelT so the labels fan out.
    const affects = edges.find((e) => e.source === 'B1')! // 1st into S1
    const blocks = edges.find((e) => e.source === 'T1')! // 2nd into S1
    const ta = (affects.data as { labelT: number }).labelT
    const tb = (blocks.data as { labelT: number }).labelT
    expect(ta).not.toBe(tb)
    expect(ta).toBeGreaterThanOrEqual(0.4)
    expect(tb).toBeGreaterThanOrEqual(0.4)
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

  it('sorts an unexpected kind as a non-epic (the ?? 1 fallback)', () => {
    const { nodes } = toFlow({
      nodes: [
        { id: 'X', kind: 'chore', epicId: 'E1', title: 'x' },
        { id: 'Y', kind: 'spike', epicId: 'E1', title: 'y' },
        { id: 'E1', kind: 'epic', title: 'e' },
      ],
      edges: [],
    })
    expect(nodes[0].id).toBe('E1') // epic stays first; the unknown kinds sort after it
    expect(nodes.find((n) => n.id === 'X')?.type).toBe('chore')
  })
})

describe('toFlow — transitive reduction of blocks edges', () => {
  it('does not render a blocks edge implied by a longer path', () => {
    // T1→T2, T2→T3, T1→T3 — the direct T1→T3 is implied by T1→T2→T3, so it isn't drawn.
    const { edges } = toFlow({
      nodes: [
        { id: 'E1', kind: 'epic', title: 'e' },
        { id: 'T1', kind: 'task', epicId: 'E1', title: 't1' },
        { id: 'T2', kind: 'task', epicId: 'E1', title: 't2' },
        { id: 'T3', kind: 'task', epicId: 'E1', title: 't3' },
      ],
      edges: [
        { source: 'T1', target: 'T2', kind: 'blocks' },
        { source: 'T2', target: 'T3', kind: 'blocks' },
        { source: 'T1', target: 'T3', kind: 'blocks' },
      ],
    })
    expect(edges).toHaveLength(2)
    expect(edges.some((e) => e.source === 'T1' && e.target === 'T3')).toBe(false)
    expect(edges.some((e) => e.source === 'T1' && e.target === 'T2')).toBe(true)
    expect(edges.some((e) => e.source === 'T2' && e.target === 'T3')).toBe(true)
  })
})
