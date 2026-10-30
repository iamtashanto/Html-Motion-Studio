'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  DownloadCloud,
  Monitor,
  Globe,
  Check,
  X,
  Sparkles,
  Zap,
  Layers,
  Cpu,
  ArrowRight,
  Apple,
  Terminal,
} from 'lucide-react';

export const DesktopCompanionBanner: React.FC = () => {
  const [showMatrix, setShowMatrix] = useState(false);

  return (
    <section id="desktop-download" className="relative my-12 rounded-3xl overflow-hidden border border-blue-900/40 bg-gradient-to-b from-slate-900 via-slate-900/90 to-blue-950/40 p-8 md:p-12 shadow-2xl backdrop-blur-md">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Companion Professional Suite
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Need High-Resolution, Frame-Accurate Rendering?
          </h2>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            <strong>HTML Motion Studio Web</strong> is built for instant browser conversions. For long animations, 4K/60fps master exports, complex WebGL/Three.js scenes, and alpha transparency, download <strong>HTML Motion Studio Desktop</strong> for macOS, Windows, and Linux.
          </p>

          {/* Direct Download Action Row */}
          <div className="pt-2 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/downloads/HTML-Motion-Studio-Setup-1.0.0.exe"
                download="HTML-Motion-Studio-Setup-1.0.0.exe"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition active:scale-95"
                title="Download Windows x64 Installer (.exe) - 92 MB"
              >
                <Monitor className="w-4 h-4 text-cyan-300" />
                <span>Windows (.exe)</span>
              </a>

              <a
                href="/downloads/HTML-Motion-Studio-1.0.0-arm64.dmg"
                download="HTML-Motion-Studio-1.0.0-arm64.dmg"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 hover:bg-slate-700 text-white border border-slate-700 font-bold text-xs rounded-xl transition active:scale-95 shadow-md"
                title="Download macOS Apple Silicon DMG - 112 MB"
              >
                <Apple className="w-4 h-4 text-slate-200" />
                <span>macOS (.dmg)</span>
              </a>

              <a
                href="/downloads/HTML-Motion-Studio-1.0.0.AppImage"
                download="HTML-Motion-Studio-1.0.0.AppImage"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 hover:bg-slate-700 text-white border border-slate-700 font-bold text-xs rounded-xl transition active:scale-95 shadow-md"
                title="Download Linux x64 Standalone AppImage - 121 MB"
              >
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Linux (.AppImage)</span>
              </a>

              <Link
                href="/download"
                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold px-3 py-2 rounded-lg hover:bg-blue-950/40 transition"
              >
                <span>All Downloads & Intel Macs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div>
              <button
                onClick={() => setShowMatrix(!showMatrix)}
                className="text-xs text-slate-400 hover:text-slate-200 font-semibold underline underline-offset-4"
              >
                {showMatrix ? 'Hide Feature Comparison' : 'Compare Web vs. Desktop Editions'}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Highlights Badge */}
        <div className="w-full md:w-auto p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
          <div className="font-semibold text-slate-200">Recommended for Desktop:</div>
          <div className="text-slate-400 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Animations longer than 60 seconds
          </div>
          <div className="text-slate-400 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Deterministic frame-by-frame stepping
          </div>
          <div className="text-slate-400 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Apple ProRes 4444 & Alpha transparency
          </div>
          <div className="text-slate-400 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Large multi-gigabyte ZIP projects
          </div>
        </div>
      </div>

      {/* Feature Comparison Matrix Table */}
      {showMatrix && (
        <div className="mt-8 pt-8 border-t border-slate-800/80 overflow-x-auto animate-in fade-in duration-300">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-4 font-semibold">Capability / Feature</th>
                <th className="py-3 px-4 font-semibold text-blue-400">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    HTML Motion Studio Web
                  </span>
                </th>
                <th className="py-3 px-4 font-semibold text-indigo-400">
                  <span className="flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5" />
                    HTML Motion Studio Desktop
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-3 px-4 font-medium">Installation Requirement</td>
                <td className="py-3 px-4 text-emerald-400">Zero installation (In-browser)</td>
                <td className="py-3 px-4 text-slate-300">Native macOS / Windows App</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Duration Capability</td>
                <td className="py-3 px-4">Up to 60 seconds (Browser memory safety)</td>
                <td className="py-3 px-4 text-emerald-400 font-semibold">Unlimited duration</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Rendering Mechanism</td>
                <td className="py-3 px-4">WebCodecs + MediaRecorder API</td>
                <td className="py-3 px-4 text-emerald-400 font-semibold">Headless Chromium GPU Engine</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Frame Accuracy</td>
                <td className="py-3 px-4">Realtime browser clock sync</td>
                <td className="py-3 px-4 text-emerald-400 font-semibold">Deterministic virtual clock stepping</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Output Containers</td>
                <td className="py-3 px-4">MP4 (H.264), WebM (VP9)</td>
                <td className="py-3 px-4 text-emerald-400 font-semibold">ProRes, H.264, H.265, GIF, PNG sequences</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Transparent Alpha Channel</td>
                <td className="py-3 px-4 text-slate-500">Limited (Solid composite)</td>
                <td className="py-3 px-4 text-emerald-400 font-semibold">Full alpha transparency export</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Client Privacy</td>
                <td className="py-3 px-4 text-emerald-400 font-semibold">100% Client-side sandbox</td>
                <td className="py-3 px-4 text-emerald-400 font-semibold">100% Offline local workstation</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

