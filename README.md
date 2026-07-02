# Groomie

A [Claude Code](https://docs.claude.com/en/docs/claude-code) plugin that grooms a
messy, single-feature Jira issue into a clean backlog breakdown — **one epic, its user
stories, and the technical tasks that block them** — and hands it back to you as
markdown.

Bad Jira issues are the norm: vague, over-stuffed, mixing five concerns, no acceptance
criteria. Groomie reads one, researches the feature as deeply as your environment
allows, and gives you a structured breakdown you can review and file.

## What it produces

- **1 Epic** — the feature.
- **User stories** — vertical, user-visible slices, each with acceptance criteria.
- **Technical tasks** — implementation work, each explicitly **blocking** the story it
  enables.
- **Bugs** — only when the source issue reports genuinely broken behavior.
- **Open questions** — ambiguities are surfaced, never silently invented.

Output is markdown. Groomie **does not write to Jira** — you stay in control of what
gets filed.

## Requirements

- **Claude Code.**
- **Atlassian MCP** connected to your Jira (the one hard dependency — Groomie reads the
  issue through it).
- Optional: any research capability in your session (a code/knowledge-base MCP, web
  search, subagents). Groomie detects what's available and researches accordingly. None
  of it is required, and nothing is company-specific.

## Install

```
/plugin marketplace add mfozmen/groomie
/plugin install groomie
```

## Usage

```
/groomie PROJ-123            # full breakdown (default): epic + stories + tasks
/groomie PROJ-123 --stories  # quick: epic + user stories only (behavior/scope, no tasks)
```

Groomie fetches the issue, tells you how deep it can research, produces the breakdown,
**saves it to `<ISSUE-KEY>-groomed.md`**, and also prints it. `--full` (the default) reads
the code to write accurate technical tasks; `--stories` skips tasks for a faster,
behavior-only pass.

## Development

The core of Groomie is a prompt-based skill (`skills/groomie/`), so most changes are to
markdown. Conventions:

- **Conventional Commits** — commit messages drive versioning and the changelog.
- **Every change goes through a PR**, which runs an advisory Claude AI review
  (`.github/workflows/claude-review.yml`). The review needs a `CLAUDE_CODE_OAUTH_TOKEN`
  repo secret (`claude setup-token`).
- **TDD** for any deterministic code we add (none yet — the grooming logic is the LLM's).

### Releasing

Versioning uses [release-it](https://github.com/release-it/release-it) with the
conventional-changelog plugin. From `main`:

```
npm install
npm run release
```

It bumps the version (in both `package.json` and `.claude-plugin/plugin.json`), updates
`CHANGELOG.md`, tags, and creates a GitHub release — all from your Conventional Commits.

## License

MIT © Mehmet Fahri Özmen
