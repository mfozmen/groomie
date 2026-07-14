---
description: "Groom a Jira issue into a FULL epic / user-story / technical-task breakdown. Usage: /groomie:full <ISSUE-KEY>"
---

Run the **groomie** skill in **full** mode on `$ARGUMENTS`.

Invoke the groomie skill (Skill tool, skill `groomie`) and follow it exactly, applying the
**`--full`** behaviour: epic + user stories + technical tasks, with the deep research needed to
write accurate tasks; each task **blocks** the story it enables. Fetch the issue from Jira via the
Atlassian MCP, save the breakdown to `<ISSUE-KEY>/<ISSUE-KEY>-groomed.md` (plus the
`<ISSUE-KEY>-groomed.json` graph and a standalone interactive `<ISSUE-KEY>-groomed.html`, all under a
per-issue folder named for the key) and print the markdown. Do not write
anything back to Jira.

If no issue key is present in `$ARGUMENTS`, ask the user for one before doing anything else.
