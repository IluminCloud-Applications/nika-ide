import { execSync, spawn } from 'node:child_process'
import path from 'node:path'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js'
import { TOOLS } from './tools'
import { callBridge, checkUrlOnline, checkUrlOffline } from './utils'
import { gitCommit } from './git-helper'
import { sqlExecute } from './db-helper'
import { checkApp } from './checker'
import { createPrompt, createAgent, createMcp, createSkill, listDocs, getDoc } from './creator'

export class NikaMCPServer {
  private server: Server

  constructor(private projectPath: string) {
    this.server = new Server(
      { name: 'nika-ide-mcp', version: '1.0.0' },
      { capabilities: { tools: {} } }
    )
    this.server.onerror = (err) => console.error('[Nika MCP Error]', err)
    this.setupHandlers()
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: TOOLS
    }))

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params as any

        if (name === 'start_app') {
          let viaBridge = false
          try {
            await callBridge('/start')
            viaBridge = true
          } catch (err) {
            console.error('[Nika MCP] Bridge /start failed, falling back to manual start:', err)
          }

          if (!viaBridge) {
            execSync('docker compose up -d --build', { cwd: this.projectPath, timeout: 60000 })

            const frontendPath = path.join(this.projectPath, 'frontend')
            const devProcess = spawn('npm', ['run', 'dev', '--', '--port', '5177'], {
              cwd: frontendPath,
              shell: true,
              detached: true,
              stdio: 'ignore'
            })
            devProcess.unref()
          }

          const isOnline = await checkUrlOnline('http://localhost:5177', 35000)

          return {
            content: [{
              type: 'text',
              text: isOnline 
                ? 'Servidores iniciados com sucesso! Frontend respondendo na porta 5177.'
                : 'Servidores foram disparados, mas a porta 5177 ainda não respondeu.'
            }]
          }
        }

        if (name === 'stop_app') {
          let viaBridge = false
          try {
            await callBridge('/stop')
            viaBridge = true
          } catch (err) {
            console.error('[Nika MCP] Bridge /stop failed, falling back to manual stop:', err)
          }

          if (!viaBridge) {
            execSync('docker compose down', { cwd: this.projectPath, timeout: 30000 })

            try {
              if (process.platform === 'win32') {
                execSync('npx kill-port 5177', { timeout: 10000 })
              } else {
                execSync('fuser -k 5177/tcp 2>/dev/null || true', { timeout: 5000 })
              }
            } catch (_) {}
          }

          const isOffline = await checkUrlOffline('http://localhost:5177', 10000)

          return {
            content: [{
              type: 'text',
              text: isOffline 
                ? 'Todos os servidores foram desligados com sucesso!'
                : 'O sinal de parada foi enviado, mas a porta 5177 ainda parece ativa.'
            }]
          }
        }

        if (name === 'docker_exec') {
          const cmd = args.command
          const output = execSync(`docker compose exec -T backend ${cmd}`, {
            cwd: this.projectPath,
            encoding: 'utf-8',
            timeout: 30000
          })

          return {
            content: [{
              type: 'text',
              text: `Comando executado!\n\nSaída:\n${output}`
            }]
          }
        }

        if (name === 'sql_execute') {
          const output = sqlExecute(this.projectPath, args.sql)
          return {
            content: [{
              type: 'text',
              text: output
            }]
          }
        }

        if (name === 'git_commit') {
          const result = await gitCommit(this.projectPath, args.message)
          return {
            content: [{
              type: 'text',
              text: result
            }]
          }
        }

        if (name === 'check_app') {
          const result = await checkApp(this.projectPath)
          return {
            content: [{
              type: 'text',
              text: result
            }]
          }
        }

        if (name === 'create_prompt') {
          const result = createPrompt(args)
          return { content: [{ type: 'text', text: result }] }
        }

        if (name === 'create_agent') {
          const result = createAgent(args)
          return { content: [{ type: 'text', text: result }] }
        }

        if (name === 'create_mcp') {
          const result = createMcp(args, this.projectPath)
          return { content: [{ type: 'text', text: result }] }
        }

        if (name === 'create_skill') {
          const result = createSkill(args, this.projectPath)
          return { content: [{ type: 'text', text: result }] }
        }

        if (name === 'list_docs') {
          const result = listDocs()
          return { content: [{ type: 'text', text: result }] }
        }

        if (name === 'get_doc') {
          const result = getDoc(args.slug)
          return { content: [{ type: 'text', text: result }] }
        }

        throw new Error(`Método do MCP desconhecido: ${name}`)
      } catch (err: any) {
        return {
          isError: true,
          content: [{
            type: 'text',
            text: `Erro de execução no Nika MCP: ${err.message}`
          }]
        }
      }
    })
  }

  async start() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.error('Nika IDE MCP running')
  }
}
