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

- One epic per run — it IS the feature.
- Title: short and outcome-focused, not a restatement of the messy issue title.
- Body: 2–4 sentences on the problem and the desired outcome. Not a task list.

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
