# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: responsiveAndInteractions.spec.ts >> HTML Motion Studio Web — Interactive Controls & State Validation >> UploadZone tab switching works smoothly without errors
- Location: tests/e2e/responsiveAndInteractions.spec.ts:64:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Drop your .html file here')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('text=Drop your .html file here') with timeout 5000ms
  - waiting for locator('text=Drop your .html file here')

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
  - text: "Pristine Single HTML index.html Self-contained Target Duration: 4s"
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
  - heading "Drop your HTML file here or browse" [level=4]
  - paragraph: Supports standard HTML files with inline styles, keyframes, SVG, or embedded scripts.
  - text: "Maximum file size: 50MB • All processing remains local in-browser"
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
  1   | import { test, expect } from '@playwright/test';
  2   | import * as fs from 'fs';
  3   | import * as path from 'path';
  4   | 
  5   | const SCREENSHOT_DIR = path.resolve(process.cwd(), 'test-output/screenshots');
  6   | if (!fs.existsSync(SCREENSHOT_DIR)) {
  7   |   fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  8   | }
  9   | 
  10  | const VIEWPORTS = [
  11  |   { name: 'Small Mobile', width: 320, height: 700 },
  12  |   { name: 'Mobile', width: 375, height: 812 },
  13  |   { name: 'Large Mobile', width: 430, height: 932 },
  14  |   { name: 'Small Tablet', width: 768, height: 1024 },
  15  |   { name: 'Tablet', width: 1024, height: 768 },
  16  |   { name: 'Laptop', width: 1280, height: 800 },
  17  |   { name: 'Desktop', width: 1440, height: 900 },
  18  |   { name: 'Large Desktop', width: 1920, height: 1080 },
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
> 67  |     await expect(page.locator('text=Drop your .html file here')).toBeVisible();
      |                                                                  ^ Error: expect(locator).toBeVisible() failed
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
  119 |     await expect(page.locator('text=Attach MP3 or WAV Audio Track')).toBeVisible();
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