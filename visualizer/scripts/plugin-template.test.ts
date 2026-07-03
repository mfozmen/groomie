import { describe, expect, it } from 'vitest'
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
})
