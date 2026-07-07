import type { GroomEdge } from '../types'

// Transitive reduction of the `blocks` graph. A `blocks` edge u→v is redundant when v is already
// reachable from u through OTHER blocks edges (u→…→v via a longer path) — drawing it too just adds
// an arrow that has to detour around the nodes on that path (the "jagged skip edge"). We drop those
// redundant arrows from the rendered graph; the links still live in the JSON/markdown, and the
// remaining chain conveys the same ordering. `affects` edges (bug→story) are never reduced.
export function transitiveReduction(edges: GroomEdge[]): GroomEdge[] {
  // Work against a SHRINKING set of kept edges: a blocks edge u→v is dropped only when v is still
  // reachable from u through the OTHER edges we are still keeping. This never removes the last path
  // into a node — so even a cyclic (malformed) blocks graph can't leave a node with zero incoming
  // edges, which a check against the static original adjacency could (two edges each "implied" by a
  // path that only exists through the other). On a proper DAG this yields the usual unique result.
  const kept = edges.filter((e) => e.kind === 'blocks')

  // Can `target` be reached from `start` over the given adjacency? Iterative DFS with a seen-set so
  // a cycle still terminates.
  const reaches = (adj: Map<string, string[]>, start: string, target: string): boolean => {
    const seen = new Set<string>()
    const stack = [start]
    while (stack.length) {
      const n = stack.pop()!
      if (n === target) return true
      if (seen.has(n)) continue
      seen.add(n)
      for (const m of adj.get(n) ?? []) stack.push(m)
    }
    return false
  }

  for (const e of edges) {
    if (e.kind !== 'blocks') continue
    // Adjacency from the currently-kept blocks edges, excluding e itself.
    const adj = new Map<string, string[]>()
    for (const k of kept) {
      if (k === e) continue
      const out = adj.get(k.source) ?? []
      out.push(k.target)
      adj.set(k.source, out)
    }
    if (reaches(adj, e.source, e.target)) kept.splice(kept.indexOf(e), 1)
  }

  const keptSet = new Set(kept)
  return edges.filter((e) => e.kind !== 'blocks' || keptSet.has(e))
}
