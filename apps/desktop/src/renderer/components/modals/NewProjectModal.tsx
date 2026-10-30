import React, { useState } from 'react';
import { useDesktopStudioStore } from '../../store/desktopStudioStore';
import { SAMPLE_TEMPLATES } from '@html-motion-studio/shared';
import { Sparkles, X, Plus, FileCode } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose }) => {
  const { createProject } = useDesktopStudioStore();
  const [projectTitle, setProjectTitle] = useState('New Animation Project');
  const [selectedTemplateId, setSelectedTemplateId] = useState(SAMPLE_TEMPLATES[1].id);

  if (!isOpen) return null;

  const handleCreate = () => {
    createProject(projectTitle.trim() || 'Untitled Animation Project', selectedTemplateId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Create New Motion Project</h3>
              <p className="text-[11px] text-slate-400">
                Start from a verified starter template or blank canvas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project Title Input */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-300">Project Name</label>
          <input
            type="text"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:border-blue-500 focus:outline-none"
            placeholder="e.g. Social Video Ad 60fps"
          />
        </div>

        {/* Starter Templates Selection Grid */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-300">Starter Templates (12 Built-in Suites)</label>
          <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
            {SAMPLE_TEMPLATES.map((tmpl) => {
              const isSelected = selectedTemplateId === tmpl.id;
              return (
                <button
                  key={tmpl.id}
                  onClick={() => setSelectedTemplateId(tmpl.id)}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-500 bg-blue-950/40 ring-1 ring-blue-500/30'
                      : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-slate-200 text-xs truncate">
                      {tmpl.name}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                      {tmpl.description}
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-slate-500 font-mono">
                    {tmpl.defaultDuration}s runtime • {tmpl.category}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-500/25 transition"
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
};
