import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const script = path.join(here, "emit-html.mjs")

function run(args) {
  return spawnSync(process.execPath, [script, ...args], { encoding: "utf8" })
}

function tempDir(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "groomie-emit-html-"))
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  return dir
}

test("exits 2 with usage when the arguments are missing", () => {
  const result = run([])
  assert.equal(result.status, 2)
  assert.match(result.stderr, /usage: node emit-html\.mjs/)
})

test("exits 1 when the visualizer assets are missing", (t) => {
  const dir = tempDir(t)
  const result = run([
    path.join(dir, "graph.json"),
    path.join(dir, "out.html"),
    path.join(dir, "missing-assets"),
  ])
  assert.equal(result.status, 1)
  assert.match(result.stderr, /visualizer assets not found/)
})

test("escapes markup in the graph and writes the combined HTML", (t) => {
  const dir = tempDir(t)
  const graphPath = path.join(dir, "graph.json")
  const htmlPath = path.join(dir, "out.html")
  const payload = { label: "</script><script>alert(1)</script>" }
  fs.writeFileSync(graphPath, JSON.stringify(payload))

  const result = run([graphPath, htmlPath])
  assert.equal(result.status, 0, result.stderr)
  assert.equal(result.stdout.trim(), htmlPath)

  const html = fs.readFileSync(htmlPath, "utf8")
  assert.match(html, /^<!doctype html>/)
  assert.match(html, /globalThis\.__GROOMIE_GRAPH__=/)
  assert.ok(html.includes("\\u003c/script"))
  assert.ok(!html.includes("</script><script>alert(1)"))
})
