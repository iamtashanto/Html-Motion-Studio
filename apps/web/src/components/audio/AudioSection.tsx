'use client';

import React, { useRef, useState } from 'react';
import { useStudioStore } from '@/store/studioStore';
import { AudioSourceMode } from '@html-motion-studio/shared';
import {
  Music,
  Upload,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Trash2,
  Sliders,
  Scissors,
  Clock,
  Radio,
  AlertCircle,
} from 'lucide-react';

export const AudioSection: React.FC = () => {
  const {
    audioSettings,
    decodedAudio,
    loadAudioFile,
    updateAudioSettings,
    clearAudio,
    exportSettings,
  } = useStudioStore();

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      loadAudioFile(e.target.files[0]);
    }
  };

  const toggleAudioPlayback = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.currentTime = audioSettings.trimInSeconds;
      audioRef.current.play().catch(() => {});
      setIsPlayingAudio(true);
    }
  };

  const isAudioLonger =
    decodedAudio && decodedAudio.duration > exportSettings.durationSeconds;

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-800/50 flex items-center justify-center text-purple-400">
            <Music className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Audio Soundtrack Engine
            </h3>
            <p className="text-[11px] text-slate-400">
              Upload external background score or configure animation audio
            </p>
          </div>
        </div>

        {/* Source Mode Selector */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {(
            [
              { id: 'none', label: 'No Audio' },
              { id: 'external', label: 'External Score' },
              { id: 'html', label: 'HTML Only' },
              { id: 'both', label: 'Mix Both' },
            ] as const
          ).map((mode) => (
            <button
              key={mode.id}
              onClick={() => updateAudioSettings({ sourceMode: mode.id as AudioSourceMode })}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                audioSettings.sourceMode === mode.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Upload Audio Dropzone if External or Both */}
        {(audioSettings.sourceMode === 'external' || audioSettings.sourceMode === 'both') && (
          <div>
            {!decodedAudio ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-800 hover:border-purple-500/50 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition bg-slate-950/40 text-center"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp3,.wav,.m4a,.aac,.ogg"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-2">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-slate-200">
                  Select Audio Track (MP3, WAV, M4A)
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Decoded client-side via Web Audio API for precise video muxing
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950 border border-purple-900/40 space-y-3">
                {/* Audio track info bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleAudioPlayback}
                      className="w-8 h-8 rounded-lg bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-md transition"
                    >
                      {isPlayingAudio ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>
                    <div>
                      <div className="text-xs font-semibold text-slate-200 truncate max-w-xs">
                        {audioSettings.fileName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {decodedAudio.duration.toFixed(1)}s duration • {decodedAudio.sampleRate} Hz
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={clearAudio}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-900 transition"
                    title="Remove audio track"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Simulated Waveform Visualization */}
                <div className="h-10 bg-slate-900/80 rounded-lg p-1.5 flex items-end gap-0.5 overflow-hidden">
                  {decodedAudio.peakWaveform.map((peak, idx) => (
                    <div
                      key={idx}
                      className="flex-1 bg-purple-500/70 hover:bg-purple-400 rounded-t transition-all"
                      style={{ height: `${Math.max(15, peak * 100)}%` }}
                    />
                  ))}
                </div>

                {/* Hidden Audio Player for preview */}
                {audioSettings.blobUrl && (
                  <audio
                    ref={audioRef}
                    src={audioSettings.blobUrl}
                    onEnded={() => setIsPlayingAudio(false)}
                    className="hidden"
                  />
                )}

                {/* Audio is longer warning */}
                {isAudioLonger && (
                  <div className="flex items-center gap-2 text-[11px] text-amber-300 bg-amber-950/30 border border-amber-900/40 px-3 py-1.5 rounded-lg">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>
                      Audio ({decodedAudio.duration.toFixed(1)}s) is longer than target video (
                      {exportSettings.durationSeconds}s). Audio will be cleanly trimmed or looped per settings.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Audio parameter controls (Volume, Offsets, Trimming, Fades) */}
        {decodedAudio && (audioSettings.sourceMode === 'external' || audioSettings.sourceMode === 'both') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Volume Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                  Soundtrack Volume
                </span>
                <span className="font-mono text-purple-300 font-semibold">
                  {Math.round(audioSettings.volume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.05"
                value={audioSettings.volume}
                onChange={(e) => updateAudioSettings({ volume: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Start Offset */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  Start Delay
                </span>
                <span className="font-mono text-purple-300 font-semibold">
                  {audioSettings.startOffsetSeconds.toFixed(1)}s
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={audioSettings.startOffsetSeconds}
                onChange={(e) =>
                  updateAudioSettings({ startOffsetSeconds: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Fade In */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Fade In</span>
                <span className="font-mono text-purple-300 font-semibold">
                  {audioSettings.fadeInSeconds.toFixed(1)}s
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={audioSettings.fadeInSeconds}
                onChange={(e) =>
                  updateAudioSettings({ fadeInSeconds: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Fade Out */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Fade Out</span>
                <span className="font-mono text-purple-300 font-semibold">
                  {audioSettings.fadeOutSeconds.toFixed(1)}s
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={audioSettings.fadeOutSeconds}
                onChange={(e) =>
                  updateAudioSettings({ fadeOutSeconds: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

