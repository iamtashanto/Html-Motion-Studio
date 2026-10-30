'use client';

import React from 'react';
import { useStudioStore } from '@/store/studioStore';
import { AspectRatioType, ResolutionPreset, FpsPreset, OutputFormat, DurationPolicy, QualityPreset } from '@html-motion-studio/shared';
import {
  Sliders,
  Ratio,
  Monitor,
  Film,
  Zap,
  Clock,
  FileVideo,
  Layers,
  Settings,
  HelpCircle,
} from 'lucide-react';

export const OutputSettings: React.FC = () => {
  const {
    exportSettings,
    updateExportSettings,
    setAspectRatio,
    setResolution,
    capabilities,
    decodedAudio,
  } = useStudioStore();

  const handleRatioChange = (ratio: AspectRatioType) => {
    setAspectRatio(ratio);
  };

  const handleResolutionChange = (res: ResolutionPreset) => {
    setResolution(res);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-950/80 border border-blue-800/50 flex items-center justify-center text-blue-400">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Output Encoding Settings
            </h3>
            <p className="text-[11px] text-slate-400">
              Configure format container, frame rate, aspect ratio, and bitrates
            </p>
          </div>
        </div>

        {/* Engine Strategy Pill */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400">Engine:</span>
          <select
            value={exportSettings.engineStrategy}
            onChange={(e) =>
              updateExportSettings({
                engineStrategy: e.target.value as 'auto' | 'webcodecs' | 'mediarecorder' | 'canvas',
              })
            }
            className="bg-slate-950 border border-slate-800 text-blue-400 rounded-lg px-2 py-1 text-xs font-semibold"
          >
            <option value="auto">Auto (Best for Device)</option>
            <option value="webcodecs">WebCodecs + MP4 Muxer</option>
            <option value="mediarecorder">MediaRecorder Stream</option>
          </select>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Aspect Ratio Selector */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <Ratio className="w-3.5 h-3.5 text-blue-400" />
            Aspect Ratio
          </label>
          <div className="grid grid-cols-5 gap-2">
            {(
              [
                { id: '16:9', label: '16:9', sub: 'Landscape' },
                { id: '9:16', label: '9:16', sub: 'Story/Reels' },
                { id: '1:1', label: '1:1', sub: 'Square' },
                { id: '4:5', label: '4:5', sub: 'Portrait' },
                { id: 'custom', label: 'Custom', sub: 'Pixels' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => handleRatioChange(item.id as AspectRatioType)}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center ${
                  exportSettings.aspectRatio === item.id
                    ? 'border-blue-500 bg-blue-950/40 text-blue-200 shadow-sm'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="text-xs font-bold">{item.label}</span>
                <span className="text-[10px] text-slate-500 mt-0.5">{item.sub}</span>
              </button>
            ))}
          </div>

          {/* Custom Dimension Inputs */}
          {exportSettings.aspectRatio === 'custom' && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <span className="text-[11px] text-slate-400">Width (px)</span>
                <input
                  type="number"
                  min="240"
                  max="3840"
                  step="2"
                  value={exportSettings.width}
                  onChange={(e) =>
                    updateExportSettings({ width: parseInt(e.target.value) || 1280 })
                  }
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Height (px)</span>
                <input
                  type="number"
                  min="240"
                  max="3840"
                  step="2"
                  value={exportSettings.height}
                  onChange={(e) =>
                    updateExportSettings({ height: parseInt(e.target.value) || 720 })
                  }
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Resolution & FPS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Resolution */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-blue-400" />
              Resolution
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['720p', '1080p', '1440p', '4k'] as const).map((res) => (
                <button
                  key={res}
                  onClick={() => handleResolutionChange(res)}
                  className={`py-2 rounded-lg border text-center text-xs font-semibold uppercase transition ${
                    exportSettings.resolution === res
                      ? 'border-blue-500 bg-blue-600 text-white'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>

          {/* Framerate (FPS) */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-blue-400" />
              Framerate (FPS)
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {([24, 30, 60] as const).map((fps) => (
                <button
                  key={fps}
                  onClick={() => updateExportSettings({ fps: fps as FpsPreset })}
                  className={`py-2 rounded-lg border text-center text-xs font-semibold transition ${
                    exportSettings.fps === fps
                      ? 'border-blue-500 bg-blue-600 text-white'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {fps} FPS
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Output Format Container */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <FileVideo className="w-3.5 h-3.5 text-blue-400" />
            Video Format Container
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => updateExportSettings({ format: 'mp4' })}
              className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                exportSettings.format === 'mp4'
                  ? 'border-blue-500 bg-blue-950/40 text-blue-200'
                  : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="text-xs font-bold text-white">MP4 (H.264 / AAC)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Universal compatibility for social media and video players
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                Recommended
              </span>
            </button>

            <button
              onClick={() => updateExportSettings({ format: 'webm' })}
              className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                exportSettings.format === 'webm'
                  ? 'border-blue-500 bg-blue-950/40 text-blue-200'
                  : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="text-xs font-bold text-white">WebM (VP9 / Opus)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Open web format with high compression efficiency
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                Fallback
              </span>
            </button>
          </div>
        </div>

        {/* Duration Policy & Total Duration Slider */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              Duration Policy
            </span>
            <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-xs">
              {(
                [
                  { id: 'project', label: 'Animation' },
                  { id: 'audio', label: 'Audio Track' },
                  { id: 'custom', label: 'Custom' },
                ] as const
              ).map((pol) => (
                <button
                  key={pol.id}
                  onClick={() => {
                    let dur = exportSettings.durationSeconds;
                    if (pol.id === 'audio' && decodedAudio) {
                      dur = Math.round(decodedAudio.duration);
                    }
                    updateExportSettings({
                      durationPolicy: pol.id as DurationPolicy,
                      durationSeconds: dur,
                    });
                  }}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition ${
                    exportSettings.durationPolicy === pol.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {pol.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-400">Export Timeline Duration</span>
            <span className="text-xs font-mono font-bold text-blue-400">
              {exportSettings.durationSeconds.toFixed(1)} seconds (
              {Math.round(exportSettings.durationSeconds * exportSettings.fps)} frames)
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="60"
            step="0.5"
            value={exportSettings.durationSeconds}
            onChange={(e) =>
              updateExportSettings({
                durationSeconds: parseFloat(e.target.value),
                durationPolicy: 'custom',
              })
            }
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>1.0s</span>
            <span>Safeguard max: 60s for in-browser memory</span>
            <span>60.0s</span>
          </div>
        </div>

        {/* Video Bitrate & Output Filename */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
              Video Bitrate ({exportSettings.videoBitrateMbps} Mbps)
            </label>
            <input
              type="range"
              min="2"
              max="20"
              step="1"
              value={exportSettings.videoBitrateMbps}
              onChange={(e) =>
                updateExportSettings({ videoBitrateMbps: parseInt(e.target.value) })
              }
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
              Export Filename
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={exportSettings.filename}
                onChange={(e) => updateExportSettings({ filename: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-l-lg p-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
              <span className="px-3 py-2 bg-slate-800 border-y border-r border-slate-700 rounded-r-lg text-xs text-slate-400 font-mono">
                .{exportSettings.format}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

