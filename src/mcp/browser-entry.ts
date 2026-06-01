import { BrowserMCPServer } from './browser-server/server'

async function main() {
  const server = new BrowserMCPServer()
  await server.start()
}

main().catch((err) => {
  console.error('[Browser MCP Entry] Fatal error:', err)
  process.exit(1)
})
