import { describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
// @ts-expect-error — plain .mjs helper, no types
import { injectGraph, HEAD_MARKER } from './emit-html.mjs'

// The plugin ships the single-file visualizer split at `<head>` into two assets. At groom time the
// (node-free) skill concatenates head + <script>globalThis.__GROOMIE_GRAPH__=…</script> + tail.
// This guards the SPLIT POINT: for the canonical compact payload, head+tag+tail must equal what
// injectGraph produces, so the shipped assets stay in lock-step with the emit. (At runtime the skill
// injects the on-disk pretty-printed .json, which is a different byte string but the same JS value.)
const assets = join(dirname(fileURLToPath(import.meta.url)), '../../skills/groomie/assets')
const head = readFileSync(join(assets, 'visualizer-head.html'), 'utf8')
const tail = readFileSync(join(assets, 'visualizer-tail.html'), 'utf8')

describe('shipped plugin template (head + tail split)', () => {
  it('head ends at the injection point and tail carries the app bundle', () => {
    expect(head.endsWith(HEAD_MARKER)).toBe(true)
    expect(tail).toContain('<script type="module"')
  })

  it('reconstructs to exactly what injectGraph produces', () => {
    const graph = { issueKey: 'X-1', nodes: [{ id: 'E1', kind: 'epic', title: 'a </script> b' }], edges: [] }
    const payload = JSON.stringify(graph).replaceAll('<', '\\u003c')
    const reconstructed = head + `<script>globalThis.__GROOMIE_GRAPH__=${payload}</script>` + tail
    expect(reconstructed).toBe(injectGraph(head + tail, graph))
  })

  // The node-free groom-time path (SKILL.md) escapes `<`→`<` with a raw `sed`, NOT injectGraph.
  // That shell command is the security-critical, actually-shipped escaping — guard it against drift by
  // running the real `sed` from the doc and asserting byte-equivalence with injectGraph's payload.
  it('the SKILL.md sed escapes identically to injectGraph (</script> breakout defense)', () => {
    const skill = readFileSync(join(assets, '../SKILL.md'), 'utf8')
    const sedScript = skill.match(/sed '([^']*)'/)?.[1]
    expect(sedScript, 'SKILL.md must contain a `sed \'…\'` escape command').toBeTruthy()

    const graph = { issueKey: 'X-1', nodes: [{ id: 'B1', kind: 'bug', title: `</script><img> & $' pwn` }], edges: [] }
    const json = JSON.stringify(graph) // compact; the escape is per-`<`, so whitespace is irrelevant
    const sedOut = execFileSync('sed', [sedScript as string], { input: json }).toString().replace(/\n$/, '')

    const html = injectGraph(head + tail, graph)
    const marker = 'globalThis.__GROOMIE_GRAPH__='
    const start = html.indexOf(marker) + marker.length
    const injected = html.slice(start, html.indexOf('</script>', start))

    expect(sedOut).toBe(injected)
    expect(sedOut).not.toContain('</script>') // the raw breakout sequence must be gone
  })
})
