import React from 'react';
import { StudioWorkspace } from '@/components/studio/StudioWorkspace';
import { SEOContent } from '@/components/seo/SEOContent';
import { Sparkles, Shield, Cpu, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-4xl mx-auto pt-2 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          HTML Motion Studio Web Converter
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
          Convert HTML Animations Into Videos —{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">
            Right in Your Browser.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Import an HTML animation, preview it, add audio, and export a video without installing desktop software.
        </p>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Client-Side Privacy</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span>WebCodecs Hardware Acceleration</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>ZIP Archives & Audio Mixing</span>
          </div>
        </div>
      </div>

      {/* Main Studio Conversion Application */}
      <StudioWorkspace />

      {/* SEO Workflow, Security, Limitations & FAQ Section */}
      <SEOContent />
    </div>
  );
}

