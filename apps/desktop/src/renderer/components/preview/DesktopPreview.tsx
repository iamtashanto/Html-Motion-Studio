import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
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
  Minimize2,
  Sliders,
  Layers,
} from 'lucide-react';

function injectPreviewController(rawHtml: string): string {
  const script = `
<script id="__hms_preview_controller__">
(function() {
  window.__HMS_VIRTUAL_TIME__ = 0;
  window.__HMS_IS_PLAYING__ = false;

  window.__HMS_SEEK__ = function(timeSeconds, playState) {
    window.__HMS_VIRTUAL_TIME__ = timeSeconds;
    if (typeof playState === 'boolean') {
      window.__HMS_IS_PLAYING__ = playState;
    }

    // 1. Strategy A Custom Adapter (GSAP, Canvas renderFrame, Lottie)
    if (window.__HTML_MOTION_STUDIO__) {
      try {
        if (typeof window.__HTML_MOTION_STUDIO__.seek === 'function') {
          window.__HTML_MOTION_STUDIO__.seek(timeSeconds);
        }
        if (typeof window.__HTML_MOTION_STUDIO__.renderFrame === 'function') {
          window.__HTML_MOTION_STUDIO__.renderFrame(timeSeconds);
        }
        if (window.__HMS_IS_PLAYING__ && typeof window.__HTML_MOTION_STUDIO__.play === 'function') {
          window.__HTML_MOTION_STUDIO__.play();
        } else if (!window.__HMS_IS_PLAYING__ && typeof window.__HTML_MOTION_STUDIO__.pause === 'function') {
          window.__HTML_MOTION_STUDIO__.pause();
        }
      } catch (err) {}
    }

    // 2. CSS Animations & Transitions (Web Animations API)
    if (document.getAnimations) {
      try {
        var anims = document.getAnimations();
        for (var i = 0; i < anims.length; i++) {
          var a = anims[i];
          try {
            a.currentTime = timeSeconds * 1000;
            if (window.__HMS_IS_PLAYING__) {
              a.play();
            } else {
              a.pause();
            }
          } catch (e) {}
        }
      } catch (e) {}
    }

    // 3. HTML5 Video Elements
    try {
      var vids = document.querySelectorAll('video');
      for (var j = 0; j < vids.length; j++) {
        var vid = vids[j];
        try {
          vid.currentTime = timeSeconds;
          if (window.__HMS_IS_PLAYING__) {
            vid.play().catch(function(){});
          } else {
            vid.pause();
          }
        } catch (e) {}
      }
    } catch (e) {}
  };

  window.addEventListener('message', function(ev) {
    if (!ev.data || typeof ev.data !== 'object') return;
    if (ev.data.type === 'HMS_SEEK') {
      window.__HMS_SEEK__(ev.data.time, ev.data.isPlaying);
    } else if (ev.data.type === 'HMS_PLAY') {
      window.__HMS_SEEK__(ev.data.time !== undefined ? ev.data.time : window.__HMS_VIRTUAL_TIME__, true);
    } else if (ev.data.type === 'HMS_PAUSE') {
      window.__HMS_SEEK__(ev.data.time !== undefined ? ev.data.time : window.__HMS_VIRTUAL_TIME__, false);
    }
  });

  document.addEventListener('DOMContentLoaded', function() {
    window.__HMS_SEEK__(0, false);
  });
})();
</script>
`;

  if (!rawHtml) return '';
  if (rawHtml.includes('<head>')) {
    return rawHtml.replace('<head>', '<head>' + script);
  } else if (rawHtml.includes('<html>')) {
    return rawHtml.replace('<html>', '<html><head>' + script + '</head>');
  } else {
    return script + rawHtml;
  }
}

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
    seek,
    restart,
    setPreviewZoom,
    setPreviewBackground,
    isResizing,
  } = useDesktopStudioStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const timeRef = useRef<number>(currentTime);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stageDimensions, setStageDimensions] = useState({ width: 900, height: 600 });

  const previewHtml = useMemo(() => {
    return injectPreviewController(project.htmlContent);
  }, [project.htmlContent]);

  const sendSeekToIframe = useCallback((time: number, play: boolean) => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    try {
      const win = iframeRef.current.contentWindow as unknown as {
        __HMS_SEEK__?: (t: number, p: boolean) => void;
      };
      if (typeof win.__HMS_SEEK__ === 'function') {
        win.__HMS_SEEK__(time, play);
      }
    } catch {}
    try {
      iframeRef.current.contentWindow.postMessage(
        { type: 'HMS_SEEK', time, isPlaying: play },
        '*'
      );
    } catch {}
  }, []);

  // Sync external scrubbing/seeks into timeRef and iframe
  useEffect(() => {
    if (!isPlaying || Math.abs(currentTime - timeRef.current) > 0.05) {
      timeRef.current = currentTime;
      sendSeekToIframe(currentTime, isPlaying);
    }
  }, [currentTime, isPlaying, sendSeekToIframe]);

  // Sync play/pause state into iframe
  useEffect(() => {
    sendSeekToIframe(timeRef.current, isPlaying);
  }, [isPlaying, sendSeekToIframe]);

  // Measure stage dimensions for responsive viewport fitting
  useEffect(() => {
    if (!stageRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setStageDimensions({ width, height });
        }
      }
    });
    observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // High-performance animation loop (Zero effect re-triggers during playback)
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
      let nextTime = timeRef.current + deltaSec;

      if (nextTime >= dur) {
        if (exportSettings.loopAnimationIfShorter) {
          nextTime = 0;
        } else {
          nextTime = dur;
          setIsPlaying(false);
        }
      }

      timeRef.current = nextTime;
      setCurrentTime(nextTime);

      sendSeekToIframe(nextTime, true);

      if (isPlaying) {
        animFrameRef.current = requestAnimationFrame(loop);
      }
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, exportSettings.durationSeconds, exportSettings.loopAnimationIfShorter, setCurrentTime, setIsPlaying, sendSeekToIframe]);

  // Background style helper
  const bgClasses = {
    dark: 'bg-[#090d16]',
    light: 'bg-slate-200',
    grid: 'bg-[#090d16] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]',
    checker: 'bg-[repeating-conic-gradient(#1e293b_0%_25%,#0f172a_0%_50%)] [background-size:20px_20px]',
  }[previewBackground];

  // Calculate pixel-perfect fitted stage frame dimensions
  const targetRatio = (exportSettings.width || 1920) / (exportSettings.height || 1080);
  const padding = 48; // balanced breathing room padding
  const availW = Math.max(120, stageDimensions.width - padding);
  const availH = Math.max(120, stageDimensions.height - padding);
  const stageRatio = availW / availH;

  let baseWidth: number;
  let baseHeight: number;

  if (stageRatio > targetRatio) {
    // Stage is wider than target: fit to available height
    baseHeight = availH;
    baseWidth = Math.round(availH * targetRatio);
  } else {
    // Stage is taller than target: fit to available width
    baseWidth = availW;
    baseHeight = Math.round(availW / targetRatio);
  }

  let frameWidth = baseWidth;
  let frameHeight = baseHeight;

  if (previewZoom === '50%') {
    frameWidth = Math.round(baseWidth * 0.5);
    frameHeight = Math.round(baseHeight * 0.5);
  } else if (previewZoom === '75%') {
    frameWidth = Math.round(baseWidth * 0.75);
    frameHeight = Math.round(baseHeight * 0.75);
  } else if (previewZoom === '100%') {
    frameWidth = Math.min(availW, exportSettings.width);
    frameHeight = Math.round(frameWidth / targetRatio);
  } else if (previewZoom === '200%') {
    frameWidth = Math.round(baseWidth * 1.5);
    frameHeight = Math.round(baseHeight * 1.5);
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col min-h-0 bg-slate-900 overflow-hidden select-none"
    >
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
            {(['fit', '50%', '75%', '100%'] as const).map((z) => (
              <button
                key={z}
                onClick={() => setPreviewZoom(z)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
                  previewZoom === z ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title={`Zoom ${z === 'fit' ? 'Fit to Screen' : z}`}
              >
                {z === 'fit' ? 'Fit' : z}
              </button>
            ))}
          </div>

          {/* Background options */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setPreviewBackground('dark')}
              className={`p-1 rounded ${previewBackground === 'dark' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="Dark Studio Background"
              aria-label="Dark Studio Background"
            >
              <Moon className="w-3 h-3" />
            </button>
            <button
              onClick={() => setPreviewBackground('grid')}
              className={`p-1 rounded ${previewBackground === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="Blueprint Grid Background"
              aria-label="Blueprint Grid Background"
            >
              <Grid className="w-3 h-3" />
            </button>
            <button
              onClick={() => setPreviewBackground('checker')}
              className={`p-1 rounded ${previewBackground === 'checker' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="Transparency Checkerboard"
              aria-label="Transparency Checkerboard"
            >
              <Layers className="w-3 h-3" />
            </button>
            <button
              onClick={() => setPreviewBackground('light')}
              className={`p-1 rounded ${previewBackground === 'light' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="Light Background"
              aria-label="Light Background"
            >
              <Sun className="w-3 h-3" />
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Stage'}
            aria-label="Toggle Fullscreen Stage"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Viewport Stage */}
      <div
        ref={stageRef}
        className={`flex-1 relative flex items-center justify-center p-6 overflow-auto ${bgClasses}`}
      >
        {/* Frame Container */}
        <div
          style={{ width: `${frameWidth}px`, height: `${frameHeight}px` }}
          className="relative shrink-0 border-2 border-slate-700/60 shadow-2xl rounded-xl overflow-hidden bg-black flex items-center justify-center"
        >
          <iframe
            key={previewKey}
            ref={iframeRef}
            srcDoc={previewHtml}
            title="HTML Animation Preview"
            sandbox="allow-scripts allow-same-origin"
            onLoad={() => {
              sendSeekToIframe(timeRef.current, isPlaying);
            }}
            className={`w-full h-full border-0 ${isResizing ? 'pointer-events-none' : 'pointer-events-auto'}`}
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
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              seek(0);
              timeRef.current = 0;
              sendSeekToIframe(0, false);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Stop & Rewind to 0s"
            aria-label="Stop & Rewind"
          >
            <Square className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              seek(0);
              timeRef.current = 0;
              setIsPlaying(true);
              sendSeekToIframe(0, true);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Restart Animation (0s)"
            aria-label="Restart Animation"
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

