import React, { useRef, useState, useMemo } from 'react';
import { useDesktopStudioStore } from '../../store/desktopStudioStore';
import {
  Volume2,
  VolumeX,
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
  BookmarkPlus,
  GripVertical,
  Repeat,
  Sparkles,
} from 'lucide-react';

export const TimelineTrack: React.FC = () => {
  const {
    currentTime,
    exportSettings,
    updateExportSettings,
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
  const trackRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<1 | 2 | 4>(1);
  const [timeDisplayMode, setTimeDisplayMode] = useState<'seconds' | 'frames'>('seconds');
  const [markers, setMarkers] = useState<number[]>([1.0, 2.5]);
  const [isDraggingDuration, setIsDraggingDuration] = useState(false);
  const [isDraggingAudio, setIsDraggingAudio] = useState(false);

  const dragRef = useRef<{
    startX: number;
    startVal: number;
  }>({ startX: 0, startVal: 0 });

  const duration = exportSettings.durationSeconds;
  const fps = exportSettings.fps || 60;
  const currentFrame = Math.round(currentTime * fps);
  const totalFrames = Math.round(duration * fps);
  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Scrubbing & seeking handlers
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
    } else if (isDraggingDuration && trackRef.current) {
      const deltaX = e.clientX - dragRef.current.startX;
      const rect = trackRef.current.getBoundingClientRect();
      const deltaSec = (deltaX / rect.width) * dragRef.current.startVal;
      const newDur = Math.max(1, Math.min(60, Math.round((dragRef.current.startVal + deltaSec) * 10) / 10));
      updateExportSettings({ durationSeconds: newDur });
    } else if (isDraggingAudio && trackRef.current) {
      const deltaX = e.clientX - dragRef.current.startX;
      const rect = trackRef.current.getBoundingClientRect();
      const deltaSec = (deltaX / rect.width) * duration;
      const newOffset = Math.max(0, Math.min(duration, Math.round((dragRef.current.startVal + deltaSec) * 10) / 10));
      updateAudioSettings({ startOffsetSeconds: newOffset });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isScrubbing) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setIsScrubbing(false);
    }
    if (isDraggingDuration) setIsDraggingDuration(false);
    if (isDraggingAudio) setIsDraggingAudio(false);
  };

  const updateSeekFromPointer = (e: React.PointerEvent) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const targetTime = (x / rect.width) * duration;
    seek(targetTime);
  };

  const stepFrame = (forward: boolean) => {
    const dt = 1 / fps;
    const target = forward ? Math.min(duration, currentTime + dt) : Math.max(0, currentTime - dt);
    seek(target);
  };

  const addMarkerAtPlayhead = () => {
    const rounded = Math.round(currentTime * 100) / 100;
    if (!markers.includes(rounded)) {
      setMarkers([...markers, rounded].sort((a, b) => a - b));
    }
  };

  const removeMarker = (markerTime: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setMarkers(markers.filter((m) => Math.abs(m - markerTime) > 0.01));
  };

  // Generate tick marks across duration (memoized)
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
      <div className="h-9 border-b border-slate-800/60 px-4 flex items-center justify-between bg-slate-900/60 text-slate-400 shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-200 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            Master Timeline
          </span>

          {/* Interactive Time Format Switcher (Seconds vs Frames) */}
          <button
            onClick={() => setTimeDisplayMode(timeDisplayMode === 'seconds' ? 'frames' : 'seconds')}
            className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-blue-400 font-bold transition flex items-center gap-1"
            title="Click to toggle between Seconds and Frames"
          >
            {timeDisplayMode === 'seconds' ? (
              <>
                <span>{currentTime.toFixed(2)}s</span>
                <span className="text-slate-600">/</span>
                <span className="text-slate-400">{duration.toFixed(2)}s</span>
              </>
            ) : (
              <>
                <span>{currentFrame}f</span>
                <span className="text-slate-600">/</span>
                <span className="text-slate-400">{totalFrames}f</span>
                <span className="text-[9px] text-slate-500 font-normal">(@{fps}fps)</span>
              </>
            )}
          </button>

          {/* Stepping controls */}
          <div className="flex items-center gap-0.5 bg-slate-950 rounded-md border border-slate-800 p-0.5">
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

          {/* Add Marker Button */}
          <button
            onClick={addMarkerAtPlayhead}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-slate-400 hover:text-amber-300 transition text-[10px]"
            title="Add Marker at Current Time"
          >
            <BookmarkPlus className="w-3 h-3 text-amber-400" />
            <span>Marker</span>
          </button>

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
        <div
          ref={trackRef}
          style={{ width: zoomLevel > 1 ? `${zoomLevel * 100}%` : '100%' }}
          className="h-full flex flex-col justify-between relative min-w-full"
        >
          {/* Time Ruler with Ticks & Markers */}
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
                    {timeDisplayMode === 'seconds' ? `${t.time.toFixed(1)}s` : `${Math.round(t.time * fps)}f`}
                  </span>
                )}
                <div className={`w-[1px] ${t.isMajor ? 'h-2 bg-slate-600' : 'h-1.5 bg-slate-800'}`} />
              </div>
            ))}

            {/* Timeline Marker Diamonds */}
            {markers.map((markerTime) => {
              const markerPct = (markerTime / duration) * 100;
              return (
                <div
                  key={markerTime}
                  onClick={(e) => {
                    e.stopPropagation();
                    seek(markerTime);
                  }}
                  onContextMenu={(e) => removeMarker(markerTime, e)}
                  style={{ left: `${markerPct}%` }}
                  className="absolute top-0 w-3 h-3 -ml-1.5 bg-amber-400 rotate-45 cursor-pointer z-30 shadow-md shadow-amber-400/40 hover:scale-125 transition-transform"
                  title={`Marker: ${markerTime.toFixed(2)}s (Right-click to remove)`}
                />
              );
            })}

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

          {/* HTML Motion Graphic Video Track Bar with Dynamic Duration Resizer */}
          <div
            onPointerDown={handlePointerDown}
            className="h-6 w-full bg-blue-950/30 border border-blue-600/30 rounded-lg flex items-center px-3 relative overflow-visible cursor-pointer group/track"
          >
            {/* Progress Fill */}
            <div
              style={{ width: `${progressPct}%` }}
              className="absolute top-0 bottom-0 left-0 bg-blue-600/20 border-r border-blue-500/60 pointer-events-none rounded-l-lg"
            />

            <span className="text-[10px] font-bold text-blue-300 font-mono tracking-wide z-10 flex items-center gap-1.5 pointer-events-none">
              HTML MOTION GRAPHIC ({exportSettings.width}×{exportSettings.height} @ {fps}fps • {duration}s)
            </span>

            {/* Dynamic Duration Drag Handle */}
            <div
              onPointerDown={(e) => {
                e.stopPropagation();
                try {
                  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                } catch {}
                dragRef.current = { startX: e.clientX, startVal: duration };
                setIsDraggingDuration(true);
              }}
              title="Drag handle to adjust animation duration dynamically"
              className="absolute right-0 top-0 bottom-0 w-4 bg-blue-600/60 hover:bg-blue-500 cursor-ew-resize rounded-r-lg flex items-center justify-center z-20 transition active:bg-blue-400 group/handle"
            >
              <GripVertical className="w-3 h-3 text-white opacity-80 group-hover/handle:opacity-100" />
            </div>
          </div>

          {/* Soundtrack Waveform Track with Dynamic Offset Dragging */}
          <div className="h-6 w-full bg-purple-950/20 border border-purple-600/30 rounded-lg flex items-center px-3 relative overflow-visible">
            {audioFilePath ? (
              <>
                {/* Audio Waveform visualizer bars */}
                <div
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    try {
                      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                    } catch {}
                    dragRef.current = { startX: e.clientX, startVal: audioSettings.startOffsetSeconds };
                    setIsDraggingAudio(true);
                  }}
                  style={{
                    left: `${(audioSettings.startOffsetSeconds / duration) * 100}%`,
                  }}
                  className="absolute inset-y-0 right-0 flex items-center justify-around opacity-40 cursor-grab active:cursor-grabbing px-2 border-l-2 border-purple-400"
                  title="Drag audio track horizontally to adjust start offset"
                >
                  {Array.from({ length: 48 * zoomLevel }).map((_, idx) => (
                    <div
                      key={idx}
                      style={{ height: `${20 + ((idx * 17) % 70)}%` }}
                      className="w-1 bg-purple-400 rounded-full"
                    />
                  ))}
                </div>

                <span className="text-[10px] font-bold text-purple-300 font-mono z-10 flex items-center gap-1.5 pointer-events-none">
                  <Music className="w-3 h-3 text-purple-400" />
                  AUDIO: {audioSettings.fileName || 'Soundtrack'} (Offset: {audioSettings.startOffsetSeconds.toFixed(1)}s)
                </span>
              </>
            ) : (
              <span className="text-[10px] text-slate-500 italic">No audio track attached (Attach from Assets or Inspector)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
