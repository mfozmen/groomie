import { describe, expect, it } from 'vitest'
// @ts-expect-error — plain .mjs helper, no types
import { injectGraph } from './emit-html.mjs'

const TPL = '<!doctype html><html><head><title>t</title></head><body></body></html>'

// Pull the injected payload back out (our escaping turns `<` into the 6 chars <, so the
// only real </script> in the doc is our own closing tag).
function extractGraph(html: string) {
  const m = html.match(/window\.__GROOMIE_GRAPH__=(.*?)<\/script>/)
  if (!m) throw new Error('no payload')
  return JSON.parse(m[1].replace(/\\u003c/g, '<'))
}

describe('injectGraph', () => {
  it('sets the global to the graph, unchanged, before the app bundle', () => {
    const graph = { issueKey: 'X-1', nodes: [{ id: 'E1', kind: 'epic', title: 'e' }], edges: [] }
    const html = injectGraph(TPL, graph)
    expect(html.indexOf('window.__GROOMIE_GRAPH__')).toBeLessThan(html.indexOf('<title>'))
    expect(extractGraph(html)).toEqual(graph)
  })

  it('escapes </script> in text so it cannot break out of the tag', () => {
    const graph = { nodes: [{ id: 'S1', kind: 'story', epicId: 'E1', title: 'a </script> b' }], edges: [] }
    const html = injectGraph(TPL, graph)
    // No raw closing tag from the payload — only our own single </script>.
    expect(html.match(/<\/script>/g)).toHaveLength(1)
    expect(extractGraph(html).nodes[0].title).toBe('a </script> b')
  })

  it('does not let $ sequences in text corrupt the payload (replacement-string trap)', () => {
    const graph = { nodes: [{ id: 'S1', kind: 'story', epicId: 'E1', title: "a $' $& $` $$ b" }], edges: [] }
    const html = injectGraph(TPL, graph)
    expect(extractGraph(html).nodes[0].title).toBe("a $' $& $` $$ b")
  })

  it('throws when the template has no <head> (build not run)', () => {
    expect(() => injectGraph('<html></html>', { nodes: [], edges: [] })).toThrow(/build:single/)
  })
})
