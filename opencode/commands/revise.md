Revise an existing groomed breakdown. Arguments: `$ARGUMENTS`

Load the **groomie** skill with the `skill` tool — `skill({ name: "groomie" })` — **in this (main)
thread** and follow its **"Revise an existing breakdown"** section — do the targeted-edit flow, not
a fresh groom. Do **not** hand this to the general-purpose subagent (it would drop the skill's
rules); if it must run in a subagent, invoke the dedicated `groomie` agent instead.

From `$ARGUMENTS`, take the breakdown id — the Jira key, or the slug of a no-Jira groom (the
closing block of the groom named it) — and the natural-language change (e.g.
`/groomie:revise PROJ-123 split T3 into two tasks`, `remove S2`, `add a [Frontend] task for the
empty-state`, `the epic's business value is wrong — it's X`).

- The breakdown must already exist as a pair — `<ID>/<ID>-groomed.md` **and**
  `<ID>/<ID>-groomed.json` together under the per-breakdown folder (or the legacy flat
  `<ID>-groomed.{md,json}` in the working directory, for pre-folder outputs). If that pair
  isn't found in either location, tell the user to run `/groomie <ID>` first — do **not**
  silently groom a fresh one.
- Apply the change under the same breakdown rules, keep existing keys stable (retire removed ones,
  never renumber), keep the MD `Blocks:` / `Is blocked by:` lines and the JSON edges in agreement,
  and touch only what the change implies.
- Re-emit all three files (`.md`, `.json`, and the regenerated `.html`), self-verify with
  `scripts/check-graph.mjs` **and** the prose checklist
  (`skills/groomie/references/review-checklist.md`) over the touched parts, then print a short
  change summary and the updated markdown.

Read-only against Jira — research the code/ticket only if the change adds genuinely new technical
content. Never write anything back to Jira.

If no breakdown id is present in `$ARGUMENTS`, ask the user for one before doing anything else.
