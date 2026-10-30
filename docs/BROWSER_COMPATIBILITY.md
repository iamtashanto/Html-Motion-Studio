# HTML Motion Studio Web — Browser Capability & Compatibility Matrix

This document provides verified compatibility benchmarks and engine capabilities across modern browser engines for client-side HTML-to-video conversion.

---

## 1. Browser Support Matrix

| Browser Engine | Desktop / Mobile | WebCodecs VideoEncoder | AudioEncoder (AAC) | MediaRecorder MP4 | MediaRecorder WebM | Canvas captureStream | Recommended Format | Max Practical Resolution |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Google Chrome (v100+)** | macOS / Windows / Linux | ✅ Yes (`avc1.42001f`, VP9) | ✅ Yes (`mp4a.40.2`) | ⚠️ Partial (v130+) | ✅ Yes (VP8, VP9) | ✅ Yes | **MP4 (H.264)** | 1440p @ 30 FPS |
| **Microsoft Edge (v100+)** | macOS / Windows | ✅ Yes (`avc1`, VP9) | ✅ Yes (`mp4a.40.2`) | ⚠️ Partial | ✅ Yes (VP8, VP9) | ✅ Yes | **MP4 (H.264)** | 1440p @ 30 FPS |
| **Mozilla Firefox (v120+)** | macOS / Windows / Linux | ⚠️ Nightly / Flag | ❌ No | ❌ No | ✅ Yes (VP8, VP9) | ✅ Yes | **WebM (VP9)** | 1080p @ 30 FPS |
| **Apple Safari (v16.4+)** | macOS / iOS | ⚠️ Limited HW | ❌ No | ✅ Yes (`video/mp4;codecs=avc1`) | ⚠️ Partial | ✅ Yes | **MP4 (H.264)** | 1080p @ 30 FPS |

---

## 2. Dynamic Feature Detection vs. User-Agent Sniffing

HTML Motion Studio Web strictly utilizes runtime W3C feature detection APIs rather than fragile user-agent sniffing:

1. **WebCodecs Support**:
   ```typescript
   const isSupported = 'VideoEncoder' in window;
   if (isSupported) {
     const check = await VideoEncoder.isConfigSupported({
       codec: 'avc1.42001f',
       width: 1280,
       height: 720,
       bitrate: 2_500_000,
       framerate: 30,
     });
     // Evaluates genuine hardware encoding availability
   }
   ```

2. **MediaRecorder Container Support**:
   ```typescript
   const canRecordMp4 = MediaRecorder.isTypeSupported('video/mp4;codecs=avc1');
   const canRecordWebm = MediaRecorder.isTypeSupported('video/webm;codecs=vp9');
   ```

3. **Audio Capability Detection**:
   ```typescript
   const canEncodeAac = 'AudioEncoder' in window;
   ```

---

## 3. Engine Selection Fallback Matrix

```
[User initiates conversion]
           │
           ▼
 Is VideoEncoder available and H.264 supported?
     ├── YES ──► Use Strategy C: WebCodecs + MP4 Muxer (Hardware Accelerated)
     │
     └── NO  ──► Is MediaRecorder available?
                   ├── YES ──► Does it support MP4?
                   │             ├── YES ──► Record MP4 stream directly
                   │             └── NO  ──► Record WebM (VP9/Opus) with honest format display
                   │
                   └── NO  ──► Recommend HTML Motion Studio Desktop
```

---

## 4. Technical Constraints in In-Browser Environments

* **Tab Visibility & Background Throttling**:
  Modern browsers throttle `requestAnimationFrame` and `setTimeout` intervals when the user switches tabs. Conversion sessions instruct users to keep the active tab focused until completion.
* **Heap Memory Limits**:
  Browsers impose a 32-bit memory ceiling per tab (typically 1.5 GB to 4 GB depending on OS). Converting animations longer than 60 seconds at 4K resolution can exhaust memory. For extended videos, our companion **HTML Motion Studio Desktop** app provides unconstrained offline rendering.

