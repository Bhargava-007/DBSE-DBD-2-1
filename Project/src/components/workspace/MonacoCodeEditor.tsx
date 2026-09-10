import React, { useState, useRef, useEffect } from 'react';
import Editor, { type OnMount, type Monaco } from '@monaco-editor/react';
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
  cpp: { label: 'C++', monacoLang: 'cpp', version: 'GCC 13' },
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
  
  const editorRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const handleBeforeMount = (monaco: Monaco) => {
    monaco.editor.defineTheme('algoflow-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '52525b', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'f43f5e', fontStyle: 'bold' },
        { token: 'string', foreground: '10b981' },
        { token: 'number', foreground: 'f59e0b' },
        { token: 'type', foreground: '8b5cf6' },
        { token: 'function', foreground: 'a78bfa' },
        { token: 'identifier', foreground: 'fafafa' },
      ],
      colors: {
        'editor.background': '#0a0a0b',
        'editor.foreground': '#fafafa',
        'editor.lineHighlightBackground': '#111113',
        'editorLineNumber.foreground': '#3f3f46',
        'editorLineNumber.activeForeground': '#8b5cf6',
        'editorCursor.foreground': '#8b5cf6',
        'editor.selectionBackground': '#8b5cf633',
        'editorGutter.background': '#0a0a0b',
        'scrollbarSlider.background': '#27272a80',
        'scrollbarSlider.hoverBackground': '#3f3f46',
        'editorIndentGuide.background1': '#18181b',
        'editorIndentGuide.activeBackground1': '#8b5cf660',
      },
    });

    monaco.editor.defineTheme('algoflow-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '94a3b8', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'e11d48', fontStyle: 'bold' },
        { token: 'string', foreground: '059669' },
        { token: 'number', foreground: 'd97706' },
        { token: 'type', foreground: '7c3aed' },
        { token: 'function', foreground: '6d28d9' },
        { token: 'identifier', foreground: '0f172a' },
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#0f172a',
        'editor.lineHighlightBackground': '#f8fafc',
        'editorLineNumber.foreground': '#94a3b8',
        'editorLineNumber.activeForeground': '#8b5cf6',
        'editorCursor.foreground': '#8b5cf6',
        'editor.selectionBackground': '#8b5cf630',
        'editorGutter.background': '#ffffff',
        'scrollbarSlider.background': '#cbd5e160',
        'scrollbarSlider.hoverBackground': '#94a3b8',
      },
    });
  };

  // Re-layout editor on resize
  useEffect(() => {
    const handleResize = () => {
      if (editorRef.current) {
        editorRef.current.layout();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <div className={`flex flex-col bg-[var(--bg-canvas)] text-[var(--text-1)] overflow-hidden font-sans transition-colors ${
      isFullscreen ? 'fixed inset-2 z-50 rounded-[var(--r-lg)] shadow-[var(--shadow-lg)] border border-[var(--border-strong)]' : 'h-full'
    }`}>
      
      {/* Top Toolbar */}
      <div className="h-9 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-card)] px-3 shrink-0 select-none">
        
        {/* Left: Language Selector */}
        <div className="relative">
          <button
            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-[var(--r-md)] bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--border-strong)] text-[12px] font-medium text-[var(--text-1)] transition-colors"
          >
            <span>{currentLangConfig.label}</span>
            <span className="text-[10px] text-[var(--text-3)] font-mono hidden sm:inline">({currentLangConfig.version})</span>
            <ChevronDown className="w-3 h-3 text-[var(--text-3)] ml-0.5" />
          </button>

          {isLangDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsLangDropdownOpen(false)} 
              />
              <div className="absolute left-0 mt-1 w-48 rounded-[var(--r-lg)] bg-[var(--bg-elevated)] border border-[var(--border-mid)] shadow-[var(--shadow-lg)] py-1 z-50 text-[12px] animate-in fade-in zoom-in-95 duration-100">
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
                          ? 'bg-[var(--accent-dim)] text-[var(--accent)] font-medium' 
                          : 'text-[var(--text-2)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-1)]'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>{info.label}</span>
                        <span className="text-[10px] text-[var(--text-3)] font-mono">{info.version}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[var(--accent)]" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Right: Actions (Font size, Reset, Copy, Fullscreen) */}
        <div className="flex items-center gap-1 text-[var(--text-2)] text-[12px] font-mono">
          
          {/* Font Size Toggle */}
          <button
            onClick={() => setFontSize(prev => (prev === 13 ? 14 : prev === 14 ? 12 : 13))}
            title="Font Size (12px / 13px / 14px)"
            className="px-2 py-0.5 rounded-[var(--r-sm)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-1)] transition-colors"
          >
            {fontSize}px
          </button>

          {/* Reset Code Confirmation */}
          {showResetConfirm ? (
            <div className="flex items-center gap-1 bg-[var(--amber-dim)] border border-[var(--amber)]/30 px-2 py-0.5 rounded-[var(--r-sm)] text-[11px]">
              <AlertCircle className="w-3 h-3 text-[var(--amber)]" />
              <span className="text-[var(--text-1)] font-sans">Reset?</span>
              <button
                onClick={handleConfirmReset}
                className="font-semibold text-[var(--amber)] hover:underline ml-1"
              >
                Yes
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="text-[var(--text-3)] hover:underline ml-1"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowResetConfirm(true)}
              title="Reset starter template"
              className="p-1 rounded hover:bg-[var(--bg-hover)] hover:text-[var(--text-1)] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Copy Code */}
          <button
            onClick={handleCopy}
            title={copied ? 'Copied!' : 'Copy Code'}
            className="p-1 rounded hover:bg-[var(--bg-hover)] hover:text-[var(--text-1)] transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[var(--green)]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Fullscreen Editor */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Editor'}
            className="p-1 rounded hover:bg-[var(--bg-hover)] hover:text-[var(--text-1)] transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Monaco Editor Canvas */}
      <div className="flex-1 min-h-0 bg-[var(--bg-canvas)]">
        <Editor
          height="100%"
          language={currentLangConfig.monacoLang}
          value={code}
          onChange={(val) => onCodeChange(val || '')}
          beforeMount={handleBeforeMount}
          onMount={handleEditorDidMount}
          theme={theme === 'dark' ? 'algoflow-dark' : 'algoflow-light'}
          options={{
            fontSize: fontSize,
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            padding: { top: 12, bottom: 12 },
            lineHeight: 21,
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            renderLineHighlight: 'all',
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
            },
          }}
        />
      </div>

    </div>
  );
};


