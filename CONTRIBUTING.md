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
commands/                # slash commands: /groomie (+ /groomie:full, /groomie:stories)
.claude-plugin/          # plugin + marketplace manifests
.github/workflows/       # required Claude AI review + SonarCloud
visualizer/              # companion graph viewer (isolated app, not part of the plugin)
```

The grooming quality lives in `SKILL.md` + `references/`. You "teach" Groomie by refining
those rules and adding real before/after examples to `examples.md` — no model training.

## Conventions

- **Conventional Commits** — commit messages drive versioning and the changelog.
- **Every change goes through a PR**, which runs a **required** Claude AI review
  (`.github/workflows/claude-review.yml`). The review needs a `CLAUDE_CODE_OAUTH_TOKEN`
  repo secret — generate it with `claude setup-token`.
- **TDD** for any deterministic code. The grooming logic itself is the LLM's, but the
  `visualizer/` companion app has real code — unit-test it with vitest (`npm --prefix
  visualizer test`).
- **SonarCloud** (`.github/workflows/sonarcloud.yml`) runs static analysis + coverage on
  `visualizer/`; its quality gate (`SonarCloud Code Analysis`) is a **required** check
  alongside the Claude review. Coverage comes from vitest — run `npm --prefix visualizer run
  test:coverage` locally. (One-time owner setup: create the project on
  [sonarcloud.io](https://sonarcloud.io) (org `mfozmen`, key `mfozmen_groomie`), turn **off**
  Automatic Analysis, and add a `SONAR_TOKEN` repo secret.)
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
