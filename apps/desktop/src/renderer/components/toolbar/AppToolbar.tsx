import React, { useState, useEffect } from 'react';
import { useDesktopStudioStore } from '../../store/desktopStudioStore';
import {
  Film,
  FolderOpen,
  FolderArchive,
  Save,
  PlusCircle,
  FileCode,
  Clock,
  Cpu,
  ChevronDown,
  Check,
  Edit2,
  Download,
  ShieldCheck,
  FolderKanban,
  PanelLeft,
  PanelBottom,
  PanelRight,
  Minus,
  Square,
  X,
} from 'lucide-react';

interface AppToolbarProps {
  onOpenNewModal: () => void;
}

export const AppToolbar: React.FC<AppToolbarProps> = ({ onOpenNewModal }) => {
  const {
    project,
    isDirty,
    projectFilePath,
    recentProjects,
    systemCapabilities,
    openProjectFile,
    openProjectFolder,
    openProjectFromPath,
    saveProject,
    setProjectTitle,
    startExport,
    isExporting,
    leftSidebarCollapsed,
    toggleLeftSidebar,
    rightPanelCollapsed,
    toggleRightPanel,
    timelineCollapsed,
    toggleTimeline,
  } = useDesktopStudioStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(project.title);
  const [showRecents, setShowRecents] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [platform, setPlatform] = useState<string>('darwin');
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (window.desktopApi?.getPlatform) {
      window.desktopApi.getPlatform().then((p) => {
        if (p) setPlatform(p);
      });
    } else {
      const isMac = navigator.userAgent.toLowerCase().includes('mac');
      setPlatform(isMac ? 'darwin' : 'win32');
    }
  }, []);

  const handleTitleSubmit = () => {
    if (titleInput.trim()) {
      setProjectTitle(titleInput.trim());
    } else {
      setTitleInput(project.title);
    }
    setIsEditingTitle(false);
  };

  return (
    <header
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      className="h-14 bg-slate-950 border-b border-slate-800/80 px-4 flex items-center justify-between select-none z-30 shrink-0"
    >
      {/* Left: macOS Traffic Lights Reserved Area + Branding & File Menu */}
      <div
        className="flex items-center gap-3"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* Dedicated spacing for macOS traffic lights (Close, Minimize, Zoom) */}
        {platform === 'darwin' && (
          <div
            className="w-16 shrink-0 h-8 mr-1"
            style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
            aria-hidden="true"
          />
        )}

        {/* Brand Icon */}
        <div className="flex items-center gap-2 pr-2 border-r border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-wider text-white">MOTION STUDIO</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                PRO
              </span>
            </div>
          </div>
        </div>

        {/* File Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setShowFileMenu(!showFileMenu)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
          >
            <span>File</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showFileMenu && (
            <div
              className="absolute left-0 top-full mt-1 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in duration-100"
              onClick={() => setShowFileMenu(false)}
            >
              <button
                onClick={onOpenNewModal}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2.5 text-slate-200 hover:bg-blue-600 hover:text-white transition"
              >
                <PlusCircle className="w-3.5 h-3.5 text-blue-400" />
                <span>New Project...</span>
              </button>
              <button
                onClick={openProjectFile}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2.5 text-slate-200 hover:bg-blue-600 hover:text-white transition"
              >
                <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>Open HTML File...</span>
              </button>
              <button
                onClick={openProjectFile}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2.5 text-slate-200 hover:bg-blue-600 hover:text-white transition"
              >
                <FolderArchive className="w-3.5 h-3.5 text-purple-400" />
                <span>Import ZIP Package...</span>
              </button>
              <button
                onClick={openProjectFolder}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2.5 text-slate-200 hover:bg-blue-600 hover:text-white transition"
              >
                <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Open Project Folder...</span>
              </button>
              <div className="my-1 border-t border-slate-800" />
              <button
                onClick={() => saveProject()}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2.5 text-slate-200 hover:bg-blue-600 hover:text-white transition"
              >
                <Save className="w-3.5 h-3.5 text-cyan-400" />
                <span>Save Project</span>
              </button>
            </div>
          )}
        </div>

        {/* Recent Projects Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRecents(!showRecents)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
          >
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Recent</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRecents && (
            <div
              className="absolute left-0 top-full mt-1 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 text-xs animate-in fade-in duration-100"
              onMouseLeave={() => setShowRecents(false)}
            >
              <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Recent Projects (SQLite)
              </div>
              {recentProjects.length === 0 ? (
                <div className="px-3 py-2 text-slate-500 italic">No recent projects yet</div>
              ) : (
                recentProjects.map((rec) => (
                  <button
                    key={rec.id}
                    onClick={() => {
                      openProjectFromPath(rec.filePath);
                      setShowRecents(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-800 transition flex flex-col group"
                  >
                    <span className="font-semibold text-slate-200 group-hover:text-blue-400 truncate">
                      {rec.title}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate font-mono">
                      {rec.filePath}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Center: Editable Project Title & Dirty Status */}
      <div
        className="flex items-center gap-3"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {isEditingTitle ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSubmit();
                if (e.key === 'Escape') {
                  setTitleInput(project.title);
                  setIsEditingTitle(false);
                }
              }}
              autoFocus
              className="bg-slate-900 border border-blue-500 rounded px-2.5 py-0.5 text-xs font-bold text-white focus:outline-none"
            />
            <button
              onClick={handleTitleSubmit}
              className="p-1 rounded bg-blue-600 text-white hover:bg-blue-500"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingTitle(true)}>
            <h1 className="text-xs font-bold text-slate-200 tracking-wide max-w-xs truncate">
              {project.title}
            </h1>
            <Edit2 className="w-3 h-3 text-slate-500 opacity-60 group-hover:opacity-100 transition" />
          </div>
        )}

        {/* Saved / Unsaved Indicator */}
        <span
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
            isDirty
              ? 'bg-amber-950/40 border-amber-600/30 text-amber-300'
              : 'bg-emerald-950/40 border-emerald-600/30 text-emerald-300'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isDirty ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
          {isDirty ? 'Unsaved Edits' : 'Saved'}
        </span>
      </div>

      {/* Right: Panel Toggles, Engine Capability Badge & Export CTA */}
      <div
        className="flex items-center gap-3"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* Workspace Panel Toggles */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
          <button
            onClick={toggleLeftSidebar}
            className={`p-1.5 rounded transition ${
              !leftSidebarCollapsed ? 'bg-slate-800 text-blue-400' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle Assets Sidebar (Ctrl/Cmd+B)"
            aria-label="Toggle Assets Sidebar"
          >
            <PanelLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleTimeline}
            className={`p-1.5 rounded transition ${
              !timelineCollapsed ? 'bg-slate-800 text-blue-400' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle Timeline (T / Ctrl+J)"
            aria-label="Toggle Timeline"
          >
            <PanelBottom className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleRightPanel}
            className={`p-1.5 rounded transition ${
              !rightPanelCollapsed ? 'bg-slate-800 text-blue-400' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle Properties Panel (Ctrl/Cmd+Shift+B)"
            aria-label="Toggle Properties Panel"
          >
            <PanelRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* System Capabilities Pill */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span>
            {systemCapabilities?.ffmpegAvailable ? 'FFmpeg Active' : 'FFmpeg Standby'}
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-700" />
          <span className="text-emerald-400 font-medium">GPU Accel</span>
        </div>

        {/* Primary Export CTA */}
        <button
          onClick={startExport}
          disabled={isExporting}
          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 transition active:scale-95 disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export MP4</span>
        </button>

        {/* Non-Mac Window Controls (Windows / Linux) */}
        {platform !== 'darwin' && (
          <div className="flex items-center ml-1 border-l border-slate-800 pl-2 gap-1">
            <button
              onClick={() => window.desktopApi?.minimizeWindow?.()}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Minimize Window"
              aria-label="Minimize Window"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={async () => {
                const max = await window.desktopApi?.maximizeWindow?.();
                setIsMaximized(Boolean(max));
              }}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title={isMaximized ? 'Restore Window' : 'Maximize Window'}
              aria-label="Maximize or Restore Window"
            >
              <Square className="w-3 h-3" />
            </button>
            <button
              onClick={() => window.desktopApi?.closeWindow?.()}
              className="p-1.5 rounded hover:bg-red-600 text-slate-400 hover:text-white transition"
              title="Close Window"
              aria-label="Close Window"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

