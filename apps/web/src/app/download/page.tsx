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
  FileCode,
  Sparkles,
  ExternalLink,
  Heart,
} from 'lucide-react';

export const metadata = {
  title: 'Download HTML Motion Studio Desktop (Windows, macOS, Linux)',
  description:
    'Download HTML Motion Studio Desktop edition for offline rendering, Chromium deterministic stepping, unlimited 4K 60fps exports, and local FFmpeg encoding.',
};

export default function DownloadPage() {
  const releases = [
    {
      platform: 'Windows',
      icon: Monitor,
      target: 'Windows 10 / 11 (64-bit)',
      filename: 'HTML-Motion-Studio-Setup-1.0.0.exe',
      path: '/downloads/HTML-Motion-Studio-Setup-1.0.0.exe',
      format: 'NSIS Installer (.exe)',
      size: '92 MB',
      recommended: false,
      badge: 'Installer',
      instructions: 'Run the setup installer. Choose installation folder and launch from Start Menu or Desktop.',
    },
    {
      platform: 'macOS (Apple Silicon)',
      icon: Apple,
      target: 'macOS 11.0+ (M1 / M2 / M3 / M4)',
      filename: 'HTML-Motion-Studio-1.0.0-arm64.dmg',
      path: '/downloads/HTML-Motion-Studio-1.0.0-arm64.dmg',
      format: 'Apple Disk Image (.dmg)',
      size: '112 MB',
      recommended: true,
      badge: 'Recommended for Mac',
      instructions: 'Open the DMG and drag HTML Motion Studio into your Applications folder.',
    },
    {
      platform: 'macOS (Intel)',
      icon: Apple,
      target: 'macOS 10.15+ (Intel Core)',
      filename: 'HTML-Motion-Studio-1.0.0-x64.dmg',
      path: '/downloads/HTML-Motion-Studio-1.0.0-x64.dmg',
      format: 'Apple Disk Image (.dmg)',
      size: '117 MB',
      recommended: false,
      badge: 'Intel Mac',
      instructions: 'Open the DMG and drag HTML Motion Studio into your Applications folder.',
    },
    {
      platform: 'Linux (AppImage)',
      icon: Terminal,
      target: 'Ubuntu, Debian, Fedora, Arch (64-bit)',
      filename: 'HTML-Motion-Studio-1.0.0.AppImage',
      path: '/downloads/HTML-Motion-Studio-1.0.0.AppImage',
      format: 'Standalone AppImage',
      size: '121 MB',
      recommended: false,
      badge: 'Universal Linux',
      instructions: 'Make executable (chmod +x HTML-Motion-Studio-1.0.0.AppImage) and double-click to run.',
    },
    {
      platform: 'Linux (tar.gz)',
      icon: Terminal,
      target: 'Linux x86_64 Archive',
      filename: 'HTML-Motion-Studio-1.0.0-linux.tar.gz',
      path: '/downloads/HTML-Motion-Studio-1.0.0-linux.tar.gz',
      format: 'Compressed Archive (.tar.gz)',
      size: '108 MB',
      recommended: false,
      badge: 'Portable Archive',
      instructions: 'Extract anywhere with tar -xzf and launch ./html-motion-studio.',
    },
    {
      platform: 'macOS (Portable ZIP)',
      icon: Apple,
      target: 'macOS Portable Application',
      filename: 'HTML-Motion-Studio-1.0.0-mac.zip',
      path: '/downloads/HTML-Motion-Studio-1.0.0-mac.zip',
      format: 'Portable ZIP Archive',
      size: '55 MB',
      recommended: false,
      badge: 'No-install ZIP',
      instructions: 'Unzip and double-click HTML Motion Studio.app to run without installing.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-6">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          Official Desktop Suite — Version 1.0.0 Pro
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Download HTML Motion Studio Desktop
        </h1>

        <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
          High-performance, frame-accurate HTML-to-video rendering powerhouse.
          Includes embedded Chromium deterministic clock stepping, SQLite project persistence, and full FFmpeg hardware encoding.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            100% Offline & Private
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            No Browser Tab Throttling
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
            <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
            Multi-Gigabyte ZIP & Asset Support
          </span>
        </div>
      </div>

      {/* Main Download Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {releases.map((rel) => {
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
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {rel.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">{rel.platform}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{rel.target}</p>
                </div>

                <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 space-y-1 text-[11px] font-mono text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Format:</span>
                    <span className="text-slate-300 font-medium">{rel.format}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">File Size:</span>
                    <span className="text-emerald-400 font-bold">{rel.size}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{rel.instructions}</p>
              </div>

              <div className="pt-6">
                <a
                  href={rel.path}
                  download={rel.filename}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs transition active:scale-95 shadow-md ${
                    rel.recommended
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  <DownloadCloud className="w-4 h-4" />
                  <span>Download {rel.platform.split(' ')[0]}</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* SHA256 Verification Section */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Cryptographic SHA-256 Checksums</h3>
          </div>
          <a
            href="/downloads/SHA256SUMS.txt"
            download="SHA256SUMS.txt"
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            <span>View Raw Checksums</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800/80 font-mono text-xs text-slate-300 overflow-x-auto space-y-1">
          <div>3471ad1c68458a548cb0592aafce05e91cf476b1624cdd39b86400419edc254b  HTML-Motion-Studio-1.0.0-arm64.dmg</div>
          <div>50adf298993de51de4e02ac09d299d3b440ebc495cb6f13e91240aaaea4d2967  HTML-Motion-Studio-1.0.0-x64.dmg</div>
          <div>bf2c52db493da38207c8d98c5c84da4e99a5d86c48d7a1f5d5981090f87067cd  HTML-Motion-Studio-Setup-1.0.0.exe</div>
          <div>5d5124685152693c38e7775699ecb49ab42055c8e72c52b71b43f08428899865  HTML-Motion-Studio-1.0.0.AppImage</div>
          <div>fe1b43b983c13daf9eaba655b948b7b12aaf7f6da97261e0544302f6b8615369  HTML-Motion-Studio-1.0.0-linux.tar.gz</div>
          <div>288f620b9ef52e837d3373951c31bff7f6dabcc48cbbba7d7b3fa7a25e0a85c2  HTML-Motion-Studio-1.0.0-mac.zip</div>
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

