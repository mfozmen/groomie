# Review considerations (developing Groomie)

Groomie is **open source**. When reviewing a change to this repo, check these first.

## 1. Dependencies — Atlassian MCP only (blocking)

The **only hard dependency is the Atlassian MCP** (Jira), used to read the issue. Nothing
else may be a hard dependency:

- Research tooling — a code/knowledge-base MCP, web search, subagents — must be
  **detected at runtime and optional**, degrading gracefully when absent.
- **Never introduce a company- or vendor-specific dependency** — e.g. an internal
  engineering knowledge base (EKB), custom internal agents, or internal services. Groomie
  runs in strangers' Claude Code sessions that have none of these. A hard dependency on
  company-specific tooling — or a skill instruction that *assumes* it exists — is a
  **blocking** finding.
- It is fine for Groomie to *use* such tools opportunistically when its capability probe
  finds them; it is not fine to *require* them or name them as always-present.
- **The standalone-HTML output is a deliberate exception to "prompt-only":** the plugin ships a
  prebuilt visualizer template (`skills/groomie/assets/visualizer-{head,tail}.html`, ~1.9 MB) and
  the skill concatenates it around the graph. That must stay **Node-free at groom time** — only
  a POSIX shell (`sed`/`cat`/`printf`/`mktemp`/`rm`, no `npm`/`node`/network), and it must
  **degrade gracefully** (skip the `.html`; the `.md` + mermaid + `.json` always ship). Regenerate the assets with
  `npm --prefix visualizer run build:template` whenever the visualizer changes.

## 1b. Open-source hygiene — no proprietary leakage (blocking)

Groomie is a **public, open-source** repo. Nothing company-, employer-, or customer-specific may
appear anywhere in it — skill prose, references, examples, fixtures, config samples, tests, docs, or
comments. Treat any of the following in the diff as a **blocking** finding:

- **Real internal identifiers** — actual repository names, service/microservice names, team names,
  internal tool or project names, or internal hostnames/domains (e.g. anything under a corporate
  zone, `*.internal`, VPN-only hosts).
- **Real ticket keys or URLs** — concrete Jira keys (e.g. `ABC-1234`), Confluence/Jira/dashboard
  links, or anything that resolves only inside a company.
- **Customer data or PII** — real names, emails, account IDs, campaign data, or any real customer
  content, even as "example" data.
- **Org-specific conventions presented as Groomie defaults** — e.g. hard-coding one company's
  discipline names, repo layout, or process into the skill instead of the optional
  `groomie.config.md`.

Everything illustrative must be **synthetic and generic** — invented repo names (`api-service`,
`web-frontend`), placeholder keys (`PROJ-123`), and made-up feature domains (the auth / saved-search
examples). The user's personal calibration project (`SAP`) is the one allowed non-generic reference,
and it is a personal hobby project, not company data. When in doubt, genericize.

## 2. Grooming-model integrity

- **Stories are behavior/needs only** — never prescribe a solution (no API/UI/design
  directives). That's the tasks' job.
- **Tasks are `[Discipline]`-prefixed technical work, siblings of stories (not subtasks),
  linked by `blocks`.** A task may block several stories.
- **Stories and bugs are QA-tested; tasks are not.**
- Epics are bounded/closeable with scope clear from the title; body is `Description` +
  `Business Value` (+ an optional `Design` line for Figma/mockups when research surfaces
  them), no AC.

## 3. Consistency across the skill files

`SKILL.md`, `references/breakdown-guide.md` (including its Output-shape template), and
`references/examples.md` must agree. The examples are the source of truth for the shape of
each item; the guide's skeleton only shows document layout.

## 4. Scope

- v1 is **read-only against Jira** — no write-back (creating issues / links) without an
  explicit decision.
- Modes are invoked by subcommand — `/groomie:full`, `/groomie:stories` (bare `/groomie`
  defaults to full) — with the `--full` / `--stories` flags kept as back-compat;
  **`--estimate` is experimental / development-only** — keep it out of the public README
  until calibrated.
- Conventional Commits; every change goes through a PR + the required Claude AI review.

## 5. Visualizer UI/UX (the `visualizer/` companion app)

A distilled subset of the [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
pre-delivery checklist, scoped to what this small graph viewer actually needs. When a PR touches
`visualizer/` UI, check:

- **Icons are SVG, not emoji** (React Flow's own controls, or Lucide / Heroicons if we add any).
- **Interactive elements have hover *and* focus states** — a 150–300 ms transition on hover, and a
  visible `:focus-visible` outline for keyboard navigation.
- **Motion respects `prefers-reduced-motion`** — guard transforms/transitions behind it.
- **Text contrast ≥ 4.5:1** in light mode; the kind palette (epic purple, story green, task blue,
  bug red) and muted greys must stay legible on their backgrounds.
- **The kind palette is *semantic* colour** (Jira defaults) — don't repurpose it as a brand accent.
- **Wide content scrolls in its own container** (`overflow-x`), never the page body.
