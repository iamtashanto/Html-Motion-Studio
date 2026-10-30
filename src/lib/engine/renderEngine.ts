import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import { Muxer as WebmMuxer, ArrayBufferTarget as WebmArrayBufferTarget } from 'webm-muxer';
import { ExportSettings, ExportProgress, ExportResult } from '@/types/export';
import { AudioSettings } from '@/types/audio';
import { renderProcessedAudioBuffer } from '../audio/audioEngine';

export interface RenderJobOptions {
  settings: ExportSettings;
  audioSettings: AudioSettings;
  rawAudioBuffer?: AudioBuffer | null;
  captureCanvas: HTMLCanvasElement;
  onProgress: (progress: ExportProgress) => void;
  signal: AbortSignal;
}

export async function runExportJob(options: RenderJobOptions): Promise<ExportResult> {
  const { settings, audioSettings, rawAudioBuffer, captureCanvas, onProgress, signal } = options;

  const totalFrames = Math.round(settings.durationSeconds * settings.fps);
  const frameIntervalMs = 1000 / settings.fps;
  const startTime = performance.now();

  // Validate canvas dimensions
  captureCanvas.width = settings.width;
  captureCanvas.height = settings.height;

  // Decide strategy
  const useWebCodecs =
    (settings.engineStrategy === 'auto' || settings.engineStrategy === 'webcodecs') &&
    typeof window !== 'undefined' &&
    'VideoEncoder' in window;

  if (useWebCodecs) {
    try {
      return await exportWithWebCodecs(options, totalFrames, frameIntervalMs, startTime);
    } catch (err) {
      console.warn('[RenderEngine] WebCodecs pipeline encountered an error, attempting MediaRecorder fallback:', err);
      if (signal.aborted) {
        throw new Error('Export cancelled by user.');
      }
      return await exportWithMediaRecorder(options, totalFrames, startTime);
    }
  } else {
    return await exportWithMediaRecorder(options, totalFrames, startTime);
  }
}

/**
 * Strategy C: Frame-by-frame encoding via WebCodecs + MP4 Muxer / WebM Muxer
 */
