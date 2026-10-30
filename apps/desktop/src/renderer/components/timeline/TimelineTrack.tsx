import React, { useRef, useState, useMemo } from 'react';
import { useDesktopStudioStore } from '../../store/desktopStudioStore';
import {
  Volume2,
  Clock,
  Sliders,
  Music,
  Scissors,
  ChevronsRight,
  PanelBottomClose,
  PanelBottomOpen,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
} from 'lucide-react';

export const TimelineTrack: React.FC = () => {
  const {
    currentTime,
    exportSettings,
    seek,
    isPlaying,
    setIsPlaying,
    restart,
    audioSettings,
    updateAudioSettings,
    audioFilePath,
    timelineHeight,
    timelineCollapsed,
    toggleTimeline,
  } = useDesktopStudioStore();

  const rulerRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<1 | 2 | 4>(1);

  const duration = exportSettings.durationSeconds;
  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    setIsScrubbing(true);
    setIsPlaying(false);
    updateSeekFromPointer(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isScrubbing) {
      updateSeekFromPointer(e);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isScrubbing) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setIsScrubbing(false);
    }
  };

  const updateSeekFromPointer = (e: React.PointerEvent) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const targetTime = (x / rect.width) * duration;
    seek(targetTime);
  };

  const stepFrame = (forward: boolean) => {
    const dt = 1 / (exportSettings.fps || 60);
    const target = forward ? Math.min(duration, currentTime + dt) : Math.max(0, currentTime - dt);
    seek(target);
  };

  // Generate tick marks across duration (memoized to avoid re-allocation on currentTime tick)
  const ticks = useMemo(() => {
    const totalTicks = Math.min(60 * zoomLevel, Math.max(5, Math.round(duration * 2 * zoomLevel)));
    return Array.from({ length: totalTicks + 1 }, (_, i) => {
      const time = (i / totalTicks) * duration;
      const isMajor = i % Math.max(1, 2 * zoomLevel) === 0;
      return { time, isMajor, pct: (i / totalTicks) * 100 };
    });
  }, [duration, zoomLevel]);

  if (timelineCollapsed) {
    return (
      <div className="h-9 bg-slate-950 border-t border-slate-800/80 px-4 flex items-center justify-between select-none text-xs shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTimeline}
            className="flex items-center gap-1.5 px-2 py-1 rounded text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
            title="Expand Timeline (T / Ctrl+J)"
            aria-label="Expand Timeline"
          >
            <PanelBottomOpen className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold text-[10px] uppercase text-slate-300">Timeline</span>
          </button>
          <div className="h-3 w-px bg-slate-800" />
          <div className="font-mono text-[11px]">
            <span className="text-blue-400 font-bold">{currentTime.toFixed(2)}s</span>
            <span className="text-slate-600 mx-1">/</span>
            <span className="text-slate-400">{duration.toFixed(2)}s</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
          </button>
          {audioFilePath && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-800/40 text-purple-300 flex items-center gap-1 font-mono">
              <Music className="w-3 h-3" />
              Audio Active
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ height: `${timelineHeight}px` }}
      className="bg-slate-950 border-t border-slate-800/80 flex flex-col select-none text-xs shrink-0 overflow-hidden"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Timeline Controls Header */}
      <div className="h-8 border-b border-slate-800/60 px-4 flex items-center justify-between bg-slate-900/60 text-slate-400 shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-200 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            Master Timeline
          </span>
          <span className="font-mono text-[11px] text-blue-400 font-bold">
            {currentTime.toFixed(2)}s / {duration.toFixed(2)}s
          </span>

          {/* Stepping controls */}
          <div className="flex items-center gap-0.5 ml-2 bg-slate-950 rounded-md border border-slate-800 p-0.5">
            <button
              onClick={() => stepFrame(false)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Step Back 1 Frame (Left Arrow)"
              aria-label="Step Back 1 Frame"
            >
              <SkipBack className="w-3 h-3" />
            </button>
            <button
              onClick={() => stepFrame(true)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Step Forward 1 Frame (Right Arrow)"
              aria-label="Step Forward 1 Frame"
            >
              <SkipForward className="w-3 h-3" />
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-950 rounded-md border border-slate-800 px-1 py-0.5">
            <span className="text-[9px] text-slate-500 font-mono">Zoom:</span>
            {([1, 2, 4] as const).map((z) => (
              <button
                key={z}
                onClick={() => setZoomLevel(z)}
                className={`px-1.5 py-0.2 rounded text-[9px] font-mono transition ${
                  zoomLevel === z ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {z}x
              </button>
            ))}
          </div>
        </div>

        {/* Audio Track Controls Summary & Collapse Button */}
        <div className="flex items-center gap-4 text-[11px]">
          {audioFilePath && (
            <div className="flex items-center gap-3">
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
                  aria-label="Audio Volume"
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
                  aria-label="Audio Start Offset in seconds"
                />
                <span className="text-[10px] text-slate-500">s</span>
              </div>
            </div>
          )}

          <button
            onClick={toggleTimeline}
            className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-800 transition"
            title="Collapse Timeline (T / Ctrl+J)"
            aria-label="Collapse Timeline"
          >
            <PanelBottomClose className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Ruler & Tracks Scroll Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-3 relative scrollbar-thin">
        <div style={{ width: zoomLevel > 1 ? `${zoomLevel * 100}%` : '100%' }} className="h-full flex flex-col justify-between relative min-w-full">
          {/* Time Ruler with Ticks */}
          <div
            ref={rulerRef}
            onPointerDown={handlePointerDown}
            role="slider"
            aria-label="Animation Timeline Scrubber"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={currentTime}
            className="h-7 w-full relative bg-slate-900/60 rounded-lg border border-slate-800/80 cursor-ew-resize flex items-end px-1"
          >
            {ticks.map((t, i) => (
              <div
                key={i}
                style={{ left: `${t.pct}%` }}
                className={`absolute bottom-0 flex flex-col items-center pointer-events-none ${t.isMajor ? 'h-full justify-between' : 'h-3'}`}
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
              <div className="w-3.5 h-3.5 bg-red-500 rounded-full -ml-[6px] -mt-1 shadow-md shadow-red-500/50 flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full" />
              </div>
            </div>
          </div>

          {/* Video Track Visualizer Bar */}
          <div
            onPointerDown={handlePointerDown}
            className="h-6 w-full bg-blue-950/30 border border-blue-600/30 rounded-lg flex items-center px-3 relative overflow-hidden cursor-pointer"
          >
            <div
              style={{ width: `${progressPct}%` }}
              className="absolute top-0 bottom-0 left-0 bg-blue-600/20 border-r border-blue-500/60 pointer-events-none"
            />
            <span className="text-[10px] font-bold text-blue-300 font-mono tracking-wide z-10 flex items-center gap-1.5">
              HTML ANIMATION TRACK ({exportSettings.width}×{exportSettings.height} @ {exportSettings.fps}fps)
            </span>
          </div>

          {/* Soundtrack Waveform Track */}
          <div className="h-6 w-full bg-purple-950/20 border border-purple-600/30 rounded-lg flex items-center px-3 relative overflow-hidden">
            {audioFilePath ? (
              <>
                {/* Audio Waveform visualizer bars */}
                <div className="absolute inset-0 flex items-center justify-around opacity-30 pointer-events-none px-2">
                  {Array.from({ length: 48 * zoomLevel }).map((_, idx) => (
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
              <span className="text-[10px] text-slate-500 italic">No audio track attached (Add from Inspector)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


