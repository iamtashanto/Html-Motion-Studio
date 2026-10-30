'use client';

import React, { useEffect, useRef } from 'react';
import { useStudioStore } from '@/store/studioStore';
import { SandboxedPreview } from '../preview/SandboxedPreview';
import { UploadZone } from '../upload/UploadZone';
import { CompatibilityReportCard } from '../compatibility/CompatibilityReportCard';
import { AudioSection } from '../audio/AudioSection';
import { OutputSettings } from '../settings/OutputSettings';
import { ExportProgressModal } from '../export/ExportProgressModal';
import { ExportResultModal } from '../export/ExportResultModal';
import { DesktopCompanionBanner } from '../desktop/DesktopCompanionBanner';
import {
  Video,
  Play,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  HardDrive,
  Cpu,
} from 'lucide-react';

export const StudioWorkspace: React.FC = () => {
  const {
    initialize,
    project,
    exportSettings,
    compatibility,
    capabilities,
    isExporting,
    startExport,
    decodedAudio,
    audioSettings,
  } = useStudioStore();

  const captureCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleStartExport = () => {
    if (!captureCanvasRef.current) return;
    startExport(captureCanvasRef.current);
  };

  // Estimate memory required in MB
  const estimatedFrames = Math.round(exportSettings.durationSeconds * exportSettings.fps);
  const estimatedMemoryMb = Math.round(
    (exportSettings.width * exportSettings.height * 4 * Math.min(10, estimatedFrames)) / (1024 * 1024)
  );

  return (
    <div className="space-y-8">
      {/* Hidden offscreen/mirror canvas used by the render engine */}
      <canvas ref={captureCanvasRef} className="hidden" />

      {/* Main Studio Grid: Left preview & upload, Right settings & audio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Sandbox Preview + Code/Upload Tabs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Live Preview Screen */}
          <SandboxedPreview captureCanvasRef={captureCanvasRef} />

          {/* Upload, ZIP & Editor Management */}
          <UploadZone />

          {/* Compatibility Diagnostic Inspector */}
          <CompatibilityReportCard />
        </div>

        {/* Right Column (5 cols): Audio, Output Settings & Action CTA */}
        <div className="lg:col-span-5 space-y-6">
          {/* Output Settings Configuration */}
          <OutputSettings />

          {/* Audio Mixing Section */}
          <AudioSection />

          {/* Conversion Launch Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-blue-600/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                Memory Estimate: ~{estimatedMemoryMb} MB
              </span>
              <span className="font-mono text-blue-300">
                {estimatedFrames} frames @ {exportSettings.fps}fps
              </span>
            </div>

            {/* Warning if unsupported or desktop recommended */}
            {compatibility.overallStatus === 'unsupported' && (
              <div className="flex items-center gap-2 text-xs text-red-300 bg-red-950/40 border border-red-800/40 p-3 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>
                  Please provide a valid HTML markup file before initiating conversion.
                </span>
              </div>
            )}

            {/* Convert CTA Button */}
            <button
              onClick={handleStartExport}
              disabled={isExporting || compatibility.overallStatus === 'unsupported'}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-sm sm:text-base tracking-wide shadow-xl shadow-blue-500/25 flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <Video className="w-5 h-5 text-white group-hover:scale-110 transition" />
              <span>Convert HTML to {exportSettings.format.toUpperCase()} Video</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero server upload • Rendered locally in your browser memory</span>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal & Result Dialogs */}
      <ExportProgressModal />
      <ExportResultModal />

      {/* Desktop App Companion Section */}
      <DesktopCompanionBanner />
    </div>
  );
};

