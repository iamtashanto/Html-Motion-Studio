# HTML Motion Studio 🎬

> Convert HTML5, CSS, Canvas, and JavaScript animations into deterministic, broadcast-ready videos — in your browser or with full native hardware performance on your desktop.

HTML Motion Studio is a modern monorepo suite composed of two companion products:
1. **HTML Motion Studio Web** (`apps/web`): Client-side Next.js web application for fast, lightweight in-browser conversions using WebCodecs, MediaRecorder, and Web Audio API.
2. **HTML Motion Studio Desktop** (`apps/desktop`): Professional Electron-based studio application utilizing offscreen Chromium frame capture, native FFmpeg encoding, and deterministic frame stepping for long, complex, and 4K animations.

---

## ⚖️ Web vs. Desktop Comparison

| Capability | HTML Motion Studio Web | HTML Motion Studio Desktop |
| :--- | :--- | :--- |
| **Primary Target** | Quick web conversions, social clips, lightweight banners | Production rendering, long sequences, 4K rendering, complex JS |
| **Installation** | Zero-install (Runs in any modern browser) | Native desktop application (macOS, Windows, Linux) |
| **Max Recommended Duration**| $\le 30$ seconds | Unlimited (tested 10+ min sequences) |
| **Max Recommended Resolution**| 1080p | 4K UHD ($3840 \times 2160$) & custom aspect ratios |
| **Rendering Pipeline** | In-browser WebCodecs / MediaRecorder fallback | Offscreen Chromium sequential capture + Native FFmpeg |
| **Deterministic Clock** | Real-time / pseudo-virtualized canvas | Full deterministic stepping (`window.__HTML_MOTION_STUDIO__` & virtual clock) |
| **Audio Processing** | Web Audio API mix & recorder integration | Native FFmpeg audio filter graph (`volume`, `adelay`, `afade`) |
| **Video Codecs** | H.264, WebM (VP8/VP9) depending on browser | H.264 (`libx264`), VP9 (`libvpx-vp9`), Apple ProRes (`prores_ks`) |
| **Project Persistence** | In-memory / browser session | File-backed SQLite (`sql.js` WASM) |
| **Network & Privacy** | 100% Client-side (no uploads to server) | 100% Local offline processing |

---

## 🏛️ Monorepo Architecture

```text
Html-Motion-Studio/
├── apps/
│   ├── web/                    # Next.js 14 Web Converter (App Router, Tailwind, Zustand)
│   │   ├── src/
│   │   │   ├── app/            # Marketing page & Studio route (/studio)
│   │   │   ├── components/     # UI components (Preview, Settings, Audio, Progress)
│   │   │   ├── lib/            # WebCodecs, MediaRecorder, AudioEngine, ZipExtractor
│   │   │   └── types/          # Client-side state models
│   └── desktop/                # Electron 33 Native Desktop Studio (Vite, React 18, Zustand)
│       ├── src/
│       │   ├── main/           # Electron main process (Lifecycle, IPC, SQLite, Render Engine)
│       │   │   ├── db/         # sql.js pure-WASM database (project_metadata.db)
│       │   │   ├── rendering/  # HeadlessRenderer, FFmpegPipeline, frame snapshotter
│       │   │   ├── project/    # ProjectManager (Folder/ZIP scanning & asset rewriting)
│       │   │   └── ipc/        # Type-safe IPC channels
│       │   ├── preload/        # Context-isolated desktop API bridge
│       │   └── renderer/       # Studio UI (Toolbar, Sidebar, Preview, Timeline, Properties)
│       ├── build/              # Packaging icons (icon.png, icon.icns, icon.svg)
│       └── electron-builder.yml# Multi-platform distribution configuration
├── packages/
│   ├── shared/                 # Shared types, project models, and code analyzers
│   └── renderer/               # Common rendering utilities & virtual clock harnesses
├── docs/                       # Architecture, security, rendering audit, and release reports
└── scripts/                    # Automated Playwright and rendering validation test runners
```

---

## 💻 System Requirements (Desktop)

### Minimum Requirements
- **macOS**: macOS 12 (Monterey) or later (Apple Silicon or Intel x64).
- **Windows**: Windows 10 (64-bit) or Windows 11.
- **Linux**: Ubuntu 20.04+, Debian 11+, Fedora 36+, or equivalent modern glibc-based distribution.
- **Memory**: 4 GB RAM (8 GB recommended for 1080p rendering).
- **Disk Space**: 500 MB available storage for application; temporary storage varies by render length.
- **FFmpeg**: System FFmpeg 4.4+ installed and on `$PATH` (or placed in application binary directories).

