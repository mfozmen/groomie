---
description: "Customize Groomie by conversation — set the output language, repo→discipline map, disciplines, docs policy, or granularity without hand-editing a file. Usage: /groomie:config <what you want>"
---

Configure Groomie by conversation. Arguments: `$ARGUMENTS`

Invoke the **groomie** skill (use the Skill tool with skill `groomie`) **in this (main) thread** and
follow its **"Configure by conversation"** section. Do **not** hand this to a general-purpose
subagent (it would drop the skill's rules).

From `$ARGUMENTS`, take the natural-language customization — **no Jira key is needed** (e.g.
`/groomie:config outputs in Turkish`, `the panel repo is Frontend`, `API specs go to Confluence as a
separate task`, `prefer fewer, larger tasks`).

- Read the current **effective** config (the global `~/.groomie/config.md` merged with the
  per-project `groomie.config.md`) so the change lands on top of existing settings.
- Apply the request to the right file, **routed by nature**: output language / granularity /
  documentation policy default to the **global** file; the repo→discipline map and disciplines
  vocabulary default to the **per-project** file. The user can override scope in words
  ("just for this project" / "for all projects").
- Write the target file for the user (create `~/.groomie/` and the file if missing), preserving every
  other section, then confirm in one line **what** was set and **where**. The user never opens the
  file. If the request is unclear, ask one clarifying question rather than writing a wrong config.

Read-only against Jira — this only writes local config files. Never write anything back to Jira.

If `$ARGUMENTS` is empty, ask the user what they'd like to customize before doing anything else.
