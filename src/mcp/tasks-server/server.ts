import { execSync } from 'node:child_process'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js'
import { initDb, getNextPending, getTaskById, moveToExecuting, moveToReview, addTask } from './db'
import { TOOLS } from './tools'

function autoGitCommit(projectPath: string, title: string) {
  try {
    execSync('git add .', { cwd: projectPath, timeout: 10000 })
    const msg = `task: ${title.replace(/"/g, "'")}`
    execSync(`git commit -m "${msg}"`, { cwd: projectPath, timeout: 10000 })
  } catch (_) {
    // Non-fatal
  }
}

export class TasksMCPServer {
  private server: Server

  constructor(private projectPath: string) {
    this.server = new Server(
      { name: 'nika-tasks', version: '1.0.0' },
      { capabilities: { tools: {} } }
    )
    this.server.onerror = (err) => console.error('[Tasks MCP Error]', err)
    this.setupHandlers()
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: TOOLS
    }))

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params as any

        // ── GET NEXT TASK ─────────────────────────────────────────────
        if (name === 'get_next_task') {
          const projectPath: string = args?.project_path || this.projectPath
          initDb(projectPath)

          const task = getNextPending(projectPath)
          if (!task) {
            return {
              content: [{
                type: 'text',
                text: `Nenhuma tarefa pendente encontrada para o projeto em: ${projectPath}\nTodas as tarefas já foram concluídas ou estão em revisão. 🎉`
              }]
            }
          }

          // Auto-move to executing so other AIs know this task is taken
          moveToExecuting(projectPath, task.id)

          const hasRejection = !!task.rejection_reason
          const lines = [
            hasRejection
              ? '⚠️  TAREFA REJEITADA — Corrija o problema antes de continuar.'
              : '📋 Próxima tarefa obtida e movida para EXECUTANDO:',
            '',
            `ID: ${task.id}`,
            `Título: ${task.title}`,
            `Descrição:\n${task.description}`,
            ...(hasRejection ? [
              '',
              '=== MOTIVO DA REJEIÇÃO ===',
              task.rejection_reason!,
              ''
            ] : []),
            '',
            '=== INSTRUÇÕES PARA A IA ===',
            '1. A tarefa foi automaticamente movida para EXECUTANDO no Kanban.',
            '2. Leia a tarefa com atenção e analise o que precisa ser feito.',
            '3. Execute a implementação descrita.',
            `4. Quando terminar 100%, chame move_to_review com task_id=${task.id}.`,
            '5. Inclua em ai_notes um resumo do que foi implementado.'
          ]

          return { content: [{ type: 'text', text: lines.join('\n') }] }
        }

        // ── MOVE TO REVIEW ────────────────────────────────────────────
        if (name === 'move_to_review') {
          const projectPath: string = args?.project_path || this.projectPath
          const taskId: number = args?.task_id
          const aiNotes: string | undefined = args?.ai_notes

          const before = getTaskById(projectPath, taskId)
          if (!before) {
            throw new Error(`Tarefa com ID ${taskId} não encontrada no projeto.`)
          }
          if (before.column !== 'pending' && before.column !== 'executing') {
            throw new Error(`Tarefa ${taskId} não está em pendente/executando (atual: ${before.column}).`)
          }

          moveToReview(projectPath, taskId, aiNotes)
          autoGitCommit(projectPath, before.title)

          return {
            content: [{
              type: 'text',
              text: [
                `✅ Tarefa "${before.title}" (ID: ${taskId}) movida para REVISÃO com sucesso.`,
                'Um git commit automático foi feito com as alterações.',
                '',
                'Aguarde a aprovação do usuário. Se aprovada, será arquivada.',
                'Se rejeitada, voltará para Pendentes com o motivo para você corrigir.',
                '',
                '=== PRÓXIMOS PASSOS ===',
                'Chame get_next_task para obter a próxima tarefa pendente.'
              ].join('\n')
            }]
          }
        }

        // ── ADD TASK ──────────────────────────────────────────────────
        if (name === 'add_task') {
          const projectPath: string = args?.project_path || this.projectPath
          const title: string = args?.title
          const description: string = args?.description

          if (!title || !description) {
            throw new Error('Título e descrição são obrigatórios para criar uma tarefa.')
          }

          initDb(projectPath)
          const task = addTask(projectPath, title, description)

          return {
            content: [{
              type: 'text',
              text: `✅ Tarefa criada com sucesso!\nID: ${task.id}\nTítulo: ${task.title}\nDescrição: ${task.description}\nColuna: ${task.column}`
            }]
          }
        }

        throw new Error(`Tool desconhecida: ${name}`)
      } catch (error: any) {
        console.error(`[Tasks MCP] Erro na tool ${request.params.name}:`, error)
        return {
          content: [{ type: 'text', text: `Erro: ${error.message}` }],
          isError: true
        }
      }
    })
  }

  async start() {
    process.on('uncaughtException', (err) => console.error('[Tasks MCP uncaughtException]', err))
    process.on('unhandledRejection', (r) => console.error('[Tasks MCP unhandledRejection]', r))
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.error('Nika IDE Tasks MCP Server running on stdio')
  }
}
