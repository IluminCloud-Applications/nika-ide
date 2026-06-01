import * as pty from 'node-pty';
import { EventEmitter } from 'events';
import { getShellConfig } from '../utils/platform';

export interface PtySession {
  id: string;
  projectId: number;
  projectPath: string;
  slug?: string;
  ptyProcess: pty.IPty;
  history: string;
  status: 'running' | 'exited';
  exitCode: number | null;
  createdAt: Date;
}

class PtyManager extends EventEmitter {
  private sessions: Map<string, PtySession> = new Map();

  /** Spawn a new PTY session running gemini in yolo mode */
  spawn(projectId: number, projectPath: string, slug?: string): PtySession {
    // Kill existing session for this project AND this slug if any
    const existing = this.getByProjectAndSlug(projectId, slug);
    if (existing && existing.status === 'running') {
      this.kill(existing.id);
    }

    const sessionId = `pty-${projectId}-${Date.now()}`;

    // getShellConfig resolves the right shell per OS (bash/zsh/pwsh)
    // with login flags so NVM/Homebrew/PATH are loaded
    const { shell, args } = getShellConfig('gemini --yolo "execute tasks with taskme tool"');

    const env: any = {
      ...process.env,
      TERM: 'xterm-256color',
      COLORTERM: 'truecolor',
    };
    if (slug) {
      env.TASKME_TERMINAL_SLUG = slug;
    }

    const ptyProcess = pty.spawn(shell, args, {
      name: 'xterm-256color',
      cols: 120,
      rows: 40,
      cwd: projectPath,
      env
    });

    const session: PtySession = {
      id: sessionId,
      projectId,
      projectPath,
      slug,
      ptyProcess,
      history: '',
      status: 'running',
      exitCode: null,
      createdAt: new Date(),
    };

    ptyProcess.onData((data) => {
      // Keep up to 100k chars of history to prevent memory leaks
      session.history += data;
      if (session.history.length > 100000) {
        session.history = session.history.substring(session.history.length - 100000);
      }
    });

    ptyProcess.onExit(({ exitCode }) => {
      session.status = 'exited';
      session.exitCode = exitCode;
      this.emit('exit', sessionId, exitCode);
    });

    this.sessions.set(sessionId, session);
    this.emit('spawn', sessionId);

    return session;
  }

  /** Get session by ID */
  get(sessionId: string): PtySession | undefined {
    return this.sessions.get(sessionId);
  }

  /** Get session by projectId (latest) */
  getByProjectId(projectId: number): PtySession | undefined {
    let latest: PtySession | undefined;
    for (const session of this.sessions.values()) {
      if (session.projectId === projectId) {
        if (!latest || session.createdAt > latest.createdAt) {
          latest = session;
        }
      }
    }
    return latest;
  }

  getByProjectAndSlug(projectId: number, slug?: string): PtySession | undefined {
    let latest: PtySession | undefined;
    for (const session of this.sessions.values()) {
      if (session.projectId === projectId && session.slug === (slug || undefined)) {
        if (!latest || session.createdAt > latest.createdAt) {
          latest = session;
        }
      }
    }
    return latest;
  }

  /** Kill a PTY session */
  kill(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    try {
      session.ptyProcess.kill();
    } catch {
      // already dead
    }
    session.status = 'exited';
    return true;
  }

  /** Kill AND remove a PTY session from memory entirely */
  destroy(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    try {
      if (session.status === 'running') session.ptyProcess.kill();
    } catch {
      // already dead
    }
    this.sessions.delete(sessionId);
    this.emit('destroy', sessionId);
    return true;
  }

  /** Destroy all sessions matching a project + slug */
  destroyByProjectAndSlug(projectId: number, slug?: string): number {
    let count = 0;
    for (const [id, session] of this.sessions) {
      if (session.projectId === projectId && session.slug === (slug || undefined)) {
        try {
          if (session.status === 'running') session.ptyProcess.kill();
        } catch { /* already dead */ }
        this.sessions.delete(id);
        this.emit('destroy', id);
        count++;
      }
    }
    return count;
  }

  /** Resize a PTY session */
  resize(sessionId: string, cols: number, rows: number): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'running') return false;
    try {
      session.ptyProcess.resize(cols, rows);
      return true;
    } catch {
      return false;
    }
  }

  /** Write data to PTY stdin */
  write(sessionId: string, data: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'running') return false;
    try {
      session.ptyProcess.write(data);
      return true;
    } catch {
      return false;
    }
  }

  /** List all sessions (without ptyProcess reference) */
  list(): Array<Omit<PtySession, 'ptyProcess'>> {
    return Array.from(this.sessions.values()).map(s => ({
      id: s.id,
      projectId: s.projectId,
      projectPath: s.projectPath,
      slug: s.slug,
      history: s.history,
      status: s.status,
      exitCode: s.exitCode,
      createdAt: s.createdAt,
    }));
  }

  /** Cleanup dead sessions older than 1 hour */
  cleanup(): void {
    const cutoff = Date.now() - 60 * 60 * 1000;
    for (const [id, session] of this.sessions) {
      if (session.status === 'exited' && session.createdAt.getTime() < cutoff) {
        this.sessions.delete(id);
      }
    }
  }
}

// Singleton
export const ptyManager = new PtyManager();

// Cleanup every 30 minutes
setInterval(() => ptyManager.cleanup(), 30 * 60 * 1000);
