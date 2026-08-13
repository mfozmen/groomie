---
name: groomie
description: Use when the user asks to groom, break down, or refine a feature idea — typically invoked as `/groomie <source> [<source> …]`, where a source is a Jira issue key (e.g. `PROJ-123`), a Jira/Confluence URL, any URL, or a local file. Resolves every given source (Jira, when present, additionally contributes comments, changelog, links, and the project key — but is not required), researches the feature as deeply as the environment allows — verifying the sources' claims rather than trusting them — and produces a clean epic / user-story / technical-task (and bug) breakdown as markdown, with tasks blocking the stories they enable. Also revises an already-produced breakdown in place (`/groomie:revise <ID> <change>`, or the user asks to change/add/remove/split an epic/story/task), customizes itself by conversation (`/groomie:config <what you want>`, e.g. "groom in Turkish" — writes the config file for the user, who never hand-edits it), and — opt-in only — pushes a finalized breakdown into Jira (`/groomie:push <ID>`), which is the ONE write action and writes only after the user approves a plan preview. Every groom/revise ends with a required self-review pass (`references/review-checklist.md`); the standalone `/groomie:review <ID>` (the separate `review` skill) runs that pass over an existing breakdown. Run it directly in the main thread (or dispatch the dedicated `groomie` agent) — do NOT delegate the grooming to a general-purpose subagent. Every flow except `/groomie:push` is read-only against Jira.
---

# Groomie

Turn one messy, single-feature idea — a Jira issue, a Confluence page, a PRD link, a note —
into a clean, groomed breakdown:
**one epic, its user stories, the technical tasks that block those stories, and bugs
where relevant**,
delivered as a markdown document. Grooming, revising, and configuring are **read-only against
Jira** — you produce markdown the user reviews. The one exception is the opt-in `/groomie:push`
(see *Push to Jira*), which writes the breakdown into Jira, and only after the user approves a
plan preview.

**Groomie's job is to remove ambiguity:** turn vague, messy intent into unambiguous,
testable behavior — clear acceptance criteria and concrete test cases. Where behavior
genuinely cannot be inferred from the issue or your research, raise it as an open
question — never leave it vague, and never invent it.

## Input

The user gives you **one or more sources**, plus optional free text:

```
/groomie <source> [<source> …] [free text]
```

A source is a **Jira issue key** (e.g. `PROJ-123`), a **Jira or Confluence URL**, **any URL**
(a PRD, a spec, a doc), or a **local file path**. The **first** source is the **primary** one —
it defines the feature and names the breakdown; the rest are supporting evidence. Trailing free
text ("also consider …") is research direction, never a claim to inherit. A Jira issue is **not
required** — a Confluence page or a pasted link alone is a valid starting point.

Any source may be poorly written: vague, over-stuffed, mixing several concerns, missing
acceptance criteria. That mess is the whole reason Groomie exists — your job is to recover the
real feature underneath it and structure it properly.

If no source is given, ask for one. Only ever groom **one feature** per run.

## Modes

Invoke by subcommand — `/groomie:full <source> …` or `/groomie:stories <source> …` — or as
bare `/groomie <source> …`, which defaults to **full**. The `--full` / `--stories` / `--estimate`
flags on `$ARGUMENTS` still select the mode (back-compat). If nothing selects a mode, use **full**.

- **`--full`** (default) — epic + user stories + technical tasks. Do the deep research
  (step 3: comments, links, the actual code, and the claim check) needed to write accurate
  tasks. Produces a sprint-ready breakdown.
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

Given the same sources, produce the **same breakdown** — do not emit a different set of
stories/tasks each run. Derive stories systematically: **one story per distinct
user-facing behavior** the feature implies, in the order they appear, using the canonical
`As a …, I want …, so that ….` phrasing. Don't rename, reshuffle, or invent between runs; when
a re-run could go two ways, prefer the more literal reading of the issue + research over a
creative one.

## Flow

Work through these steps in order. Announce each briefly so the user can follow.

### 1. Resolve the sources

Fetch **every** source the user gave, each with the reader that fits its kind: a **Jira
issue or Confluence page** via the **Atlassian MCP** (tool names vary by install — look for
the "get Jira issue" / "get Confluence page" tools, commonly `getJiraIssue` /
`getConfluencePage` or similar), a **URL** via `WebFetch`, a **file path** via `Read`.
A URL that *looks* like Jira/Confluence but isn't on `*.atlassian.net` (a self-hosted
instance — a `/browse/KEY-123` or `/wiki/` path shape) goes to the **MCP first**, falling
back to `WebFetch` if the MCP can't read it; a source's `kind` (step 5) records what
actually read it.

**When a Jira issue is among the sources, harvest everything only Jira gives** — this is
where Jira still earns its keep: summary, description, issue type, comments, change history
(the changelog — you may need to request it explicitly, e.g. `expand=changelog`), labels,
linked issues, and the **project key** (remembered for `/groomie:push`). When none is,
skip the Jira harvest and say so in one line — a no-Jira groom is a fully valid mode. (A
**Confluence** source still goes through the Atlassian MCP — "no Jira source" means no Jira
*issue* to harvest, not a ban on the MCP.)

**An unreachable source is never dropped in silence.** The rules (and the interactive /
non-interactive split) live in the guide's *Sources* section; the flow:

- The **primary** source unreachable (fetch failed, or no reader exists for its kind — e.g.
  a Jira source with no Atlassian MCP connected) ⇒ **stop**: there is nothing to groom. Name
  the source, the reason, and the fix (grant access / connect the MCP), then let the user retry.
