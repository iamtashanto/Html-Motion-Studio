import fs from 'fs';
import path from 'path';
import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import { RecentProjectItem } from '@html-motion-studio/shared';

export interface ExportHistoryRecord {
  id: string;
  projectId: string;
  outputFilePath: string;
  format: string;
  width: number;
  height: number;
  fps: number;
  durationSeconds: number;
  fileSizeBytes: number;
  createdAt: number;
}

export class ProjectDatabase {
  private db: Database | null = null;
  private dbPath: string;
  private SQL: SqlJsStatic | null = null;

  constructor(userDataPath: string) {
    this.dbPath = path.join(userDataPath, 'html-motion-studio.sqlite');
  }

  public async initialize(): Promise<void> {
    this.SQL = await initSqlJs();

    let fileBuffer: Buffer | null = null;
    if (fs.existsSync(this.dbPath)) {
      try {
        fileBuffer = fs.readFileSync(this.dbPath);
      } catch (err) {
        console.error('Failed to read existing SQLite database:', err);
      }
    }

    if (fileBuffer) {
      this.db = new this.SQL.Database(fileBuffer);
    } else {
      this.db = new this.SQL.Database();
    }

    this.createTables();
    this.persist();
  }

  private createTables(): void {
    if (!this.db) return;

    this.db.run(`
      CREATE TABLE IF NOT EXISTS recent_projects (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        file_path TEXT NOT NULL UNIQUE,
        mode TEXT NOT NULL,
        last_opened INTEGER NOT NULL,
        duration REAL NOT NULL
      );

      CREATE TABLE IF NOT EXISTS export_history (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        output_file_path TEXT NOT NULL,
        format TEXT NOT NULL,
        width INTEGER NOT NULL,
        height INTEGER NOT NULL,
        fps INTEGER NOT NULL,
        duration_seconds REAL NOT NULL,
        file_size_bytes INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_recent_last_opened ON recent_projects(last_opened DESC);
      CREATE INDEX IF NOT EXISTS idx_export_created_at ON export_history(created_at DESC);
    `);
  }

  private persist(): void {
    if (!this.db) return;
    try {
      const data = this.db.export();
      const buffer = Buffer.from(data);
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.dbPath, buffer);
    } catch (err) {
      console.error('Failed to persist SQLite database to disk:', err);
    }
  }

  public addRecentProject(item: RecentProjectItem): void {
    if (!this.db) return;

    const stmt = this.db.prepare(`
      INSERT INTO recent_projects (id, title, file_path, mode, last_opened, duration)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(file_path) DO UPDATE SET
        title = excluded.title,
        last_opened = excluded.last_opened,
        duration = excluded.duration;
    `);

    stmt.run([
      item.id,
      item.title,
      item.filePath,
      item.mode,
      item.lastOpened,
      item.duration,
    ]);
    stmt.free();

    this.persist();
  }

  public getRecentProjects(limit = 10): RecentProjectItem[] {
    if (!this.db) return [];

    const stmt = this.db.prepare(`
      SELECT id, title, file_path, mode, last_opened, duration
      FROM recent_projects
      ORDER BY last_opened DESC
      LIMIT ?;
    `);

    stmt.bind([limit]);
    const results: RecentProjectItem[] = [];

    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push({
        id: String(row.id),
        title: String(row.title),
        filePath: String(row.file_path),
        mode: row.mode as 'file' | 'zip' | 'folder' | 'project',
        lastOpened: Number(row.last_opened),
        duration: Number(row.duration),
      });
    }

    stmt.free();
    return results;
  }

  public removeRecentProject(id: string): void {
    if (!this.db) return;

    const stmt = this.db.prepare('DELETE FROM recent_projects WHERE id = ?;');
    stmt.run([id]);
    stmt.free();

    this.persist();
  }

  public clearRecentProjects(): void {
    if (!this.db) return;

    this.db.run('DELETE FROM recent_projects;');
    this.persist();
  }

  public addExportRecord(record: ExportHistoryRecord): void {
    if (!this.db) return;

    const stmt = this.db.prepare(`
      INSERT INTO export_history (
        id, project_id, output_file_path, format, width, height, fps, duration_seconds, file_size_bytes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `);

    stmt.run([
      record.id,
      record.projectId,
      record.outputFilePath,
      record.format,
      record.width,
      record.height,
      record.fps,
      record.durationSeconds,
      record.fileSizeBytes,
      record.createdAt,
    ]);
    stmt.free();

    this.persist();
  }

  public getExportHistory(limit = 20): ExportHistoryRecord[] {
    if (!this.db) return [];

    const stmt = this.db.prepare(`
      SELECT id, project_id, output_file_path, format, width, height, fps, duration_seconds, file_size_bytes, created_at
      FROM export_history
      ORDER BY created_at DESC
      LIMIT ?;
    `);

    stmt.bind([limit]);
    const results: ExportHistoryRecord[] = [];

    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push({
        id: String(row.id),
        projectId: String(row.project_id),
        outputFilePath: String(row.output_file_path),
        format: String(row.format),
        width: Number(row.width),
        height: Number(row.height),
        fps: Number(row.fps),
        durationSeconds: Number(row.duration_seconds),
        fileSizeBytes: Number(row.file_size_bytes),
        createdAt: Number(row.created_at),
      });
    }

    stmt.free();
    return results;
  }
}

