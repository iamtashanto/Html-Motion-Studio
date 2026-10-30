# HTML Motion Studio — Interaction Test Report

**Execution Timestamp:** 2026-10-30T13:45:44.276Z  
**Target Applications:** HTML Motion Studio Web & Desktop

---

## 1. Web Converter Interaction Suite

| Component | Target Action | Verification Details | Status |
| :--- | :--- | :--- | :--- |
| **UploadZone Tabs** | Cycle through Single HTML, ZIP Package, Code Editor, Test Projects | Dynamic tab switching smoothly renders relevant upload dropzone or code editor without re-mounting | **PASS** |
| **OutputSettings Ratios** | Select 16:9, 9:16, 1:1, 4:5, and Custom | Width & height recalculate automatically; custom mode reveals pixel inputs | **PASS** |
| **Resolution Presets** | Toggle 720p, 1080p, 1440p, 4K | Presets update pixel dimensions and frame memory estimates | **PASS** |
| **FPS Presets** | Toggle 24, 30, and 60 FPS | Updates target frame rate and duration calculation | **PASS** |
| **Format Container** | Switch between MP4 (H.264) and WebM (VP9) | Format setting updates; engine fallback matches container | **PASS** |
| **Audio Source Mode** | Toggle No Audio, External Score, HTML Only, Mix Both | Dynamically toggles audio dropzone, volume slider, and trim controls | **PASS** |
| **Preview Scaling** | Toggle Fit, 50%, 75%, 100% | Adjusts preview iframe max-width and max-height cleanly | **PASS** |
| **Transport Controls** | Play, Pause, Restart, Reload | Dispatches postMessage events to sandboxed iframe without page reload | **PASS** |
| **Project Management** | Rename project title inline | Validates trimmed title, persists to state, updates pristine/dirty badge | **PASS** |

---

## 2. Desktop Studio Split-Pane Drag-and-Resize System

| Draggable / Resizable Area | Interaction Mechanism | Dimensions & Constraints | Status |
| :--- | :--- | :--- | :--- |
| **Left Assets Sidebar** | Vertical drag handle on right edge | Min: 180px, Max: 480px, Default: 260px | **PASS** |
| **Right Properties Panel** | Vertical drag handle on left edge | Min: 240px, Max: 520px, Default: 320px | **PASS** |
| **Master Timeline Height** | Horizontal drag handle on top edge | Min: 100px, Max: 380px, Default: 160px | **PASS** |
| **Double-Click Reset** | Double-click any drag handle | Restores default dimensions instantaneously | **PASS** |
| **Panel Collapse / Expand** | Toggle buttons on toolbar & panel headers | Collapses into slim icon strips (w: 44px, h: 36px) | **PASS** |
| **Pointer Capture Safety** | `setPointerCapture` + iframe pointer protection | No dropped mouse events over iframe stage during drag | **PASS** |
| **Layout Persistence** | LocalStorage state synchronization | Restores panel sizes & collapsed state across launches | **PASS** |

---

## 3. Timeline & Transport System

| Interaction | Action | Behavior | Status |
| :--- | :--- | :--- | :--- |
| **Draggable Playhead** | Pointer drag on time ruler | Real-time animated seeking across duration | **PASS** |
| **Ruler Zooming** | 1x, 2x, 4x Zoom presets | Horizontally expands ruler up to 400% with scroll | **PASS** |
| **Step 1 Frame** | Left/Right Arrow keys or step buttons | Advances / rewinds playhead by exactly `1 / fps` | **PASS** |
| **Step 1 Second** | Shift + Left/Right Arrow keys | Advances / rewinds playhead by 1.00s | **PASS** |
| **Return to Start** | Home key or '0' key | Immediately seeks to 0.00s | **PASS** |
| **Play / Pause** | Spacebar or transport button | Toggles animation loop and iframe playback | **PASS** |
| **Audio Waveform Cue** | Procedural waveform track | Renders multi-band waveform bars when audio loaded | **PASS** |
| **Audio Controls** | Volume slider & offset input | Real-time update of audio gain and startup delay | **PASS** |
