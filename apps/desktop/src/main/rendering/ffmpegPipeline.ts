import { spawn, execSync, ChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';
import {
  DesktopExportJobConfig,
  DesktopExportProgress,
  FFprobeValidationResult,
  DesktopSystemCapabilities,
} from '@html-motion-studio/shared';

export class FFmpegPipeline {
  private activeProcess: ChildProcess | null = null;
  private isCancelled = false;
  private ffmpegPath: string;
  private ffprobePath: string;

  constructor() {
    this.ffmpegPath = this.resolveBinary('ffmpeg');
    this.ffprobePath = this.resolveBinary('ffprobe');
  }

  public resolveBinary(binaryName: 'ffmpeg' | 'ffprobe'): string {
    const envVar = binaryName === 'ffmpeg' ? process.env.FFMPEG_PATH : process.env.FFPROBE_PATH;
    if (envVar && fs.existsSync(envVar)) {
      return envVar;
    }

    // Check system PATH
    try {
      const output = execSync(`which ${binaryName}`, { encoding: 'utf-8' }).trim();
      if (output && fs.existsSync(output)) {
        return output;
      }
    } catch {
      // Not in path
    }

    // Default common system paths
    const commonPaths = [
      `/opt/homebrew/bin/${binaryName}`,
      `/usr/local/bin/${binaryName}`,
      `/usr/bin/${binaryName}`,
      `C:\\Program Files\\ffmpeg\\bin\\${binaryName}.exe`,
    ];

    for (const p of commonPaths) {
      if (fs.existsSync(p)) return p;
    }

    return binaryName; // fallback to name
  }

  public getSystemCapabilities(): DesktopSystemCapabilities {
    let ffmpegAvailable = false;
    let ffmpegVersion = '';
    let ffprobeAvailable = false;
    let ffprobeVersion = '';

    try {
      const out = execSync(`"${this.ffmpegPath}" -version`, { encoding: 'utf-8' });
      ffmpegAvailable = true;
      const firstLine = out.split('\n')[0];
      ffmpegVersion = firstLine || 'FFmpeg available';
    } catch {
      ffmpegAvailable = false;
    }

    try {
      const out = execSync(`"${this.ffprobePath}" -version`, { encoding: 'utf-8' });
      ffprobeAvailable = true;
      const firstLine = out.split('\n')[0];
      ffprobeVersion = firstLine || 'FFprobe available';
    } catch {
      ffprobeAvailable = false;
    }

    return {
      os: process.platform as 'darwin' | 'win32' | 'linux',
      arch: process.arch,
      ffmpegAvailable,
      ffmpegPath: this.ffmpegPath,
      ffmpegVersion,
      ffprobeAvailable,
      ffprobePath: this.ffprobePath,
      ffprobeVersion,
      gpuAcceleration: process.platform === 'darwin' || process.platform === 'win32',
    };
  }

  /**
   * Encodes frames sequentially from a temporary directory into an MP4/WebM video.
   */
  public async encodeFrames(
    config: DesktopExportJobConfig,
    framesDir: string,
    onProgress: (progress: Partial<DesktopExportProgress>) => void
  ): Promise<string> {
    this.isCancelled = false;

    // Ensure output dir exists
    const outDir = path.dirname(config.outputFilePath);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    // Clean output file if it exists
    if (fs.existsSync(config.outputFilePath)) {
      try {
        fs.unlinkSync(config.outputFilePath);
      } catch {
        // ignore
      }
    }

    const { settings, audioSettings, audioFilePath } = config;
    const format = settings.format.toLowerCase();
    const isWebM = format === 'webm';
    const isProRes = format === 'mov';

    // Ensure dimensions are even integers for H.264
    const width = settings.width % 2 === 0 ? settings.width : settings.width + 1;
    const height = settings.height % 2 === 0 ? settings.height : settings.height + 1;

    const framePattern = path.join(framesDir, 'frame_%05d.png');

    const args: string[] = [
      '-y', // Overwrite output
      '-framerate', String(settings.fps),
      '-f', 'image2',
      '-i', framePattern,
    ];

    let hasAudio = false;
    if (audioFilePath && fs.existsSync(audioFilePath) && audioSettings.sourceMode !== 'none') {
      hasAudio = true;
      args.push('-i', audioFilePath);
    }

    // Video codec and filter options
    if (isWebM) {
      args.push('-c:v', 'libvpx-vp9', '-b:v', `${settings.videoBitrateMbps}M`, '-pix_fmt', 'yuva420p');
    } else if (isProRes) {
      args.push('-c:v', 'prores_ks', '-profile:v', '4', '-pix_fmt', 'yuva444p10le');
    } else {
      // H.264 MP4
      args.push('-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p');
    }

    // Scale / dimension guarantee
    args.push('-vf', `scale=${width}:${height}`);

    // Audio encoding and sync filters
    if (hasAudio) {
      const audioFilters: string[] = [];

      // Volume
      if (audioSettings.volume !== 1.0) {
        audioFilters.push(`volume=${audioSettings.volume}`);
      }

      // Delay offset
      if (audioSettings.startOffsetSeconds > 0) {
        const delayMs = Math.round(audioSettings.startOffsetSeconds * 1000);
        audioFilters.push(`adelay=${delayMs}|${delayMs}`);
      }

      // Fade in/out
      if (audioSettings.fadeInSeconds > 0) {
        audioFilters.push(`afade=t=in:ss=0:d=${audioSettings.fadeInSeconds}`);
      }
      if (audioSettings.fadeOutSeconds > 0) {
        const fadeOutStart = Math.max(0, settings.durationSeconds - audioSettings.fadeOutSeconds);
        audioFilters.push(`afade=t=out:st=${fadeOutStart}:d=${audioSettings.fadeOutSeconds}`);
      }

      if (audioFilters.length > 0) {
        args.push('-af', audioFilters.join(','));
      }

      if (isWebM) {
        args.push('-c:a', 'libopus', '-b:a', `${settings.audioBitrateKbps}k`);
      } else {
        args.push('-c:a', 'aac', '-b:a', `${settings.audioBitrateKbps}k`);
      }

      // Set target audio duration to match video duration
      args.push('-t', String(settings.durationSeconds));
    } else {
      args.push('-an');
      args.push('-t', String(settings.durationSeconds));
    }

    // Faststart for streaming web-friendly MP4
    if (!isWebM && !isProRes) {
      args.push('-movflags', '+faststart');
    }

    args.push(config.outputFilePath);

    return new Promise((resolve, reject) => {
      onProgress({
        status: 'encoding',
        message: 'FFmpeg encoding frames into final media container...',
      });

      const proc = spawn(this.ffmpegPath, args);
      this.activeProcess = proc;

      let stderrLog = '';

      proc.stderr.on('data', (chunk) => {
        const text = chunk.toString();
        stderrLog += text;

        // Parse FFmpeg progress output: frame= 123 fps= 30.0 ...
        const frameMatch = text.match(/frame=\s*(\d+)/);
        const fpsMatch = text.match(/fps=\s*([\d.]+)/);

        if (frameMatch) {
          const currentFrame = parseInt(frameMatch[1], 10);
          const totalFrames = Math.round(settings.durationSeconds * settings.fps);
          const percentage = Math.min(99, Math.round((currentFrame / totalFrames) * 100));

          onProgress({
            currentFrame,
            totalFrames,
            percentage,
            currentFps: fpsMatch ? parseFloat(fpsMatch[1]) : settings.fps,
            message: `Encoding frame ${currentFrame} of ${totalFrames}...`,
          });
        }
      });

      proc.on('close', (code) => {
        this.activeProcess = null;

        if (this.isCancelled) {
          return reject(new Error('Export was cancelled by user.'));
        }

        if (code === 0 && fs.existsSync(config.outputFilePath)) {
          resolve(config.outputFilePath);
        } else {
          reject(new Error(`FFmpeg exited with code ${code}. Error log: ${stderrLog.slice(-500)}`));
        }
      });

      proc.on('error', (err) => {
        this.activeProcess = null;
        reject(new Error(`Failed to spawn FFmpeg: ${err.message}`));
      });
    });
  }

  public cancel(): void {
    this.isCancelled = true;
    if (this.activeProcess) {
      try {
        this.activeProcess.kill('SIGTERM');
      } catch {
        // ignore
      }
      this.activeProcess = null;
    }
  }

  public verifyVideo(filePath: string): FFprobeValidationResult {
    if (!fs.existsSync(filePath)) {
      return {
        valid: false,
        formatName: '',
        durationSeconds: 0,
        sizeBytes: 0,
        bitrate: 0,
        video: null,
        audio: null,
        error: `File does not exist: ${filePath}`,
      };
    }

    try {
      const stats = fs.statSync(filePath);
      const cmd = `"${this.ffprobePath}" -v quiet -print_format json -show_format -show_streams "${filePath}"`;
      const output = execSync(cmd, { encoding: 'utf-8' });
      const metadata = JSON.parse(output);

      const format = metadata.format || {};
      const streams = metadata.streams || [];

      const videoStream = streams.find((s: { codec_type: string }) => s.codec_type === 'video');
      const audioStream = streams.find((s: { codec_type: string }) => s.codec_type === 'audio');

      let fps = 0;
      if (videoStream?.r_frame_rate) {
        const [num, den] = videoStream.r_frame_rate.split('/').map(Number);
        fps = den ? Math.round(num / den) : 0;
      }

      return {
        valid: true,
        formatName: format.format_name || '',
        durationSeconds: parseFloat(format.duration || '0'),
        sizeBytes: stats.size,
        bitrate: parseInt(format.bit_rate || '0', 10),
        video: videoStream
          ? {
              codec: videoStream.codec_name,
              width: videoStream.width,
              height: videoStream.height,
              fps,
              frameCount: videoStream.nb_frames ? parseInt(videoStream.nb_frames, 10) : undefined,
              pixelFormat: videoStream.pix_fmt,
            }
          : null,
        audio: audioStream
          ? {
              codec: audioStream.codec_name,
              sampleRate: parseInt(audioStream.sample_rate || '0', 10),
              channels: audioStream.channels || 0,
              durationSeconds: parseFloat(audioStream.duration || format.duration || '0'),
            }
          : null,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        valid: false,
        formatName: '',
        durationSeconds: 0,
        sizeBytes: 0,
        bitrate: 0,
        video: null,
        audio: null,
        error: `FFprobe inspection failed: ${message}`,
      };
    }
  }
}
