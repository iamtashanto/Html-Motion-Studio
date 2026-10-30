import { ipcMain, dialog, shell, BrowserWindow } from 'electron';
import { ProjectManager } from '../project/projectManager';
import { ProjectDatabase } from '../db/projectDatabase';
import { FFmpegPipeline } from '../rendering/ffmpegPipeline';
import { HeadlessRenderer } from '../rendering/headlessRenderer';
import { DesktopExportJobConfig } from '@html-motion-studio/shared';

export function registerIpcHandlers(
  mainWindow: BrowserWindow,
  projectManager: ProjectManager,
  projectDb: ProjectDatabase,
  ffmpegPipeline: FFmpegPipeline,
  headlessRenderer: HeadlessRenderer
): void {
  // Native Open Project File
  ipcMain.handle('dialog:openProjectFile', async () => {
    return dialog.showOpenDialog(mainWindow, {
      title: 'Open HTML Project or Archive',
      properties: ['openFile'],
      filters: [
        { name: 'All Supported Formats', extensions: ['html', 'htm', 'zip', 'hmsproj', 'json'] },
        { name: 'HTML Web Animations', extensions: ['html', 'htm'] },
        { name: 'ZIP Project Packages', extensions: ['zip'] },
        { name: 'HTML Motion Studio Projects', extensions: ['hmsproj'] },
      ],
    });
  });

  // Native Open Project Folder
  ipcMain.handle('dialog:openProjectFolder', async () => {
    return dialog.showOpenDialog(mainWindow, {
      title: 'Open HTML Project Folder',
      properties: ['openDirectory'],
    });
  });

  // Native Open Audio File
  ipcMain.handle('dialog:openAudioFile', async () => {
    return dialog.showOpenDialog(mainWindow, {
      title: 'Select Soundtrack Audio File',
      properties: ['openFile'],
      filters: [
        { name: 'Audio Files (*.mp3, *.wav, *.aac, *.m4a)', extensions: ['mp3', 'wav', 'aac', 'm4a'] },
      ],
    });
  });

  // Native Save Video Destination
  ipcMain.handle('dialog:saveVideoFile', async (_, defaultName: string, format = 'mp4') => {
    const filters = format.toLowerCase() === 'webm'
      ? [{ name: 'WebM Video (*.webm)', extensions: ['webm'] }]
      : format.toLowerCase() === 'mov'
      ? [{ name: 'Apple ProRes 4444 (*.mov)', extensions: ['mov'] }]
      : [{ name: 'MP4 Video (*.mp4)', extensions: ['mp4'] }];

    return dialog.showSaveDialog(mainWindow, {
      title: 'Export Rendered Video',
      defaultPath: `${defaultName}.${format.toLowerCase()}`,
      filters,
    });
  });

  // Open Project From Path
  ipcMain.handle('project:openFromPath', async (_, targetPath: string) => {
    const project = await projectManager.openFromPath(targetPath);

    // Save to SQLite Recent Projects
    projectDb.addRecentProject({
      id: project.id,
      title: project.title,
      filePath: targetPath,
      mode: project.mode,
      lastOpened: Date.now(),
      duration: project.detectedDuration || 4,
    });

    return project;
  });

  // Save Project To Disk
  ipcMain.handle('project:saveToDisk', async (_, project, targetPath?: string) => {
    const savedPath = await projectManager.saveProjectToDisk(project, targetPath);

    projectDb.addRecentProject({
      id: project.id,
      title: project.title,
      filePath: savedPath,
      mode: 'project',
      lastOpened: Date.now(),
      duration: project.detectedDuration || 4,
    });

    return { success: true, filePath: savedPath };
  });

  // SQLite Recents
  ipcMain.handle('project:getRecentProjects', async () => {
    return projectDb.getRecentProjects(15);
  });

  ipcMain.handle('project:removeRecentProject', async (_, id: string) => {
    projectDb.removeRecentProject(id);
  });

  ipcMain.handle('project:clearRecentProjects', async () => {
    projectDb.clearRecentProjects();
  });

  // Rendering & Export
  ipcMain.handle('render:startExport', async (_, config: DesktopExportJobConfig) => {
    try {
      const outputFilePath = await headlessRenderer.renderProject(config, (progress) => {
        if (!mainWindow.isDestroyed()) {
          mainWindow.webContents.send('render:progress', progress);
        }
      });

      // Verify and record export history in SQLite
      const verification = ffmpegPipeline.verifyVideo(outputFilePath);

      projectDb.addExportRecord({
        id: `exp-${Date.now()}`,
        projectId: config.project.id,
        outputFilePath,
        format: config.settings.format,
        width: config.settings.width,
        height: config.settings.height,
        fps: config.settings.fps,
        durationSeconds: config.settings.durationSeconds,
        fileSizeBytes: verification.sizeBytes,
        createdAt: Date.now(),
      });

      return { success: true, outputFilePath };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  });

  // Cancel Export
  ipcMain.handle('render:cancelExport', async () => {
    headlessRenderer.cancel();
    return { success: true };
  });

  // Verify Video using FFprobe
  ipcMain.handle('render:verifyExportedVideo', async (_, filePath: string) => {
    return ffmpegPipeline.verifyVideo(filePath);
  });

  // System & Shell
  ipcMain.handle('system:getCapabilities', async () => {
    return ffmpegPipeline.getSystemCapabilities();
  });

  ipcMain.handle('shell:openPath', async (_, targetPath: string) => {
    return shell.openPath(targetPath);
  });

  ipcMain.handle('shell:showItemInFolder', async (_, targetPath: string) => {
    shell.showItemInFolder(targetPath);
  });
}
