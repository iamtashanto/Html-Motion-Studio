import { create } from 'zustand';
import {
  ProjectData,
  ExportSettings,
  AudioSettings,
  RecentProjectItem,
  DesktopSystemCapabilities,
  DesktopRenderStrategy,
  DesktopExportProgress,
  FFprobeValidationResult,
  SAMPLE_TEMPLATES,
  inspectProjectCode,
} from '@html-motion-studio/shared';

export interface DesktopStudioState {
  // Project & Persistence
  project: ProjectData;
  projectFilePath: string | null;
  isDirty: boolean;
  recentProjects: RecentProjectItem[];
  systemCapabilities: DesktopSystemCapabilities | null;

  // Preview & Viewport
  isPlaying: boolean;
  currentTime: number;
  previewZoom: 'fit' | '50%' | '75%' | '100%' | '200%';
  previewBackground: 'dark' | 'grid' | 'light' | 'checker';
  previewKey: number;

  // Audio Configuration
  audioSettings: AudioSettings;
  audioFilePath: string | null;

  // Export Settings
  exportSettings: ExportSettings;
  exportStrategy: DesktopRenderStrategy;
  outputDirectory: string;
  outputFilename: string;

  // Export Execution State
  isExporting: boolean;
  exportProgress: DesktopExportProgress | null;
  exportResult: { outputFilePath: string; validation: FFprobeValidationResult } | null;
  exportError: string | null;

  // Split-Pane Layout & Resizing
  leftSidebarWidth: number;
  leftSidebarCollapsed: boolean;
  rightPanelWidth: number;
  rightPanelCollapsed: boolean;
  timelineHeight: number;
  timelineCollapsed: boolean;
  isResizing: boolean;

  // Layout Actions
  setLeftSidebarWidth: (width: number) => void;
  toggleLeftSidebar: () => void;
  resetLeftSidebarWidth: () => void;
  setRightPanelWidth: (width: number) => void;
  toggleRightPanel: () => void;
  resetRightPanelWidth: () => void;
  setTimelineHeight: (height: number) => void;
  toggleTimeline: () => void;
  resetTimelineHeight: () => void;
  setIsResizing: (resizing: boolean) => void;

  // Actions
  initialize: () => Promise<void>;
  createProject: (title?: string, templateId?: string) => void;
  openProjectFile: () => Promise<void>;
  openProjectFolder: () => Promise<void>;
  openProjectFromPath: (targetPath: string) => Promise<void>;
  saveProject: (targetPath?: string) => Promise<void>;
  selectAudioFile: () => Promise<void>;
  clearAudio: () => void;
  updateAudioSettings: (settings: Partial<AudioSettings>) => void;

  // Playback & Scrubbing
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  seek: (time: number) => void;
  restart: () => void;
  setPreviewZoom: (zoom: 'fit' | '50%' | '75%' | '100%' | '200%') => void;
  setPreviewBackground: (bg: 'dark' | 'grid' | 'light' | 'checker') => void;

  // Project Editing
  setEntryHtml: (path: string) => void;
  updateHtmlContent: (html: string) => void;
  setProjectTitle: (title: string) => void;

  // Export
  updateExportSettings: (settings: Partial<ExportSettings>) => void;
  setExportStrategy: (strategy: DesktopRenderStrategy) => void;
  setOutputDirectory: (dir: string) => void;
  setOutputFilename: (name: string) => void;
  selectSaveDestination: () => Promise<void>;
  startExport: () => Promise<void>;
  cancelExport: () => Promise<void>;
  clearExportResult: () => void;
  clearExportError: () => void;
  openExportedVideo: () => void;
  showExportInFolder: () => void;
}

const DEFAULT_TEMPLATE = SAMPLE_TEMPLATES[1]; // CSS Keyframe Motion

