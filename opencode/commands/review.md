Review an existing groomed breakdown. Arguments: `$ARGUMENTS`

Load the **review** skill with the `skill` tool — `skill({ name: "review" })` — **in this (main)
thread** and follow it exactly. Do **not** hand this to the general-purpose subagent (it would drop
the checklist and review from memory) — there is no dedicated agent for review; it runs main-thread
only.

From `$ARGUMENTS`, take the breakdown id — the Jira key, or the slug of a no-Jira groom (e.g.
`/groomie:review PROJ-123`, `/groomie:review checkout-redesign`).

- The breakdown must already exist as a pair — `<ID>/<ID>-groomed.md` **and**
  `<ID>/<ID>-groomed.json` together (or the legacy flat pair in the working
  directory). If not found, tell the user to run `/groomie <ID>` first.
- The skill runs the canonical checklist (`skills/groomie/references/review-checklist.md`),
  fixes violations in ONE bounded pass (md + json together, regenerated html, check-graph
  re-run), and reports what changed — or that the breakdown is clean.
- Read-only against Jira — never pushes. If the breakdown was already pushed, the report
  includes a drift warning.

If no breakdown id is present in `$ARGUMENTS`, ask the user for one before doing anything else.
