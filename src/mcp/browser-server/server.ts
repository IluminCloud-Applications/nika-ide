import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js'
import { bridgeRequest } from './bridge-client'

function cleanPath(urlStr: string): string {
  try {
    const u = new URL(urlStr)
    return u.pathname + u.search
  } catch {
    return urlStr
  }
}

export class BrowserMCPServer {
  private server: Server

  constructor() {
    this.server = new Server(
      { name: 'nika-browser', version: '1.0.0' },
      { capabilities: { tools: {} } }
    )
    this.server.onerror = (err) => console.error('[Browser MCP Error]', err)
    this.setupHandlers()
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_console_logs',
          description: [
            'Obtém os logs do console do navegador interno (preview) do Nika IDE.',
            'Inclui console.log/info/warn/error e exceções não capturadas da página.',
            'Útil para depurar erros de runtime e verificar o comportamento da aplicação.'
          ].join(' '),
          inputSchema: {
            type: 'object',
            properties: {
              level: {
                type: 'string',
                enum: ['all', 'log', 'info', 'warn', 'error', 'debug'],
                description: 'Filtra por nível. Padrão: all.'
              },
              limit: {
                type: 'number',
                description: 'Número máximo de logs mais recentes a retornar. Padrão: 100.'
              }
            }
          }
        },
        {
          name: 'list_network',
          description: [
            'Lista todas as chamadas de API (fetch/XHR) feitas pela página no navegador interno.',
            'Retorna id, método, endpoint, status e duração de cada requisição.',
            'Use o id em get_network_request para obter payload e resposta completos.'
          ].join(' '),
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Número máximo de requisições mais recentes a listar. Padrão: 100.'
              }
            }
          }
        },
        {
          name: 'get_network_request',
          description: [
            'Obtém os detalhes completos de uma chamada de API específica:',
            'endpoint, método, status, payload enviado e resposta do servidor.',
            'Use o id retornado por list_network.'
          ].join(' '),
          inputSchema: {
            type: 'object',
            properties: {
              id: {
                type: 'number',
                description: 'ID da requisição (obtido em list_network).'
              }
            },
            required: ['id']
          }
        },
        {
          name: 'navigate',
          description: [
            'Navega o navegador interno (preview) para uma URL.',
            'Aceita URL absoluta (http://localhost:5177/foo) ou caminho relativo (/foo),',
            'que será resolvido a partir da página atual. Use para controlar o browser e testar rotas.'
          ].join(' '),
          inputSchema: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'URL absoluta ou caminho relativo para navegar.'
              }
            },
            required: ['url']
          }
        },
        {
          name: 'execute_console',
          description: [
            'Executa código JavaScript no console do navegador interno (preview), no contexto da página.',
            'Retorna o valor avaliado (igual ao console do DevTools). Use para testar comportamento,',
            'inspecionar/alterar o DOM, disparar funções, ler estado, etc.',
            'Para múltiplas instruções, use uma IIFE: (() => { ...; return resultado })().'
          ].join(' '),
          inputSchema: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                description: 'Código JavaScript a executar na página. Pode usar await no topo.'
              }
            },
            required: ['code']
          }
        },
        {
          name: 'screenshot',
          description: [
            'Captura um screenshot (PNG) da página atual do navegador interno (preview)',
            'e retorna a imagem para que você possa visualizar o estado da página.'
          ].join(' '),
          inputSchema: {
            type: 'object',
            properties: {}
          }
        }
      ]
    }))

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params as any

        // ── GET CONSOLE LOGS ──────────────────────────────────────────
        if (name === 'get_console_logs') {
          const limit = typeof args?.limit === 'number' ? args.limit : 100
          const level = args?.level || 'all'
          const qs = new URLSearchParams({ limit: String(limit), level }).toString()
          const { body } = await bridgeRequest('GET', `/console?${qs}`)
          const logs: any[] = body?.logs || []
          if (!logs.length) {
            return { content: [{ type: 'text', text: 'Nenhum log de console capturado ainda.' }] }
          }
          const text = logs
            .map(l => `[${l.level.toUpperCase()}] ${l.data}`)
            .join('\n')
          return { content: [{ type: 'text', text }] }
        }

        // ── LIST NETWORK ──────────────────────────────────────────────
        if (name === 'list_network') {
          const limit = typeof args?.limit === 'number' ? args.limit : 100
          const { body } = await bridgeRequest('GET', `/network?limit=${limit}`)
          const reqs: any[] = body?.requests || []
          if (!reqs.length) {
            return { content: [{ type: 'text', text: 'Nenhuma chamada de API (fetch/XHR) capturada ainda.' }] }
          }
          const lines = reqs.map(r => {
            const status = r.status === 0 ? 'FAIL' : r.status
            return `#${r.id}  ${r.method.padEnd(6)} ${status}  ${cleanPath(r.url)}  (${r.duration}ms)`
          })
          return {
            content: [{
              type: 'text',
              text: `${reqs.length} chamada(s) de API:\n\n${lines.join('\n')}\n\nUse get_network_request com o id (#) para ver payload e resposta.`
            }]
          }
        }

        // ── GET NETWORK REQUEST ───────────────────────────────────────
        if (name === 'get_network_request') {
          const id = args?.id
          if (typeof id !== 'number') throw new Error('Parâmetro "id" (number) é obrigatório.')
          const { status, body } = await bridgeRequest('GET', `/network/${id}`)
          if (status === 404) {
            return { content: [{ type: 'text', text: body?.error || `Requisição ${id} não encontrada.` }], isError: true }
          }
          const r = body?.request
          const text = [
            `Endpoint: ${r.method} ${r.url}`,
            `Status: ${r.status === 0 ? 'FAIL' : r.status} ${r.statusText}`,
            `Duração: ${r.duration}ms`,
            '',
            'Payload enviado:',
            r.payload || '(nenhum)',
            '',
            'Resposta do servidor:',
            r.response || '(vazia)'
          ].join('\n')
          return { content: [{ type: 'text', text }] }
        }

        // ── NAVIGATE ──────────────────────────────────────────────────
        if (name === 'navigate') {
          const targetUrl = args?.url
          if (!targetUrl || typeof targetUrl !== 'string') throw new Error('Parâmetro "url" é obrigatório.')
          const { status, body } = await bridgeRequest('POST', '/navigate', { url: targetUrl })
          if (status !== 200) {
            return { content: [{ type: 'text', text: body?.error || 'Falha ao navegar.' }], isError: true }
          }
          return { content: [{ type: 'text', text: `Navegado para: ${body.url}` }] }
        }

        // ── EXECUTE CONSOLE ───────────────────────────────────────────
        if (name === 'execute_console') {
          const code = args?.code
          if (!code || typeof code !== 'string') throw new Error('Parâmetro "code" é obrigatório.')
          const { status, body } = await bridgeRequest('POST', '/eval', { code })
          if (status !== 200) {
            return { content: [{ type: 'text', text: body?.error || 'Falha ao executar código.' }], isError: true }
          }
          if (!body.ok) {
            return { content: [{ type: 'text', text: `Erro ao executar: ${body.error}` }], isError: true }
          }
          return { content: [{ type: 'text', text: `Resultado:\n${body.result}` }] }
        }

        // ── SCREENSHOT ────────────────────────────────────────────────
        if (name === 'screenshot') {
          const { status, body } = await bridgeRequest('GET', '/screenshot')
          if (status !== 200 || !body?.data) {
            return { content: [{ type: 'text', text: body?.error || 'Falha ao capturar screenshot.' }], isError: true }
          }
          return {
            content: [{
              type: 'image',
              data: body.data,
              mimeType: body.mimeType || 'image/png'
            }]
          }
        }

        throw new Error(`Tool desconhecida: ${name}`)
      } catch (error: any) {
        console.error(`[Browser MCP] Erro na tool ${request.params.name}:`, error)
        return {
          content: [{ type: 'text', text: `Erro: ${error.message}` }],
          isError: true
        }
      }
    })
  }

  async start() {
    process.on('uncaughtException', (err) => console.error('[Browser MCP uncaughtException]', err))
    process.on('unhandledRejection', (r) => console.error('[Browser MCP unhandledRejection]', r))
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.error('Nika IDE Browser MCP Server running on stdio')
  }
}
