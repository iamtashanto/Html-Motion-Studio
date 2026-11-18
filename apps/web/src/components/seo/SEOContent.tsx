'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronUp,
  Lock,
  Flame,
  Zap,
  Cpu,
  HardDrive,
  ArrowRight,
  Gauge,
} from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'Why is HTML Motion Studio v2.0 built with a Rust Core?',
    answer:
      'Rust delivers bare-metal systems performance, zero garbage-collection pauses, and memory-safe multithreading. Our shared Rust core (hms-core) drives headless Chromium via a pure-Rust RFC 6455 WebSocket CDP client, streams captured frames directly into FFmpeg stdin without writing thousands of temporary PNGs to disk, and persists project history in bundled native SQLite (rusqlite).',
  },
  {
    question: 'How small and fast is the Native v2.0 Desktop App compared to Electron?',
    answer:
      'On macOS, HTML Motion Studio v2.0 uses a pure SwiftUI + AppKit + WKWebView frontend linked statically to our Rust core — weighing just 1.5 MB compressed (3.7 MB unpacked .app) compared to ~115–200 MB for Electron. On Windows and Linux, our GPU-accelerated Rust Slint UI compiles into a single compact standalone native binary with instant cold start and minimal RAM usage.',
  },
  {
    question: 'How does HTML Motion Studio Web convert HTML to video inside the browser?',
    answer:
      'The web converter isolates your animation in a sandboxed iframe context with strict Content Security Policy. High-performance browser APIs—WebCodecs (VideoEncoder), HTML5 Canvas captureStream, and mp4-muxer—capture frames and encode them directly into an H.264 MP4 or VP9 WebM video container inside local device memory.',
  },
  {
    question: 'Are my HTML animations, images, or audio tracks uploaded to an external server?',
    answer:
      'Never. Both HTML Motion Studio Web and Native Desktop v2.0 execute 100% locally on your machine. Your HTML source, ZIP assets, audio tracks, and exported 4K MP4/ProRes files never leave your computer.',
  },
  {
    question: 'Can I import ZIP projects with multiple CSS, JS, and image assets?',
    answer:
      'Yes. Drop a ZIP file containing an HTML entry file, stylesheets, JavaScript files, images (PNG, JPG, SVG, WebP), and web fonts. Both our Web and Rust ZIP extractors enforce strict zip-slip path traversal protection, nesting depth ceilings, and decompression-bomb safeguards while automatically rewriting relative asset paths.',
  },
  {
    question: 'When should I use HTML Motion Studio Native Desktop (v2.0) instead of the Web version?',
    answer:
      'Use the Web version for instant, zero-install social clips up to 60 seconds. Use HTML Motion Studio Native v2.0 (Rust Core + SwiftUI on macOS / Slint GPU UI on Windows & Linux) for unlimited durations, frame-accurate deterministic 4K 60fps rendering, zero-disk-I/O FFmpeg piping, Apple ProRes 4444 with alpha transparency, and heavy 3D WebGL/Three.js scenes.',
  },
];

