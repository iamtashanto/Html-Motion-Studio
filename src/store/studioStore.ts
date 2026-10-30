import { create } from 'zustand';
import { ProjectData, CompatibilityReport, UploadMode } from '@/types/project';
import { ExportSettings, ExportProgress, ExportResult, AspectRatioType, ResolutionPreset } from '@/types/export';
import { AudioSettings } from '@/types/audio';
import { DecodedAudioData, decodeAudioFile } from '@/lib/audio/audioEngine';
import { inspectProjectCode } from '@/lib/analyzer/codeAnalyzer';
import { processZipFile, rewriteHtmlWithAssets } from '@/lib/zip/zipHandler';
import { SAMPLE_TEMPLATES, SampleTemplate } from '@/lib/templates/sampleTemplates';
import { detectBrowserCapabilities, BrowserCapabilities } from '@/lib/engine/capabilities';

export interface StudioState {
  // Project
  project: ProjectData;
  compatibility: CompatibilityReport;
  capabilities: BrowserCapabilities | null;

  // Audio
  audioSettings: AudioSettings;
  decodedAudio: DecodedAudioData | null;

  // Export Settings
  exportSettings: ExportSettings;

  // Preview State
  isPlaying: boolean;
  currentTime: number;
  previewScale: 'fit' | '50%' | '75%' | '100%';
  previewKey: number; // for reloads

  // Export Workflow State
  isExporting: boolean;
  exportProgress: ExportProgress;
  exportResult: ExportResult | null;
  abortController: AbortController | null;

  // Actions
  initialize: () => Promise<void>;
  loadTemplate: (templateId: string) => void;
  loadHtmlFile: (file: File) => Promise<void>;
  loadZipArchive: (file: File) => Promise<void>;
  setEntryHtmlPath: (path: string) => void;
  updateCode: (html: string, css?: string, js?: string) => void;
  setMode: (mode: UploadMode) => void;

  // Audio actions
  loadAudioFile: (file: File) => Promise<void>;
  updateAudioSettings: (settings: Partial<AudioSettings>) => void;
  clearAudio: () => void;

  // Export settings actions
  updateExportSettings: (settings: Partial<ExportSettings>) => void;
  setAspectRatio: (ratio: AspectRatioType) => void;
  setResolution: (res: ResolutionPreset) => void;

  // Preview actions
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setPreviewScale: (scale: 'fit' | '50%' | '75%' | '100%') => void;
  reloadPreview: () => void;

  // Export workflow
  startExport: (captureCanvas: HTMLCanvasElement) => Promise<void>;
  cancelExport: () => void;
  clearExportResult: () => void;
}

const DEFAULT_TEMPLATE = SAMPLE_TEMPLATES[1]; // CSS Keyframes motion as default

