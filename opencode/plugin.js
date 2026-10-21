import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, "..")
const skillsDir = path.join(root, "skills")
const commandsDir = path.join(here, "commands")
const agentFile = path.join(root, "agents", "groomie.md")

const AGENT_NOTE = [
  "You are running inside OpenCode.",
  "",
  "- Load the groomie skill with the `skill` tool: `skill({ name: \"groomie\" })`.",
  "- Use the tools this session actually exposes; OpenCode's equivalents for the skill's actions are",
  "  `read`, `grep`, `glob`, `webfetch`, `websearch`, `task` and `bash` when available.",
  "- Run the skill in this thread; you are the dedicated `groomie` subagent.",
].join("\n")

const COMMANDS = [
  {
    name: "groomie",
    file: "groomie.md",
    description:
      "Groom a messy single-feature idea — a Jira issue, Confluence page, URL, or file — into an epic / user-story / technical-task breakdown as markdown. Usage: /groomie <source> [<source> …] (full) · /groomie:stories <source> …",
  },
  {
    name: "groomie:full",
    file: "full.md",
    description:
      "Groom a feature idea — a Jira issue, Confluence page, URL, or file — into a FULL epic / user-story / technical-task breakdown. Usage: /groomie:full <source> [<source> …]",
  },
  {
    name: "groomie:stories",
    file: "stories.md",
    description:
      "Groom a feature idea — a Jira issue, Confluence page, URL, or file — into an epic + user stories only (no technical tasks). Usage: /groomie:stories <source> [<source> …]",
  },
  {
    name: "groomie:tasks",
    file: "tasks.md",
    description:
      "Add the technical-task layer to an existing epic + user-stories breakdown, preserving them — the stories→full upgrade. Usage: /groomie:tasks <ID>",
  },
  {
    name: "groomie:revise",
    file: "revise.md",
    description:
      "Revise an already-produced Groomie breakdown in place — add / remove / split / edit an epic, story, or task. Usage: /groomie:revise <ID> <change>",
  },
  {
    name: "groomie:review",
    file: "review.md",
    description:
      "Review an existing Groomie breakdown against the grooming contract — leak scan, shape, sections, diagram — and fix violations in one bounded pass. Usage: /groomie:review <ID>",
  },
  {
    name: "groomie:push",
    file: "push.md",
    description:
      "Push a finalized breakdown into Jira via MCP — creates/updates the epic, stories, tasks, bugs and their links, idempotently, only after you approve a preview. Usage: /groomie:push <ID>",
  },
  {
    name: "groomie:config",
    file: "config.md",
    description:
      "Customize Groomie by conversation — set the output language, repo→discipline map, disciplines, personas, docs policy, or granularity without hand-editing a file. Usage: /groomie:config <what you want>",
  },
]

const AGENT_DESCRIPTION =
  "Groom ONE messy, single-feature idea — a Jira issue, Confluence page, URL, or file source set — into an epic / user-story / technical-task breakdown by running the groomie skill faithfully. Use this agent ONLY when the grooming must happen inside a subagent, e.g. an orchestration flow that fans work out to agents. In the normal case, prefer invoking the groomie skill DIRECTLY in the main thread (or via /groomie <source> …). Read-only against Jira."

function read(file) {
  try {
    return fs.readFileSync(file, "utf8")
  } catch {
    return undefined
  }
}

function stripFrontmatter(markdown) {
  if (!markdown.startsWith("---")) return markdown
  const end = markdown.indexOf("\n---", 3)
  if (end === -1) return markdown
  return markdown.slice(end + 4).replace(/^\r?\n/, "")
}

function addCommand(config, entry) {
  if (config.command?.[entry.name]) return
  const markdown = read(path.join(commandsDir, entry.file))
  if (markdown === undefined) return
  config.command ??= {}
  config.command[entry.name] = {
    description: entry.description,
    template: markdown.trim(),
  }
}

export const GroomiePlugin = async () => {
  return {
    config(config) {
      if (fs.existsSync(skillsDir)) {
        config.skills ??= {}
        const paths = (config.skills.paths ??= [])
        if (!paths.includes(skillsDir)) paths.push(skillsDir)
      }

      config.command ??= {}
      for (const entry of COMMANDS) addCommand(config, entry)

      if (!config.agent?.groomie) {
        const markdown = read(agentFile)
        if (markdown !== undefined) {
          config.agent ??= {}
          config.agent.groomie = {
            description: AGENT_DESCRIPTION,
            mode: "subagent",
            prompt: `${AGENT_NOTE}\n\n${stripFrontmatter(markdown).trim()}`,
          }
        }
      }
    },
  }
}

export default GroomiePlugin
