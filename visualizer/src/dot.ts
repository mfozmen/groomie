import type { EpicGroomNode, GroomedGraph, GroomNode, NodeKind } from './types'

type ItemNode = Exclude<GroomNode, EpicGroomNode>

// Graphviz (dot) does the whole drawing job: layer assignment by blocker order, node placement,
// smooth spline edge routing. We only translate the groomed graph into DOT — no hand-rolled
// layout or edge math (that path was tried with ELK+React Flow and kept reading cramped/kinked).

// Jira-default palette, same as the mermaid diagram in the markdown output.
const KIND_STYLE: Record<Exclude<NodeKind, 'epic'>, { fill: string; border: string; ink: string }> = {
  task: { fill: '#dbeafe', border: '#3b82f6', ink: '#1e3a8a' },
  story: { fill: '#dcfce7', border: '#22c55e', ink: '#14532d' },
  bug: { fill: '#fee2e2', border: '#ef4444', ink: '#7f1d1d' },
}
const FALLBACK_STYLE = KIND_STYLE.task // unknown kinds render as plain boxes rather than crash

// Graphviz HTML-like labels parse a tag subset; escape everything that could break out.
export const esc = (s: string): string =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Escape a value used as a DOT quoted identifier ("<id>"): a stray " or \ in an id loaded from a
// hand-edited/untrusted groomed.json would otherwise close the quote and produce invalid DOT that
// Graphviz throws on. Node ids appear both here and in HTML `id=` attributes (via esc()); keep both
// escaped so the same value can't break one context while it's safe in the other.
export const dotId = (s: string): string => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')

// Wrap to ~n chars per line for readable node cards. Lines are left-aligned via <br align="left"/>
// (Graphviz centres <br/> lines by default, which reads as a slid-down title).
export const wrap = (s: string, n: number): string => {
  const words = String(s).split(' ')
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    if ((line + ' ' + w).trim().length > n) {
      lines.push(line.trim())
      line = w
    } else {
      line += ' ' + w
    }
  }
  if (line.trim()) lines.push(line.trim())
  return lines.map(esc).join('<br align="left"/>')
}

const badge = (n: ItemNode): string => {
  if (n.kind === 'task') return n.discipline ?? 'Task'
  if (n.kind === 'story') return 'Story'
  if (n.kind === 'bug') return 'Bug'
  return String((n as { kind: string }).kind) // unknown kind (JSON is cast, not validated)
}

const nodeLabel = (n: ItemNode): string => {
  const st = KIND_STYLE[n.kind] ?? FALLBACK_STYLE
  return `<
    <table border="0" cellborder="0" cellspacing="0" cellpadding="4">
      <tr><td align="left"><font color="${st.ink}" point-size="13"><b>${esc(n.id)}</b></font>  <font color="#475569" point-size="10">${esc(badge(n))}</font></td></tr>
      <tr><td align="left"><font color="${st.ink}" point-size="12">${wrap(n.title, 34)}</font></td></tr>
    </table>>`
}

// Build the DOT program for the groomed graph: one cluster per epic (title sized to fit — wide
// titles stay on one line up to ~80 chars), generous spacing, solid `blocks` edges.
export function buildDot(graph: GroomedGraph): string {
  const epics = graph.nodes.filter((n) => n.kind === 'epic')
  const items = graph.nodes.filter((n): n is ItemNode => n.kind !== 'epic')
  const ids = new Set(graph.nodes.map((n) => n.id))

  let dot = `digraph groomie {
  rankdir=TB;
  splines=spline;
  ranksep=1.1;
  nodesep=0.9;
  pad=0.4;
  bgcolor="white";
  fontname="Helvetica";
  node [shape=box, style="rounded,filled", fontname="Helvetica", margin="0.22,0.16", penwidth=1.4];
  edge [color="#64748b", fontname="Helvetica", fontsize=11, fontcolor="#475569", arrowsize=0.9, penwidth=1.3];
`

  const emitNode = (n: ItemNode, indent: string) => {
    const st = KIND_STYLE[n.kind] ?? FALLBACK_STYLE
    dot += `${indent}"${dotId(n.id)}" [id="${dotId(n.id)}", label=${nodeLabel(n)}, fillcolor="${st.fill}", color="${st.border}"];\n`
  }

  epics.forEach((epic, idx) => {
    dot += `  subgraph cluster_${idx} {
    id="${dotId(epic.id)}";
    label=<<table border="0" cellborder="0" cellpadding="10"><tr><td align="left"><font color="#6d28d9" point-size="15"><b>Epic: ${wrap(epic.title, 80)}</b></font></td></tr></table>>;
    labelloc=t; labeljust=l;
    style="rounded,filled"; fillcolor="#f5f3ff"; color="#8b5cf6"; penwidth=1.6;
    margin=30;
`
    for (const n of items.filter((i) => i.epicId === epic.id)) emitNode(n, '    ')
    dot += '  }\n'
  })
  // Orphans (unresolved epicId) still render at the root rather than being dropped.
  for (const n of items.filter((i) => !epics.some((e) => e.id === i.epicId))) emitNode(n, '  ')

  // Every explicit edge is drawn (no transitive reduction — this is a "who blocks whom" view).
  // Edges with endpoints that aren't real nodes are skipped so Graphviz doesn't invent blank nodes.
  for (const e of graph.edges) {
    if (!ids.has(e.source) || !ids.has(e.target)) continue
    // esc(e.kind), not a hard-coded "blocks": a pre-0.13 groomed.json may still carry an
    // `affects` edge, and it should still render (plain, labelled) rather than vanish.
    dot += `  "${dotId(e.source)}" -> "${dotId(e.target)}" [label=" ${esc(e.kind)} "];\n`
  }
  dot += '}\n'
  return dot
}
