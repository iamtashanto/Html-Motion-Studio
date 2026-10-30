import React from 'react';
import { useDesktopStudioStore } from '../../store/desktopStudioStore';
import { Loader2, Film, Clock, Zap, XCircle } from 'lucide-react';

export const ExportProgressDialog: React.FC = () => {
  const { isExporting, exportProgress, cancelExport } = useDesktopStudioStore();

  if (!isExporting || !exportProgress) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Desktop Rendering Pipeline
              </h3>
              <p className="text-[11px] text-slate-400">
                Chromium frame stepping & FFmpeg pipe
              </p>
            </div>
          </div>

          <button
            onClick={cancelExport}
            className="px-3 py-1.5 rounded-xl border border-red-500/40 bg-red-950/30 hover:bg-red-900/50 text-red-300 text-xs font-semibold transition"
          >
            Cancel
          </button>
        </div>

        {/* Progress Bar & Status Message */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 font-mono">
              {exportProgress.percentage}%
            </span>
            <span className="text-xs text-slate-400 font-medium truncate max-w-[240px]">
              {exportProgress.message}
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 rounded-full transition-all duration-150"
              style={{ width: `${Math.max(2, exportProgress.percentage)}%` }}
            />
          </div>
        </div>

        {/* Real Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs">
          <div>
            <div className="text-slate-500 flex items-center gap-1 text-[10px]">
              <Film className="w-3 h-3 text-blue-400" />
              Frames
            </div>
            <div className="font-mono font-bold text-slate-200 mt-0.5">
              {exportProgress.currentFrame} / {exportProgress.totalFrames}
            </div>
          </div>

          <div>
            <div className="text-slate-500 flex items-center gap-1 text-[10px]">
              <Clock className="w-3 h-3 text-blue-400" />
              Elapsed
            </div>
            <div className="font-mono font-bold text-slate-200 mt-0.5">
              {(exportProgress.elapsedMs / 1000).toFixed(1)}s
            </div>
          </div>

          <div>
            <div className="text-slate-500 flex items-center gap-1 text-[10px]">
              <Zap className="w-3 h-3 text-blue-400" />
              Speed
            </div>
            <div className="font-mono font-bold text-slate-200 mt-0.5">
              {exportProgress.currentFps} FPS
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
