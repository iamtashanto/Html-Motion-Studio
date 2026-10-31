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
      // 1. Create hidden offscreen BrowserWindow with unthrottled background rendering
      this.renderWindow = new BrowserWindow({
        width: settings.width,
        height: settings.height,
        show: false,
        useContentSize: true,
        backgroundColor: '#000000',
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: false,
          backgroundThrottling: false, // Critical: do not throttle animations/rendering when window is hidden
          webgl: true,
          autoplayPolicy: 'no-user-gesture-required',
        },
      });

      this.renderWindow.setContentSize(settings.width, settings.height);

      // 2. Load the project HTML content via temporary file to bypass Chromium URL length limits
      const tempEntryPath = path.join(jobFramesDir, 'render_entry.html');
      if (project.renderHtmlPath && fs.existsSync(project.renderHtmlPath)) {
        try {
          fs.copyFileSync(project.renderHtmlPath, tempEntryPath);
        } catch {
          fs.writeFileSync(tempEntryPath, fs.readFileSync(project.renderHtmlPath, 'utf-8'), 'utf-8');
        }
      } else {
        fs.writeFileSync(tempEntryPath, project.htmlContent || '<html><body></body></html>', 'utf-8');
      }

      // Fast, non-blocking page load (resolves on dom-ready or at most 5s safety ceiling)
      await new Promise<void>((resolve) => {
        let isDone = false;
        const done = () => {
          if (!isDone) {
            isDone = true;
            resolve();
          }
        };

        this.renderWindow?.webContents.once('dom-ready', () => {
          setTimeout(done, 300);
        });

        this.renderWindow?.webContents.once('did-finish-load', done);

        this.renderWindow?.webContents.once('did-fail-load', (e, code, desc) => {
          if (code !== -3) {
            console.warn(`Render frame load notice: ${desc} (${code})`);
            done();
          }
        });

        setTimeout(done, 5000);

        this.renderWindow?.loadFile(tempEntryPath).catch(() => {
          done();
        });
      });

      // Inject deterministic clock hook supporting Strategy A and Strategy B
      await this.renderWindow.webContents.executeJavaScript(`
        window.__HMS_VIRTUAL_TIME__ = 0;
        window.__HMS_SEEK__ = async function(timeSeconds) {
          window.__HMS_VIRTUAL_TIME__ = timeSeconds;
          
          // 1. Strategy A adapter (window.__HTML_MOTION_STUDIO__)
          if (window.__HTML_MOTION_STUDIO__ && typeof window.__HTML_MOTION_STUDIO__.seek === 'function') {
            try {
              await window.__HTML_MOTION_STUDIO__.seek(timeSeconds);
              if (typeof window.__HTML_MOTION_STUDIO__.renderFrame === 'function') {
                await window.__HTML_MOTION_STUDIO__.renderFrame(timeSeconds);
              }
              return;
            } catch (e) {}
          }

          // 2. Custom seek functions
          if (typeof window.renderAtTime === 'function') {
            try { window.renderAtTime(timeSeconds); } catch (e) {}
          }
          if (typeof window.seek === 'function') {
            try { window.seek(timeSeconds); } catch (e) {}
          }
          if (typeof window.seekTo === 'function') {
            try { window.seekTo(timeSeconds); } catch (e) {}
          }

          // 3. PostMessage broadcast
          try {
            window.postMessage({ type: 'HMS_SEEK', time: timeSeconds, isPlaying: false }, '*');
          } catch (e) {}

          // 4. CSS animations
          const animations = document.getAnimations ? document.getAnimations() : [];
          for (const anim of animations) {
            try {
              anim.currentTime = timeSeconds * 1000;
              anim.pause();
            } catch (e) {}
          }

          // 5. HTML5 video elements
          const videos = document.querySelectorAll('video');
          for (const vid of videos) {
            try {
              vid.currentTime = timeSeconds;
              vid.pause();
            } catch (e) {}
          }
        };
      `);

      // Prime frame at 0.0s
      try {
        await this.renderWindow.webContents.executeJavaScript(`window.__HMS_SEEK__(0)`);
      } catch {}

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

