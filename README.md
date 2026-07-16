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
> Groomie is **read-only against Jira** — it never creates or edits issues. It produces
> markdown you stay in control of.

## What you get

- **Epic(s)** — the feature, bounded and closeable, with a `Description` + `Business Value`.
- **User stories** (`S1`, `S2`, …) — user-facing behavior only, written as
  `As a <role>, I want <capability>, so that <benefit>.`, each with **acceptance criteria**
  and **test cases**. (A pure technical migration has no stories — Groomie won't invent them.)
- **Technical tasks** (`T1`, `T2`, …) — `[Discipline]`-tagged implementation work with a
  detailed plan, wired to what they **block** / are **blocked by** (Jira link terms).
- **Bugs** and **open questions** — surfaced, never silently invented.

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
- **Atlassian MCP** connected to your Jira — the one hard dependency; Groomie reads the issue
  through it.
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
/groomie:config API specs go to Confluence as a separate task
/groomie:config prefer fewer, larger tasks
```

**Output language** pins the language of the groomed breakdown — **default English**. It's decoupled
from the conversation: Groomie keeps talking to you in your own language and only writes the *output*
in the configured one (the structure — keys, `[Discipline]`, blockers, headings — stays fixed).

Config lives in two places: a **global** `~/.groomie/config.md` (applies to every project — a natural
home for output language) and a per-project **`groomie.config.md`** at your repo root, layered on top.
Per-project wins for single-value settings (output language, granularity, docs policy), and for the
list settings (repo→discipline, disciplines) it overrides only the matching entry — so a per-project
section never erases the rest of your global map. Everything is optional — set nothing and Groomie
behaves exactly as it does by default. The full set of settings (output language, repo→discipline map, disciplines, documentation
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

## Documentation policy
- API specs are published to Confluence as a separate task.

## Granularity
- Prefer fewer, larger tasks; consolidate same-repo/same-discipline work.
```

With this, a task whose work lands in a mapped repo gets the right `[Discipline]` from the map instead
of a guess, your docs/granularity conventions are honored, and output is written in your language. A
repo you don't list still gets an inferred discipline — nothing breaks.

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
```

Pick the mode by **subcommand** (`/groomie:full`, `/groomie:stories`) or just run `/groomie`
for the default full breakdown. Full reads the code to write accurate technical tasks; stories
skips tasks for a faster, behavior-only pass. (The old `--full` / `--stories` flags still work.)

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

## What the output looks like

```markdown
# Epic: Dark Mode

**Description:** Let users switch the app between light and dark themes.
**Business Value:** Reduces eye strain and matches OS preference, a top-requested setting.

## Stories

### S1 — As a user, I want to switch between light and dark themes, so that the app matches my preference.

**Acceptance Criteria**
- A theme toggle is available in settings.
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
2. **Research** the feature — following links and, when a codebase is reachable, reading the
   actual code so tasks are grounded in reality.
3. **Groom** it into the epic / stories / tasks breakdown.
4. **Save & print** the markdown (with a mermaid diagram), and write the JSON graph plus a
   standalone interactive `<ISSUE-KEY>-groomed.html` (offline, double-clickable) next to it — all
   under a per-issue `<ISSUE-KEY>/` folder.

---

What's next? See the [roadmap](docs/ROADMAP.md). Contributing? See [CONTRIBUTING.md](CONTRIBUTING.md).
Licensed under [MIT](LICENSE).
