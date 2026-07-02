# Groomie visualizer

An interactive graph view of a Groomie breakdown. It loads a `<ISSUE-KEY>-groomed.json`
(emitted by the `/groomie` skill) and renders it with [React Flow](https://reactflow.dev) laid
out by [ELK](https://github.com/kieler/elkjs): **epics are containers**, stories / tasks / bugs
nest inside without overlap, and `Blocks:` / `Is blocked by:` links become arrows (a bug's
`affects` is dashed). Click any node for its details.

> This is a **companion app** — not part of the plugin. The plugin stays prompt-only; this
> `visualizer/` has its own `package.json` and dependencies.

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
npm --prefix visualizer run build:single   # one self-contained dist/index.html
```

`build:single` inlines everything into a single HTML that reads `window.__GROOMIE_GRAPH__`.

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
