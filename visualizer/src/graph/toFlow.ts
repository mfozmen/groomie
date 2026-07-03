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

  // Stagger the label distance for edges sharing a target: the 1st edge into a node labels near
  // the target, each subsequent one a step earlier, so converging labels (e.g. a task that blocks
  // a story AND a bug that affects it) fan out along the approach instead of stacking on the node.
  const perTarget = new Map<string, number>()

  const edges: Edge[] = graph.edges
    .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
    .map((e, i) => {
      const affects = e.kind === 'affects'
      const color = affects ? EDGE_AFFECTS : EDGE_BLOCKS
      const order = perTarget.get(e.target) ?? 0
      perTarget.set(e.target, order + 1)
      // near the target (0.82), backing off 0.16 per additional incoming edge, floored at 0.4
      const labelT = Math.max(0.4, 0.82 - order * 0.16)
      return {
        id: `e${i}`,
        source: e.source,
        target: e.target,
        // Custom edge (LabeledEdge) so the relationship label sits near the target, not the
        // midpoint where it would land on a node the edge skips over.
        type: 'labeled',
        markerEnd: { type: MarkerType.ArrowClosed, color },
        animated: affects,
        style: affects ? { stroke: color, strokeDasharray: '6 4' } : { stroke: color },
        // Name the relationship on the edge (the arrows alone were ambiguous), and lift edges
        // above the nodes so a route that grazes a box stays readable instead of hiding under it.
        label: e.kind,
        zIndex: 1000,
        data: { kind: e.kind, color, labelT },
      }
    })

  return { nodes, edges }
}
