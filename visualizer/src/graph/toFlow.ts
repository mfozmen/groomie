import { MarkerType, type Edge, type Node } from '@xyflow/react'
import type { GroomedGraph, GroomNode } from '../types'

export type FlowNode = Node<{ groom: GroomNode }>

const KIND_ORDER: Record<string, number> = { epic: 0, story: 1, task: 1, bug: 1 }

// Map the groomed graph to React Flow nodes/edges. Epics become container (group) nodes;
// stories/tasks/bugs nest inside via parentId. ELK sets real positions/sizes afterwards.
// React Flow requires a parent to appear before its children, so epics are emitted first.
export function toFlow(graph: GroomedGraph): { nodes: FlowNode[]; edges: Edge[] } {
  const ordered = [...graph.nodes].sort(
    (a, b) => (KIND_ORDER[a.kind] ?? 1) - (KIND_ORDER[b.kind] ?? 1),
  )

  const nodes: FlowNode[] = ordered.map((n) => {
    if (n.kind === 'epic') {
      return { id: n.id, type: 'epic', position: { x: 0, y: 0 }, data: { groom: n } }
    }
    return {
      id: n.id,
      type: n.kind,
      position: { x: 0, y: 0 },
      data: { groom: n },
      parentId: n.epicId,
      extent: 'parent',
    }
  })

  const edges: Edge[] = graph.edges.map((e, i) => {
    const affects = e.kind === 'affects'
    return {
      id: `e${i}`,
      source: e.source,
      target: e.target,
      markerEnd: { type: MarkerType.ArrowClosed, color: affects ? '#ef4444' : '#64748b' },
      animated: affects,
      style: affects
        ? { stroke: '#ef4444', strokeDasharray: '6 4' }
        : { stroke: '#64748b' },
      data: { kind: e.kind },
    }
  })

  return { nodes, edges }
}
