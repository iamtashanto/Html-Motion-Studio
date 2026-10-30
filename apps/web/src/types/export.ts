import { z } from 'zod';

export type AspectRatioType = '16:9' | '9:16' | '1:1' | '4:5' | 'custom';

export type ResolutionPreset = '720p' | '1080p' | '1440p' | '4k';

export type FpsPreset = 24 | 30 | 60;

export type OutputFormat = 'mp4' | 'webm';

export type DurationPolicy = 'project' | 'audio' | 'custom';

export type QualityPreset = 'draft' | 'standard' | 'high' | 'ultra';

export interface DimensionConfig {
  width: number;
  height: number;
  aspectRatio: AspectRatioType;
}

export const ExportSettingsSchema = z.object({
  aspectRatio: z.enum(['16:9', '9:16', '1:1', '4:5', 'custom']),
  width: z.number().int().min(240).max(3840),
  height: z.number().int().min(240).max(3840),
  resolution: z.enum(['720p', '1080p', '1440p', '4k']),
  fps: z.union([z.literal(24), z.literal(30), z.literal(60)]),
  format: z.enum(['mp4', 'webm']),
  quality: z.enum(['draft', 'standard', 'high', 'ultra']),
  videoBitrateMbps: z.number().min(1).max(50),
  audioBitrateKbps: z.number().min(64).max(320),
  durationPolicy: z.enum(['project', 'audio', 'custom']),
  durationSeconds: z.number().min(0.5).max(300), // Max 5 mins for browser safeguard
  loopAnimationIfShorter: z.boolean(),
  filename: z.string().min(1).max(100),
  engineStrategy: z.enum(['auto', 'webcodecs', 'mediarecorder', 'canvas']),
});

export type ExportSettings = z.infer<typeof ExportSettingsSchema>;

export interface ExportProgress {
  status: 'idle' | 'validating' | 'preparing' | 'capturing' | 'encoding' | 'muxing' | 'completed' | 'cancelled' | 'error';
  currentFrame: number;
  totalFrames: number;
  percentage: number;
  elapsedMs: number;
  estimatedRemainingMs: number;
  currentFps: number;
  message: string;
  error?: string;
}

export interface ExportResult {
  blob: Blob;
  url: string;
  filename: string;
  format: OutputFormat;
  sizeBytes: number;
  durationSeconds: number;
  width: number;
  height: number;
  fps: number;
}

