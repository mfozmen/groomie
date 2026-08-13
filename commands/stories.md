---
description: "Groom a feature idea — a Jira issue, Confluence page, URL, or file — into an epic + user stories only (no technical tasks). Usage: /groomie:stories <source> [<source> …]"
---

Run the **groomie** skill in **stories** mode on `$ARGUMENTS`.

Invoke the groomie skill (Skill tool, skill `groomie`) and follow it exactly, applying the
**`--stories`** behaviour: epic + user stories only — behaviour and scope, **no technical tasks** —
for a faster, user-facing pass. `$ARGUMENTS` may carry one or more sources — a Jira issue key, a
Jira/Confluence URL, any URL, or a local file — plus free-text context (the skill's *Input*
section); a Jira issue is not required. Resolve the sources (Jira via the Atlassian MCP when
given), save the breakdown to `<ID>/<ID>-groomed.md` (plus the `<ID>-groomed.json` graph and a
standalone interactive `<ID>-groomed.html`, all under a per-breakdown folder named for the
skill-fixed identity — Jira key or title slug) and print the markdown. Do not write anything back
to Jira.

If no source is present in `$ARGUMENTS`, ask the user for one before doing anything else.
