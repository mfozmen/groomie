# Breakdown guide

The rules Groomie applies when grooming a feature. This is the reference; keep it
opinionated and update it as the user's preferences become clear.

## The hierarchy

```
Epic  (the feature — usually one)
 ├─ Story S1   — non-technical · QA-tested   "As a <role>, I want …, so that …."
 ├─ Story S2   — non-technical · QA-tested
 ├─ Task T1    — technical · not QA-tested   ──blocks──▶  S1
 ├─ Task T2    — technical · not QA-tested   ──blocks──▶  S1 + S2
 ├─ Task T3    — technical · not QA-tested   ──blocks──▶  S2
 └─ Bug B1     — technical or non-technical · QA-tested   (affects a story)
```

**Stories and tasks are siblings under the epic — a task is never a *subtask* of a
story.** They are distinct issue types linked only by `blocks`: stories are the
non-technical, user-facing behavior; tasks are the technical work that builds them, so
technical tasks block the stories they enable. This split drives QA: **stories are tested
by QA** (their Test Cases are what QA runs), **tasks are not** (they carry `Done when`
instead). One foundational/infrastructure task can block **many** stories (a global
blocker). Bugs are QA-tested whether they are technical or not.

## Epic

- **Usually one epic — it IS the feature.** Most issues are one feature → one epic.
  Produce **multiple epics only when the issue genuinely spans more than one distinct,
  independently bounded feature** (each one closeable on its own). Also add a second
  *Infrastructure* epic only when the feature needs substantial groundwork of its own
  (e.g. standing up a whole new microservice) — never for small setup, which is a task.
  Story/task keys (`S1`/`T1`) are unique across the **whole document** — numbering does not
  restart per epic — so every `Blocks:` / `Is blocked by:` reference is unambiguous.
- **Bounded & closeable.** An epic's scope must be finite — a coherent chunk of work
  that can realistically be completed in a defined timeframe (a few sprints, not
  "forever"). If it can never be marked "done", it's a theme, not an epic — split it.
- **The title must make that bounded scope self-evident.** Reading the title alone
  should tell you what is in scope and when it is finished. Prefer a *qualified*
  capability over an open-ended umbrella:
  - ✅ "Traditional Authentication", "SSO Integration", "Book Discovery System"
  - ❌ "Authentication", "Books", "User System", "Platform" (never close)
- **Body:** two required lines — `**Description:**` (what it implements, one sentence)
  and `**Business Value:**` (why it matters, one sentence) — plus an optional
  `**Design:**` line linking the Figma / mockups **when research surfaces them** (omit the
  line entirely if there are none). Nothing else.
- **No acceptance criteria on the epic** — stories carry the AC.
- No task list or stories inline — those are separate issues under the epic.

## User stories