- A **supporting** source unreachable ⇒ ask **once**, batched: list every unreachable source
  with its reason and ask *grant access and retry, or skip them?* Never one question per
  source. In a **non-interactive session** (the `groomie` agent, any subagent) never
  deadlock: skip them, record each as `unreachable` in `sources[]` (step 5), and carry them
  as one consolidated `## Open questions` entry.

**Fix the breakdown's identity `<ID>` now** — it names the output folder and files and is what
`revise`/`tasks`/`push`/`review` resolve by. **The primary source decides:** a Jira-issue
primary ⇒ its **key**; anything else ⇒ a **slug of the primary source's title** per the guide's
*Sources* slug rule (a supporting Jira key never names the breakdown). **The primary ref, not
the folder name, is what makes two grooms the same breakdown** (the guide's reuse rule): reuse
the existing folder whose JSON's primary source ref matches — even if the source was retitled
and the slug would differ — and on a slug collision with a *different* primary ref, pick a
distinct slug (interactive: ask for a name; non-interactive: extend the slug with a
distinguishing word from the ref) instead of overwriting.

### 2. Probe capabilities (decide how deep you can research)

Before researching, take stock of what THIS environment offers, and let that set your
research depth. Do not assume any company-specific tool exists — Groomie is open source.

Look for, in rough order of usefulness:
- A code/knowledge search tool (e.g. an internal engineering knowledge base MCP, a repo
  the session is opened in, `Grep`/`Glob` over local code) — for how the feature fits
  the actual system.
- Web research (`WebSearch` / `WebFetch`) — for domain, standards, prior art.
- Subagents (the `Agent` / Task tool) — to fan out research without bloating context.

Say one line about what you found and the depth you'll use. If nothing beyond the given
sources is available, say so and groom from the source text alone — that is a valid mode.

**Also read the config, if any.** Load the **merged** effective config: the global
`~/.groomie/config.md` with the per-project `groomie.config.md` (working directory, and — when the cwd
is inside a git repo — the repo root) layered on top. Merge **by kind of setting** so nothing global
is lost: **scalar** settings (Output language, Granularity, Documentation policy) take the per-project
value if present, else global, else default; **list** settings (Repo → discipline, Disciplines,
Personas) are
the **union** of both, a per-project entry overriding a same-key global entry (see the guide's
*Per-project config* merge rule). It is a team's optional, company-wide grooming
conventions — an **output language**, a repo→discipline map, the disciplines they use, a personas
vocabulary for story roles, an out-of-repo documentation policy, and a granularity preference. **Both files and every section are independently
optional:** if a file is missing (or a section is), groom exactly as you do today. When you load
anything, say one line naming what it set. Apply it in step 4 per the guide's *Per-project config
(`groomie.config.md`)* section — never let it introduce a hard dependency or block the groom.

### 3. Research & verify the feature

**Treat the primary source as a claim, not as truth.** A messy ticket or page is routinely
*wrong*, not merely vague — it names a store that was renamed, asserts a capability that already
ships, or fixes a scope boundary the code contradicts. So research has two jobs: understand the
feature, **and check what the source asserts** before any of it hardens into a story or a task.

Using what step 2 surfaced, dig until you understand the feature well enough to break it
down honestly. When these inputs exist, using them is **not optional**:

- **Use every supporting source the user gave** (step 1) — the user handed them over because
  they carry evidence the primary source lacks; in verification they rank with the ticket's
  own linked docs (the guide's source order). The trailing free text steers *where* you
  research; it is never itself evidence.

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

**If research came back thin** — no reachable code, the primary source carries no links, **and
the user gave no supporting sources** —
ask **once** whether the user has more sources (a PRD, a design doc, a related page) before
grooming from so little; that is the one moment the answer changes the output. Never ask this
on a well-sourced groom, and never in a non-interactive session (groom and flag instead).

**Then verify, before you groom.** The rules — what counts as load-bearing, the source order, the
three verdicts, the narrow premise-breaking bar, and the never-its-own-section rule — live in the
guide's *Verifying the sources' claims* section; read it, then run this loop:

1. **List the sources' load-bearing claims** — the assertions the breakdown would silently inherit
   (a claim is load-bearing only if a story, a task, or the epic's scope would change were it
   false).
2. **Verify each** against the guide's source order. A source never verifies itself — the
   primary source's claims need a source other than itself.
3. **Classify:** confirmed / contradicted / unverifiable.
4. **Act on the verdict** per the guide's table — confirmed ⇒ use it; contradicted ⇒ groom the
   **verified reality** and open a question naming both readings; unverifiable ⇒ never state it as
   fact. In the **text-only mode** (step 2 found no sources) nearly everything is unverifiable:
   derive from the ticket as the code bullet above says, and carry the lot as **one consolidated
   open question** listing the assumptions — not one question per claim, which would bury the
   breakdown — plus the one-line notice in item 7.
5. **A premise-breaking contradiction stops the groom and asks** — before you write anything, on
   the guide's narrow bar and under its two limits (**directly evidenced only**, and **never
   deadlock when you can't ask** — as the `groomie` agent or any non-interactive session). Read
   them there; everything short of that bar is **groom-and-flag**.
6. **Fan out bounded** when step 2 found subagents: only claims that need a real search are worth
   one, related claims travel together — a ticket with a dozen claims is **~3–5 subagents, not a
   dozen** — and each returns just its verdict, evidence, and source. The ledger and the step-4
   judgment stay yours. **No subagents ⇒ verify inline**, same rules, never a hard dependency.
7. **Report one line** before the breakdown:
   `Verification: N claims checked — A confirmed, B contradicted, C unverifiable.` plus a half-line
   per contradicted claim. **Conversation, not document** — never a `.md` section (step 5's
   forbidden list).

**Mode scaling.** `--stories` verifies the scope and behavior claims (does this behavior already
exist? is the stated boundary true?) **against its non-code sources** — links, docs, comments —
keeping the mode's no-code-read promise; an unresolved one is an open question, not a code dive.
`--full` additionally verifies every technical claim a task would inherit, against the code.

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
  reframe that from our user's view). **Never invent the role name**: take it from the
  config's `## Personas` when defined, else a name the source actually uses (the ticket, its
  docs, or roles found in the project's already-filed stories — research opportunistically),
  else generic `user` (the guide's persona rule). **One responsibility per story (INVEST) — split a
  compound story into separate stories whenever each part stays independently valuable and
  testable. A story bundles two ways: by action ("edit or delete") and by surface/scope ("in both
  the X and Y editors") — a single verb does not make it one story.** Body carries required **Acceptance Criteria** and **Test Cases**, plus **`Is blocked
  by:`** the tasks that build it (one per line as `- <key> — <title>`). QA tests stories. **Only write
  stories when the feature changes user-facing behavior** — a pure technical
  migration/refactor/infra epic has **no stories**. Not every epic has stories; never force one.
  A **technical outcome dressed as a story is not a story**: "the snapshot is queryable in the
  primary store", "the backfill is verifiable/reversible", or any operator/"system" story invented
  on a migration must **not** appear (worked anti-patterns: the guide's story section and
  examples.md). If there is no real end-user `As a …, I want …, so that ….` behavior, emit **no**
  stories at all (epic + tasks only) — do not manufacture them to fill the layer.
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
- **Honor the config when step 2 loaded one** — each setting optional, each falling back to
  the defaults above when absent: write the output **content in its `## Output language`** (only
  human-readable content — epic/story/task/bug prose and node labels; the skeleton stays fixed:
  keys, `[Discipline]` prefixes, the link markers `Blocks:` / `Is blocked by:`, the
  fixed headings, the version stamp; absent ⇒ English); use its **repo→discipline map** for the `[Discipline]` prefix on
  work landing in a named repo (a repo not in the map ⇒ infer as usual, never block); its
  **disciplines** as the `[Discipline]` vocabulary; its **personas** as the story `<role>`
  vocabulary (best fit per actor; absent ⇒ a role name the source uses, else `user`); its
  **documentation policy** to decide when the
  out-of-repo-docs exception yields a separate docs task; and its **granularity** preference to bias
  task consolidation. Full schema in the guide's *Per-project config (`groomie.config.md`)* section.
- Flag ambiguities as open questions instead of guessing.

### 5. Output markdown

Produce a single markdown document (see the shape in the breakdown guide): the epic(s), then —
only if the feature changes user-facing behavior — the stories (keyed `S1…`, each with
acceptance criteria, test cases, and `Is blocked by:` its task keys), then the tasks (keyed
`T1…`, each with `Blocks:` / `Is blocked by:`), then bugs, then open questions, then sources. **Omit any
empty section entirely** — no `## Stories` when there's no behavior change, no `## Bugs`
when there are none, no empty `## Open questions`; never print a "(none)" placeholder. In `--stories` mode, omit the tasks section; in `--estimate` mode,
add a Fibonacci `Estimate:` to each task.

**Output contract — emit these sections and NOTHING else.** In this exact order:

1. `# Epic: <verb-led name>` — the heading (title leads with a verb, Title Case: *Add /
   Enable / Migrate …*, see the guide's epic rules), then the version stamp line (see below), then
   Description + Business Value [+ Design].
2. `## Stories` — **only** if the feature changes user-facing behavior; omit entirely otherwise.
3. `## Tasks` — omitted entirely in `--stories` mode.
4. `## Bugs` — only if the issue reports broken behavior.
5. `## Open questions` — only if any.
6. `## Sources` — the resolved sources, one bullet each (the guide's *Sources* section);
   **omitted** when the only source is the primary Jira issue (the key says it already).
7. `## Diagram`

Emit **no other sections and no preamble.** Specifically **forbidden:** a `TL;DR` / executive
summary / "the work, simplified", a `Locked decisions` / decisions / evidence / rationale table, a
`Verification` / claim-audit section, an `Epic (context)` or any narrative that **critiques,
"refutes", or re-summarizes the ticket.**
Your research and verification shape the *content* of the sections above — never shown as their own
narrative. A contradiction between the ticket and the code is an **open question** (plus step 3's
one-line conversational summary), never a commentary section.

**Version stamp (every run).** Immediately under the first `# Epic:` heading (before its
`**Description:**`; once per document, not per epic), emit one italic line so both you and the
reader know which Groomie — and which mode — produced the breakdown:

```markdown
_groomie v<version> · <mode> breakdown_
```

`<mode>` is the active mode word: `full`, `stories`, or `estimate` (e.g.
`_groomie v0.3.3 · stories breakdown_`). Read `<version>` from the `version` field of the plugin
manifest at `$SKILL/../../.claude-plugin/plugin.json` (the same `$SKILL` base path used for the
HTML step, e.g. `grep '"version"' "$SKILL/../../.claude-plugin/plugin.json"`). If it can't be
read, stamp `_groomie (version unknown) · <mode> breakdown_` rather than omitting the line.

End with a **`## Diagram`** section — one fenced ```mermaid `flowchart TD` that renders the
breakdown as a graph: one `subgraph` per epic (container) holding its story/task/bug nodes,
solid arrows for blocking (`T# --> S#`); bugs are standalone nodes (no edge), colored
by kind, each node labelled with its **full title wrapped at ~34 chars** (`<br/>`) like the HTML
visualizer. See the guide's *Diagram (mermaid)* section for the exact shape, label, and sanitization
rules. Omit the `## Diagram` when there are no nodes.

**A re-groom never orphans what earlier runs recorded.** When the target `<ID>` already has a
`<ID>-groomed.json`, the fresh groom overwrites the *graph* (nodes/edges/mode) but **carries the
old JSON's `jira` ledger forward unchanged and merges its `sources[]`** (old entries kept, this
run's added) — dropping the ledger would make the next `/groomie:push` duplicate every issue it
had already created. A carried ledger entry may now point at a node whose *content* changed (a
re-groom can re-use `S1` for a different story) — that drift is not resolved here; it is **exposed
at push time**: the ledger records each pushed summary, and the push preview renders any mismatch
old → new (see *Push to Jira* step 4) so the user approves the overwrite knowingly.

**Save it to a file AND print it.** Write the document to `<ID>/<ID>-groomed.md` — a
per-breakdown folder named for the step-1 identity (Jira key or slug) in the current working
directory, so repeated grooms don't pile up
loose in one directory. Create the folder first (`mkdir -p <ID>`, e.g. `mkdir -p PROJ-123`,
giving `PROJ-123/PROJ-123-groomed.md`), then print it inline so they can read it
without opening the file. Do **not** write to Jira. Do **not** announce file paths here — paths
go in the **closing block** at the very end of the message (below), so they are the last thing
the user sees rather than buried above the breakdown.

**Output language vs. conversation language.** Talk to the user in whatever language *they* are
using, but write the groomed **output content** in the config's `## Output language` (step 2 /
step 4) — default **English** when unset. The two are independent: a Turkish conversation about an
English ticket still produces English output unless the config says otherwise, and vice-versa. Only
human-readable content is translated — the contract skeleton (keys, `[Discipline]`, the link/bug
markers `Blocks:` / `Is blocked by:`, the fixed headings, the version stamp) stays fixed
so `check-graph.mjs` and the visualizer keep working.

**Also emit a JSON graph** `<ID>/<ID>-groomed.json` next to the markdown — the same
epic/story/task/bug nodes and `blocks` edges as a machine-readable graph (the
input for the visualizer). See the guide's *JSON graph output* section for the schema. Its path
is reported in the closing block, not here.

**Also emit a standalone interactive HTML** `<ID>/<ID>-groomed.html` — the graph visualizer
with this breakdown baked in: offline, double-clickable, no server. **No Node/npm needed** — you
concatenate the two shipped template halves around the graph with plain shell. This skill ships
`assets/visualizer-head.html` and `assets/visualizer-tail.html`; use **this skill's own directory**
(the harness gives it to you as the skill's base path — substitute it for `$SKILL` below). Escape
`<` to `\u003c` so a `</script>` inside any title can't break out of the injected tag:

```bash
if [ -s "$SKILL/assets/visualizer-head.html" ] && [ -s "$SKILL/assets/visualizer-tail.html" ]; then
  TMP=$(mktemp)
  sed 's/</\\u003c/g' <ID>/<ID>-groomed.json > "$TMP"
  { cat "$SKILL/assets/visualizer-head.html"; \
    printf '<script>globalThis.__GROOMIE_GRAPH__='; cat "$TMP"; printf '</script>'; \
    cat "$SKILL/assets/visualizer-tail.html"; } > <ID>/<ID>-groomed.html
  rm -f "$TMP"
fi
```

The guard means that if the two template assets can't be found (e.g. `$SKILL` wasn't resolved to
this skill's real base path), you skip the HTML rather than write a truncated, broken file. Its
path (when produced) goes in the closing block. If the assets are missing or `sed`/`cat` are unavailable,
skip the HTML — the `.md` (with its mermaid diagram, which renders in any markdown viewer) and the
`.json` are the primary outputs and always ship.

**Close the final message with the file paths.** The message ends — after the printed breakdown
and the self-review line (step 6) — with a short closing block: the per-breakdown folder and the files
actually written (`.md`, `.json`, and the `.html` when produced — omit a line for a skipped file
and say why it was skipped), plus the note that nothing was written to Jira. Paths appear **only**
here, last, so the user never scrolls back up to find them:

```
Files saved under <cwd>/<ID>/:
- <ID>-groomed.md — the breakdown above
- <ID>-groomed.json — machine-readable graph
- <ID>-groomed.html — standalone interactive visualizer (double-click to open)

Breakdown id: <ID> — use it with /groomie:revise, /groomie:tasks, /groomie:push, /groomie:review.
Nothing was written to Jira.
```

**Never hand-author the `.html` yourself.** It is produced *only* by concatenating the two shipped
template halves around the graph, as above — that file IS the interactive visualizer (a
self-contained ~0.8 MB Graphviz-rendered bundle). If you cannot run that step (assets not found, `$SKILL` unresolved, no
shell), **skip the `.html` entirely and say so** — do **not** substitute a bespoke, static, or
hand-written HTML. A hand-rolled card-list page is *not* the visualizer: it has no graph, misleads
the user into thinking they got the real output, and hides that the template step failed.

### 6. Self-review (required — every groom ends with this)

Generation drops rules under load; verification catches what writing missed. After the three
files are written, run the checklist in **`references/review-checklist.md`** over the output —
read the finished `.md` (and `.json`) top to bottom in *checking* mode and answer every item
(the leak scan on each story, epic/task/bug shape, sections, diagram, self-containment).

- **Clean** → report it in one line (`Self-review: clean — N stories, M tasks checked`), then
  finish with the **closing block** (step 5): the file paths, last.
- **Violations** → fix them in the **one bounded pass** the checklist defines (md + json
  together, keys stable, ledger untouched), regenerate the `.html`, re-run
  `scripts/check-graph.mjs`, re-print the corrected markdown, list what was fixed by key, and
  finish with the **closing block** (step 5): the file paths, last.
  Anything needing new research or an unanswered judgment call is reported (or added to
  `## Open questions` if it is a genuine ambiguity) — never a second sweep.

The same pass is available standalone as `/groomie:review <ID>` (the `review` skill) for
breakdowns produced earlier. Never skip this step, and never present unreviewed output as final.

## Revise an existing breakdown

Groom is one-shot: a plain `/groomie <ID>` grooms fresh and **overwrites** the three files. (`<ID>`
throughout these flows is the breakdown identity step 1 fixed — the Jira key, or the slug for a
no-Jira groom; the closing block names it.) When the
user instead wants to **change what a previous run produced** — "split T3 into two", "remove S2",
"add a `[Frontend]` task for the empty-state", "the epic's business value is wrong, it's X" — invoked
as `/groomie:revise <ID> <change>` or just phrased as an edit to an existing breakdown, do a
**targeted edit** instead of re-grooming. Do NOT run steps 1–6 (step 7 below carries the
self-review layer for a revise); run this:

1. **Resolve the target + change.** Get the breakdown id and the natural-language change. Locate the
   breakdown: prefer the per-breakdown folder `<ID>/<ID>-groomed.{md,json}`, else fall back to the
   legacy flat `<ID>-groomed.{md,json}` in the working directory (pre-folder outputs). Both the
   `.md` **and** the `.json` must be present together at one of those locations; if that pair isn't
   found in either place, **stop** and tell the user to run `/groomie <ID>` first — never silently
   groom a fresh breakdown here. Read from, and re-emit at, whichever location you resolved — **don't
   migrate a legacy-flat breakdown into the folder layout.**
2. **Load the current state.** Read the resolved `<ID>-groomed.md` and `<ID>-groomed.json`; treat them as one
   model (the JSON is the structured graph, the MD the rich prose). The mode is the JSON `mode` field
   / the version-stamp word — keep it.
3. **Apply the change under the same contract.** The `references/breakdown-guide.md` +
   `references/examples.md` rules that govern generation govern edits too: a new story still needs a
   real-user `As a …, I want …, so that ….` role + Acceptance Criteria + Test Cases; a split or added
   task obeys the task-granularity rules (no separate test/docs tasks, don't over-split, split on
   repo/discipline); the allowed-section set and omit-empty rules still hold. If the merged config is
   present, a task you add or re-discipline honors its repo→discipline map / vocabulary, and any new or
   re-worded content stays in its `## Output language` (default English) — the revised breakdown keeps
   one consistent language.
4. **Research only when the change needs new content** it can't derive locally — e.g. "add tasks to
   implement X" — using step 3's research sources (read the code/Jira, read-only). Pure structural or
   prose edits (remove, rename, re-word, re-wire) stay **local**, no Jira/network round-trip. An
   unknown becomes an `## Open questions` entry — never an invented requirement. **New content is
   verified like fresh content:** a task you add states what the *code* shows, not what the revise
   instruction's wording asserts — run step 3's **list → verify → classify → act** over its
   load-bearing claims and flag a contradicted or unverifiable one as an open question. The loop's
   other parts don't apply to a revise: **no stop-and-ask, no fan-out, no `Verification:` line** —
   step 7's change summary is where the verification reports.
5. **Keep keys and edges intact.**
   - **Keys are stable.** Never renumber an existing `E#`/`S#`/`T#`/`B#`. A removed key is **retired**
     — do not reuse it; a new node takes the next free number.
   - **Edges stay consistent.** Removing a node drops its edges; splitting re-wires `blocks`; the MD's
     `Blocks:` / `Is blocked by:` lines and the JSON's directed edges must agree, and edges stay
     deduped (see the guide's *JSON graph output* rules).
   - **Targeted, not a re-groom.** Touch only what the change implies plus its unavoidable key/edge
     consequences. Do **not** reshuffle or re-word untouched nodes — that preserves determinism for
     everything the user didn't ask to change.
6. **Re-emit all three files** into the location step 1 resolved (the folder or the legacy-flat path —
   **not** unconditionally the folder), with the same content shape step 5's output uses: rewrite the
   resolved `<ID>-groomed.md`, rewrite the resolved `<ID>-groomed.json` (and its mermaid
   `## Diagram`), and **regenerate the resolved `<ID>-groomed.html` with the same shell concat** — the
   HTML is a pure derivative of the JSON and can only be rebuilt, never patched. Keep the version stamp
   (current version, unchanged mode word).
7. **Self-verify, then report the delta.** Two layers, same as a fresh groom:
   - **Graph invariants** — best-effort, `node`-optional (like the `.html` step): if `node` is
     available, run `node "$SKILL/scripts/check-graph.mjs"` on the resolved `<ID>-groomed.json`
     and `<ID>-groomed.md` (the folder paths, or the legacy flat paths — whichever step 1 found;
     substitute this skill's base path for `$SKILL`) and fix any violation it prints
     before presenting; if `node` can't run, just eyeball the same invariants (every edge/`epicId`
     resolves, keys unique, MD blockers match the JSON edges) — never block the revise on the checker.
   - **Prose contract** — run `references/review-checklist.md` over the **parts the revise
     touched** (edited/added nodes and any section it rewrote — an untouched story doesn't need
     re-scanning), with the same one-bounded-fix-pass rule as step 6 of a fresh groom.

   Then print a short change summary (added / removed / edited / re-wired, by key — **plus
   anything step 4's verification changed or flagged** on the content you added) followed by the
   updated markdown, and **end the message with the same closing block a fresh groom uses** (step
   5): the resolved location's file paths last, plus the nothing-written-to-Jira note.

## Add the tasks layer (`/groomie:tasks`)

`/groomie:stories <source> …` produces an epic + user stories and **stops** — no technical tasks. When
the user later wants the tasks that build those exact stories **without re-grooming** (a fresh
`/groomie <ID>` overwrites everything and can reshuffle the stories), run `/groomie:tasks <ID>`.
It is the **stories → full upgrade**: it **adds** the tasks layer while keeping the epic and every
story byte-for-byte. This is the **only** path that turns a stories breakdown into a full one
without re-grooming; `--stories` mode itself is unchanged.

It is a **revise-class flow** — load the existing breakdown, preserve keys and edges, re-emit the
three files — not a fresh groom. Do NOT run steps 1–6; run this:

1. **Resolve + guard.** Get the breakdown id. Locate `<ID>/<ID>-groomed.{md,json}` — folder first,
   legacy-flat fallback, the **same resolver as revise/push**; both files must be present together
   at one location. If the pair isn't found, **stop** and tell the user to run
   `/groomie:stories <ID>` (or `/groomie <ID>`) first — never groom a fresh breakdown here.
2. **Load the current state.** Read the `.md` and `.json` as one model (JSON = graph, MD = prose).
   Note the existing `T#` keys and, per story, **whether it already has a blocking task** (a
   `blocks` edge whose target is that story, i.e. the story's `Is blocked by:` list is non-empty).
3. **Research & verify the code.** Run the **step 3** *Research & verify the feature* loop to the
   full depth the environment allows — read the actual code so tasks are grounded in reality, and
   verify every technical claim a task would inherit (contradictions and unverifiable claims become
   `## Open questions`, exactly as a full groom). Tasks mode is not a structural edit; it needs the
   same code research `--full` does, which is why it is a separate command from a plain revise.
4. **Generate tasks for uncovered stories only — top-up.** For **every story that has no blocking
   task**, produce the `[Discipline]` tasks that build it under the task-granularity rules
   (`references/breakdown-guide.md` → *Technical tasks*): imperative `[Discipline] <verb …>` titles,
   `Implementation` + `Done when`, split on repo/discipline, tests/in-repo docs inside the task. Wire
   `Blocks:` (the story it enables — and any task→task sequencing) and `Is blocked by:` both ways,
   and add the matching story-side `Is blocked by:` line. Honor the merged config (repo→discipline,
   disciplines, granularity, output language). **Stories that already have a task are left exactly
   as-is** — do not re-word or re-wire them. New tasks take the **next free `T#`**; a retired key is
   never reused.
5. **Flip the mode to `full`.** The breakdown now carries tasks, so set the JSON `mode` to `full`
   and the version-stamp word to `full`. **If the breakdown is already `full`:** don't re-groom the
   task layer — top up only the stories that still lack a task (if any) and keep mode `full`; if
   **every** story already has a blocking task, change nothing and report *"already full — every
   story has a task; nothing to add."*
6. **Re-emit all three files** into the location step 1 resolved (folder or legacy-flat — not
   unconditionally the folder): rewrite the `.md`, rewrite the `.json` (and its mermaid
   `## Diagram`), and **regenerate the `.html`** with the same shell concat. Keys stable, MD
   `Blocks:` / `Is blocked by:` and JSON edges in agreement, deduped — the revise re-emit rules
   verbatim. Keep the version stamp (current version, mode now `full`).
7. **Self-verify, then report the delta.** Same two layers as revise step 7: the **graph
   invariants** (`node "$SKILL/scripts/check-graph.mjs"` on the resolved pair, best-effort — eyeball
   if `node` can't run) and the **prose checklist** (`references/review-checklist.md`) over the
   **added tasks** and any section rewritten, one bounded fix pass. Then print a short summary
   (`added T# — <title>  blocks S# …`, plus anything the step-3 verification flagged) followed by the
   updated markdown, and **end with the standard closing block** (step 5): the resolved location's
   file paths last, plus the nothing-written-to-Jira note.

Read-only against Jira. Run in the main thread (or dispatch the `groomie` agent); never a
general-purpose subagent.

## Configure by conversation

Groomie's per-project customization (`references/breakdown-guide.md` → *Per-project config*) is a
config file — but the user should **never hand-edit it**. When the user wants to set or change a
preference — invoked as `/groomie:config <what they want>` or just phrased as a customization request
("groom in Turkish", "the panel repo is Frontend", "API specs go to Confluence as their own task",
"prefer bigger tasks") — **you write the config for them.** No Jira key is needed; this touches only
local config files, never Jira. Run this:

1. **Read the current effective config, and where each setting lives.** Load the **merged** config:
   the global `~/.groomie/config.md` with the per-project `groomie.config.md` (cwd or its git repo
   root) layered on top (scalar settings: per-project wins else global; list settings: union with
   per-project overriding same-key global — see the guide's merge rule). Note **which file currently
   holds each setting**, because that determines where a write actually takes effect (step 3). Apply
   the change on top of what's already there — never clobber sections the user didn't mention.
2. **Interpret the request** into one or more settings from the documented schema: **output language**,
   **repo → discipline** entry, **disciplines** vocabulary, **personas** vocabulary,
   **documentation policy**, **granularity**.
   If it maps to none of these, or is ambiguous, ask **one** clarifying question — never write a
   guessed or empty config.
3. **Choose the file so the change actually takes effect (never a silent no-op).** Start from the
   **default scope by nature**: **global** (`~/.groomie/config.md`) for output language, granularity,
   documentation policy (cross-project preferences); **per-project** (`groomie.config.md` in cwd / git
   root) for the repo → discipline map, disciplines vocabulary, and personas vocabulary (specific
   to this repo set / product). The user
   may **override** in words: "just for this project" ⇒ per-project; "for all projects" / "everywhere"
   ⇒ global. **Then correct for shadowing** using what step 1 found: because a per-project **scalar**
   value always wins the merge, if the setting already lives per-project, writing it to the global
   file would have **no effect** — so write it where it actually takes effect (per-project), rather
   than writing global and falsely reporting success. The **same holds per entry** for list settings:
   a global write of a repo→discipline entry whose key already has a per-project override is shadowed
   by that per-project entry, so write the entry where it takes effect. If the user *explicitly* forces
   a scope that the other file shadows, do the write **and warn** which value is still in effect until
   the shadowing one is removed.
4. **Write the target file for the user.** Create `~/.groomie/` and the file if missing; **preserve
   every other section** already in that file, and emit valid config markdown in the schema the guide
   documents (a `# Groomie config` H1 + the relevant `##` sections). For a **scalar** setting, set that
   section's single value; for a **list** setting (repo → discipline, disciplines, personas), **add or update the
   one entry inside the existing section** — never rewrite the whole list, so other entries survive.
   Keep example/other values intact.
5. **Confirm in one line** what was set and the **file it actually took effect in** (plus any shadow
   warning) — e.g. `Set Output language = Turkish (global) · mapped panel → Frontend (this project).`
   The user never opens the file. Do **not** groom here; configuring and grooming are separate acts.

## Push to Jira

`/groomie:push <ID>` writes a **finalized** breakdown into Jira via the Atlassian MCP — Groomie's
**one write action**. It is **opt-in, idempotent, and never writes before the user approves a plan
preview**. **It never modifies the source issue**: push only CREATEs Groomie's own epic(s) — split
at the boundary the guide's multi-epic rule sets — with the stories/tasks/bugs as their children,
and UPDATEs what Groomie itself created on a prior push. (The one exception is a **legacy
ledger — one written while the removed `source-as-epic`
mode existed —** whose epic maps to the source issue key from that
mode — the ledger governs, so that epic keeps updating in place; see step 3.) The source issue (when the breakdown has a
Jira source) is only **linked** from each created epic with a "relates to" link — the one trace push
leaves on it. Run it **in the main thread** (it needs interactive approval); never delegate it. See
the guide's *Jira write-back* section for the ledger + mapping contract. Run this:

1. **Resolve the breakdown.** Locate `<ID>/<ID>-groomed.{md,json}` (same resolution as revise —
   folder first, legacy-flat fallback). Read the **JSON as the source of truth** for the push (don't
   re-parse the `.md`). If the pair isn't found, **stop** and tell the user to run `/groomie <ID>`
   first — never groom here.
2. **Resolve the target project — once, on the first push; recorded after.** First, if **no
   Atlassian MCP is available** in this session, **stop now** — before any question or preview —
   and tell the user to connect it (a breakdown groomed from URLs/files never needed the MCP,
   but the push always does). Then: **if `jira.project` is
   already recorded** (a prior push), reuse it — never re-ask — and skip to step 3. Otherwise:
   - The breakdown **has a Jira source** — the primary one when it is a Jira issue, else the
     **first** `kind:"jira"` entry with `status: "used"` in `sources[]` — never an
     unreachable/skipped one (the same pick the per-epic "relates to" link
     uses). A legacy JSON with no `sources[]` at all (pre-multi-source — always
     Jira-primary) counts too: its `issueKey` *is* the Jira source. ⇒ ask, with that
     source's project as the default: *create the epic(s) under the source issue's project
     (`<PROJ>`), or a different project?* Confirming keeps `<PROJ>`.
   - **No Jira source** ⇒ ask for the target project key outright.
   Record the answer as `jira.project`. (Push is main-thread, interactive-only — there is no
   non-interactive branch here; a session that can't ask can't approve step 5 either.)
3. **Classify every node against the ledger** (`jira.pushed`, empty/absent on a first push): a node
   **in** the ledger ⇒ **UPDATE** its Jira key; a node **absent** ⇒ **CREATE** — so a first push
   CREATEs the epic(s), never repurposes an existing issue. (**Legacy back-compat:** a ledger written while the removed
   `source-as-epic` mode existed may map an epic node to the source issue key itself — the ledger governs, so that epic keeps classifying as UPDATE of that key; never seed a
   *new* ledger this way. The one thing that overrides the ledger: such a source-mapped epic is
   **never tombstoned** — if its node is gone from the breakdown, leave the source issue's title
   untouched, skip the `[deleted]` write, and report it for the user to resolve by hand.) Any ledger entry whose node id is **no longer in the
   breakdown** — **and not already listed in `jira.tombstoned`** — ⇒ **`[deleted]`** (this local check
   means a re-push skips an already-tombstoned issue without a live read and never doubles the prefix).
   Collect the `blocks` edges as **LINKS** (bugs have no edges — they're epic children only), plus one
   **"relates to" link per created epic** to the source issue when the breakdown has a Jira source
   (a legacy source-mapped epic gets **no** relates-to link — it *is* the source issue).
4. **Render the dry-run plan and STOP — write nothing yet.** Print it grouped, with the **fixed
   English keywords** and destructive actions flagged, e.g.:
   ```
   Push plan for PROJ-123 → project PROJ
     CREATE    epic E1, S4 (Story), T3 (Task)
     UPDATE    S1 → PROJ-457 — unchanged title
     UPDATE    T1 → PROJ-460  ⚠ drift: was "Implement the login API endpoints"
                                 → now "Implement passwordless login"
     [deleted] T9 → PROJ-462  (removed from the breakdown)   ⚠ destructive
     LINKS     T1 blocks S1 · E1 relates to PROJ-123 (source — never modified)
   ```
   Every **UPDATE** compares the node's current title against the summary the ledger recorded at
   the last push (the guide's ledger rule): a match renders as `unchanged title`; a mismatch is
   marked **⚠ drift** with the old → new titles, so an overwrite coming from a re-groom (not just
   a revise) is visible **before** approval — never discovered in Jira afterwards. A legacy bare-key
   ledger entry (no recorded summary) renders `(no recorded title — verify before approving)`.
5. **Await explicit approval.** If the user declines, make **no** Jira call and stop.
6. **Execute in dependency order** via the MCP: **epic(s) → stories → tasks/bugs → links**.
   - **First, save `<ID>-groomed.json` to disk with the step-2 `jira.project`** **before the first
     Jira write** — so the locked project is durable even if a later create fails and the run is
     retried.
   - Per node, create or update **only** summary + description per the guide's field mapping, and set
     the epic-child link on create; create any missing `blocks`(→"Blocks") links (bugs get no
     bug→story link) and — **only when missing** (skip it if the link already exists between the
     two keys, like every other link) — the per-epic "relates to" link to the source issue when
     there is one;
     prepend `[deleted] ` to each orphan's summary and add its id to `jira.tombstoned` (the
     local record step 3 reads, so a later re-push never re-tombstones it). **Never** touch
     status/assignee/sprint/other fields.
   - **The epic's description ends with a `### Dependency map`** — the epic's blocker graph as a
     fenced ```mermaid `flowchart TD` (the guide's *Fields* mapping + *Diagram (mermaid)* rules,
     same renderer as the `.md`'s `## Diagram`). Because the whole epic description is rewritten on
     every push, the map is regenerated each time and always reflects the current breakdown.
   - **After *every* Jira write that changes the ledger** — a created issue added to `jira.pushed`
     (the object form: `{ "key": …, "summary": <the title as pushed> }`; an UPDATE refreshes the
     recorded summary), or
     an orphan's id added to `jira.tombstoned` — **save `<ID>-groomed.json` to disk immediately**,
     before the next Jira call. Never batch these in memory to flush at the end: a mid-run failure
     must resume with the locked project, already-created issues as UPDATE, and tombstones not repeated.
7. **Persist + report.** Do the final save of `<ID>-groomed.json` (the ledger has been written
   incrementally in step 6; this reconciles the last state), **regenerate
   `<ID>-groomed.html`** with the same shell concat (the `jira` key is data the visualizer ignores),
   and print a short summary (created / updated / `[deleted]` keys). Call out any assumption you had
   to make that needs confirming on the real instance (issue types, epic-child field, link types,
   description format) — these are **verify-on-demo-Jira** items, not silent guesses.

If a required issue type or link type doesn't resolve on the instance, **stop and report it** rather
than inventing one — surface it as a blocker the user resolves on their Jira, never a fabricated write.

## Boundaries

- Read-only against Jira **except** the explicit, opt-in `/groomie:push`, which writes the
  epic/stories/tasks/bugs (and links) of a breakdown you produced — and only **after the user
  approves a plan preview**. It never hard-deletes or transitions an issue (a removed node gets a
  soft `[deleted] ` title), never touches non-Groomie fields (status/assignee/sprint/…), and **never
  writes to the source issue** — it holds the user's raw idea and discussion; the only trace push
  leaves on it is the "relates to" link from each created epic. Grooming,
  revising, and configuring stay fully read-only against Jira.
- One feature per run.
- No invented requirements — unknowns become open questions.
- **Run this skill in the main thread** (invoked directly / via `/groomie`). Do **not** delegate the
  grooming to a **general-purpose** subagent — a general-purpose agent grooms from its own idea of
  "grooming" and drops these rules, the references, and the asset step, which produces exactly the
  malformed output this skill exists to prevent. You MAY fan out *research* to subagents (step 3),
  but the grooming and the output stay here. If grooming genuinely must run inside a subagent (an
  orchestration flow), dispatch the dedicated **`groomie` agent**, which loads and follows this skill
  faithfully — never a bare general-purpose agent.
