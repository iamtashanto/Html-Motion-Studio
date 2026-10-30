import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { chromium } from '@playwright/test';
import { FFmpegPipeline } from '../apps/desktop/dist/apps/desktop/src/main/rendering/ffmpegPipeline.js';

const OUTPUT_DIR = path.resolve('test-output/desktop');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const pipeline = new FFmpegPipeline();
const ffmpegBin = pipeline.resolveBinary('ffmpeg');

// 8 Real-World Test Projects
const TEST_CASES = [
  {
    id: '1-static-html',
    name: 'Static HTML Layout',
    duration: 2.0,
    fps: 60,
    hasAudio: false,
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #090d16 0%, #1e1b4b 100%);
      color: #f8fafc; font-family: system-ui, -apple-system, sans-serif;
    }
    .card {
      padding: 40px 60px; background: rgba(30, 41, 59, 0.7); border: 2px solid rgba(99, 102, 241, 0.4);
      border-radius: 28px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    }
    h1 { font-size: 48px; margin: 0 0 12px 0; font-weight: 800; }
    p { font-size: 20px; color: #94a3b8; margin: 0; }
  </style>
</head>
<body>
  <div class="card">
    <h1>HTML Motion Studio Desktop</h1>
    <p>Frame-Accurate Local 60fps Video Export</p>
  </div>
</body>
</html>`,
  },
  {
    id: '2-css-keyframes',
    name: 'CSS Keyframe Animation',
    duration: 2.0,
    fps: 60,
    hasAudio: false,
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0; height: 100vh; display: flex; align-items: center; justify-content: center;
      background: #090d16; overflow: hidden;
    }
    .spinner {
      width: 180px; height: 180px;
      border-radius: 40px;
      background: linear-gradient(135deg, #38bdf8, #6366f1);
      box-shadow: 0 0 60px rgba(56, 189, 248, 0.4);
      animation: spin 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg) scale(0.9); border-radius: 30px; }
      50% { transform: rotate(180deg) scale(1.15); border-radius: 60px; }
      100% { transform: rotate(360deg) scale(0.9); border-radius: 30px; }
    }
  </style>
</head>
<body>
  <div class="spinner"></div>
</body>
</html>`,
  },
  {
    id: '3-js-kinetic',
    name: 'JavaScript Kinetic rAF Motion',
    duration: 2.0,
    fps: 60,
    hasAudio: false,
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; height: 100vh; background: #020617; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .bar { width: 14px; height: 100px; margin: 0 6px; background: #38bdf8; border-radius: 9999px; }
    .container { display: flex; align-items: center; }
  </style>
</head>
<body>
  <div class="container" id="c"></div>
  <script>
    const c = document.getElementById('c');
    const bars = [];
    for (let i = 0; i < 24; i++) {
      const b = document.createElement('div');
      b.className = 'bar';
      c.appendChild(b);
      bars.push(b);
    }
    window.__HMS_SEEK__ = function(t) {
      bars.forEach((b, i) => {
        const h = 40 + 120 * Math.sin(t * 4 + i * 0.3) ** 2;
        b.style.height = h + 'px';
        b.style.background = 'hsl(' + (200 + i * 5) + ', 90%, 60%)';
      });
    };
  </script>
</body>
</html>`,
  },
  {
    id: '4-svg-vector',
    name: 'SVG Vector Path Morphing',
    duration: 2.0,
    fps: 60,
    hasAudio: false,
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; height: 100vh; background: #090d16; display: flex; align-items: center; justify-content: center; }
    svg { width: 400px; height: 400px; }
    path {
      stroke: #6366f1; stroke-width: 8; fill: none;
      stroke-dasharray: 600; stroke-dashoffset: 600;
      animation: dash 2s ease-in-out infinite alternate;
    }
    @keyframes dash {
      from { stroke-dashoffset: 600; }
      to { stroke-dashoffset: 0; }
    }
  </style>
</head>
<body>
  <svg viewBox="0 0 200 200">
    <path d="M 100 20 L 180 180 L 20 180 Z" />
  </svg>
</body>
</html>`,
  },
  {
    id: '5-canvas-particles',
    name: 'HTML5 2D Canvas Particles',
    duration: 2.0,
    fps: 60,
    hasAudio: false,
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; background: #000; overflow: hidden; }
    canvas { width: 100vw; height: 100vh; display: block; }
  </style>
</head>
<body>
  <canvas id="cv" width="1920" height="1080"></canvas>
  <script>
    const cv = document.getElementById('cv');
    const ctx = cv.getContext('2d');
    const particles = [];
    for (let i = 0; i < 150; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        speed: 100 + Math.random() * 250,
        radius: 3 + Math.random() * 6,
        hue: 180 + Math.random() * 60,
      });
    }
    window.__HMS_SEEK__ = function(t) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, 1920, 1080);
      particles.forEach((p) => {
        const dist = p.speed * t;
        const x = 960 + Math.cos(p.angle) * dist;
        const y = 540 + Math.sin(p.angle) * dist;
        ctx.fillStyle = 'hsl(' + p.hue + ', 100%, 65%)';
        ctx.beginPath();
        ctx.arc(x, y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });
    };
  </script>
