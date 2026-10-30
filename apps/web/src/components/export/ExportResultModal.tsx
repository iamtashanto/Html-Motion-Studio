'use client';

import React, { useRef, useState } from 'react';
import { useStudioStore } from '@/store/studioStore';
import {
  Download,
  CheckCircle2,
  X,
  Play,
  RotateCcw,
  Film,
  HardDrive,
  Clock,
  Sparkles,
} from 'lucide-react';

export const ExportResultModal: React.FC = () => {
  const { exportResult, clearExportResult } = useStudioStore();
  const [videoError, setVideoError] = useState(false);

  if (!exportResult) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = exportResult.url;
    a.download = exportResult.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const fileSizeFormatted =
    exportResult.sizeBytes > 1024 * 1024
      ? `${(exportResult.sizeBytes / (1024 * 1024)).toFixed(2)} MB`
      : `${(exportResult.sizeBytes / 1024).toFixed(1)} KB`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Export Complete!
              </h3>
              <p className="text-xs text-slate-400">
                Your video has been rendered and validated
              </p>
            </div>
          </div>

          <button
            onClick={clearExportResult}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Preview */}
        <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800 aspect-video flex items-center justify-center">
          <video
            src={exportResult.url}
            controls
            autoPlay
            loop
            onError={() => setVideoError(true)}
            className="w-full h-full object-contain"
          />
          {videoError && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-4 text-center">
              <p className="text-xs text-red-400 font-semibold">
                Browser preview codec notice
              </p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                The encoded container is ready for download and will play normally in your system media player.
              </p>
            </div>
          )}
        </div>

        {/* Video Metadata Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
          <div>
            <div className="text-slate-500 flex items-center gap-1">
              <Film className="w-3 h-3 text-emerald-400" />
              Dimensions
            </div>
            <div className="font-mono font-bold text-slate-200 mt-0.5">
              {exportResult.width}×{exportResult.height}
            </div>
          </div>

          <div>
            <div className="text-slate-500 flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-emerald-400" />
              File Size
            </div>
            <div className="font-mono font-bold text-slate-200 mt-0.5">
              {fileSizeFormatted}
            </div>
          </div>

          <div>
            <div className="text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-400" />
              Duration
            </div>
            <div className="font-mono font-bold text-slate-200 mt-0.5">
              {exportResult.durationSeconds.toFixed(1)}s
            </div>
          </div>

          <div>
            <div className="text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Format
            </div>
            <div className="font-mono font-bold text-slate-200 mt-0.5 uppercase">
              {exportResult.format}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-600/25 transition active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            Download {exportResult.format.toUpperCase()} Video
          </button>

          <button
            onClick={clearExportResult}
            className="py-3 px-4 rounded-2xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

