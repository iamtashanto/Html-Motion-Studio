# HTML Motion Studio — Full Native Suite (Rust Core + SwiftUI macOS + Rust UI Windows/Linux)

This directory contains the **100% native rewrite** of HTML Motion Studio Desktop, eliminating the Electron/Node runtime overhead while preserving full studio feature parity.

## Architecture

```text
apps/native/
├── crates/
│   ├── hms-core/            # Shared Rust Core Engine (macOS, Windows, Linux)
│   │   ├── Project Manager  (HTML, ZIP w/ zip-slip & bomb guards, Folder, .hmsproj)
│   │   ├── Native SQLite    (rusqlite bundled — recent_projects & export_history)
│   │   ├── Code Analyzer    (HTML/CSS/rAF/Canvas/SVG/WebGL/Audio/CORS scanner)
│   │   ├── 12 Templates     (Full built-in starter template library)
│   │   ├── CDP Render Core  (Pure-Rust RFC 6455 WebSocket driving Headless Chromium)
│   │   └── FFmpeg Pipeline  (Zero-disk-I/O stdin PNG streaming pipe -> H.264/VP9/ProRes + FFprobe)
│   │
│   ├── hms-ffi/             # C-ABI Static Library (`libhms_ffi.a` + `hms_core.h`) for SwiftUI
│   │
│   └── hms-desktop-rust/    # Windows & Linux Native Rust UI (Slint 1.18 GPU-accelerated)
│
└── macos/                   # macOS Native UI (SwiftUI + AppKit + WKWebView + AVFoundation)
```

## Quick Build & Run

### 1. Run Shared Rust Core Test Suite
```bash
cd apps/native
cargo test --workspace
```

### 2. Build & Package macOS Native App (SwiftUI + Rust Core)
```bash
chmod +x apps/native/scripts/build-macos.sh
./apps/native/scripts/build-macos.sh
open "apps/native/dist/macos/HTML Motion Studio.app"
```

### 3. Build Windows / Linux Native Rust App (Slint + Rust Core)
```bash
chmod +x apps/native/scripts/build-desktop-rust.sh
./apps/native/scripts/build-desktop-rust.sh
```
Or run directly during development:
```bash
cd apps/native
cargo run -p hms-desktop-rust
```
