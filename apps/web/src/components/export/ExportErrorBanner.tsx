'use client';

import React from 'react';
import { useStudioStore } from '@/store/studioStore';
import { AlertCircle, RotateCcw, X, Info, Sparkles } from 'lucide-react';

interface ExportErrorBannerProps {
  onRetry: () => void;
}

export const ExportErrorBanner: React.FC<ExportErrorBannerProps> = ({ onRetry }) => {
  const { exportError, clearExportError, capabilities, exportSettings, updateExportSettings } =
    useStudioStore();

  if (!exportError) return null;

  const isWebCodecsError =
    exportError.toLowerCase().includes('webcodecs') ||
    exportError.toLowerCase().includes('encoder') ||
    exportError.toLowerCase().includes('h.264');

  const isCanvasTainted =
    exportError.toLowerCase().includes('taint') ||
    exportError.toLowerCase().includes('origin-clean') ||
    exportError.toLowerCase().includes('securityerror');

  const handleSwitchToMediaRecorder = () => {
    updateExportSettings({ engineStrategy: 'mediarecorder' });
    clearExportError();
    onRetry();
  };

  return (
    <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/60 shadow-xl space-y-3 animate-in fade-in duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-red-200">Export Unsuccessful</h4>
            <p className="text-xs text-red-300/90 mt-0.5 font-mono break-all">{exportError}</p>
          </div>
        </div>

        <button
          onClick={clearExportError}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          title="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Helpful suggestions based on the specific error */}
      {isCanvasTainted && (
        <div className="flex items-start gap-2 text-xs text-amber-300 bg-amber-950/30 border border-amber-800/40 p-2.5 rounded-xl">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Canvas security restrictions prevented pixel capture. External cross-origin resources
            or fonts without CORS headers can taint the rendering canvas. Try removing external CDN
            links or bundling images locally.
          </span>
        </div>
      )}

      {isWebCodecsError && exportSettings.engineStrategy !== 'mediarecorder' && (
        <div className="flex items-start gap-2 text-xs text-blue-300 bg-blue-950/30 border border-blue-800/40 p-2.5 rounded-xl">
          <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <span>
            Hardware encoding encountered a browser limit. You can retry with MediaRecorder fallback
            mode for wider compatibility.
          </span>
        </div>
      )}

      {/* Action CTA Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {isWebCodecsError && exportSettings.engineStrategy !== 'mediarecorder' && (
          <button
            onClick={handleSwitchToMediaRecorder}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
          >
            Retry with MediaRecorder
          </button>
        )}

        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-800/50 hover:bg-red-700/60 text-red-200 border border-red-700/50 text-xs font-semibold transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry Export</span>
        </button>

        <button
          onClick={clearExportError}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

