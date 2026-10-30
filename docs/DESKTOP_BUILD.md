# HTML Motion Studio Desktop — Build & Packaging Guide

## 1. Prerequisites

- **Node.js**: v20.x or higher (Node v24 recommended)
- **Package Manager**: `pnpm` v9 or v12
- **FFmpeg & FFprobe**: Installed locally or provisioned in system PATH.
  - macOS: `brew install ffmpeg`
  - Linux: `sudo apt update && sudo apt install -y ffmpeg`
  - Windows: Download from Gyan.dev or `winget install Gyan.FFmpeg`

---

## 2. Project Compilation

HTML Motion Studio uses a clean monorepo architecture:

```bash
# 1. Install all dependencies across workspace
pnpm install

# 2. Build the Desktop Renderer UI (Vite + React)
pnpm --filter @html-motion-studio/desktop run build:renderer

# 3. Compile the Desktop Main & Preload processes (TypeScript)
pnpm --filter @html-motion-studio/desktop run build:main

# 4. Or build both in one unified command
pnpm --filter @html-motion-studio/desktop run build
```

---

## 3. Running in Development Mode

```bash
# Start desktop application in Electron
pnpm --filter @html-motion-studio/desktop dev

# Optional: Run live-reloading Vite dev server for UI development
pnpm --filter @html-motion-studio/desktop run dev:renderer
```

---

## 4. Multi-Platform Packaging (electron-builder)

Packaging is configured via [`apps/desktop/electron-builder.yml`](file:///Users/ta-shanto/Coding/products/Html-Motion-Studio/apps/desktop/electron-builder.yml):

### 4.1 macOS Packages (DMG & ZIP)
```bash
# Package for macOS (Universal / arm64 / x64)
pnpm --filter @html-motion-studio/desktop exec electron-builder --mac
```
- **Output Artifacts**:
  - `release/HTML Motion Studio-1.0.0-arm64.dmg`
  - `release/HTML Motion Studio-1.0.0-x64.dmg`
  - `release/HTML Motion Studio-1.0.0-mac.zip`

### 4.2 Windows Packages (NSIS Installer)
```bash
# Package for Windows 10/11 64-bit
pnpm --filter @html-motion-studio/desktop exec electron-builder --win nsis:x64
```
- **Output Artifacts**:
  - `release/HTML Motion Studio-Setup-1.0.0.exe`

### 4.3 Linux Packages (AppImage)
```bash
# Package for Linux 64-bit
pnpm --filter @html-motion-studio/desktop exec electron-builder --linux AppImage:x64
```
- **Output Artifacts**:
  - `release/HTML Motion Studio-1.0.0.AppImage`

---

## 5. FFmpeg Provisioning & Distribution Considerations

1. **System Discovery**: The `FFmpegPipeline` automatically resolves system binaries from PATH (`/opt/homebrew/bin/ffmpeg`, `/usr/local/bin/ffmpeg`, etc.) or custom environment variable `FFMPEG_PATH`.
2. **Bundled Distribution**: For commercial or standalone distributions, FFmpeg binaries can be placed in `apps/desktop/build/bin/{platform}/` and added to `extraFiles` in `electron-builder.yml`.
3. **Licensing**: FFmpeg is licensed under the LGPL v2.1+ (or GPL v2+ if configured with `--enable-gpl` for `libx264`). When distributing bundled binaries containing GPL codecs like `libx264`, follow standard GPL dynamic linking and source disclosure requirements or configure with OpenH264 / AV1 (`libsvtav1`) for LGPL compliance.

