# Changelog

All notable changes to the HTML Motion Studio suite will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-30

### Product Overview
Initial release of **HTML Motion Studio Desktop** (v1.0.0) alongside the public beta of **HTML Motion Studio Web**. HTML Motion Studio Desktop is a native cross-platform application for transforming HTML5/CSS/JavaScript animations into deterministic, high-resolution MP4, WebM, and ProRes video files.

---

### Added

#### Core Desktop Architecture (`apps/desktop`)
- **Electron 33 + Chromium Shell**: Hardened desktop shell enforcing `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`, and strictly typed IPC communication over `contextBridge`.
- **Pure-WASM SQLite Persistence (`sql.js`)**: Fast, compilation-free project and export history tracking stored locally in `project_metadata.db`. Eliminates native Node-API `NODE_MODULE_VERSION` binary incompatibilities across platforms.
- **Project Ingestion Pipeline**:
  - Direct single-file `.html` import.
  - Multi-file project folder scanning with recursive traversal (up to 8 levels deep).
  - ZIP archive extraction with path-traversal prevention (`..` sanitization) and uncompressed size threshold guards (500 MB max).
  - Asset rewriting for relative CSS, image, and font references.
- **Dual-Strategy Frame-Accurate Rendering Engine**:
  - **Strategy A (Deterministic Hook)**: Connects to `window.__HTML_MOTION_STUDIO__.seek(t)` or `.step(dt)` for sub-millisecond, frame-accurate animation progression without clock drift.
  - **Strategy B (Virtual Timeline Clock)**: Injects virtualized timing harnesses (`requestAnimationFrame`, `Date.now`, `performance.now`, CSS animation overrides) for uninstrumented web animations.
- **Native FFmpeg / FFprobe Media Pipeline**:
  - Automated binary discovery resolving bundled and local platform binaries.
  - High-performance piping directly from sequential PNG memory buffers into FFmpeg `image2pipe` demuxer.
  - Enforces even dimension requirements ($w \times h$ even integers) for H.264 `yuv420p` compatibility.
  - Comprehensive video encoders: H.264 (`libx264`), VP9 (`libvpx-vp9`), and ProRes (`prores_ks`).
  - Audio filter graph support for volume gain, startup delays (`adelay`), and fade-in/fade-out (`afade`).
  - Container optimization with `-movflags +faststart` for immediate web streaming.
  - Real-time probe inspection verifying codecs, SAR/DAR, color space, frame counts, bitrates, and durations.

#### Studio UI (`apps/desktop/src/renderer`)
- **Interactive Multi-Panel Workspace**:
  - Dark-themed studio interface inspired by professional NLEs.
  - **Assets Sidebar**: Categorized file explorer for HTML, CSS, JS, image, and audio files with file size badges.
  - **Sandboxed Preview Viewport**: Isolated `iframe` with viewport scaling (`Fit`, `50%`, `100%`), 4 studio backgrounds (Dark, Checkerboard, Light, Solid Black), aspect ratio presets, and transport controls.
  - **Timeline Track**: Interactive time ruler with draggable playhead needle, audio waveform cues, volume control, and start offset/trim adjustments.
  - **Properties Panel**: Resolution selection (720p, 1080p, 1440p, 4K UHD), framerates (24, 30, 60 FPS), bitrate controls, format options, and rendering strategy selection.
  - **Export Modals**: Real-time export progress modal with frame counters, elapsed time, and ETA; export success modal with direct playback and "Open in Folder" actions.

#### Cross-Platform Packaging & Distribution
- **macOS**: DMG and ZIP packages for Apple Silicon (`arm64`) and Intel (`x64`) architectures. Includes custom application icon bundle (`icon.icns`).
- **Windows**: x64 NSIS installer with standard per-machine/per-user installation switches, desktop shortcut creation, and automatic uninstaller.
- **Linux**: x64 AppImage portable executable with bundled desktop integration files.
- **Continuous Integration**: Multi-platform release automation via GitHub Actions (`.github/workflows/desktop-release.yml`) testing and building artifacts across `windows-latest`, `macos-latest`, and `ubuntu-latest`.

---

### Security & Hardening
- **Sandboxed Execution**: Renderer process cannot access Node.js primitives or local files directly.
- **Path Traversal Guards**: File imports enforce canonical path validation within isolated temporary working directories.
- **Orphan Cleanup**: Automatic startup sweep purging transient render workspaces older than 24 hours.
- **Even Resolution Constraints**: Automatic normalization of odd pixel dimensions preventing FFmpeg encoder crashes.

