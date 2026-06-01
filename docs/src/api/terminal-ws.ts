import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { ptyManager } from './pty-manager';

/**
 * Setup WebSocket server for terminal connections.
 * 
 * Protocol:
 * - Client sends JSON: { type: 'input', data: string }
 * - Client sends JSON: { type: 'resize', cols: number, rows: number }
 * - Server sends JSON: { type: 'output', data: string }
 * - Server sends JSON: { type: 'exit', exitCode: number }
 * - Server sends JSON: { type: 'error', message: string }
 */
export function setupTerminalWebSocket(server: Server): void {
  const wss = new WebSocketServer({ noServer: true });

  // Handle HTTP upgrade requests
  server.on('upgrade', (req, socket, head) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    
    // Only handle /ws/terminal/<sessionId>
    const match = url.pathname.match(/^\/ws\/terminal\/(.+)$/);
    if (!match) {
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      const sessionId = match[1];
      handleConnection(ws, sessionId);
    });
  });
}

function handleConnection(ws: WebSocket, sessionId: string): void {
  const session = ptyManager.get(sessionId);

  if (!session) {
    ws.send(JSON.stringify({ type: 'error', message: 'Sessão não encontrada.' }));
    ws.close();
    return;
  }

  // Send historical data immediately
  if (session.history) {
    ws.send(JSON.stringify({ type: 'output', data: session.history }));
  }

  // Send PTY data to WebSocket client
  const dataHandler = session.ptyProcess.onData((data: string) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'output', data }));
    }
  });

  // Handle PTY exit
  const exitHandler = (exitSessionId: string, exitCode: number) => {
    if (exitSessionId === sessionId && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'exit', exitCode }));
    }
  };
  ptyManager.on('exit', exitHandler);

  // If session already exited, notify immediately
  if (session.status === 'exited') {
    ws.send(JSON.stringify({ type: 'exit', exitCode: session.exitCode }));
  }

  // Handle messages from WebSocket client
  ws.on('message', (message: Buffer | string) => {
    try {
      const msg = JSON.parse(message.toString());

      switch (msg.type) {
        case 'input':
          ptyManager.write(sessionId, msg.data);
          break;

        case 'resize':
          if (msg.cols && msg.rows) {
            ptyManager.resize(sessionId, msg.cols, msg.rows);
          }
          break;

        default:
          break;
      }
    } catch {
      // Non-JSON messages treated as raw input
      ptyManager.write(sessionId, message.toString());
    }
  });

  // Cleanup on WebSocket close
  ws.on('close', () => {
    dataHandler.dispose();
    ptyManager.removeListener('exit', exitHandler);
  });

  ws.on('error', () => {
    dataHandler.dispose();
    ptyManager.removeListener('exit', exitHandler);
  });
}
