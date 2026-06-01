/**
 * MCP-only entrypoint for TaskMe.
 *
 * Responsibilities:
 *  1. Ensure the web server (Express) is running on port 8390.
 *     If not, spawns it as a fully detached background process.
 *  2. Opens the browser on first launch.
 *  3. Starts the MCP stdio server for AI integration.
 *
 * This file intentionally does NOT run Express itself — keeping the MCP
 * process lightweight and free from port-conflict crashes.
 */
import net from 'net';
import { spawn } from 'child_process';
import path from 'path';
import { initDb } from './db/init';
import { TaskMeMCPServer } from './mcp/server';
import { openBrowser } from './utils/platform';

const PORT = 8390;
const SERVER_STARTUP_WAIT_MS = 1800;

/** Checks if something is already listening on the given port. */
function isPortListening(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host: '127.0.0.1' });
    socket.once('connect', () => { socket.destroy(); resolve(true); });
    socket.once('error', () => resolve(false));
    socket.setTimeout(500, () => { socket.destroy(); resolve(false); });
  });
}

/**
 * Ensures the web server is running.
 * If not, spawns dist/index.js as a fully detached background process.
 * Returns true if a new server was spawned.
 */
async function ensureServerRunning(): Promise<boolean> {
  const running = await isPortListening(PORT);
  if (running) return false;

  const serverScript = path.join(__dirname, 'index.js');

  const child = spawn(process.execPath, [serverScript], {
    detached: true,
    stdio: 'ignore',
    env: process.env,
  });
  child.unref();

  // Give the server time to bind the port before MCP connects
  await new Promise(resolve => setTimeout(resolve, SERVER_STARTUP_WAIT_MS));
  return true;
}

async function main() {
  // Initialize DB (creates ~/.taskme/ if needed)
  await initDb();

  // Start web server in background if not already running
  const serverWasSpawned = await ensureServerRunning();

  // Open browser only when we just started the server
  if (serverWasSpawned) {
    openBrowser(`http://localhost:${PORT}`);
  }

  // Start MCP stdio — blocks until the AI disconnects
  const mcpServer = new TaskMeMCPServer();
  await mcpServer.start();
}

main().catch(err => {
  // ONLY stderr — never stdout (would corrupt MCP JSON-RPC protocol)
  console.error('[TaskMe MCP] Fatal startup error:', err);
  process.exit(1);
});
