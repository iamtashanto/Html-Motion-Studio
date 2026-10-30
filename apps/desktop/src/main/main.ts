import { app, BrowserWindow } from 'electron';
import path from 'path';
import fs from 'fs';
import { ProjectDatabase } from './db/projectDatabase';
import { ProjectManager } from './project/projectManager';
import { FFmpegPipeline } from './rendering/ffmpegPipeline';
import { HeadlessRenderer } from './rendering/headlessRenderer';
import { registerIpcHandlers } from './ipc/ipcHandlers';

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1080,
    minHeight: 720,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 18 },
    backgroundColor: '#090d16',
    title: 'HTML Motion Studio Desktop',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webgl: true,
    },
  });

  const userDataPath = app.getPath('userData');

  // Initialize Core Services
  const projectDb = new ProjectDatabase(userDataPath);
  await projectDb.initialize();

  const projectManager = new ProjectManager(userDataPath);
  const ffmpegPipeline = new FFmpegPipeline();
  const headlessRenderer = new HeadlessRenderer(userDataPath, ffmpegPipeline);

  // Register Secure IPC Handlers
  registerIpcHandlers(
    mainWindow,
    projectManager,
    projectDb,
    ffmpegPipeline,
    headlessRenderer
  );

  // In development load Vite dev server if available, else load packaged dist
  const devUrl = process.env.ELECTRON_START_URL;
  if (devUrl) {
    mainWindow.loadURL(devUrl);
  } else {
    const candidatePaths = [
      path.join(__dirname, '../../../../renderer/index.html'),
      path.join(__dirname, '../../renderer/index.html'),
      path.join(__dirname, '../renderer/index.html'),
    ];
    const targetHtml = candidatePaths.find((p) => fs.existsSync(p));
    if (targetHtml) {
      mainWindow.loadFile(targetHtml);
    } else {
      mainWindow.loadURL(
        `data:text/html,<html><body style="background:#090d16;color:white;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;"><h2>HTML Motion Studio Desktop Initialized</h2></body></html>`
      );
    }
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  await createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
