import React from 'react';
import type { Metadata } from 'next';
import { StudioWorkspace } from '@/components/studio/StudioWorkspace';
import { SEOContent } from '@/components/seo/SEOContent';
import { Film, CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Convert HTML to MP4 Online — Free In-Browser Video Converter',
  description:
    'Convert HTML, CSS keyframes, Canvas, and SVG animations to MP4 video online in your browser. Add background audio, configure resolutions, and export without software.',
  keywords: [
    'HTML to MP4 converter',
    'convert HTML to MP4',
    'HTML5 animation to MP4',
    'CSS animation to video',
    'browser HTML to video converter',
    'HTML Motion Studio Web',
  ],
};

export default function HtmlToMp4Page() {
  return (
    <div className="space-y-12">
      {/* Route Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <Film className="w-3.5 h-3.5" />
          Free In-Browser Tool
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          HTML to MP4 Video Converter
        </h1>

        <p className="text-sm sm:text-base text-slate-300">
          Transform your HTML, CSS, SVG, and Canvas animations into MP4 videos directly in your browser with synchronized audio.
        </p>
      </div>

      {/* Embedded Studio Conversion Workspace */}
      <StudioWorkspace />

      {/* Dedicated Technical Guides & SEO Content */}
      <SEOContent />
    </div>
  );
}

