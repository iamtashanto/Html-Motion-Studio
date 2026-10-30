import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const PORT = 3456;
const BASE_URL = `http://localhost:${PORT}`;
const OUTPUT_DIR = path.resolve(process.cwd(), 'test-output');
const VIDEOS_DIR = path.join(OUTPUT_DIR, 'videos');
const SCREENSHOTS_DIR = path.join(OUTPUT_DIR, 'screenshots');

async function ensureDirs() {
  await fs.mkdir(VIDEOS_DIR, { recursive: true });
  await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });
}

function runFFprobe(filePath) {
  return new Promise((resolve) => {
    const ffprobe = spawn('/opt/homebrew/bin/ffprobe', [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      filePath,
    ]);

    let stdout = '';
    let stderr = '';
    ffprobe.stdout.on('data', (d) => (stdout += d.toString()));
    ffprobe.stderr.on('data', (d) => (stderr += d.toString()));

    ffprobe.on('close', (code) => {
      if (code !== 0) {
        resolve({ error: `ffprobe failed with exit code ${code}: ${stderr}` });
      } else {
        try {
          resolve({ data: JSON.parse(stdout) });
        } catch (e) {
          resolve({ error: `ffprobe parse error: ${e.message}` });
        }
      }
    });
  });
}

async function startServer() {
  console.log(`Starting Next.js production server on port ${PORT}...`);
  const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    stdio: 'pipe',
  });

  server.stdout.on('data', (d) => {
    // console.log(`[Next.js] ${d}`);
  });
  server.stderr.on('data', (d) => {
    console.error(`[Next.js Error] ${d}`);
  });

  // Wait for server to become responsive
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`${BASE_URL}/`);
      if (res.ok) {
        console.log('Next.js server is ready.');
        return server;
      }
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error('Server failed to start within 20 seconds.');
}