- **Only when there's a user-facing behavior change.** Stories exist to capture behavior.
  If the feature changes no user-facing behavior — a pure technical migration, refactor, or
  infra work — it has **no stories**: emit the epic + tasks only. **Not every epic has
  stories.** Never fabricate operator / "system" / consumer stories to fill the layer, and
  **omit the `## Stories` section entirely** when there are none. Don't force it.
  - A **technical outcome dressed as a story is not a story.** These are the tell-tale anti-patterns
    — none of them is a story:
    - ❌ "The snapshot is queryable in the primary store" (a data-layer outcome)
    - ❌ "Existing records are backfilled safely in one pass" (an operator/migration step)
    - ❌ "The backfill is verifiable and reversible" (a task's `Done when`, not a user need)
  - If nothing rephrases into a genuine `As a <real user>, I want …, so that ….` behavior, the
    honest answer is **zero stories** — a backfill/migration is epic + `## Tasks` + `## Open
    questions`.
- Vertical, user-visible slices — **non-technical**, describing what the user experiences.
  Each delivers something a user (or operator/admin) can perceive. If a "story" has no
  user-visible outcome, it's probably a task. **QA tests stories** — the Test Cases below
  are the basis QA runs.
- **Use a real product persona — someone who actually uses what we are building.** The
  `<role>` must be an actual user of *our* product (e.g. the marketer / campaign editor /
  admin / operator on the sending side). The **end recipient / consumer of an outbound
  artifact is not our user** — never write a story from their point of view. Reframe that
  value from our user's perspective:
  - ❌ "As an email recipient, I want the email delivered as multipart …"
  - ✅ "As a campaign editor, I want my email delivered as multipart, so that recipients on
    any client see a readable version."
- **The title IS the story sentence:** `As a <role>, I want <capability>, so that <benefit>.`
  — **comma before *so that*, and a period at the end.** Give each story a Jira-style key
  `S1`, `S2`, … (a local placeholder for the Jira key assigned on filing) and put it in the
  heading. The title alone must convey the work — keep it within Jira's 255-char summary
  limit and readable; tighten the wording rather than let it sprawl. If it won't fit or reads
  as two things at once, the story is too big — split it.
- **Behavior and needs ONLY — never prescribe the solution.** A story says what the user
  needs and how the system should behave from their point of view. It must NOT direct
  engineering or design *how* to build it — no API/tech choices, no UI component names, no
  design directives.
  - ❌ "Build a REST endpoint for registration", "Add a drawer", "Disable the submit
    button", "Use a modal"
  - ✅ "The user can register with email and password", "The user cannot submit until the
    required fields are valid", "The user sees clear feedback when registration fails"
  - The HOW (REST API, drawer, Unity screen, mockups) lives in **tasks**, owned by the
    producing teams.
- **Body carries, in order:**
  - a one-line description of the capability (link PRD / business-analysis / background
    docs when they exist);
  - **Acceptance Criteria** — required. Concrete, outcome-level, checklist bullets.
  - **Test Cases** — required. Concrete `input → expected result` scenarios, including the
    key failure cases (invalid input, duplicates, edge conditions).
- **One responsibility per story — follow INVEST.** Each story is Independent, Negotiable,
  Valuable, Estimable, Small, and Testable, and covers **exactly one user capability**. If a
  story bundles two things — "edit **or** delete", "create **and** manage" — split it into
  separate stories (one to edit, one to delete). **Split whenever each resulting story stays
  independently valuable and testable** — but don't shatter one capability into
  non-independent slivers. A story needing a dozen tasks is really several stories.
- Each story states **`Is blocked by:`** the tasks that build it — **one reference per line
  as `- <key> — <title>`** (title-carrying, not the bare key; a per-line list stays
  unambiguous even though the titles contain commas). This is Jira's "is blocked by" link:

  ```
  **Is blocked by:**
  - T1 — Implement the generate-plaintext endpoint
  - T4 — Build the generate UI
  ```

## Technical tasks

- **Technical** implementation work that builds a story — this is where the HOW lives (the
  opposite of stories): tasks name the APIs, tables, screens, and components, with concrete
  steps. A task is **not a subtask of a story** — it's a distinct issue linked to the
  story by `blocks`. Tasks are **not QA-tested** (that's why they carry `Done when`, not
  Test Cases).
- **Title — imperative and one responsibility:** `[Discipline] <imperative action>` — a
  clear, complete instruction starting with a verb, e.g. `[Backend] Implement the JWT
  authentication service`, `[Backend] Create the login API endpoints`, `[Graphic Design]
  Design the login screen mockups`, `[Game Dev] Implement the login UI and session
  management` — **not a terse note.** The `[Discipline]` prefix is **required** (it routes
  the work to the producing team — we don't rely on Jira fields). Infer disciplines per
  project; common ones are Backend, Frontend, Graphic Design, Game Dev.
- **One responsibility per task — sized to a real unit of delivery, not sliced per step.** A
  task is one coherent piece of work that one discipline can ship on its own. **Split along
  boundaries that need separate ownership, review, or CI — a different repository or a
  different discipline is always its own task.** But do **not** shatter a single
  responsibility into micro-tasks: the schema, the endpoints that use it, and their tests —
  same repo, same discipline — are **one** Backend task, not three or four. Every task
  carries real PR/CI overhead (pipelines can be long), so each must be worth its own cycle;
  **prefer a few well-scoped tasks over many tiny ones.** Split only when the work crosses a
  repo boundary, a discipline boundary, or bundles two genuinely independent deliverables —
  never just to make tasks smaller. Example: registration is a **Backend** task (schema +
  email-verification + REST endpoints + their tests, one repo) and a **Frontend/Game Dev**
  task (the UI) — plus a **Graphic Design** task only if mockups don't already exist — not
  five micro-tasks.
- **Testing and in-repo documentation belong *inside* the task, not as separate tasks.** The
  engineer writes the tests and updates in-repo docs (README, code comments, in-repo API
  docs) as part of doing the work — record them in **`Done when`** (e.g. "unit tests cover
  the new endpoints", "README updated"), never as a standalone `[QA] Write tests` or
  `[Docs] Update docs` task. **Exception:** documentation that must be produced **outside the
  repo** — e.g. a Confluence page — *especially when a company-wide process requires it* —
  may be its own task, since it's a distinct deliverable in another system.
- **Tasks are implementation work only.** Never emit a coordination, sign-off, decision, approval,
  or meeting task (no `T0 — Decision & coordination`), and **never name a person** (no
  `Get sign-off from <name>`). An unresolved decision — which table to use, whose approval is
  needed, which endpoint is correct — is an **open question**, not a task. A task tells one
  discipline what to *build*.
- **Body — detailed, step by step:**
  - **Implementation** — concrete technical steps, detailed enough that the engineer can
    follow them without re-deriving the design.
  - **Done when** — completion criteria (what must be true for the task to be done).
- **Cover every discipline the story needs.** Backend and Frontend tasks are the core —
  produce them wherever the story touches them. Add a **Graphic Design** task (mockups /
  Figma) only when the design does not already exist; if research finds finished designs,
  skip it (reference them instead) rather than re-opening design work. If you can't tell
  whether the design exists, raise it as an open question.
- **Give each task a Jira-style key** `T1`, `T2`, … and state its links **both ways**, in
  Jira's terms, **one reference per line as `- <key> — <title>`** (title-carrying, never a
  bare key):
  - **`Blocks:`** — what it enables: the stories it unblocks (or, in a **story-less epic**,
    the tasks it must precede). A foundational task lists them all.
  - **`Is blocked by:`** — the tasks that must be done first. Omit the field when there are
    none.

  ```
  **Blocks:**
  - S1 — As a campaign editor, I want to generate a plaintext version, so that …
  **Is blocked by:**
  - T2 — Implement the HTML→plaintext converter
  ```
- A story is not "doable" until its blocking tasks are done. **Only when the epic has
  stories:** a task that blocks nothing is a smell — a missing story, or out of scope; call
  it out. Foundational / infrastructure tasks are **global blockers** — they block a whole
  set of stories (and often other tasks); mark them clearly.
- Keep each task independently completable and estimable. Split when a task crosses a
  repo/discipline boundary or bundles two genuinely independent deliverables — not merely to
  make it smaller.

## Estimation (experimental, development-only)

Only in `--estimate` mode. Add a Fibonacci point estimate to **each task** (never to
stories or the epic) as an `**Estimate:**` field:

```markdown
### T1 — [Backend] <imperative action>
...
**Blocks:**
- S1 — <story title>
**Estimate:** 5   <!-- Fibonacci: 1, 2, 3, 5, 8, 13, 21 -->
```

Base the number on task complexity + how much code it touches. These are a **rough first
pass** — Groomie cannot judge real effort accurately yet, so they must be **calibrated over
time** against actuals. Treat them as directional. Per-story / per-epic roll-up (summing
task points) is a planned later addition. Do not surface this mode to end users yet.

## Bugs

- Only when the source issue actually reports existing behavior that is broken.
- A missing feature is a story/task, not a bug.
- A bug may be **technical or non-technical** — either way it is **QA-tested** (like a
  story), so it does not matter which; give steps to reproduce, expected vs actual (the
  repro + expected/actual is the bug's QA basis — its equivalent of a story's Test Cases).
- **Give each bug a key `B1`, `B2`, …** (like `S#`/`T#`) and link it to the story it affects
  with `affects: S1`, so it's traceable in the diagram (`B# -.-> S#`).

## Open questions

Anything ambiguous in the source issue becomes an explicit open question — never a
silently invented requirement. List them at the end so the user can resolve them before
the work is filed.

## Output shape

```markdown
# Epic: <bounded capability name>

_groomie v<version> · <mode> breakdown_   <!-- version from .claude-plugin/plugin.json; mode = full|stories|estimate; see SKILL.md step 5 -->

**Description:** <what the feature implements — one sentence>

**Business Value:** <why it matters — one sentence>

**Design:** <Figma / mockup links>   <!-- optional; omit the line if research found none -->

## Stories   <!-- omit this whole section when there's no user-facing behavior change -->

### S1 — As a <role>, I want <capability>, so that <benefit>.

<one-line description; link PRD / background docs if any>

**Acceptance Criteria**
- ...

**Test Cases**
- <input> → <expected result>
- <failure case> → <expected result>

**Is blocked by:**
- T1 — <task title>
- T2 — <task title>

---

### S2 — As a <role>, I want <capability>, so that <benefit>.

...

**Is blocked by:**
- T3 — <task title>

## Tasks

### T1 — [Backend] <imperative action>

**Implementation**
- ...

**Done when**
- ...

**Blocks:**
- S1 — <story title>

---

### T2 — [Frontend] <imperative action>

...

**Blocks:**
- S1 — <story title>

---

### T3 — [Backend] <foundational imperative action>

**Implementation**
- ...

**Done when**
- ...

**Blocks:**
- S1 — <story title>
- S2 — <story title>   <!-- one task can block many stories -->

## Bugs   <!-- omit this section if there are none -->

- **B1 — <title>** — repro / expected / actual · affects: S1

## Open questions

- ...

## Diagram

(a mermaid flowchart TD block — see the "Diagram (mermaid)" section below; omit if no nodes)
```

The samples in `examples.md` are the source of truth for the shape of each individual
epic / story / task — when they differ from this skeleton, the samples win. This skeleton
only shows how the pieces lay out together in one document.

**Omit every empty section.** Only include a section that has content: no user-facing
behavior change → no `## Stories`; no bugs → no `## Bugs`; no open questions → no
`## Open questions`. Never print an empty heading or a "(none)" placeholder. A pure
technical migration, for example, is often just the epic + `## Tasks` + `## Open questions`.

**Emit these sections and no others.** The allowed set is exactly: the `# Epic:` block (with its
version-stamp line), `## Stories`, `## Tasks`, `## Bugs`, `## Open questions`, `## Diagram`. Do
**not** add a `TL;DR` / executive summary / "the work, simplified", a `Locked decisions` /
decisions / evidence / rationale table, an `Epic (context)` preamble, or any narrative that
critiques, "refutes", or re-summarizes the ticket. Research shapes the *content* of the sections
above; it is never a section of its own.

**Mode deltas** (see the skill's Modes section): in `--stories` mode omit the `## Tasks`
section entirely; in `--estimate` mode each task carries an `**Estimate:**` line
(Fibonacci — see Estimation above). The version stamp's `<mode>` word follows the run:
`full`, `stories`, or `estimate`.

## Diagram (mermaid)

End the document with a `## Diagram` section containing **one fenced `mermaid` `flowchart TD`**
that renders the breakdown as a graph. Emit it only when there is at least one node.

- **One `subgraph epicN["Epic: <name>"]` per epic** (the container); the epic's story / task /
  bug nodes nest inside it. Ids `epic1`, `epic2`, … by order.
- **Nodes** use the existing keys: `S1["S1: <summary>"]`, `T1["T1: [Discipline] <summary>"]`.
  Bugs get diagram ids `B1`, `B2`, … by order.
- **Edges:** blocking is a solid directed edge from blocker to blocked — `T1 --> S1`
  (task→story) and `T2 --> T4` wherever one task must precede another (task→task sequencing,
  in any epic); a bug's `affects` is dashed, `B1 -.-> S1`. Emit each edge **once** (the markdown
  stores blocking on both endpoints — dedupe here).
- **Colour by kind** (Jira defaults) with a `classDef` block: story green, task blue, bug red;
  the epic subgraph gets a purple tint via a `style epic1 …` line.
- **Labels are short, sanitized summaries.** Take a 3–6 word gist (the "I want …" for stories,
  the imperative minus discipline for tasks; the name for epics). **Sanitize just the gist** to
  ASCII letters, digits, spaces, and hyphens — drop everything else (`"`, `#`, `<`, `>`, `,`,
  `|`, backticks), collapse whitespace, cap ~40 chars. **Then wrap it in the scaffolding** the
  sanitizer doesn't touch: the `S1: ` / `Epic: ` prefix, a task's `[Discipline]` tag, and (in
  `--estimate`) a trailing `(5)`. This avoids all mermaid escaping — because gists are short,
  lossy is fine.
- **Modes:** `--stories` → no task nodes and no `-->` edges (stories may still have dashed bug
  edges); `--estimate` → append the point to the task label, `T1["T1: [Backend] User schema (5)"]`.

```mermaid
flowchart TD
  subgraph epic1["Epic: Traditional Authentication"]
    S1["S1: Create account with email"]
    S2["S2: Reset password via email"]
    T1["T1: [Backend] User schema"]
    T2["T2: [Game Dev] Registration UI"]
    B1["B1: Verification email not sent"]
  end
  T1 --> S1
  T1 --> S2
  T2 --> S1
  B1 -.-> S1
  classDef story fill:#dcfce7,stroke:#22c55e,color:#14532d;
  classDef task  fill:#dbeafe,stroke:#3b82f6,color:#1e3a8a;
  classDef bug   fill:#fee2e2,stroke:#ef4444,color:#7f1d1d;
  class S1,S2 story;
  class T1,T2 task;
  class B1 bug;
  style epic1 fill:#f5f3ff,stroke:#8b5cf6,color:#6d28d9;
```

## JSON graph output

Alongside the markdown, write `<ISSUE-KEY>-groomed.json` — the **same graph, machine-readable**
(the visualizer's input). One flat `nodes[]` array (epics are first-class `kind:"epic"` nodes)
plus a directed `edges[]` array. Epics get JSON-only ids `E1`, `E2`, … (the markdown `# Epic:`
heading is unchanged); every non-epic node carries `epicId`. Edges are deduped.

```json
{
  "issueKey": "PROJ-123",
  "mode": "estimate",
  "nodes": [
    { "id": "E1", "kind": "epic", "title": "Traditional Authentication",
      "description": "...", "businessValue": "...", "design": null },
    { "id": "S1", "kind": "story", "epicId": "E1",
      "title": "As a user, I want to create an account …, so that ….",
      "description": "Lets new users register with email and password.", "links": [],
      "acceptanceCriteria": ["..."], "testCases": ["..."] },
    { "id": "T1", "kind": "task", "epicId": "E1",
      "title": "Design and implement user schema and database tables",
      "discipline": "Backend", "implementation": ["..."], "doneWhen": ["..."], "estimate": 5 },
    { "id": "B1", "kind": "bug", "epicId": "E1", "title": "Verification email not sent",
      "repro": "...", "expected": "...", "actual": "..." }
  ],
  "edges": [
    { "source": "T1", "target": "S1", "kind": "blocks" },
    { "source": "B1", "target": "S1", "kind": "affects" }
  ]
}
```

Rules:
- `mode ∈ full | stories | estimate`. Common node fields: `id`, `kind` (`epic|story|task|bug`),
  `title`. Non-epic nodes carry `epicId`.
- **Story:** `description` (the one-liner), `links[]` (PRD / background docs, `[]` if none),
  `acceptanceCriteria[]`, `testCases[]` (the markdown bullets, split).
- **Task:** `discipline` (from the `[Discipline]` prefix), `implementation[]`, `doneWhen[]`,
  and `estimate` **only in `--estimate`**.
- **Bug:** `repro`, `expected`, `actual`.
- **Edges** are directed **blocker → blocked**, `kind ∈ blocks | affects`, **deduped**. Derive
  `blocks` edges from **both** a task's `Blocks:` and any `Is blocked by:` (the two directions of
  the same link): task→story wherever a task builds a story, **and task→task wherever one task
  must precede another** (sequencing — in any epic, not only story-less ones). From an
  `Is blocked by:` list the **listed** node is the `source` (blocker) and the owning node is the
  `target`; from a `Blocks:` list the owning node is the `source` — both yield the same
  blocker→blocked edge, so dedup them. `affects` runs bug→story.
- **Modes:** `--stories` → no `task` nodes and no `blocks` edges (bug `affects` stays);
  `--estimate` → each task node has `estimate`. The `nodes`/`edges` arrays always exist.
