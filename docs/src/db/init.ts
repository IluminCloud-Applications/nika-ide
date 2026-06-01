import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import os from 'os';
import fs from 'fs';

let dbInstance: Database<sqlite3.Database, sqlite3.Statement> | null = null;

// Store DB in user's home dir so it persists across package updates
const DB_DIR = path.join(os.homedir(), '.taskme');
const DB_PATH = path.join(DB_DIR, 'taskme.db');

export async function initDb() {
  if (dbInstance) return dbInstance;

  // Ensure ~/.taskme/ directory exists
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  dbInstance = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      path TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      error_log TEXT,
      ai_observations TEXT,
      terminal_slug TEXT DEFAULT 'any',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
  `);

  // Migrations for existing databases
  try { await dbInstance.exec(`ALTER TABLE tasks ADD COLUMN error_log TEXT`); } catch (_) {}
  try { await dbInstance.exec(`ALTER TABLE tasks ADD COLUMN ai_observations TEXT`); } catch (_) {}
  try { await dbInstance.exec(`ALTER TABLE tasks ADD COLUMN terminal_slug TEXT DEFAULT 'any'`); } catch (_) {}

  return dbInstance;
}

export function getDb() {
  if (!dbInstance) throw new Error("Database not initialized. Call initDb() first.");
  return dbInstance;
}

export function getDbPath() {
  return DB_PATH;
}
