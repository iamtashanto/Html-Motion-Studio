use crate::models::{ExportHistoryRecord, RecentProjectItem};
use anyhow::{Context, Result};
use rusqlite::{params, Connection};
use std::path::{Path, PathBuf};
use std::sync::Mutex;

pub struct ProjectDatabase {
    conn: Mutex<Connection>,
    db_path: PathBuf,
}

impl ProjectDatabase {
    pub fn open(user_data_dir: &Path) -> Result<Self> {
        std::fs::create_dir_all(user_data_dir)
            .with_context(|| format!("Failed to create user data dir: {}", user_data_dir.display()))?;
        let db_path = user_data_dir.join("html-motion-studio.sqlite");
        let conn = Connection::open(&db_path)
            .with_context(|| format!("Failed to open SQLite database at {}", db_path.display()))?;

        let db = Self {
            conn: Mutex::new(conn),
            db_path,
        };
        db.create_tables()?;
        Ok(db)
    }

    pub fn db_path(&self) -> &Path {
        &self.db_path
    }

    fn create_tables(&self) -> Result<()> {
        let conn = self.conn.lock().map_err(|e| anyhow::anyhow!("DB lock poisoned: {e}"))?;
        conn.execute_batch(
            r#"
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
            "#,
        )?;
        Ok(())
    }

    pub fn add_recent_project(&self, item: &RecentProjectItem) -> Result<()> {
        let conn = self.conn.lock().map_err(|e| anyhow::anyhow!("DB lock poisoned: {e}"))?;
        conn.execute(
            r#"
            INSERT INTO recent_projects (id, title, file_path, mode, last_opened, duration)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6)
            ON CONFLICT(file_path) DO UPDATE SET
                title = excluded.title,
                last_opened = excluded.last_opened,
                duration = excluded.duration
            "#,
            params![
                item.id,
                item.title,
                item.file_path,
                item.mode,
                item.last_opened,
                item.duration
            ],
        )?;
        Ok(())
    }

    pub fn get_recent_projects(&self, limit: usize) -> Result<Vec<RecentProjectItem>> {
        let conn = self.conn.lock().map_err(|e| anyhow::anyhow!("DB lock poisoned: {e}"))?;
        let mut stmt = conn.prepare(
            "SELECT id, title, file_path, mode, last_opened, duration FROM recent_projects ORDER BY last_opened DESC LIMIT ?1",
        )?;
        let rows = stmt.query_map(params![limit as i64], |row| {
            Ok(RecentProjectItem {
                id: row.get(0)?,
                title: row.get(1)?,
                file_path: row.get(2)?,
                mode: row.get(3)?,
                last_opened: row.get(4)?,
                duration: row.get(5)?,
            })
        })?;

        let mut results = Vec::new();
        for row in rows {
            results.push(row?);
        }
        Ok(results)
    }

    pub fn remove_recent_project(&self, id: &str) -> Result<()> {
        let conn = self.conn.lock().map_err(|e| anyhow::anyhow!("DB lock poisoned: {e}"))?;
        conn.execute("DELETE FROM recent_projects WHERE id = ?1", params![id])?;
        Ok(())
    }

    pub fn clear_recent_projects(&self) -> Result<()> {
        let conn = self.conn.lock().map_err(|e| anyhow::anyhow!("DB lock poisoned: {e}"))?;
        conn.execute("DELETE FROM recent_projects", [])?;
        Ok(())
    }

    pub fn add_export_record(&self, record: &ExportHistoryRecord) -> Result<()> {
        let conn = self.conn.lock().map_err(|e| anyhow::anyhow!("DB lock poisoned: {e}"))?;
        conn.execute(
            r#"
            INSERT INTO export_history (
                id, project_id, output_file_path, format, width, height, fps,
                duration_seconds, file_size_bytes, created_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
            "#,
            params![
                record.id,
                record.project_id,
                record.output_file_path,
                record.format,
                record.width as i64,
                record.height as i64,
                record.fps as i64,
                record.duration_seconds,
                record.file_size_bytes as i64,
                record.created_at
            ],
        )?;
        Ok(())
    }

    pub fn get_export_history(&self, limit: usize) -> Result<Vec<ExportHistoryRecord>> {
        let conn = self.conn.lock().map_err(|e| anyhow::anyhow!("DB lock poisoned: {e}"))?;
        let mut stmt = conn.prepare(
            "SELECT id, project_id, output_file_path, format, width, height, fps, duration_seconds, file_size_bytes, created_at FROM export_history ORDER BY created_at DESC LIMIT ?1",
        )?;
        let rows = stmt.query_map(params![limit as i64], |row| {
            Ok(ExportHistoryRecord {
                id: row.get(0)?,
                project_id: row.get(1)?,
                output_file_path: row.get(2)?,
                format: row.get(3)?,
                width: row.get::<_, i64>(4)? as u32,
                height: row.get::<_, i64>(5)? as u32,
                fps: row.get::<_, i64>(6)? as u32,
                duration_seconds: row.get(7)?,
                file_size_bytes: row.get::<_, i64>(8)? as u64,
                created_at: row.get(9)?,
            })
        })?;
        let mut results = Vec::new();
        for row in rows {
            results.push(row?);
        }
        Ok(results)
    }
}
