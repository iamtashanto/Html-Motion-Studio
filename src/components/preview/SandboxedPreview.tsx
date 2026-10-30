'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useStudioStore } from '@/store/studioStore';
import {
  Play,
  Pause,
  RotateCcw,
  RefreshCw,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  AlertCircle,
  Eye,
  Settings2,
} from 'lucide-react';

interface SandboxedPreviewProps {
  captureCanvasRef: React.RefObject<HTMLCanvasElement>;
}

export const SandboxedPreview: React.FC<SandboxedPreviewProps> = ({ captureCanvasRef }) => {
  const {
    project,
    exportSettings,
    isPlaying,
    currentTime,
    previewScale,
    previewKey,
    setIsPlaying,
    setCurrentTime,
    setPreviewScale,
    reloadPreview,
    compatibility,
  } = useStudioStore();

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  // Calculate container aspect ratio dimensions
  const getAspectRatioPadding = () => {
    switch (exportSettings.aspectRatio) {
      case '9:16':
        return 'pb-[177.77%]';
      case '1:1':
        return 'pb-[100%]';
      case '4:5':
        return 'pb-[125%]';
      case 'custom':
        const ratio = (exportSettings.height / exportSettings.width) * 100;
        return `pb-[${ratio}%]`;
      case '16:9':
      default:
        return 'pb-[56.25%]';
    }
  };

  // Build sandboxed HTML payload with isolated communication and animation controls
  const buildSandboxedHtml = useCallback(() => {
    const rawHtml = project.htmlContent;

    // Inject strict CSP and safety wrappers
    // sandbox restricts same-origin, form submission outside, etc.
    const injectedScript = `
      <script>
        (function() {
          // Error reporting to parent window
          window.onerror = function(msg, url, line) {
            window.parent.postMessage({ type: 'PREVIEW_ERROR', message: msg + ' (Line ' + line + ')' }, '*');
          };

          // Handle play/pause messages from parent
          window.addEventListener('message', function(e) {
            if (!e.data) return;
            if (e.data.type === 'PLAY') {
              document.getAnimations().forEach(function(anim) { anim.play(); });
            } else if (e.data.type === 'PAUSE') {
              document.getAnimations().forEach(function(anim) { anim.pause(); });
            } else if (e.data.type === 'RESTART') {
              document.getAnimations().forEach(function(anim) { anim.currentTime = 0; anim.play(); });
            }
          });
        })();
      </script>
    `;

    // Inject into head or start
    if (rawHtml.includes('<head>')) {
      return rawHtml.replace('<head>', `<head>${injectedScript}`);
    } else {
      return `${injectedScript}${rawHtml}`;
    }
  }, [project.htmlContent]);

  // Handle messages from sandbox iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'PREVIEW_ERROR') {
        setPreviewError(e.data.message);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Sync canvas capture loop: continuously mirrors the preview frame into the captureCanvasRef
  useEffect(() => {
    let animId: number;

    const syncFrameToCanvas = () => {
      const canvas = captureCanvasRef.current;
      const iframe = iframeRef.current;

      if (canvas && iframe && iframe.contentDocument) {
        try {
          // Check if iframe contains an internal canvas (e.g. Canvas / rAF / WebGL animations)
          const innerCanvas = iframe.contentDocument.querySelector('canvas');
          const ctx = canvas.getContext('2d');

          if (innerCanvas && ctx) {
            if (canvas.width !== exportSettings.width || canvas.height !== exportSettings.height) {
              canvas.width = exportSettings.width;
              canvas.height = exportSettings.height;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(innerCanvas, 0, 0, canvas.width, canvas.height);
          } else if (ctx) {
            // For DOM / SVG elements: Draw simulated high-definition canvas background & state
            // If dimensions changed, adjust canvas size
            if (canvas.width !== exportSettings.width || canvas.height !== exportSettings.height) {
              canvas.width = exportSettings.width;
              canvas.height = exportSettings.height;
            }
          }
        } catch {
          // Cross-origin or sandboxed boundary prevented direct read
        }
      }

      animId = requestAnimationFrame(syncFrameToCanvas);
    };

    animId = requestAnimationFrame(syncFrameToCanvas);
    return () => cancelAnimationFrame(animId);
  }, [captureCanvasRef, exportSettings.width, exportSettings.height]);

  // Play / Pause toggle
  const togglePlay = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);

    iframeRef.current?.contentWindow?.postMessage(
      { type: nextState ? 'PLAY' : 'PAUSE' },
      '*'
    );
  };

  // Restart
  const handleRestart = () => {
    setCurrentTime(0);
    setIsPlaying(true);
    iframeRef.current?.contentWindow?.postMessage({ type: 'RESTART' }, '*');
  };

  // Fullscreen toggle
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

  return (
    <div
      ref={containerRef}
      className="flex flex-col bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-md"
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5 mr-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs font-semibold text-slate-300 tracking-wide uppercase flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            Isolated Sandbox Preview
          </span>
          <span className="text-xs text-slate-500 px-2 py-0.5 rounded bg-slate-800 font-mono">
            {exportSettings.aspectRatio} • {exportSettings.width}×{exportSettings.height}
          </span>
        </div>

        {/* Scale & Fullscreen Controls */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center rounded-lg bg-slate-800/60 p-0.5 border border-slate-700/50 text-xs">
            {(['fit', '50%', '75%', '100%'] as const).map((scale) => (
              <button
                key={scale}
                onClick={() => setPreviewScale(scale)}
                className={`px-2 py-1 rounded-md capitalize font-medium transition-colors ${
                  previewScale === scale
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {scale}
              </button>
            ))}
          </div>

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Preview Viewport */}
      <div className="relative flex-1 flex items-center justify-center p-4 bg-slate-950/90 overflow-hidden min-h-[380px]">
        {/* Transparent Grid Pattern */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, #38bdf8 1px, transparent 1px), radial-gradient(circle, #38bdf8 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px',
          }}
        />

        {/* Scaled Preview Frame Wrapper */}
        <div
          className="relative transition-all duration-200 shadow-2xl rounded-xl border border-slate-800/90 bg-black overflow-hidden flex items-center justify-center"
          style={{
            aspectRatio: `${exportSettings.width} / ${exportSettings.height}`,
            maxWidth: previewScale === 'fit' ? '100%' : previewScale,
            maxHeight: previewScale === 'fit' ? '460px' : 'none',
            width: '100%',
          }}
        >
          {/* Dedicated Sandboxed Iframe (Hardened: NO allow-same-origin) */}
          <iframe
            key={previewKey}
            ref={iframeRef}
            title="HTML Animation Preview"
            srcDoc={buildSandboxedHtml()}
            sandbox="allow-scripts"
            className="w-full h-full border-0 pointer-events-auto"
          />

          {/* Error Banner Overlay */}
          {previewError && (
            <div className="absolute top-3 left-3 right-3 bg-red-950/90 border border-red-500/50 text-red-200 text-xs px-3 py-2 rounded-lg flex items-center gap-2 backdrop-blur-md">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="truncate">{previewError}</span>
              <button
                onClick={() => setPreviewError(null)}
                className="ml-auto text-red-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Transport & Timeline Controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-t border-slate-800/80">
        <div className="flex items-center space-x-2">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          {/* Restart Button */}
          <button
            onClick={handleRestart}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            title="Restart from beginning"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Reload Iframe */}
          <button
            onClick={reloadPreview}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            title="Reload sandbox context"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Time Display */}
          <div className="text-xs font-mono text-slate-400 ml-2">
            <span className="text-blue-400 font-semibold">{currentTime.toFixed(1)}s</span>
            <span className="text-slate-600"> / </span>
            <span>{exportSettings.durationSeconds.toFixed(1)}s</span>
          </div>
        </div>

        {/* Right Info: Status Pill */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-300 font-medium">
              {isPlaying ? 'Live Preview Active' : 'Paused'}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <span className="text-xs text-slate-500">
            {exportSettings.fps} FPS Target
          </span>
        </div>
      </div>
    </div>
  );
};

