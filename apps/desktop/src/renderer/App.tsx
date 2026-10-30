import React, { useEffect, useState } from 'react';
import { useDesktopStudioStore } from './store/desktopStudioStore';
import { AppToolbar } from './components/toolbar/AppToolbar';
import { AssetsSidebar } from './components/sidebar/AssetsSidebar';
import { DesktopPreview } from './components/preview/DesktopPreview';
import { PropertiesPanel } from './components/properties/PropertiesPanel';
import { TimelineTrack } from './components/timeline/TimelineTrack';
import { ExportProgressDialog } from './components/modals/ExportProgressDialog';
import { ExportSuccessDialog } from './components/modals/ExportSuccessDialog';
import { NewProjectModal } from './components/modals/NewProjectModal';
import { AlertCircle, X } from 'lucide-react';

export const App: React.FC = () => {
  const { initialize, exportError, clearExportError } = useDesktopStudioStore();
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#090d16] text-slate-100 font-sans">
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
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Project Explorer & Assets */}
        <AssetsSidebar />

        {/* Center: Stage & Viewport */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <DesktopPreview />
          {/* Bottom: Interactive Master Timeline */}
          <TimelineTrack />
        </div>

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

