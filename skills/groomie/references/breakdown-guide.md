# Breakdown guide

The rules Groomie applies when grooming a feature. This is the reference; keep it
opinionated and update it as the user's preferences become clear.

## The hierarchy

```
Epic  (the feature — exactly one per run)
 ├─ User Story A            "As a <role> I want <capability> so that <benefit>"
 │    ├─ Task A1  ──blocks──▶ Story A
 │    └─ Task A2  ──blocks──▶ Story A
 ├─ User Story B
 │    └─ Task B1  ──blocks──▶ Story B
 └─ Bug (only if the issue reports broken existing behavior)
```

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

- Vertical, user-visible slices. Each delivers something a user (or an operator/admin)
  can perceive. If a "story" has no user-visible outcome, it's probably a task.
- Format: **As a `<role>` I want `<capability>` so that `<benefit>`.**
- Every story carries **acceptance criteria** — concrete, testable, checklist-style
  (prefer Given/When/Then when it adds clarity).
- Slice thin: prefer several small stories over one giant one. A story that needs a
  dozen tasks is usually two or three stories.

## Technical tasks

- Implementation work: backend, frontend, schema, infra, migration, config, docs.
- **Every task blocks the story (or stories) it enables.** State the link explicitly:
  `blocks: Story A`. A story is not "doable" until its blocking tasks are done.
- A task with no story it blocks is a smell — either it belongs to a story you missed,
  or it's out of scope. Call it out rather than leaving it dangling.
- Keep tasks independently completable and estimable. Split anything that hides two
  distinct pieces of work.

## Bugs

- Only when the source issue actually reports existing behavior that is broken.
- A missing feature is a story/task, not a bug.
- Give steps to reproduce, expected vs actual, and link it to the story it affects.

## Open questions

Anything ambiguous in the source issue becomes an explicit open question — never a
silently invented requirement. List them at the end so the user can resolve them before
the work is filed.

## Output shape

```markdown
# Epic: <outcome-focused title>

<2–4 sentence problem + desired outcome>

---

## Story A — <short title>
> As a <role> I want <capability> so that <benefit>.

**Acceptance criteria**
- [ ] ...
- [ ] ...

**Blocking tasks**
- [ ] Task A1 — <what> · `blocks: Story A`
- [ ] Task A2 — <what> · `blocks: Story A`

## Story B — <short title>
...

---

## Bugs
- **<title>** — repro / expected / actual · affects: Story A   _(omit section if none)_

## Open questions
- ...
```

Adjust the shape to match the samples in `examples.md` when they differ — the samples win.
When `examples.md` has no real samples yet (placeholder only), use the shape above.
