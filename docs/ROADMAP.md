# Roadmap

Planned work, roughly in priority order. Nothing here is committed to a release date — it's a
record of intended direction so contributors know what's coming and why.

## Planned

### Per-project customization (`groomie.config.md`)

Let a team hand Groomie its **company-wide decisions** so the breakdown fits how that org actually
works, instead of Groomie's generic defaults. Kept prompt-only and optional: if the file is absent,
Groomie behaves exactly as it does today.

**Shape (proposed):** an optional `groomie.config.md` at the repo root that the skill reads during
step 2 (capability probe) and applies while grooming. Candidate settings:

- **Repo → discipline map** — e.g. `api-service → Backend`, `panel → Frontend`; informs which work
  is a separate task (a different repo is always its own task — see
  [task granularity](../skills/groomie/references/breakdown-guide.md)).
- **Documentation policy** — e.g. "API specs are published to Confluence as a separate task" — the
  out-of-repo-docs exception, made explicit per org.
- **Discipline vocabulary** — the disciplines this org uses (`Backend`, `Frontend`, `Data`,
  `Mobile`, …) so `[Discipline]` prefixes match the team's language.
- **Granularity preference** — how aggressively to consolidate small same-repo/discipline work.

**Constraints:** must stay prompt-only (no runtime dependency), degrade gracefully when the file is
missing or partial, and never introduce a hard dependency beyond the Atlassian MCP. Design +
config schema to be finalized with the maintainer before implementation.

**Status:** deferred — start on the maintainer's go-ahead.

## Later

- **Write the breakdown back to Jira** — create the epic / stories / tasks and their `blocks`
  links directly (today Groomie is read-only and emits markdown the user files themselves).
- **Estimate roll-up** — per-story / per-epic totals in `--estimate` mode (currently per-task only).
