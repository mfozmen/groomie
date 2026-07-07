---
name: groomie
description: Use when the user asks to groom, break down, or refine a Jira issue — typically invoked as `/groomie <ISSUE-KEY>` (e.g. `/groomie PROJ-123`). Fetches the issue from Jira, researches it as deeply as the environment allows, and produces a clean epic / user-story / technical-task (and bug) breakdown as markdown, with tasks blocking the stories they enable. Does NOT write anything back to Jira.
---

# Groomie

Turn one messy, single-feature Jira issue into a clean, groomed breakdown:
**one epic, its user stories, the technical tasks that block those stories, and bugs
where relevant**,
delivered as a markdown document. You never write to Jira — you produce markdown the
user reviews and files themselves.

**Groomie's job is to remove ambiguity:** turn vague, messy intent into unambiguous,
testable behavior — clear acceptance criteria and concrete test cases. Where behavior
genuinely cannot be inferred from the issue or your research, raise it as an open
question — never leave it vague, and never invent it.

## Input

The user gives you a Jira issue key (e.g. `PROJ-123`). It may be poorly written:
vague, over-stuffed, mixing several concerns, missing acceptance criteria. That mess
is the whole reason Groomie exists — your job is to recover the real feature underneath
it and structure it properly.

If no key is given, ask for one. Only ever groom **one feature** per run.

## Modes

Invoke by subcommand — `/groomie:full <ISSUE-KEY>` or `/groomie:stories <ISSUE-KEY>` — or as
bare `/groomie <ISSUE-KEY>`, which defaults to **full**. The `--full` / `--stories` / `--estimate`
flags on `$ARGUMENTS` still select the mode (back-compat). If nothing selects a mode, use **full**.

- **`--full`** (default) — epic + user stories + technical tasks. Do the deep research
  (step 3: comments, links, and the actual code) needed to write accurate tasks. Produces
  a sprint-ready breakdown.
- **`--stories`** — epic + user stories only, **no technical tasks**. Lighter and faster:
  you still research enough to understand the feature and its user-facing behavior, but
  you do not need to read the code to derive tasks. Use to see the behavior/scope quickly.
  Presumes a user-facing feature — on a pure migration/infra issue (no behavior change,
  hence no stories) this yields just the epic; use `--full` for those.
- **`--estimate`** — *experimental, development-only; do not advertise to end users.*
  Produces the full breakdown and adds a **Fibonacci** point estimate (1, 2, 3, 5, 8,
  13, …) to **each task**. Estimates are a rough first pass and **must be calibrated over
  time** against real effort — treat them as directional, not authoritative. Per-story /
  per-epic roll-up is a later addition.

## Consistency

Given the same issue, produce the **same breakdown** — do not emit a different set of
stories/tasks each run. Derive stories systematically: **one story per distinct
user-facing behavior** the feature implies, in the order they appear, using the canonical
`As a …, I want …, so that ….` phrasing. Don't rename, reshuffle, or invent between runs; when
a re-run could go two ways, prefer the more literal reading of the issue + research over a
creative one.

## Flow

Work through these steps in order. Announce each briefly so the user can follow.

### 1. Fetch the issue (required — Jira is the one hard dependency)

Read the issue from Jira via the **Atlassian MCP** server. Tool names vary by install;
look for the "get Jira issue" tool (commonly `getJiraIssue`, `jira_get_issue`, or similar).
Pull: summary, description, issue type, comments, change history (the changelog — you may
need to request it explicitly, e.g. `expand=changelog`), labels, and linked issues.

If no Atlassian MCP is available, stop and tell the user: Groomie needs the Atlassian
MCP connected to read the issue. Point them to install it (Claude Code: add the
Atlassian MCP server), then retry.

### 2. Probe capabilities (decide how deep you can research)

Before researching, take stock of what THIS environment offers, and let that set your
research depth. Do not assume any company-specific tool exists — Groomie is open source.

Look for, in rough order of usefulness:
- A code/knowledge search tool (e.g. an internal engineering knowledge base MCP, a repo
  the session is opened in, `Grep`/`Glob` over local code) — for how the feature fits
  the actual system.
- Web research (`WebSearch` / `WebFetch`) — for domain, standards, prior art.
- Subagents (the `Agent` / Task tool) — to fan out research without bloating context.

Say one line about what you found and the depth you'll use. If nothing beyond the Jira
issue is available, say so and groom from the issue text alone — that is a valid mode.

### 3. Research the feature

Using what step 2 surfaced, dig until you understand the feature well enough to break it
down honestly. When these inputs exist, using them is **not optional**:

- **Read the issue's own comments and change history** — the real decisions, corrections,
  and intent often live in the comments, not the description, and the description may have
  been edited into an inconsistent state. Trust the comments over stale prose.
- **Follow the links** — the parent epic, the tech-design / PRD, and every linked or
  sibling issue; together they define the feature's true scope and boundaries.
