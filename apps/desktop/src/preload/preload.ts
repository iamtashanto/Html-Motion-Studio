import { contextBridge, ipcRenderer } from 'electron';
import {
  DesktopApiBridge,
  DesktopExportJobConfig,
  DesktopExportProgress,
  ProjectData,
} from '@html-motion-studio/shared';

const desktopApi: DesktopApiBridge = {
  // Dialogs
  openProjectFile: () => ipcRenderer.invoke('dialog:openProjectFile'),
  openProjectFolder: () => ipcRenderer.invoke('dialog:openProjectFolder'),
  openAudioFile: () => ipcRenderer.invoke('dialog:openAudioFile'),
  saveVideoFile: (defaultName: string, format = 'mp4') =>
    ipcRenderer.invoke('dialog:saveVideoFile', defaultName, format),

  // Projects
  openProjectFromPath: (targetPath: string) =>
    ipcRenderer.invoke('project:openFromPath', targetPath),
  saveProjectToDisk: (project: ProjectData, targetPath?: string) =>
    ipcRenderer.invoke('project:saveToDisk', project, targetPath),
  syncRenderHtml: (htmlContent: string) =>
    ipcRenderer.invoke('project:syncRenderHtml', htmlContent),
  getRecentProjects: () => ipcRenderer.invoke('project:getRecentProjects'),
  removeRecentProject: (id: string) =>
    ipcRenderer.invoke('project:removeRecentProject', id),
  clearRecentProjects: () => ipcRenderer.invoke('project:clearRecentProjects'),

  // Audio
  getAudioDataUrl: (filePath: string) =>
    ipcRenderer.invoke('audio:getAudioDataUrl', filePath),

  // Rendering & Export
  startExport: (config: DesktopExportJobConfig) =>
    ipcRenderer.invoke('render:startExport', config),
  cancelExport: () => ipcRenderer.invoke('render:cancelExport'),
  verifyExportedVideo: (filePath: string) =>
    ipcRenderer.invoke('render:verifyExportedVideo', filePath),

  // System & Shell
  getSystemCapabilities: () => ipcRenderer.invoke('system:getCapabilities'),
  getPlatform: () => ipcRenderer.invoke('system:getPlatform'),
  openPath: (targetPath: string) => ipcRenderer.invoke('shell:openPath', targetPath),
  showItemInFolder: (targetPath: string) =>
    ipcRenderer.invoke('shell:showItemInFolder', targetPath),

  // Window Controls
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),

  // Event Subscriptions
  onExportProgress: (callback: (progress: DesktopExportProgress) => void) => {
    const listener = (_: Electron.IpcRendererEvent, progress: DesktopExportProgress) => {
      callback(progress);
    };
    ipcRenderer.on('render:progress', listener);
    return () => {
      ipcRenderer.removeListener('render:progress', listener);
    };
  },
};

contextBridge.exposeInMainWorld('desktopApi', desktopApi);

// Type declaration for window
declare global {
  interface Window {
    desktopApi: DesktopApiBridge;
  }
}
