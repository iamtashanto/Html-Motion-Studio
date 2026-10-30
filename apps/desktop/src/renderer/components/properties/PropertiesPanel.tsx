import React, { useState } from 'react';
import { useDesktopStudioStore } from '../../store/desktopStudioStore';
import {
  Settings,
  Film,
  Music,
  Sliders,
  FolderOpen,
  Download,
  Cpu,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

export const PropertiesPanel: React.FC = () => {
  const {
    exportSettings,
    updateExportSettings,
    exportStrategy,
    setExportStrategy,
    outputDirectory,
    outputFilename,
    setOutputFilename,
    selectSaveDestination,
    audioSettings,
    updateAudioSettings,
    startExport,
    isExporting,
  } = useDesktopStudioStore();

  const [activeTab, setActiveTab] = useState<'export' | 'audio' | 'strategy'>('export');

  const totalFrames = Math.round(exportSettings.durationSeconds * exportSettings.fps);

  return (
    <aside className="w-80 bg-slate-950 border-l border-slate-800/80 flex flex-col h-[calc(100vh-3.5rem)] select-none text-xs">
      {/* Tab Navigation Header */}
      <div className="flex border-b border-slate-800/80 bg-slate-900/40 p-1.5 gap-1">
        <button
          onClick={() => setActiveTab('export')}
          className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition ${
            activeTab === 'export'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>

        <button
          onClick={() => setActiveTab('strategy')}
          className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition ${
            activeTab === 'strategy'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Strategy</span>
        </button>

        <button
          onClick={() => setActiveTab('audio')}
          className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition ${
            activeTab === 'audio'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          <span>Audio</span>
        </button>
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* TAB 1: Export Settings */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            {/* Resolution Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300">Resolution Preset</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: '1080p Full HD', w: 1920, h: 1080, res: '1080p' },
                  { label: '4K Ultra HD', w: 3840, h: 2160, res: '4k' },
                  { label: '720p HD', w: 1280, h: 720, res: '720p' },
                  { label: '1440p 2K', w: 2560, h: 1440, res: '1440p' },
                ].map((item) => (
                  <button
                    key={item.res}
                    onClick={() =>
                      updateExportSettings({
                        resolution: item.res as '720p' | '1080p' | '1440p' | '4k',
                        width: item.w,
                        height: item.h,
                      })
                    }
                    className={`p-2 rounded-xl border text-left transition ${
                      exportSettings.width === item.w && exportSettings.height === item.h
                        ? 'border-blue-500 bg-blue-950/40 text-blue-200 ring-1 ring-blue-500/30'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-xs text-slate-200">{item.label}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {item.w}×{item.h}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Rate & Aspect Ratio */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300">Frame Rate</label>
                <select
                  value={exportSettings.fps}
                  onChange={(e) => updateExportSettings({ fps: parseInt(e.target.value, 10) as 24 | 30 | 60 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 font-mono focus:border-blue-500 focus:outline-none"
                >
                  <option value={60}>60 FPS (Pro Motion)</option>
                  <option value={30}>30 FPS (Standard)</option>
                  <option value={24}>24 FPS (Cinematic)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300">Format</label>
                <select
                  value={exportSettings.format}
                  onChange={(e) => updateExportSettings({ format: e.target.value as 'mp4' | 'webm' | 'mov' })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 font-mono focus:border-blue-500 focus:outline-none"
                >
                  <option value="mp4">MP4 (H.264)</option>
                  <option value="webm">WebM (VP9)</option>
                  <option value="mov">ProRes 4444 (.mov)</option>
                </select>
              </div>
            </div>

            {/* Duration Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-300">Duration</label>
                <span className="font-mono text-blue-400 font-bold">
                  {exportSettings.durationSeconds} seconds ({totalFrames} frames)
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="60"
                step="0.5"
                value={exportSettings.durationSeconds}
                onChange={(e) => updateExportSettings({ durationSeconds: parseFloat(e.target.value) })}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Output Destination Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300">Save Destination</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={outputFilename}
                  onChange={(e) => setOutputFilename(e.target.value)}
                  placeholder="Output filename"
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={selectSaveDestination}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="Choose save folder"
                >
                  <FolderOpen className="w-4 h-4" />
                </button>
              </div>
              {outputDirectory && (
                <div className="text-[10px] text-slate-500 font-mono truncate">
                  Target: {outputDirectory}/{outputFilename}.{exportSettings.format}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Rendering Strategy Selection */}
        {activeTab === 'strategy' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300">
                Rendering Engine Pipeline
              </label>

              {/* Strategy A: Deterministic Adapter */}
              <div
                onClick={() => setExportStrategy('adapter')}
                className={`p-3 rounded-2xl border cursor-pointer transition ${
                  exportStrategy === 'adapter'
                    ? 'border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500/30'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Strategy A: Deterministic Adapter
                  </span>
                  {exportStrategy === 'adapter' && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500 text-white">
                      SELECTED
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Evaluates <code className="text-indigo-300">window.__HTML_MOTION_STUDIO__</code>.
                  Supports exact synthetic timestamps, seeking, and frame-accurate canvas drawing.
                </p>
              </div>

              {/* Strategy B: Compatibility Rendering */}
              <div
                onClick={() => setExportStrategy('compatibility')}
                className={`p-3 rounded-2xl border cursor-pointer transition ${
                  exportStrategy === 'compatibility'
                    ? 'border-blue-500 bg-blue-950/40 ring-1 ring-blue-500/30'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-blue-300 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-blue-400" />
                    Strategy B: Compatibility Capture
                  </span>
                  {exportStrategy === 'compatibility' && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500 text-white">
                      SELECTED
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Controlled Chromium frame capture for arbitrary CSS keyframes, SVG transforms, and DOM animations.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2 text-[11px] text-slate-400">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                Desktop edition captures frames in an isolated Chromium process and encodes via local FFmpeg using bounded streaming.
              </span>
            </div>
          </div>
        )}

        {/* TAB 3: Audio Properties */}
        {activeTab === 'audio' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300">Master Volume</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.05"
                  value={audioSettings.volume}
                  onChange={(e) => updateAudioSettings({ volume: parseFloat(e.target.value) })}
                  className="flex-1 accent-purple-500 cursor-pointer h-1.5 bg-slate-800 rounded"
                />
                <span className="font-mono text-purple-300 font-bold w-12 text-right">
                  {Math.round(audioSettings.volume * 100)}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300">Fade In (s)</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={audioSettings.fadeInSeconds}
                  onChange={(e) => updateAudioSettings({ fadeInSeconds: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300">Fade Out (s)</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={audioSettings.fadeOutSeconds}
                  onChange={(e) => updateAudioSettings({ fadeOutSeconds: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300">Start Delay (s)</label>
              <input
                type="number"
                min="0"
                max={exportSettings.durationSeconds}
                step="0.1"
                value={audioSettings.startOffsetSeconds}
                onChange={(e) => updateAudioSettings({ startOffsetSeconds: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Panel Bottom Convert CTA */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950">
        <button
          onClick={startExport}
          disabled={isExporting}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition transform active:scale-95 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Render {exportSettings.format.toUpperCase()} Video</span>
        </button>
      </div>
    </aside>
  );
};