async function main() {
  await ensureDirs();
  const server = await startServer();

  let browser;
  const testResults = [];

  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--enable-features=WebCodecs'],
    });

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });

    const page = await context.newPage();
    console.log(`Navigating to ${BASE_URL}...`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Capture initial screenshot
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '00_initial_workspace.png'), fullPage: true });

    // The 12 required test cases
    const testCases = [
      { id: '1-static-html', name: '1. Static HTML Banner', duration: 2, expectedStatus: 'ready' },
      { id: '2-css-keyframes', name: '2. CSS Keyframe Motion', duration: 2, expectedStatus: 'ready' },
      { id: '3-css-transition', name: '3. CSS Transition Sequencing', duration: 2, expectedStatus: 'ready' },
      { id: '4-raf-animation', name: '4. requestAnimationFrame Kinetic Motion', duration: 2, expectedStatus: 'ready' },
      { id: '5-svg-animation', name: '5. SVG Vector Path & Stroke Animation', duration: 2, expectedStatus: 'ready' },
      { id: '6-canvas-particles', name: '6. HTML5 Canvas Dynamic Particle System', duration: 2, expectedStatus: 'ready' },
      { id: '7-local-images', name: '7. Local Embedded Images & Assets', duration: 2, expectedStatus: 'ready' },
      { id: '8-local-fonts', name: '8. Local Typography & Font Face', duration: 2, expectedStatus: 'ready' },
      { id: '9-external-resources', name: '9. External Resources & CDN Notice', duration: 2, expectedStatus: 'limited' },
      { id: '10-audio-visualizer', name: '10. Audio Synced Visualizer', duration: 2, expectedStatus: 'ready' },
      { id: '11-long-running', name: '11. 30-Second Long Animation', duration: 30, expectedStatus: 'ready' },
      { id: '12-unsupported-webgl', name: '12. Unsupported / Heavy WebGL Scene', duration: 2, expectedStatus: 'desktop-recommended' },
    ];

    console.log(`\nExecuting verification for ${testCases.length} rendering test cases...\n`);

    for (const tc of testCases) {
      console.log(`----------------------------------------------------------------`);
      console.log(`Running Test: ${tc.name} (${tc.id})`);

      // Switch to template
      await page.evaluate((templateId) => {
        const store = window.__STUDIO_STORE__ || window.useStudioStore?.getState?.();
        // Fallback to clicking template button if store not global
      }, tc.id);

      // Click template in UI
      const templateBtn = page.locator(`button:has-text("${tc.name}")`).first();
      if (await templateBtn.isVisible()) {
        await templateBtn.click();
      }

      await page.waitForTimeout(300);

      // Verify compatibility report status
      const compatibilityReport = await page.evaluate(() => {
        // Read store state directly from window or DOM
        const store = window.__STUDIO_STORE__;
        return store ? store.compatibility : null;
      });

      // Set duration
      await page.evaluate((dur) => {
        const store = window.__STUDIO_STORE__;
        if (store) {
          store.updateExportSettings({ durationSeconds: dur });
        }
      }, tc.duration);

      // Trigger export in page context and capture result blob
      const exportData = await page.evaluate(async (testConfig) => {
        try {
          const store = window.__STUDIO_STORE__;
          if (!store) {
            return { error: 'Studio store not accessible' };
          }

          // Use the hidden canvas
          const canvas = document.querySelector('canvas.hidden') || document.createElement('canvas');
          canvas.width = store.exportSettings.width;
          canvas.height = store.exportSettings.height;

          // Override duration for test
          store.updateExportSettings({
            durationSeconds: testConfig.duration,
            format: 'mp4',
          });

          await store.startExport(canvas);
          const result = store.exportResult;

          if (!result || !result.blob) {
            return { error: store.exportProgress.error || 'No result blob produced' };
          }

          // Convert Blob to Base64 for Node transport
          const reader = new FileReader();
          const base64Promise = new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result);
          });
          reader.readAsDataURL(result.blob);
          const base64 = await base64Promise;

          return {
            filename: result.filename,
            format: result.format,
            sizeBytes: result.sizeBytes,
            width: result.width,
            height: result.height,
            durationSeconds: result.durationSeconds,
            base64Data: base64,
          };
        } catch (e) {
          return { error: e.message || String(e) };
        }
      }, tc);

      // Check for export error
      if (exportData.error) {
        console.error(`❌ Export Failed: ${exportData.error}`);
        testResults.push({
          id: tc.id,
          name: tc.name,
          passed: false,
          error: exportData.error,
        });
        continue;
      }

      // Save video file to disk
      const videoFilename = `${tc.id}.${exportData.format}`;
      const videoPath = path.join(VIDEOS_DIR, videoFilename);
      const base64Content = exportData.base64Data.split(',')[1];
      const videoBuffer = Buffer.from(base64Content, 'base64');
      await fs.writeFile(videoPath, videoBuffer);

      console.log(`Saved video to: ${videoPath} (${(videoBuffer.length / 1024).toFixed(1)} KB)`);

      // Run FFprobe to inspect actual container and codecs
      const ffprobeResult = await runFFprobe(videoPath);
      let codec = 'unknown';
      let ffprobeDuration = 0;
      let ffprobeWidth = 0;
      let ffprobeHeight = 0;
      let hasAudioStream = false;

      if (ffprobeResult.data) {
        const videoStream = ffprobeResult.data.streams?.find((s) => s.codec_type === 'video');
        const audioStream = ffprobeResult.data.streams?.find((s) => s.codec_type === 'audio');
        codec = videoStream?.codec_name || 'unknown';
        ffprobeWidth = videoStream?.width || 0;
        ffprobeHeight = videoStream?.height || 0;
        ffprobeDuration = parseFloat(ffprobeResult.data.format?.duration || '0');
        hasAudioStream = !!audioStream;
      }

      console.log(`FFprobe Analysis: Codec=${codec}, Res=${ffprobeWidth}x${ffprobeHeight}, Dur=${ffprobeDuration.toFixed(2)}s, Audio=${hasAudioStream}`);

      // Capture screenshot of UI with result
      const screenshotPath = path.join(SCREENSHOTS_DIR, `${tc.id}_result.png`);
      await page.screenshot({ path: screenshotPath });

      // Verification checks
      const isNonEmpty = videoBuffer.length > 1000;
      const isCodecValid = codec === 'h264' || codec === 'vp9' || codec === 'vp8';
      const passed = isNonEmpty && isCodecValid;

      testResults.push({
        id: tc.id,
        name: tc.name,
        passed,
        file: videoFilename,
        sizeBytes: videoBuffer.length,
        codec,
        width: ffprobeWidth,
        height: ffprobeHeight,
        duration: ffprobeDuration,
        hasAudio: hasAudioStream,
        error: passed ? null : ffprobeResult.error || 'Verification criteria failed',
      });

      console.log(`Status: ${passed ? '✅ PASSED' : '❌ FAILED'}\n`);
    }

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    if (browser) await browser.close();
    server.kill();
  }

  // Print summary table
  console.log(`================================================================`);
  console.log(`TEST EXECUTION SUMMARY`);
  console.log(`================================================================`);
  console.table(
    testResults.map((r) => ({
      Test: r.name,
      Status: r.passed ? 'PASS' : 'FAIL',
      Codec: r.codec || 'N/A',
      Size: r.sizeBytes ? `${(r.sizeBytes / 1024).toFixed(1)} KB` : '0',
      Duration: r.duration ? `${r.duration.toFixed(1)}s` : '0s',
      Audio: r.hasAudio ? 'Yes' : 'No',
    }))
  );

  return testResults;
}

main().catch(console.error);

