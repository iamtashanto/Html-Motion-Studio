import React from 'react';
import Link from 'next/link';
import { StudioWorkspace } from '@/components/studio/StudioWorkspace';
import { SEOContent } from '@/components/seo/SEOContent';
import { Sparkles, Shield, Cpu, Zap, ArrowRight, Flame } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-4xl mx-auto pt-2 pb-4">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            HTML Motion Studio Web &amp; Native Suite
          </div>
          <Link
            href="/download"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-bold transition"
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>v2.0 Native Rust + SwiftUI (1.5 MB)</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
          Convert HTML Animations Into Videos —{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">
            At Native Rust Speed.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Import an HTML, CSS, SVG, or Canvas animation, mix audio, and export crisp MP4 right in your browser — or unleash <strong>4K 60fps deterministic rendering</strong> with our <strong>Rust-powered Native Desktop Studio</strong>.
        </p>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Rust Core + Zero-Disk FFmpeg Pipe</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Local Offline Privacy</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span>WebCodecs &amp; Native GPU Acceleration</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>SwiftUI macOS &amp; Slint Win/Linux</span>
          </div>
        </div>
      </div>

      {/* Main Studio Conversion Application */}
      <StudioWorkspace />

      {/* SEO Workflow, Rust High-Performance Architecture, Security & FAQ Section */}
      <SEOContent />
    </div>
  );
}
