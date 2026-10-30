'use client';

import React, { useState, useRef } from 'react';
import { useStudioStore } from '@/store/studioStore';
import { SAMPLE_TEMPLATES } from '@html-motion-studio/shared';
import {
  Upload,
  FileCode,
  FolderArchive,
  Code2,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  File,
  Layers,
  ChevronDown,
} from 'lucide-react';

export const UploadZone: React.FC = () => {
  const {
    project,
    loadTemplate,
    loadHtmlFile,
    loadZipArchive,
    setEntryHtmlPath,
    updateCode,
    setMode,
  } = useStudioStore();

  const [activeTab, setActiveTab] = useState<'upload' | 'zip' | 'editor' | 'templates'>('templates');
  const [dragActive, setDragActive] = useState(false);
  const [editorHtml, setEditorHtml] = useState(project.htmlContent);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  // Handle single HTML file upload
  const handleHtmlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      loadHtmlFile(e.target.files[0]);
    }
  };

  // Handle ZIP file upload
  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      loadZipArchive(e.target.files[0]);
    }
  };

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.zip')) {
        loadZipArchive(file);
      } else {
        loadHtmlFile(file);
      }
    }
  };

  const handleApplyEditorCode = () => {
    updateCode(editorHtml);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
      {/* Tab Header */}
      <div className="flex border-b border-slate-800/80 bg-slate-950/60 p-1.5 gap-1 overflow-x-auto scrollbar-none whitespace-nowrap max-w-full">
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition ${
            activeTab === 'templates'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Test Projects (12)
        </button>

        <button
          onClick={() => {
            setActiveTab('upload');
            setMode('file');
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition ${
            activeTab === 'upload'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          Single HTML
        </button>

        <button
          onClick={() => {
            setActiveTab('zip');
            setMode('zip');
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition ${
            activeTab === 'zip'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <FolderArchive className="w-3.5 h-3.5" />
          ZIP Package
        </button>

        <button
          onClick={() => {
            setActiveTab('editor');
            setMode('code');
            setEditorHtml(project.htmlContent);
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition ${
            activeTab === 'editor'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          Code Editor
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-5">
        {/* TAB 1: Test Project Templates */}
        {activeTab === 'templates' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Select Built-in Test Suite Template
              </span>
              <span className="text-xs text-slate-500">
                12 templates covering CSS, Canvas, rAF & Audio
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
              {SAMPLE_TEMPLATES.map((tmpl) => {
                const isSelected = project.id === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => {
                      loadTemplate(tmpl.id);
                      setEditorHtml(tmpl.html);
                    }}
                    className={`text-left p-3 rounded-xl border transition flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-500/80 bg-blue-950/30 shadow-md ring-1 ring-blue-500/30'
                        : 'border-slate-800 bg-slate-950/40 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-semibold text-slate-200">
                        {tmpl.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {tmpl.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {tmpl.description}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[10px]">
                      <span className="text-slate-500">{tmpl.defaultDuration}s runtime</span>
                      <span
                        className={`font-medium ${
                          tmpl.expectedStatus === 'ready'
                            ? 'text-emerald-400'
                            : tmpl.expectedStatus === 'limited'
                            ? 'text-amber-400'
                            : 'text-orange-400'
                        }`}
                      >
                        ● {tmpl.expectedStatus}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Upload Single HTML */}
        {activeTab === 'upload' && (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition cursor-pointer text-center ${
              dragActive
                ? 'border-blue-500 bg-blue-950/20'
                : 'border-slate-800 hover:border-slate-700 bg-slate-950/30'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".html,.htm"
              onChange={handleHtmlChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3 shadow-inner">
              <Upload className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-200">
              Drop your HTML file here or browse
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Supports standard HTML files with inline styles, keyframes, SVG, or embedded scripts.
            </p>
            <span className="text-[11px] text-slate-500 mt-3 px-3 py-1 bg-slate-800/80 rounded-full font-mono">
              Maximum file size: 50MB • All processing remains local in-browser
            </span>
          </div>
        )}

        {/* TAB 3: Upload ZIP Package */}
        {activeTab === 'zip' && (
          <div>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition cursor-pointer text-center ${
                dragActive
                  ? 'border-blue-500 bg-blue-950/20'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/30'
              }`}
              onClick={() => zipInputRef.current?.click()}
            >
              <input
                ref={zipInputRef}
                type="file"
                accept=".zip"
                onChange={handleZipChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3 shadow-inner">
                <FolderArchive className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-200">
                Drop your ZIP project archive
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                Safely extracts assets in browser memory with path-traversal protection.
                Automatically resolves local CSS, JS, images, SVG, and fonts.
              </p>
            </div>

            {/* ZIP Asset Overview and Entry Selector */}
            {project.mode === 'zip' && (
              <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-200">
                      ZIP Extracted: {Object.keys(project.assets).length} assets in memory
                    </span>
                  </div>
                  {project.availableHtmlFiles.length > 1 && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">Entry File:</span>
                      <select
                        value={project.entryHtmlPath}
                        onChange={(e) => setEntryHtmlPath(e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs"
                      >
                        {project.availableHtmlFiles.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* File list overview */}
                <div className="max-h-24 overflow-y-auto space-y-1 text-xs font-mono text-slate-400">
                  {Object.values(project.assets).map((asset) => (
                    <div key={asset.path} className="flex items-center justify-between py-0.5">
                      <span className="truncate flex items-center gap-1.5">
                        <File className="w-3 h-3 text-slate-500" />
                        {asset.path}
                      </span>
                      <span className="text-[10px] text-slate-600">
                        {(asset.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Live Code Editor */}
        {activeTab === 'editor' && (
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Live HTML & CSS Editor
              </span>
              <button
                onClick={handleApplyEditorCode}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition"
              >
                Apply Changes to Preview
              </button>
            </div>
            <textarea
              value={editorHtml}
              onChange={(e) => setEditorHtml(e.target.value)}
              className="w-full h-48 bg-slate-950 font-mono text-xs text-slate-200 p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Paste custom HTML, SVG, or CSS here..."
              spellCheck={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

