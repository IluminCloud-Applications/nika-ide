import fs from 'node:fs'
import path from 'node:path'

/**
 * Atualiza o bloco de informações do projeto nos arquivos de instrução (GEMINI.md, CLAUDE.md, AGENTS.md).
 * Se o arquivo não existir no diretório do projeto, ele é criado com um cabeçalho padrão apropriado.
 */
export function updateProjectInstructions(projectPath: string, name: string, description: string) {
  const filesToUpdate = {
    'GEMINI.md': '# AI System Instructions (Antigravity CLI)',
    'CLAUDE.md': '# AI System Instructions (Claude Code)',
    'AGENTS.md': '# AI System Instructions (Agents)'
  }
  
  for (const [fileName, defaultHeader] of Object.entries(filesToUpdate)) {
    const filePath = path.join(projectPath, fileName)
    
    try {
      let content = ''
      if (fs.existsSync(filePath)) {
        content = fs.readFileSync(filePath, 'utf-8')
      } else {
        content = `${defaultHeader}\n`
      }

      const infoBlock = `<!-- PROJECT_INFO_START -->\n# Project: ${name}\nDescription: ${description}\n<!-- PROJECT_INFO_END -->`

      if (content.includes('<!-- PROJECT_INFO_START -->') && content.includes('<!-- PROJECT_INFO_END -->')) {
        // Substitui o bloco existente
        content = content.replace(/<!-- PROJECT_INFO_START -->[\s\S]*?<!-- PROJECT_INFO_END -->/, infoBlock)
      } else {
        // Insere após o primeiro título de primeiro nível se ele existir no topo
        const firstLineMatch = content.match(/^(#[^\n]+)\n/)
        if (firstLineMatch) {
          const title = firstLineMatch[1]
          content = content.replace(title, `${title}\n\n${infoBlock}`)
        } else {
          content = `${infoBlock}\n\n${content}`
        }
      }

      fs.writeFileSync(filePath, content, 'utf-8')
    } catch (error) {
      console.error(`Erro ao atualizar/criar o arquivo de instrução ${fileName}:`, error)
    }
  }
}
