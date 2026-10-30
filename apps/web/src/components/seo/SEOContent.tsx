'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  ShieldCheck,
  Cpu,
  Layers,
  ChevronDown,
  ChevronUp,
  FileVideo,
  DownloadCloud,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'How does HTML Motion Studio Web convert HTML to video inside the browser?',
    answer:
      'The web converter isolates your animation in a sandboxed iframe context with strict Content Security Policy. As the animation runs, high-performance browser APIs—such as WebCodecs (VideoEncoder), HTML5 Canvas captureStream, and mp4-muxer—capture frames and encode them directly into an H.264 MP4 or VP9 WebM video container right in your device memory.',
  },
  {
    question: 'Are my HTML animations, images, or audio tracks uploaded to an external server?',
    answer:
      'No. The default and foundational mode of HTML Motion Studio Web is 100% client-side. Your HTML source, ZIP assets, audio tracks, and exported MP4 files never leave your computer or browser sandbox. No third-party AI services or cloud servers ever inspect your code.',
  },
  {
    question: 'What is the maximum animation duration supported in the browser?',
    answer:
      'To prevent browser memory pressure and tab throttling, HTML Motion Studio Web is optimized for animations up to 60 seconds. For extended video productions, multi-minute marketing videos, or 4K/60fps master exports, our companion desktop application (HTML Motion Studio Desktop) provides unlimited rendering durations with full hardware acceleration.',
  },
  {
    question: 'Can I import ZIP projects with multiple CSS, JS, and image assets?',
    answer:
      'Yes. You can drop a ZIP file containing an HTML entry file, stylesheets, JavaScript files, images (PNG, JPG, SVG, WebP), and web fonts. The converter uses an in-memory extractor with path traversal protection, resolves relative references, and lets you select the primary entry point.',
  },
  {
    question: 'How do I add background audio or music to my video?',
    answer:
      'In the Audio section, upload an MP3, WAV, or AAC audio file. You can configure volume, start delays, trim in/out points, and fade-in/fade-out curves. During export, the Web Audio API renders your audio timeline and multiplexes it synchronously with the video stream.',
  },
  {
    question: 'When should I use HTML Motion Studio Desktop instead of the Web version?',
    answer:
      'The Web version is perfect for rapid, lightweight conversions without installing software. Use HTML Motion Studio Desktop when you need frame-accurate deterministic stepping, Apple ProRes 4444 with alpha channel transparency, multi-gigabyte ZIP projects, complex 3D WebGL scenes, or batch conversions.',
  },
];

export const SEOContent: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="space-y-16 py-12 text-slate-300">
      {/* 1. Step-by-Step Workflow Guide */}
      <section className="space-y-6">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            How to Convert HTML Animations to MP4 Video
          </h2>
          <p className="text-sm text-slate-400">
            A seamless 5-step browser workflow designed for motion designers and frontend developers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-sm">
              1
            </div>
            <h3 className="text-base font-bold text-white">Import HTML or ZIP Archive</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload a single HTML file, paste code into the live editor, or drag-and-drop a ZIP project with linked CSS, JS, SVG, and image assets.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center text-sm">
              2
            </div>
            <h3 className="text-base font-bold text-white">Preview & Mix Audio</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inspect your motion in real time inside our isolated sandbox. Attach an MP3 or WAV soundtrack with volume controls and fade curves.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-600/20 text-cyan-400 font-bold flex items-center justify-center text-sm">
              3
            </div>
            <h3 className="text-base font-bold text-white">Export & Download MP4</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Select your aspect ratio (9:16, 16:9, 1:1) and resolution. The browser encodes the video stream and delivers an instant download.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Client-Side Privacy Guarantee */}
      <section className="p-8 rounded-3xl bg-gradient-to-r from-emerald-950/30 to-slate-900 border border-emerald-500/20 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Zero Server Uploads — 100% Private Client Execution
            </h3>
            <p className="text-xs text-slate-400">
              Your animations and media assets never leave your computer
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Unlike legacy video converters that transmit your proprietary HTML code, stylesheets, and graphic assets to third-party rendering farms, HTML Motion Studio Web executes exclusively inside your local browser runtime. Memory structures are cleared immediately upon download.
        </p>
      </section>

      {/* 3. Frequently Asked Questions (FAQ) Accordion */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-400">
            Everything you need to know about browser HTML-to-MP4 video conversion.
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
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
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

