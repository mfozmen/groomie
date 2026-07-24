---
description: "Add the technical-task layer to an existing epic + user-stories breakdown, preserving them — the stories→full upgrade. Usage: /groomie:tasks <ISSUE-KEY>"
---

Add technical tasks to an existing groomed breakdown. Arguments: `$ARGUMENTS`

Invoke the **groomie** skill (use the Skill tool with skill `groomie`) **in this (main) thread** and
follow its **"Add the tasks layer (`/groomie:tasks`)"** section — the targeted stories→full upgrade,
not a fresh groom. Do **not** hand this to a general-purpose subagent (it would drop the skill's
rules); if it must run in a subagent, dispatch the dedicated `groomie` agent instead.

From `$ARGUMENTS`, take the issue key (e.g. `/groomie:tasks PROJ-123`).

- The breakdown must already exist as a pair — `<ISSUE-KEY>/<ISSUE-KEY>-groomed.md` **and**
  `<ISSUE-KEY>/<ISSUE-KEY>-groomed.json` together under the per-issue folder (or the legacy flat
  `<ISSUE-KEY>-groomed.{md,json}` in the working directory). If that pair isn't found, tell the user
  to run `/groomie:stories <ISSUE-KEY>` (or `/groomie <ISSUE-KEY>`) first — do **not** silently groom
  a fresh one.
- **Top-up only:** it adds `[Discipline]` tasks for the stories that currently have **no** blocking
  task, researching and verifying against the real code (step 3), and leaves the epic and every
  existing story/task untouched. Existing `S#`/`T#` keys stay stable; new tasks take the next free
  `T#`. The breakdown's mode flips **stories → full**.
- If every story already has a task, it reports "nothing to add" and changes nothing.
- Re-emits all three files (`.md`, `.json`, regenerated `.html`), self-verifies with
  `scripts/check-graph.mjs` **and** the prose checklist over the added tasks, then prints a short
  change summary and the updated markdown.

Read-only against Jira — research the code/ticket to derive the tasks; never write anything back to
Jira.

If no issue key is present in `$ARGUMENTS`, ask the user for one before doing anything else.
