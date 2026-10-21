import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

import plugin, { GroomiePlugin } from "./plugin.js"

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, "..")
const skillsDir = path.join(root, "skills")

const commandNames = [
  "groomie",
  "groomie:full",
  "groomie:stories",
  "groomie:tasks",
  "groomie:revise",
  "groomie:review",
  "groomie:push",
  "groomie:config",
]

async function configure(config) {
  const hooks = await plugin({})
  hooks.config(config)
  return config
}

test("exports the same plugin as default and named", () => {
  assert.equal(plugin, GroomiePlugin)
})

test("registers the bundled skills directory, commands and subagent", async () => {
  const config = await configure({})

  assert.deepEqual(config.skills.paths, [skillsDir])
  assert.ok(fs.existsSync(path.join(skillsDir, "groomie", "SKILL.md")))
  assert.ok(fs.existsSync(path.join(skillsDir, "review", "SKILL.md")))

  for (const name of commandNames) {
    assert.ok(config.command[name], `missing command ${name}`)
    assert.match(config.command[name].description, /\S/)
    assert.match(config.command[name].template, /\$ARGUMENTS/)
  }

  assert.equal(config.agent.groomie.mode, "subagent")
  assert.equal(config.agent.groomie.description.startsWith("Groom ONE"), true)
  assert.match(config.agent.groomie.prompt, /running inside OpenCode/)
  assert.match(config.agent.groomie.prompt, /skill\(\{ name: "groomie" \}\)/)
  assert.match(config.agent.groomie.prompt, /You are \*\*Groomie\*\* running as a subagent/)
  assert.doesNotMatch(config.agent.groomie.prompt, /(?:^|\n)name: groomie(?:\r?\n|$)/)
  assert.doesNotMatch(config.agent.groomie.prompt, /(?:^|\n)description: >-/)
})

test("does not overwrite user-provided skills, commands or agent", async () => {
  const customSkillPath = path.join(root, "my-skills")
  const config = await configure({
    skills: { paths: [customSkillPath] },
    command: { groomie: { template: "custom" } },
    agent: { groomie: { description: "custom" } },
  })

  assert.deepEqual(config.skills.paths, [customSkillPath, skillsDir])
  assert.equal(config.command.groomie.template, "custom")
  assert.equal(config.agent.groomie.description, "custom")
})

test("registers skills only when the directory exists", async () => {
  const original = fs.existsSync
  fs.existsSync = (value) => (value === skillsDir ? false : original(value))
  try {
    const config = await configure({})
    assert.equal(config.skills, undefined)
    assert.ok(config.command["groomie:full"])
  } finally {
    fs.existsSync = original
  }
})
