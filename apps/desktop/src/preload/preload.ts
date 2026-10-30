import { contextBridge, ipcRenderer } from 'electron';

export interface DesktopApi {
  openProjectFile: () => Promise<Electron.OpenDialogReturnValue>;
  saveVideoFile: (defaultName: string) => Promise<Electron.SaveDialogReturnValue>;
  startDeterministicExport: (config: unknown) => Promise<{ success: boolean; message: string }>;
  isDesktop: boolean;
}

const desktopApi: DesktopApi = {
  openProjectFile: () => ipcRenderer.invoke('dialog:openProject'),
  saveVideoFile: (defaultName: string) => ipcRenderer.invoke('dialog:saveVideo', defaultName),
  startDeterministicExport: (config: unknown) =>
    ipcRenderer.invoke('render:startDeterministicExport', config),
  isDesktop: true,
};

contextBridge.exposeInMainWorld('desktopApi', desktopApi);

