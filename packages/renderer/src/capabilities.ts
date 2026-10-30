export interface BrowserCapabilities {
  webCodecsSupported: boolean;
  h264EncodingSupported: boolean;
  vp9EncodingSupported: boolean;
  mediaRecorderSupported: boolean;
  mediaRecorderMp4Supported: boolean;
  mediaRecorderWebmSupported: boolean;
  canvasCaptureStreamSupported: boolean;
  offscreenCanvasSupported: boolean;
  webAudioSupported: boolean;
  recommendedEngine: 'webcodecs' | 'mediarecorder';
  recommendedFormat: 'mp4' | 'webm';
}

export async function detectBrowserCapabilities(): Promise<BrowserCapabilities> {
  const isBrowser = typeof window !== 'undefined';
  if (!isBrowser) {
    return {
      webCodecsSupported: false,
      h264EncodingSupported: false,
      vp9EncodingSupported: false,
      mediaRecorderSupported: false,
      mediaRecorderMp4Supported: false,
      mediaRecorderWebmSupported: false,
      canvasCaptureStreamSupported: false,
      offscreenCanvasSupported: false,
      webAudioSupported: false,
      recommendedEngine: 'mediarecorder',
      recommendedFormat: 'webm',
    };
  }

  // 1. WebCodecs check
  const webCodecsSupported = 'VideoEncoder' in window;
  let h264EncodingSupported = false;
  let vp9EncodingSupported = false;

  if (webCodecsSupported) {
    try {
      const h264Check = await VideoEncoder.isConfigSupported({
        codec: 'avc1.42001f', // Baseline H.264 profile
        width: 1280,
        height: 720,
        bitrate: 2_500_000,
        framerate: 30,
      });
      h264EncodingSupported = !!h264Check.supported;
    } catch {
      h264EncodingSupported = false;
    }

    try {
      const vp9Check = await VideoEncoder.isConfigSupported({
        codec: 'vp09.00.10.08',
        width: 1280,
        height: 720,
        bitrate: 2_500_000,
        framerate: 30,
      });
      vp9EncodingSupported = !!vp9Check.supported;
    } catch {
      vp9EncodingSupported = false;
    }
  }

  // 2. MediaRecorder check
  const mediaRecorderSupported = 'MediaRecorder' in window;
  let mediaRecorderMp4Supported = false;
  let mediaRecorderWebmSupported = false;

  if (mediaRecorderSupported && typeof MediaRecorder.isTypeSupported === 'function') {
    mediaRecorderMp4Supported = MediaRecorder.isTypeSupported('video/mp4;codecs=avc1') ||
      MediaRecorder.isTypeSupported('video/mp4');
    mediaRecorderWebmSupported = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ||
      MediaRecorder.isTypeSupported('video/webm;codecs=vp8') ||
      MediaRecorder.isTypeSupported('video/webm');
  }

  // 3. Canvas stream capture check
  const canvas = document.createElement('canvas');
  const canvasCaptureStreamSupported = typeof (canvas as unknown as { captureStream?: () => MediaStream }).captureStream === 'function';

  // 4. Offscreen canvas
  const offscreenCanvasSupported = 'OffscreenCanvas' in window;

  // 5. Web Audio
  const webAudioSupported = 'AudioContext' in window || 'webkitAudioContext' in window;

  // Decision logic
  let recommendedEngine: 'webcodecs' | 'mediarecorder' = 'mediarecorder';
  let recommendedFormat: 'mp4' | 'webm' = 'webm';

  if (webCodecsSupported && (h264EncodingSupported || vp9EncodingSupported)) {
    recommendedEngine = 'webcodecs';
    recommendedFormat = h264EncodingSupported ? 'mp4' : 'webm';
  } else if (mediaRecorderSupported) {
    recommendedEngine = 'mediarecorder';
    recommendedFormat = mediaRecorderMp4Supported ? 'mp4' : 'webm';
  }

  return {
    webCodecsSupported,
    h264EncodingSupported,
    vp9EncodingSupported,
    mediaRecorderSupported,
    mediaRecorderMp4Supported,
    mediaRecorderWebmSupported,
    canvasCaptureStreamSupported,
    offscreenCanvasSupported,
    webAudioSupported,
    recommendedEngine,
    recommendedFormat,
  };
}

