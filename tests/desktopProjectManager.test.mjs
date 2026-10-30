import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import JSZip from '../apps/desktop/node_modules/jszip/lib/index.js';
import { ProjectManager } from '../apps/desktop/dist/apps/desktop/src/main/project/projectManager.js';

test('ProjectManager: Opens single HTML file and discovers sibling assets', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hms-pm-test-'));
  const htmlPath = path.join(tempDir, 'banner.html');
  const cssPath = path.join(tempDir, 'style.css');

  fs.writeFileSync(htmlPath, '<html><head><link rel="stylesheet" href="style.css"></head><body><h1>Hello</h1></body></html>');
  fs.writeFileSync(cssPath, 'h1 { color: red; }');

  const pm = new ProjectManager(tempDir);
  const project = await pm.openSingleHtmlFile(htmlPath);

  assert.equal(project.title, 'banner');
  assert.equal(project.entryHtmlPath, 'banner.html');
  assert.equal(Boolean(project.assets['style.css']), true);
  assert.equal(project.assets['style.css'].type, 'text/css');
  assert.match(project.htmlContent, /data:text\/css;base64,/);

  fs.rmSync(tempDir, { recursive: true, force: true });
});

test('ProjectManager: Opens directory project and recursively scans assets', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hms-dir-test-'));
  const subDir = path.join(tempDir, 'assets');
  fs.mkdirSync(subDir, { recursive: true });

  const htmlPath = path.join(tempDir, 'index.html');
  const imgPath = path.join(subDir, 'logo.svg');

  fs.writeFileSync(htmlPath, '<html><body><img src="./assets/logo.svg"></body></html>');
  fs.writeFileSync(imgPath, '<svg><circle r="10"/></svg>');

  const pm = new ProjectManager(tempDir);
  const project = await pm.openFolderProject(tempDir);

  assert.equal(project.entryHtmlPath, 'index.html');
  assert.equal(Boolean(project.assets['assets/logo.svg']), true);
  assert.match(project.htmlContent, /data:image\/svg\+xml;base64,/);

  fs.rmSync(tempDir, { recursive: true, force: true });
});

test('ProjectManager: Safely unpacks ZIP archive and enforces security boundaries', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hms-zip-test-'));
  const zip = new JSZip();

  zip.file('index.html', '<!DOCTYPE html><html><body><div class="box"></div></body></html>');
  zip.file('style.css', '.box { width: 100px; height: 100px; background: blue; }');

  const zipPath = path.join(tempDir, 'project.zip');
  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
  fs.writeFileSync(zipPath, zipBuffer);

  const pm = new ProjectManager(tempDir);
  const project = await pm.openZipArchive(zipPath);

  assert.equal(project.title, 'project');
  assert.equal(project.entryHtmlPath, 'index.html');
  assert.equal(Boolean(project.assets['style.css']), true);

  // Security test: Path traversal inside ZIP
  assert.throws(() => {
    pm.validateSafePath('../../etc/passwd');
  }, /Path traversal/);

  assert.throws(() => {
    pm.validateSafePath('/root/secret');
  }, /Absolute paths not allowed/);

  assert.throws(() => {
    pm.validateSafePath('nested\0file.txt');
  }, /null byte/);

  assert.throws(() => {
    pm.validateSafePath('1/2/3/4/5/6/7/8/9/10/file.txt');
  }, /nesting depth/);

  fs.rmSync(tempDir, { recursive: true, force: true });
});
