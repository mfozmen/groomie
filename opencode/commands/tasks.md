Add technical tasks to an existing groomed breakdown. Arguments: `$ARGUMENTS`

Load the **groomie** skill with the `skill` tool — `skill({ name: "groomie" })` — **in this (main)
thread** and follow its **"Add the tasks layer (`/groomie:tasks`)"** section — the targeted
stories→full upgrade, not a fresh groom. Do **not** hand this to the general-purpose subagent (it
would drop the skill's rules); if it must run in a subagent, invoke the dedicated `groomie` agent
instead.

From `$ARGUMENTS`, take the breakdown id — the Jira key, or the slug of a no-Jira groom (e.g.
`/groomie:tasks PROJ-123`, `/groomie:tasks checkout-redesign`).

- The breakdown must already exist as a pair — `<ID>/<ID>-groomed.md` **and**
  `<ID>/<ID>-groomed.json` together under the per-breakdown folder (or the legacy flat
  `<ID>-groomed.{md,json}` in the working directory). If that pair isn't found, tell the user
  to run `/groomie:stories <ID>` (or `/groomie <ID>`) first — do **not** silently groom
  a fresh one.
- **Top-up only:** it adds `[Discipline]` tasks for the stories that currently have **no** blocking
  task, researching and verifying against the real code (step 3), and leaves the epic and every
  existing story/task untouched. Existing `S#`/`T#` keys stay stable; new tasks take the next free
  `T#`. The breakdown's mode flips **stories → full**.
- If every story already has a task, it reports "nothing to add" and changes nothing.
- Re-emits all three files (`.md`, `.json`, regenerated `.html`), self-verifies with
  `scripts/check-graph.mjs` **and** the prose checklist over the added tasks, then prints a short
  change summary and the updated markdown.

Read-only against Jira — research the code/ticket to derive the tasks; never write anything back to
Jira.

If no breakdown id is present in `$ARGUMENTS`, ask the user for one before doing anything else.