</body>
</html>`,
  },
  {
    id: '6-images-fonts',
    name: 'Embedded Images & Typography',
    duration: 2.0,
    fps: 60,
    hasAudio: false,
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
    @font-face {
      font-family: 'InterCustom';
      src: local('Helvetica Neue'), local('Arial');
      font-weight: 700;
    }
    body {
      margin: 0; height: 100vh; background: #0f172a; display: flex; align-items: center; justify-content: center;
      font-family: 'InterCustom', sans-serif; color: white;
    }
    .box {
      display: flex; align-items: center; gap: 24px; padding: 32px 48px;
      background: rgba(255, 255, 255, 0.05); border-radius: 24px; border: 1px solid rgba(255,255,255,0.1);
    }
    img { width: 96px; height: 96px; border-radius: 20px; }
    h2 { font-size: 36px; margin: 0; }
  </style>
</head>
<body>
  <div class="box">
    <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='96' height='96' rx='20' fill='%236366f1'/><circle cx='48' cy='48' r='24' fill='white'/></svg>">
    <div>
      <h2>Brand Motion Asset</h2>
      <p style="color:#94a3b8;margin:4px 0 0 0;font-size:18px;">Custom Asset Bundling Validated</p>
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: '7-audio-soundtrack',
    name: 'Canvas Visualizer with AAC Audio',
    duration: 2.0,
    fps: 60,
    hasAudio: true,
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; background: #030712; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    canvas { width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <canvas id="c" width="1920" height="1080"></canvas>
  <script>
    const cv = document.getElementById('c');
    const ctx = cv.getContext('2d');
    window.__HMS_SEEK__ = function(t) {
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, 1920, 1080);
      const bars = 48;
      const barWidth = 1920 / bars - 6;
      for (let i = 0; i < bars; i++) {
        const freq = Math.sin(t * 10 + i * 0.4) * 0.5 + 0.5;
        const height = 100 + freq * 400;
        const x = i * (barWidth + 6) + 3;
        const y = 1080 - height;
        ctx.fillStyle = 'hsl(' + (260 + freq * 80) + ', 90%, 60%)';
        ctx.fillRect(x, y, barWidth, height);
      }
    };
  </script>
</body>
</html>`,
  },
  {
    id: '8-long-duration',
    name: 'Long-Duration 10-Second Animation',
    duration: 10.0,
    fps: 60,
    hasAudio: false,
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; height: 100vh; background: radial-gradient(circle at center, #1e1b4b 0%, #020617 100%); display: flex; align-items: center; justify-content: center; }
    .orb { width: 160px; height: 160px; border-radius: 50%; background: linear-gradient(135deg, #06b6d4, #8b5cf6); }
    h1 { position: absolute; bottom: 80px; color: #94a3b8; font-family: sans-serif; font-size: 28px; }
  </style>
</head>
<body>
  <div class="orb" id="orb"></div>
  <h1 id="txt">Time: 0.0s</h1>
  <script>
    const orb = document.getElementById('orb');
    const txt = document.getElementById('txt');
    window.__HMS_SEEK__ = function(t) {
      const angle = (t / 10.0) * Math.PI * 4;
      const x = Math.cos(angle) * 200;
      const y = Math.sin(angle) * 100;
      orb.style.transform = 'translate(' + x + 'px, ' + y + 'px) scale(' + (1 + 0.3 * Math.sin(t * 3)) + ')';
      txt.innerText = 'Render Timestamp: ' + t.toFixed(2) + 's / 10.0s';
    };
  </script>
</body>
</html>`,
  },
];

async function main() {
  console.log('================================================================');
  console.log('HTML Motion Studio Desktop — Real-World Video Export Validation');
  console.log('================================================================');
  console.log(`Host Platform: ${process.platform} (${process.arch})`);
  console.log(`FFmpeg Binary: ${ffmpegBin}`);

  const browser = await chromium.launch();
  const results = [];

  for (const testCase of TEST_CASES) {
    console.log(`\n▶ Testing [${testCase.id}]: ${testCase.name}...`);
    const tempWorkDir = fs.mkdtempSync(path.join(os.tmpdir(), `hms-exp-${testCase.id}-`));
    const framesDir = path.join(tempWorkDir, 'frames');
    fs.mkdirSync(framesDir, { recursive: true });

    const totalFrames = Math.round(testCase.duration * testCase.fps);
    const outputVideoPath = path.join(OUTPUT_DIR, `${testCase.id}.mp4`);

    let audioPath = undefined;
    if (testCase.hasAudio) {
      audioPath = path.join(tempWorkDir, 'audio.mp3');
      execSync(`"${ffmpegBin}" -y -f lavfi -i sine=frequency=440:duration=${testCase.duration} -c:a libmp3lame "${audioPath}"`, {
        stdio: 'ignore',
      });
    }

    // 1. Capture frames via Chromium
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    await page.setContent(testCase.html);

    const startTime = Date.now();
    for (let f = 0; f < totalFrames; f++) {
      const t = f / testCase.fps;
      await page.evaluate((time) => {
        if (typeof window.__HMS_SEEK__ === 'function') {
          window.__HMS_SEEK__(time);
        }
      }, t);

      const framePadded = String(f + 1).padStart(5, '0');
      const framePath = path.join(framesDir, `frame_${framePadded}.png`);
      await page.screenshot({ path: framePath, omitBackground: false });
    }
    await page.close();

    const captureDurationSec = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`  ✓ Captured ${totalFrames} frames in ${captureDurationSec}s (${(totalFrames / captureDurationSec).toFixed(1)} FPS)`);

    // 2. Encode via FFmpegPipeline
    const encStartTime = Date.now();
    await pipeline.encodeFrames(
      {
        jobId: testCase.id,
        project: { id: testCase.id, title: testCase.name, mode: 'code', htmlContent: testCase.html, entryHtmlPath: 'index.html', availableHtmlFiles: ['index.html'], assets: {}, missingAssets: [] },
        settings: {
          aspectRatio: '16:9',
          width: 1920,
          height: 1080,
          resolution: '1080p',
          fps: testCase.fps,
          format: 'mp4',
          quality: 'high',
          videoBitrateMbps: 8,
          audioBitrateKbps: 192,
          durationPolicy: 'project',
          durationSeconds: testCase.duration,
          loopAnimationIfShorter: true,
          filename: testCase.id,
          engineStrategy: 'auto',
        },
        audioSettings: {
          sourceMode: testCase.hasAudio ? 'external' : 'none',
          durationSeconds: testCase.duration,
          volume: 1.0,
          startOffsetSeconds: 0,
          trimInSeconds: 0,
          trimOutSeconds: testCase.duration,
          fadeInSeconds: 0.2,
          fadeOutSeconds: 0.2,
        },
        audioFilePath: audioPath,
        outputFilePath: outputVideoPath,
        strategy: 'compatibility',
      },
      framesDir,
      () => {}
    );

    const encDurationSec = ((Date.now() - encStartTime) / 1000).toFixed(1);
    console.log(`  ✓ FFmpeg encoded in ${encDurationSec}s`);

    // 3. Inspect with FFprobe
    const probe = pipeline.verifyVideo(outputVideoPath);

    const status =
      probe.valid &&
      probe.video?.codec === 'h264' &&
      probe.video?.width === 1920 &&
      probe.video?.height === 1080 &&
      Math.abs(probe.durationSeconds - testCase.duration) <= 0.1
        ? 'PASS'
        : 'FAIL';

    const fileSizeFormatted = (probe.sizeBytes / 1024).toFixed(1) + ' KB';

    console.log(`  ➔ Status: ${status} | Codec: ${probe.video?.codec} | Res: ${probe.video?.width}x${probe.video?.height} | Duration: ${probe.durationSeconds}s | Size: ${fileSizeFormatted}`);

    results.push({
      id: testCase.id,
      name: testCase.name,
      status,
      duration: probe.durationSeconds,
      fps: probe.video?.fps,
      codec: probe.video?.codec,
      audioCodec: probe.audio?.codec || 'None',
      size: fileSizeFormatted,
      path: outputVideoPath,
    });

    // Clean up temporary workspace
    fs.rmSync(tempWorkDir, { recursive: true, force: true });
  }

  await browser.close();

  console.log('\n================================================================');
  console.log('REAL EXPORT VALIDATION SUMMARY TABLE');
  console.log('================================================================');
  console.table(results);

  // Write markdown report
  const mdReportPath = path.resolve('docs/REAL_EXPORT_VALIDATION.md');
  let md = '# HTML Motion Studio Desktop — Real-World Video Export Validation Report\n\n';
  md += `**Date:** ${new Date().toISOString()}\n`;
  md += `**Host:** ${process.platform} (${process.arch})\n`;
  md += `**FFmpeg:** ${ffmpegBin}\n\n`;
  md += '| Test Case | Type | Resolution | FPS | Target Dur | Probed Dur | Video Codec | Audio Codec | Size | Status |\n';
  md += '| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n';
  for (const r of results) {
    md += `| **${r.name}** | \`${r.id}\` | 1920×1080 | ${r.fps} fps | ${r.duration}s | ${r.duration}s | \`${r.codec}\` | \`${r.audioCodec}\` | ${r.size} | **${r.status}** |\n`;
  }
  fs.writeFileSync(mdReportPath, md, 'utf-8');
  console.log(`\nDetailed report written to: ${mdReportPath}`);
}

main().catch((err) => {
  console.error('Fatal error during desktop export testing:', err);
  process.exit(1);
});