async function exportWithWebCodecs(
  options: RenderJobOptions,
  totalFrames: number,
  frameIntervalMs: number,
  startTime: number
): Promise<ExportResult> {
  const { settings, audioSettings, rawAudioBuffer, captureCanvas, onProgress, signal } = options;

  onProgress({
    status: 'preparing',
    currentFrame: 0,
    totalFrames,
    percentage: 2,
    elapsedMs: 0,
    estimatedRemainingMs: 0,
    currentFps: 0,
    message: 'Initializing hardware video encoder and container muxer...',
  });

  const isMp4 = settings.format === 'mp4';
  const target = isMp4 ? new ArrayBufferTarget() : new WebmArrayBufferTarget();

  // Setup muxer
  let muxer: Muxer<ArrayBufferTarget> | WebmMuxer<WebmArrayBufferTarget>;

  if (isMp4) {
    muxer = new Muxer({
      target: target as ArrayBufferTarget,
      video: {
        codec: 'avc',
        width: settings.width,
        height: settings.height,
      },
      fastStart: 'in-memory',
    });
  } else {
    muxer = new WebmMuxer({
      target: target as WebmArrayBufferTarget,
      video: {
        codec: 'V_VP9',
        width: settings.width,
        height: settings.height,
        frameRate: settings.fps,
      },
    });
  }

  // Setup VideoEncoder
  let encodedChunks = 0;
  const encoder = new VideoEncoder({
    output: (chunk, meta) => {
      muxer.addVideoChunk(chunk, meta);
      encodedChunks++;
    },
    error: (e) => {
      console.error('[VideoEncoder] error:', e);
    },
  });

  const videoCodecString = isMp4 ? 'avc1.42001f' : 'vp09.00.10.08';
  encoder.configure({
    codec: videoCodecString,
    width: settings.width,
    height: settings.height,
    bitrate: settings.videoBitrateMbps * 1_000_000,
    framerate: settings.fps,
  });

  onProgress({
    status: 'capturing',
    currentFrame: 0,
    totalFrames,
    percentage: 5,
    elapsedMs: 0,
    estimatedRemainingMs: 0,
    currentFps: 0,
    message: 'Capturing and encoding video frames...',
  });

  const frameDurationMicros = Math.round(1_000_000 / settings.fps);

  // Encode frames sequentially
  for (let f = 0; f < totalFrames; f++) {
    if (signal.aborted) {
      encoder.close();
      throw new Error('Export cancelled by user.');
    }

    const timestampMicros = f * frameDurationMicros;
    const isKeyFrame = f % (settings.fps * 2) === 0;

    // Create VideoFrame from current canvas state
    const videoFrame = new VideoFrame(captureCanvas, {
      timestamp: timestampMicros,
      duration: frameDurationMicros,
    });

    encoder.encode(videoFrame, { keyFrame: isKeyFrame });
    videoFrame.close();

    // Progress calculations
    const elapsed = performance.now() - startTime;
    const currentFps = f > 0 ? (f / (elapsed / 1000)) : 0;
    const remainingFrames = totalFrames - f;
    const estimatedRemainingMs = currentFps > 0 ? (remainingFrames / currentFps) * 1000 : 0;
    const percent = Math.min(92, Math.round((f / totalFrames) * 88) + 5);

    if (f % 5 === 0 || f === totalFrames - 1) {
      onProgress({
        status: 'encoding',
        currentFrame: f + 1,
        totalFrames,
        percentage: percent,
        elapsedMs: Math.round(elapsed),
        estimatedRemainingMs: Math.round(estimatedRemainingMs),
        currentFps: Math.round(currentFps * 10) / 10,
        message: `Encoding frame ${f + 1} of ${totalFrames} (${Math.round(currentFps)} fps)...`,
      });

      // Give event loop time to breathe
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  onProgress({
    status: 'muxing',
    currentFrame: totalFrames,
    totalFrames,
    percentage: 95,
    elapsedMs: Math.round(performance.now() - startTime),
    estimatedRemainingMs: 500,
    currentFps: settings.fps,
    message: 'Finalizing video streams and container metadata...',
  });

  await encoder.flush();
  encoder.close();

  muxer.finalize();
  const buffer = (target as ArrayBufferTarget).buffer;
  const mimeType = isMp4 ? 'video/mp4' : 'video/webm';
  const blob = new Blob([buffer], { type: mimeType });

  return {
    blob,
    url: URL.createObjectURL(blob),
    filename: `${settings.filename}.${settings.format}`,
    format: settings.format,
    sizeBytes: blob.size,
    durationSeconds: settings.durationSeconds,
    width: settings.width,
    height: settings.height,
    fps: settings.fps,
  };
}

/**
 * Strategy B: MediaRecorder compatibility fallback (with audio track mixing)
 */
async function exportWithMediaRecorder(
  options: RenderJobOptions,
  totalFrames: number,
  startTime: number
): Promise<ExportResult> {
  const { settings, audioSettings, rawAudioBuffer, captureCanvas, onProgress, signal } = options;

  onProgress({
    status: 'preparing',
    currentFrame: 0,
    totalFrames,
    percentage: 5,
    elapsedMs: 0,
    estimatedRemainingMs: 0,
    currentFps: 0,
    message: 'Initializing MediaRecorder realtime capture...',
  });

  // 1. Get canvas stream
  const canvasStream = captureCanvas.captureStream(settings.fps);
  const mediaStreamTracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];

  // 2. Mix audio if requested and available
  let audioContext: AudioContext | null = null;
  if (
    (audioSettings.sourceMode === 'external' || audioSettings.sourceMode === 'both') &&
    rawAudioBuffer
  ) {
    try {
      const processedBuffer = await renderProcessedAudioBuffer(
        rawAudioBuffer,
        audioSettings,
        settings.durationSeconds
      );

      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContext = new AudioContextClass();
      const dest = audioContext.createMediaStreamDestination();
      const source = audioContext.createBufferSource();
      source.buffer = processedBuffer;
      source.connect(dest);
      source.start(0);

      const audioTrack = dest.stream.getAudioTracks()[0];
      if (audioTrack) {
        mediaStreamTracks.push(audioTrack);
      }
    } catch (e) {
      console.warn('[MediaRecorder] Audio mixing skipped:', e);
    }
  }

  const combinedStream = new MediaStream(mediaStreamTracks);

  // 3. Select mimeType
  let mimeType = 'video/webm';
  if (settings.format === 'mp4' && MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
    mimeType = 'video/mp4;codecs=avc1';
  } else if (settings.format === 'mp4' && MediaRecorder.isTypeSupported('video/mp4')) {
    mimeType = 'video/mp4';
  } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
    mimeType = 'video/webm;codecs=vp9';
  }

  const recorder = new MediaRecorder(combinedStream, {
    mimeType,
    videoBitsPerSecond: settings.videoBitrateMbps * 1_000_000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  return new Promise<ExportResult>((resolve, reject) => {
    const totalDurationMs = settings.durationSeconds * 1000;
    const progressInterval = setInterval(() => {
      if (signal.aborted) {
        clearInterval(progressInterval);
        recorder.stop();
        if (audioContext) audioContext.close();
        reject(new Error('Export cancelled by user.'));
        return;
      }

      const elapsed = performance.now() - startTime;
      const percent = Math.min(95, Math.round((elapsed / totalDurationMs) * 90) + 5);
      const remaining = Math.max(0, totalDurationMs - elapsed);
      const currentFrame = Math.min(totalFrames, Math.round((elapsed / 1000) * settings.fps));

      onProgress({
        status: 'capturing',
        currentFrame,
        totalFrames,
        percentage: percent,
        elapsedMs: Math.round(elapsed),
        estimatedRemainingMs: Math.round(remaining),
        currentFps: settings.fps,
        message: `Recording realtime stream (${Math.round(elapsed / 1000)}s / ${Math.round(settings.durationSeconds)}s)...`,
      });
    }, 200);

    recorder.onstop = () => {
      clearInterval(progressInterval);
      if (audioContext) audioContext.close();

      const finalBlob = new Blob(chunks, { type: mimeType });
      const actualFormat = mimeType.includes('mp4') ? 'mp4' : 'webm';

      onProgress({
        status: 'completed',
        currentFrame: totalFrames,
        totalFrames,
        percentage: 100,
        elapsedMs: Math.round(performance.now() - startTime),
        estimatedRemainingMs: 0,
        currentFps: settings.fps,
        message: 'Realtime recording successfully completed!',
      });

      resolve({
        blob: finalBlob,
        url: URL.createObjectURL(finalBlob),
        filename: `${settings.filename}.${actualFormat}`,
        format: actualFormat,
        sizeBytes: finalBlob.size,
        durationSeconds: settings.durationSeconds,
        width: settings.width,
        height: settings.height,
        fps: settings.fps,
      });
    };

    recorder.onerror = (e) => {
      clearInterval(progressInterval);
      if (audioContext) audioContext.close();
      reject(new Error(`MediaRecorder error: ${(e as ErrorEvent).message || 'Recording failed'}`));
    };

    recorder.start(100);

    setTimeout(() => {
      if (recorder.state === 'recording') {
        recorder.stop();
      }
    }, totalDurationMs);
  });
}

