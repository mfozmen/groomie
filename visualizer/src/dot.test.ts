import { describe, expect, it } from 'vitest'
import { buildDot, dotId, esc, wrap } from './dot'
import type { GroomedGraph } from './types'

const graph: GroomedGraph = {
  issueKey: 'PROJ-1',
  nodes: [
    { id: 'E1', kind: 'epic', title: 'Email Localization Snapshot Migration (localization-api → MySQL)' },
    { id: 'T1', kind: 'task', epicId: 'E1', title: 'Add the column', discipline: 'Backend' },
    { id: 'S1', kind: 'story', epicId: 'E1', title: 'As a user, I want things, so that value.' },
    { id: 'B1', kind: 'bug', epicId: 'E1', title: 'It breaks' },
    { id: 'X9', kind: 'story', epicId: 'GONE', title: 'orphan story' },
  ],
  edges: [
    { source: 'T1', target: 'S1', kind: 'blocks' },
    { source: 'T1', target: 'MISSING', kind: 'blocks' },
  ],
}

describe('esc / wrap', () => {
  it('escapes HTML-label metacharacters', () => {
    expect(esc('a <b> & c')).toBe('a &lt;b&gt; &amp; c')
  })

  it('wraps long text into left-aligned lines', () => {
    const out = wrap('one two three four', 9)
    expect(out).toBe('one two<br align="left"/>three<br align="left"/>four')
  })

  it('keeps short text on one line', () => {
    expect(wrap('short', 30)).toBe('short')
  })

  it('escapes backslash and double-quote for DOT quoted identifiers', () => {
    expect(dotId('a"b\\c')).toBe('a\\"b\\\\c')
    expect(dotId('T1')).toBe('T1')
  })
})

describe('buildDot', () => {
  const dot = buildDot(graph)

  it('puts each epic in a cluster with a padded, left-aligned title', () => {
    expect(dot).toContain('subgraph cluster_0')
    expect(dot).toContain('Epic: Email Localization Snapshot Migration')
    expect(dot).toContain('labelloc=t; labeljust=l;')
  })

  it('emits every item node with its id carried onto the SVG (for click wiring)', () => {
    for (const id of ['T1', 'S1', 'B1']) expect(dot).toContain(`"${id}" [id="${id}"`)
  })

  it('shows the discipline badge on tasks and kind badges otherwise', () => {
    expect(dot).toContain('Backend')
    expect(dot).toContain('>Story</font>')
    expect(dot).toContain('>Bug</font>')
  })

  it('renders an orphan (unresolved epicId) at the root instead of dropping it', () => {
    const rootPart = dot.split('}\n').pop() ?? ''
    expect(dot).toContain('"X9" [id="X9"')
    expect(rootPart).not.toContain('subgraph')
  })

  it('draws blocks edges labelled with the relationship', () => {
    expect(dot).toContain('"T1" -> "S1" [label=" blocks "];')
  })

  it('still renders a legacy affects edge (pre-0.13 JSON) plainly rather than dropping it', () => {
    const legacy = buildDot({
      nodes: [
        { id: 'E1', kind: 'epic', title: 'e' },
        { id: 'B1', kind: 'bug', epicId: 'E1', title: 'b' },
        { id: 'S1', kind: 'story', epicId: 'E1', title: 's' },
      ],
      edges: [{ source: 'B1', target: 'S1', kind: 'affects' } as never],
    })
    expect(legacy).toContain('"B1" -> "S1" [label=" affects "];')
    expect(legacy).not.toContain('style=dashed')
  })

  it('skips edges whose endpoints are not real nodes (Graphviz would invent blank nodes)', () => {
    expect(dot).not.toContain('MISSING')
  })

  it('escapes a quote in an id everywhere it appears so it cannot break the DOT', () => {
    const d = buildDot({
      nodes: [
        { id: 'E1', kind: 'epic', title: 'e' },
        { id: 'T"1', kind: 'task', epicId: 'E1', title: 't' },
      ],
      edges: [{ source: 'T"1', target: 'T"1', kind: 'blocks' }],
    })
    expect(d).toContain('"T\\"1" [id="T\\"1"') // identifier + id= attribute both DOT-escaped
    expect(d).toContain('"T\\"1" -> "T\\"1"') // edge endpoints too
  })

  it('falls back to a plain box style for an unknown kind (cast, unvalidated JSON)', () => {
    const weird = buildDot({
      nodes: [
        { id: 'E1', kind: 'epic', title: 'e' },
        { id: 'Z1', kind: 'chore', epicId: 'E1', title: 'weird' } as never,
      ],
      edges: [],
    })
    expect(weird).toContain('"Z1" [id="Z1"')
    expect(weird).toContain('chore')
  })
})
