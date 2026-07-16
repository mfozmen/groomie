---
description: "Review an existing Groomie breakdown against the grooming contract — leak scan, shape, sections, diagram — and fix violations in one bounded pass. Usage: /groomie:review <ISSUE-KEY>"
---

Review an existing groomed breakdown. Arguments: `$ARGUMENTS`

Invoke the **review** skill (use the Skill tool with skill `review`) **in this (main) thread**
and follow it exactly. Do **not** hand this to a general-purpose subagent (it would drop the
checklist and review from memory) — there is no dedicated agent for review; it runs
main-thread only.

From `$ARGUMENTS`, take the issue key (e.g. `/groomie:review PROJ-123`).

- The breakdown must already exist as a pair — `<ISSUE-KEY>/<ISSUE-KEY>-groomed.md` **and**
  `<ISSUE-KEY>/<ISSUE-KEY>-groomed.json` together (or the legacy flat pair in the working
  directory). If not found, tell the user to run `/groomie <ISSUE-KEY>` first.
- The skill runs the canonical checklist (`skills/groomie/references/review-checklist.md`),
  fixes violations in ONE bounded pass (md + json together, regenerated html, check-graph
  re-run), and reports what changed — or that the breakdown is clean.
- Read-only against Jira — never pushes. If the breakdown was already pushed, the report
  includes a drift warning.

If no issue key is present in `$ARGUMENTS`, ask the user for one before doing anything else.
