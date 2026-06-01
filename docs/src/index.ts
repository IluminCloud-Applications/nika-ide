import express from 'express';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { initDb } from './db/init';
import { apiRouter } from './api/routes';
import { setupTerminalWebSocket } from './api/terminal-ws';

export const PORT = 8390;

async function main() {
  await initDb();

  const app = express();
  app.use(cors());
  app.use(express.json());

  // Static files are at <package-root>/public/
  // __dirname is <package-root>/dist/ so we go one level up
  app.use(express.static(path.join(__dirname, '../public')));

  app.use('/api', apiRouter);

  const server = http.createServer(app);
  setupTerminalWebSocket(server);

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      // Another instance is already running — that's fine
      console.error(`[TaskMe] Port ${PORT} already in use. Server may already be running.`);
      process.exit(0);
    }
    console.error('[TaskMe] Server error:', err);
    process.exit(1);
  });

  server.listen(PORT, () => {
    console.error(`[TaskMe] Frontend & API running at http://localhost:${PORT}`);
  });
}

main().catch(err => {
  console.error('[TaskMe] Failed to start server:', err);
  process.exit(1);
});
