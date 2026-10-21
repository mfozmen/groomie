import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const [jsonPath, htmlPath, assetsArg] = process.argv.slice(2)

if (!jsonPath || !htmlPath) {
  console.error("usage: node emit-html.mjs <graph.json> <output.html> [assets-dir]")
  process.exit(2)
}

const here = path.dirname(fileURLToPath(import.meta.url))
const assets = assetsArg ? path.resolve(assetsArg) : path.resolve(here, "..", "assets")
const headPath = path.join(assets, "visualizer-head.html")
const tailPath = path.join(assets, "visualizer-tail.html")

function nonEmpty(file) {
  try {
    return fs.statSync(file).size > 0
  } catch {
    return false
  }
}

if (!nonEmpty(headPath) || !nonEmpty(tailPath)) {
  console.error(`visualizer assets not found under ${assets}`)
  process.exit(1)
}

const graph = fs.readFileSync(jsonPath, "utf8").replace(/</g, "\\u003c")
const html =
  fs.readFileSync(headPath, "utf8") +
  "<script>globalThis.__GROOMIE_GRAPH__=" +
  graph +
  "</script>" +
  fs.readFileSync(tailPath, "utf8")

fs.writeFileSync(htmlPath, html)
console.log(htmlPath)
