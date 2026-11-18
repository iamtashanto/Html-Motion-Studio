import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { StudioWorkspace } from '@/components/studio/StudioWorkspace';
import { SEOContent } from '@/components/seo/SEOContent';
import { Film, Flame, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Convert HTML to MP4 — High-Performance Rust & Browser Video Converter',
  description:
    'Convert HTML5, CSS keyframes, Canvas, WebGL, and SVG animations to 4K 60fps MP4 video in your browser or with our blazing-fast v2.0 Native Rust + SwiftUI Desktop Studio.',
  keywords: [
    'HTML to MP4 converter',
    'Rust HTML to MP4',
    'high performance HTML video exporter',
    'convert HTML to MP4',
    'HTML5 animation to MP4',
    'CSS animation to video',
    '4K 60fps HTML renderer',
    'HTML Motion Studio',
  ],
};

export default function HtmlToMp4Page() {
  return (
    <div className="space-y-12">
      {/* Route Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto pt-2">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Film className="w-3.5 h-3.5" />
            Free Browser &amp; Native Studio
          </div>
          <Link
            href="/download"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-bold transition"
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Powered by Rust v2.0 (1.5 MB Native)</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          High-Performance HTML to MP4 Video Converter
        </h1>

        <p className="text-sm sm:text-base text-slate-300">
          Transform HTML, CSS, SVG, and Canvas animations into frame-accurate MP4 videos instantly in your browser — or export unlimited 4K 60fps &amp; ProRes with our <strong>Native Rust Core + Zero-Disk FFmpeg Pipe</strong>.
        </p>
      </div>

      {/* Embedded Studio Conversion Workspace */}
      <StudioWorkspace />

      {/* Dedicated Technical Guides, Rust Benchmarks & FAQ SEO Content */}
      <SEOContent />
    </div>
  );
}
