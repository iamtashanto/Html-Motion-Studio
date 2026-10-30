import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';
import { FFmpegPipeline } from '../apps/desktop/dist/apps/desktop/src/main/rendering/ffmpegPipeline.js';

const MINIMAL_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAoAAAAFoCAIAAABIUN0GAAAACXBIWXMAAAABAAAAAQBPJcTWAAAFkUlEQVR4nO3VQQ0AIBDAsCPBv2VwwR60CvbbmjkDALy16wAA+JEBA0DAgAEgYMAAEDBgAAgYMAAEDBgAAgYMAAEDBoCAAQNAwIABIGDAABAwYAAIGDAABAwYAAIGDAABAwaAgAEDQMCAASBgwAAQMGAACBgwAAQMGAACBgwAAQMGgIABA0DAgAEgYMAAEDBgAAgYMAAEDBgAAgYMAAEDBoCAAQNAwIABIGDAABAwYAAIGDAABAwYAAIGDAABAwaAgAEDQMCAASBgwAAQMGAACBgwAAQMGAACBgwAAQMGgIABA0DAgAEgYMAAEDBgAAgYMAAEDBgAAgYMAAEDBoCAAQNAwIABIGDAABAwYAAIGDAABAwYAAIGDAABAwaAgAEDQMCAASBgwAAQMGAACBgwAAQMGAACBgwAAQMGgIABA0DAgAEgYMAAEDBgAAgYMAAEDBgAAgYMAAEDBoCAAQNAwIABIGDAABAwYAAIGDAABAwYAAIGDAABAwaAgAEDQMCAASBgwAAQMGAACBgwAAQMGAACBgwAAQMGgIABA0DAgAEgYMAAEDBgAAgYMAAEDBgAAgYMAAEDBoCAAQNAwIABIGDAABAwYAAIGDAABAwYAAIGDAABAwaAgAEDQMCAASBgwAAQMGAACBgwAAQMGAACBgwAAQMGgIABA0DAgAEgYMAAEDBgAAgYMAAEDBgAAgYMAAEDBoCAAQNAwIABIGDAABAwYAAIGDAABAwYAAIGDAABAwaAgAEDQMCAASBgwAAQMGAACBgwAAQMGAACBgwAAQMGgIABA0DAgAEgYMAAEDBgAAgYMAAEDBgAAgYMAAEDBoCAAQNAwIABIGDAABAwYAAIGDAABAwYAAIGDAABAwaAgAEDQMCAASBgwAAQMGAACBgwAAQMGAACBgwAAQMGgIABA0DAgAEgYMAAEDBgAAgYMAAEDBgAAgYMAAEDBoCAAQNAwIABIGDAABAwYAAIGDAABAwYAAIGDAABAwaAgAEDQMCAASBgwAAQMGAACBgwAAQMGAACBgwAAQMGgIABA0DAgAEgYMAAEDBgAAgYMAAEDBgAAgYMAAEDBoCAAQNAwIABIGDAABAwYAAIGDAABAwYAAIGDAABAwaAgAEDQMCAASBgwAAQMGAACBgwAAQMGAACBgwAAQMGgIABA0DAgAEgYMAAEDBgAAgYMAAEDBgAAgYMAAEDBoCAAQNAwIABIGDAABAwYAAIGDAABAwYAAIGDAABAwaAgAEDQMCAASBgwAAQMGAACBgwAAQMGAACBgwAAQMGgIABA0DAgAEgYMAAEDBgAAgYMAAEDBgAAgYMAAEDBoCAAQNAwIABIGDAABAwYAAIGDAABAwYAAIGDAABAwaAgAEDQMCAASBgwAAQMGAACBgwAAQMGAACBgwAAQMGgIABA0DAgAEgYMAAEDBgAAgYMAAEDBgAAgYMAAEDBoCAAQNAwIABIGDAABAwYAAIGDAABAwYAAIGDAABAwaAgAEDQMCAASBgwAAQMGAACBgwAAQMGAACBgwAAQMGgIABA0DAgAEgYMAAEDBgAAgYMAAEDBgAAgYMAAEDBoCAAQNAwIABIGDAABAwYAAIGDAABAwYAAIGDAABAwaAgAEDQMCAASBgwAAQMGAACBgwAAQMGAACBgwAAQMGgIABA0DAgAEgYMAAEDBgAAgYMAAEDBgAAgYMAAEDBoCAAQNAwIABIGDAABAwYAAIGDAABAwYAAIGDAABAwaAgAEDQMCAASBgwAAQMGAACBgwAAQMGAACF+cJBp0pzOyaAAAAAElFTkSuQmCC';

