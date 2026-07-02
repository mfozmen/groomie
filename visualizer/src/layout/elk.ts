import ELK, { type ElkNode } from 'elkjs/lib/elk.bundled.js'
import type { Edge } from '@xyflow/react'
import type { FlowNode } from '../graph/toFlow'

const elk = new ELK()

const NODE_W = 240
const NODE_H = 92
const EPIC_PAD = 24
const EPIC_HEADER = 30

// Layered layout with container hierarchy: each epic is an ELK node whose children are its
// stories/tasks/bugs. ELK returns child coordinates relative to their parent — exactly what
// React Flow's `parentId` expects — and epic width/height sized to fit. We write both back.
export async function layout(nodes: FlowNode[], edges: Edge[]): Promise<FlowNode[]> {
  const epics = nodes.filter((n) => n.type === 'epic')
  const children = nodes.filter((n) => n.type !== 'epic' && n.parentId)
  // Orphans (non-epic, no resolvable parent) sit at the root so their edges still reference
  // a shape ELK knows about — otherwise elk.layout() rejects on the dangling edge.
  const orphans = nodes.filter((n) => n.type !== 'epic' && !n.parentId)

  const padding = `[top=${EPIC_PAD + EPIC_HEADER},left=${EPIC_PAD},bottom=${EPIC_PAD},right=${EPIC_PAD}]`

  const graph: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
      'elk.layered.spacing.nodeNodeBetweenLayers': '64',
      'elk.spacing.nodeNode': '44',
      'elk.padding': padding,
    },
    children: [
      ...epics.map((epic) => ({
        id: epic.id,
        layoutOptions: { 'elk.padding': padding },
        children: children
          .filter((c) => c.parentId === epic.id)
          .map((c) => ({ id: c.id, width: NODE_W, height: NODE_H })),
      })),
      ...orphans.map((o) => ({ id: o.id, width: NODE_W, height: NODE_H })),
    ],
    edges: edges.map((e) => ({ id: e.id, sources: [e.source], targets: [e.target] })),
  }

  const res = await elk.layout(graph)

  const laid = new Map<string, { x: number; y: number; width?: number; height?: number }>()
  for (const epic of res.children ?? []) {
    laid.set(epic.id, { x: epic.x ?? 0, y: epic.y ?? 0, width: epic.width, height: epic.height })
    for (const child of epic.children ?? []) {
      laid.set(child.id, { x: child.x ?? 0, y: child.y ?? 0 })
    }
  }

  return nodes.map((n) => {
    const p = laid.get(n.id)
    if (!p) return n
    const positioned: FlowNode = { ...n, position: { x: p.x, y: p.y } }
    if (n.type === 'epic' && p.width && p.height) {
      positioned.style = { ...n.style, width: p.width, height: p.height }
    }
    return positioned
  })
}
