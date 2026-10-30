import React, { useState, useEffect, useRef } from 'react';
import { useDesktopStudioStore } from '../../store/desktopStudioStore';
import {
  Code,
  FileCode,
  FileText,
  Play,
  Check,
  RotateCcw,
  Maximize2,
  Minimize2,
  X,
  Sparkles,
  Save,
  Search,
  Copy,
} from 'lucide-react';

interface CodeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodeEditorModal: React.FC<CodeEditorModalProps> = ({ isOpen, onClose }) => {
  const { project, updateHtmlContent, restart } = useDesktopStudioStore();

  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html');
  const [htmlCode, setHtmlCode] = useState(project.htmlContent);
  const [cssCode, setCssCode] = useState('');
  const [jsCode, setJsCode] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync initial content on open or when project changes
  useEffect(() => {
    if (isOpen) {
      setHtmlCode(project.htmlContent);
      setIsDirty(false);

      // Extract embedded CSS and JS if present
      const styleMatch = project.htmlContent.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
      setCssCode(styleMatch ? styleMatch[1].trim() : '/* Embedded CSS styles */\nbody {\n  margin: 0;\n}');

      const scriptMatch = project.htmlContent.match(/<script(?![^>]*__hms)[^>]*>([\s\S]*?)<\/script>/i);
      setJsCode(scriptMatch ? scriptMatch[1].trim() : '// Custom animation scripts\nconsole.log("Animation loaded");');
    }
  }, [isOpen, project.htmlContent]);

  if (!isOpen) return null;

  // Handle Tab key in editor
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      const currentValue = target.value;
      const newValue = currentValue.substring(0, start) + '  ' + currentValue.substring(end);

      if (activeTab === 'html') setHtmlCode(newValue);
      else if (activeTab === 'css') setCssCode(newValue);
      else setJsCode(newValue);

      setIsDirty(true);

      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      });
    } else if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      handleApply();
    }
  };

  // Apply code changes into project state
  const handleApply = () => {
    let finalHtml = htmlCode;

    // If edited via CSS or JS tabs, merge back into HTML
    if (activeTab === 'css') {
      if (finalHtml.includes('</style>')) {
        finalHtml = finalHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/i, `<style>\n${cssCode}\n</style>`);
      } else if (finalHtml.includes('</head>')) {
        finalHtml = finalHtml.replace('</head>', `<style>\n${cssCode}\n</style>\n</head>`);
      } else {
        finalHtml = `<style>\n${cssCode}\n</style>\n${finalHtml}`;
      }
    } else if (activeTab === 'js') {
      if (finalHtml.includes('</script>')) {
        finalHtml = finalHtml.replace(/<script(?![^>]*__hms)[^>]*>[\s\S]*?<\/script>/i, `<script>\n${jsCode}\n</script>`);
      } else if (finalHtml.includes('</body>')) {
        finalHtml = finalHtml.replace('</body>', `<script>\n${jsCode}\n</script>\n</body>`);
      } else {
        finalHtml = `${finalHtml}\n<script>\n${jsCode}\n</script>`;
      }
    }

    setHtmlCode(finalHtml);
    updateHtmlContent(finalHtml);
    setIsDirty(false);
    setApplySuccess(true);
    setTimeout(() => setApplySuccess(false), 2000);
  };

  // Format code (Clean basic indenting)
  const handleFormat = () => {
    if (activeTab === 'html') {
      let formatted = '';
      let indent = 0;
      const lines = htmlCode.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('</')) indent = Math.max(0, indent - 1);
        formatted += '  '.repeat(indent) + trimmed + '\n';
        if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>') && !trimmed.includes('</')) {
          indent++;
        }
      }
      setHtmlCode(formatted.trim());
    }
    setIsDirty(true);
  };

  const handleCopy = () => {
    const val = activeTab === 'html' ? htmlCode : activeTab === 'css' ? cssCode : jsCode;
    navigator.clipboard.writeText(val);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentCode = activeTab === 'html' ? htmlCode : activeTab === 'css' ? cssCode : jsCode;
  const lineCount = currentCode.split('\n').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div
        className={`bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
          isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl h-[85vh]'
        }`}
      >
        {/* Editor Header Bar */}
        <div className="h-12 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white tracking-wide">Motion Code Editor</span>
            </div>

            {/* Tab switchers */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 ml-3">
              <button
                onClick={() => setActiveTab('html')}
                className={`px-3 py-1 rounded text-xs font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'html' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>HTML</span>
              </button>
              <button
                onClick={() => setActiveTab('css')}
                className={`px-3 py-1 rounded text-xs font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'css' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>CSS</span>
              </button>
              <button
                onClick={() => setActiveTab('js')}
                className={`px-3 py-1 rounded text-xs font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'js' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>JavaScript</span>
              </button>
            </div>

            {/* Dirty Status Pill */}
            {isDirty && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-600/40 text-amber-300 font-medium">
                Unsaved Changes
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleFormat}
              className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium transition flex items-center gap-1.5"
              title="Clean & Format Code"
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Format</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium transition flex items-center gap-1.5"
              title="Copy to Clipboard"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={handleApply}
              className="px-3.5 py-1 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition shadow-md shadow-cyan-600/20 flex items-center gap-1.5"
              title="Apply Code to Animation (Ctrl/Cmd+S)"
            >
              {applySuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>{applySuccess ? 'Applied!' : 'Apply to Preview'}</span>
            </button>

            <div className="h-4 w-px bg-slate-800 mx-1" />

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-red-600/80 text-slate-400 hover:text-white transition"
              title="Close Editor (Esc)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Code Workspace with Line Numbers */}
        <div className="flex-1 flex min-h-0 bg-[#060910] text-slate-100 font-mono text-xs leading-relaxed overflow-hidden">
          {/* Gutter Line Numbers */}
          <div className="w-12 bg-[#090d16] border-r border-slate-800/80 py-3 select-none text-right pr-3 text-slate-600 font-mono overflow-hidden shrink-0">
            {Array.from({ length: Math.min(lineCount, 500) }).map((_, i) => (
              <div key={i} className="h-5 text-[11px] leading-5">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Text Editor Area */}
          <div className="flex-1 relative flex">
            <textarea
              ref={textareaRef}
              value={currentCode}
              onChange={(e) => {
                const val = e.target.value;
                if (activeTab === 'html') setHtmlCode(val);
                else if (activeTab === 'css') setCssCode(val);
                else setJsCode(val);
                setIsDirty(true);
              }}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              className="w-full h-full bg-transparent p-3 text-slate-200 resize-none focus:outline-none font-mono text-xs leading-5 selection:bg-cyan-500/30 overflow-auto whitespace-pre tab-2"
              placeholder={`Write or paste ${activeTab.toUpperCase()} code here...`}
            />
          </div>
        </div>

        {/* Editor Footer Status Bar */}
        <div className="h-7 bg-slate-950 border-t border-slate-800/80 px-4 flex items-center justify-between text-[11px] text-slate-500 font-mono shrink-0">
          <div className="flex items-center gap-3">
            <span>Lines: {lineCount}</span>
            <span>Chars: {currentCode.length}</span>
            <span className="text-cyan-400">Encoding: UTF-8</span>
          </div>

          <div className="flex items-center gap-2">
            <span>Tab: 2 spaces</span>
            <span>•</span>
            <span className="text-slate-400">Press Cmd/Ctrl + S to apply</span>
          </div>
        </div>
      </div>
    </div>
  );
};

