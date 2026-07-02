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
A future Groomie step will inject the groomed JSON into that template to emit a portable,
offline `<ISSUE-KEY>-groomed.html`.

## Input

The JSON contract is documented in the plugin's `skills/groomie/references/breakdown-guide.md`
("JSON graph output"): a flat `nodes[]` (epics are `kind:"epic"` with ids `E#`; stories/tasks/
bugs carry `epicId`) plus directed, deduped `edges[]` of `kind` `blocks` | `affects`.