- **Read the actual code** — whenever a codebase is reachable (a knowledge-base MCP, the
  repo the session is in, `Grep`/`Glob`), inspect it before writing technical tasks: the
  real endpoints, tables, services, and how components call each other. **When a codebase
  is reachable, never write technical tasks from the ticket's prose alone** — verify them
  against the code, since the ticket is frequently wrong or stale (it may name the wrong
  store, a field that doesn't exist, or a renamed endpoint). In the text-only mode (step 2,
  no reachable codebase), derive tasks from the ticket but flag their assumptions as open
  questions.
- Prefer delegating heavy searching to subagents; keep only the conclusions.

Surface every contradiction you find — ticket-vs-code, or ticket-vs-other-tickets — as an
open question. Never silently paper over it, and never invent the answer.

### 4. Groom

Apply the rules in **[references/breakdown-guide.md](references/breakdown-guide.md)** to
produce the structure. Calibrate style and granularity against the worked samples in
**[references/examples.md](references/examples.md)** — those examples are how the user
"trains" Groomie, so follow their shape closely. If `examples.md` still holds only
placeholders (no real samples yet), ignore it and follow the breakdown guide's output
shape.

Core rules (full detail in the guide):
- **Usually one epic** = the feature — bounded, closeable, scope clear from the title; body
  is **Description** + **Business Value** (+ an optional **Design** line for Figma / mockups
  when research surfaces them). Produce **multiple epics** only when the issue genuinely
  spans more than one distinct, independently bounded feature.
