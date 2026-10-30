import React from 'react';
import { useDesktopStudioStore } from '../../store/desktopStudioStore';
import {
  CheckCircle2,
  X,
  Play,
  FolderOpen,
  Film,
  HardDrive,
  Clock,
  Sparkles,
} from 'lucide-react';

export const ExportSuccessDialog: React.FC = () => {
  const {
    exportResult,
    clearExportResult,
    openExportedVideo,
    showExportInFolder,
  } = useDesktopStudioStore();

  if (!exportResult) return null;

  const { outputFilePath, validation } = exportResult;
  const fileName = outputFilePath.split(/[/\\]/).pop() || 'video.mp4';
  const sizeMb = (validation.sizeBytes / (1024 * 1024)).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Video Export Successful!</h3>
              <p className="text-xs text-slate-400">
                Verified with local FFprobe • Ready for playback
              </p>
            </div>
          </div>

          <button
            onClick={clearExportResult}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File & Validation Details Card */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-200 text-xs truncate max-w-sm">
              {fileName}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
              FFprobe Verified
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/60 text-xs">
            <div>
              <div className="text-[10px] text-slate-500">Codec</div>
              <div className="font-mono font-bold text-slate-200 mt-0.5 uppercase">
                {validation.video?.codec || 'H.264'}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500">Dimensions</div>
              <div className="font-mono font-bold text-slate-200 mt-0.5">
                {validation.video?.width}×{validation.video?.height}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500">FPS</div>
              <div className="font-mono font-bold text-slate-200 mt-0.5">
                {validation.video?.fps || 60} fps
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500">File Size</div>
              <div className="font-mono font-bold text-slate-200 mt-0.5">
                {sizeMb} MB
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={openExportedVideo}
            className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition"
          >
            <Play className="w-4 h-4" />
            <span>Open in Player</span>
          </button>

          <button
            onClick={showExportInFolder}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center justify-center gap-2 transition"
          >
            <FolderOpen className="w-4 h-4 text-amber-400" />
            <span>Show in Folder</span>
          </button>
        </div>
      </div>
    </div>
  );
};
