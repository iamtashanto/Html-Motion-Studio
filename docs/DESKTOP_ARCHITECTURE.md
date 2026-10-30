# HTML Motion Studio Desktop — Architecture Specification

## 1. Executive Overview

HTML Motion Studio Desktop is a dedicated local desktop suite for converting HTML, CSS, SVG, Canvas, and JavaScript animations into broadcast-quality video containers (MP4, WebM, and Apple ProRes 4444). 

Unlike the companion Web Converter (which runs inside standard browser tabs subject to memory quotas and WebCodecs browser flags), the Desktop application runs in an isolated Chromium environment powered by Electron and pipes rendered frames directly into a local FFmpeg encoding pipeline.

---

## 2. Process Separation Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ELECTRON MAIN PROCESS                           │
│                                                                        │
│   ┌─────────────────────┐    ┌─────────────────────────────────────┐   │
│   │ ProjectDatabase     │    │ ProjectManager                      │   │
│   │ (SQLite / sql.js)   │    │ (Single HTML, Folder, Safe ZIP)     │   │
│   └─────────────────────┘    └─────────────────────────────────────┘   │
│              ▲                                  ▲                      │
│              │                                  │                      │
│   ┌──────────┴──────────┐    ┌──────────────────┴──────────────────┐   │
│   │ FFmpegPipeline      │    │ HeadlessRenderer                    │   │
│   │ (Local FFmpeg/probe)│◄───┤ (Offscreen Chromium Frame Stepper)  │   │
│   └─────────────────────┘    └─────────────────────────────────────┘   │
│              ▲                                  ▲                      │
│              └─────────────────┬────────────────┘                      │
│                                │                                       │
│                       IPC Message Bus                                  │
└────────────────────────────────┼───────────────────────────────────────┘
                                 │
                     contextBridge (preload.ts)
                                 │
┌────────────────────────────────▼───────────────────────────────────────┐
│                       RENDERER PROCESS (UI)                            │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ desktopStudioStore (Zustand State Manager)                     │   │
│   └────────────────────────────────────────────────────────────────┘   │
│        │                 │                    │               │        │
│        ▼                 ▼                    ▼               ▼        │
│   AppToolbar       AssetsSidebar       DesktopPreview   TimelineTrack  │
│   (File/Recents)   (Categorized Files) (Sandboxed Stage)(Scrub & Audio)│
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ PropertiesPanel (Resolutions, Framerates, Audio & FFmpeg)      │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Core Modules & Responsibilities

### 3.1 Main Process (`src/main/`)
1. **Application Lifecycle (`main.ts`)**:
   - Manages main window lifecycle, window dimensions, and titlebar configurations (`hiddenInset` on macOS).
   - Enforces strict security configurations: `nodeIntegration: false`, `contextIsolation: true`, `sandbox: true`, `webgl: true`.
2. **Project Persistence (`db/projectDatabase.ts`)**:
   - Manages a file-backed SQLite database (`html-motion-studio.sqlite`) in `app.getPath('userData')`.
   - Uses WebAssembly SQLite (`sql.js`) to eliminate binary C++ native compilation errors across platforms.
   - Tables:
     - `recent_projects`: `id`, `title`, `file_path`, `mode`, `last_opened`, `duration`.
     - `export_history`: `id`, `project_id`, `output_file_path`, `format`, `width`, `height`, `fps`, `duration_seconds`, `file_size_bytes`, `created_at`.
3. **Project & Asset Manager (`project/projectManager.ts`)**:
   - Ingests Single HTML files, Project Folders, and ZIP packages.
   - Converts assets to memory data URIs and rewrites relative references (`src`, `href`, `url()`).
   - Implements path traversal checks, depth limits ($\le 8$), and ZIP bomb guards ($500$ files, $50$MB per file, $150$MB cumulative).
4. **Headless Renderer (`rendering/headlessRenderer.ts`)**:
   - Spawns hidden offscreen `BrowserWindow` instances configured to exact target render resolutions.
   - Steers synthetic time progression and evaluates Strategy A adapter or Strategy B compatibility ticks.
   - Captures frame buffers via `webContents.capturePage()` and writes sequential frames into bounded temporary workspace directories.
5. **FFmpeg Pipeline (`rendering/ffmpegPipeline.ts`)**:
   - Locates or provisions local FFmpeg and FFprobe binaries.
   - Spawns FFmpeg with configured resolution, FPS, video codecs (`libx264`, `libvpx-vp9`, `prores_ks`), and audio filters (`volume`, `adelay`, `afade`).
   - Validates generated containers and streams using native FFprobe.

### 3.2 Preload & Secure IPC (`src/preload/`)
- Exposes `window.desktopApi` strictly typed via `DesktopApiBridge`.
- Prohibits arbitrary Node.js filesystem or shell execution from the UI context.
- Handles one-way progress event subscriptions via `ipcRenderer.on('render:progress', ...)`.

### 3.3 Renderer Process UI (`src/renderer/`)
- Built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Zustand**.
- **AppToolbar**: File operations (New, Open HTML, Import ZIP, Open Folder, Save), SQLite recent projects, project rename, dirty indicator, capability pill.
- **AssetsSidebar**: Tree view of HTML entrypoints, CSS stylesheets, JS scripts, SVG/Images, and attached soundtrack audio.
- **DesktopPreview**: Opaque sandboxed iframe (`sandbox="allow-scripts"`), viewport zoom (`Fit`, `50%`, `100%`), background presets (Dark Studio, Blueprint Grid, Transparency Checkerboard), aspect framing overlays (16:9, 9:16, 1:1, 4:5), and playback controls.
- **TimelineTrack**: Interactive ruler with millisecond ticks, draggable red playhead needle, animated track representation, audio waveform cues, volume slider, offset, and trim indicators.
- **PropertiesPanel**: Resolution presets (720p, 1080p, 1440p, 4K), 24/30/60 FPS, MP4/WebM/MOV formats, strategy selector (Strategy A vs B), destination file picker, and export triggers.

