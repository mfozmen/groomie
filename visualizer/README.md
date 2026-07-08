# Groomie visualizer

An interactive graph view of a Groomie breakdown. It loads a `<ISSUE-KEY>-groomed.json`
(emitted by the `/groomie` skill) and draws it with [Graphviz](https://graphviz.org) — the
`dot` engine, compiled to WebAssembly via
[`@hpcc-js/wasm-graphviz`](https://github.com/hpcc-systems/hpcc-js-wasm). Graphviz does the whole
drawing job: layer nodes by blocker order, place them, and route the `blocks` / `affects` edges as
smooth splines. **Epics are containers**, tasks / stories / bugs sit inside, a bug's `affects` edge
is dashed red, and clicking any node (or an epic) shows its details in the side panel.

> This is a **companion app** — not part of the plugin. The plugin stays prompt-only; this
> `visualizer/` has its own `package.json` and dependencies. Our code only translates the groomed
> graph into a DOT program (`src/dot.ts`); layout and edge routing are entirely Graphviz's.

## Run

```
npm --prefix visualizer install
npm --prefix visualizer run dev
```

Then load a `*-groomed.json` (file picker or drag-and-drop). A `public/sample.json` is bundled
so you can try it immediately.

## Build

```
npm --prefix visualizer run build          # dist/ (static site)
npm --prefix visualizer run build:single   # one self-contained dist/index.html (WASM inlined)
```

`build:single` inlines everything — including the Graphviz WASM — into a single HTML that reads
`window.__GROOMIE_GRAPH__`. No network, works over `file://`.

## Export a portable HTML

Turn any `*-groomed.json` into a **standalone, offline** `.html` (the single-file build with the
graph injected as `window.__GROOMIE_GRAPH__`) — double-click it, no server, no internet:

```
npm --prefix visualizer run emit -- path/to/PROJ-123-groomed.json   # -> PROJ-123-groomed.html
npm --prefix visualizer run emit -- graph.json out.html             # or an explicit output path
```

This is a **companion-app** feature, not part of the plugin: `/groomie` stays prompt-only and
emits the `.json`; this repo turns it into a shareable `.html`.

## Input

The JSON contract is documented in the plugin's `skills/groomie/references/breakdown-guide.md`
("JSON graph output"): a flat `nodes[]` (epics are `kind:"epic"` with ids `E#`; stories/tasks/
bugs carry `epicId`) plus directed, deduped `edges[]` of `kind` `blocks` | `affects`.
