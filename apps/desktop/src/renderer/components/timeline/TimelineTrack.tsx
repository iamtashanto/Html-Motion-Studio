import React, { useRef, useState } from 'react';
import { useDesktopStudioStore } from '../../store/desktopStudioStore';
import {
  Volume2,
  Clock,
  Sliders,
  Music,
  Scissors,
  ChevronsRight,
} from 'lucide-react';

export const TimelineTrack: React.FC = () => {
  const {
    currentTime,
    exportSettings,
    seek,
    setIsPlaying,
    audioSettings,
    updateAudioSettings,
    audioFilePath,
  } = useDesktopStudioStore();

  const rulerRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);

  const duration = exportSettings.durationSeconds;
  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsScrubbing(true);
    setIsPlaying(false);
    updateSeekFromPointer(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isScrubbing) {
      updateSeekFromPointer(e);
    }
  };

  const handlePointerUp = () => {
    setIsScrubbing(false);
  };

  const updateSeekFromPointer = (e: React.PointerEvent) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const targetTime = (x / rect.width) * duration;
    seek(targetTime);
  };

  // Generate tick marks across duration
  const totalTicks = Math.min(60, Math.max(5, Math.round(duration * 2)));
  const ticks = Array.from({ length: totalTicks + 1 }, (_, i) => {
    const time = (i / totalTicks) * duration;
    const isMajor = i % 2 === 0;
    return { time, isMajor, pct: (i / totalTicks) * 100 };
  });

  return (
    <div
      className="h-36 bg-slate-950 border-t border-slate-800/80 flex flex-col select-none text-xs"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Timeline Controls Header */}
      <div className="h-8 border-b border-slate-800/60 px-4 flex items-center justify-between bg-slate-900/60 text-slate-400">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-200 uppercase tracking-wider text-[10px]">
            Master Timeline
          </span>
          <span className="font-mono text-[11px] text-blue-400">
            {currentTime.toFixed(2)}s / {duration.toFixed(2)}s
          </span>
        </div>

        {/* Audio Track Controls Summary */}
        {audioFilePath && (
          <div className="flex items-center gap-4 text-[11px]">
            {/* Volume slider */}
            <div className="flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-purple-400" />
              <input
                type="range"
                min="0"
                max="2"
                step="0.05"
                value={audioSettings.volume}
                onChange={(e) => updateAudioSettings({ volume: parseFloat(e.target.value) })}
                className="w-16 accent-purple-500 cursor-pointer h-1 bg-slate-800 rounded"
              />
              <span className="font-mono text-[10px] text-slate-400">
                {Math.round(audioSettings.volume * 100)}%
              </span>
            </div>

            {/* Delay offset */}
            <div className="flex items-center gap-1">
              <ChevronsRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] text-slate-500">Offset:</span>
              <input
                type="number"
                min="0"
                max={duration}
                step="0.1"
                value={audioSettings.startOffsetSeconds}
                onChange={(e) => updateAudioSettings({ startOffsetSeconds: parseFloat(e.target.value) || 0 })}
                className="w-12 bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-[10px] font-mono text-white text-center"
              />
              <span className="text-[10px] text-slate-500">s</span>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Ruler & Tracks Container */}
      <div className="flex-1 flex flex-col justify-between p-3 relative">
        {/* Time Ruler with Ticks */}
        <div
          ref={rulerRef}
          onPointerDown={handlePointerDown}
          className="h-7 w-full relative bg-slate-900/50 rounded-lg border border-slate-800/80 cursor-ew-resize flex items-end px-1"
        >
          {ticks.map((t, i) => (
            <div
              key={i}
              style={{ left: `${t.pct}%` }}
              className={`absolute bottom-0 flex flex-col items-center ${t.isMajor ? 'h-full justify-between' : 'h-3'}`}
            >
              {t.isMajor && (
                <span className="text-[9px] font-mono text-slate-500 select-none pt-0.5">
                  {t.time.toFixed(1)}s
                </span>
              )}
              <div className={`w-[1px] ${t.isMajor ? 'h-2 bg-slate-600' : 'h-1.5 bg-slate-800'}`} />
            </div>
          ))}

          {/* Draggable Red Playhead Needle */}
          <div
            style={{ left: `${progressPct}%` }}
            className="absolute top-0 bottom-0 w-[2px] bg-red-500 pointer-events-none z-20 shadow-md"
          >
            <div className="w-3 h-3 bg-red-500 rounded-full -ml-[5px] -mt-1 shadow-md shadow-red-500/50" />
          </div>
        </div>

        {/* Video Track Visualizer Bar */}
        <div className="h-6 w-full bg-blue-950/30 border border-blue-600/30 rounded-lg flex items-center px-3 relative overflow-hidden">
          <div
            style={{ width: `${progressPct}%` }}
            className="absolute top-0 bottom-0 left-0 bg-blue-600/20 border-r border-blue-500/60 pointer-events-none"
          />
          <span className="text-[10px] font-bold text-blue-300 font-mono tracking-wide z-10 flex items-center gap-1.5">
            HTML ANIMATION TRACK (1080p @ {exportSettings.fps}fps)
          </span>
        </div>

        {/* Soundtrack Waveform Track */}
        <div className="h-6 w-full bg-purple-950/20 border border-purple-600/30 rounded-lg flex items-center px-3 relative overflow-hidden">
          {audioFilePath ? (
            <>
              {/* Fake Audio Waveform bars for visual cue */}
              <div className="absolute inset-0 flex items-center justify-around opacity-30 pointer-events-none px-2">
                {Array.from({ length: 48 }).map((_, idx) => (
                  <div
                    key={idx}
                    style={{ height: `${20 + ((idx * 17) % 70)}%` }}
                    className="w-1 bg-purple-400 rounded-full"
                  />
                ))}
              </div>
              <span className="text-[10px] font-bold text-purple-300 font-mono z-10 flex items-center gap-1.5">
                <Music className="w-3 h-3 text-purple-400" />
                AUDIO: {audioSettings.fileName || 'Soundtrack'}
              </span>
            </>
          ) : (
            <span className="text-[10px] text-slate-500 italic">No audio track attached</span>
          )}
        </div>
      </div>
    </div>
  );
};
