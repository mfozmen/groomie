Groom a feature idea into a clean backlog breakdown. Arguments: `$ARGUMENTS`

Load the **groomie** skill with the `skill` tool — `skill({ name: "groomie" })` — **in this (main)
thread** and follow it exactly. Do **not** hand the grooming to the general-purpose subagent — it
would groom from its own idea of grooming and drop the skill's rules; if grooming must run in a
subagent, invoke the dedicated `groomie` subagent instead.

This bare `/groomie <source> …` runs the default **full** mode. The mode can also be picked by
subcommand — `/groomie:full` and `/groomie:stories` — which is the preferred way.

Determine the mode from `$ARGUMENTS`, defaulting to **full**:

- **full** (default) — epic + user stories + technical tasks, with deep research; each task
  **blocks** the story it enables.
- **stories** — epic + user stories only (behavior/scope, no technical tasks); faster.

For back-compat the `--full` / `--stories` flags in `$ARGUMENTS` still select the mode, and the
experimental development-only `--estimate` flag (full breakdown + a Fibonacci estimate per task)
still works — do not surface `--estimate` to end users.

`$ARGUMENTS` may carry **one or more sources** — a Jira issue key, a Jira/Confluence URL, any URL,
or a local file path — plus optional free-text context; the first source is the primary one (the
skill's *Input* section). A Jira issue is **not required**. Resolve every source (Jira via the
Atlassian MCP when a Jira source is given), research the feature as deeply as this environment
allows, then **save the breakdown to `<ID>/<ID>-groomed.md`** (plus a machine-readable
`<ID>-groomed.json` graph and a standalone interactive `<ID>-groomed.html`) — all under a
per-breakdown folder named for the identity the skill fixes (the Jira key, or a slug of the primary
source's title) — and print the markdown. Do not write anything back to Jira.

If no source is present in `$ARGUMENTS`, ask the user for one before doing anything else.
