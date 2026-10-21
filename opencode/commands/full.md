Run the **groomie** skill in **full** mode on `$ARGUMENTS`.

Load the groomie skill with the `skill` tool — `skill({ name: "groomie" })` — and follow it
exactly, applying the **`--full`** behaviour: epic + user stories + technical tasks, with the deep
research needed to write accurate tasks; each task **blocks** the story it enables.

`$ARGUMENTS` may carry one or more sources — a Jira issue key, a Jira/Confluence URL, any URL, or a
local file — plus free-text context (the skill's *Input* section); a Jira issue is not required.
Resolve the sources (Jira via the Atlassian MCP when given), save the breakdown to
`<ID>/<ID>-groomed.md` (plus the `<ID>-groomed.json` graph and a standalone interactive
`<ID>-groomed.html`, all under a per-breakdown folder named for the skill-fixed identity — Jira key
or title slug) and print the markdown. Do not write anything back to Jira.

If no source is present in `$ARGUMENTS`, ask the user for one before doing anything else.
