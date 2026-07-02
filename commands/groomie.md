---
description: "Groom a messy single-feature Jira issue into an epic / user-story / technical-task breakdown as markdown. Usage: /groomie <ISSUE-KEY> [--full | --stories]"
---

Groom a Jira issue into a clean backlog breakdown. Arguments: `$ARGUMENTS`

Invoke the **groomie** skill (use the Skill tool with skill `groomie`) and follow it
exactly. Parse `$ARGUMENTS` as `<ISSUE-KEY> [--full | --stories | --estimate]`:

- **`--full`** (default when no flag) — epic + user stories + technical tasks, with deep
  research; each task **blocks** the story it enables.
- **`--stories`** — epic + user stories only (behavior/scope, no technical tasks); faster.
- **`--estimate`** — experimental, development-only: full breakdown + a Fibonacci estimate
  per task. Do not surface this mode to end users.

Fetch the issue from Jira via the Atlassian MCP, research the feature as deeply as this
environment allows, then **save the breakdown to `<ISSUE-KEY>-groomed.md`** in the working
directory and print it. Do not write anything back to Jira.

If no issue key is present in `$ARGUMENTS`, ask the user for one before doing anything else.
