import { describe, expect, it } from 'vitest'
import { transitiveReduction } from './reduce'
import type { GroomEdge } from '../types'

const e = (source: string, target: string, kind: GroomEdge['kind'] = 'blocks'): GroomEdge => ({
  source,
  target,
  kind,
})

describe('transitiveReduction', () => {
  it('drops a blocks edge implied by a longer path (the transitive triangle)', () => {
    // T1→T2, T2→T3, T1→T3 — the direct T1→T3 is implied by T1→T2→T3.
    const out = transitiveReduction([e('T1', 'T2'), e('T2', 'T3'), e('T1', 'T3')])
    expect(out).toEqual([e('T1', 'T2'), e('T2', 'T3')])
  })

  it('keeps edges that are not transitively implied', () => {
    // A diamond with no redundant edge: A→B, A→C, B→D, C→D — none is implied by another path.
    const edges = [e('A', 'B'), e('A', 'C'), e('B', 'D'), e('C', 'D')]
    expect(transitiveReduction(edges)).toEqual(edges)
  })

  it('never reduces affects (bug) edges, even alongside a redundant blocks edge', () => {
    const out = transitiveReduction([
      e('T1', 'T2'),
      e('T2', 'S1'),
      e('T1', 'S1'), // redundant blocks → dropped
      e('B1', 'S1', 'affects'), // affects → always kept
    ])
    expect(out).toEqual([e('T1', 'T2'), e('T2', 'S1'), e('B1', 'S1', 'affects')])
  })

  it('returns an empty list unchanged', () => {
    expect(transitiveReduction([])).toEqual([])
  })

  it('terminates on a cyclic (malformed) graph without orphaning a node', () => {
    // A→B, B→A, A→C, B→C. Reducing against a SHRINKING graph keeps a path into C: A→C is dropped
    // (C still reachable via A→B→C), but B→C is then kept (C no longer reachable from B without it).
    // The buggy static-graph reduction dropped BOTH, leaving C with zero incoming edges.
    const out = transitiveReduction([e('A', 'B'), e('B', 'A'), e('A', 'C'), e('B', 'C')])
    expect(out).toEqual([e('A', 'B'), e('B', 'A'), e('B', 'C')])
    // invariant: C still has at least one incoming edge (not orphaned)
    expect(out.some((x) => x.target === 'C')).toBe(true)
  })
})
