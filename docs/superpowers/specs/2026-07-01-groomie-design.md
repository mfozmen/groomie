# Groomie — Design (v1)

**Date:** 2026-07-01
**Status:** Approved, v1 in progress

## Problem

Teams file messy, single-feature Jira issues: vague, over-stuffed, mixing concerns, no
acceptance criteria. Someone has to turn each one into a proper backlog breakdown. That
work is repetitive and skill-dependent.

## What Groomie is

An **open-source Claude Code plugin**. Its core is a skill invoked as
`/groomie <ISSUE-KEY>`. When called, the orchestrating Claude Code session fetches the
issue, researches the feature using whatever tools the environment offers, and produces
a groomed breakdown as **markdown**. It does not write to Jira.

Chosen over a standalone app because the value comes from orchestrating tools that
already live in the user's Claude Code session (Jira MCP, research tooling, subagents).
A separate process couldn't reach them.

## Dependencies

- **Hard:** Atlassian MCP (Jira) — to read the issue.
- **Soft / detected:** any research capability present (knowledge-base MCP, web search,
  subagents). Groomie probes and degrades gracefully. **No company-specific hard
  dependency** — it's open source.

## Output

One epic → user stories (with acceptance criteria) → technical tasks (each *blocks* the
story it enables) → bugs (only for genuinely broken existing behavior) → open questions.
Rules live in `skills/groomie/references/breakdown-guide.md`; style is calibrated by
worked samples in `references/examples.md` (how the user "trains" Groomie — prompt +
examples, no model training).

## Flow

1. Fetch issue via Atlassian MCP.
2. Probe capabilities; decide research depth.
3. Research the feature (delegate heavy search to subagents).
4. Groom per the breakdown guide + examples.
5. Emit markdown.

## Out of scope (v1)

- Writing back to Jira (creating issues / links). Planned for v2.
- Visual output. Possible later.
- Deterministic code + tests — none yet; added with TDD only when real logic appears
  (e.g. a breakdown validator).

## Engineering conventions

- Conventional Commits; PR-per-change; advisory Claude AI review in CI.
- release-it (conventional-changelog) for versioning `package.json` +
  `.claude-plugin/plugin.json`, changelog, tags, GitHub releases.
- MIT license.
