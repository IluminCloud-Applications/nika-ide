import { TasksMCPServer } from './tasks-server/server'

const projectPath = process.env.PROJECT_PATH || process.cwd()

async function main() {
  const server = new TasksMCPServer(projectPath)
  await server.start()
}

main().catch((err) => {
  console.error('[Tasks MCP Entry] Fatal error:', err)
  process.exit(1)
})
