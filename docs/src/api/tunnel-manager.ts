import { spawn, ChildProcess, execSync } from 'child_process';
import { EventEmitter } from 'events';

export interface TunnelState {
  status: 'idle' | 'starting' | 'running' | 'error';
  url: string | null;
  error: string | null;
  pid: number | null;
}

class TunnelManager extends EventEmitter {
  private process: ChildProcess | null = null;
  private state: TunnelState = {
    status: 'idle',
    url: null,
    error: null,
    pid: null,
  };

  getState(): TunnelState {
    return { ...this.state };
  }

  /** Check if cloudflared is installed. Returns version string or null. */
  checkInstalled(): string | null {
    try {
      const out = execSync('cloudflared --version 2>&1', { timeout: 5000 }).toString().trim();
      return out;
    } catch {
      return null;
    }
  }

  /** Start cloudflared tunnel. Returns immediately; emits 'url' and 'error' events. */
  start(port: number = 8390): void {
    if (this.state.status === 'running' || this.state.status === 'starting') return;

    this.state = { status: 'starting', url: null, error: null, pid: null };
    this.emit('state', this.state);

    const child = spawn('cloudflared', ['tunnel', '--url', `http://localhost:${port}`], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    this.process = child;
    this.state.pid = child.pid ?? null;

    const urlRegex = /https:\/\/[a-z0-9\-]+\.trycloudflare\.com/i;

    const extractUrl = (data: Buffer) => {
      const text = data.toString();
      const match = text.match(urlRegex);
      if (match && this.state.status === 'starting') {
        this.state.status = 'running';
        this.state.url = match[0];
        this.emit('state', this.state);
      }
    };

    child.stdout?.on('data', extractUrl);
    child.stderr?.on('data', extractUrl);

    child.on('error', (err) => {
      this.state = { status: 'error', url: null, error: err.message, pid: null };
      this.emit('state', this.state);
      this.process = null;
    });

    child.on('exit', (code) => {
      if (this.state.status !== 'error') {
        this.state = {
          status: 'idle',
          url: null,
          error: code !== 0 ? `cloudflared exited with code ${code}` : null,
          pid: null,
        };
        this.emit('state', this.state);
      }
      this.process = null;
    });
  }

  /** Stop the running tunnel. */
  stop(): void {
    if (this.process) {
      try { this.process.kill(); } catch { /* already dead */ }
      this.process = null;
    }
    this.state = { status: 'idle', url: null, error: null, pid: null };
    this.emit('state', this.state);
  }
}

export const tunnelManager = new TunnelManager();
