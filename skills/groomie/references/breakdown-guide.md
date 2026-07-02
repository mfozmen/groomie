# Breakdown guide

The rules Groomie applies when grooming a feature. This is the reference; keep it
opinionated and update it as the user's preferences become clear.

## The hierarchy

```
Epic  (the feature — one per run)
 ├─ User Story A   — non-technical · QA-tested   "As a <role>, I want … so that …"
 ├─ User Story B   — non-technical · QA-tested
 ├─ Task 1  — technical · NOT QA-tested   ──blocks──▶  Story A
 ├─ Task 2  — technical · NOT QA-tested   ──blocks──▶  Story A + Story B
 ├─ Task 3  — technical · NOT QA-tested   ──blocks──▶  Story B
 └─ Bug     — technical or non-technical · QA-tested   (affects a story)
```

**Stories and tasks are siblings under the epic — a task is never a *subtask* of a
story.** They are distinct issue types linked only by `blocks`: stories are the
non-technical, user-facing behavior; tasks are the technical work that builds them, so
technical tasks block the stories they enable. This split drives QA: **stories are tested
by QA** (their Test Cases are what QA runs), **tasks are not** (they carry `Done when`
instead). One foundational/infrastructure task can block **many** stories (a global
blocker). Bugs are QA-tested whether they are technical or not.

## Epic

- **Exactly one epic per run — it IS the feature.** Add a second (Infrastructure)
  epic only when the feature needs substantial groundwork of its own (e.g. standing
  up a whole new microservice) — never for small setup, which belongs in tasks.
- **Bounded & closeable.** An epic's scope must be finite — a coherent chunk of work
  that can realistically be completed in a defined timeframe (a few sprints, not
  "forever"). If it can never be marked "done", it's a theme, not an epic — split it.
- **The title must make that bounded scope self-evident.** Reading the title alone
  should tell you what is in scope and when it is finished. Prefer a *qualified*
  capability over an open-ended umbrella:
  - ✅ "Traditional Authentication", "SSO Integration", "Book Discovery System"
  - ❌ "Authentication", "Books", "User System", "Platform" (never close)
- **Body — exactly two lines:** `**Description:**` (what it implements, one sentence)
  and `**Business Value:**` (why it matters, one sentence). Nothing else.
- **No acceptance criteria on the epic** — stories carry the AC.
- No task list or stories inline — those are separate issues under the epic.

## User stories

- Vertical, user-visible slices — **non-technical**, describing what the user experiences.
  Each delivers something a user (or operator/admin) can perceive. If a "story" has no
  user-visible outcome, it's probably a task. **QA tests stories** — the Test Cases below
  are the basis QA runs.
- **The title IS the story sentence:** `As a <role>, I want <capability> so that <benefit>.`
  The title alone must convey the work — but keep it within Jira's 255-char summary limit
  and readable; tighten the wording rather than let it sprawl. If it won't fit or reads as
  two things at once, the story is too big — split it.
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
- Slice thin: prefer several small stories over one giant one. A story needing a dozen
  tasks is usually two or three stories.
- Each story belongs to the epic and is **blocked by** the technical tasks that build it.

## Technical tasks

- **Technical** implementation work that builds a story — this is where the HOW lives (the
  opposite of stories): tasks name the APIs, tables, screens, and components, with concrete
  steps. A task is **not a subtask of a story** — it's a distinct issue linked to the
  story by `blocks`. Tasks are **not QA-tested** (that's why they carry `Done when`, not
  Test Cases).
- **Title:** `[Discipline] <specific technical action>` — e.g. `[Backend] Design and
  implement user schema and database tables`. The discipline prefix is **required** in the
  title: it routes the work to the producing team (we don't rely on Jira fields — the
  prefix carries the routing). Infer the disciplines per project; common ones are Backend,
  Frontend, Graphic Design, Game Dev.
- **Body — detailed, step by step:**
  - **Implementation** — concrete technical steps, detailed enough that the engineer can
    follow them without re-deriving the design.
  - **Done when** — completion criteria (what must be true for the task to be done).
- **Cover every discipline the story needs.** Backend and Frontend tasks are the core —
  produce them wherever the story touches them. Add a **Graphic Design** task (mockups /
  Figma) only when the design does not already exist; if research finds finished designs,
  skip it (reference them instead) rather than re-opening design work. If you can't tell
  whether the design exists, raise it as an open question.
- **Every task blocks the story (or stories) it enables** — state it explicitly:
  `blocks: <story>`, or list several. A story is not "doable" until its blocking tasks are
  done. A single foundational task often blocks **many** stories (e.g. a user-schema task
  underpinning every account-related story) — list them all. A task that blocks nothing is
  a smell — a missing story, or out of scope; call it out rather than leaving it dangling.
- Keep each task independently completable and estimable; split anything hiding two
  distinct pieces of work. Tasks may block other tasks (sequencing); foundational /
  infrastructure tasks are **global blockers** — they block a whole set of stories (and
  often the other tasks too), so mark them clearly.

## Bugs

- Only when the source issue actually reports existing behavior that is broken.
- A missing feature is a story/task, not a bug.
- A bug may be **technical or non-technical** — either way it is **QA-tested** (like a
  story), so it does not matter which; give steps to reproduce, expected vs actual.
- Link it to the story it affects.

## Open questions

Anything ambiguous in the source issue becomes an explicit open question — never a
silently invented requirement. List them at the end so the user can resolve them before
the work is filed.

## Output shape

```markdown
# Epic: <bounded capability name>

**Description:** <what the feature implements — one sentence>

**Business Value:** <why it matters — one sentence>

---

## Stories   (non-technical · QA-tested)

### As a <role>, I want <capability> so that <benefit>

<one-line description of the capability; link PRD / background docs if any>

**Acceptance Criteria**
- ...

**Test Cases**
- <input> → <expected result>
- <failure case> → <expected result>

### As a <role>, I want <capability> so that <benefit>
...

---

## Tasks   (technical · not QA-tested; siblings of stories, linked by `blocks`)

- [ ] **[Backend]** <what> · `blocks:` Story 1
- [ ] **[Frontend]** <what> · `blocks:` Story 1
- [ ] **[Graphic Design]** <what> (only if no design exists yet) · `blocks:` Story 2
- [ ] **[Backend]** <foundational work> · `blocks:` Story 1, Story 2   ← one task, many stories

---

## Bugs   (technical or non-technical · QA-tested)
- **<title>** — repro / expected / actual · affects: <story>   _(omit section if none)_

## Open questions
- ...
```

The samples in `examples.md` are the source of truth for the shape of each individual
epic / story / task — when they differ from this skeleton, the samples win. This skeleton
only shows how the pieces lay out together in one document.