export const SEOContent: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };

  return (
    <div className="space-y-16 py-12 text-slate-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* 1. Rust High-Performance Native Architecture Showcase */}
      <section className="rounded-3xl bg-gradient-to-br from-orange-950/25 via-slate-900/90 to-indigo-950/30 border border-orange-500/20 p-8 md:p-10 space-y-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-[11px] font-bold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              Engineered in Rust — Built for Maximum Speed
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              High-Performance Native Architecture (v2.0)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              We eliminated bloated browser shells and temporary disk frame caches. One blazing-fast{' '}
              <strong className="text-white">shared Rust core</strong> powers both our{' '}
              <strong className="text-white">native SwiftUI macOS app</strong> and our{' '}
              <strong className="text-white">GPU-accelerated Rust Slint UI</strong> for Windows &amp; Linux.
            </p>
          </div>
          <Link
            href="/download"
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-orange-500/20 transition"
          >
            <span>Download Native v2.0</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <Gauge className="w-5 h-5 text-orange-400" />
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                ~75× SMALLER
              </span>
            </div>
            <div className="text-2xl font-black text-white font-mono">1.5 MB</div>
            <h3 className="text-xs font-bold text-slate-200">Native SwiftUI macOS ZIP</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Instant cold launch and ~50 MB idle RAM via native SwiftUI + WKWebView linked directly to static Rust FFI.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <Zap className="w-5 h-5 text-cyan-400" />
              <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                ZERO TEMP PNGs
              </span>
            </div>
            <div className="text-2xl font-black text-white font-mono">0 Disk I/O</div>
            <h3 className="text-xs font-bold text-slate-200">Direct FFmpeg Stdin Pipe</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Rust streams captured frames straight from memory into FFmpeg <code className="text-cyan-300">image2pipe</code> for 2–4× faster exports.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <Cpu className="w-5 h-5 text-blue-400" />
              <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                FRAME-EXACT
              </span>
            </div>
            <div className="text-2xl font-black text-white font-mono">4K 60fps</div>
            <h3 className="text-xs font-bold text-slate-200">Pure-Rust CDP Stepping</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Deterministic virtual clock + Web Animations API control ensures zero dropped frames or audio drift.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <HardDrive className="w-5 h-5 text-indigo-400" />
              <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                CROSS-OS NATIVE
              </span>
            </div>
            <div className="text-2xl font-black text-white font-mono">3 OS Native</div>
            <h3 className="text-xs font-bold text-slate-200">SwiftUI + Slint GPU UI</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Native SwiftUI on macOS, GPU-accelerated Rust Slint on Windows &amp; Linux, plus bundled <code className="text-indigo-300">rusqlite</code> DB.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Step-by-Step Workflow Guide */}
      <section className="space-y-6">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            How to Convert HTML Animations to MP4 Video
          </h2>
          <p className="text-sm text-slate-400">
            A seamless 3-step workflow designed for motion designers, frontend engineers, and video creators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-sm">
              1
            </div>
            <h3 className="text-base font-bold text-white">Import HTML, Folder, or ZIP Archive</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload a single HTML file, paste code into the live editor, or drag-and-drop a ZIP project with linked CSS, JS, SVG, fonts, and image assets.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center text-sm">
              2
            </div>
            <h3 className="text-base font-bold text-white">Preview &amp; Mix Synchronized Audio</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inspect your motion deterministically in our isolated sandbox. Attach an MP3 or WAV soundtrack with volume, offset delay, and fade-in/out curves.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-600/20 text-cyan-400 font-bold flex items-center justify-center text-sm">
              3
            </div>
            <h3 className="text-base font-bold text-white">Export H.264 MP4, WebM, or ProRes</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Choose 720p, 1080p, 1440p, or 4K at 24/30/60 FPS. Export instantly in-browser via WebCodecs or at full workstation speed via our Rust + FFmpeg desktop pipe.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Client-Side Privacy Guarantee */}
      <section className="p-8 rounded-3xl bg-gradient-to-r from-emerald-950/30 to-slate-900 border border-emerald-500/20 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Zero Server Uploads — 100% Private Local Execution
            </h3>
            <p className="text-xs text-slate-400">
              Your animations, code, and media assets never leave your computer
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Unlike cloud video rendering farms that upload your proprietary HTML source code, brand assets, and audio tracks to external servers, both HTML Motion Studio Web and Native Rust Desktop execute 100% locally on your own hardware.
        </p>
      </section>

      {/* 4. Frequently Asked Questions (FAQ) Accordion */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-400">
            Everything you need to know about Rust-powered native performance and browser HTML-to-MP4 conversion.
          </p>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          {FAQS.map((faq, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden transition"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-200 hover:text-white"
              >
                <span>{faq.question}</span>
                {openFaq === index ? (
                  <ChevronUp className="w-4 h-4 text-blue-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-blue-400 shrink-0" />
                )}
              </button>
              {openFaq === index && (
                <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
