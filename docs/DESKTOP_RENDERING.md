# HTML Motion Studio Desktop — Rendering Engine & Pipeline

## 1. Dual Rendering Strategies

The desktop application provides two distinct rendering strategies tailored to different animation paradigms:

### Strategy A: Deterministic Rendering Adapter
When an animation is authored or instrumented specifically for frame-accurate video rendering, it can expose the `window.__HTML_MOTION_STUDIO__` contract:

```typescript
interface HtmlMotionStudioAdapter {
  /** Total animation duration in seconds */
  duration: number;

  /**
   * Seek the animation to a precise timestamp in seconds.
   * Can be asynchronous if complex canvas recalculation is required.
   */
  seek(timeSeconds: number): Promise<void> | void;

  /**
   * Optional explicit draw hook invoked after seek.
   */
  renderFrame?(timeSeconds: number): Promise<void> | void;

  /**
   * Cleanup resources when rendering completes.
   */
  dispose?(): void;
}
```

#### How Strategy A Operates:
1. The headless Chromium instance injects a detection probe on page load.
2. If `window.__HTML_MOTION_STUDIO__` is present, the renderer loops through $k = 0 \dots N-1$, where $N = \text{duration} \times \text{FPS}$.
3. For each frame, it evaluates:
   ```javascript
   await window.__HTML_MOTION_STUDIO__.seek(k / fps);
   if (window.__HTML_MOTION_STUDIO__.renderFrame) {
     await window.__HTML_MOTION_STUDIO__.renderFrame(k / fps);
   }
   ```
4. This guarantees mathematical frame accuracy regardless of machine load, eliminating dropped frames or timing drift.

---

### Strategy B: Compatibility Rendering
Ordinary HTML projects often use standard CSS `@keyframes`, transitions, or simple `requestAnimationFrame` loops that do not expose custom adapters.

#### How Strategy B Operates:
1. The engine injects synthetic animation clock hooks:
   - Queries `document.getAnimations()` and synchronizes `anim.currentTime = timeSeconds * 1000`.
   - Synchronizes `<video>` and `<audio>` DOM elements via `video.currentTime = timeSeconds`.
   - Increments virtual clock variable `window.__HMS_VIRTUAL_TIME__`.
2. Each frame is allowed a 16ms paint flush before `webContents.capturePage()` snapshots the pixels.
3. This mode offers maximum compatibility across arbitrary web animations, while honestly indicating that uninstrumented non-deterministic scripts (e.g. `Math.random()`, unseeded physics engines) cannot guarantee identical runs.

---

## 2. FFmpeg Pipeline & Bounded Streaming

Rather than holding thousands of uncompressed 4K raw RGBA pixel buffers in system RAM (which would trigger out-of-memory crashes on 16GB or 32GB systems), the engine uses a bounded disk buffer:

```
[Chromium Offscreen Page]
        │
        ▼ (capturePage)
[NativeImage PNG Buffer]
        │
        ▼
[Temporary Frames Directory: /tmp/hms_workspaces/job_xyz/frame_%05d.png]
        │
        ▼ (Sequential Image2 Demuxer)
[FFmpeg Process: -start_number 1 -framerate 60 -f image2]
        │
        ├──► Video Filter: scale=1920:1080, format=yuv420p
        ├──► Encoder: libx264 -crf 18 -preset medium
        ├──► Audio Filter: -af "volume=1.0,adelay=500|500,afade=t=in:ss=0:d=0.5"
        └──► Output: /Users/user/Videos/export.mp4 (-movflags +faststart)
```

### Video Codec Matrix
- **MP4 Container**: `libx264` codec, `yuv420p` pixel format, high profile, level 4.2/5.1 (resolution adaptive).
- **WebM Container**: `libvpx-vp9` codec, `yuva420p` pixel format with alpha transparency support.
- **Apple ProRes MOV**: `prores_ks` codec, profile 4 (ProRes 4444) for professional timeline editing in Final Cut Pro and DaVinci Resolve.

### Audio Synchronization & Filters
When soundtrack audio is attached, the FFmpeg pipeline constructs a unified audio filter graph:
1. **Gain Adjustment**: `-af "volume=X"`
2. **Start Delay**: `-af "adelay=X|X"` (millisecond precision for stereo)
3. **Fade Curves**: `-af "afade=t=in:ss=0:d=X,afade=t=out:st=Y:d=Z"`
4. **Duration Match**: Enforces strict `-t duration` to guarantee exact synchronization with the video stream.

---

## 3. Resource Cleanup & Cancellation

1. **Automatic Disposal**: Upon completion of encoding, the temporary frames directory (`job_...`) is deleted immediately via `fs.rmSync(dir, { recursive: true, force: true })`.
2. **Cancellation Handling**: Clicking **"Cancel"** sends `SIGTERM` to the active FFmpeg child process, closes the hidden offscreen Chromium window, and purges any intermediate frame files on disk.

