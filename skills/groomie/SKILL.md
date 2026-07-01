---
name: groomie
description: Use when the user asks to groom, break down, or refine a Jira issue — typically invoked as `/groomie <ISSUE-KEY>` (e.g. `/groomie PROJ-123`). Fetches the issue from Jira, researches it as deeply as the environment allows, and produces a clean epic / user-story / technical-task (and bug) breakdown as markdown, with tasks blocking the stories they enable. Does NOT write anything back to Jira.
---

# Groomie

Turn one messy, single-feature Jira issue into a clean, groomed breakdown:
**1 epic → user stories → technical tasks (tasks block stories) → bugs where relevant**,
delivered as a markdown document. You never write to Jira — you produce markdown the
user reviews and files themselves.

## Input

The user gives you a Jira issue key (e.g. `PROJ-123`). It may be poorly written:
vague, over-stuffed, mixing several concerns, missing acceptance criteria. That mess
is the whole reason Groomie exists — your job is to recover the real feature underneath
it and structure it properly.

If no key is given, ask for one. Only ever groom **one feature** per run.

## Flow

Work through these steps in order. Announce each briefly so the user can follow.

### 1. Fetch the issue (required — Jira is the one hard dependency)

Read the issue from Jira via the **Atlassian MCP** server. Tool names vary by install;
look for the "get Jira issue" tool (commonly `getJiraIssue`, `jira_get_issue`, or similar).
Pull: summary, description, issue type, comments, labels, and linked issues.

If no Atlassian MCP is available, stop and tell the user: Groomie needs the Atlassian
MCP connected to read the issue. Point them to install it (Claude Code: add the
Atlassian MCP server), then retry.

### 2. Probe capabilities (decide how deep you can research)

Before researching, take stock of what THIS environment offers, and let that set your
research depth. Do not assume any company-specific tool exists — Groomie is open source.

Look for, in rough order of usefulness:
- A code/knowledge search tool (e.g. an internal engineering knowledge base MCP, a repo
  the session is opened in, `Grep`/`Glob` over local code) — for how the feature fits
  the actual system.
- Web research (`WebSearch` / `WebFetch`) — for domain, standards, prior art.
- Subagents (the `Agent` / Task tool) — to fan out research without bloating context.

Say one line about what you found and the depth you'll use. If nothing beyond the Jira
issue is available, say so and groom from the issue text alone — that is a valid mode.

### 3. Research the feature

Using whatever step 2 surfaced, dig until you understand the feature well enough to
break it down honestly: what it actually changes, who it serves, what it touches, what
is ambiguous. Prefer delegating heavy searching to subagents and keeping only the
conclusions. Note open questions rather than inventing answers.

### 4. Groom

Apply the rules in **[references/breakdown-guide.md](references/breakdown-guide.md)** to
produce the structure. Calibrate style and granularity against the worked samples in
**[references/examples.md](references/examples.md)** — those examples are how the user
"trains" Groomie, so follow their shape closely.

Core rules (full detail in the guide):
- Exactly **one epic** = the feature.
- **User stories** are vertical, user-visible slices ("As a … I want … so that …"),
  each with acceptance criteria.
- **Technical tasks** are implementation work. Each task **blocks** the story (or stories)
  it enables — a story cannot be done until its blocking tasks are done.
- **Bugs** only when the source issue actually reports broken existing behavior.
- Flag ambiguities as open questions instead of guessing.

### 5. Output markdown

Emit a single markdown document (see the shape in the breakdown guide): the epic, then
each story with its acceptance criteria and the tasks that block it, then bugs, then a
short "Open questions" section. Keep it copy-paste ready. Do **not** write to Jira.

## Boundaries

- Read-only against Jira. Never create, edit, or transition issues.
- One feature per run.
- No invented requirements — unknowns become open questions.
