# Groomie config

<!--
  Copy this file to `groomie.config.md` at your repo root and edit it for your team.
  Everything here is OPTIONAL — delete any section you don't need and Groomie keeps its
  default behavior for it. Deleting the whole file is fine too: Groomie grooms as normal.
  All names below are placeholders — replace them with your own.
-->

## Repo → discipline
<!-- When a task's work lands in one of these repos, Groomie tags it with the mapped
     [Discipline] (instead of guessing) and treats a different repo as its own task.
     A repo you don't list still gets an inferred discipline — it never blocks. -->
- api-service → Backend
- web-frontend → Frontend
- mobile-app → Mobile
- data-pipeline → Data

## Disciplines
<!-- The [Discipline] vocabulary your team uses, so prefixes match your language. -->
- Backend
- Frontend
- Mobile
- Data

## Documentation policy
<!-- Out-of-repo docs that should become their own task (the out-of-repo-docs exception).
     In-repo docs still stay inside the task that produces the code. -->
- API specs are published to Confluence as a separate task.

## Granularity
<!-- How aggressively to consolidate small, same-repo/same-discipline work. -->
- Prefer fewer, larger tasks; consolidate same-repo/same-discipline work.
