export type AudioSourceMode = 'none' | 'external' | 'html' | 'both';

export interface AudioSettings {
  sourceMode: AudioSourceMode;
  file?: File;
  fileName?: string;
  blobUrl?: string;
  durationSeconds: number;
  volume: number; // 0 to 2 (1.0 = 100%)
  startOffsetSeconds: number; // delay before audio starts
  trimInSeconds: number; // start playback from this timestamp in audio
  trimOutSeconds: number; // end playback at this timestamp in audio
  fadeInSeconds: number;
  fadeOutSeconds: number;
}

