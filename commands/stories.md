---
description: "Groom a Jira issue into an epic + user stories only (no technical tasks). Usage: /groomie:stories <ISSUE-KEY>"
---

Run the **groomie** skill in **stories** mode on `$ARGUMENTS`.

Invoke the groomie skill (Skill tool, skill `groomie`) and follow it exactly, applying the
**`--stories`** behaviour: epic + user stories only — behaviour and scope, **no technical tasks** —
for a faster, user-facing pass. Fetch the issue from Jira via the Atlassian MCP, save the breakdown
to `<ISSUE-KEY>-groomed.md` (plus the `<ISSUE-KEY>-groomed.json` graph) and print the markdown. Do
not write anything back to Jira.

If no issue key is present in `$ARGUMENTS`, ask the user for one before doing anything else.
