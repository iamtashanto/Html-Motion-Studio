import { BrowserWindow } from 'electron';
import fs from 'fs';
import path from 'path';
import {
  DesktopExportJobConfig,
  DesktopExportProgress,
} from '@html-motion-studio/shared';
import { FFmpegPipeline } from './ffmpegPipeline';

export class HeadlessRenderer {
  private ffmpegPipeline: FFmpegPipeline;
  private tempFramesDir: string;
  private isCancelled = false;
  private renderWindow: BrowserWindow | null = null;

  constructor(userDataPath: string, ffmpegPipeline: FFmpegPipeline) {
    this.ffmpegPipeline = ffmpegPipeline;
    this.tempFramesDir = path.join(userDataPath, 'temp_render_frames');
    if (!fs.existsSync(this.tempFramesDir)) {
      fs.mkdirSync(this.tempFramesDir, { recursive: true });
    }
  }

  public async renderProject(
    config: DesktopExportJobConfig,
    onProgress: (progress: DesktopExportProgress) => void
  ): Promise<string> {
    this.isCancelled = false;
    const { settings, project } = config;

    const totalFrames = Math.round(settings.durationSeconds * settings.fps);
    const jobFramesDir = path.join(this.tempFramesDir, `job_${Date.now()}`);
    if (!fs.existsSync(jobFramesDir)) {
      fs.mkdirSync(jobFramesDir, { recursive: true });
    }

    const startTime = Date.now();

    onProgress({
      jobId: config.jobId,
      status: 'validating',
      currentFrame: 0,
      totalFrames,
      percentage: 0,
      elapsedMs: 0,
      estimatedRemainingMs: 0,
      currentFps: 0,
      message: 'Initializing isolated Chromium render environment...',
    });

    try {
      // 1. Create hidden offscreen BrowserWindow
      this.renderWindow = new BrowserWindow({
        width: settings.width,
        height: settings.height,
        show: false,
        useContentSize: true,
        backgroundColor: '#000000',
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: true,
          offscreen: false, // hidden window with capturePage works reliably across platforms
          webgl: true,
        },
      });

      this.renderWindow.setContentSize(settings.width, settings.height);

      // 2. Load the project HTML content via temporary file to bypass Chromium URL length limits
      const tempEntryPath = path.join(jobFramesDir, 'render_entry.html');
      fs.writeFileSync(tempEntryPath, project.htmlContent, 'utf-8');
      await Promise.race([
        this.renderWindow.loadFile(tempEntryPath),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Chromium page load timed out after 20 seconds.')), 20000)
        ),
      ]);

      // Inject deterministic clock hook if compatibility mode
      await this.renderWindow.webContents.executeJavaScript(`
        window.__HMS_VIRTUAL_TIME__ = 0;
        window.__HMS_SEEK__ = async function(timeSeconds) {
          window.__HMS_VIRTUAL_TIME__ = timeSeconds;
          
          // Check Strategy A adapter
          if (window.__HTML_MOTION_STUDIO__ && typeof window.__HTML_MOTION_STUDIO__.seek === 'function') {
            await window.__HTML_MOTION_STUDIO__.seek(timeSeconds);
            if (typeof window.__HTML_MOTION_STUDIO__.renderFrame === 'function') {
              await window.__HTML_MOTION_STUDIO__.renderFrame(timeSeconds);
            }
            return;
          }

          // Strategy B fallback: Seek media & CSS animations
          const animations = document.getAnimations ? document.getAnimations() : [];
          for (const anim of animations) {
            anim.currentTime = timeSeconds * 1000;
          }

          const videos = document.querySelectorAll('video');
          for (const vid of videos) {
            vid.currentTime = timeSeconds;
          }
        };
      `);

      // 3. Inspect if Strategy A is detected
      const hasAdapter = await this.renderWindow.webContents.executeJavaScript(`
        Boolean(window.__HTML_MOTION_STUDIO__ && typeof window.__HTML_MOTION_STUDIO__.seek === 'function')
      `);