export const useDesktopStudioStore = create<DesktopStudioState>((set, get) => {
  return {
    project: {
      id: 'default-desktop-project',
      title: DEFAULT_TEMPLATE.name,
      mode: 'code',
      htmlContent: DEFAULT_TEMPLATE.html,
      entryHtmlPath: 'index.html',
      availableHtmlFiles: ['index.html'],
      assets: {},
      detectedDuration: DEFAULT_TEMPLATE.defaultDuration,
      missingAssets: [],
    },
    projectFilePath: null,
    isDirty: false,
    recentProjects: [],
    systemCapabilities: null,

    isPlaying: false,
    currentTime: 0,
    previewZoom: 'fit',
    previewBackground: 'dark',
    previewKey: 1,

    audioSettings: {
      sourceMode: 'none',
      durationSeconds: 0,
      volume: 1.0,
      startOffsetSeconds: 0,
      trimInSeconds: 0,
      trimOutSeconds: 0,
      fadeInSeconds: 0.5,
      fadeOutSeconds: 0.5,
    },
    audioFilePath: null,

    exportSettings: {
      aspectRatio: '16:9',
      width: 1920,
      height: 1080,
      resolution: '1080p',
      fps: 60, // Desktop defaults to smooth 60fps
      format: 'mp4',
      quality: 'high',
      videoBitrateMbps: 16,
      audioBitrateKbps: 256,
      durationPolicy: 'project',
      durationSeconds: DEFAULT_TEMPLATE.defaultDuration,
      loopAnimationIfShorter: true,
      filename: 'desktop-export',
      engineStrategy: 'auto',
    },
    exportStrategy: 'compatibility',
    outputDirectory: '',
    outputFilename: 'desktop-export',

    isExporting: false,
    exportProgress: null,
    exportResult: null,
    exportError: null,

    // Layout default dimensions (px)
    leftSidebarWidth: 260,
    leftSidebarCollapsed: false,
    rightPanelWidth: 320,
    rightPanelCollapsed: false,
    timelineHeight: 160,
    timelineCollapsed: false,
    isResizing: false,

    setLeftSidebarWidth: (width: number) => {
      const clamped = Math.max(180, Math.min(480, width));
      set({ leftSidebarWidth: clamped });
      try {
        localStorage.setItem('hms_desktop_left_sidebar_width', clamped.toString());
      } catch {}
    },

    toggleLeftSidebar: () => {
      const next = !get().leftSidebarCollapsed;
      set({ leftSidebarCollapsed: next });
      try {
        localStorage.setItem('hms_desktop_left_sidebar_collapsed', next.toString());
      } catch {}
    },

    resetLeftSidebarWidth: () => {
      set({ leftSidebarWidth: 260, leftSidebarCollapsed: false });
      try {
        localStorage.setItem('hms_desktop_left_sidebar_width', '260');
        localStorage.setItem('hms_desktop_left_sidebar_collapsed', 'false');
      } catch {}
    },

    setRightPanelWidth: (width: number) => {
      const clamped = Math.max(240, Math.min(520, width));
      set({ rightPanelWidth: clamped });
      try {
        localStorage.setItem('hms_desktop_right_panel_width', clamped.toString());
      } catch {}
    },

    toggleRightPanel: () => {
      const next = !get().rightPanelCollapsed;
      set({ rightPanelCollapsed: next });
      try {
        localStorage.setItem('hms_desktop_right_panel_collapsed', next.toString());
      } catch {}
    },

    resetRightPanelWidth: () => {
      set({ rightPanelWidth: 320, rightPanelCollapsed: false });
      try {
        localStorage.setItem('hms_desktop_right_panel_width', '320');
        localStorage.setItem('hms_desktop_right_panel_collapsed', 'false');
      } catch {}
    },

    setTimelineHeight: (height: number) => {
      const clamped = Math.max(100, Math.min(380, height));
      set({ timelineHeight: clamped });
      try {
        localStorage.setItem('hms_desktop_timeline_height', clamped.toString());
      } catch {}
    },

    toggleTimeline: () => {
      const next = !get().timelineCollapsed;
      set({ timelineCollapsed: next });
      try {
        localStorage.setItem('hms_desktop_timeline_collapsed', next.toString());
      } catch {}
    },

    resetTimelineHeight: () => {
      set({ timelineHeight: 160, timelineCollapsed: false });
      try {
        localStorage.setItem('hms_desktop_timeline_height', '160');
        localStorage.setItem('hms_desktop_timeline_collapsed', 'false');
      } catch {}
    },

    setIsResizing: (resizing: boolean) => set({ isResizing: resizing }),

    initialize: async () => {
      // Restore layout preferences
      try {
        const savedLeft = localStorage.getItem('hms_desktop_left_sidebar_width');
        const savedLeftCollapsed = localStorage.getItem('hms_desktop_left_sidebar_collapsed');
        const savedRight = localStorage.getItem('hms_desktop_right_panel_width');
        const savedRightCollapsed = localStorage.getItem('hms_desktop_right_panel_collapsed');
        const savedTimeline = localStorage.getItem('hms_desktop_timeline_height');
        const savedTimelineCollapsed = localStorage.getItem('hms_desktop_timeline_collapsed');

        set({
          ...(savedLeft ? { leftSidebarWidth: Math.max(180, Math.min(480, parseInt(savedLeft, 10))) } : {}),
          ...(savedLeftCollapsed ? { leftSidebarCollapsed: savedLeftCollapsed === 'true' } : {}),
          ...(savedRight ? { rightPanelWidth: Math.max(240, Math.min(520, parseInt(savedRight, 10))) } : {}),
          ...(savedRightCollapsed ? { rightPanelCollapsed: savedRightCollapsed === 'true' } : {}),
          ...(savedTimeline ? { timelineHeight: Math.max(100, Math.min(380, parseInt(savedTimeline, 10))) } : {}),
          ...(savedTimelineCollapsed ? { timelineCollapsed: savedTimelineCollapsed === 'true' } : {}),
        });
      } catch {}
      if (typeof window !== 'undefined' && window.desktopApi) {
        try {
          const caps = await window.desktopApi.getSystemCapabilities();
          const recents = await window.desktopApi.getRecentProjects();
          set({ systemCapabilities: caps, recentProjects: recents });

          // Listen for export progress pushed from Electron main process
          window.desktopApi.onExportProgress((progress) => {
            set({ exportProgress: progress });
            if (progress.status === 'completed') {
              set({ isExporting: false });
            } else if (progress.status === 'error') {
              set({ isExporting: false, exportError: progress.error || progress.message });
            } else if (progress.status === 'cancelled') {
              set({ isExporting: false, exportError: 'Export was cancelled by user.' });
            }
          });
        } catch (err) {
          console.error('Failed to initialize desktop API:', err);
        }
      }
    },

    createProject: (title = 'Untitled Motion Studio Project', templateId?: string) => {
      const template = templateId
        ? SAMPLE_TEMPLATES.find((t) => t.id === templateId) || DEFAULT_TEMPLATE
        : DEFAULT_TEMPLATE;

      set((state) => ({
        project: {
          id: `proj-${Date.now()}`,
          title,
          mode: 'code',
          htmlContent: template.html,
          entryHtmlPath: 'index.html',
          availableHtmlFiles: ['index.html'],
          assets: {},
          detectedDuration: template.defaultDuration,
          missingAssets: [],
        },
        projectFilePath: null,
        isDirty: false,
        currentTime: 0,
        isPlaying: false,
        previewKey: state.previewKey + 1,
        exportSettings: {
          ...state.exportSettings,
          durationSeconds: template.defaultDuration,
          filename: title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        },
      }));
    },

    openProjectFile: async () => {
      if (!window.desktopApi) return;
      const res = await window.desktopApi.openProjectFile();
      if (!res.canceled && res.filePaths[0]) {
        await get().openProjectFromPath(res.filePaths[0]);
      }
    },

    openProjectFolder: async () => {
      if (!window.desktopApi) return;
      const res = await window.desktopApi.openProjectFolder();
      if (!res.canceled && res.filePaths[0]) {
        await get().openProjectFromPath(res.filePaths[0]);
      }
    },

    openProjectFromPath: async (targetPath: string) => {
      if (!window.desktopApi) return;
      try {
        const loadedProject = await window.desktopApi.openProjectFromPath(targetPath);
        const recents = await window.desktopApi.getRecentProjects();

        set((state) => ({
          project: loadedProject,
          projectFilePath: targetPath,
          isDirty: false,
          recentProjects: recents,
          currentTime: 0,
          isPlaying: false,
          previewKey: state.previewKey + 1,
          exportSettings: {
            ...state.exportSettings,
            durationSeconds: loadedProject.detectedDuration || 4,
            filename: loadedProject.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          },
        }));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        alert(`Failed to open project: ${msg}`);
      }
    },

    saveProject: async (targetPath?: string) => {
      if (!window.desktopApi) return;
      const { project, projectFilePath } = get();
      const path_to_save = targetPath || projectFilePath || undefined;

      try {
        const res = await window.desktopApi.saveProjectToDisk(project, path_to_save);
        if (res.success) {
          const recents = await window.desktopApi.getRecentProjects();
          set({
            projectFilePath: res.filePath,
            isDirty: false,
            recentProjects: recents,
          });
        }
      } catch (err) {
        console.error('Failed to save project:', err);
      }
    },

    selectAudioFile: async () => {
      if (!window.desktopApi) return;
      const res = await window.desktopApi.openAudioFile();
      if (!res.canceled && res.filePaths[0]) {
        const filePath = res.filePaths[0];
        const fileName = filePath.split(/[/\\]/).pop() || 'soundtrack';

        set((state) => ({
          audioFilePath: filePath,
          audioSettings: {
            ...state.audioSettings,
            sourceMode: 'external',
            fileName,
          },
          isDirty: true,
        }));
      }
    },

    clearAudio: () => {
      set((state) => ({
        audioFilePath: null,
        audioSettings: {
          ...state.audioSettings,
          sourceMode: 'none',
          fileName: undefined,
        },
        isDirty: true,
      }));
    },

    updateAudioSettings: (updates: Partial<AudioSettings>) => {
      set((state) => ({
        audioSettings: { ...state.audioSettings, ...updates },
        isDirty: true,
      }));
    },

    setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
    setCurrentTime: (currentTime: number) => set({ currentTime }),
    seek: (time: number) => {
      const dur = get().exportSettings.durationSeconds;
      const clamped = Math.max(0, Math.min(dur, time));
      set({ currentTime: clamped });
    },
    restart: () => {
      set((state) => ({ currentTime: 0, isPlaying: true, previewKey: state.previewKey + 1 }));
    },
    setPreviewZoom: (previewZoom) => set({ previewZoom }),
    setPreviewBackground: (previewBackground) => set({ previewBackground }),

    setEntryHtml: (entryPath: string) => {
      const { project } = get();
      const asset = project.assets[entryPath];
      if (asset && asset.content) {
        set((state) => ({
          project: {
            ...state.project,
            entryHtmlPath: entryPath,
            htmlContent: asset.content || state.project.htmlContent,
          },
          previewKey: state.previewKey + 1,
          isDirty: true,
        }));
      }
    },

    updateHtmlContent: (html: string) => {
      set((state) => ({
        project: { ...state.project, htmlContent: html },
        previewKey: state.previewKey + 1,
        isDirty: true,
      }));
    },

    setProjectTitle: (title: string) => {
      set((state) => ({
        project: { ...state.project, title },
        exportSettings: {
          ...state.exportSettings,
          filename: title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        },
        isDirty: true,
      }));
    },

    updateExportSettings: (updates: Partial<ExportSettings>) => {
      set((state) => ({
        exportSettings: { ...state.exportSettings, ...updates },
      }));
    },

    setExportStrategy: (exportStrategy) => set({ exportStrategy }),
    setOutputDirectory: (outputDirectory) => set({ outputDirectory }),
    setOutputFilename: (outputFilename) => set({ outputFilename }),

    selectSaveDestination: async () => {
      if (!window.desktopApi) return;
      const { exportSettings, project } = get();
      const defaultName = exportSettings.filename || project.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const res = await window.desktopApi.saveVideoFile(defaultName, exportSettings.format);
      if (!res.canceled && res.filePath) {
        const parts = res.filePath.split(/[/\\]/);
        const fname = parts.pop() || defaultName;
        const dir = parts.join('/');
        set({
          outputDirectory: dir,
          outputFilename: fname.replace(/\.[^/.]+$/, ''),
        });
      }
    },

    startExport: async () => {
      if (!window.desktopApi) return;
      const {
        project,
        exportSettings,
        audioSettings,
        audioFilePath,
        exportStrategy,
        outputDirectory,
        outputFilename,
      } = get();

      // Ensure valid output filename
      const finalFileName = `${outputFilename || exportSettings.filename || 'export'}.${exportSettings.format}`;
      const defaultDir = outputDirectory || (window as unknown as { process?: { env?: { HOME?: string } } }).process?.env?.HOME || '/tmp';
      const outputFilePath = `${defaultDir}/${finalFileName}`;

      set({
        isExporting: true,
        exportError: null,
        exportResult: null,
        exportProgress: {
          jobId: `job-${Date.now()}`,
          status: 'validating',
          currentFrame: 0,
          totalFrames: Math.round(exportSettings.durationSeconds * exportSettings.fps),
          percentage: 0,
          elapsedMs: 0,
          estimatedRemainingMs: 0,
          currentFps: 0,
          message: 'Initializing desktop rendering pipeline...',
        },
      });

      try {
        const res = await window.desktopApi.startExport({
          jobId: `job-${Date.now()}`,
          project,
          settings: exportSettings,
          audioSettings,
          audioFilePath: audioFilePath || undefined,
          outputFilePath,
          strategy: exportStrategy,
        });

        if (res.success) {
          const validation = await window.desktopApi.verifyExportedVideo(res.outputFilePath);
          set({
            isExporting: false,
            exportResult: {
              outputFilePath: res.outputFilePath,
              validation,
            },
            exportProgress: {
              jobId: 'done',
              status: 'completed',
              currentFrame: Math.round(exportSettings.durationSeconds * exportSettings.fps),
              totalFrames: Math.round(exportSettings.durationSeconds * exportSettings.fps),
              percentage: 100,
              elapsedMs: 0,
              estimatedRemainingMs: 0,
              currentFps: exportSettings.fps,
              message: 'Export completed successfully!',
            },
          });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        set({
          isExporting: false,
          exportError: msg,
        });
      }
    },

    cancelExport: async () => {
      if (!window.desktopApi) return;
      await window.desktopApi.cancelExport();
      set({
        isExporting: false,
        exportError: 'Export was cancelled by user.',
      });
    },

    clearExportResult: () => set({ exportResult: null }),
    clearExportError: () => set({ exportError: null }),

    openExportedVideo: () => {
      const res = get().exportResult;
      if (res && window.desktopApi) {
        window.desktopApi.openPath(res.outputFilePath);
      }
    },

    showExportInFolder: () => {
      const res = get().exportResult;
      if (res && window.desktopApi) {
        window.desktopApi.showItemInFolder(res.outputFilePath);
      }
    },
  };
});

