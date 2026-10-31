# Microsoft Store Submission Guide — HTML Motion Studio

This guide contains everything required to publish **HTML Motion Studio** on the **Microsoft Store (Windows 10 & 11)** via the **Microsoft Partner Center**.

---

## 1. Prerequisites & Developer Account
1. Visit the [Microsoft Partner Center](https://partner.microsoft.com/dashboard).
2. Sign in with your Microsoft Account.
3. Register as a Windows App Developer (Individual account is a one-time fee of ~$19 USD, no recurring annual subscription).

---

## 2. Reserve Your App Name
1. In Partner Center dashboard, click **Apps & games** > **New product**.
2. Select **MSIX or PWA app** OR **Windows Desktop app (traditional Win32)**.
3. Reserve your app name: `HTML Motion Studio` (or `HTML Motion Studio Pro`).

---

## 3. Two Submission Options (Choose One)

### Option A: Win32 Desktop App (Recommended & Fastest!)
*Microsoft Store now natively allows traditional desktop EXE installers.*
1. **Installer type**: EXE installer.
2. **Architecture**: x64.
3. **Installer download link / file**: Use `HTML Motion Studio-Setup-1.0.0.exe` (located in `apps/desktop/release/` or hosted on your website).
4. **Silent install switch**: `/S`
5. **Silent uninstall switch**: `/S`
6. **Package integrity**: Self-contained with local Chromium and FFmpeg.

### Option B: MSIX / AppX Package
1. In Partner Center under **Product management** > **Product Identity**, find:
   - Package/Identity/Name
   - Package/Identity/Publisher (e.g. `CN=...`)
   - PublisherDisplayName
2. Set them in your environment and run:
   ```bash
   pnpm run package:appx
   ```
3. Upload the generated `.appx` or `.msix` file directly.

---

## 4. Visual Assets (Ready in Repository)
All required assets have been created in `apps/desktop/build/store-assets/`:

| Asset Type | Dimension | File Location |
| :--- | :--- | :--- |
| **App Tile Icon** | 300 × 300 px | `apps/desktop/build/store-assets/AppTile-300x300.png` |
| **Store Logo** | 50 × 50 px | `apps/desktop/build/store-assets/StoreLogo-50x50.png` |
| **Hero Art Banner** | 1920 × 1080 px | `apps/desktop/build/store-assets/HeroArt-1920x1080.png` |
| **Screenshot 1** | 1920 × 1080 px | `apps/desktop/build/store-assets/Screenshot-1-Workspace-1920x1080.png` |
| **Screenshot 2** | 1920 × 1080 px | `apps/desktop/build/store-assets/Screenshot-2-Audio-Timeline-1920x1080.png` |
| **Screenshot 3** | 1920 × 1080 px | `apps/desktop/build/store-assets/Screenshot-3-Rendering-Engine-1920x1080.png` |
| **Screenshot 4** | 1920 × 1080 px | `apps/desktop/build/store-assets/Screenshot-4-Export-Panel-1920x1080.png` |

---

## 5. Store Listing Copy (Copy & Paste)

### App Title
`HTML Motion Studio`

### Short Description (Up to 100 characters)
`Convert HTML, CSS, Canvas & JS web animations directly into 4K 60 FPS MP4 videos offline.`

### Full Description
```markdown
HTML Motion Studio is a professional desktop suite designed to render web-based animations, HTML5 code, CSS keyframes, Canvas particles, and SVG graphics into crystal-clear, frame-accurate MP4 videos.

Say goodbye to dropped frames from screen recorders. HTML Motion Studio captures frames deterministically through an isolated local Chromium pipeline and encodes them with hardware-accelerated local FFmpeg.

KEY HIGHLIGHTS:
• Frame-Accurate Rendering: 60 FPS deterministic frame stepping with zero frame drops.
• 100% Offline & Private: No cloud uploads. Your code, assets, and rendered videos remain strictly on your local PC.
• Soundtrack Audio Sync: Attach background audio tracks and voiceovers with timeline waveform visualization.
• Multi-Aspect Ratios: Native support for 16:9 Landscape (YouTube/Vimeo) and 9:16 Vertical Reels/Shorts.
• Resolution Presets: Export in 720p HD, 1080p Full HD, 1440p 2K, and 4K Ultra HD.
• Built-in Code Editor & Inspector: Live preview, asset browser, and dynamic code editing.
• Hardware Accelerated: Local GPU rendering and multi-threaded FFmpeg encoding.

Crafted with passion by TA Shanto.
```

### Features (Bullet Points)
- Deterministic 60 FPS frame stepping engine
- Zero screen recorder stutter or frame drops
- 100% offline & private local processing
- Multi-track timeline with audio waveform sync
- 16:9 Landscape & 9:16 Vertical Shorts presets
- 4K Ultra HD, 2K, 1080p, and 720p MP4 exports
- Local GPU acceleration with bundled FFmpeg
- In-app live code editor and asset inspector

### Search Keywords (7 Keywords)
1. `html to video`
2. `mp4 converter`
3. `motion graphics`
4. `css animation`
5. `screen recorder alternative`
6. `video editor`
7. `canvas to video`

### Support & Links
- **Privacy Policy URL**: `https://tashanto.com` (or your deployed URL `/privacy`)
- **Website URL**: `https://tashanto.com`
- **Support Email / URL**: `https://tashanto.com`
- **Copyright**: `Copyright © 2026 TA Shanto`

---

## 6. Age Ratings (IARC Questionnaire)
Answer these questions during submission:
- Violence: **No**
- Sexual / Nudity: **No**
- Profanity / Offensive Language: **No**
- Gambling: **No**
- User interaction / Chat / Online Sharing: **No**
- Collects personal data: **No**
*(This grants an automatic All Ages / Everyone / 3+ rating across all regions).*

---

## 7. Notes for Certification (Reviewer Note)
Copy & paste into the certification notes box:
> "HTML Motion Studio is an offline developer video studio that renders HTML/CSS/Canvas animation into MP4 video using local Chromium and local FFmpeg. No account, login, or network connection is required to test the application."
