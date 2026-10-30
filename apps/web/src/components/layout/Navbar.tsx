'use client';

import React from 'react';
import Link from 'next/link';
import {
  Film,
  DownloadCloud,
  Shield,
  HelpCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Film className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                HTML Motion Studio
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Web
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              In-Browser HTML Animation Converter
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-1 sm:space-x-3">
          <Link
            href="/tools/html-to-mp4"
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60 transition"
          >
            Guide & FAQ
          </Link>

          <Link
            href="/download"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 transition shadow-sm"
          >
            <DownloadCloud className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Desktop App</span>
          </Link>

          <a
            href="https://tashanto.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition"
            title="Developed by TA Shanto"
          >
            <span className="text-[10px] text-slate-500">by</span>
            <span className="text-blue-400 font-bold hover:underline">TA Shanto</span>
          </a>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium">
            <Shield className="w-3 h-3" />
            <span className="hidden md:inline">100% Client-Side Privacy</span>
          </div>
        </nav>
      </div>
    </header>
  );
};