- **User stories** are **non-technical**, user-visible slices describing **behavior and
  needs only** — never solutions (no API/UI/design prescriptions). Keyed `S1`, `S2`, …
  (Jira-style). Title is the full `As a <role>, I want <capability>, so that <benefit>.`
  sentence — **comma before *so that*, period at the end** — and the `<role>` must be a
  **real user of our product** (never the end recipient / consumer of an outbound artifact;
  reframe that from our user's view). **One responsibility per story (INVEST) — split a
  compound story (e.g. "edit or delete") into separate stories whenever each part stays
  independently valuable and testable.** Body carries required **Acceptance Criteria** and **Test Cases**, plus **`Is blocked
  by:`** the tasks that build it (one per line as `- <key> — <title>`). QA tests stories. **Only write
  stories when the feature changes user-facing behavior** — a pure technical
  migration/refactor/infra epic has **no stories**. Not every epic has stories; never force one.
  A **technical outcome dressed as a story is not a story**: "the records are queryable in the new
  store", "the backfill is verifiable/reversible", or any operator/"system" story invented on a
  migration must **not** appear. If there is no real end-user `As a …, so that .` behavior, emit
  **no** stories at all (epic + tasks only) — do not manufacture them to fill the layer.
- **Technical tasks** are the implementation work, keyed `T1`, `T2`, …, titled in the
  **imperative** — `[Discipline] <verb …>` (e.g. `[Backend] Implement the login API
  endpoints`), never a terse note. **Size each task to a real unit of delivery, one
  discipline can ship on its own — do not slice per step.** Split along boundaries that need
  separate ownership/review/CI: a **different repo or discipline is always its own task**;
  otherwise keep a single responsibility whole (schema + its endpoints + their tests in one
  repo = one task, not four). **Tests and in-repo docs live *inside* the task** (note them in
  `Done when`), never as separate `[QA]`/`[Docs]` tasks — the one exception is
  documentation produced **outside the repo** (e.g. Confluence), especially when a
  company-wide process mandates it. Prefer a few well-scoped tasks over many tiny ones (CI
  overhead is real). A task is a **sibling of stories, not a subtask** — it is **not
  QA-tested** (carries `Done when`, not Test Cases) and states its links both ways in Jira's
  terms, one reference per line as `- <key> — <title>`: **`Blocks:`** the stories it enables
  — or, in a story-less epic, the tasks it precedes — and **`Is blocked by:`** the tasks that
  must come first. One foundational task may block many stories. **Tasks are implementation work
  only** — never a coordination, sign-off, decision, approval, or meeting task (no `T0 — Decision
  & coordination`), and **never name a person** (no `Get sign-off from <name>`). An unresolved
  decision — which table, whose approval, which endpoint — is an **open question**, not a task.
- **Bugs** only when the source issue reports broken existing behavior; technical or not,
  they are QA-tested like stories.
- Flag ambiguities as open questions instead of guessing.

### 5. Output markdown

Produce a single markdown document (see the shape in the breakdown guide): the epic(s), then —
only if the feature changes user-facing behavior — the stories (keyed `S1…`, each with
acceptance criteria, test cases, and `Is blocked by:` its task keys), then the tasks (keyed
`T1…`, each with `Blocks:` / `Is blocked by:`), then bugs, then open questions. **Omit any
empty section entirely** — no `## Stories` when there's no behavior change, no `## Bugs`
when there are none, no empty `## Open questions`; never print a "(none)" placeholder. In `--stories` mode, omit the tasks section; in `--estimate` mode,
add a Fibonacci `Estimate:` to each task.

**Output contract — emit these sections and NOTHING else.** In this exact order:

1. `# Epic: <name>` (Description + Business Value [+ Design])
2. A version stamp line directly under the epic heading — see below.
3. `## Stories` — **only** if the feature changes user-facing behavior; omit entirely otherwise.
4. `## Tasks`
5. `## Bugs` — only if the issue reports broken behavior.
6. `## Open questions` — only if any.
7. `## Diagram`

Emit **no other sections and no preamble.** Specifically **forbidden:** a `TL;DR` / executive
summary / "the work, simplified", a `Locked decisions` / decisions / evidence / rationale table,
an `Epic (context)` or any narrative that **critiques, "refutes", or re-summarizes the ticket.**
Your research shapes the *content* of the sections above — it is never shown as its own narrative.
A contradiction between the ticket and the code is an **open question**, never a commentary section.

**Version stamp (every run).** Immediately under the `# Epic:` heading, emit one italic line so
both you and the reader know which Groomie produced the breakdown:

```markdown
_groomie v<version> · full breakdown_
```

Read `<version>` from the `version` field of the plugin manifest at
`$SKILL/../../.claude-plugin/plugin.json` (the same `$SKILL` base path used for the HTML step,
e.g. `grep '"version"' "$SKILL/../../.claude-plugin/plugin.json"`). If it can't be read, stamp
`_groomie (version unknown) · full breakdown_` rather than omitting the line.

End with a **`## Diagram`** section — one fenced ```mermaid `flowchart TD` that renders the
breakdown as a graph: one `subgraph` per epic (container) holding its story/task/bug nodes,
solid arrows for blocking (`T# --> S#`), dashed for a bug's `affects` (`B# -.-> S#`), colored
by kind. See the guide's *Diagram (mermaid)* section for the exact shape and label-sanitization
rules. Omit the `## Diagram` when there are no nodes.

**Save it to a file AND print it.** Write the document to `<ISSUE-KEY>-groomed.md` in the
current working directory (e.g. `PROJ-123-groomed.md`), tell the user the path, then also
print it inline so they can read it without opening the file. Do **not** write to Jira.

**Also emit a JSON graph** `<ISSUE-KEY>-groomed.json` next to the markdown — the same
epic/story/task/bug nodes and `blocks`/`affects` edges as a machine-readable graph (the
input for the visualizer). See the guide's *JSON graph output* section for the schema. Tell
the user this path too.

**Also emit a standalone interactive HTML** `<ISSUE-KEY>-groomed.html` — the graph visualizer
with this breakdown baked in: offline, double-clickable, no server. **No Node/npm needed** — you
concatenate the two shipped template halves around the graph with plain shell. This skill ships
`assets/visualizer-head.html` and `assets/visualizer-tail.html`; use **this skill's own directory**
(the harness gives it to you as the skill's base path — substitute it for `$SKILL` below). Escape
`<` to `\u003c` so a `</script>` inside any title can't break out of the injected tag:

```bash
if [ -s "$SKILL/assets/visualizer-head.html" ] && [ -s "$SKILL/assets/visualizer-tail.html" ]; then
  TMP=$(mktemp)
  sed 's/</\\u003c/g' <ISSUE-KEY>-groomed.json > "$TMP"
  { cat "$SKILL/assets/visualizer-head.html"; \
    printf '<script>globalThis.__GROOMIE_GRAPH__='; cat "$TMP"; printf '</script>'; \
    cat "$SKILL/assets/visualizer-tail.html"; } > <ISSUE-KEY>-groomed.html
  rm -f "$TMP"
fi
```

The guard means that if the two template assets can't be found (e.g. `$SKILL` wasn't resolved to
this skill's real base path), you skip the HTML rather than write a truncated, broken file. Tell the
user the `.html` path when it's produced. If the assets are missing or `sed`/`cat` are unavailable,
skip the HTML — the `.md` (with its mermaid diagram, which renders in any markdown viewer) and the
`.json` are the primary outputs and always ship.

**Never hand-author the `.html` yourself.** It is produced *only* by concatenating the two shipped
template halves around the graph, as above — that file IS the interactive visualizer (a ~1.9 MB
React/React-Flow bundle). If you cannot run that step (assets not found, `$SKILL` unresolved, no
shell), **skip the `.html` entirely and say so** — do **not** substitute a bespoke, static, or
hand-written HTML. A hand-rolled card-list page is *not* the visualizer: it has no graph, misleads
the user into thinking they got the real output, and hides that the template step failed.

## Boundaries

- Read-only against Jira. Never create, edit, or transition issues.
- One feature per run.
- No invented requirements — unknowns become open questions.
