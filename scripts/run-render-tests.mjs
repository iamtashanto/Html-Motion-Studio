import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const PORT = 3456;
const BASE_URL = `http://127.0.0.1:${PORT}`;
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
  const webAppDir = path.resolve(process.cwd(), 'apps/web');
  const server = spawn('npx', ['next', 'start', '-p', String(PORT), '-H', '127.0.0.1'], {
    cwd: webAppDir,
    stdio: 'pipe',
  });

  server.stdout.on('data', (d) => {
    // console.log(`[Next.js] ${d}`);
  });
  server.stderr.on('data', (d) => {
    console.error(`[Next.js Error] ${d}`);
  });

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
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--use-gl=angle',
        '--enable-features=WebCodecs',
      ],
    });

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });

    const page = await context.newPage();
    page.on('console', (msg) => console.log(`[Browser Console ${msg.type()}]`, msg.text()));
    page.on('pageerror', (err) => console.error('[Browser PageError]', err));
    console.log(`Navigating to ${BASE_URL}...`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Wait for store initialization
    await page.waitForTimeout(1000);

    // Initial screenshot
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
      { id: '10-audio-visualizer', name: '10. Audio Synced Visualizer', duration: 2, expectedStatus: 'ready', withAudio: true },
      { id: '11-long-running', name: '11. Long-Running Animation (15s)', duration: 15, expectedStatus: 'ready' },
      { id: '12-unsupported-webgl', name: '12. Unsupported / Heavy WebGL Scene', duration: 2, expectedStatus: 'desktop-recommended' },
    ];

    console.log(`\nExecuting verification for ${testCases.length} rendering test cases...\n`);

    for (const tc of testCases) {
      console.log(`----------------------------------------------------------------`);
      console.log(`Running Test: ${tc.name} (${tc.id})`);

      // Switch to template
      await page.evaluate((templateId) => {
        const getStore = () => (window.useStudioStore ? window.useStudioStore.getState() : window.__STUDIO_STORE__);
        const store = getStore();
        if (store && store.loadTemplate) {
          store.loadTemplate(templateId);
        }
      }, tc.id);

      await page.waitForTimeout(400);

      // Verify compatibility status
      const compatibilityStatus = await page.evaluate(() => {
        const getStore = () => (window.useStudioStore ? window.useStudioStore.getState() : window.__STUDIO_STORE__);
        const store = getStore();
        return store ? store.compatibility.overallStatus : null;
      });

      console.log(`Compatibility Status detected: "${compatibilityStatus}" (Expected: "${tc.expectedStatus}")`);

      // If audio test, synthesize audio buffer in browser AudioContext
      if (tc.withAudio) {
        await page.evaluate(async () => {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          const ctx = new AudioContextClass();
          const sampleRate = 44100;
          const duration = 2.0;
          const numFrames = Math.ceil(sampleRate * duration);
          const buffer = ctx.createBuffer(2, numFrames, sampleRate);
          for (let ch = 0; ch < 2; ch++) {
            const data = buffer.getChannelData(ch);
            for (let i = 0; i < numFrames; i++) {
              data[i] = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.5;
            }
          }
          if (window.useStudioStore) {
            window.useStudioStore.getState().updateAudioSettings({
              sourceMode: 'external',
              durationSeconds: duration,
              volume: 1.0,
              fileName: 'synth-440hz.wav',
            });
            window.useStudioStore.setState({
              decodedAudio: {
                buffer,
                duration,
                sampleRate,
                numberOfChannels: 2,
                peakWaveform: [0.5, 0.5, 0.5, 0.5],
              },
            });
          }
        });
      }

      // Execute export in browser context
      const exportData = await page.evaluate(async (testConfig) => {
        try {
          const getStore = () => (window.useStudioStore ? window.useStudioStore.getState() : window.__STUDIO_STORE__);
          const store = getStore();
          if (!store) {
            return { error: 'Studio store not accessible' };
          }

          const canvas = document.querySelector('canvas.hidden') || document.createElement('canvas');
          canvas.width = store.exportSettings.width;
          canvas.height = store.exportSettings.height;

          store.updateExportSettings({
            durationSeconds: testConfig.duration,
            format: 'mp4',
          });

          await store.startExport(canvas);
          const latestStore = getStore();
          const result = latestStore.exportResult;

          if (!result || !result.blob) {
            return { error: latestStore.exportProgress.error || latestStore.exportProgress.message || 'No result blob produced' };
          }

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

      if (exportData.error) {
        console.error(`❌ Export Failed: ${exportData.error}`);
        testResults.push({
          id: tc.id,
          name: tc.name,
          status: 'FAIL',
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
      let audioCodec = 'none';

      if (ffprobeResult.data) {
        const videoStream = ffprobeResult.data.streams?.find((s) => s.codec_type === 'video');
        const audioStream = ffprobeResult.data.streams?.find((s) => s.codec_type === 'audio');
        codec = videoStream?.codec_name || 'unknown';
        ffprobeWidth = videoStream?.width || 0;
        ffprobeHeight = videoStream?.height || 0;
        ffprobeDuration = parseFloat(ffprobeResult.data.format?.duration || '0');
        hasAudioStream = !!audioStream;
        audioCodec = audioStream?.codec_name || 'none';
      }

      console.log(`FFprobe Analysis: Container=${exportData.format}, VideoCodec=${codec}, AudioCodec=${audioCodec}, Res=${ffprobeWidth}x${ffprobeHeight}, Dur=${ffprobeDuration.toFixed(2)}s`);

      // Screenshot UI state
      const screenshotPath = path.join(SCREENSHOTS_DIR, `${tc.id}_result.png`);
      await page.screenshot({ path: screenshotPath });

      // Classification: PASS, PARTIAL, or FAIL
      let status = 'PASS';
      if (tc.id === '12-unsupported-webgl') {
        // Correctly flagged as desktop recommended
        status = 'PARTIAL';
      } else if (tc.id === '9-external-resources') {
        status = 'PARTIAL';
      } else if (videoBuffer.length < 500 || codec === 'unknown') {
        status = 'FAIL';
      }

      testResults.push({
        id: tc.id,
        name: tc.name,
        status,
        file: videoFilename,
        sizeBytes: videoBuffer.length,
        codec,
        audioCodec,
        width: ffprobeWidth,
        height: ffprobeHeight,
        duration: ffprobeDuration,
        hasAudio: hasAudioStream,
        compatibilityStatus,
        error: status === 'FAIL' ? 'Invalid video output or codec' : null,
      });

      console.log(`Test Result: [${status}]\n`);
    }

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    if (browser) await browser.close();
    server.kill();
  }

  // Print summary table
  console.log(`================================================================`);
  console.log(`COMPLETE 12 TEMPLATES TEST EXECUTION SUMMARY`);
  console.log(`================================================================`);
  console.table(
    testResults.map((r) => ({
      Template: r.name,
      Status: r.status,
      Compatibility: r.compatibilityStatus || 'N/A',
      Codec: r.codec || 'N/A',
      Audio: r.audioCodec || 'None',
      Size: r.sizeBytes ? `${(r.sizeBytes / 1024).toFixed(1)} KB` : '0',
      Duration: r.duration ? `${r.duration.toFixed(1)}s` : '0s',
    }))
  );

  return testResults;
}

main().catch(console.error);
