# HTML Motion Studio Desktop — Real-World Video Export Validation Report

**Date:** 2026-10-30T13:04:27.112Z
**Host:** darwin (arm64)
**FFmpeg:** /opt/homebrew/bin/ffmpeg

| Test Case | Type | Resolution | FPS | Target Dur | Probed Dur | Video Codec | Audio Codec | Size | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Static HTML Layout** | `1-static-html` | 1920×1080 | 60 fps | 2s | 2s | `h264` | `None` | 66.5 KB | **PASS** |
| **CSS Keyframe Animation** | `2-css-keyframes` | 1920×1080 | 60 fps | 2s | 2s | `h264` | `None` | 96.0 KB | **PASS** |
| **JavaScript Kinetic rAF Motion** | `3-js-kinetic` | 1920×1080 | 60 fps | 2s | 2s | `h264` | `None` | 46.4 KB | **PASS** |
| **SVG Vector Path Morphing** | `4-svg-vector` | 1920×1080 | 60 fps | 2s | 2s | `h264` | `None` | 17.5 KB | **PASS** |
| **HTML5 2D Canvas Particles** | `5-canvas-particles` | 1920×1080 | 60 fps | 2s | 2s | `h264` | `None` | 454.4 KB | **PASS** |
| **Embedded Images & Typography** | `6-images-fonts` | 1920×1080 | 60 fps | 2s | 2s | `h264` | `None` | 18.2 KB | **PASS** |
| **Canvas Visualizer with AAC Audio** | `7-audio-soundtrack` | 1920×1080 | 60 fps | 2s | 2s | `h264` | `aac` | 515.4 KB | **PASS** |
| **Long-Duration 10-Second Animation** | `8-long-duration` | 1920×1080 | 60 fps | 10s | 10s | `h264` | `None` | 458.6 KB | **PASS** |
