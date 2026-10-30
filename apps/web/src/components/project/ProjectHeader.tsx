'use client';

import React, { useState } from 'react';
import { useStudioStore } from '@/store/studioStore';
import {
  FolderKanban,
  FileCode,
  FolderArchive,
  Code2,
  Sparkles,
  PlusCircle,
  RotateCcw,
  Check,
  Edit2,
  AlertTriangle,
  Layers,
  File,
  X,
} from 'lucide-react';

export const ProjectHeader: React.FC = () => {
  const {
    project,
    isDirty,
    setProjectTitle,
    newProject,
    resetProject,
    isExporting,
  } = useStudioStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(project.title);
  const [confirmModal, setConfirmModal] = useState<'new' | 'reset' | null>(null);

  const handleTitleSubmit = () => {
    if (titleInput.trim()) {
      setProjectTitle(titleInput.trim());
    } else {
      setTitleInput(project.title);
    }
    setIsEditingTitle(false);
  };

  const handleConfirmAction = () => {
    if (confirmModal === 'new') {
      newProject();
      setTitleInput('Untitled Motion Project');
    } else if (confirmModal === 'reset') {
      resetProject();
      setTitleInput(project.title);
    }
    setConfirmModal(null);
  };

  const assetCount = Object.keys(project.assets).length;

  const modeBadge = {
    template: {
      label: 'Built-in Template',
      icon: Sparkles,
      color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    },
    code: {
      label: 'Code Workspace',
      icon: Code2,
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    file: {
      label: 'Single HTML',
      icon: FileCode,
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    zip: {
      label: 'ZIP Package',
      icon: FolderArchive,
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
  }[project.mode] || {
    label: 'Custom Project',
    icon: FolderKanban,
    color: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  const ModeIcon = modeBadge.icon;

  return (
    <>
      <div className="w-full bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Project Title & Mode Info */}
        <div className="space-y-1.5 min-w-0 max-w-full">
          <div className="flex flex-wrap items-center gap-2">
            {isEditingTitle ? (
              <div className="flex items-center gap-2 max-w-full">
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
                  className="bg-slate-950 border border-blue-500 rounded-lg px-2.5 py-1 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[180px]"
                />
                <button
                  onClick={handleTitleSubmit}
                  className="p-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition shrink-0"
                  title="Save title"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group min-w-0">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight truncate max-w-[170px] sm:max-w-md">
                  {project.title}
                </h2>
                <button
                  onClick={() => {
                    setTitleInput(project.title);
                    setIsEditingTitle(true);
                  }}
                  className="text-slate-500 hover:text-slate-300 transition opacity-70 group-hover:opacity-100 p-1 shrink-0"
                  title="Rename project"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Dirty / Saved Status Indicator */}
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border shrink-0 ${
                isDirty
                  ? 'bg-amber-950/40 border-amber-600/30 text-amber-300'
                  : 'bg-emerald-950/40 border-emerald-600/30 text-emerald-300'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isDirty ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
                }`}
              />
              {isDirty ? 'Unsaved Edits' : 'Pristine'}
            </span>
          </div>

          {/* Project Metadata Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium ${modeBadge.color}`}
            >
              <ModeIcon className="w-3 h-3" />
              {modeBadge.label}
            </span>

            {project.entryHtmlPath && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono">
                <File className="w-3 h-3 text-slate-400" />
                {project.entryHtmlPath}
              </span>
            )}

            {assetCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono">
                <Layers className="w-3 h-3 text-slate-400" />
                {assetCount} asset{assetCount > 1 ? 's' : ''} in memory
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-mono">
                Self-contained
              </span>
            )}

            <span className="text-[11px] text-slate-500 font-mono">
              Target Duration: {project.detectedDuration}s
            </span>
          </div>
        </div>

        {/* Right: Project Management Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              if (isDirty || assetCount > 0) {
                setConfirmModal('new');
              } else {
                newProject();
                setTitleInput('Untitled Motion Project');
              }
            }}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 text-xs font-semibold transition active:scale-95 disabled:opacity-50"
          >
            <PlusCircle className="w-3.5 h-3.5 text-blue-400" />
            <span>New Project</span>
          </button>

          <button
            onClick={() => {
              if (isDirty) {
                setConfirmModal('reset');
              } else {
                resetProject();
              }
            }}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 text-xs font-semibold transition active:scale-95 disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Destructive Actions */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {confirmModal === 'new' ? 'Create New Project?' : 'Reset Current Project?'}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {confirmModal === 'new'
                    ? 'Creating a new project will discard any unsaved code modifications, uploaded ZIP assets, and audio tracks.'
                    : 'Resetting will discard your latest code edits and restore the template back to its pristine default state.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
              >
                Keep Current
              </button>
              <button
                onClick={handleConfirmAction}
                className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md transition"
              >
                {confirmModal === 'new' ? 'Discard & Start New' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

