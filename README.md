# Groomie

<!-- SonarCloud metrics below cover the companion `visualizer/` app — the plugin itself is prompt-only markdown. -->
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=mfozmen_groomie&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=mfozmen_groomie)
[![Maintainability](https://sonarcloud.io/api/project_badges/measure?project=mfozmen_groomie&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=mfozmen_groomie)
[![Security](https://sonarcloud.io/api/project_badges/measure?project=mfozmen_groomie&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=mfozmen_groomie)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=mfozmen_groomie&metric=coverage)](https://sonarcloud.io/summary/new_code?id=mfozmen_groomie)

Turn a messy Jira issue into a clean, sprint-ready backlog breakdown — as markdown.

Groomie is a [Claude Code](https://docs.claude.com/en/docs/claude-code) plugin. Point it at
one badly-written, single-feature Jira issue (vague, over-stuffed, no acceptance criteria)
and it recovers the real feature underneath, researches it as deeply as your environment
allows, and hands back a structured **epic → user stories → technical tasks** breakdown you
can review and file.

> [!NOTE]
> Groomie is **read-only against Jira by default** — grooming, revising, reviewing, and
> configuring never create or edit issues; they produce markdown you stay in control of. The
> **one exception is the opt-in [`/groomie:push`](#pushing-to-jira-optional)**, which files the
> finished breakdown into Jira — and only after you approve a plan preview.

## Why

Most teams run a whole feature out of **one Jira issue**. It starts as a rough idea, then
accumulates comments, links, screenshots, and scope changes — and everything happens *inside*
that single ticket. Nobody can tell where its boundaries are: what exactly is in scope, what
"done" means, which parts block which, what QA is supposed to test. **Neither humans nor AI
agents can work with that** — a developer estimates by gut feeling, QA tests whatever it can
guess at, and an agent pointed at the ticket to "implement it" just inherits every ambiguity.

The known cure is proper grooming — a bounded epic, stories that carry acceptance criteria and
test cases, tasks with explicit blockers — but done by hand it's laborious enough that it
rarely happens. Groomie automates exactly that: it recovers the real feature from the messy
issue, researches it, and splits it into **bounded, testable, explicitly-wired pieces**.
Ambiguities aren't papered over; they surface as open questions for a human to answer.

The result is readable by people *and* consumable by machines: the markdown for your team, the
JSON graph for tooling and agents. A well-groomed breakdown is what makes agent-driven
development actually workable — each task becomes a bounded work item an agent (or a person)
can pick up, with its scope, its done-criteria, and its edges spelled out.

## Why user stories carry the sprint

The story layer is the first thing teams skip. It looks like paperwork — the epic already names
the feature, the tasks already say what to build, so why write `As a user, I want …` in between?

Because a story isn't documentation. It's the **boundary between what the user needs and how it
gets built** — and it's the only artifact the whole team can agree on without reading code. Take
that boundary away and the cost doesn't disappear. It moves into your sprint.

### What a missing story layer costs you

- **Estimates become guesses.** Nobody can size "implement the export thing". A story with
  acceptance criteria and test cases is estimable; a ticket mixing five concerns is not — so the
  sprint commitment is fiction from day one.
- **QA has to invent the test plan.** With no story to test, QA reverse-engineers intent from the
  ticket, the PR, or a developer's shoulder. Much of the coverage is guesswork, and the part that
  matters most is the part most often missed.
- **Ambiguity surfaces at the worst possible moment.** Unasked questions don't go away — they
  detonate mid-sprint, in code review, or in UAT, once the work is done and reversing it is
  expensive.
- **Rework instead of progress.** "That's not what I meant" arrives *after* implementation, and
  the team pays a second cycle to build the same feature twice.
- **Grooming and planning meetings run long.** The ticket gets decoded live, out loud, in a room
  full of people — every sprint, from scratch, because the decoding was never written down.
- **Everyone reads everything.** In one giant ticket a backend dev wades through design debates,
  QA through schema arguments, product through deployment notes. Most of it concerns nobody in
  the room.
- **Blockers show up late.** Nothing states which piece must land first, so work stalls midway
  through the sprint on a dependency someone could have named on day one.
- **"Done" stays negotiable.** With no acceptance criteria, closing a ticket is an opinion — which
  is exactly how work carries into the next sprint, and the one after that.
- **Nothing ships partially.** When a sprint slips, a story-shaped backlog still delivers *some
  complete behavior*. A task-shaped one delivers half of everything and none of it releasable.

### Who owns what

Stories and tasks split responsibility along a clean seam. Groomie doesn't enforce any process —
it produces the artifacts that make this way of working possible, and plenty of teams run it
differently:

| Role | Owns | What that means |
|---|---|---|
| **Product** | the story's intent | Requests arrive as **behavior and need**, never as a solution — "the user can reset their password", not "add a reset endpoint". |
| **QA** | the story's verification | Tests **stories and bugs — never tasks**, and releases on them. The acceptance criteria and test cases *are* the test plan, so QA never has to read code to work out what to verify. |
| **Developers** | the technical tasks | Own the implementation end to end: review it, test it, close it themselves. No product sign-off on an implementation detail, no QA gate on a refactor. |

The story becomes the whole team's shared object — product wrote it, QA verifies it, developers
deliver it — while the technical work stays entirely with the people qualified to judge it.

### What that buys you

- **Focus.** Each role reads the layer that concerns them. A `[Backend]` task is one team's
  problem; the story above it is everyone's.
- **Shorter meetings.** Grooming stops being a live decoding session. The breakdown arrives
  already written, so the meeting only has to resolve the open questions.
- **Parallel work.** Tasks split by discipline and wired with explicit blockers can start at the
  same time — and the ones that genuinely can't are *visibly* blocked rather than silently stuck.
- **Fewer round trips.** Ambiguity becomes an open question *before* code is written, when
  answering it costs a sentence instead of a sprint.
- **A real definition of done.** A story closes when its acceptance criteria pass — not when
  someone feels it's finished.
- **Release notes for free.** A finished sprint's stories already read as user-facing changes,
  because that is exactly what a story is.

Groomie's part is only the structure: stories that stay behavioral, tasks that carry the HOW, and
explicit `blocks` edges between them. Who reviews, gates, and signs off what is your team's
process — and the parts Groomie can adapt to it live in
[`groomie.config.md`](#configuration-optional).

## What you get

- **Epic(s)** — the feature, bounded and closeable, with a `Description` + `Business Value`;
  the title **leads with a verb** (`Add` / `Enable` / `Migrate` …) so it reads as the work to
  be done, not a label.
- **User stories** (`S1`, `S2`, …) — user-facing behavior only, written as
  `As a <role>, I want <capability>, so that <benefit>.`, each with **acceptance criteria**
  and **test cases**. (A pure technical migration has no stories — Groomie won't invent them.)
  Stories never carry solution detail — no menu placements, no technical field names, no
  prescribed interaction sequences, no source-ticket numbering, no widget names — and the
  `<role>` is never an invented job title (your configured personas, a role your tickets and
  existing stories actually use, or plain "user").
- **Technical tasks** (`T1`, `T2`, …) — `[Discipline]`-tagged implementation work with a
  detailed plan, wired to what they **block** / are **blocked by** (Jira link terms).
- **Bugs** — structured `### B#` sections (reproduce steps / expected / actual), filed as epic
  children; whether one blocks a story is left to QA in Jira.
- **Open questions** — anything the ticket leaves ambiguous or contradictory (scope ownership,
  unconfirmed placements, ticket-vs-code mismatches) becomes an explicit question at the end of
  the breakdown for you to resolve before filing — Groomie never papers over a gap with an
  invented requirement. This is also where **verification** lands: a ticket claim the code
  contradicts is listed with both readings, and a load-bearing claim nothing could confirm is
  listed as unconfirmed rather than quietly written in as fact.

The whole breakdown is saved to `<ISSUE-KEY>/<ISSUE-KEY>-groomed.md` — each groom lands in its own
per-issue folder named for the key, so repeated runs don't pile up loose in one directory — and
printed for you. The markdown ends with a **mermaid diagram** of the blocker graph (renders on GitHub,
VS Code, and other markdown viewers). Two more files are written into the same per-issue folder: a
machine-readable **`<ISSUE-KEY>-groomed.json`** graph, and a standalone **`<ISSUE-KEY>-groomed.html`** — the interactive visualizer (below) with
your breakdown baked in: epics as containers, stories/tasks/bugs nested, blockers as arrows.
**Offline, double-click to open, no server or install.**

![The Groomie visualizer: a purple epic container holding blue tasks, green stories and a red bug, with blocker arrows, and a details panel on the right.](docs/visualizer.png)

<sub>The `<ISSUE-KEY>-groomed.html` output on synthetic demo data (Jira-default colours — epic purple, story green, task blue, bug red). Click a node for its acceptance criteria, tasks, or repro.</sub>

## Requirements

- **Claude Code.**
- **Atlassian MCP** connected to your Jira — the one hard dependency; all Jira access goes
  through it (reading the issue, and the opt-in `/groomie:push` writes).
- *Optional:* any research capability in your session (a code/knowledge-base MCP, web search,
  subagents). Groomie detects what's available and digs accordingly — none of it is required,
  and nothing is company-specific.

## Configuration (optional)

Groomie works with zero configuration. To customize it, **just talk to it** — run
**`/groomie:config <what you want>`** and Groomie writes the config for you; you never hand-edit a
file:

```
/groomie:config outputs in Turkish
/groomie:config the panel repo is Frontend
/groomie:config our personas are Marketer and Store Admin
/groomie:config API specs go to Confluence as a separate task
/groomie:config prefer fewer, larger tasks
```

**Output language** pins the language of the groomed breakdown — **default English**. It's decoupled
from the conversation: Groomie keeps talking to you in your own language and only writes the *output*
in the configured one (the structure — keys, `[Discipline]`, blockers, headings — stays fixed).

Config lives in two places: a **global** `~/.groomie/config.md` (applies to every project — a natural
home for output language) and a per-project **`groomie.config.md`** at your repo root, layered on top.
Per-project wins for single-value settings (output language, granularity, docs policy), and for the
list settings (repo→discipline, disciplines, personas) it overrides only the matching entry — so a
per-project section never erases the rest of your global map. Everything is optional — set nothing and Groomie
behaves exactly as it does by default. The full set of settings (output language, repo→discipline map, disciplines, personas, documentation
policy, granularity) is what `/groomie:config` writes for you; the format is documented in
[`docs/groomie.config.example.md`](docs/groomie.config.example.md) if you ever want to hand-edit:

```markdown
# Groomie config

## Output language
- English

## Repo → discipline
- api-service → Backend
- web-frontend → Frontend
- mobile-app → Mobile
- data-pipeline → Data

## Disciplines
- Backend
- Frontend
- Mobile
- Data

## Personas
- Marketer
- Store Admin

## Documentation policy
- API specs are published to Confluence as a separate task.

## Granularity
- Prefer fewer, larger tasks; consolidate same-repo/same-discipline work.
```

With this, a task whose work lands in a mapped repo gets the right `[Discipline]` from the map instead
of a guess, story roles come from **your** persona vocabulary, your docs/granularity conventions are
honored, and output is written in your language. A repo you don't list still gets an inferred
discipline — nothing breaks. Without a `## Personas` section, story roles are a name your tickets or already-filed stories
actually use (Groomie checks the project's backlog opportunistically, when its research tools
allow), or plain "user" — Groomie never guesses a job title.

## Install

```
/plugin marketplace add mfozmen/groomie
/plugin install groomie
```

## Usage

```
/groomie PROJ-123            # full breakdown (default): epic + stories + tasks
/groomie:full PROJ-123       # same, explicit
/groomie:stories PROJ-123    # quick: epic + user stories only (behavior/scope, no tasks)
/groomie:tasks PROJ-123      # add the tasks layer to a stories breakdown (stories → full)
```

Pick the mode by **subcommand** (`/groomie:full`, `/groomie:stories`) or just run `/groomie`
for the default full breakdown. Full reads the code to write accurate technical tasks; stories
skips tasks for a faster, behavior-only pass. (The old `--full` / `--stories` flags still work.)

Ran `/groomie:stories` first and now want the tasks that build those exact stories?
**`/groomie:tasks PROJ-123`** is the upgrade: it reads the code, adds `[Discipline]` tasks for the
stories that don't have one yet, wires the blockers, and leaves the epic and stories untouched —
no re-groom, no reshuffle. It tops up only what's missing (idempotent), and flips the breakdown
from stories to full.

### Revising a breakdown

Not happy with something Groomie produced, or need to add or drop a piece? Revise it in place —
no re-groom, no reshuffle:

```
/groomie:revise PROJ-123 split T3 into two tasks
/groomie:revise PROJ-123 remove S2
/groomie:revise PROJ-123 add a [Frontend] task for the empty-state
/groomie:revise PROJ-123 the epic's business value is wrong — it's X
```

Revise reads your existing `PROJ-123/PROJ-123-groomed.{md,json}` (or the legacy flat
`PROJ-123-groomed.{md,json}`, for breakdowns groomed before the per-issue folder), applies just that change under the same
rules (existing `S#`/`T#` keys stay stable, blockers stay consistent), and re-writes all three
files — the markdown, the JSON graph, and the `.html`. Groom the issue first if you haven't yet.

### Reviewing a breakdown

Every groom (and revise) **ends with an automatic self-review**: Groomie re-reads its own
output against the grooming contract — the story leak scan (no menu placements, no technical
field names, no interaction sequences, no ticket numbering, no widget names), epic/task/bug
shape, sections, and the diagram — and fixes what it finds in one bounded pass before
presenting. You can also run that same pass standalone, e.g. on a breakdown produced earlier:

```
/groomie:review PROJ-123
```

It reports what it fixed (or that the breakdown is clean), never pushes to Jira, and warns
you if a previously pushed breakdown now differs from Jira.

### Pushing to Jira (optional)

When the breakdown is final, push it into Jira:

```
/groomie:push PROJ-123
```

This is Groomie's **one write action** — everything else is read-only. It always shows a **plan
preview** (what it will `CREATE` / `UPDATE` / mark `[deleted]`, plus the links) and **waits for your
approval** before writing anything. It's **idempotent**: re-pushing updates the same issues in place —
Groomie remembers what it created (a ledger inside the `.json`), so it **never makes duplicates**. A
node you removed from the breakdown gets a soft **`[deleted]`** prefix on its Jira title — Groomie
**never hard-deletes or transitions** an issue, and never touches status, assignee, or sprint. It asks
once whether to turn the source issue into the epic or create a fresh one.

The pushed **epic carries the dependency map**: its description ends with a `### Dependency map`
section — the same blocker graph as the breakdown, as a mermaid diagram — so the map lives on the
epic itself and is refreshed on every push. It renders as a diagram where your Jira supports mermaid
(a rendering app), and as a readable code block otherwise. (The interactive `.html` visualizer can't
be embedded in Jira — the Atlassian MCP has no way to attach a file or image — so the map ships as
text that always survives.)

## What the output looks like

```markdown
# Epic: Add Dark Mode

**Description:** Let users switch the app between light and dark themes.
**Business Value:** Reduces eye strain and matches OS preference, a top-requested setting.

## Stories

### S1 — As a user, I want to switch between light and dark themes, so that the app matches my preference.

**Acceptance Criteria**
- The theme can be switched from settings.
- The chosen theme persists across sessions.

**Test Cases**
- Toggle to dark → every screen renders in dark theme.
- Reload the app → the last chosen theme is still applied.

**Is blocked by:**
- T1 — Persist the user's theme preference
- T2 — Theme toggle + dark palette

## Tasks

### T1 — [Backend] Persist the user's theme preference
...
**Blocks:**
- S1 — As a user, I want to switch between light and dark themes …

### T2 — [Frontend] Theme toggle + dark palette
...
**Blocks:**
- S1 — As a user, I want to switch between light and dark themes …
```

## How it works

1. **Fetch** the issue from Jira (summary, description, comments, history, links).
2. **Research & verify** — follow the links and, when a codebase is reachable, read the actual
   code. The ticket's claims are treated as **unverified**: Groomie checks the load-bearing ones
   against the code, the links, and the comments, grooms what is actually true rather than what
   the ticket asserts, and turns contradictions into open questions — stopping to ask you only
   when a contradiction invalidates the ticket's premise (the feature already exists, the named
   system is gone, the "bug" isn't broken).
3. **Groom** it into the epic / stories / tasks breakdown.
4. **Save & print** the markdown (with a mermaid diagram), and write the JSON graph plus a
   standalone interactive `<ISSUE-KEY>-groomed.html` (offline, double-clickable) next to it — all
   under a per-issue `<ISSUE-KEY>/` folder.
5. **Self-review** the finished output against the grooming contract (the leak scan, shapes,
   sections, diagram), fix violations in one bounded pass, and close the message with the saved
   file paths.

---

What's next? See the [roadmap](docs/ROADMAP.md). Contributing? See [CONTRIBUTING.md](CONTRIBUTING.md).
Licensed under [MIT](LICENSE).
