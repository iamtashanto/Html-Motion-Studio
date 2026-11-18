import React from 'react';
import Link from 'next/link';
import {
  DownloadCloud,
  Monitor,
  Apple,
  Terminal,
  Shield,
  CheckCircle2,
  Cpu,
  HardDrive,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Heart,
  Zap,
  Layers,
} from 'lucide-react';

export const metadata = {
  title: 'Download HTML Motion Studio v2.0.0 Native — Rust Core + SwiftUI High-Performance Studio',
  description:
    'Download HTML Motion Studio v2.0.0 Native — powered by a blazing-fast Rust Core with zero-disk-I/O FFmpeg piping, pure SwiftUI for macOS (1.5 MB), and GPU-accelerated Rust Slint UI for Windows & Linux.',
  keywords: [
    'download HTML Motion Studio',
    'Rust HTML to MP4 desktop app',
    'SwiftUI macOS HTML video converter',
    'Slint Rust video renderer',
    'zero-disk FFmpeg pipe',
    '4K 60fps HTML animation exporter',
  ],
};

const GITHUB_RELEASE_BASE =
  'https://github.com/iamtashanto/Html-Motion-Studio/releases/download/v2.0.0';
const GITHUB_RELEASE_PAGE =
  'https://github.com/iamtashanto/Html-Motion-Studio/releases/tag/v2.0.0';

