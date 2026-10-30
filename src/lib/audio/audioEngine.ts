import { AudioSettings } from '@/types/audio';

export interface DecodedAudioData {
  buffer: AudioBuffer;
  duration: number;
  sampleRate: number;
  numberOfChannels: number;
  peakWaveform: number[]; // 50-100 normalized peak points for UI waveform rendering
}

let sharedAudioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!sharedAudioContext) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    sharedAudioContext = new AudioContextClass();
  }
  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume().catch(() => {});
  }
  return sharedAudioContext;
}

/**
 * Decodes an uploaded audio file (MP3, WAV, AAC/M4A) using the browser's Web Audio API
 */
export async function decodeAudioFile(file: File): Promise<DecodedAudioData> {
  const arrayBuffer = await file.arrayBuffer();
  const ctx = getAudioContext();

  // Decode audio data (creates clone because decodeAudioData detaches the arrayBuffer)
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));

  // Extract downsampled waveform peaks for clean visualizer rendering
  const peaks = extractWaveformPeaks(audioBuffer, 80);

  return {
    buffer: audioBuffer,
    duration: audioBuffer.duration,
    sampleRate: audioBuffer.sampleRate,
    numberOfChannels: audioBuffer.numberOfChannels,
    peakWaveform: peaks,
  };
}

function extractWaveformPeaks(buffer: AudioBuffer, numPeaks: number): number[] {
  const channelData = buffer.getChannelData(0);
  const step = Math.floor(channelData.length / numPeaks);
  const peaks: number[] = [];

  for (let i = 0; i < numPeaks; i++) {
    const start = i * step;
    let max = 0;
    for (let j = 0; j < step; j++) {
      const val = Math.abs(channelData[start + j] || 0);
      if (val > max) max = val;
    }
    peaks.push(Math.min(1, Math.max(0.05, max)));
  }

  return peaks;
}

/**
 * Renders the processed audio buffer using OfflineAudioContext,
 * applying volume, start offset, trim in/out, and fade in/out curves.
 */
export async function renderProcessedAudioBuffer(
  sourceBuffer: AudioBuffer,
  settings: AudioSettings,
  targetDurationSeconds: number
): Promise<AudioBuffer> {
  const sampleRate = sourceBuffer.sampleRate;
  const numberOfChannels = Math.min(2, sourceBuffer.numberOfChannels);

  // Duration in target timeline
  const renderLengthSamples = Math.ceil(targetDurationSeconds * sampleRate);
  const offlineCtx = new OfflineAudioContext(numberOfChannels, renderLengthSamples, sampleRate);

  const sourceNode = offlineCtx.createBufferSource();
  sourceNode.buffer = sourceBuffer;

  const gainNode = offlineCtx.createGain();

  // Volume
  const baseVolume = settings.volume;
  gainNode.gain.setValueAtTime(baseVolume, 0);

  // Fade In
  if (settings.fadeInSeconds > 0) {
    gainNode.gain.setValueAtTime(0, settings.startOffsetSeconds);
    gainNode.gain.linearRampToValueAtTime(
      baseVolume,
      Math.min(targetDurationSeconds, settings.startOffsetSeconds + settings.fadeInSeconds)
    );
  }

  // Fade Out
  if (settings.fadeOutSeconds > 0) {
    const fadeOutStart = Math.max(0, targetDurationSeconds - settings.fadeOutSeconds);
    gainNode.gain.setValueAtTime(baseVolume, fadeOutStart);
    gainNode.gain.linearRampToValueAtTime(0, targetDurationSeconds);
  }

  sourceNode.connect(gainNode);
  gainNode.connect(offlineCtx.destination);

  // Timing: trim in/out
  const offsetInSource = Math.max(0, settings.trimInSeconds);
  const playDuration = settings.trimOutSeconds > 0
    ? Math.max(0.1, settings.trimOutSeconds - offsetInSource)
    : undefined;

  sourceNode.start(settings.startOffsetSeconds, offsetInSource, playDuration);

  return await offlineCtx.startRendering();
}

