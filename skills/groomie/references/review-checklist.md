# Groomie self-review checklist

The verification pass run over a freshly produced (or revised) breakdown — the prose
counterpart of `scripts/check-graph.mjs`. Generation drops rules under load; this pass
re-reads the output in *checking* mode, item by item, against `breakdown-guide.md` (the
rule text lives THERE — this file only enumerates what to check, so the two never drift).

**How to run it:** read the finished `<KEY>-groomed.md` (and `.json`) top to bottom ONCE,
answering every item below. Collect violations first; then fix them in **one bounded pass**
(see "Fixing" at the end). Never skip the run — a clean result is reported in one line.

## Epic

- [ ] Title **leads with a verb, Title Case** (Add / Enable / Support / Change / Migrate /
      Remove — minor words lowercased). *(guide: "Epics")*
- [ ] Title makes the bounded scope self-evident — not a bare label, not an umbrella.
- [ ] Body is exactly `**Description:**` + `**Business Value:**` (+ optional `**Design:**`
      when research surfaced mockups) — nothing else, no AC on the epic.
- [ ] Version stamp `_groomie v<version> · <mode> breakdown_` sits under the first epic
      heading, version matching `.claude-plugin/plugin.json`.

## Stories — the leak scan (run per story, title + description + AC)

*(guide: "User stories" → "Behavior and needs ONLY" and its NEVERs)*

- [ ] **No screen/menu placement or navigation path** (`under X → Y → Z`, internal admin
      paths). Placement is design's decision — capability only.
- [ ] **No technical field / parameter / API names** (`sort_key`-style identifiers, request
      parameters, endpoint names). Each is rewritten as the user-level capability it grants.
- [ ] **No prescribed interaction sequence** ("selects, in order: …") — outcome constraints
      only.
- [ ] **No source-ticket internal numbering** ("(AC2)", "covers AC3", "per requirement 4") —
      the breakdown is self-contained.
- [ ] **No widget-type names** ("dropdown list", "modal", "drawer") — existing surfaces are
      referenced by product concept; the AC must survive a redesign.
- [ ] No API/tech build directives dressed as behavior ("build a REST endpoint…").

## Stories — shape

- [ ] Persona is a **real product user**, never the recipient/consumer of an outbound
      artifact; persona stays **consistent** across stories (role switches only when the
      actor genuinely differs — author vs user).
- [ ] Role name is **not invented**: it comes from the config's `## Personas`, or a name
      the source actually uses, or is generic `user` — never a guessed job title.
      *(guide: "User stories" → the persona priority rule)*
- [ ] Title is the full sentence `As a <role>, I want <capability>, so that <benefit>.` —
      comma before *so that*, period at the end, within Jira's 255-char summary limit.
- [ ] Each story = **one** capability (INVEST) — no "edit **or** delete" bundles.
- [ ] Every story that exists is a genuine user-facing behavior change — no technical
      outcomes dressed as stories; a story-less epic has **no** `## Stories` section at all.
- [ ] Body carries description → **Acceptance Criteria** → **Test Cases** (both required;
      test cases include the key failure paths).
- [ ] `**Is blocked by:**` lists one `- <key> — <title>` per line (full mode).

## Tasks

- [ ] Title = `[Discipline] <imperative action>`, one responsibility.
- [ ] Body carries **Implementation** + **Done when** (no Test Cases — tasks aren't
      QA-tested).
- [ ] No standalone test-writing or docs task (exception: an out-of-repo docs task the
      config's documentation policy names); no coordination/sign-off tasks naming people.
- [ ] `**Blocks:**` references resolve to real stories/tasks by key.

## Bugs

- [ ] Each bug is a `### B# — <title>` section with **Reproduce Steps** (numbered) /
      **Expected Behaviour** / **Actual Behaviour** (+ optional **Notes**).
- [ ] Bugs are epic children with **no edges** — no story link, no `affects`.

## Document

- [ ] Sections are exactly the closed ordered set (epic block → `## Stories` → `## Tasks` →
      `## Bugs` → `## Open questions` → `## Diagram`), **empty sections omitted entirely** —
      no TL;DR, no decisions table, no ticket critique, **no `## Verification` section**
      (verification findings live in `## Open questions`, not a section of their own).
- [ ] Keys (`S#`/`T#`/`B#`) unique across the whole document; on a revise, retired keys are
      never reused or renumbered.
- [ ] Mermaid `## Diagram` labels are each node's **own title verbatim** run through the
      guide's sanitize → cap → wrap → prefix sequence; bugs standalone; edges match the JSON.
- [ ] Under a configured `## Output language`, only human-readable content is translated —
      the contract skeleton (keys, `[Discipline]`, `Blocks:` / `Is blocked by:`, the fixed
      headings, the stamp) stays fixed.
- [ ] Nothing invented **and nothing unverified stated as fact**: every claim — including each
      specific system / table / endpoint / field and every "already works" assertion — traces to
      the ticket, its links, or the research; ambiguities and unconfirmed claims live in
      `## Open questions`, not in silently-invented requirements.
      *(guide: "Open questions", "Verifying the ticket's claims")*
- [ ] **Contradictions read as both-sided open questions** — a ticket-vs-source disagreement
      appears under `## Open questions` naming both readings, and the body grooms the source's
      reading. *(guide: same section.)*

## Fixing (bounded — ONE pass)

Fix violations directly in the `.md` **and** `.json` (keys stable, minimal edits, the
`jira` ledger untouched), regenerate the `.html` with the template concat, then re-run
`scripts/check-graph.mjs`. Both re-runs are **best-effort, like everywhere else in the
skill**: if `node` can't run, eyeball the graph invariants instead; if the template assets
can't be found, skip the `.html` and say so — never block the review on either.
**One pass only** — if a fix would require new research, a
judgment call the ticket doesn't answer, or a second sweep, report it to the user instead
of iterating. The same bound covers the checker: if `check-graph.mjs` still fails after
the one pass, report the remaining violation — do not keep iterating until it passes. If the JSON's `jira.pushed` ledger is non-empty, warn that fixes create
drift against Jira until the user runs `/groomie:push` again. Finish with a short report:
either `Self-review: clean` or the fixed/reported items by key.
