import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useJudge } from '../../context/JudgeContext';
import type { SupportedLanguage } from '../../types/judge';
import { 
  RotateCcw, 
  Copy, 
  Check, 
  Maximize2, 
  Minimize2, 
  ChevronDown,
  AlertCircle
} from 'lucide-react';

interface Props {
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  code: string;
  onCodeChange: (newCode: string) => void;
  onResetCode: () => void;
}

const LANGUAGE_LABELS: Record<SupportedLanguage, { label: string; monacoLang: string; version: string }> = {
  cpp: { label: 'C++', monacoLang: 'cpp', version: 'GCC 13.2' },
  python: { label: 'Python 3', monacoLang: 'python', version: 'Python 3.12' },
  java: { label: 'Java', monacoLang: 'java', version: 'OpenJDK 21' },
  javascript: { label: 'JavaScript', monacoLang: 'javascript', version: 'Node.js 20' },
};

export const MonacoCodeEditor: React.FC<Props> = ({
  language,
  onLanguageChange,
  code,
  onCodeChange,
  onResetCode,
}) => {
  const { theme } = useJudge();
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<number>(13);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmReset = () => {
    onResetCode();
    setShowResetConfirm(false);
  };

  const currentLangConfig = LANGUAGE_LABELS[language];

  return (
    <div className={`flex flex-col bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg shadow-xs overflow-hidden transition-all duration-150 ${
      isFullscreen ? 'fixed inset-3 z-50 shadow-2xl' : 'h-full'
    }`}>
      
      {/* Editor Header Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-950/70 px-3 py-1.5 shrink-0 select-none">
        
        {/* Left: Language Selector */}
        <div className="relative">
          <button
            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 text-xs font-medium text-slate-800 dark:text-zinc-100 transition-colors shadow-2xs"
          >
            <span className="font-semibold text-slate-900 dark:text-zinc-50">{currentLangConfig.label}</span>
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">({currentLangConfig.version})</span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>

          {isLangDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsLangDropdownOpen(false)} 
              />
              <div className="absolute left-0 mt-1 w-48 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-md py-1 z-50 text-xs">
                {(Object.keys(LANGUAGE_LABELS) as SupportedLanguage[]).map(langKey => {
                  const info = LANGUAGE_LABELS[langKey];
                  const isSelected = langKey === language;
                  return (
                    <button
                      key={langKey}
                      onClick={() => {
                        onLanguageChange(langKey);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-left transition-colors ${
                        isSelected 
                          ? 'bg-slate-100 text-slate-900 font-semibold dark:bg-zinc-800 dark:text-zinc-50' 
                          : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/60'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{info.label}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{info.version}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-slate-900 dark:text-zinc-100" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Right: Editor Utilities */}
        <div className="flex items-center gap-1">
          {/* Font Size Toggle */}
          <button
            onClick={() => setFontSize(prev => (prev === 13 ? 14 : prev === 14 ? 12 : 13))}
            title="Toggle Editor Font Size (12px / 13px / 14px)"
            className="px-2 py-1 rounded hover:bg-slate-200/60 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors text-[11px] font-mono font-medium"
          >
            {fontSize}px
          </button>

          {/* Reset Code with inline two-click confirmation */}
          {showResetConfirm ? (
            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded text-[11px]">
              <AlertCircle className="w-3 h-3 text-amber-600" />
              <span className="text-amber-800 dark:text-amber-300">Reset code?</span>
              <button
                onClick={handleConfirmReset}
                className="font-bold text-amber-900 dark:text-amber-200 hover:underline ml-1"
              >
                Yes
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="text-slate-500 hover:underline ml-1"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowResetConfirm(true)}
              title="Reset code template"
              className="p-1.5 rounded hover:bg-slate-200/60 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Copy Code */}
          <button
            onClick={handleCopy}
            title="Copy Code to Clipboard"
            className="p-1.5 rounded hover:bg-slate-200/60 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Editor"}
            className="p-1.5 rounded hover:bg-slate-200/60 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Monaco Container */}
      <div className="flex-1 min-h-[300px] relative bg-white dark:bg-zinc-950">
        <Editor
          height="100%"
          language={currentLangConfig.monacoLang}
          value={code}
          onChange={(val) => onCodeChange(val || '')}
          theme={theme === 'dark' ? 'vs-dark' : 'vs'}
          options={{
            fontSize,
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            fontLigatures: true,
            tabSize: 4,
            insertSpaces: true,
            minimap: { enabled: false },
            lineNumbers: 'on',
            lineNumbersMinChars: 3,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            renderLineHighlight: 'line',
            padding: { top: 12, bottom: 12 },
            overviewRulerBorder: false,
            bracketPairColorization: { enabled: true },
            fixedOverflowWidgets: true,
          }}
          loading={
            <div className="h-full w-full flex items-center justify-center bg-white dark:bg-zinc-900 text-xs text-slate-500 font-mono">
              Loading editor environment...
            </div>
          }
        />
      </div>
    </div>
  );
};
