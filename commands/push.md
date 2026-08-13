---
description: "Push a finalized breakdown into Jira via MCP — creates/updates the epic, stories, tasks, bugs and their links, idempotently, only after you approve a preview. Usage: /groomie:push <ID>"
---

Push a groomed breakdown to Jira. Arguments: `$ARGUMENTS`

Invoke the **groomie** skill (use the Skill tool with skill `groomie`) **in this (main) thread** and
follow its **"Push to Jira"** section. Do **not** delegate this to a subagent — the push needs
**interactive approval**, which a subagent can't give (and the faithful `groomie` agent is read-only).

From `$ARGUMENTS`, take the breakdown id — the Jira key, or the slug of a no-Jira groom (e.g.
`/groomie:push PROJ-123`, `/groomie:push checkout-redesign`).

- The breakdown must already exist as a pair — `<ID>/<ID>-groomed.md` **and**
  `<ID>/<ID>-groomed.json` under the per-breakdown folder (or the legacy flat path). If not
  found, tell the user to run `/groomie <ID>` first — do **not** groom here.
- This is Groomie's **one write action**. It writes to Jira **only after showing a full plan preview
  and getting your explicit approval** — CREATE / UPDATE / `[deleted]` / LINKS, destructive actions
  flagged. Nothing is written until you confirm.
- It is **idempotent**: re-pushing updates the same issues in place (tracked by the JSON `jira`
  ledger), never creating duplicates. A node you removed from the breakdown gets a soft `[deleted] `
  title prefix in Jira — Groomie **never hard-deletes or transitions** an issue, and never touches
  status / assignee / sprint / other non-Groomie fields.
- It **never modifies the source issue**: push only creates Groomie's own epic(s) with their
  children, linking each epic to the source issue (when the breakdown has one) with a "relates to"
  link. (One legacy exception: a breakdown pushed with the removed `source-as-epic` mode keeps
  updating the epic its ledger already owns — which is the source issue itself.) The target project is confirmed once on the first push (a Jira source's project offered as
  the default) and recorded.

If no breakdown id is present in `$ARGUMENTS`, ask the user for one before doing anything else.
