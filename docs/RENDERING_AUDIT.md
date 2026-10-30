# HTML Motion Studio Web — Engineering & Rendering Audit

**Audit Date**: October 30, 2026  
**Auditor**: Lead Browser Media Engineer  
**Scope**: Client-Side Video & Audio Conversion Pipeline, Sandboxed Preview, Security, State Management, and Export Integrity.

---

## 1. Existing Architecture Overview

HTML Motion Studio Web is an in-browser companion application to HTML Motion Studio Desktop. The web application consists of:

1. **State Store (`src/store/studioStore.ts`)**:
   - Manages loaded project assets, code, audio configuration, export parameters, and conversion progress using Zustand.
2. **Analysis Engine (`src/lib/analyzer/codeAnalyzer.ts`)**:
   - Static regex/AST pattern scanner detecting CSS `@keyframes`, transitions, `requestAnimationFrame`, Canvas 2D, SVG, WebGL, embedded audio, external CDN URLs, and missing assets.
3. **ZIP Handling & Safe Extraction (`src/lib/zip/zipHandler.ts`)**:
   - In-memory ZIP decompression using JSZip, asset URL rewriting (`src`, `href`, `url(...)` to Blob URLs), and multiple entry point resolution.
4. **Isolated Preview (`src/components/preview/SandboxedPreview.tsx`)**:
   - Sandboxed `<iframe>` with transport controls (Play, Pause, Restart, Reload, Zoom, Fullscreen).
5. **Audio Engine (`src/lib/audio/audioEngine.ts`)**:
   - Web Audio API decoding (MP3, WAV, AAC), normalized waveform peak generation, and `OfflineAudioContext` timeline rendering (volume, start offset, trim, and fades).
6. **Rendering Engine (`src/lib/engine/renderEngine.ts`)**:
   - Dual-strategy architecture:
     - **Strategy C**: WebCodecs `VideoEncoder` + `mp4-muxer` / `webm-muxer`.
     - **Strategy B**: `HTMLCanvasElement.captureStream()` + `MediaRecorder` + Web Audio track mixing.
     - **Strategy A**: Canvas capture synchronization.

---

## 2. Feature Verification Status

### A. Confirmed Working Features
* **Project Scaffold & TypeScript/Tailwind Build**: Next.js 14 App Router, strict types, static generation of `/` and `/tools/html-to-mp4`.
* **Safe Path Traversal Checks in ZIP**: `../` and absolute paths are rejected.
* **12 Built-in Test Suite Fixtures**: Covering static layouts, CSS keyframes, transitions, rAF, SVG, Canvas 2D, local assets, typography, CDN warnings, audio visualizer, 15s durations, and heavy WebGL scenes.
* **Compatibility Status Classification**: Accurate assignment of `ready`, `limited`, `desktop-recommended`, and `unsupported` statuses.
* **UI Controls & Aspect Ratios**: Real-time calculation of even-pixel dimensions (16:9, 9:16, 1:1, 4:5, custom) for H.264 macroblock alignment.

### B. Partially Working Features
* **WebCodecs Video Encoding**:
  - `VideoEncoder` successfully generates H.264 / VP9 video chunks with `mp4-muxer`.
  - *Limitation*: No backpressure queue management was implemented. Rapid frame feeding on high-resolution projects could cause memory exhaustion.
  - *Limitation*: WebCodecs path did not multiplex audio chunks; audio was only multiplexed in the MediaRecorder fallback path.
* **DOM Animation Frame Capture**:
  - Animations containing a `<canvas>` element (e.g. Canvas 2D, rAF particle systems) successfully mirror to the export canvas.
  - *Limitation*: Pure DOM/CSS animations (HTML `<div>` keyframes) without a `<canvas>` element produced blank frames in canvas mirror mode. Requires an SVG `foreignObject` / rasterizer snapshot pipeline to render DOM frames onto canvas.
* **MediaRecorder Format Selection**:
  - Real-time stream recording correctly produces WebM or MP4 blobs.
  - *Limitation*: When a browser does not support `video/mp4` in MediaRecorder, the output format must be strictly reported as WebM; it must never be renamed or labeled as MP4.

### C. Broken or Unverified Features Prior to Audit
* **Iframe Sandbox Configuration**:
  - `SandboxedPreview.tsx` was configured with `sandbox="allow-scripts allow-same-origin"`. Combining `allow-scripts` and `allow-same-origin` on a same-origin document violates the browser security model, allowing untrusted scripts to access `parent.document`.
* **ZIP Decompression Bomb Protection**:
  - Uncompressed byte expansion limits, maximum file counts, and maximum single-file thresholds were not enforced in `processZipFile`.
* **Blob URL Memory Leaks**:
  - Object URLs generated during ZIP extraction were not tracked for revocation when a new project was loaded.

---

## 3. Browser-Specific Limitations

| Browser Engine | WebCodecs (VideoEncoder) | AudioEncoder (AAC) | MediaRecorder MP4 | Canvas captureStream | Recommended Output |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Chromium** (Chrome, Edge) | Full (H.264 Baseline/Main, VP9) | Supported (`mp4a.40.2`) | Partial (Chrome 130+) | Supported | MP4 via WebCodecs |
| **Firefox** (Gecko) | In development / Flag-gated | In development | Not supported (VP8/VP9 only) | Supported | WebM via MediaRecorder |
| **WebKit** (Safari macOS/iOS) | Partial (H.264 hardware) | Limited | Supported (`video/mp4;codecs=avc1`) | Supported | MP4 via MediaRecorder/WebCodecs |

---

## 4. Security Concerns & Vulnerabilities

1. **High**: Combined `allow-scripts` and `allow-same-origin` in sandbox iframe.
   - *Fix*: Remove `allow-same-origin` from the preview iframe. Use postMessage communication and null-origin blob execution.
2. **Medium**: Missing Zip Bomb Safeguards.
   - *Fix*: Impose a strict 100 MB aggregate uncompressed limit, a 50 MB single-file limit, and a maximum of 500 files per archive.
3. **Medium**: Unbounded Memory Allocation during WebCodecs Encoding.
   - *Fix*: Throttle frame submission using `encoder.encodeQueueSize <= 4` to introduce encoder backpressure.
4. **Low**: Unrevoked Blob URLs across upload cycles.
   - *Fix*: Implement `revokeProjectAssets()` to clean up object URLs on project replacement or component unmount.

---

## 5. Recommended Fixes Ordered by Severity

| Priority | Component | Issue | Action Required |
| :--- | :--- | :--- | :--- |
| **P0** | Security | Sandbox iframe privilege escape | Remove `allow-same-origin` from `SandboxedPreview.tsx` |
| **P0** | Rendering | DOM/CSS animations render blank without `<canvas>` | Implement SVG `foreignObject` / DOM rasterizer snapshot pipeline |
| **P1** | Security | ZIP decompression bomb vulnerability | Add file count, single-file size, and total uncompressed size guards |
| **P1** | Audio | WebCodecs export lacks audio multiplexing | Implement `AudioEncoder` or fallback to MediaRecorder with mixed Web Audio |
| **P1** | Performance | WebCodecs queue memory overflow | Add `encodeQueueSize` backpressure throttling loop |
| **P2** | Resource Mgmt | Blob URL leaks in ZIP handler | Track and revoke object URLs on project reload |
| **P2** | Validation | MediaRecorder MIME type honesty | Strict format validation preventing WebM from ever masquerading as MP4 |

