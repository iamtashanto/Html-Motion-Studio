import React, { useState, useMemo } from 'react';
import { useDesktopStudioStore } from '../../store/desktopStudioStore';
import {
  FileCode,
  FileText,
  Image,
  Music,
  Folder,
  Layers,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Plus,
  CheckCircle2,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

export const AssetsSidebar: React.FC = () => {
  const {
    project,
    setEntryHtml,
    selectAudioFile,
    audioFilePath,
    audioSettings,
    clearAudio,
    leftSidebarWidth,
    leftSidebarCollapsed,
    toggleLeftSidebar,
  } = useDesktopStudioStore();

  const [expandedSections, setExpandedSections] = useState({
    html: true,
    styles: true,
    scripts: true,
    images: false, // Default images to collapsed for high performance on large projects
    audio: true,
  });

  const toggleSection = (key: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const { assets, cssAssets, jsAssets, imgAssets, fontAssets } = useMemo(() => {
    const all = Object.values(project.assets);
    return {
      assets: all,
      cssAssets: all.filter((a) => a.type === 'text/css'),
      jsAssets: all.filter((a) => a.type === 'application/javascript'),
      imgAssets: all.filter((a) => a.type.startsWith('image/')),
      fontAssets: all.filter((a) => a.type.startsWith('font/')),
    };
  }, [project.assets]);

  if (leftSidebarCollapsed) {
    return (
      <aside className="w-11 bg-slate-950 border-r border-slate-800/80 flex flex-col items-center py-3 select-none text-xs shrink-0 z-10 justify-between">
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={toggleLeftSidebar}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
            title="Expand Assets Sidebar (Ctrl/Cmd+B)"
            aria-label="Expand Assets Sidebar"
          >
            <PanelLeftOpen className="w-4 h-4 text-blue-400" />
          </button>
          <div className="w-6 h-px bg-slate-800" />
          <div className="writing-vertical-lr rotate-180 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 py-2">
            <Folder className="w-3 h-3 text-slate-400" />
            <span>Assets ({assets.length})</span>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      style={{ width: `${leftSidebarWidth}px` }}
      className="bg-slate-950 border-r border-slate-800/80 flex flex-col h-full min-h-0 select-none text-xs shrink-0 overflow-hidden"
    >
      {/* Sidebar Header */}
      <div className="p-3 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/90">
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4 text-blue-400" />
          <span className="font-bold text-slate-200">Project Assets</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
            {assets.length} file{assets.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={toggleLeftSidebar}
            className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-800 transition"
            title="Collapse Assets Sidebar (Ctrl/Cmd+B)"
            aria-label="Collapse Assets Sidebar"
          >
            <PanelLeftClose className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Asset Categories Tree */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {/* HTML Entry Files */}
        <div>
          <button
            onClick={() => toggleSection('html')}
            className="w-full flex items-center justify-between text-slate-400 hover:text-slate-200 py-1 font-semibold text-[11px] uppercase tracking-wider"
          >
            <span className="flex items-center gap-1.5">
              {expandedSections.html ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              Entry HTML
            </span>
            <span className="text-[10px] text-slate-500 font-mono">({project.availableHtmlFiles.length})</span>
          </button>

          {expandedSections.html && (
            <div className="mt-1 space-y-1 pl-4">
              {project.availableHtmlFiles.map((htmlFile) => {
                const isSelected = project.entryHtmlPath === htmlFile;
                return (
                  <button
                    key={htmlFile}
                    onClick={() => setEntryHtml(htmlFile)}
                    className={`w-full flex items-center justify-between p-1.5 rounded-lg text-left transition ${
                      isSelected
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <FileCode className="w-3.5 h-3.5 text-blue-400" />
                      {htmlFile}
                    </span>
                    {isSelected && <span className="text-[9px] font-bold text-blue-400 uppercase">ACTIVE</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Stylesheets (CSS) */}
        {cssAssets.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('styles')}
              className="w-full flex items-center justify-between text-slate-400 hover:text-slate-200 py-1 font-semibold text-[11px] uppercase tracking-wider"
            >
              <span className="flex items-center gap-1.5">
                {expandedSections.styles ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                Stylesheets
              </span>
              <span className="text-[10px] text-slate-500 font-mono">({cssAssets.length})</span>
            </button>

            {expandedSections.styles && (
              <div className="mt-1 space-y-1 pl-4">
                {cssAssets.map((css) => (
                  <div key={css.path} className="flex items-center justify-between p-1 text-slate-300 truncate">
                    <span className="flex items-center gap-1.5 truncate">
                      <FileText className="w-3.5 h-3.5 text-cyan-400" />
                      {css.name}
                    </span>
                    <span className="text-[10px] text-slate-600 font-mono">
                      {(css.size / 1024).toFixed(1)}k
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Scripts (JS) */}
        {jsAssets.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('scripts')}
              className="w-full flex items-center justify-between text-slate-400 hover:text-slate-200 py-1 font-semibold text-[11px] uppercase tracking-wider"
            >
              <span className="flex items-center gap-1.5">
                {expandedSections.scripts ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                Scripts
              </span>
              <span className="text-[10px] text-slate-500 font-mono">({jsAssets.length})</span>
            </button>

            {expandedSections.scripts && (
              <div className="mt-1 space-y-1 pl-4">
                {jsAssets.map((js) => (
                  <div key={js.path} className="flex items-center justify-between p-1 text-slate-300 truncate">
                    <span className="flex items-center gap-1.5 truncate">
                      <FileCode className="w-3.5 h-3.5 text-amber-400" />
                      {js.name}
                    </span>
                    <span className="text-[10px] text-slate-600 font-mono">
                      {(js.size / 1024).toFixed(1)}k
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Media Images */}
        {imgAssets.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('images')}
              className="w-full flex items-center justify-between text-slate-400 hover:text-slate-200 py-1 font-semibold text-[11px] uppercase tracking-wider"
            >
              <span className="flex items-center gap-1.5">
                {expandedSections.images ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                Images & SVG
              </span>
              <span className="text-[10px] text-slate-500 font-mono">({imgAssets.length})</span>
            </button>

            {expandedSections.images && (
              <div className="mt-1 space-y-1 pl-4">
                {imgAssets.map((img) => (
                  <div key={img.path} className="flex items-center justify-between p-1 text-slate-300 truncate">
                    <span className="flex items-center gap-1.5 truncate">
                      <Image className="w-3.5 h-3.5 text-emerald-400" />
                      {img.name}
                    </span>
                    <span className="text-[10px] text-slate-600 font-mono">
                      {(img.size / 1024).toFixed(1)}k
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Soundtrack Audio Section */}
        <div>
          <button
            onClick={() => toggleSection('audio')}
            className="w-full flex items-center justify-between text-slate-400 hover:text-slate-200 py-1 font-semibold text-[11px] uppercase tracking-wider"
          >
            <span className="flex items-center gap-1.5">
              {expandedSections.audio ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              Soundtrack Audio
            </span>
          </button>

          {expandedSections.audio && (
            <div className="mt-1.5 pl-4 space-y-2">
              {audioFilePath ? (
                <div className="p-2 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-purple-200 truncate flex items-center gap-1">
                      <Music className="w-3 h-3 text-purple-400" />
                      {audioSettings.fileName || 'Soundtrack'}
                    </span>
                    <button
                      onClick={clearAudio}
                      className="text-[10px] text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    {audioFilePath}
                  </div>
                </div>
              ) : (
                <button
                  onClick={selectAudioFile}
                  className="w-full py-2 px-3 border border-dashed border-slate-800 hover:border-slate-700 rounded-xl text-slate-400 hover:text-slate-200 flex items-center justify-center gap-2 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Attach Audio Track</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

