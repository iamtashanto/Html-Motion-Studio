export type UploadMode = 'file' | 'zip' | 'code';

export interface ProjectAsset {
  path: string;
  name: string;
  type: string;
  size: number;
  blobUrl: string;
  content?: string; // For text/css/js
}

export interface ProjectData {
  id: string;
  title: string;
  mode: UploadMode;
  htmlContent: string;
  renderHtmlPath?: string; // Optional path to pre-rendered HTML file on local disk for zero-overhead IPC
  cssContent?: string;
  jsContent?: string;
  entryHtmlPath: string;
  availableHtmlFiles: string[];
  assets: Record<string, ProjectAsset>; // relative path -> ProjectAsset
  detectedDuration?: number; // In seconds, if detected
  missingAssets: string[];
}

export type CompatibilityStatus = 
  | 'ready'               // All green, perfect for browser export
  | 'limited'             // Some features may drop frames or need MediaRecorder
  | 'desktop-recommended' // Heavy WebGL, complex rAF or long durations
  | 'unsupported';        // Broken scripts, missing critical APIs

export interface CompatibilityCheckItem {
  id: string;
  name: string;
  detected: boolean;
  status: 'ok' | 'warning' | 'error' | 'info';
  details: string;
}

export interface CompatibilityReport {
  overallStatus: CompatibilityStatus;
  summary: string;
  checks: CompatibilityCheckItem[];
  detectedFeatures: {
    hasHtml: boolean;
    hasCssAnimations: boolean;
    hasCssTransitions: boolean;
    hasRaf: boolean;
    hasCanvas: boolean;
    hasSvg: boolean;
    hasWebGL: boolean;
    hasAudio: boolean;
    externalUrls: string[];
    missingAssets: string[];
    corsRisks: boolean;
  };
  recommendedStrategy: 'webcodecs' | 'mediarecorder' | 'canvas';
  warnings: string[];
}

