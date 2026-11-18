'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Monitor,
  Globe,
  Sparkles,
  ArrowRight,
  Apple,
  Terminal,
} from 'lucide-react';

const GITHUB_RELEASE_BASE =
  'https://github.com/iamtashanto/Html-Motion-Studio/releases/download/v2.0.0';

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
            New v2.0.0 Native Suite — Rust Core + SwiftUI
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Need Ultra-Fast Native 4K, Frame-Accurate Rendering?
          </h2>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            <strong>HTML Motion Studio Web</strong> is built for instant browser conversions. For long animations, 4K/60fps exports, ProRes 4444, and zero-disk-I/O FFmpeg piping, download <strong>HTML Motion Studio Native v2.0.0</strong> — pure <strong>SwiftUI</strong> on macOS (1.5 MB) and GPU-accelerated <strong>Rust Slint UI</strong> on Windows &amp; Linux.
          </p>

          {/* Direct Download Action Row */}
          <div className="pt-2 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`${GITHUB_RELEASE_BASE}/HTML-Motion-Studio-2.0.0-native-macos-arm64.zip`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition active:scale-95"
                title="Download macOS Apple Silicon Native SwiftUI App (1.5 MB ZIP)"
              >
                <Apple className="w-4 h-4 text-white" />
                <span>macOS SwiftUI (1.5 MB)</span>
              </a>

              <a
                href={`${GITHUB_RELEASE_BASE}/HTML-Motion-Studio-2.0.0-native-windows-x64.zip`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 hover:bg-slate-700 text-white border border-slate-700 font-bold text-xs rounded-xl transition active:scale-95 shadow-md"
                title="Download Windows x64 Native Rust App"
              >
                <Monitor className="w-4 h-4 text-cyan-300" />
                <span>Windows (Rust)</span>
              </a>

              <a
                href={`${GITHUB_RELEASE_BASE}/HTML-Motion-Studio-2.0.0-native-linux-x64.tar.gz`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 hover:bg-slate-700 text-white border border-slate-700 font-bold text-xs rounded-xl transition active:scale-95 shadow-md"
                title="Download Linux x64 Native Rust App"
              >
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Linux (Rust)</span>
              </a>

              <Link
                href="/download"
                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold px-3 py-2 rounded-lg hover:bg-blue-950/40 transition"
              >
                <span>All Downloads &amp; Classic v1.0</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div>
              <button
                onClick={() => setShowMatrix(!showMatrix)}
                className="text-xs text-slate-400 hover:text-slate-200 font-semibold underline underline-offset-4"
              >
                {showMatrix ? 'Hide Feature Comparison' : 'Compare Web vs. Native Desktop v2.0'}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Highlights Badge */}
        <div className="w-full md:w-auto p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
          <div className="font-semibold text-slate-200">New in Native v2.0.0:</div>
          <div className="text-slate-400 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Shared Rust Core + Native SQLite
          </div>
          <div className="text-slate-400 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Pure SwiftUI macOS App (1.5 MB ZIP)
          </div>
          <div className="text-slate-400 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            Zero-Disk-I/O FFmpeg Stdin Streaming
          </div>
          <div className="text-slate-400 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            4K 60fps, WebM VP9 &amp; ProRes 4444
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
                    HTML Motion Studio Native v2.0
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-3 px-4 font-medium">Architecture</td>
                <td className="py-3 px-4 text-emerald-400">Zero installation (In-browser)</td>
                <td className="py-3 px-4 text-emerald-400 font-semibold">Rust Core + SwiftUI (macOS) / Slint (Win &amp; Linux)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Duration Capability</td>
                <td className="py-3 px-4">Up to 60 seconds (Browser memory safety)</td>
                <td className="py-3 px-4 text-emerald-400 font-semibold">Unlimited duration</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Rendering Pipeline</td>
                <td className="py-3 px-4">WebCodecs + MediaRecorder API</td>
                <td className="py-3 px-4 text-emerald-400 font-semibold">Rust CDP Chromium + Zero-Disk FFmpeg Pipe</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Frame Accuracy</td>
                <td className="py-3 px-4">Realtime browser clock sync</td>
                <td className="py-3 px-4 text-emerald-400 font-semibold">Deterministic virtual clock stepping</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Output Containers</td>
                <td className="py-3 px-4">MP4 (H.264), WebM (VP9)</td>
                <td className="py-3 px-4 text-emerald-400 font-semibold">MP4 (H.264), WebM (VP9), Apple ProRes 4444 (.mov)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Transparent Alpha Channel</td>
                <td className="py-3 px-4 text-slate-500">Limited (Solid composite)</td>
                <td className="py-3 px-4 text-emerald-400 font-semibold">Full alpha transparency (VP9 / ProRes 4444)</td>
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