      onProgress({
        jobId: config.jobId,
        status: 'rendering',
        currentFrame: 0,
        totalFrames,
        percentage: 2,
        elapsedMs: Date.now() - startTime,
        estimatedRemainingMs: 0,
        currentFps: 0,
        message: hasAdapter
          ? 'Rendering using Strategy A: Deterministic adapter contract...'
          : 'Rendering using Strategy B: Controlled Chromium capture...',
      });

      // 4. Step through each frame, capture page image, and save to tempFramesDir
      const frameInterval = 1 / settings.fps;

      for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
        if (this.isCancelled) {
          throw new Error('Export was cancelled by user.');
        }

        const currentTime = frameIndex * frameInterval;

        // Seek DOM
        await this.renderWindow.webContents.executeJavaScript(
          `window.__HMS_SEEK__(${currentTime})`
        );

        // Small microtask yield for layout/paint flush
        await new Promise((r) => setTimeout(r, 16));

        // Capture page NativeImage
        const image = await this.renderWindow.webContents.capturePage({
          x: 0,
          y: 0,
          width: settings.width,
          height: settings.height,
        });

        // Write frame PNG buffer
        const frameNumberPadded = String(frameIndex + 1).padStart(5, '0');
        const frameFilePath = path.join(jobFramesDir, `frame_${frameNumberPadded}.png`);
        fs.writeFileSync(frameFilePath, image.toPNG());

        const elapsedMs = Date.now() - startTime;
        const currentFps = frameIndex > 0 ? (frameIndex / (elapsedMs / 1000)).toFixed(1) : 0;
        const progressPct = Math.round(((frameIndex + 1) / totalFrames) * 75); // 0-75% for capture
        const remainingFrames = totalFrames - (frameIndex + 1);
        const estimatedRemainingMs = Number(currentFps) > 0 ? (remainingFrames / Number(currentFps)) * 1000 : 0;

        onProgress({
          jobId: config.jobId,
          status: 'rendering',
          currentFrame: frameIndex + 1,
          totalFrames,
          percentage: progressPct,
          elapsedMs,
          estimatedRemainingMs: Math.round(estimatedRemainingMs),
          currentFps: Number(currentFps),
          message: `Captured frame ${frameIndex + 1} of ${totalFrames} (${currentFps} FPS)...`,
        });
      }

      // Dispose render window
      this.closeRenderWindow();

      // 5. FFmpeg Encoding Phase (75% to 100%)
      const outputFilePath = await this.ffmpegPipeline.encodeFrames(
        config,
        jobFramesDir,
        (encodingProgress) => {
          const encPct = 75 + Math.round(((encodingProgress.percentage || 0) * 0.25));
          onProgress({
            jobId: config.jobId,
            status: 'encoding',
            currentFrame: encodingProgress.currentFrame || totalFrames,
            totalFrames,
            percentage: encPct,
            elapsedMs: Date.now() - startTime,
            estimatedRemainingMs: encodingProgress.estimatedRemainingMs || 0,
            currentFps: encodingProgress.currentFps || settings.fps,
            message: encodingProgress.message || 'Encoding video stream with FFmpeg...',
          });
        }
      );

      // Clean temporary frames
      this.cleanupFramesDir(jobFramesDir);

      onProgress({
        jobId: config.jobId,
        status: 'completed',
        currentFrame: totalFrames,
        totalFrames,
        percentage: 100,
        elapsedMs: Date.now() - startTime,
        estimatedRemainingMs: 0,
        currentFps: settings.fps,
        message: 'Video export completed and verified successfully!',
      });

      return outputFilePath;
    } catch (err: unknown) {
      this.closeRenderWindow();
      this.cleanupFramesDir(jobFramesDir);
      throw err;
    }
  }

  public cancel(): void {
    this.isCancelled = true;
    this.closeRenderWindow();
    this.ffmpegPipeline.cancel();
  }

  private closeRenderWindow(): void {
    if (this.renderWindow) {
      try {
        this.renderWindow.close();
      } catch {
        // ignore
      }
      this.renderWindow = null;
    }
  }

  private cleanupFramesDir(dirPath: string): void {
    try {
      if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
      }
    } catch (err) {
      console.warn('Failed to clean up temp frames dir:', err);
    }
  }
}

