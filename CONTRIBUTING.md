# Contributing to Groomie

Thanks for helping improve Groomie! The core of the plugin is a **prompt-based skill**, so
most changes are to markdown, not code.

## Project layout

```
skills/groomie/
  SKILL.md               # the brain: the grooming flow and rules
  references/
    breakdown-guide.md   # epic / story / task rules + the output shape
    examples.md          # gold-standard worked examples (the calibration set)
commands/groomie.md      # the /groomie slash command
.claude-plugin/          # plugin + marketplace manifests
.github/workflows/       # the advisory Claude AI review
```

The grooming quality lives in `SKILL.md` + `references/`. You "teach" Groomie by refining
those rules and adding real before/after examples to `examples.md` — no model training.

## Conventions

- **Conventional Commits** — commit messages drive versioning and the changelog.
- **Every change goes through a PR**, which runs an advisory Claude AI review
  (`.github/workflows/claude-review.yml`). The review needs a `CLAUDE_CODE_OAUTH_TOKEN`
  repo secret — generate it with `claude setup-token`.
- **TDD** for any deterministic code (there is none yet — the grooming logic is the LLM's;
  tests kick in when we add a helper such as a breakdown validator).
- Before opening a PR, skim [`REVIEW.md`](REVIEW.md) — it lists what reviewers check first,
  led by the open-source dependency rule (**Atlassian MCP is the only hard dependency**;
  never introduce company- or vendor-specific tooling).

## Releasing

Versioning uses [release-it](https://github.com/release-it/release-it) with the
conventional-changelog plugin. From `main`:

```
npm install
npm run release
```

It bumps the version (in both `package.json` and `.claude-plugin/plugin.json`), updates
`CHANGELOG.md`, tags the release, and creates a GitHub release — all derived from your
Conventional Commits.
