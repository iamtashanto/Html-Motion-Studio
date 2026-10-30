# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: responsiveAndInteractions.spec.ts >> HTML Motion Studio Web — Multi-Viewport Responsive Validation >> Verify layout at Large Mobile (430x932) with zero horizontal overflow
- Location: tests/e2e/responsiveAndInteractions.spec.ts:23:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: /Convert HTML to/i })
Expected: visible
Error: strict mode violation: getByRole('button', { name: /Convert HTML to/i }) resolved to 2 elements:
    1) <button class="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-sm sm:text-base tracking-wide shadow-xl shadow-blue-500/25 flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group">…</button> aka getByRole('button', { name: 'Convert HTML to MP4 Video' })
    2) <button class="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-200 hover:text-white">…</button> aka getByRole('button', { name: 'How does HTML Motion Studio' })

Call log:
  - Expect "toBeVisible" getByRole('button', { name: /Convert HTML to/i }) with timeout 5000ms
  - waiting for getByRole('button', { name: /Convert HTML to/i })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "HTML Motion Studio Web" [ref=e4] [cursor=pointer]:
        - /url: /
        - generic [ref=e10]:
          - generic [ref=e11]: HTML Motion Studio
          - generic [ref=e12]: Web
      - navigation [ref=e13]:
        - link "Guide & FAQ" [ref=e14] [cursor=pointer]:
          - /url: /tools/html-to-mp4
        - link [ref=e15] [cursor=pointer]:
          - /url: "#desktop-download"
  - main [ref=e23]:
    - generic [ref=e24]:
      - generic [ref=e25]:
        - generic [ref=e26]: HTML Motion Studio Web Converter
        - heading "Convert HTML Animations Into Videos — Right in Your Browser." [level=1] [ref=e30]
        - paragraph [ref=e31]: Import an HTML animation, preview it, add audio, and export a video without installing desktop software.
        - generic [ref=e32]:
          - generic [ref=e33]: 100% Client-Side Privacy
          - generic [ref=e37]: WebCodecs Hardware Acceleration
          - generic [ref=e41]: ZIP Archives & Audio Mixing
      - generic [ref=e46]:
        - generic [ref=e47]:
          - generic [ref=e48]:
            - generic [ref=e49]:
              - generic [ref=e50]:
                - heading "2. CSS Keyframe Motion" [level=2] [ref=e51]
                - button "Rename project" [ref=e52] [cursor=pointer]
              - generic [ref=e55]: Pristine
            - generic [ref=e57]:
              - generic [ref=e58]: Code Workspace
              - generic [ref=e63]: index.html
              - generic [ref=e67]: Self-contained
              - generic [ref=e68]: "Target Duration: 4s"
          - generic [ref=e69]:
            - button "New Project" [ref=e70] [cursor=pointer]
            - button "Reset" [ref=e74] [cursor=pointer]
        - generic [ref=e79]:
          - generic [ref=e80]:
            - generic [ref=e81]:
              - generic [ref=e82]:
                - generic [ref=e83]: Isolated Sandbox
                - generic [ref=e92]:
                  - generic [ref=e93]:
                    - button "Scale preview to fit" [ref=e94] [cursor=pointer]: fit
                    - button "Scale preview to 50%" [ref=e95] [cursor=pointer]: 50%
                    - button "Scale preview to 75%" [ref=e96] [cursor=pointer]: 75%
                    - button "Scale preview to 100%" [ref=e97] [cursor=pointer]: 100%
                  - button "Toggle Fullscreen" [ref=e98] [cursor=pointer]
              - iframe [ref=e106]:
                - heading "Smooth CSS Keyframes" [level=2] [ref=f1e6]
              - generic [ref=e107]:
                - generic [ref=e108]:
                  - button "Pause Animation" [ref=e109] [cursor=pointer]
                  - button "Restart Animation" [ref=e113] [cursor=pointer]
                  - button "Reload sandbox context" [ref=e117] [cursor=pointer]
                  - generic [ref=e123]:
                    - generic [ref=e124]: 0.0s
                    - text: /
                    - generic [ref=e125]: 4.0s
                - generic [ref=e126]:
                  - generic [ref=e127]: Live Active
                  - generic [ref=e131]: 30 FPS
            - generic [ref=e132]:
              - generic [ref=e133]:
                - button "Test Projects (12)" [ref=e134] [cursor=pointer]
                - button "Single HTML" [ref=e138] [cursor=pointer]
                - button "ZIP Package" [ref=e144] [cursor=pointer]
                - button "Code Editor" [ref=e148] [cursor=pointer]
              - generic [ref=e154]:
                - generic [ref=e155]:
                  - generic [ref=e156]: Select Built-in Test Suite Template
                  - generic [ref=e157]: 12 templates covering CSS, Canvas, rAF & Audio
                - generic [ref=e158]:
                  - button "1. Static HTML Banner Basic Clean typographic layout with static elements and gradient background. 3s runtime ● ready" [ref=e159] [cursor=pointer]:
                    - generic [ref=e160]:
                      - generic [ref=e161]: 1. Static HTML Banner
                      - generic [ref=e162]: Basic
                    - paragraph [ref=e163]: Clean typographic layout with static elements and gradient background.
                    - generic [ref=e164]:
                      - generic [ref=e165]: 3s runtime
                      - generic [ref=e166]: ● ready
                  - button "2. CSS Keyframe Motion CSS Motion Pulsing rings, floating cards, and looping glowing keyframe gradient. 4s runtime ● ready" [ref=e167] [cursor=pointer]:
                    - generic [ref=e168]:
                      - generic [ref=e169]: 2. CSS Keyframe Motion
                      - generic [ref=e170]: CSS Motion
                    - paragraph [ref=e171]: Pulsing rings, floating cards, and looping glowing keyframe gradient.
                    - generic [ref=e172]:
                      - generic [ref=e173]: 4s runtime
                      - generic [ref=e174]: ● ready
                  - button "3. CSS Transition Sequencing CSS Motion Dynamic CSS transitions with auto-triggering sequence classes. 5s runtime ● ready" [ref=e175] [cursor=pointer]:
                    - generic [ref=e176]:
                      - generic [ref=e177]: 3. CSS Transition Sequencing
                      - generic [ref=e178]: CSS Motion
                    - paragraph [ref=e179]: Dynamic CSS transitions with auto-triggering sequence classes.
                    - generic [ref=e180]:
                      - generic [ref=e181]: 5s runtime
                      - generic [ref=e182]: ● ready
                  - button "4. requestAnimationFrame Kinetic Motion JavaScript Motion Real-time mathematical wave oscillation driven by requestAnimationFrame. 5s runtime ● ready" [ref=e183] [cursor=pointer]:
                    - generic [ref=e184]:
                      - generic [ref=e185]: 4. requestAnimationFrame Kinetic Motion
                      - generic [ref=e186]: JavaScript Motion
                    - paragraph [ref=e187]: Real-time mathematical wave oscillation driven by requestAnimationFrame.
                    - generic [ref=e188]:
                      - generic [ref=e189]: 5s runtime
                      - generic [ref=e190]: ● ready
                  - button "5. SVG Vector Path & Stroke Animation Vector Graphics SVG geometric morphing, dasharray drawing, and animated gradient fills. 4s runtime ● ready" [ref=e191] [cursor=pointer]:
                    - generic [ref=e192]:
                      - generic [ref=e193]: 5. SVG Vector Path & Stroke Animation
                      - generic [ref=e194]: Vector Graphics
                    - paragraph [ref=e195]: SVG geometric morphing, dasharray drawing, and animated gradient fills.
                    - generic [ref=e196]:
                      - generic [ref=e197]: 4s runtime
                      - generic [ref=e198]: ● ready
                  - button "6. HTML5 Canvas Dynamic Particle System Canvas 2D Explosive particle physics simulation in native HTML5 2D canvas. 5s runtime ● ready" [ref=e199] [cursor=pointer]:
                    - generic [ref=e200]:
                      - generic [ref=e201]: 6. HTML5 Canvas Dynamic Particle System
                      - generic [ref=e202]: Canvas 2D
                    - paragraph [ref=e203]: Explosive particle physics simulation in native HTML5 2D canvas.
                    - generic [ref=e204]:
                      - generic [ref=e205]: 5s runtime
                      - generic [ref=e206]: ● ready
                  - button "7. Local Embedded Images & Assets Assets Inline data URI images and assets animated across the frame. 4s runtime ● ready" [ref=e207] [cursor=pointer]:
                    - generic [ref=e208]:
                      - generic [ref=e209]: 7. Local Embedded Images & Assets
                      - generic [ref=e210]: Assets
                    - paragraph [ref=e211]: Inline data URI images and assets animated across the frame.
                    - generic [ref=e212]:
                      - generic [ref=e213]: 4s runtime
                      - generic [ref=e214]: ● ready
                  - button "8. Local Typography & Font Face Typography Custom CSS typography styling, tracking animations, and bold titles. 4s runtime ● ready" [ref=e215] [cursor=pointer]:
                    - generic [ref=e216]:
                      - generic [ref=e217]: 8. Local Typography & Font Face
                      - generic [ref=e218]: Typography
                    - paragraph [ref=e219]: Custom CSS typography styling, tracking animations, and bold titles.
                    - generic [ref=e220]:
                      - generic [ref=e221]: 4s runtime
                      - generic [ref=e222]: ● ready
                  - button "9. External Resources & CDN Notice Warnings Demonstrates compatibility warnings triggered by external CDN URLs. 4s runtime ● limited" [ref=e223] [cursor=pointer]:
                    - generic [ref=e224]:
                      - generic [ref=e225]: 9. External Resources & CDN Notice
                      - generic [ref=e226]: Warnings
                    - paragraph [ref=e227]: Demonstrates compatibility warnings triggered by external CDN URLs.
                    - generic [ref=e228]:
                      - generic [ref=e229]: 4s runtime
                      - generic [ref=e230]: ● limited
                  - button "10. Audio Synced Visualizer Audio Animated equalizer bars ready to sync with background music track. 5s runtime ● ready" [ref=e231] [cursor=pointer]:
                    - generic [ref=e232]:
                      - generic [ref=e233]: 10. Audio Synced Visualizer
                      - generic [ref=e234]: Audio
                    - paragraph [ref=e235]: Animated equalizer bars ready to sync with background music track.
                    - generic [ref=e236]:
                      - generic [ref=e237]: 5s runtime
                      - generic [ref=e238]: ● ready
                  - button "11. Long-Running Animation (15s) Duration Extended progression bar and timer to test longer browser encoding. 15s runtime ● ready" [ref=e239] [cursor=pointer]:
                    - generic [ref=e240]:
                      - generic [ref=e241]: 11. Long-Running Animation (15s)
                      - generic [ref=e242]: Duration
                    - paragraph [ref=e243]: Extended progression bar and timer to test longer browser encoding.
                    - generic [ref=e244]:
                      - generic [ref=e245]: 15s runtime
                      - generic [ref=e246]: ● ready
                  - button "12. Unsupported / Heavy WebGL Scene Desktop Recommended Heavy WebGL context trigger testing Desktop App recommendation prompt. 5s runtime ● desktop-recommended" [ref=e247] [cursor=pointer]:
                    - generic [ref=e248]:
                      - generic [ref=e249]: 12. Unsupported / Heavy WebGL Scene
                      - generic [ref=e250]: Desktop Recommended
                    - paragraph [ref=e251]: Heavy WebGL context trigger testing Desktop App recommendation prompt.
                    - generic [ref=e252]:
                      - generic [ref=e253]: 5s runtime
                      - generic [ref=e254]: ● desktop-recommended
            - generic [ref=e256]:
              - generic [ref=e262]:
                - heading "Compatibility Inspector" [level=3] [ref=e263]
                - paragraph [ref=e264]: Project is ready for browser-based video conversion.
              - generic [ref=e265]:
                - generic [ref=e266]: Ready for export
                - button [ref=e271] [cursor=pointer]
          - generic [ref=e274]:
            - generic [ref=e275]:
              - generic [ref=e276]:
                - generic [ref=e282]:
                  - heading "Output Encoding Settings" [level=3] [ref=e283]
                  - paragraph [ref=e284]: Configure format container, frame rate, aspect ratio, and bitrates
                - generic [ref=e285]:
                  - generic [ref=e286]: "Engine:"
                  - combobox [ref=e287]:
                    - option "Auto (Best for Device)" [selected]
                    - option "WebCodecs + MP4 Muxer"
                    - option "MediaRecorder Stream"
              - generic [ref=e288]:
                - generic [ref=e289]:
                  - generic [ref=e290]: Aspect Ratio
                  - generic [ref=e294]:
                    - button "16:9 Landscape" [ref=e295] [cursor=pointer]:
                      - generic [ref=e296]: 16:9
                      - generic [ref=e297]: Landscape
                    - button "9:16 Story/Reels" [ref=e298] [cursor=pointer]:
                      - generic [ref=e299]: 9:16
                      - generic [ref=e300]: Story/Reels
                    - button "1:1 Square" [ref=e301] [cursor=pointer]:
                      - generic [ref=e302]: 1:1
                      - generic [ref=e303]: Square
                    - button "4:5 Portrait" [ref=e304] [cursor=pointer]:
                      - generic [ref=e305]: 4:5
                      - generic [ref=e306]: Portrait
                    - button "Custom Pixels" [ref=e307] [cursor=pointer]:
                      - generic [ref=e308]: Custom
                      - generic [ref=e309]: Pixels
                - generic [ref=e310]:
                  - generic [ref=e311]:
                    - generic [ref=e312]: Resolution
                    - generic [ref=e315]:
                      - button "720p" [ref=e316] [cursor=pointer]
                      - button "1080p" [ref=e317] [cursor=pointer]
                      - button "1440p" [ref=e318] [cursor=pointer]
                      - button "4k" [ref=e319] [cursor=pointer]
                  - generic [ref=e320]:
                    - generic [ref=e321]: Framerate (FPS)
                    - generic [ref=e324]:
                      - button "24 FPS" [ref=e325] [cursor=pointer]
                      - button "30 FPS" [ref=e326] [cursor=pointer]
                      - button "60 FPS" [ref=e327] [cursor=pointer]
                - generic [ref=e328]:
                  - generic [ref=e329]: Video Format Container
                  - generic [ref=e334]:
                    - button "MP4 (H.264 / AAC) Universal compatibility for social media and video players Recommended" [ref=e335] [cursor=pointer]:
                      - generic [ref=e336]:
                        - generic [ref=e337]: MP4 (H.264 / AAC)
                        - generic [ref=e338]: Universal compatibility for social media and video players
                      - generic [ref=e339]: Recommended
                    - button "WebM (VP9 / Opus) Open web format with high compression efficiency Fallback" [ref=e340] [cursor=pointer]:
                      - generic [ref=e341]:
                        - generic [ref=e342]: WebM (VP9 / Opus)
                        - generic [ref=e343]: Open web format with high compression efficiency
                      - generic [ref=e344]: Fallback
                - generic [ref=e345]:
                  - generic [ref=e346]:
                    - generic [ref=e347]: Duration Policy
                    - generic [ref=e351]:
                      - button "Animation" [ref=e352] [cursor=pointer]
                      - button "Audio Track" [ref=e353] [cursor=pointer]
                      - button "Custom" [ref=e354] [cursor=pointer]
                  - generic [ref=e355]:
                    - generic [ref=e356]: Export Timeline Duration
                    - generic [ref=e357]: 4.0 seconds (120 frames)
                  - slider [ref=e358] [cursor=pointer]: "4"
                  - generic [ref=e359]:
                    - generic [ref=e360]: 1.0s
                    - generic [ref=e361]: "Safeguard max: 60s for in-browser memory"
                    - generic [ref=e362]: 60.0s
                - generic [ref=e363]:
                  - generic [ref=e364]:
                    - generic [ref=e365]: Video Bitrate (8 Mbps)
                    - slider [ref=e366] [cursor=pointer]: "8"
                  - generic [ref=e367]:
                    - generic [ref=e368]: Export Filename
                    - generic [ref=e369]:
                      - textbox [ref=e370]: motion-studio-export
                      - generic [ref=e371]: .mp4
            - generic [ref=e373]:
              - generic [ref=e380]:
                - heading "Audio Soundtrack Engine" [level=3] [ref=e381]
                - paragraph [ref=e382]: Upload external background score or configure animation audio
              - generic [ref=e383]:
                - button "No Audio" [ref=e384] [cursor=pointer]
                - button "External Score" [ref=e385] [cursor=pointer]
                - button "HTML Only" [ref=e386] [cursor=pointer]
                - button "Mix Both" [ref=e387] [cursor=pointer]
            - generic [ref=e389]:
              - generic [ref=e390]:
                - generic [ref=e391]: "Memory Estimate: ~79 MB"
                - generic [ref=e395]: 120 frames @ 30fps
              - button "Convert HTML to MP4 Video" [ref=e396] [cursor=pointer]
              - generic [ref=e403]: Zero server upload • Rendered locally in your browser memory
        - generic [ref=e409]:
          - generic [ref=e410]:
            - generic [ref=e411]: Companion Professional Suite
            - heading "Need High-Resolution, Frame-Accurate Rendering?" [level=2] [ref=e415]
            - paragraph [ref=e416]:
              - strong [ref=e417]: HTML Motion Studio Web
              - text: is built for instant browser conversions. For long animations, 4K/60fps master exports, complex WebGL/Three.js scenes, and alpha transparency, download
              - strong [ref=e418]: HTML Motion Studio Desktop
              - text: for macOS and Windows.
            - generic [ref=e419]:
              - link "Download Desktop App" [ref=e420] [cursor=pointer]:
                - /url: https://htmlmotionstudio.tashanto.com/download
              - button "Compare Web vs. Desktop Editions" [ref=e427] [cursor=pointer]
          - generic [ref=e428]:
            - generic [ref=e429]: "Recommended for Desktop:"
            - generic [ref=e430]: Animations longer than 60 seconds
            - generic [ref=e432]: Deterministic frame-by-frame stepping
            - generic [ref=e434]: Apple ProRes 4444 & Alpha transparency
            - generic [ref=e436]: Large multi-gigabyte ZIP projects
      - generic [ref=e438]:
        - generic [ref=e439]:
          - generic [ref=e440]:
            - heading "How to Convert HTML Animations to MP4 Video" [level=2] [ref=e441]
            - paragraph [ref=e442]: A seamless 5-step browser workflow designed for motion designers and frontend developers.
          - generic [ref=e443]:
            - generic [ref=e444]:
              - generic [ref=e445]: "1"
              - heading "Import HTML or ZIP Archive" [level=3] [ref=e446]
              - paragraph [ref=e447]: Upload a single HTML file, paste code into the live editor, or drag-and-drop a ZIP project with linked CSS, JS, SVG, and image assets.
            - generic [ref=e448]:
              - generic [ref=e449]: "2"
              - heading "Preview & Mix Audio" [level=3] [ref=e450]
              - paragraph [ref=e451]: Inspect your motion in real time inside our isolated sandbox. Attach an MP3 or WAV soundtrack with volume controls and fade curves.
            - generic [ref=e452]:
              - generic [ref=e453]: "3"
              - heading "Export & Download MP4" [level=3] [ref=e454]
              - paragraph [ref=e455]: Select your aspect ratio (9:16, 16:9, 1:1) and resolution. The browser encodes the video stream and delivers an instant download.
        - generic [ref=e456]:
          - generic [ref=e462]:
            - heading "Zero Server Uploads — 100% Private Client Execution" [level=3] [ref=e463]
            - paragraph [ref=e464]: Your animations and media assets never leave your computer
          - paragraph [ref=e465]: Unlike legacy video converters that transmit your proprietary HTML code, stylesheets, and graphic assets to third-party rendering farms, HTML Motion Studio Web executes exclusively inside your local browser runtime. Memory structures are cleared immediately upon download.
        - generic [ref=e466]:
          - generic [ref=e467]:
            - heading "Frequently Asked Questions" [level=2] [ref=e468]
            - paragraph [ref=e469]: Everything you need to know about browser HTML-to-MP4 video conversion.
          - generic [ref=e470]:
            - button "How does HTML Motion Studio Web convert HTML to video inside the browser?" [ref=e472] [cursor=pointer]
            - button "Are my HTML animations, images, or audio tracks uploaded to an external server?" [ref=e477] [cursor=pointer]
            - button "What is the maximum animation duration supported in the browser?" [ref=e482] [cursor=pointer]
            - button "Can I import ZIP projects with multiple CSS, JS, and image assets?" [ref=e487] [cursor=pointer]
            - button "How do I add background audio or music to my video?" [ref=e492] [cursor=pointer]
            - button "When should I use HTML Motion Studio Desktop instead of the Web version?" [ref=e497] [cursor=pointer]
  - contentinfo [ref=e501]:
    - generic [ref=e502]:
      - paragraph [ref=e503]: © 2026 HTML Motion Studio. All processing performed locally in your browser.
      - generic [ref=e504]:
        - link "HTML to MP4 Converter" [ref=e505] [cursor=pointer]:
          - /url: /tools/html-to-mp4
        - generic [ref=e506]: •
        - link "Desktop App" [ref=e507] [cursor=pointer]:
          - /url: "#desktop-download"
  - alert [ref=e508]
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
> 46  |       await expect(page.getByRole('button', { name: /Convert HTML to/i })).toBeVisible();
      |                                                                            ^ Error: expect(locator).toBeVisible() failed
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