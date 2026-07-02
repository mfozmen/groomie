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

## 2. Grooming-model integrity

- **Stories are behavior/needs only** — never prescribe a solution (no API/UI/design
  directives). That's the tasks' job.
- **Tasks are `[Discipline]`-prefixed technical work, siblings of stories (not subtasks),
  linked by `blocks`.** A task may block several stories.
- **Stories and bugs are QA-tested; tasks are not.**
- Epics are bounded/closeable with scope clear from the title; body is `Description` +
  `Business Value`, no AC.

## 3. Consistency across the skill files

`SKILL.md`, `references/breakdown-guide.md` (including its Output-shape template), and
`references/examples.md` must agree. The examples are the source of truth for the shape of
each item; the guide's skeleton only shows document layout.

## 4. Scope

- v1 is **read-only against Jira** — no write-back (creating issues / links) without an
  explicit decision.
- Conventional Commits; every change goes through a PR + the advisory Claude AI review.
