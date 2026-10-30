# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: responsiveAndInteractions.spec.ts >> HTML Motion Studio Web — Interactive Controls & State Validation >> Audio source modes toggle controls gracefully
- Location: tests/e2e/responsiveAndInteractions.spec.ts:116:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Attach MP3 or WAV Audio Track')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('text=Attach MP3 or WAV Audio Track') with timeout 5000ms
  - waiting for locator('text=Attach MP3 or WAV Audio Track')

```

```yaml
- banner:
  - link "HTML Motion Studio Web In-Browser HTML Animation Converter":
    - /url: /
    - text: HTML Motion Studio Web
    - paragraph: In-Browser HTML Animation Converter
  - navigation:
    - link "Guide & FAQ":
      - /url: /tools/html-to-mp4
    - link "Desktop App":
      - /url: "#desktop-download"
    - text: 100% Client-Side Privacy
- main:
  - text: HTML Motion Studio Web Converter
  - heading "Convert HTML Animations Into Videos — Right in Your Browser." [level=1]
  - paragraph: Import an HTML animation, preview it, add audio, and export a video without installing desktop software.
  - text: 100% Client-Side Privacy WebCodecs Hardware Acceleration ZIP Archives & Audio Mixing
  - heading "2. CSS Keyframe Motion" [level=2]
  - button "Rename project"
  - text: "Unsaved Edits Code Workspace index.html Self-contained Target Duration: 4s"
  - button "New Project"
  - button "Reset"
  - text: Isolated Sandbox 16:9 • 1920×1080
  - button "Scale preview to fit": fit
  - button "Scale preview to 50%": 50%
  - button "Scale preview to 75%": 75%
  - button "Scale preview to 100%": 100%
  - button "Toggle Fullscreen"
  - iframe
  - button "Pause Animation"
  - button "Restart Animation"
  - button "Reload sandbox context"
  - text: 0.0s / 4.0s Live Active 30 FPS
  - button "Test Projects (12)"
  - button "Single HTML"
  - button "ZIP Package"
  - button "Code Editor"
  - text: Select Built-in Test Suite Template 12 templates covering CSS, Canvas, rAF & Audio
  - button "1. Static HTML Banner Basic Clean typographic layout with static elements and gradient background. 3s runtime ● ready":
    - text: 1. Static HTML Banner Basic
    - paragraph: Clean typographic layout with static elements and gradient background.
    - text: 3s runtime ● ready
  - button "2. CSS Keyframe Motion CSS Motion Pulsing rings, floating cards, and looping glowing keyframe gradient. 4s runtime ● ready":
    - text: 2. CSS Keyframe Motion CSS Motion
    - paragraph: Pulsing rings, floating cards, and looping glowing keyframe gradient.
    - text: 4s runtime ● ready
  - button "3. CSS Transition Sequencing CSS Motion Dynamic CSS transitions with auto-triggering sequence classes. 5s runtime ● ready":
    - text: 3. CSS Transition Sequencing CSS Motion
    - paragraph: Dynamic CSS transitions with auto-triggering sequence classes.
    - text: 5s runtime ● ready
  - button "4. requestAnimationFrame Kinetic Motion JavaScript Motion Real-time mathematical wave oscillation driven by requestAnimationFrame. 5s runtime ● ready":
    - text: 4. requestAnimationFrame Kinetic Motion JavaScript Motion
    - paragraph: Real-time mathematical wave oscillation driven by requestAnimationFrame.
    - text: 5s runtime ● ready
  - button "5. SVG Vector Path & Stroke Animation Vector Graphics SVG geometric morphing, dasharray drawing, and animated gradient fills. 4s runtime ● ready":
    - text: 5. SVG Vector Path & Stroke Animation Vector Graphics
    - paragraph: SVG geometric morphing, dasharray drawing, and animated gradient fills.
    - text: 4s runtime ● ready
  - button "6. HTML5 Canvas Dynamic Particle System Canvas 2D Explosive particle physics simulation in native HTML5 2D canvas. 5s runtime ● ready":
    - text: 6. HTML5 Canvas Dynamic Particle System Canvas 2D
    - paragraph: Explosive particle physics simulation in native HTML5 2D canvas.
    - text: 5s runtime ● ready
  - button "7. Local Embedded Images & Assets Assets Inline data URI images and assets animated across the frame. 4s runtime ● ready":
    - text: 7. Local Embedded Images & Assets Assets
    - paragraph: Inline data URI images and assets animated across the frame.
    - text: 4s runtime ● ready
  - button "8. Local Typography & Font Face Typography Custom CSS typography styling, tracking animations, and bold titles. 4s runtime ● ready":
    - text: 8. Local Typography & Font Face Typography
    - paragraph: Custom CSS typography styling, tracking animations, and bold titles.
    - text: 4s runtime ● ready
  - button "9. External Resources & CDN Notice Warnings Demonstrates compatibility warnings triggered by external CDN URLs. 4s runtime ● limited":
    - text: 9. External Resources & CDN Notice Warnings
    - paragraph: Demonstrates compatibility warnings triggered by external CDN URLs.
    - text: 4s runtime ● limited
  - button "10. Audio Synced Visualizer Audio Animated equalizer bars ready to sync with background music track. 5s runtime ● ready":
    - text: 10. Audio Synced Visualizer Audio
    - paragraph: Animated equalizer bars ready to sync with background music track.
    - text: 5s runtime ● ready
  - button "11. Long-Running Animation (15s) Duration Extended progression bar and timer to test longer browser encoding. 15s runtime ● ready":
    - text: 11. Long-Running Animation (15s) Duration
    - paragraph: Extended progression bar and timer to test longer browser encoding.
    - text: 15s runtime ● ready
  - button "12. Unsupported / Heavy WebGL Scene Desktop Recommended Heavy WebGL context trigger testing Desktop App recommendation prompt. 5s runtime ● desktop-recommended":
    - text: 12. Unsupported / Heavy WebGL Scene Desktop Recommended
    - paragraph: Heavy WebGL context trigger testing Desktop App recommendation prompt.
    - text: 5s runtime ● desktop-recommended
  - heading "Compatibility Inspector" [level=3]
  - paragraph: Project is ready for browser-based video conversion.
  - text: Ready for export
  - button
  - heading "Output Encoding Settings" [level=3]
  - paragraph: Configure format container, frame rate, aspect ratio, and bitrates
  - text: "Engine:"
  - combobox:
    - option "Auto (Best for Device)" [selected]
    - option "WebCodecs + MP4 Muxer"
    - option "MediaRecorder Stream"
  - text: Aspect Ratio
  - button "16:9 Landscape"
  - button "9:16 Story/Reels"
  - button "1:1 Square"
  - button "4:5 Portrait"
  - button "Custom Pixels"
  - text: Resolution
  - button "720p"
  - button "1080p"
  - button "1440p"
  - button "4k"
  - text: Framerate (FPS)
  - button "24 FPS"
  - button "30 FPS"
  - button "60 FPS"
  - text: Video Format Container
  - button "MP4 (H.264 / AAC) Universal compatibility for social media and video players Recommended"
  - button "WebM (VP9 / Opus) Open web format with high compression efficiency Fallback"
  - text: Duration Policy
  - button "Animation"
  - button "Audio Track"
  - button "Custom"
  - text: Export Timeline Duration 4.0 seconds (120 frames)
  - slider: "4"
  - text: "1.0s Safeguard max: 60s for in-browser memory 60.0s Video Bitrate (8 Mbps)"
  - slider: "8"
  - text: Export Filename
  - textbox: motion-studio-export
  - text: .mp4
  - heading "Audio Soundtrack Engine" [level=3]
  - paragraph: Upload external background score or configure animation audio
  - button "No Audio"
  - button "External Score"
  - button "HTML Only"
  - button "Mix Both"
  - text: Select Audio Track (MP3, WAV, M4A)
  - paragraph: Decoded client-side via Web Audio API for precise video muxing
  - text: "Memory Estimate: ~79 MB 120 frames @ 30fps"
  - button "Convert HTML to MP4 Video"
  - text: Zero server upload • Rendered locally in your browser memory Companion Professional Suite
  - heading "Need High-Resolution, Frame-Accurate Rendering?" [level=2]
  - paragraph:
    - strong: HTML Motion Studio Web
    - text: is built for instant browser conversions. For long animations, 4K/60fps master exports, complex WebGL/Three.js scenes, and alpha transparency, download
    - strong: HTML Motion Studio Desktop
    - text: for macOS and Windows.
  - link "Download Desktop App":
    - /url: https://htmlmotionstudio.tashanto.com/download
  - button "Compare Web vs. Desktop Editions"
  - text: "Recommended for Desktop: Animations longer than 60 seconds Deterministic frame-by-frame stepping Apple ProRes 4444 & Alpha transparency Large multi-gigabyte ZIP projects"
  - heading "How to Convert HTML Animations to MP4 Video" [level=2]
  - paragraph: A seamless 5-step browser workflow designed for motion designers and frontend developers.
  - text: "1"
  - heading "Import HTML or ZIP Archive" [level=3]
  - paragraph: Upload a single HTML file, paste code into the live editor, or drag-and-drop a ZIP project with linked CSS, JS, SVG, and image assets.
  - text: "2"
  - heading "Preview & Mix Audio" [level=3]
  - paragraph: Inspect your motion in real time inside our isolated sandbox. Attach an MP3 or WAV soundtrack with volume controls and fade curves.
  - text: "3"
  - heading "Export & Download MP4" [level=3]
  - paragraph: Select your aspect ratio (9:16, 16:9, 1:1) and resolution. The browser encodes the video stream and delivers an instant download.
  - heading "Zero Server Uploads — 100% Private Client Execution" [level=3]
  - paragraph: Your animations and media assets never leave your computer
  - paragraph: Unlike legacy video converters that transmit your proprietary HTML code, stylesheets, and graphic assets to third-party rendering farms, HTML Motion Studio Web executes exclusively inside your local browser runtime. Memory structures are cleared immediately upon download.
  - heading "Frequently Asked Questions" [level=2]
  - paragraph: Everything you need to know about browser HTML-to-MP4 video conversion.
  - button "How does HTML Motion Studio Web convert HTML to video inside the browser?"
  - button "Are my HTML animations, images, or audio tracks uploaded to an external server?"
  - button "What is the maximum animation duration supported in the browser?"
  - button "Can I import ZIP projects with multiple CSS, JS, and image assets?"
  - button "How do I add background audio or music to my video?"
  - button "When should I use HTML Motion Studio Desktop instead of the Web version?"
