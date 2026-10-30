# UI/UX Changelog — HTML Motion Studio

All design, layout, responsive, and interaction fixes applied during the audit are documented below.

---

## [UI/UX Release 1.1.0] - 2026-10-30

### 📱 Responsive Behavior & Layout Fixes (`apps/web`)
- **Resolved 320px Small Mobile Document Overflow**:
  - Replaced non-wrapping project header metadata row with `flex flex-wrap items-center gap-2`.
  - Added truncation guard `max-w-[170px] sm:max-w-md` on project titles to prevent screen margin pushout.
  - Achieved `scrollWidth: 320px` (0px horizontal overflow) on smallest mobile viewports.
- **Refined Aspect Ratio Grid (`OutputSettings.tsx`)**:
  - Transitioned from fixed 5-column grid (`grid-cols-5`) to responsive breakpoints (`grid-cols-2 sm:grid-cols-3 md:grid-cols-5`).
- **Mobile Video Format Cards (`OutputSettings.tsx`)**:
  - Converted format container buttons from 2-columns to single-column stacking on mobile devices (`grid-cols-1 sm:grid-cols-2`).
- **Horizontal Scroll Strips (`UploadZone.tsx` & `AudioSection.tsx`)**:
  - Wrapped tab bars in `overflow-x-auto scrollbar-none whitespace-nowrap` to prevent tab wrapping on mobile screens.
- **Modal Viewport Adaptation (`ExportProgressModal.tsx` & `ExportResultModal.tsx`)**:
  - Updated padding and border radii to `rounded-2xl sm:rounded-3xl p-4 sm:p-6` to maximize playable video area on compact screens.
  - Upgraded video result metadata grid to `grid-cols-2 sm:grid-cols-4` to prevent stat clipping.

---

### 🖥️ Desktop Studio Workspace & Split-Pane System (`apps/desktop`)
- **Fluid Multi-Panel Height Resolution (`App.tsx`)**:
  - Eliminated hardcoded `h-[calc(100vh-3.5rem)]` from `AssetsSidebar`, `DesktopPreview`, and `PropertiesPanel`.
  - Replaced with flexbox `flex-1 min-h-0` hierarchy so all panels and the bottom timeline fit within the window without scrollbars.
- **Interactive Splitters & Drag Resizing**:
  - **Left Sidebar Handle**: Added vertical splitter (`cursor-col-resize`) with min 180px, max 480px, default 260px.
  - **Right Properties Handle**: Added vertical splitter (`cursor-col-resize`) with min 240px, max 520px, default 320px.
  - **Timeline Height Handle**: Added horizontal splitter (`cursor-row-resize`) with min 100px, max 380px, default 160px.
  - **Double-Click Reset**: Double-clicking any splitter handle snaps dimensions back to default presets.
- **Iframe Pointer Capture Protection**:
  - Added global `isResizing` tracking applying `pointer-events-none` to preview iframes during mouse dragging.
- **One-Click Panel Collapse / Expand**:
  - Added collapse buttons on panel headers and top application toolbar.
  - Collapsed panels display slim 44px vertical icon strips with instant re-expand action.
- **Layout State Persistence**:
  - Panel dimensions and collapsed booleans automatically persist to and restore from `localStorage`.

---

### ⏱️ Timeline & Scrubbing UX (`TimelineTrack.tsx`)
- **Time Ruler Zoom Controls**:
  - Implemented `1x`, `2x`, `4x` timeline zoom controls with horizontal scrolling for frame-accurate scrubbing.
- **Frame Stepping Controls**:
  - Added dedicated step-forward and step-backward buttons (`SkipBack`, `SkipForward`) advancing by exactly $\Delta t = 1/\text{fps}$.
- **Audio Waveform Cue**:
  - Added procedural multi-band audio waveform visualization along the soundtrack track when audio is attached.
- **Collapsed Mini-Transport Bar**:
  - When the timeline is collapsed, a compact 36px transport bar maintains playhead timecode, play/pause controls, and expand toggle.

---

### 👁️ Preview & Stage Experience (`DesktopPreview.tsx`)
- **Fullscreen Stage Mode**:
  - Wired `Maximize2` / `Minimize2` to HTML5 Fullscreen API on the preview container.
- **Studio Background Presets**:
  - Added 4 studio background presets: Dark (`#090d16`), Blueprint Grid, Transparency Checkerboard, and Light.
- **Responsive Iframe Scaling**:
  - Fluid `aspect-ratio` container with `contain: content` guarantees that window or panel resizing never interrupts running animations.

---

### ♿ Accessibility & Visual Polish
- **Semantic ARIA Labels**: Added `aria-label` to all icon-only buttons (Play, Pause, Restart, Reload, Fullscreen, Panel Toggles).
- **Focus Rings**: Standardized `focus-visible:ring-2 focus-visible:ring-blue-500` across all interactive elements.
- **Global Keyboard Shortcuts**:
  - `Space`: Play / Pause toggle
  - `Home` or `0`: Seek to 0.00s
  - `ArrowLeft` / `ArrowRight`: Step 1 frame
  - `Shift + ArrowLeft` / `Shift + ArrowRight`: Step 1 second
  - `Cmd/Ctrl + B` or `[`: Toggle Assets Sidebar
  - `Cmd/Ctrl + Shift + B` or `]`: Toggle Properties Panel
  - `Cmd/Ctrl + J` or `T`: Toggle Timeline

