import ELK, { type ElkNode } from 'elkjs/lib/elk.bundled.js'
import type { Edge } from '@xyflow/react'
import type { FlowNode } from '../graph/toFlow'
import type { Pt } from '../edges/geometry'

const elk = new ELK()

// Item nodes are a fixed 240px wide (index.css `.gnode`) but their HEIGHT grows with the title —
// a 6-line story wraps far past a one-line task. ELK only avoids overlaps for the sizes we give it,
// so we must estimate real height per node; feeding it a fixed height is exactly what let tall
// nodes overlap their neighbours. Width stays fixed to match the CSS.
const NODE_W = 240
const NODE_H = 92 // matches `.gnode { min-height }` — the floor for short titles

const EPIC_PAD = 24
// Top inset for the epic header. Epic titles routinely wrap to two lines ("Epic: <long title>"),
// so reserve two lines' worth of room or children tuck under the header (as they did before).
const EPIC_HEADER = 52

// Layout spacing. The canvas is effectively unbounded, so err toward air between nodes rather
// than a cramped graph — overlaps and edges hidden under boxes read as broken.
const SPACING_NODE = 72
const SPACING_LAYERS = 96
// Edge-routing channels. ELK's orthogonal router steers a layer-skipping edge (e.g. T1→T3 with
// T2 between them) into the gap beside the node column instead of straight through the box in the
// middle; these give that gap real width so the routed line clears the node.
const SPACING_EDGE_NODE = 28
const SPACING_EDGE_EDGE = 16

// Approx chars per line inside a `.gnode` (240px − 24px padding at ~12px font). Deliberately LOW
// so we over-count lines and over-estimate height — extra vertical air is harmless, an
// under-estimate reintroduces overlap.
const CHARS_PER_LINE = 30
const LINE_H = 17

// Estimated rendered height of an item node from its title length. Biased tall (see CHARS_PER_LINE)
// and floored at NODE_H. Exported for unit testing.
export function estimateItemHeight(node: FlowNode): number {
  const title = (node.data?.groom as { title?: string })?.title ?? ''
  const lines = Math.max(1, Math.ceil(title.length / CHARS_PER_LINE))
  // padding(20) + key/badge row(22) + title margin(4) + wrapped title + slack(10)
  const estimated = 20 + 22 + 4 + lines * LINE_H + 10
  return Math.max(NODE_H, estimated)
}

// Layered layout with container hierarchy: each epic is an ELK node whose children are its
// stories/tasks/bugs. ELK returns child coordinates relative to their parent — exactly what
// React Flow's `parentId` expects — and epic width/height sized to fit. We write both back.
export async function layout(
  nodes: FlowNode[],
  edges: Edge[],
): Promise<{ nodes: FlowNode[]; edges: Edge[] }> {
  const epics = nodes.filter((n) => n.type === 'epic')
  const children = nodes.filter((n) => n.type !== 'epic' && n.parentId)
  // Orphans (non-epic, no resolvable parent) sit at the root so their edges still reference
  // a shape ELK knows about — otherwise elk.layout() rejects on the dangling edge.
  const orphans = nodes.filter((n) => n.type !== 'epic' && !n.parentId)

  const padding = `[top=${EPIC_PAD + EPIC_HEADER},left=${EPIC_PAD},bottom=${EPIC_PAD},right=${EPIC_PAD}]`
  const sized = (c: FlowNode) => ({ id: c.id, width: NODE_W, height: estimateItemHeight(c) })

  const graph: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
      // Use ELK's orthogonal edge router and read its result back (below) instead of drawing a
      // naive bezier from handle to handle — that straight line runs through any node between the
      // edge's endpoints. The router keeps edges in reserved channels around the boxes.
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.layered.spacing.nodeNodeBetweenLayers': String(SPACING_LAYERS),
      'elk.spacing.nodeNode': String(SPACING_NODE),
      'elk.spacing.edgeNode': String(SPACING_EDGE_NODE),
      'elk.spacing.edgeEdge': String(SPACING_EDGE_EDGE),
      'elk.padding': padding,
    },
    children: [
      ...epics.map((epic) => ({
        id: epic.id,
        layoutOptions: { 'elk.padding': padding },
        children: children.filter((c) => c.parentId === epic.id).map(sized),
      })),
      ...orphans.map(sized),
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

  // Collect each edge's routed bend points, translated into absolute flow coordinates. ELK hoists
  // an edge to the least-common-ancestor of its endpoints, so an edge between two children of an
  // epic lives under that epic and its section coordinates are epic-relative — add the epic origin.
  // We keep only the interior bend points; the endpoints stay glued to React Flow's handles.
  const routed = new Map<string, Pt[]>()
  const readEdges = (container: ElkNode, ox: number, oy: number) => {
    for (const e of container.edges ?? []) {
      const bends = (e.sections?.[0]?.bendPoints ?? []).map((p) => ({ x: p.x + ox, y: p.y + oy }))
      routed.set(e.id, bends)
    }
  }
  readEdges(res, 0, 0)
  for (const epic of res.children ?? []) readEdges(epic, epic.x ?? 0, epic.y ?? 0)

  const outNodes = nodes.map((n) => {
    const p = laid.get(n.id)
    if (!p) return n
    const positioned: FlowNode = { ...n, position: { x: p.x, y: p.y } }
    if (n.type === 'epic' && p.width && p.height) {
      positioned.style = { ...n.style, width: p.width, height: p.height }
    }
    return positioned
  })

  const outEdges = edges.map((e) => {
    const pts = routed.get(e.id)
    if (!pts || pts.length === 0) return e
    return { ...e, data: { ...e.data, points: pts } }
  })

  return { nodes: outNodes, edges: outEdges }
}
