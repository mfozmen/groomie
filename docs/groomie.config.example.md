# Groomie config

<!--
  You normally never touch this file by hand — run `/groomie:config <what you want>` and Groomie
  writes it for you (e.g. `/groomie:config outputs in Turkish`). This copy just shows the format.
  Config lives in two places, merged by section: a GLOBAL `~/.groomie/config.md` (all projects) and a
  per-project `groomie.config.md` at your repo root (which overrides the global file section by
  section). Everything is OPTIONAL — delete any section (or the whole file) and Groomie keeps its
  default behavior. All names below are placeholders — replace them with your own.
-->

## Output language
<!-- The language of the groomed OUTPUT (the breakdown content). Groomie still talks to you in your
     own language; only the output files use this. Optional — defaults to English. -->
- English

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
