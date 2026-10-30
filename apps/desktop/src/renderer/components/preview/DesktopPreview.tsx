import React, { useRef, useEffect } from 'react';
import { useDesktopStudioStore } from '../../store/desktopStudioStore';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  ZoomIn,
  Grid,
  Sun,
  Moon,
  Maximize2,
  Sliders,
  Layers,
} from 'lucide-react';

export const DesktopPreview: React.FC = () => {
  const {
    project,
    isPlaying,
    currentTime,
    previewZoom,
    previewBackground,
    previewKey,
    exportSettings,
    setIsPlaying,
    setCurrentTime,
    restart,
    setPreviewZoom,
    setPreviewBackground,
  } = useDesktopStudioStore();

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Handle animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const deltaSec = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      const dur = exportSettings.durationSeconds;
      let nextTime = currentTime + deltaSec;

      if (nextTime >= dur) {
        if (exportSettings.loopAnimationIfShorter) {
          nextTime = 0;
        } else {
          nextTime = dur;
          setIsPlaying(false);
        }
      }

      setCurrentTime(nextTime);

      // Seek inside iframe
      if (iframeRef.current && iframeRef.current.contentWindow) {
        try {
          const win = iframeRef.current.contentWindow as unknown as {
            __HMS_SEEK__?: (t: number) => void;
          };
          if (typeof win.__HMS_SEEK__ === 'function') {
            win.__HMS_SEEK__(nextTime);
          }
        } catch {
          // ignore cross-origin sandbox restrictions
        }
      }

      if (isPlaying) {
        animFrameRef.current = requestAnimationFrame(loop);
      }
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, currentTime, exportSettings.durationSeconds, exportSettings.loopAnimationIfShorter, setCurrentTime, setIsPlaying]);

  // Background style helper
  const bgClasses = {
    dark: 'bg-[#090d16]',
    light: 'bg-slate-200',
    grid: 'bg-[#090d16] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]',
    checker: 'bg-[repeating-conic-gradient(#1e293b_0%_25%,#0f172a_0%_50%)] [background-size:20px_20px]',
  }[previewBackground];

  // Aspect ratio dimension calculation
  const ratioMap = {
    '16:9': 'aspect-[16/9]',
    '9:16': 'aspect-[9/16]',
    '1:1': 'aspect-square',
    '4:5': 'aspect-[4/5]',
    'custom': 'aspect-video',
  };
  const aspectClass = ratioMap[exportSettings.aspectRatio] || 'aspect-[16/9]';

  // Zoom transform style
  const zoomStyles = {
    fit: 'w-full h-full object-contain',
    '50%': 'w-1/2 h-1/2',
    '75%': 'w-3/4 h-3/4',
    '100%': 'w-full h-full',
    '200%': 'w-[200%] h-[200%]',
  }[previewZoom];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] bg-slate-900 overflow-hidden select-none">
      {/* Top Preview Controls Bar */}
      <div className="h-10 bg-slate-950/80 border-b border-slate-800/80 px-4 flex items-center justify-between text-xs">
        {/* Aspect Ratio & Resolution Info */}
        <div className="flex items-center gap-2 text-slate-400">
          <span className="font-mono text-slate-200 font-semibold">
            {exportSettings.width}×{exportSettings.height}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
            {exportSettings.aspectRatio}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {exportSettings.fps} FPS
          </span>
        </div>

        {/* Viewport Zoom & Background Switcher */}
        <div className="flex items-center gap-3">
          {/* Zoom options */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            {(['fit', '50%', '100%'] as const).map((z) => (
              <button
                key={z}
                onClick={() => setPreviewZoom(z)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
                  previewZoom === z ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {z === 'fit' ? 'Fit' : z}
              </button>
            ))}
          </div>

          {/* Background options */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setPreviewBackground('dark')}
              className={`p-1 rounded ${previewBackground === 'dark' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
              title="Dark Studio"
            >
              <Moon className="w-3 h-3" />
            </button>
            <button
              onClick={() => setPreviewBackground('grid')}
              className={`p-1 rounded ${previewBackground === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
              title="Blueprint Grid"
            >
              <Grid className="w-3 h-3" />
            </button>
            <button
              onClick={() => setPreviewBackground('checker')}
              className={`p-1 rounded ${previewBackground === 'checker' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
              title="Transparency Checkerboard"
            >
              <Layers className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Viewport Stage */}
      <div className={`flex-1 relative flex items-center justify-center p-6 overflow-hidden ${bgClasses}`}>
        {/* Frame Aspect Container */}
        <div className={`relative max-w-full max-h-full ${aspectClass} border-2 border-slate-700/60 shadow-2xl rounded-xl overflow-hidden bg-black flex items-center justify-center`}>
          <iframe
            key={previewKey}
            ref={iframeRef}
            srcDoc={project.htmlContent}
            title="HTML Animation Preview"
            sandbox="allow-scripts"
            className={`${zoomStyles} border-0 pointer-events-auto`}
          />
        </div>
      </div>

      {/* Bottom Transport Controls */}
      <div className="h-12 bg-slate-950/90 border-t border-slate-800/80 px-6 flex items-center justify-between">
        {/* Transport Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition shadow-md shadow-blue-500/25 active:scale-95"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentTime(0);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Stop"
          >
            <Square className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={restart}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Restart Animation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Time Code Counter */}
        <div className="font-mono text-xs font-bold text-slate-300">
          <span className="text-blue-400">{currentTime.toFixed(2)}s</span>
          <span className="text-slate-600 mx-1">/</span>
          <span className="text-slate-400">{exportSettings.durationSeconds.toFixed(2)}s</span>
        </div>
      </div>
    </div>
  );
};
