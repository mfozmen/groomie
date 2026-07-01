---
description: "Groom a messy single-feature Jira issue into an epic / user-story / technical-task breakdown as markdown. Usage: /groomie <ISSUE-KEY>"
---

Groom the Jira issue `$ARGUMENTS` into a clean backlog breakdown.

Invoke the **groomie** skill (use the Skill tool with skill `groomie`) and follow it
exactly: fetch the issue from Jira via the Atlassian MCP, research the feature as deeply
as this environment allows, then produce the epic / user-story / technical-task (and bug
where warranted) breakdown as markdown — with each task **blocking** the story it enables.
Do not write anything back to Jira.

If `$ARGUMENTS` is empty, ask the user for a Jira issue key before doing anything else.
