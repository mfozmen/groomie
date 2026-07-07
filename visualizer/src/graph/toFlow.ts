import { MarkerType, type Edge, type Node } from '@xyflow/react'
import type { EdgeKind, GroomedGraph, GroomNode, NodeKind } from '../types'
import type { Pt } from '../edges/geometry'
import { EDGE_AFFECTS, EDGE_AFFECTS_INK, EDGE_BLOCKS, EDGE_BLOCKS_INK } from '../colors'

export type FlowNode = Node<{ groom: GroomNode }>

// The data every `labeled` edge carries — the single source of truth LabeledEdge consumes
// (mirrors FlowNode's typed data). `labelColor` is the contrast-safe label ink, not the stroke.
// `points` are ELK's routed bend points (absolute flow coords), attached by layout() when the edge
// has to steer around intervening nodes; absent for a straight adjacent-layer edge.
export type EdgeData = {
  kind: EdgeKind
  labelColor: string
  labelT: number
  points?: Pt[]
}

// Label placement along the edge (0 = source, 1 = target): start near the target, back off a step
// per additional incoming edge so converging labels fan out instead of stacking, floored so a
// heavily-shared target's later labels don't march past the midpoint. LABEL_T_BASE is the default
// LabeledEdge also falls back to.
export const LABEL_T_BASE = 0.82
const LABEL_T_STEP = 0.16
const LABEL_T_MIN = 0.4
const EDGE_Z = 1000 // lift edges above node boxes so a route grazing a box stays readable

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

  const edges: Edge<EdgeData>[] = graph.edges
    .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
    .map((e, i) => {
      const affects = e.kind === 'affects'
      const stroke = affects ? EDGE_AFFECTS : EDGE_BLOCKS
      const order = perTarget.get(e.target) ?? 0
      perTarget.set(e.target, order + 1)
      const labelT = Math.max(LABEL_T_MIN, LABEL_T_BASE - order * LABEL_T_STEP)
      return {
        id: `e${i}`,
        source: e.source,
        target: e.target,
        // Custom edge (LabeledEdge) so the relationship label sits near the target, not the
        // midpoint where it would land on a node the edge skips over.
        type: 'labeled',
        markerEnd: { type: MarkerType.ArrowClosed, color: stroke },
        animated: affects,
        style: affects ? { stroke, strokeDasharray: '6 4' } : { stroke },
        // Name the relationship on the edge (the arrows alone were ambiguous), and lift edges
        // above the nodes so a route that grazes a box stays readable instead of hiding under it.
        label: e.kind,
        zIndex: EDGE_Z,
        data: { kind: e.kind, labelColor: affects ? EDGE_AFFECTS_INK : EDGE_BLOCKS_INK, labelT },
      }
    })

  return { nodes, edges }
}
