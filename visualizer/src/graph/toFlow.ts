import { MarkerType, type Edge, type Node } from '@xyflow/react'
import type { GroomedGraph, GroomNode, NodeKind } from '../types'
import { EDGE_AFFECTS, EDGE_BLOCKS } from '../colors'

export type FlowNode = Node<{ groom: GroomNode }>

const KIND_ORDER: Record<NodeKind, number> = { epic: 0, story: 1, task: 1, bug: 1 }

// Map the groomed graph to React Flow nodes/edges. Epics become container (group) nodes;
// stories/tasks/bugs nest inside via parentId. ELK sets real positions/sizes afterwards.
// React Flow requires a parent to appear before its children, so epics are emitted first.
//
// Referential integrity: a node whose epicId doesn't resolve is left parentless (still laid
// out at the root rather than dropped), and edges whose endpoints aren't real nodes are
// filtered out — otherwise ELK rejects with "Referenced shape does not exist".
export function toFlow(graph: GroomedGraph): { nodes: FlowNode[]; edges: Edge[] } {
  const epicIds = new Set(graph.nodes.filter((n) => n.kind === 'epic').map((n) => n.id))
  const nodeIds = new Set(graph.nodes.map((n) => n.id))

  // ?? 1 keeps the epics-first invariant even for an unexpected kind (JSON is cast, not validated).
  const ordered = [...graph.nodes].sort(
    (a, b) => (KIND_ORDER[a.kind] ?? 1) - (KIND_ORDER[b.kind] ?? 1),
  )

  const nodes: FlowNode[] = ordered.map((n) => {
    if (n.kind === 'epic') {
      return { id: n.id, type: 'epic', position: { x: 0, y: 0 }, data: { groom: n } }
    }
    const base: FlowNode = { id: n.id, type: n.kind, position: { x: 0, y: 0 }, data: { groom: n } }
    return epicIds.has(n.epicId) ? { ...base, parentId: n.epicId, extent: 'parent' } : base
  })

  const edges: Edge[] = graph.edges
    .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
    .map((e, i) => {
      const affects = e.kind === 'affects'
      return {
        id: `e${i}`,
        source: e.source,
        target: e.target,
        markerEnd: { type: MarkerType.ArrowClosed, color: affects ? EDGE_AFFECTS : EDGE_BLOCKS },
        animated: affects,
        style: affects
          ? { stroke: EDGE_AFFECTS, strokeDasharray: '6 4' }
          : { stroke: EDGE_BLOCKS },
        data: { kind: e.kind },
      }
    })

  return { nodes, edges }
}