export const useStudioStore = create<StudioState>((set, get) => {
  const initialInspection = inspectProjectCode({
    html: DEFAULT_TEMPLATE.html,
    missingAssets: [],
  });

  return {
    project: {
      id: 'default-project',
      title: DEFAULT_TEMPLATE.name,
      mode: 'code',
      htmlContent: DEFAULT_TEMPLATE.html,
      entryHtmlPath: 'index.html',
      availableHtmlFiles: ['index.html'],
      assets: {},
      detectedDuration: DEFAULT_TEMPLATE.defaultDuration,
      missingAssets: [],
    },
    compatibility: initialInspection,
    capabilities: null,

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
    decodedAudio: null,

    exportSettings: {
      aspectRatio: '16:9',
      width: 1920,
      height: 1080,
      resolution: '1080p',
      fps: 30,
      format: 'mp4',
      quality: 'high',
      videoBitrateMbps: 8,
      audioBitrateKbps: 192,
      durationPolicy: 'project',
      durationSeconds: DEFAULT_TEMPLATE.defaultDuration,
      loopAnimationIfShorter: true,
      filename: 'motion-studio-export',
      engineStrategy: 'auto',
    },

    isPlaying: true,
    currentTime: 0,
    previewScale: 'fit',
    previewKey: 1,

    isExporting: false,
    exportProgress: {
      status: 'idle',
      currentFrame: 0,
      totalFrames: 0,
      percentage: 0,
      elapsedMs: 0,
      estimatedRemainingMs: 0,
      currentFps: 0,
      message: '',
    },
    exportResult: null,
    abortController: null,

    initialize: async () => {
      const caps = await detectBrowserCapabilities();
      set((state) => ({
        capabilities: caps,
        exportSettings: {
          ...state.exportSettings,
          format: caps.recommendedFormat,
        },
      }));
    },

    loadTemplate: (templateId: string) => {
      const template = SAMPLE_TEMPLATES.find((t) => t.id === templateId) || SAMPLE_TEMPLATES[0];
      const inspection = inspectProjectCode({
        html: template.html,
        css: template.css,
        js: template.js,
        missingAssets: [],
      });

      set((state) => ({
        project: {
          id: template.id,
          title: template.name,
          mode: 'code',
          htmlContent: template.html,
          cssContent: template.css,
          jsContent: template.js,
          entryHtmlPath: 'index.html',
          availableHtmlFiles: ['index.html'],
          assets: {},
          detectedDuration: template.defaultDuration,
          missingAssets: [],
        },
        compatibility: inspection,
        exportSettings: {
          ...state.exportSettings,
          durationSeconds: template.defaultDuration,
          filename: `export-${template.id}`,
        },
        previewKey: state.previewKey + 1,
        currentTime: 0,
      }));
    },

    loadHtmlFile: async (file: File) => {
      const text = await file.text();
      const inspection = inspectProjectCode({
        html: text,
        missingAssets: [],
      });

      const title = file.name.replace(/\.[^/.]+$/, '');
      const detectedDur = 4; // default baseline

      set((state) => ({
        project: {
          id: 'custom-html',
          title,
          mode: 'file',
          htmlContent: text,
          entryHtmlPath: file.name,
          availableHtmlFiles: [file.name],
          assets: {},
          detectedDuration: detectedDur,
          missingAssets: [],
        },
        compatibility: inspection,
        exportSettings: {
          ...state.exportSettings,
          durationSeconds: detectedDur,
          filename: title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        },
        previewKey: state.previewKey + 1,
        currentTime: 0,
      }));
    },

    loadZipArchive: async (file: File) => {
      const extracted = await processZipFile(file);
      const defaultEntryAsset = extracted.assets[extracted.defaultEntry];
      const htmlContent = defaultEntryAsset?.content || '';

      const rewrittenHtml = rewriteHtmlWithAssets(
        htmlContent,
        extracted.defaultEntry,
        extracted.assets
      );

      const inspection = inspectProjectCode({
        html: rewrittenHtml,
        missingAssets: extracted.missingAssets,
      });

      const title = file.name.replace(/\.[^/.]+$/, '');

      set((state) => ({
        project: {
          id: 'zip-project',
          title,
          mode: 'zip',
          htmlContent: rewrittenHtml,
          entryHtmlPath: extracted.defaultEntry,
          availableHtmlFiles: extracted.htmlFiles,
          assets: extracted.assets,
          detectedDuration: 5,
          missingAssets: extracted.missingAssets,
        },
        compatibility: inspection,
        exportSettings: {
          ...state.exportSettings,
          durationSeconds: 5,
          filename: title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        },
        previewKey: state.previewKey + 1,
        currentTime: 0,
      }));
    },

    setEntryHtmlPath: (entryPath: string) => {
      const { project } = get();
      const asset = project.assets[entryPath];
      if (!asset || !asset.content) return;

      const rewritten = rewriteHtmlWithAssets(asset.content, entryPath, project.assets);
      const inspection = inspectProjectCode({
        html: rewritten,
        missingAssets: project.missingAssets,
      });

      set((state) => ({
        project: {
          ...state.project,
          entryHtmlPath: entryPath,
          htmlContent: rewritten,
        },
        compatibility: inspection,
        previewKey: state.previewKey + 1,
      }));
    },

    updateCode: (html: string, css?: string, js?: string) => {
      const inspection = inspectProjectCode({
        html,
        css,
        js,
        missingAssets: [],
      });

      set((state) => ({
        project: {
          ...state.project,
          htmlContent: html,
          cssContent: css,
          jsContent: js,
        },
        compatibility: inspection,
        previewKey: state.previewKey + 1,
      }));
    },

    setMode: (mode: UploadMode) => {
      set((state) => ({
        project: {
          ...state.project,
          mode,
        },
      }));
    },

    loadAudioFile: async (file: File) => {
      try {
        const decoded = await decodeAudioFile(file);
        const url = URL.createObjectURL(file);

        set((state) => ({
          decodedAudio: decoded,
          audioSettings: {
            ...state.audioSettings,
            sourceMode: 'external',
            file,
            fileName: file.name,
            blobUrl: url,
            durationSeconds: decoded.duration,
            trimInSeconds: 0,
            trimOutSeconds: decoded.duration,
          },
          // If duration policy is set to audio, sync duration
          exportSettings: {
            ...state.exportSettings,
            durationSeconds:
              state.exportSettings.durationPolicy === 'audio'
                ? Math.round(decoded.duration)
                : state.exportSettings.durationSeconds,
          },
        }));
      } catch (err) {
        console.error('Audio decode error:', err);
        throw new Error('Failed to decode audio file. Browser supports MP3, WAV, and AAC.');
      }
    },

    updateAudioSettings: (updates: Partial<AudioSettings>) => {
      set((state) => {
        const newSettings = { ...state.audioSettings, ...updates };
        let newDurationSeconds = state.exportSettings.durationSeconds;

        if (updates.sourceMode === 'none' && state.exportSettings.durationPolicy === 'audio') {
          newDurationSeconds = state.project.detectedDuration || 4;
        }

        return {
          audioSettings: newSettings,
          exportSettings: {
            ...state.exportSettings,
            durationSeconds: newDurationSeconds,
          },
        };
      });
    },

    clearAudio: () => {
      set((state) => ({
        decodedAudio: null,
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
      }));
    },

    updateExportSettings: (updates: Partial<ExportSettings>) => {
      set((state) => ({
        exportSettings: { ...state.exportSettings, ...updates },
      }));
    },

    setAspectRatio: (aspectRatio: AspectRatioType) => {
      const { exportSettings } = get();
      let width = exportSettings.width;
      let height = exportSettings.height;
      const res = exportSettings.resolution;

      // Base dimension scale by resolution
      const scaleMap: Record<ResolutionPreset, number> = {
        '720p': 720,
        '1080p': 1080,
        '1440p': 1440,
        '4k': 2160,
      };
      const baseHeight = scaleMap[res] || 1080;

      switch (aspectRatio) {
        case '16:9':
          height = baseHeight;
          width = Math.round((baseHeight * 16) / 9);
          break;
        case '9:16':
          width = baseHeight;
          height = Math.round((baseHeight * 16) / 9);
          break;
        case '1:1':
          width = baseHeight;
          height = baseHeight;
          break;
        case '4:5':
          width = Math.round((baseHeight * 4) / 5);
          height = baseHeight;
          break;
        case 'custom':
          // keep existing
          break;
      }

      // Ensure even dimensions for video codecs (H.264 requires even width & height)
      width = width % 2 === 0 ? width : width + 1;
      height = height % 2 === 0 ? height : height + 1;

      set((state) => ({
        exportSettings: {
          ...state.exportSettings,
          aspectRatio,
          width,
          height,
        },
      }));
    },

    setResolution: (resolution: ResolutionPreset) => {
      set((state) => {
        const ratio = state.exportSettings.aspectRatio;
        const scaleMap: Record<ResolutionPreset, number> = {
          '720p': 720,
          '1080p': 1080,
          '1440p': 1440,
          '4k': 2160,
        };
        const baseHeight = scaleMap[resolution] || 1080;
        let width = 1920;
        let height = 1080;

        switch (ratio) {
          case '16:9':
            height = baseHeight;
            width = Math.round((baseHeight * 16) / 9);
            break;
          case '9:16':
            width = baseHeight;
            height = Math.round((baseHeight * 16) / 9);
            break;
          case '1:1':
            width = baseHeight;
            height = baseHeight;
            break;
          case '4:5':
            width = Math.round((baseHeight * 4) / 5);
            height = baseHeight;
            break;
          case 'custom':
            width = state.exportSettings.width;
            height = state.exportSettings.height;
            break;
        }

        width = width % 2 === 0 ? width : width + 1;
        height = height % 2 === 0 ? height : height + 1;

        return {
          exportSettings: {
            ...state.exportSettings,
            resolution,
            width,
            height,
          },
        };
      });
    },

    setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
    setCurrentTime: (currentTime: number) => set({ currentTime }),
    setPreviewScale: (previewScale) => set({ previewScale }),
    reloadPreview: () => set((s) => ({ previewKey: s.previewKey + 1, currentTime: 0 })),

    startExport: async (captureCanvas: HTMLCanvasElement) => {
      const { exportSettings, audioSettings, decodedAudio } = get();
      const controller = new AbortController();

      set({
        isExporting: true,
        abortController: controller,
        exportProgress: {
          status: 'validating',
          currentFrame: 0,
          totalFrames: Math.round(exportSettings.durationSeconds * exportSettings.fps),
          percentage: 0,
          elapsedMs: 0,
          estimatedRemainingMs: 0,
          currentFps: 0,
          message: 'Validating animation workspace and audio settings...',
        },
        exportResult: null,
      });

      try {
        const { runExportJob } = await import('@/lib/engine/renderEngine');
        const result = await runExportJob({
          settings: exportSettings,
          audioSettings,
          rawAudioBuffer: decodedAudio?.buffer || null,
          captureCanvas,
          onProgress: (progress) => {
            set({ exportProgress: progress });
          },
          signal: controller.signal,
        });

        set({
          isExporting: false,
          abortController: null,
          exportResult: result,
          exportProgress: {
            ...get().exportProgress,
            status: 'completed',
            percentage: 100,
            message: 'Conversion completed successfully!',
          },
        });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Export failed';
        if (controller.signal.aborted) {
          set({
            isExporting: false,
            abortController: null,
            exportProgress: {
              ...get().exportProgress,
              status: 'cancelled',
              message: 'Export was cancelled by user.',
            },
          });
        } else {
          set({
            isExporting: false,
            abortController: null,
            exportProgress: {
              ...get().exportProgress,
              status: 'error',
              error: errorMsg,
              message: `Error during export: ${errorMsg}`,
            },
          });
        }
      }
    },

    cancelExport: () => {
      const { abortController } = get();
      if (abortController) {
        abortController.abort();
      }
    },

    clearExportResult: () => {
      set({ exportResult: null });
    },
  };
});