---

## 🚀 Getting Started (Development)

### Prerequisites
- [Node.js](https://nodejs.org/) v20.0.0 or higher (v24 LTS tested)
- [pnpm](https://pnpm.io/) v9.0.0 or higher
- [FFmpeg](https://ffmpeg.org/) (for desktop rendering and local video validation)

```bash
# Clone the repository
git clone https://github.com/your-org/html-motion-studio.git
cd html-motion-studio

# Install dependencies across all workspaces
pnpm install
```

### Running the Web Converter
```bash
# Start Next.js development server
pnpm --filter @html-motion-studio/web dev

# Open http://localhost:3000 in your browser
```

### Running the Desktop Studio
```bash
# Start Electron desktop application in development mode
pnpm --filter @html-motion-studio/desktop dev
```

### Running the Automated Test Suites
```bash
# Run unit and integration tests across all packages
pnpm test

# Run Playwright web converter rendering E2E tests
pnpm test:e2e

# Run desktop rendering pipeline tests against 8 real animation projects
node scripts/run-desktop-export-tests.mjs
```

---

## 📦 Building & Packaging Desktop Releases

HTML Motion Studio Desktop uses `electron-builder` with isolated multi-target presets.

### Build Production Binaries
```bash
# Compile shared packages and desktop app
pnpm --filter @html-motion-studio/desktop run build
```

### Package for Your Platform

#### macOS (DMG & ZIP)
```bash
# Package universal or current architecture DMG and ZIP
pnpm --filter @html-motion-studio/desktop exec electron-builder --mac
```
Artifacts output to `apps/desktop/release/`:
- `HTML Motion Studio-1.0.0-arm64.dmg` (Apple Silicon)
- `HTML Motion Studio-1.0.0-x64.dmg` (Intel)
- `HTML Motion Studio-1.0.0-mac.zip`

#### Windows (NSIS Installer & Portable)
```bash
pnpm --filter @html-motion-studio/desktop exec electron-builder --win nsis
```
Artifacts output to `apps/desktop/release/`:
- `HTML Motion Studio Setup 1.0.0.exe` (NSIS Installer)

#### Linux (AppImage & tar.gz)
```bash
pnpm --filter @html-motion-studio/desktop exec electron-builder --linux AppImage
```
Artifacts output to `apps/desktop/release/`:
- `HTML Motion Studio-1.0.0.AppImage`

---

## 🎯 Deterministic Frame-Accurate Rendering

To ensure 100% reproducible frame timing regardless of CPU load, animations can expose the standard HTML Motion Studio interface:

```javascript
window.__HTML_MOTION_STUDIO__ = {
  // Duration of the animation in seconds
  duration: 5.0,
  
  // Optional frame rate hint
  fps: 60,
  
  // Seek directly to a specific timestamp (in seconds)
  seek: function(timeInSeconds) {
    // Update your timeline, GSAP tween, or canvas state to timeInSeconds
  },
  
  // Optional step method (advance by dt seconds)
  step: function(deltaTimeInSeconds) {
    // Advance internal clock
  }
};
```

If your HTML animation does not define `window.__HTML_MOTION_STUDIO__`, the desktop studio's **Strategy B (Virtual Timeline Clock)** automatically overrides:
- `window.requestAnimationFrame` / `window.cancelAnimationFrame`
- `Date.now()` and `performance.now()`
- CSS animation and transition play state

This ensures that even standard CSS `@keyframes` or `requestAnimationFrame` loops export without stutter, frame drops, or audio drift.

---

## 🔒 Security Architecture

- **Zero Remote Code Execution Risk**: Local HTML projects execute in an isolated offscreen `BrowserWindow` with `nodeIntegration: false`, `contextIsolation: true`, and strict sandbox boundaries.
- **Path Traversal Protection**: Multi-file and ZIP ingestors validate all relative file paths against the temporary project sandbox, rejecting any attempt to write outside target directories.
- **Auto-Cleanup**: Temporary frame rendering directories (`.render-temp-*`) are purged automatically upon export completion, cancellation, or application startup.
- **No Cloud Uploads**: All video synthesis, canvas capture, and audio multiplexing execute 100% locally on your machine.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

