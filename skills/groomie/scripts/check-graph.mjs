#!/usr/bin/env node
// Graph-invariant check for a Groomie breakdown.
//   node check-graph.mjs <path/to/KEY-groomed.json> [path/to/KEY-groomed.md]
//   (e.g. KEY/KEY-groomed.json — the per-issue folder — or a legacy flat KEY-groomed.json)
//   node check-graph.mjs --self-test
// Exits non-zero and prints the first violation, else prints "OK".
// Used by the revise end-to-end test and as a self-verify the skill can run
// after a revise. No dependencies.

const KINDS = new Set(['epic', 'story', 'task', 'bug']);
const EDGE_KINDS = new Set(['blocks', 'affects']);

// Returns an array of violation strings ([] = valid). `md` is optional raw markdown;
// when given, blocking/affects links in the prose are cross-checked against the graph.
function checkGraph(graph, md) {
  const v = [];
  const nodes = Array.isArray(graph?.nodes) ? graph.nodes : null;
  const edges = Array.isArray(graph?.edges) ? graph.edges : null;
  if (!nodes || !edges) return ['graph must have array `nodes` and `edges`'];

  const byId = new Map();
  for (const n of nodes) {
    if (!n || typeof n.id !== 'string') { v.push(`node without a string id: ${JSON.stringify(n)}`); continue; }
    if (byId.has(n.id)) v.push(`duplicate node id: ${n.id}`);
    byId.set(n.id, n);
    if (!KINDS.has(n.kind)) v.push(`node ${n.id}: bad kind ${JSON.stringify(n.kind)}`);
  }
  for (const n of nodes) {
    if (n?.kind && n.kind !== 'epic') {
      const ep = byId.get(n.epicId);
      if (!ep) v.push(`node ${n.id}: epicId ${JSON.stringify(n.epicId)} resolves to no node`);
      else if (ep.kind !== 'epic') v.push(`node ${n.id}: epicId ${n.epicId} is not an epic`);
    }
  }

  const seenEdge = new Set();
  for (const e of edges) {
    const s = byId.get(e?.source), t = byId.get(e?.target);
    if (!s) v.push(`edge source ${JSON.stringify(e?.source)} resolves to no node`);
    if (!t) v.push(`edge target ${JSON.stringify(e?.target)} resolves to no node`);
    if (!EDGE_KINDS.has(e?.kind)) v.push(`edge ${e?.source}->${e?.target}: bad kind ${JSON.stringify(e?.kind)}`);
    const key = `${e?.source}|${e?.target}|${e?.kind}`;
    if (seenEdge.has(key)) v.push(`duplicate edge ${e?.source}->${e?.target} (${e?.kind})`);
    seenEdge.add(key);
    if (e?.kind === 'affects' && s && s.kind !== 'bug') v.push(`affects edge ${e.source}->${e.target}: source is ${s.kind}, must be a bug`);
    if (e?.kind === 'affects' && t && t.kind !== 'story') v.push(`affects edge ${e.source}->${e.target}: target is ${t.kind}, must be a story`);
    if (e?.kind === 'blocks' && s && s.kind !== 'task') v.push(`blocks edge ${e.source}->${e.target}: source is ${s.kind}, must be a task`);
    if (e?.kind === 'blocks' && t && t.kind !== 'story' && t.kind !== 'task') v.push(`blocks edge ${e.source}->${e.target}: target is ${t.kind}, must be a story or task`);
  }

  if (typeof md === 'string') v.push(...crossCheckMd(md, edges));
  return v;
}

