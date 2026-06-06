import { spawn } from 'node:child_process'
import os from 'node:os'

/**
 * Executa de forma assíncrona uma ferramenta do IluminMCP enviando mensagens JSON-RPC via stdio.
 */
export function callIluminMcpTool(apiKey: string, toolName: string, argumentsObj: any = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    const isWin = os.platform() === 'win32'
    const cmd = isWin ? 'npx.cmd' : 'npx'
    const args = ['-y', 'ilumin-mcp', '--x-api-key', apiKey]

    const child = spawn(cmd, args, {
      shell: true,
      env: { ...process.env }
    })

    let stdoutData = ''
    let stderrData = ''

    child.stdout.on('data', (data) => {
      stdoutData += data.toString()
    })

    child.stderr.on('data', (data) => {
      stderrData += data.toString()
    })

    child.on('error', (err) => {
      reject(err)
    })

    child.on('close', (code) => {
      const lines = stdoutData.split('\n')
      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          try {
            const parsed = JSON.parse(trimmed)
            if (parsed.result) {
              return resolve(parsed.result)
            }
            if (parsed.error) {
              return reject(new Error(parsed.error.message || 'Erro interno do MCP'))
            }
          } catch {
            // Ignorar JSONs parciais ou inválidos e continuar buscando na saída
          }
        }
      }
      reject(new Error(`Falha no processo IluminMCP (código ${code}). Stderr: ${stderrData.trim() || 'Sem saída de erro.'}`))
    })

    // Envia o payload JSON-RPC para o stdin do servidor MCP
    const payload = JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: argumentsObj
      },
      id: 1
    })

    child.stdin.write(payload + '\n')
    child.stdin.end()
  })
}
