import fs from 'node:fs'
import path from 'node:path'
import { getUserDataPath } from './utils'

export interface SkillArgs {
  name: string
  description: string
  content: string
}

export function createSkill(args: SkillArgs, projectPath: string): string {
  const skillId = args.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const skillContent = `---\nname: ${skillId}\ndescription: ${args.description}\n---\n\n${args.content}`

  if (projectPath && fs.existsSync(projectPath)) {
    const destAgents = path.join(projectPath, '.agents', 'skills', skillId)
    fs.mkdirSync(destAgents, { recursive: true })
    fs.writeFileSync(path.join(destAgents, 'SKILL.md'), skillContent, 'utf-8')

    const destClaude = path.join(projectPath, '.claude', 'skills', skillId)
    fs.mkdirSync(destClaude, { recursive: true })
    fs.writeFileSync(path.join(destClaude, 'SKILL.md'), skillContent, 'utf-8')
  }

  const globalTemplateSkillsDir = path.resolve(__dirname, '../../templates/project-template/.agents/skills')
  if (fs.existsSync(globalTemplateSkillsDir)) {
    const destGlobal = path.join(globalTemplateSkillsDir, skillId)
    fs.mkdirSync(destGlobal, { recursive: true })
    fs.writeFileSync(path.join(destGlobal, 'SKILL.md'), skillContent, 'utf-8')
  }

  const skillsDbPath = path.join(getUserDataPath(), 'nika_skills.json')
  let skillsState: Record<string, boolean> = {}
  if (fs.existsSync(skillsDbPath)) {
    try { skillsState = JSON.parse(fs.readFileSync(skillsDbPath, 'utf-8')) } catch (_) {}
  }
  skillsState[skillId] = true
  fs.writeFileSync(skillsDbPath, JSON.stringify(skillsState, null, 2), 'utf-8')

  return `Skill "${skillId}" criada com sucesso no projeto ativo e registrada no sistema!`
}