// Parse the markdown's blocking/affects prose and compare it to the graph edges.
function crossCheckMd(md, edges) {
  const v = [];
  const mdBlocks = new Set();   // "src|tgt"
  const mdAffects = new Set();
  let cur = null;               // current node key from the last heading
  let mode = null;              // 'blocks' | 'blockedBy' after a **Blocks:** / **Is blocked by:** line
  for (const raw of md.split('\n')) {
    const line = raw.trim();
    const heading = line.match(/^#{1,6}\s+(.*)$/);            // ANY heading ends a link list...
    if (heading) {
      mode = null;
      const km = heading[1].match(/^([EST]\d+)\b/);           // ...and an item heading ("### S1 — …") sets cur;
      cur = km ? km[1] : null;                                // a section heading ("## Open questions") clears it
      continue;
    }
    if (line === '') { mode = null; continue; }               // a blank line also ends a link list
    if (/^\*\*Blocks:\*\*/i.test(line)) { mode = 'blocks'; continue; }
    if (/^\*\*Is blocked by:\*\*/i.test(line)) { mode = 'blockedBy'; continue; }
    if (/^\*\*/.test(line)) { mode = null; }                  // any other bold field ends a link list
    const bug = line.match(/^-\s+\*\*(B\d+)\b.*affects:\s*(S\d+)/i);   // "- **B1 — …** — … · affects: S1"
    if (bug) { mdAffects.add(`${bug[1]}|${bug[2]}`); continue; }
    const item = line.match(/^-\s+([ESTB]\d+)\b/);
    if (item && cur && mode) {
      const other = item[1];
      if (mode === 'blocks') mdBlocks.add(`${cur}|${other}`);
      else mdBlocks.add(`${other}|${cur}`);
    }
  }
  const gBlocks = new Set(edges.filter(e => e?.kind === 'blocks').map(e => `${e.source}|${e.target}`));
  const gAffects = new Set(edges.filter(e => e?.kind === 'affects').map(e => `${e.source}|${e.target}`));
  const show = k => k.replace('|', '->');
  for (const k of mdBlocks) if (!gBlocks.has(k)) v.push(`md blocks link ${show(k)} has no matching json edge`);
  for (const k of gBlocks) if (!mdBlocks.has(k)) v.push(`json blocks edge ${show(k)} not stated in the md`);
  for (const k of mdAffects) if (!gAffects.has(k)) v.push(`md affects link ${show(k)} has no matching json edge`);
  for (const k of gAffects) if (!mdAffects.has(k)) v.push(`json affects edge ${show(k)} not stated in the md`);
  return v;
}

function selfTest() {
  const good = {
    nodes: [
      { id: 'E1', kind: 'epic', title: 'X' },
      { id: 'S1', kind: 'story', epicId: 'E1', title: 'As a user…' },
      { id: 'T1', kind: 'task', epicId: 'E1', title: '[Backend] do it' },
      { id: 'B1', kind: 'bug', epicId: 'E1', title: 'broken' },
    ],
    edges: [
      { source: 'T1', target: 'S1', kind: 'blocks' },
      { source: 'B1', target: 'S1', kind: 'affects' },
    ],
  };
  const md = [
    '### S1 — As a user…', '**Is blocked by:**', '- T1 — do it', '',
    '### T1 — [Backend] do it', '**Blocks:**', '- S1 — As a user…', '',
    '- **B1 — broken** — steps · affects: S1',
  ].join('\n');
  const assert = (cond, msg) => { if (!cond) { console.error('SELF-TEST FAIL:', msg); process.exit(1); } };
  assert(checkGraph(good, md).length === 0, 'valid graph should pass');
  assert(checkGraph({ nodes: good.nodes, edges: [{ source: 'T1', target: 'S9', kind: 'blocks' }] })
    .some(x => /S9/.test(x)), 'dangling edge target caught');
  assert(checkGraph({ nodes: [{ id: 'S1', kind: 'story', epicId: 'E9', title: 't' }], edges: [] })
    .some(x => /epicId/.test(x)), 'dangling epicId caught');
  assert(checkGraph({ nodes: [...good.nodes, { id: 'T1', kind: 'task', epicId: 'E1', title: 'dup' }], edges: [] })
    .some(x => /duplicate node/.test(x)), 'duplicate id caught');
  assert(checkGraph({ nodes: good.nodes, edges: [...good.edges, { source: 'T1', target: 'B1', kind: 'blocks' }] }, md)
    .some(x => /not stated in the md/.test(x)), 'md/json blocks drift caught');
  assert(checkGraph({ nodes: good.nodes, edges: [{ source: 'S1', target: 'S1', kind: 'blocks' }] })
    .some(x => /source is story, must be a task/.test(x)), 'non-task blocks source caught');
  assert(checkGraph({ nodes: good.nodes, edges: [{ source: 'B1', target: 'T1', kind: 'affects' }] })
    .some(x => /affects edge.*must be a story/.test(x)), 'non-story affects target caught');
  assert(checkGraph({ nodes: good.nodes, edges: [{ source: 'T1', target: 'E1', kind: 'blocks' }] })
    .some(x => /blocks edge.*must be a story or task/.test(x)), 'blocks-to-epic target caught');
  assert(checkGraph(good, md + '\n\n## Open questions\n\n- S2 needs confirmation on the retention window.\n').length === 0,
    'a section-heading bullet starting with a key is not misread as a blocks link');
  console.log('OK (self-test)');
}

// --- CLI ---
const args = process.argv.slice(2);
if (args[0] === '--self-test') { selfTest(); }
else if (args.length === 0) { console.error('usage: check-graph.mjs <json> [md] | --self-test'); process.exit(2); }
else {
  const fs = await import('node:fs');
  let graph;
  try { graph = JSON.parse(fs.readFileSync(args[0], 'utf8')); }
  catch (e) { console.error(`cannot read/parse ${args[0]}: ${e.message}`); process.exit(2); }
  const md = args[1] ? fs.readFileSync(args[1], 'utf8') : undefined;
  const violations = checkGraph(graph, md);
  if (violations.length) { console.error('FAIL:', violations[0]); if (violations.length > 1) console.error(`(+${violations.length - 1} more)`); process.exit(1); }
  console.log('OK');
}
