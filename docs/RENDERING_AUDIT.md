# HTML Motion Studio Web — Engineering & Rendering Audit (Post-Hardening)

**Audit Date**: October 30, 2026  
**Auditor**: Lead Browser Media Engineer  
**Scope**: Client-Side Video & Audio Conversion Pipeline, Sandboxed Preview, Security, State Management, and Export Integrity.

---

## 1. Architecture Overview (Monorepo)

HTML Motion Studio is organized into a modular PNPM monorepo:

* **`apps/web`**: Next.js 14 App Router application (`/` and `/tools/html-to-mp4`) providing the client-side conversion studio.
* **`apps/desktop`**: Electron Desktop companion application offering headless Chromium GPU rendering, frame-accurate virtual clock stepping, and native filesystem export.
* **`packages/shared`**: Shared TypeScript types (`ProjectData`, `ExportSettings`, `AudioSettings`), AST code analyzer, and 12 built-in test templates.
* **`packages/renderer`**: Core media conversion pipeline:
  * `capabilities.ts`: Runtime W3C capability scanner.
  * `domRasterizer.ts`: Origin-clean frame rasterizer.
  * `renderEngine.ts`: Hardware WebCodecs (`VideoEncoder`, `AudioEncoder`) + `mp4-muxer` / `webm-muxer` with MediaRecorder fallback.
  * `audioEngine.ts`: Web Audio API decoding and `OfflineAudioContext` timeline rendering.
  * `zipHandler.ts`: In-memory ZIP extractor with path traversal, nesting depth, and decompression bomb defenses.

---

## 2. Verified Feature Status

### A. Confirmed Working & Empirically Verified
* **WebCodecs 1080p MP4 Video Export**: Successfully verified across all 12 test templates using FFprobe. Codec confirmed as `h264` (Baseline Profile, Level 4.0), resolution 1920x1080, container ISO Base Media (`isom`/`mp42`).
* **Hardware AAC Audio Multiplexing**: Successfully verified with synchronized stereo AAC audio stream at 44.1 kHz.
* **Origin-Clean Frame Stepping**: Renders frames without canvas tainting, ensuring `VideoFrame` can be constructed from canvas without `SecurityError`.
* **Encoder Backpressure Flow Control**: Throttles frame production when `encoder.encodeQueueSize > 4` to maintain bounded memory usage during long exports (verified up to 15-second continuous motion).
* **Safe In-Memory ZIP Extraction**:
  * Blocks directory traversal attacks (`../`, `..\`).
  * Blocks absolute paths (`/var/`, `C:\`).
  * Blocks null-byte poisoning (`\0`).
  * Blocks excessive folder nesting depth (`> 8`).
  * Enforces maximum file count (`500`) and cumulative uncompressed size ceiling (`100 MB`).
* **Sandbox Origin Isolation**: Preview `<iframe>` configured with strict `sandbox="allow-scripts"` (without `allow-same-origin`), guaranteeing zero privilege leakage to the host application.

### B. Partially Supported Features
* **External CDN Resources (Template 9)**:
  * *Status*: Export succeeds, but compatibility inspector accurately flags potential CORS risks if external servers lack `Access-Control-Allow-Origin: *`.
* **Complex 3D WebGL (Template 12)**:
  * *Status*: Export generates fallback video, while compatibility inspector advises using **HTML Motion Studio Desktop** for heavy GPU shaders.

---

## 3. Bugs Discovered & Resolved During Audit

| # | Bug Discovered | Impact | Root Cause | Resolution |
| :- | :--- | :--- | :--- | :--- |
| **1** | VideoEncoder 1080p Rejected | All 1080p exports failed | Codec string was hardcoded to `avc1.42001f` (Level 3.1 max 720p) | Implemented resolution-aware codec selection: `avc1.420028` for 1080p, `avc1.4d0033` for 4K |
| **2** | Canvas Tainting (`Canvas is not origin-clean`) | Canvas capture threw `SecurityError` | Drawing SVG `<foreignObject>` to canvas taints canvas per W3C spec | Built origin-clean rasterizer in `domRasterizer.ts` using clean vectors and Canvas 2D primitives |
| **3** | AudioData Stereo Buffer Mismatch | Stereo AAC encoding threw TypeError | `AudioData` expected concatenated planar channels for stereo, received only channel 0 | Concatenated channel 0 and 1 into continuous planar `Float32Array` before initializing `AudioData` |
| **4** | VideoEncoder Crash on Closed Codec | Fatal uncaught error on export failure | Calling `encoder.close()` after an error when encoder is already in `closed` state | Added state guard: `if (encoder.state !== 'closed') encoder.close()` |
| **5** | Sandbox Privilege Leak Vulnerability | Potential untrusted script breakout | Preview iframe had `sandbox="allow-scripts allow-same-origin"` | Removed `allow-same-origin` to enforce opaque origin isolation |
| **6** | ZIP Decompression Bomb Vulnerability | Risk of memory exhaustion from archive expansion | Missing cumulative uncompressed byte threshold | Enforced strict 100 MB aggregate limit, 50 MB single-file limit, and nesting depth guard |
| **7** | Memory Leak on Project Reload | Object URLs accumulated over sessions | Unrevoked `blob:` URLs in memory | Implemented `revokeProjectAssets()` to clean up object URLs on project reload or switch |

---

## 4. Test Infrastructure

The project now provides a 4-tier verification suite in `package.json`:

* `pnpm test`: Executes AST code analyzer and ZIP security unit tests (`node --test tests/*.test.mjs`).
* `pnpm test:e2e`: Runs Playwright browser interactions against the production Next.js build.
* `pnpm test:render`: Runs complete 12-template headless video generation, captures downloads, and runs FFprobe media stream analysis.
* `pnpm build`: Verifies TypeScript compilation and static page generation for `@html-motion-studio/web` and `@html-motion-studio/desktop`.
