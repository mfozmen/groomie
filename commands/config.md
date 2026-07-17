---
description: "Customize Groomie by conversation — set the output language, repo→discipline map, disciplines, personas, docs policy, or granularity without hand-editing a file. Usage: /groomie:config <what you want>"
---

Configure Groomie by conversation. Arguments: `$ARGUMENTS`

Invoke the **groomie** skill (use the Skill tool with skill `groomie`) **in this (main) thread** and
follow its **"Configure by conversation"** section. Do **not** hand this to a general-purpose
subagent (it would drop the skill's rules).

From `$ARGUMENTS`, take the natural-language customization — **no Jira key is needed** (e.g.
`/groomie:config outputs in Turkish`, `the panel repo is Frontend`, `API specs go to Confluence as a
separate task`, `prefer fewer, larger tasks`).

The skill's *Configure by conversation* section owns the exact behaviour — which file each setting
lands in (global vs per-project), how the two merge, writing where the change actually takes effect,
and confirming what was set. Follow it there; Groomie writes the config file for the user, who never
opens it. If the request is unclear, it asks one clarifying question rather than writing a wrong
config.

Read-only against Jira — this only writes local config files. Never write anything back to Jira.

If `$ARGUMENTS` is empty, ask the user what they'd like to customize before doing anything else.