test('FFmpegPipeline: Detects system binaries and returns capabilities', () => {
  const pipeline = new FFmpegPipeline();
  const caps = pipeline.getSystemCapabilities();

  assert.equal(typeof caps.os, 'string');
  assert.equal(caps.ffmpegAvailable, true);
  assert.equal(caps.ffprobeAvailable, true);
  assert.match(caps.ffmpegVersion || '', /ffmpeg/i);
});

test('FFmpegPipeline: Encodes frame sequence into verified MP4 video with FFprobe', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hms-ffmpeg-test-'));
  const framesDir = path.join(tempDir, 'frames');
  fs.mkdirSync(framesDir, { recursive: true });

  const pipeline = new FFmpegPipeline();
  const ffmpegBin = pipeline.resolveBinary('ffmpeg');

  // Generate 1 reference PNG frame using FFmpeg's own lavfi generator
  const refFramePath = path.join(tempDir, 'ref_frame.png');
  execSync(`"${ffmpegBin}" -y -f lavfi -i color=c=blue:s=640x360:d=1 -frames:v 1 -update 1 "${refFramePath}"`, {
    stdio: 'ignore',
  });
  const pngBuffer = fs.readFileSync(refFramePath);

  const fps = 30;
  const durationSec = 1;
  const totalFrames = fps * durationSec;

  // Generate 30 sequential frames
  for (let i = 1; i <= totalFrames; i++) {
    const frameNumberPadded = String(i).padStart(5, '0');
    fs.writeFileSync(path.join(framesDir, `frame_${frameNumberPadded}.png`), pngBuffer);
  }

  // Synthesize a 1-second test audio file using ffmpeg
  const audioPath = path.join(tempDir, 'test_audio.mp3');
  try {
    execSync(`"${ffmpegBin}" -y -f lavfi -i sine=frequency=440:duration=1.0 -c:a libmp3lame "${audioPath}"`, {
      stdio: 'ignore',
    });
  } catch {
    // If lavfi fails, proceed without audio
  }

  const outVideoPath = path.join(tempDir, 'output_test.mp4');

  try {
    const encodedPath = await pipeline.encodeFrames(
      {
        jobId: 'test-job',
        project: { id: 'test', title: 'Test', mode: 'code', htmlContent: '', entryHtmlPath: '', availableHtmlFiles: [], assets: {}, missingAssets: [] },
        settings: {
          aspectRatio: '16:9',
          width: 640,
          height: 360,
          resolution: '720p',
          fps: 30,
          format: 'mp4',
          quality: 'high',
          videoBitrateMbps: 2,
          audioBitrateKbps: 128,
          durationPolicy: 'project',
          durationSeconds: 1,
          loopAnimationIfShorter: true,
          filename: 'output_test',
          engineStrategy: 'auto',
        },
        audioSettings: {
          sourceMode: fs.existsSync(audioPath) ? 'external' : 'none',
          durationSeconds: 1,
          volume: 1.0,
          startOffsetSeconds: 0,
          trimInSeconds: 0,
          trimOutSeconds: 1,
          fadeInSeconds: 0.1,
          fadeOutSeconds: 0.1,
        },
        audioFilePath: fs.existsSync(audioPath) ? audioPath : undefined,
        outputFilePath: outVideoPath,
        strategy: 'compatibility',
      },
      framesDir,
      () => {}
    );

    assert.equal(fs.existsSync(encodedPath), true);
    assert.equal(fs.statSync(encodedPath).size > 1000, true);

    // Validate with FFprobe
    const probe = pipeline.verifyVideo(encodedPath);
    assert.equal(probe.valid, true);
    assert.match(probe.formatName, /mp4|mov/);
    assert.equal(probe.video?.codec, 'h264');
    assert.equal(probe.video?.width, 640);
    assert.equal(probe.video?.height, 360);
    assert.equal(probe.video?.fps, 30);
    assert.equal(Math.round(probe.durationSeconds), 1);

    if (fs.existsSync(audioPath)) {
      assert.equal(probe.audio !== null, true);
      assert.equal(probe.audio?.codec, 'aac');
    }
  } catch (err) {
    console.error('FULL ERROR FROM PIPELINE:', err);
    throw err;
  }

  fs.rmSync(tempDir, { recursive: true, force: true });
});
