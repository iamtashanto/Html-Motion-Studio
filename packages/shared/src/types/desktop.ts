import { CompatibilityReport, ProjectData } from './project';
import { ExportSettings } from './export';
import { AudioSettings } from './audio';

export interface RecentProjectItem {
  id: string;
  title: string;
  filePath: string;
  mode: 'file' | 'zip' | 'folder' | 'project' | 'code';
  lastOpened: number; // timestamp
  duration: number;
}

export interface DesktopSystemCapabilities {
  os: 'darwin' | 'win32' | 'linux';
  arch: string;
  ffmpegAvailable: boolean;
  ffmpegPath?: string;
  ffmpegVersion?: string;
  ffprobeAvailable: boolean;
  ffprobePath?: string;
  ffprobeVersion?: string;
  gpuAcceleration: boolean;
}

export type DesktopRenderStrategy = 
  | 'adapter'       // Strategy A: window.__HTML_MOTION_STUDIO__ deterministic seek/render
  | 'compatibility'; // Strategy B: Real-time high-fidelity frame capture

export interface DesktopExportJobConfig {
  jobId: string;
  project: ProjectData;
  settings: ExportSettings;
  audioSettings: AudioSettings;
  audioFilePath?: string;
  outputFilePath: string;
  strategy: DesktopRenderStrategy;
}

export interface DesktopExportProgress {
  jobId: string;
  status: 'validating' | 'rendering' | 'encoding' | 'muxing' | 'completed' | 'cancelled' | 'error';
  currentFrame: number;
  totalFrames: number;
  percentage: number;
  elapsedMs: number;
  estimatedRemainingMs: number;
  currentFps: number;
  message: string;
  error?: string;
}

export interface FFprobeValidationResult {
  valid: boolean;
  formatName: string;
  durationSeconds: number;
  sizeBytes: number;
  bitrate: number;
  video: {
    codec: string;
    width: number;
    height: number;
    fps: number;
    frameCount?: number;
    pixelFormat?: string;
  } | null;
  audio: {
    codec: string;
    sampleRate: number;
    channels: number;
    durationSeconds: number;
  } | null;
  error?: string;
}

export interface DesktopApiBridge {
  // Dialogs
  openProjectFile: () => Promise<{ canceled: boolean; filePaths: string[] }>;
  openProjectFolder: () => Promise<{ canceled: boolean; filePaths: string[] }>;
  openAudioFile: () => Promise<{ canceled: boolean; filePaths: string[] }>;
  saveVideoFile: (defaultName: string, format: string) => Promise<{ canceled: boolean; filePath?: string }>;

  // Projects
  openProjectFromPath: (path: string) => Promise<ProjectData>;
  saveProjectToDisk: (project: ProjectData, targetPath?: string) => Promise<{ success: boolean; filePath: string }>;
  getRecentProjects: () => Promise<RecentProjectItem[]>;
  removeRecentProject: (id: string) => Promise<void>;
  clearRecentProjects: () => Promise<void>;

  // Rendering & Export
  startExport: (config: DesktopExportJobConfig) => Promise<{ success: boolean; outputFilePath: string }>;
  cancelExport: () => Promise<{ success: boolean }>;
  verifyExportedVideo: (filePath: string) => Promise<FFprobeValidationResult>;

  // System & Shell
  getSystemCapabilities: () => Promise<DesktopSystemCapabilities>;
  openPath: (path: string) => Promise<string>;
  showItemInFolder: (path: string) => Promise<void>;

  // Event Subscriptions
  onExportProgress: (callback: (progress: DesktopExportProgress) => void) => () => void;
}
