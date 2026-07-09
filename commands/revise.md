---
description: "Revise an already-produced Groomie breakdown in place — add / remove / split / edit an epic, story, or task. Usage: /groomie:revise <ISSUE-KEY> <change>"
---

Revise an existing groomed breakdown. Arguments: `$ARGUMENTS`

Invoke the **groomie** skill (use the Skill tool with skill `groomie`) **in this (main) thread** and
follow its **"Revise an existing breakdown"** section — do the targeted-edit flow, not a fresh groom.
Do **not** hand this to a general-purpose subagent (it would drop the skill's rules); if it must run
in a subagent, dispatch the dedicated `groomie` agent instead.

From `$ARGUMENTS`, take the issue key and the natural-language change (e.g.
`/groomie:revise PROJ-123 split T3 into two tasks`, `remove S2`, `add a [Frontend] task for the
empty-state`, `the epic's business value is wrong — it's X`).

- The breakdown must already exist: `<ISSUE-KEY>-groomed.md` **and** `<ISSUE-KEY>-groomed.json` in the
  working directory. If either is missing, tell the user to run `/groomie <ISSUE-KEY>` first — do
  **not** silently groom a fresh one.
- Apply the change under the same breakdown rules, keep existing keys stable (retire removed ones,
  never renumber), keep the MD `Blocks:` / `Is blocked by:` lines and the JSON edges in agreement,
  and touch only what the change implies.
- Re-emit all three files (`.md`, `.json`, and the regenerated `.html`), self-verify with
  `scripts/check-graph.mjs`, then print a short change summary and the updated markdown.

Read-only against Jira — research the code/ticket only if the change adds genuinely new technical
content. Never write anything back to Jira.

If no issue key is present in `$ARGUMENTS`, ask the user for one before doing anything else.
