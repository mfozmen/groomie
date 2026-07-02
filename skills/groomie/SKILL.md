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

Invoke as `/groomie <ISSUE-KEY> [--full | --stories | --estimate]`. If no flag is given,
use **`--full`**.

- **`--full`** (default) — epic + user stories + technical tasks. Do the deep research
  (step 3: comments, links, and the actual code) needed to write accurate tasks. Produces
  a sprint-ready breakdown.
- **`--stories`** — epic + user stories only, **no technical tasks**. Lighter and faster:
  you still research enough to understand the feature and its user-facing behavior, but
  you do not need to read the code to derive tasks. Use to see the behavior/scope quickly.
- **`--estimate`** — *experimental, development-only; do not advertise to end users.*
  Produces the full breakdown and adds a **Fibonacci** point estimate (1, 2, 3, 5, 8,
  13, …) to **each task**. Estimates are a rough first pass and **must be calibrated over
  time** against real effort — treat them as directional, not authoritative. Per-story /
  per-epic roll-up is a later addition.

## Consistency

Given the same issue, produce the **same breakdown** — do not emit a different set of
stories/tasks each run. Derive stories systematically: **one story per distinct
user-facing behavior** the feature implies, in the order they appear, using the canonical
`As a … I want … so that …` phrasing. Don't rename, reshuffle, or invent between runs; when
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
- Exactly **one epic** = the feature — bounded, closeable, scope clear from the title;
  body is **Description** + **Business Value** (+ an optional **Design** line for Figma /
  mockups when research surfaces them).
- **User stories** are **non-technical**, user-visible slices describing **behavior and
  needs only** — never solutions (no API/UI/design prescriptions). Title is the full
  "As a … I want … so that …" sentence; body carries required **Acceptance Criteria**
  and **Test Cases**. QA tests stories.
- **Technical tasks** are the implementation work, titled `[Discipline] …`. A task is a
  **sibling of stories, not a subtask** — it **blocks** the story (or stories) it enables
  via a link, and is **not QA-tested** (it carries `Done when`, not Test Cases). One
  foundational task may block many stories.
- **Bugs** only when the source issue reports broken existing behavior; technical or not,
  they are QA-tested like stories.
- Flag ambiguities as open questions instead of guessing.

### 5. Output markdown

Produce a single markdown document (see the shape in the breakdown guide): the epic, then
the stories (each with its acceptance criteria and test cases), then the tasks (each listing
the stories it blocks), then bugs, then a short "Open questions" section. In `--stories`
mode, omit the tasks section; in `--estimate` mode, add a Fibonacci `Estimate:` to each task.

**Save it to a file AND print it.** Write the document to `<ISSUE-KEY>-groomed.md` in the
current working directory (e.g. `PROJ-123-groomed.md`), tell the user the path, then also
print it inline so they can read it without opening the file. Do **not** write to Jira.

## Boundaries

- Read-only against Jira. Never create, edit, or transition issues.
- One feature per run.
- No invented requirements — unknowns become open questions.
