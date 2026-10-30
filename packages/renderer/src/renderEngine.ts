import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import { Muxer as WebmMuxer, ArrayBufferTarget as WebmArrayBufferTarget } from 'webm-muxer';
import { ExportSettings, ExportProgress, ExportResult, AudioSettings } from '@html-motion-studio/shared';
import { renderProcessedAudioBuffer } from './audioEngine';
import { rasterizeHtmlSnippetToCanvas } from './domRasterizer';

export interface RenderJobOptions {
  settings: ExportSettings;
  audioSettings: AudioSettings;
  rawAudioBuffer?: AudioBuffer | null;
  htmlContent?: string;
  captureCanvas: HTMLCanvasElement;
  onProgress: (progress: ExportProgress) => void;
  signal: AbortSignal;
}

export async function runExportJob(options: RenderJobOptions): Promise<ExportResult> {
  const { settings, audioSettings, rawAudioBuffer, captureCanvas, onProgress, signal } = options;

  const totalFrames = Math.max(1, Math.round(settings.durationSeconds * settings.fps));
  const startTime = performance.now();

  // Validate canvas dimensions
  captureCanvas.width = settings.width;
  captureCanvas.height = settings.height;

  // Decide strategy
  const isWebCodecsAvailable = typeof window !== 'undefined' && 'VideoEncoder' in window;
  const useWebCodecs =
    (settings.engineStrategy === 'auto' || settings.engineStrategy === 'webcodecs') &&
    isWebCodecsAvailable;

  if (useWebCodecs) {
    try {
      return await exportWithWebCodecs(options, totalFrames, startTime);
    } catch (err: unknown) {
      console.warn('[RenderEngine] WebCodecs pipeline failed or unhandled, falling back to MediaRecorder:', err);
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
 * Includes backpressure flow control, queue monitoring, and AudioEncoder integration.
 */
async function exportWithWebCodecs(
  options: RenderJobOptions,
  totalFrames: number,
  startTime: number
): Promise<ExportResult> {
  const { settings, audioSettings, rawAudioBuffer, htmlContent, captureCanvas, onProgress, signal } = options;

  onProgress({
    status: 'preparing',
    currentFrame: 0,
    totalFrames,
    percentage: 2,
    elapsedMs: 0,
    estimatedRemainingMs: 0,
    currentFps: 0,
    message: 'Initializing WebCodecs VideoEncoder & MP4 container...',
  });

  const isMp4 = settings.format === 'mp4';
  const target = isMp4 ? new ArrayBufferTarget() : new WebmArrayBufferTarget();

  // Prepare audio processing if audio is enabled
  let processedAudioBuffer: AudioBuffer | null = null;
  const hasAudio = (audioSettings.sourceMode === 'external' || audioSettings.sourceMode === 'both') && !!rawAudioBuffer;

  if (hasAudio && rawAudioBuffer) {
    try {
      processedAudioBuffer = await renderProcessedAudioBuffer(
        rawAudioBuffer,
        audioSettings,
        settings.durationSeconds
      );
    } catch (e) {
      console.warn('[WebCodecs] Audio rendering failed, proceeding without audio:', e);
    }
  }

  // Setup Muxer
  let muxer: Muxer<ArrayBufferTarget> | WebmMuxer<WebmArrayBufferTarget>;

  const audioConfig = processedAudioBuffer && typeof window !== 'undefined' && 'AudioEncoder' in window
    ? {
        codec: 'aac' as const,
        numberOfChannels: processedAudioBuffer.numberOfChannels,
        sampleRate: processedAudioBuffer.sampleRate,
      }
    : undefined;

  if (isMp4) {
    muxer = new Muxer({
      target: target as ArrayBufferTarget,
      video: {
        codec: 'avc',
        width: settings.width,
        height: settings.height,
      },
      audio: audioConfig,
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
      audio: audioConfig
        ? {
            codec: 'A_OPUS',
            numberOfChannels: audioConfig.numberOfChannels,
            sampleRate: audioConfig.sampleRate,
          }
        : undefined,
    });
  }

  // Setup VideoEncoder
  let encoderError: Error | null = null;
  const encoder = new VideoEncoder({
    output: (chunk, meta) => {
      try {
        muxer.addVideoChunk(chunk, meta);
      } catch (err) {
        console.error('[WebCodecs] Failed to add video chunk to muxer:', err);
      }
    },
    error: (e) => {
      console.error('[VideoEncoder] error callback:', e);
      encoderError = e;
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

  // Setup AudioEncoder if audio is active and AudioEncoder is available
  let audioElementCount = 0;
  let audioEncoder: AudioEncoder | null = null;

  if (audioConfig && processedAudioBuffer && 'AudioEncoder' in window) {
    try {
      audioEncoder = new AudioEncoder({
        output: (chunk, meta) => {
          try {
            muxer.addAudioChunk(chunk, meta);
          } catch (err) {
            console.warn('[WebCodecs] Failed to add audio chunk:', err);
          }
        },
        error: (e) => console.warn('[AudioEncoder] error:', e),
      });

      audioEncoder.configure({
        codec: isMp4 ? 'mp4a.40.2' : 'opus',
        numberOfChannels: processedAudioBuffer.numberOfChannels,
        sampleRate: processedAudioBuffer.sampleRate,
        bitrate: settings.audioBitrateKbps * 1000,
      });

      // Encode audio buffer
      const audioData = new AudioData({
        format: 'f32-planar',
        sampleRate: processedAudioBuffer.sampleRate,
        numberOfFrames: processedAudioBuffer.length,
        numberOfChannels: processedAudioBuffer.numberOfChannels,
        timestamp: 0,
        data: processedAudioBuffer.getChannelData(0),
      });

      audioEncoder.encode(audioData);
      audioData.close();
      await audioEncoder.flush();
      audioEncoder.close();
      audioElementCount++;
    } catch (e) {
      console.warn('[WebCodecs] AudioEncoder setup/flush failed:', e);
    }
  }

  onProgress({
    status: 'capturing',
    currentFrame: 0,
    totalFrames,
    percentage: 5,
    elapsedMs: 0,
    estimatedRemainingMs: 0,
    currentFps: 0,
    message: 'Capturing and encoding video frames with backpressure management...',
  });

  // Check if canvas already has content or if we should rasterize the HTML snippet
  if (htmlContent) {
    await rasterizeHtmlSnippetToCanvas(htmlContent, captureCanvas, {
      width: settings.width,
      height: settings.height,
    });
  }

  const frameDurationMicros = Math.round(1_000_000 / settings.fps);

  // Encode frames sequentially with backpressure flow control
  for (let f = 0; f < totalFrames; f++) {
    if (signal.aborted) {
      encoder.close();
      throw new Error('Export cancelled by user.');
    }

    if (encoderError) {
      encoder.close();
      throw new Error(`VideoEncoder fatal error: ${(encoderError as Error).message || encoderError}`);
    }

    // BACKPRESSURE FLOW CONTROL:
    // If encoder internal queue is buffering too many frames, wait before feeding more
    while (encoder.encodeQueueSize > 4) {
      await new Promise((r) => setTimeout(r, 10));
      if (signal.aborted) {
        encoder.close();
        throw new Error('Export cancelled by user.');
      }
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

    // Progress updates
    const elapsed = performance.now() - startTime;
    const currentFps = f > 0 ? f / (elapsed / 1000) : 0;
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

      await new Promise((r) => setTimeout(r, 0));
    }
  }

  onProgress({
    status: 'muxing',
    currentFrame: totalFrames,
    totalFrames,
    percentage: 95,
    elapsedMs: Math.round(performance.now() - startTime),
    estimatedRemainingMs: 300,
    currentFps: settings.fps,
    message: 'Flushing encoder and finalizing container multiplexer...',
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
 * Strategy B: MediaRecorder compatibility fallback (with honest MIME type reporting)
 */
async function exportWithMediaRecorder(
  options: RenderJobOptions,
  totalFrames: number,
  startTime: number
): Promise<ExportResult> {
  const { settings, audioSettings, rawAudioBuffer, htmlContent, captureCanvas, onProgress, signal } = options;

  onProgress({
    status: 'preparing',
    currentFrame: 0,
    totalFrames,
    percentage: 5,
    elapsedMs: 0,
    estimatedRemainingMs: 0,
    currentFps: 0,
    message: 'Initializing MediaRecorder realtime capture stream...',
  });

  // Ensure canvas has initial render
  if (htmlContent) {
    await rasterizeHtmlSnippetToCanvas(htmlContent, captureCanvas, {
      width: settings.width,
      height: settings.height,
    });
  }

  // 1. Get canvas stream
  const canvasStream = captureCanvas.captureStream(settings.fps);
  const mediaStreamTracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];

  // 2. Mix audio if requested and available
  let audioContext: AudioContext | null = null;
  const hasAudio = (audioSettings.sourceMode === 'external' || audioSettings.sourceMode === 'both') && !!rawAudioBuffer;

  if (hasAudio && rawAudioBuffer) {
    try {
      const processedBuffer = await renderProcessedAudioBuffer(
        rawAudioBuffer,
        audioSettings,
        settings.durationSeconds
      );

      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

  // 3. Select mimeType with strict honesty
  let mimeType = 'video/webm';
  let actualFormat: 'mp4' | 'webm' = 'webm';

  if (settings.format === 'mp4' && MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
    mimeType = 'video/mp4;codecs=avc1';
    actualFormat = 'mp4';
  } else if (settings.format === 'mp4' && MediaRecorder.isTypeSupported('video/mp4')) {
    mimeType = 'video/mp4';
    actualFormat = 'mp4';
  } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
    mimeType = 'video/webm;codecs=vp9';
    actualFormat = 'webm';
  } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
    mimeType = 'video/webm;codecs=vp8';
    actualFormat = 'webm';
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
        message: `Recording realtime stream (${(elapsed / 1000).toFixed(1)}s / ${settings.durationSeconds.toFixed(1)}s)...`,
      });
    }, 200);

    recorder.onstop = () => {
      clearInterval(progressInterval);
      if (audioContext) audioContext.close();

      const finalBlob = new Blob(chunks, { type: mimeType });

      onProgress({
        status: 'completed',
        currentFrame: totalFrames,
        totalFrames,
        percentage: 100,
        elapsedMs: Math.round(performance.now() - startTime),
        estimatedRemainingMs: 0,
        currentFps: settings.fps,
        message: 'Conversion completed successfully!',
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
