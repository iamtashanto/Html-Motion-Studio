'use client';

import React, { useState } from 'react';
import { useStudioStore } from '@/store/studioStore';
import { CompatibilityStatus } from '@html-motion-studio/shared';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Cpu,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldAlert,
  DownloadCloud,
} from 'lucide-react';

export const CompatibilityReportCard: React.FC = () => {
  const { compatibility } = useStudioStore();
  const [expanded, setExpanded] = useState(false);

  const getStatusBadge = (status: CompatibilityStatus) => {
    switch (status) {
      case 'ready':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
          label: 'Ready for export',
          classes: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30',
        };
      case 'limited':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
          label: 'Export with limitations',
          classes: 'bg-amber-950/60 text-amber-300 border-amber-500/30',
        };
      case 'desktop-recommended':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-orange-400" />,
          label: 'Requires desktop rendering',
          classes: 'bg-orange-950/60 text-orange-300 border-orange-500/30',
        };
      case 'unsupported':
      default:
        return {
          icon: <XCircle className="w-4 h-4 text-red-400" />,
          label: 'Unsupported',
          classes: 'bg-red-950/60 text-red-300 border-red-500/30',
        };
    }
  };

  const badge = getStatusBadge(compatibility.overallStatus);

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
      {/* Header bar */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800/80 bg-slate-950/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Compatibility Inspector
            </h3>
            <p className="text-[11px] text-slate-400">{compatibility.summary}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold shadow-sm ${badge.classes}`}
          >
            {badge.icon}
            <span>{badge.label}</span>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Desktop Recommendation Alert Banner */}
      {(compatibility.overallStatus === 'desktop-recommended' ||
        compatibility.overallStatus === 'limited') && (
        <div className="px-4 py-3 bg-gradient-to-r from-orange-950/40 to-amber-950/20 border-b border-orange-800/30 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-semibold text-orange-200">
                This project may work better with HTML Motion Studio Desktop.
              </h5>
              <p className="text-[11px] text-orange-300/80 mt-0.5">
                Complex WebGL, large memory assets, or long durations achieve deterministic, frame-accurate rendering with hardware GPU acceleration in our desktop app.
              </p>
            </div>
          </div>
          <a
            href="#desktop-download"
            className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-600/30 hover:bg-orange-600/50 border border-orange-500/40 text-orange-200 text-xs font-semibold transition"
          >
            <DownloadCloud className="w-3.5 h-3.5" />
            Get Desktop App
          </a>
        </div>
      )}

      {/* Inspection Check Items */}
      {expanded && (
        <div className="p-4 space-y-2 bg-slate-950/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {compatibility.checks.map((chk) => (
              <div
                key={chk.id}
                className="p-2.5 rounded-xl border border-slate-800/70 bg-slate-900/60 flex items-start gap-2"
              >
                {chk.status === 'ok' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                ) : chk.status === 'warning' ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                ) : chk.status === 'error' ? (
                  <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                ) : (
                  <HelpCircle className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold text-slate-200">{chk.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    {chk.details}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Static inspection disclaimer */}
          <div className="pt-2 text-[11px] text-slate-500 text-center italic">
            * Note: Static code inspection detects syntax patterns and dependencies, but cannot perfectly determine all runtime animation execution states.
          </div>
        </div>
      )}
    </div>
  );
};

