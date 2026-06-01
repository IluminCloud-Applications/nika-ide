import { getDb } from './init';

export interface Project {
  id: number;
  name: string;
  path: string;
}

export interface Task {
  id: number;
  project_id: number;
  name: string;
  description: string;
  status: string;
  error_log?: string;
  ai_observations?: string;
  terminal_slug?: string;
  created_at: string;
}

export async function createProject(name: string, path: string): Promise<Project> {
  const db = getDb();
  const result = await db.run('INSERT INTO projects (name, path) VALUES (?, ?)', [name, path]);
  return getProject(result.lastID!);
}

export async function getProjects(): Promise<Project[]> {
  const db = getDb();
  return db.all('SELECT * FROM projects ORDER BY name ASC');
}

export async function getProjectByPath(projectPath: string): Promise<Project | undefined> {
  const db = getDb();
  // Normalize path: strip trailing slashes for consistent matching
  const normalized = projectPath.replace(/\/+$/, '');
  // Try exact match first, then prefix match (cwd might be a subdirectory of the project)
  const exact = await db.get<Project>(
    'SELECT * FROM projects WHERE TRIM(path, "/") = ? OR path = ?',
    [normalized, projectPath]
  );
  if (exact) return exact;

  // Fallback: find a project whose path is a prefix of the given path
  const all = await getProjects();
  return all.find(p => normalized.startsWith(p.path.replace(/\/+$/, '')));
}

export async function getProject(id: number): Promise<Project> {
  const db = getDb();
  const proj = await db.get('SELECT * FROM projects WHERE id = ?', [id]);
  if (!proj) throw new Error(`Project ${id} not found`);
  return proj as Project;
}

export async function updateProject(id: number, name: string, path: string): Promise<void> {
  const db = getDb();
  await db.run('UPDATE projects SET name = ?, path = ? WHERE id = ?', [name, path, id]);
}

export async function deleteProject(id: number): Promise<void> {
  const db = getDb();
  await db.run('DELETE FROM tasks WHERE project_id = ?', [id]);
  await db.run('DELETE FROM projects WHERE id = ?', [id]);
}

export async function createTask(projectId: number, name: string, description: string, terminalSlug: string = 'any'): Promise<Task> {
  const db = getDb();
  const result = await db.run(
    'INSERT INTO tasks (project_id, name, description, terminal_slug, status) VALUES (?, ?, ?, ?, ?)',
    [projectId, name, description, terminalSlug, 'pending']
  );
  return getTask(result.lastID!);
}

export async function updateTask(id: number, projectId: number, name: string, description: string, terminalSlug: string): Promise<void> {
  const db = getDb();
  await db.run('UPDATE tasks SET project_id = ?, name = ?, description = ?, terminal_slug = ? WHERE id = ?', [projectId, name, description, terminalSlug, id]);
}

export async function getTasks(projectId?: number): Promise<Task[]> {
  const db = getDb();
  if (projectId !== undefined) {
    return db.all(
      "SELECT * FROM tasks WHERE project_id = ? AND status != 'archived' ORDER BY created_at ASC",
      [projectId]
    );
  }
  return db.all("SELECT * FROM tasks WHERE status != 'archived' ORDER BY created_at ASC");
}

export async function getTask(id: number): Promise<Task> {
  const db = getDb();
  const task = await db.get('SELECT * FROM tasks WHERE id = ?', [id]);
  if (!task) throw new Error(`Task ${id} not found`);
  return task as Task;
}

export async function updateTaskStatus(id: number, status: string, errorLog: string | null = null): Promise<void> {
  const db = getDb();
  if (errorLog !== null) {
    await db.run('UPDATE tasks SET status = ?, error_log = ? WHERE id = ?', [status, errorLog, id]);
  } else {
    await db.run('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
  }
}

export async function updateTaskTerminalSlug(id: number, terminalSlug: string): Promise<void> {
  const db = getDb();
  await db.run('UPDATE tasks SET terminal_slug = ? WHERE id = ?', [terminalSlug, id]);
}

export async function getProjectTerminalSlugs(projectId: number): Promise<string[]> {
  const db = getDb();
  const rows = await db.all(
    `SELECT DISTINCT terminal_slug FROM tasks WHERE project_id = ? AND terminal_slug LIKE 'slug:%'`,
    [projectId]
  );
  return rows.map((r: any) => r.terminal_slug.replace('slug:', ''));
}

export async function archiveCompletedTasks(projectId?: number): Promise<void> {
  const db = getDb();
  if (projectId !== undefined) {
    await db.run(
      "UPDATE tasks SET status = 'archived' WHERE status = 'completed' AND project_id = ?",
      [projectId]
    );
  } else {
    await db.run("UPDATE tasks SET status = 'archived' WHERE status = 'completed'");
  }
}

export async function updateTaskObservation(id: number, ai_observations: string): Promise<void> {
  const db = getDb();
  await db.run('UPDATE tasks SET ai_observations = ? WHERE id = ?', [ai_observations, id]);
}
