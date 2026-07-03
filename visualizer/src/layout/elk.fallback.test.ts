import { describe, expect, it, vi } from 'vitest'

// Mock elkjs to return the node ids WITHOUT x/y/width/height, exercising the defensive read-back
// fallbacks in layout() (coordinates default to 0; an epic with no size gets no style).
vi.mock('elkjs/lib/elk.bundled.js', () => ({
  default: class {
    async layout(graph: { children?: { id: string; children?: { id: string }[] }[] }) {
      return {
        id: 'root',
        children: (graph.children ?? []).map((c) => ({
          id: c.id,
          children: (c.children ?? []).map((ch) => ({ id: ch.id })),
        })),
      }
    }
  },
}))

import { layout } from './elk'
import { toFlow } from '../graph/toFlow'
import type { GroomedGraph } from '../types'

describe('layout read-back fallbacks (defensive: ELK returns no coords)', () => {
  it('defaults missing coordinates to 0 and skips epic sizing', async () => {
    const g: GroomedGraph = {
      nodes: [
        { id: 'E1', kind: 'epic', title: 'e' },
        { id: 'S1', kind: 'story', epicId: 'E1', title: 's' },
      ],
      edges: [],
    }
    const { nodes, edges } = toFlow(g)
    const laid = await layout(nodes, edges)

    expect(laid.find((n) => n.id === 'E1')?.position).toEqual({ x: 0, y: 0 })
    expect(laid.find((n) => n.id === 'S1')?.position).toEqual({ x: 0, y: 0 })
    // no width/height from ELK → the epic gets no size style
    expect(laid.find((n) => n.id === 'E1')?.style).toBeUndefined()
  })
})
