import React, { useEffect, useState, useRef } from 'react';
import { useDesktopStudioStore } from './store/desktopStudioStore';
import { AppToolbar } from './components/toolbar/AppToolbar';
import { AssetsSidebar } from './components/sidebar/AssetsSidebar';
import { DesktopPreview } from './components/preview/DesktopPreview';
import { PropertiesPanel } from './components/properties/PropertiesPanel';
import { TimelineTrack } from './components/timeline/TimelineTrack';
import { ExportProgressDialog } from './components/modals/ExportProgressDialog';
import { ExportSuccessDialog } from './components/modals/ExportSuccessDialog';
import { NewProjectModal } from './components/modals/NewProjectModal';
import { AlertCircle, X, GripVertical, GripHorizontal } from 'lucide-react';

export const App: React.FC = () => {
  const {
    initialize,
    exportError,
    clearExportError,
    leftSidebarWidth,
    leftSidebarCollapsed,
    setLeftSidebarWidth,
    resetLeftSidebarWidth,
    toggleLeftSidebar,
    rightPanelWidth,
    rightPanelCollapsed,
    setRightPanelWidth,
    resetRightPanelWidth,
    toggleRightPanel,
    timelineHeight,
    timelineCollapsed,
    setTimelineHeight,
    resetTimelineHeight,
    toggleTimeline,
    isResizing,
    setIsResizing,
    isPlaying,
    setIsPlaying,
    currentTime,
    seek,
    exportSettings,
  } = useDesktopStudioStore();

  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  // Resize drag tracking refs
  const dragRef = useRef<{
    type: 'left' | 'right' | 'timeline' | null;
    startX: number;
    startY: number;
    startDim: number;
  }>({
    type: null,
    startX: 0,
    startY: 0,
    startDim: 0,
  });

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable);

      if (isInput) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Space: Play / Pause
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
      // Home or '0': Seek to 0
      else if (e.key === 'Home' || e.key === '0') {
        e.preventDefault();
        seek(0);
      }
      // ArrowLeft / ArrowRight: Frame stepping
      else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const dt = e.shiftKey ? 1.0 : 1 / (exportSettings.fps || 60);
        seek(Math.max(0, currentTime - dt));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const dt = e.shiftKey ? 1.0 : 1 / (exportSettings.fps || 60);
        seek(Math.min(exportSettings.durationSeconds, currentTime + dt));
      }
      // Toggle Left Sidebar: Cmd/Ctrl + B or '['
      else if ((cmdOrCtrl && e.key.toLowerCase() === 'b' && !e.shiftKey) || e.key === '[') {
        e.preventDefault();
        toggleLeftSidebar();
      }
      // Toggle Right Properties: Cmd/Ctrl + Shift + B or ']'
      else if ((cmdOrCtrl && e.key.toLowerCase() === 'b' && e.shiftKey) || e.key === ']') {
        e.preventDefault();
        toggleRightPanel();
      }
      // Toggle Timeline: Cmd/Ctrl + J or 't' / 'T'
      else if ((cmdOrCtrl && e.key.toLowerCase() === 'j') || e.key.toLowerCase() === 't') {
        e.preventDefault();
        toggleTimeline();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isPlaying,
    currentTime,
    exportSettings.fps,
    exportSettings.durationSeconds,
    setIsPlaying,
    seek,
    toggleLeftSidebar,
    toggleRightPanel,
    toggleTimeline,
  ]);

  // Pointer drag listeners for split-pane resize
  const startLeftResize = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      type: 'left',
      startX: e.clientX,
      startY: e.clientY,
      startDim: leftSidebarWidth,
    };
    setIsResizing(true);
  };

  const startRightResize = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      type: 'right',
      startX: e.clientX,
      startY: e.clientY,
      startDim: rightPanelWidth,
    };
    setIsResizing(true);
  };

  const startTimelineResize = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      type: 'timeline',
      startX: e.clientX,
      startY: e.clientY,
      startDim: timelineHeight,
    };
    setIsResizing(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.type) return;

    if (dragRef.current.type === 'left') {
      const delta = e.clientX - dragRef.current.startX;
      setLeftSidebarWidth(dragRef.current.startDim + delta);
    } else if (dragRef.current.type === 'right') {
      const delta = dragRef.current.startX - e.clientX;
      setRightPanelWidth(dragRef.current.startDim + delta);
    } else if (dragRef.current.type === 'timeline') {
      const delta = dragRef.current.startY - e.clientY;
      setTimelineHeight(dragRef.current.startDim + delta);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragRef.current.type) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      dragRef.current = { type: null, startX: 0, startY: 0, startDim: 0 };
      setIsResizing(false);
    }
  };

  return (
    <div
      className={`flex flex-col h-screen w-screen overflow-hidden bg-[#090d16] text-slate-100 font-sans ${
        isResizing ? 'select-none cursor-ew-resize' : ''
      }`}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Top Application Toolbar */}
      <AppToolbar onOpenNewModal={() => setIsNewProjectModalOpen(true)} />

      {/* Global Error Banner */}
      {exportError && (
        <div className="bg-red-950/80 border-b border-red-800/80 px-4 py-2 flex items-center justify-between text-xs text-red-200 z-40 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="font-semibold">Export Notice:</span>
            <span className="font-mono text-red-300">{exportError}</span>
          </div>
          <button
            onClick={clearExportError}
            className="p-1 rounded hover:bg-red-900/50 text-red-400 hover:text-white transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Studio Workspace: Sidebar + Preview + Properties */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Left: Project Explorer & Assets */}
        <AssetsSidebar />

        {/* Vertical Resize Handle (Left) */}
        {!leftSidebarCollapsed && (
          <div
            onPointerDown={startLeftResize}
            onDoubleClick={resetLeftSidebarWidth}
            title="Drag to resize Assets Sidebar • Double-click to reset"
            className="w-1.5 hover:w-2 -ml-0.5 z-20 cursor-col-resize bg-transparent hover:bg-blue-500/80 active:bg-blue-500 transition-colors flex items-center justify-center shrink-0 group select-none"
          >
            <div className="w-0.5 h-8 rounded-full bg-slate-700 group-hover:bg-white transition-colors" />
          </div>
        )}

        {/* Center: Stage & Viewport */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0 min-w-0">
          <DesktopPreview />

          {/* Horizontal Resize Handle (Timeline) */}
          {!timelineCollapsed && (
            <div
              onPointerDown={startTimelineResize}
              onDoubleClick={resetTimelineHeight}
              title="Drag to resize Timeline • Double-click to reset"
              className="h-1.5 hover:h-2 -mt-0.5 z-20 cursor-row-resize bg-transparent hover:bg-blue-500/80 active:bg-blue-500 transition-colors flex items-center justify-center shrink-0 group select-none"
            >
              <div className="h-0.5 w-12 rounded-full bg-slate-700 group-hover:bg-white transition-colors" />
            </div>
          )}

          {/* Bottom: Interactive Master Timeline */}
          <TimelineTrack />
        </div>

        {/* Vertical Resize Handle (Right) */}
        {!rightPanelCollapsed && (
          <div
            onPointerDown={startRightResize}
            onDoubleClick={resetRightPanelWidth}
            title="Drag to resize Properties Panel • Double-click to reset"
            className="w-1.5 hover:w-2 -mr-0.5 z-20 cursor-col-resize bg-transparent hover:bg-blue-500/80 active:bg-blue-500 transition-colors flex items-center justify-center shrink-0 group select-none"
          >
            <div className="w-0.5 h-8 rounded-full bg-slate-700 group-hover:bg-white transition-colors" />
          </div>
        )}

        {/* Right: Export & Output Properties */}
        <PropertiesPanel />
      </div>

      {/* Dialog Modals */}
      <ExportProgressDialog />
      <ExportSuccessDialog />
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
      />
    </div>
  );
};


