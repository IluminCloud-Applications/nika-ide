import { NikaMCPServer } from './nika-server/server'

const projectPath = process.env.PROJECT_PATH || process.cwd()

async function main() {
  const server = new NikaMCPServer(projectPath)
  await server.start()
}

main().catch((err) => {
  console.error('[Nika MCP Entry] Fatal error:', err)
  process.exit(1)
})