export default function DownloadPage() {
  const nativeReleases = [
    {
      platform: 'macOS (Apple Silicon)',
      engine: 'SwiftUI + AppKit + Rust Core',
      icon: Apple,
      target: 'macOS 14+ (M1 / M2 / M3 / M4)',
      filename: 'HTML-Motion-Studio-2.0.0-native-macos-arm64.zip',
      path: `${GITHUB_RELEASE_BASE}/HTML-Motion-Studio-2.0.0-native-macos-arm64.zip`,
      format: 'Native .app Bundle (ZIP)',
      size: '1.5 MB (3.7 MB unpacked)',
      recommended: true,
      badge: 'Native SwiftUI • v2.0.0',
      instructions:
        'Unzip and drag HTML Motion Studio.app into Applications. Uses native WKWebView preview + Rust CDP/FFmpeg pipe.',
    },
    {
      platform: 'Windows (64-bit)',
      engine: 'Rust Slint GPU UI + Rust Core',
      icon: Monitor,
      target: 'Windows 10 / 11 (x64)',
      filename: 'HTML-Motion-Studio-2.0.0-native-windows-x64.zip',
      path: `${GITHUB_RELEASE_BASE}/HTML-Motion-Studio-2.0.0-native-windows-x64.zip`,
      format: 'Standalone Native Executable (ZIP)',
      size: 'Native Portable Binary',
      recommended: false,
      badge: 'Native Rust • v2.0.0',
      instructions:
        'Extract HTML-Motion-Studio.exe and launch directly. Zero Electron overhead with native Windows file dialogs.',
    },
    {
      platform: 'Linux (64-bit)',
      engine: 'Rust Slint GPU UI + Rust Core',
      icon: Terminal,
      target: 'Ubuntu, Debian, Fedora, Arch (x86_64)',
      filename: 'HTML-Motion-Studio-2.0.0-native-linux-x64.tar.gz',
      path: `${GITHUB_RELEASE_BASE}/HTML-Motion-Studio-2.0.0-native-linux-x64.tar.gz`,
      format: 'Compressed Native Archive (.tar.gz)',
      size: 'Native Standalone Binary',
      recommended: false,
      badge: 'Native Rust • v2.0.0',
      instructions:
        'Extract with tar -xzf and run ./html-motion-studio. Works seamlessly on Wayland and X11 desktops.',
    },
  ];

  const legacyReleases = [
    {
      platform: 'Windows (Classic v1.0.0)',
      icon: Monitor,
      target: 'Windows 10 / 11 (64-bit) — Bundled Chromium',
      filename: 'HTML-Motion-Studio-Setup-1.0.0.exe',
      path: '/downloads/HTML-Motion-Studio-Setup-1.0.0.exe',
      format: 'NSIS Installer (.exe)',
      size: '92 MB',
    },
    {
      platform: 'macOS Intel (Classic v1.0.0)',
      icon: Apple,
      target: 'macOS 10.15+ (Intel x64) — Bundled Chromium',
      filename: 'HTML-Motion-Studio-1.0.0-x64.dmg',
      path: '/downloads/HTML-Motion-Studio-1.0.0-x64.dmg',
      format: 'Apple Disk Image (.dmg)',
      size: '117 MB',
    },
    {
      platform: 'Linux AppImage (Classic v1.0.0)',
      icon: Terminal,
      target: 'Universal x86_64 — Bundled Chromium',
      filename: 'HTML-Motion-Studio-1.0.0.AppImage',
      path: '/downloads/HTML-Motion-Studio-1.0.0.AppImage',
      format: 'Standalone AppImage',
      size: '121 MB',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-6">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          New Native Suite — Version 2.0.0 (Rust + SwiftUI)
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Download HTML Motion Studio Native
        </h1>

        <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
          Rebuilt from the ground up on a <strong>shared Rust Core engine</strong> — with a{' '}
          <strong>pure SwiftUI + WKWebView app on macOS (1.5 MB)</strong> and a{' '}
          <strong>GPU-accelerated Rust Slint UI on Windows &amp; Linux</strong>.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Zero-Disk-I/O FFmpeg Stdin Pipe
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            100% Offline &amp; Private
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            Deterministic Chromium CDP Stepping
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
            <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
            Native SQLite (rusqlite)
          </span>
        </div>
      </div>

      {/* Rust Performance Highlights Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-slate-900/80 border border-orange-500/20 p-4 text-center space-y-1">
          <div className="text-2xl font-black font-mono text-orange-400">1.5 MB</div>
          <div className="text-xs font-bold text-white">macOS Native SwiftUI</div>
          <div className="text-[10px] text-slate-400">~75× smaller than Electron DMG</div>
        </div>
        <div className="rounded-2xl bg-slate-900/80 border border-cyan-500/20 p-4 text-center space-y-1">
          <div className="text-2xl font-black font-mono text-cyan-400">0 Disk I/O</div>
          <div className="text-xs font-bold text-white">FFmpeg Stdin Pipe</div>
          <div className="text-[10px] text-slate-400">Direct memory-to-encoder streaming</div>
        </div>
        <div className="rounded-2xl bg-slate-900/80 border border-blue-500/20 p-4 text-center space-y-1">
          <div className="text-2xl font-black font-mono text-blue-400">4K 60fps</div>
          <div className="text-xs font-bold text-white">Rust CDP Deterministic</div>
          <div className="text-[10px] text-slate-400">Zero frame drops or audio drift</div>
        </div>
        <div className="rounded-2xl bg-slate-900/80 border border-emerald-500/20 p-4 text-center space-y-1">
          <div className="text-2xl font-black font-mono text-emerald-400">100% Native</div>
          <div className="text-xs font-bold text-white">Rust + SwiftUI + Slint</div>
          <div className="text-[10px] text-slate-400">Instant launch, minimal RAM usage</div>
        </div>
      </div>

      {/* Native v2.0.0 Download Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {nativeReleases.map((rel) => {
          const Icon = rel.icon;
          return (
            <div
              key={rel.filename}
              className={`relative rounded-2xl p-6 flex flex-col justify-between transition border ${
                rel.recommended
                  ? 'bg-gradient-to-b from-blue-950/40 via-slate-900 to-slate-950 border-blue-500/50 shadow-xl shadow-blue-500/10'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-lg'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      rel.recommended
                        ? 'bg-blue-600 text-white'
                        : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                    }`}
                  >
                    {rel.badge}
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">{rel.platform}</h2>
                  <p className="text-xs text-blue-400 font-semibold mt-0.5">{rel.engine}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{rel.target}</p>
                </div>

                <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 space-y-1 text-[11px] font-mono text-slate-300">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500">Format:</span>
                    <span className="text-slate-300 font-medium text-right">{rel.format}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500">Size:</span>
                    <span className="text-emerald-400 font-bold text-right">{rel.size}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{rel.instructions}</p>
              </div>

              <div className="pt-6 space-y-2">
                <a
                  href={rel.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs transition active:scale-95 shadow-md ${
                    rel.recommended
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  <DownloadCloud className="w-4 h-4" />
                  <span>Download {rel.platform.split(' ')[0]} v2.0.0</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Prerequisites & GitHub Release Link */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Native v2.0.0 Runtime Requirements</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
            Because the v2.0.0 native suite skips bundling a 150 MB Electron runtime, make sure{' '}
            <strong className="text-slate-200">FFmpeg / FFprobe</strong> and a Chromium-based browser (
            <strong className="text-slate-200">Google Chrome, Chromium, Edge, or Brave</strong>) are
            installed locally on your machine.
          </p>
        </div>
        <a
          href={GITHUB_RELEASE_PAGE}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-blue-400 hover:text-blue-300 transition"
        >
          <span>View v2.0.0 on GitHub Releases</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Classic Electron Edition (v1.0.0) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white">
              Classic Electron Edition (v1.0.0 — Self-Contained Bundled Chromium)
            </h3>
            <p className="text-xs text-slate-400">
              Prefer a self-contained installer with bundled Chromium or running on an Intel Mac?
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {legacyReleases.map((rel) => {
            const Icon = rel.icon;
            return (
              <div
                key={rel.filename}
                className="rounded-xl p-4 bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-200 truncate">{rel.platform}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {rel.format} • {rel.size}
                    </div>
                  </div>
                </div>
                <a
                  href={rel.path}
                  download={rel.filename}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 transition"
                >
                  Download
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* SHA256 Verification Section */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Cryptographic SHA-256 Checksums</h3>
          </div>
          <a
            href={GITHUB_RELEASE_PAGE}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            <span>All Release Checksums</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800/80 font-mono text-xs text-slate-300 overflow-x-auto space-y-1">
          <div className="text-emerald-400">
            b694c333ecf75e4a05f3ce3c7a62f068b49b31e8e2a24fe3aa858a98ee627121  HTML-Motion-Studio-2.0.0-native-macos-arm64.zip
          </div>
          <div className="text-slate-500 pt-2 border-t border-slate-800/70">
            # Classic Electron v1.0.0 checksums
          </div>
          <div>3471ad1c68458a548cb0592aafce05e91cf476b1624cdd39b86400419edc254b  HTML-Motion-Studio-1.0.0-arm64.dmg</div>
          <div>50adf298993de51de4e02ac09d299d3b440ebc495cb6f13e91240aaaea4d2967  HTML-Motion-Studio-1.0.0-x64.dmg</div>
          <div>bf2c52db493da38207c8d98c5c84da4e99a5d86c48d7a1f5d5981090f87067cd  HTML-Motion-Studio-Setup-1.0.0.exe</div>
          <div>5d5124685152693c38e7775699ecb49ab42055c8e72c52b71b43f08428899865  HTML-Motion-Studio-1.0.0.AppImage</div>
        </div>
      </div>

      {/* Return to Web Converter CTA & Developer Credit */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/80 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition font-medium"
          >
            <span>Prefer running in your browser? Launch Web Studio</span>
            <ArrowRight className="w-4 h-4 text-blue-400" />
          </Link>
          <span className="hidden md:inline text-slate-700">•</span>
          <a
            href="https://www.supportkori.com/iamtashanto"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-400 hover:text-pink-300 font-semibold transition"
          >
            <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
            <span>Support on SupportKori</span>
          </a>
        </div>

        <p className="text-slate-400">
          Developed by{' '}
          <a
            href="https://tashanto.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-blue-400 hover:text-blue-300 hover:underline transition"
          >
            TA Shanto
          </a>{' '}
          (
          <a
            href="https://tashanto.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-slate-400 hover:text-white"
          >
            tashanto.com
          </a>
          )
        </p>
      </div>
    </div>
  );
}