- contentinfo:
  - paragraph: © 2026 HTML Motion Studio. All processing performed locally in your browser.
  - link "HTML to MP4 Converter":
    - /url: /tools/html-to-mp4
  - text: •
  - link "Desktop App":
    - /url: "#desktop-download"
- alert
```

# Test source

```ts
  19  | ];
  20  | 
  21  | test.describe('HTML Motion Studio Web — Multi-Viewport Responsive Validation', () => {
  22  |   for (const vp of VIEWPORTS) {
  23  |     test(`Verify layout at ${vp.name} (${vp.width}x${vp.height}) with zero horizontal overflow`, async ({ page }) => {
  24  |       await page.setViewportSize({ width: vp.width, height: vp.height });
  25  |       await page.goto('/');
  26  | 
  27  |       // Wait for page hydration
  28  |       await expect(page.locator('h1')).toBeVisible();
  29  |       await expect(page.locator('iframe[title="HTML Animation Preview"]')).toBeVisible();
  30  | 
  31  |       // Check no unintended horizontal scrolling
  32  |       const overflow = await page.evaluate(() => {
  33  |         const scrollWidth = document.documentElement.scrollWidth;
  34  |         const innerWidth = window.innerWidth;
  35  |         return {
  36  |           scrollWidth,
  37  |           innerWidth,
  38  |           hasOverflow: scrollWidth > innerWidth + 1, // 1px tolerance for subpixel rounding
  39  |         };
  40  |       });
  41  | 
  42  |       expect(overflow.hasOverflow).toBe(false);
  43  | 
  44  |       // Verify essential UI sections are rendered and visible
  45  |       await expect(page.locator('nav')).toBeVisible();
  46  |       await expect(page.getByRole('button', { name: /Convert HTML to/i })).toBeVisible();
  47  | 
  48  |       // Capture screenshot for visual inspection
  49  |       const sanitizedName = vp.name.toLowerCase().replace(/\s+/g, '-');
  50  |       await page.screenshot({
  51  |         path: path.join(SCREENSHOT_DIR, `web-home-${sanitizedName}-${vp.width}x${vp.height}.png`),
  52  |         fullPage: false,
  53  |       });
  54  |     });
  55  |   }
  56  | });
  57  | 
  58  | test.describe('HTML Motion Studio Web — Interactive Controls & State Validation', () => {
  59  |   test.beforeEach(async ({ page }) => {
  60  |     await page.setViewportSize({ width: 1280, height: 800 });
  61  |     await page.goto('/');
  62  |   });
  63  | 
  64  |   test('UploadZone tab switching works smoothly without errors', async ({ page }) => {
  65  |     // 1. Single HTML tab
  66  |     await page.locator('button:has-text("Single HTML")').click();
  67  |     await expect(page.locator('text=Drop your .html file here')).toBeVisible();
  68  | 
  69  |     // 2. ZIP Package tab
  70  |     await page.locator('button:has-text("ZIP Package")').click();
  71  |     await expect(page.locator('text=Drop your project .zip archive here')).toBeVisible();
  72  | 
  73  |     // 3. Code Editor tab
  74  |     await page.locator('button:has-text("Code Editor")').click();
  75  |     await expect(page.locator('textarea')).toBeVisible();
  76  | 
  77  |     // 4. Test Projects tab
  78  |     await page.locator('button:has-text("Test Projects")').click();
  79  |     await expect(page.locator('button:has-text("2. CSS Keyframe Motion")')).toBeVisible();
  80  |   });
  81  | 
  82  |   test('Aspect ratio selector updates dimensions and preview container', async ({ page }) => {
  83  |     // Select 9:16 Story/Reels
  84  |     await page.locator('button:has-text("9:16")').click();
  85  |     await expect(page.locator('text=720×1280')).toBeVisible();
  86  | 
  87  |     // Select 1:1 Square
  88  |     await page.locator('button:has-text("1:1")').click();
  89  |     await expect(page.locator('text=1080×1080')).toBeVisible();
  90  | 
  91  |     // Select Custom and change dimensions
  92  |     await page.locator('button:has-text("Custom")').click();
  93  |     const widthInput = page.locator('input[type="number"]').first();
  94  |     await widthInput.fill('1600');
  95  |     await expect(page.locator('text=1600×')).toBeVisible();
  96  | 
  97  |     // Restore 16:9
  98  |     await page.locator('button:has-text("16:9")').click();
  99  |     await expect(page.locator('text=1920×1080')).toBeVisible();
  100 |   });
  101 | 
  102 |   test('Resolution and FPS presets update export settings properly', async ({ page }) => {
  103 |     // Switch to 720p
  104 |     await page.getByRole('button', { name: '720p', exact: true }).click();
  105 |     await expect(page.locator('text=1280×720')).toBeVisible();
  106 | 
  107 |     // Switch FPS to 30
  108 |     await page.getByRole('button', { name: '30 FPS', exact: true }).click();
  109 |     await expect(page.locator('text=30 FPS Target')).toBeVisible();
  110 | 
  111 |     // Switch FPS to 60
  112 |     await page.getByRole('button', { name: '60 FPS', exact: true }).click();
  113 |     await expect(page.locator('text=60 FPS Target')).toBeVisible();
  114 |   });
  115 | 
  116 |   test('Audio source modes toggle controls gracefully', async ({ page }) => {
  117 |     // Switch to External Score
  118 |     await page.getByRole('button', { name: 'External Score', exact: true }).click();
> 119 |     await expect(page.locator('text=Attach MP3 or WAV Audio Track')).toBeVisible();
      |                                                                      ^ Error: expect(locator).toBeVisible() failed
  120 | 
  121 |     // Switch to No Audio
  122 |     await page.getByRole('button', { name: 'No Audio', exact: true }).click();
  123 |     await expect(page.locator('text=Attach MP3 or WAV Audio Track')).not.toBeVisible();
  124 |   });
  125 | 
  126 |   test('Dedicated SEO route /tools/html-to-mp4 renders cleanly without overflow', async ({ page }) => {
  127 |     for (const vp of [
  128 |       { name: 'Mobile', width: 375, height: 812 },
  129 |       { name: 'Desktop', width: 1440, height: 900 },
  130 |     ]) {
  131 |       await page.setViewportSize({ width: vp.width, height: vp.height });
  132 |       await page.goto('/tools/html-to-mp4');
  133 |       await expect(page.locator('h1')).toContainText('HTML to MP4 Video Converter');
  134 | 
  135 |       const overflow = await page.evaluate(() => {
  136 |         return document.documentElement.scrollWidth > window.innerWidth + 1;
  137 |       });
  138 |       expect(overflow).toBe(false);
  139 | 
  140 |       await page.screenshot({
  141 |         path: path.join(SCREENSHOT_DIR, `web-seo-tool-${vp.name.toLowerCase()}-${vp.width}x${vp.height}.png`),
  142 |       });
  143 |     }
  144 |   });
  145 | });
  146 | 
```