---
description: "Groom a messy single-feature Jira issue into an epic / user-story / technical-task breakdown as markdown. Usage: /groomie <ISSUE-KEY> (full) · /groomie:stories <ISSUE-KEY>"
---

Groom a Jira issue into a clean backlog breakdown. Arguments: `$ARGUMENTS`

Invoke the **groomie** skill (use the Skill tool with skill `groomie`) and follow it exactly.
This bare `/groomie <ISSUE-KEY>` runs the default **full** mode. The mode can also be picked by
subcommand — `/groomie:full` and `/groomie:stories` — which is the preferred way.

Determine the mode from `$ARGUMENTS`, defaulting to **full**:

- **full** (default) — epic + user stories + technical tasks, with deep research; each task
  **blocks** the story it enables.
- **stories** — epic + user stories only (behavior/scope, no technical tasks); faster.

For back-compat the `--full` / `--stories` flags in `$ARGUMENTS` still select the mode, and the
experimental development-only `--estimate` flag (full breakdown + a Fibonacci estimate per task)
still works — do not surface `--estimate` to end users.

Fetch the issue from Jira via the Atlassian MCP, research the feature as deeply as this
environment allows, then **save the breakdown to `<ISSUE-KEY>-groomed.md`** (plus a machine-readable
`<ISSUE-KEY>-groomed.json` graph) in the working directory and print the markdown. Do not
write anything back to Jira.

If no issue key is present in `$ARGUMENTS`, ask the user for one before doing anything else.
