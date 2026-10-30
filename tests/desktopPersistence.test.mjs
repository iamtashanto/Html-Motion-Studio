import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { ProjectDatabase } from '../apps/desktop/dist/apps/desktop/src/main/db/projectDatabase.js';

test('SQLite Desktop Project Database: Initializes and creates tables', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hms-db-test-'));
  const db = new ProjectDatabase(tempDir);
  await db.initialize();

  const recents = db.getRecentProjects();
  assert.equal(Array.isArray(recents), true);
  assert.equal(recents.length, 0);

  fs.rmSync(tempDir, { recursive: true, force: true });
});

test('SQLite Desktop Project Database: Inserts and retrieves recent projects ordered by last_opened', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hms-db-test-'));
  const db = new ProjectDatabase(tempDir);
  await db.initialize();

  db.addRecentProject({
    id: 'proj-1',
    title: 'Older Project',
    filePath: '/path/to/older.html',
    mode: 'file',
    lastOpened: 1000,
    duration: 3,
  });

  db.addRecentProject({
    id: 'proj-2',
    title: 'Newer Project',
    filePath: '/path/to/newer.zip',
    mode: 'zip',
    lastOpened: 2000,
    duration: 5,
  });

  const recents = db.getRecentProjects();
  assert.equal(recents.length, 2);
  assert.equal(recents[0].title, 'Newer Project');
  assert.equal(recents[1].title, 'Older Project');

  // Upsert duplicate file path
  db.addRecentProject({
    id: 'proj-3',
    title: 'Older Project Renamed',
    filePath: '/path/to/older.html',
    mode: 'file',
    lastOpened: 3000,
    duration: 4,
  });

  const updatedRecents = db.getRecentProjects();
  assert.equal(updatedRecents.length, 2);
  assert.equal(updatedRecents[0].title, 'Older Project Renamed');

  // Remove and Clear
  db.removeRecentProject('proj-2');
  assert.equal(db.getRecentProjects().length, 1);

  db.clearRecentProjects();
  assert.equal(db.getRecentProjects().length, 0);

  fs.rmSync(tempDir, { recursive: true, force: true });
});

test('SQLite Desktop Project Database: Records export history and persists to disk', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hms-db-test-'));
  const db = new ProjectDatabase(tempDir);
  await db.initialize();

  db.addExportRecord({
    id: 'exp-1',
    projectId: 'proj-100',
    outputFilePath: '/exports/banner.mp4',
    format: 'mp4',
    width: 1920,
    height: 1080,
    fps: 60,
    durationSeconds: 4.5,
    fileSizeBytes: 1024 * 1024 * 2,
    createdAt: Date.now(),
  });

  const history = db.getExportHistory();
  assert.equal(history.length, 1);
  assert.equal(history[0].format, 'mp4');
  assert.equal(history[0].fps, 60);

  // Verify file was written to disk
  assert.equal(fs.existsSync(path.join(tempDir, 'html-motion-studio.sqlite')), true);

  // Reload new instance from persisted disk file
  const db2 = new ProjectDatabase(tempDir);
  await db2.initialize();
  const reloadedHistory = db2.getExportHistory();
  assert.equal(reloadedHistory.length, 1);
  assert.equal(reloadedHistory[0].outputFilePath, '/exports/banner.mp4');

  fs.rmSync(tempDir, { recursive: true, force: true });
});
