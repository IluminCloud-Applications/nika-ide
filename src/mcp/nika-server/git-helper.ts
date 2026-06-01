import { execSync } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'
import { callBridge } from './utils'

export async function gitCommit(projectPath: string, message: string): Promise<string> {
  const msg = message || 'Salvo pelo Nika MCP'

  // 1. Check if git is initialized
  if (!fs.existsSync(path.join(projectPath, '.git'))) {
    execSync('git init -b main', { cwd: projectPath })
  }

  // 2. Check user name / email
  try {
    execSync('git config user.name', { cwd: projectPath })
  } catch {
    try {
      execSync('git config --local user.name "AI Nika"', { cwd: projectPath })
    } catch (_) {}
  }
  try {
    execSync('git config user.email', { cwd: projectPath })
  } catch {
    try {
      execSync('git config --local user.email "ai-nika@ilumin.internal"', { cwd: projectPath })
    } catch (_) {}
  }

  // 3. Stage changes
  execSync('git add -A', { cwd: projectPath })

  // 4. Check if there are changes
  const status = execSync('git status --porcelain', { cwd: projectPath, encoding: 'utf-8' }).trim()
  if (!status) {
    return 'Nenhuma alteração pendente para salvar.'
  }

  // 5. Commit
  const escMsg = msg.replace(/"/g, '\\"')
  execSync(`git commit -m "${escMsg}"`, { cwd: projectPath })

  // Notify Electron bridge so the UI updates
  try {
    await callBridge('/git-refresh')
  } catch (_) {}

  return `Versão salva com sucesso com a mensagem: "${msg}"`
}
