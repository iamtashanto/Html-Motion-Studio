# HTML Motion Studio Desktop — Verification & Test Report

**Suite Version:** 1.0.0  
**Test Harness:** Node.js Test Runner & Playwright Chromium  
**Host System:** macOS (Darwin arm64)  
**FFmpeg Version:** 9.0.2  
**FFprobe Version:** 9.0.2  
**Date:** October 30, 2026  

---

## 1. Executive Summary

All 17 automated unit and desktop integration tests have passed with 100% success (0 failures). Real local MP4 rendering was executed using local FFmpeg 9.0.2, and media streams were verified using FFprobe.

---

## 2. Test Execution Results

```
✔ Static code analyzer detects standard CSS keyframe animations as ready (0.72ms)
✔ Static code analyzer flags external CDN dependencies as limited (0.23ms)
✔ Static code analyzer detects WebGL and marks heavy scenes appropriately (0.05ms)
✔ Static code analyzer detects non-HTML content as unsupported (0.05ms)
✔ FFmpegPipeline: Detects system binaries and returns capabilities (109.04ms)
✔ FFmpegPipeline: Encodes frame sequence into verified MP4 video with FFprobe (147.30ms)
✔ SQLite Desktop Project Database: Initializes and creates tables (64.35ms)
✔ SQLite Desktop Project Database: Inserts and retrieves recent projects ordered by last_opened (4.10ms)
✔ SQLite Desktop Project Database: Records export history and persists to disk (5.48ms)
✔ ProjectManager: Opens single HTML file and discovers sibling assets (3.67ms)
✔ ProjectManager: Opens directory project and recursively scans assets (2.47ms)
✔ ProjectManager: Safely unpacks ZIP archive and enforces security boundaries (10.41ms)
✔ isSafePath allows normal and nested relative paths (0.40ms)
✔ isSafePath rejects path traversal and absolute paths (0.06ms)
✔ isSafePath rejects excessive directory nesting depth (> 8) (0.06ms)
✔ JSZip simulates zip bomb detection when aggregate size exceeds ceiling (8.75ms)
✔ ZIP multiple HTML entries detection and default selection (0.39ms)
Total: 17 tests passed, 0 failed, 0 skipped (296.9ms)
```

---

## 3. Real FFprobe Inspection Verification

In `tests/desktopFFmpegPipeline.test.mjs`, a sequence of 30 frames at 30 FPS was piped into FFmpeg along with a synthesized soundtrack, producing `output_test.mp4`:

```json
{
  "format": {
    "filename": "/tmp/hms-ffmpeg-test-.../output_test.mp4",
    "format_name": "mov,mp4,m4a,3gp,3g2,mj2",
    "duration": "1.000000",
    "size": "19456",
    "bit_rate": "155648"
  },
  "video": {
    "codec_name": "h264",
    "profile": "High",
    "width": 640,
    "height": 360,
    "r_frame_rate": "30/1",
    "pix_fmt": "yuv420p"
  },
  "audio": {
    "codec_name": "aac",
    "sample_rate": "44100",
    "channels": 1,
    "duration": "1.000000"
  }
}
```

### Verification Criteria Checklist
- [x] Container is genuine MP4 (`mov,mp4,m4a,3gp,3g2,mj2`), not WebM mislabeled with `.mp4`.
- [x] Video codec is `h264` (AVC1).
- [x] Frame dimensions match requested output: `640x360`.
- [x] Frame rate matches requested output: `30 FPS`.
- [x] Duration matches configured time: `1.000s`.
- [x] Audio stream is present and encoded with `aac`.
- [x] File size is valid and uncorrupted: `~19 KB`.

---

## 4. Security & Safety Test Verifications

1. **Path Traversal Shield**:
   - `../../etc/passwd` $\rightarrow$ Rejected with `Path traversal rejected`.
   - `/root/secret` $\rightarrow$ Rejected with `Absolute paths not allowed in archive`.
   - `nested\0file.txt` $\rightarrow$ Rejected with `null byte`.
   - Depth $> 8$ levels $\rightarrow$ Rejected with `Archive exceeds directory nesting depth ceiling`.
2. **ZIP Bomb Guard**:
   - Simulated zip archive exceeding size ceiling was rejected before uncompressed extraction.
3. **SQLite Persistence**:
   - Database tables `recent_projects` and `export_history` created and verified.
   - Persistence verified by creating a second instance from the generated `.sqlite` file on disk.

