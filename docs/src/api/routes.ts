import { Router } from 'express';
import {
  createProject, getProjects, createTask, getTasks, getTask,
  updateTaskStatus, updateProject, deleteProject, updateTask,
  archiveCompletedTasks, updateTaskObservation, getProjectTerminalSlugs
} from '../db/queries';
import { exec } from 'child_process';
import util from 'util';
import { ptyManager } from './pty-manager';
import { tunnelManager } from './tunnel-manager';

const execAsync = util.promisify(exec);

export const apiRouter = Router();

// ── FOLDER SELECTION ──────────────────────────────────────────────────────────
apiRouter.get('/select-folder', async (req, res) => {
  try {
    let folderPath: string | null = null;
    if (process.platform === 'win32') {
      const { stdout } = await execAsync(`powershell -Command "(new-object -COM 'Shell.Application').BrowseForFolder(0,'Selecione a pasta',0,0).self.path"`);
      folderPath = stdout.trim();
    } else if (process.platform === 'darwin') {
      const { stdout } = await execAsync(`osascript -e 'tell application "System Events" to POSIX path of (choose folder)'`);
      folderPath = stdout.trim();
    } else {
      // Setup environment to maximize chance of it working from a background MCP process
      const env = { ...process.env };
      if (!env.DISPLAY) env.DISPLAY = ':0';
      
      try {
        const { stdout } = await execAsync(`zenity --file-selection --directory 2>/dev/null`, { env });
        folderPath = stdout.trim();
      } catch (e: any) {
        // Exit code 1 for zenity usually means the user clicked cancel or closed it
        if (e.code === 1 && !e.stderr?.includes('cannot open display')) {
          folderPath = ''; // Canceled
        } else {
          try {
            const { stdout } = await execAsync(`kdialog --getexistingdirectory 2>/dev/null`, { env });
            folderPath = stdout.trim();
          } catch (e2: any) {
            if (e2.code === 1) {
              folderPath = ''; // Canceled
            } else {
              return res.status(400).json({ error: 'Não foi possível abrir o seletor gráfico (Zenity/Kdialog). Isso pode ocorrer se o servidor TaskMe estiver sendo executado em segundo plano. Por favor, cole o caminho da pasta manualmente.' });
            }
          }
        }
      }
    }

    if (folderPath) {
      res.json({ path: folderPath });
    } else {
      res.status(400).json({ error: 'Nenhuma pasta selecionada.' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// ── PROJECTS ──────────────────────────────────────────────────────────────────
apiRouter.get('/projects', async (_req, res) => {
  try {
    res.json(await getProjects());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/projects', async (req, res) => {
  const { name, path } = req.body;
  try {
    res.json(await createProject(name, path));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/projects/:id', async (req, res) => {
  const { name, path } = req.body;
  try {
    await updateProject(Number(req.params.id), name, path);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/projects/:id', async (req, res) => {
  try {
    await deleteProject(Number(req.params.id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── TASKS AND PROJECT DATA ───────────────────────────────────────────────────

apiRouter.get('/projects/:id/terminal-slugs', async (req, res) => {
  try {
    const dbSlugs = await getProjectTerminalSlugs(Number(req.params.id));
    
    // Also include currently running PTYs so we can select them even if they have no tasks yet
    const runningSlugs = ptyManager.list()
      .filter(s => s.projectId === Number(req.params.id) && s.slug)
      .map(s => s.slug!);

    // Combine and deduplicate
    const combined = Array.from(new Set([...dbSlugs, ...runningSlugs]));
    res.json(combined);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// NOTE: specific routes must come BEFORE /:id to avoid conflicts
apiRouter.put('/tasks/archive-completed', async (req, res) => {
  try {
    // Optionally filter by projectId if provided in body
    const { projectId } = req.body;
    await archiveCompletedTasks(projectId ? Number(projectId) : undefined);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/tasks', async (req, res) => {
  try {
    // Optional ?projectId=N filter
    const projectId = req.query.projectId ? Number(req.query.projectId) : undefined;
    res.json(await getTasks(projectId));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/tasks', async (req, res) => {
  const { projectId, name, description, terminal_slug } = req.body;
  try {
    res.json(await createTask(projectId, name, description, terminal_slug || 'any'));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/tasks/:id', async (req, res) => {
  const { projectId, name, description, terminal_slug } = req.body;
  try {
    await updateTask(Number(req.params.id), projectId, name, description, terminal_slug || 'any');
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/tasks/:id/status', async (req, res) => {
  const { status, error_log } = req.body;
  try {
    const taskId = Number(req.params.id);
    await updateTaskStatus(taskId, status, error_log || null);

    if (status === 'rejected') {
      const task = await getTask(taskId);
      let session;
      if (task.terminal_slug && task.terminal_slug.startsWith('slug:')) {
        const expectedSlug = task.terminal_slug.replace('slug:', '');
        session = ptyManager.getByProjectAndSlug(task.project_id, expectedSlug);
      } else {
        session = ptyManager.getByProjectId(task.project_id);
      }
      if (session && session.status === 'running') {
        const message = `Task '${task.name}' was rejected. Call get_task and check if the error was already fixed. If it was fixed, ignore it. If not, fix it.\n`;
        ptyManager.write(session.id, message);
      }
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/tasks/:id/observation', async (req, res) => {
  const { ai_observations } = req.body;
  try {
    await updateTaskObservation(Number(req.params.id), ai_observations);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── AI TERMINAL (PTY-based) ──────────────────────────────────────────────────

// Spawn a new PTY session for gemini
apiRouter.post('/ai/start', async (req, res) => {
  const { projectId, path: projectPath, slug } = req.body;
  if (!projectPath || !projectId) {
    return res.status(400).json({ error: 'projectId e path são obrigatórios.' });
  }

  try {
    const session = ptyManager.spawn(Number(projectId), projectPath, slug || undefined);
    res.json({
      success: true,
      sessionId: session.id,
      message: 'Terminal AI iniciado com sucesso.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get active session info for a project
apiRouter.get('/ai/session', async (req, res) => {
  const projectId = req.query.projectId;
  const slug = req.query.slug as string;
  if (!projectId) return res.status(400).json({ error: 'projectId é obrigatório.' });

  const session = ptyManager.getByProjectAndSlug(Number(projectId), slug || undefined);
  if (!session) {
    return res.json({ active: false });
  }

  res.json({
    active: session.status === 'running',
    sessionId: session.id,
    status: session.status,
    exitCode: session.exitCode,
    createdAt: session.createdAt,
  });
});

// Kill a PTY session
apiRouter.post('/ai/kill', async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'sessionId é obrigatório.' });

  const killed = ptyManager.kill(sessionId);
  res.json({ success: killed });
});

// Destroy a PTY session (kill + remove from memory + clean DB slug references)
apiRouter.post('/ai/destroy', async (req, res) => {
  const { projectId, slug } = req.body;
  if (!projectId) return res.status(400).json({ error: 'projectId é obrigatório.' });

  try {
    const destroyed = ptyManager.destroyByProjectAndSlug(Number(projectId), slug || undefined);
    res.json({ success: true, destroyed });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── CLOUDFLARE TUNNEL ────────────────────────────────────────────────────────

/** Check if cloudflared is installed */
apiRouter.get('/tunnel/check', (_req, res) => {
  const version = tunnelManager.checkInstalled();
  if (version) {
    res.json({ installed: true, version });
  } else {
    res.json({
      installed: false,
      installUrl: 'https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/',
    });
  }
});

/** Start the cloudflared tunnel */
apiRouter.post('/tunnel/start', (req, res) => {
  const version = tunnelManager.checkInstalled();
  if (!version) {
    return res.status(400).json({
      error: 'cloudflared não está instalado.',
      installUrl: 'https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/',
    });
  }
  const port = req.body.port ?? 8390;
  tunnelManager.start(port);
  res.json({ success: true, status: tunnelManager.getState() });
});

/** Get current tunnel state (poll this to get the URL) */
apiRouter.get('/tunnel/status', (_req, res) => {
  res.json(tunnelManager.getState());
});

/** Stop the tunnel */
apiRouter.post('/tunnel/stop', (_req, res) => {
  tunnelManager.stop();
  res.json({ success: true });
});
