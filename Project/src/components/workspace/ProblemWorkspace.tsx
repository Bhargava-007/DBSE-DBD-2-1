import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useJudge } from '../../context/JudgeContext';
import type { SupportedLanguage } from '../../types/judge';
import { DescriptionPane } from './DescriptionPane';
import { MonacoCodeEditor } from './MonacoCodeEditor';
import { ConsoleRunner } from './ConsoleRunner';
import { BottomActionBar } from './BottomActionBar';
import { DifficultyBadge } from '../common/DifficultyBadge';
import { 
  ArrowLeft,
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Code2, 
  Bookmark, 
  BookmarkCheck,
  Maximize2,
  Minimize2,
  Columns,
  Keyboard,
  X
} from 'lucide-react';

export const ProblemWorkspace: React.FC = () => {
  const { 
    activeProblem, 
    problems, 
    submissions, 
    navigateToProblem, 
    navigateToPage, 
    runCode, 
    submitSolution,
    isRunningCode,
    isSubmitting,
    lastRunResults,
    lastSubmissionResult,
  } = useJudge();

  const [language, setLanguage] = useState<SupportedLanguage>('cpp');
  const [codeMap, setCodeMap] = useState<Record<SupportedLanguage, string>>({
    cpp: activeProblem.starterCode.cpp,
    python: activeProblem.starterCode.python,
    java: activeProblem.starterCode.java,
    javascript: activeProblem.starterCode.javascript,
  });
  const [customInput, setCustomInput] = useState<string>('');
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(true);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);

  // Responsive mobile tab ('desc' | 'editor')
  const [mobileTab, setMobileTab] = useState<'desc' | 'editor'>('desc');

  // Dual-axis Resizable Splitters
  const [horizontalSplit, setHorizontalSplit] = useState<number>(46);
  const [isDraggingH, setIsDraggingH] = useState<boolean>(false);
  
  const [verticalSplit, setVerticalSplit] = useState<number>(62);
  const [isDraggingV, setIsDraggingV] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);

  // Update starter code when active problem changes
  useEffect(() => {
    setCodeMap({
      cpp: activeProblem.starterCode.cpp,
      python: activeProblem.starterCode.python,
      java: activeProblem.starterCode.java,
      javascript: activeProblem.starterCode.javascript,
    });
    setCustomInput('');
  }, [activeProblem.id]);

  const currentCode = codeMap[language];

  const handleCodeChange = (newCode: string) => {
    setCodeMap(prev => ({ ...prev, [language]: newCode }));
  };

  const handleResetCode = () => {
    setCodeMap(prev => ({ ...prev, [language]: activeProblem.starterCode[language] }));
  };

  const handleSelectSubmissionCode = (code: string, subLang: string) => {
    if (['cpp', 'python', 'java', 'javascript'].includes(subLang)) {
      setLanguage(subLang as SupportedLanguage);
      setCodeMap(prev => ({ ...prev, [subLang]: code }));
      setMobileTab('editor');
    }
  };

  // Run Code handler
  const handleRun = useCallback(() => {
    if (isRunningCode || isSubmitting) return;
    setIsConsoleOpen(true);
    setMobileTab('editor');
    runCode(activeProblem, language, currentCode, customInput);
  }, [isRunningCode, isSubmitting, runCode, activeProblem, language, currentCode, customInput]);

  // Submit Solution handler
  const handleSubmit = useCallback(() => {
    if (isRunningCode || isSubmitting) return;
    setIsConsoleOpen(true);
    setMobileTab('editor');
    submitSolution(activeProblem, language, currentCode);
  }, [isRunningCode, isSubmitting, submitSolution, activeProblem, language, currentCode]);

  // Keyboard shortcuts (Cmd/Ctrl+Enter to Run, Cmd/Ctrl+Shift+Enter to Submit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl && e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          handleSubmit();
        } else {
          handleRun();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRun, handleSubmit]);

  // Horizontal Dragging (Left / Right resize)
  useEffect(() => {
    const handleMouseMoveH = (e: MouseEvent) => {
      if (!isDraggingH || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newPercent = ((e.clientX - rect.left) / rect.width) * 100;
      if (newPercent >= 20 && newPercent <= 80) {
        setHorizontalSplit(newPercent);
      }
    };

    const handleMouseUpH = () => {
      if (isDraggingH) setIsDraggingH(false);
    };

    if (isDraggingH) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      window.addEventListener('mousemove', handleMouseMoveH);
      window.addEventListener('mouseup', handleMouseUpH);
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMoveH);
      window.removeEventListener('mouseup', handleMouseUpH);
    };
  }, [isDraggingH]);

  // Vertical Dragging (Editor / Console resize)
  useEffect(() => {
    const handleMouseMoveV = (e: MouseEvent) => {
      if (!isDraggingV || !rightColumnRef.current) return;
      const rect = rightColumnRef.current.getBoundingClientRect();
      const newPercent = ((e.clientY - rect.top) / rect.height) * 100;
      if (newPercent >= 25 && newPercent <= 85) {
        setVerticalSplit(newPercent);
      }
    };

    const handleMouseUpV = () => {
      if (isDraggingV) setIsDraggingV(false);
    };

    if (isDraggingV) {
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
      window.addEventListener('mousemove', handleMouseMoveV);
      window.addEventListener('mouseup', handleMouseUpV);
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMoveV);
      window.removeEventListener('mouseup', handleMouseUpV);
    };
  }, [isDraggingV]);

  const currentIndex = problems.findIndex(p => p.id === activeProblem.id);
  const prevProblem = currentIndex > 0 ? problems[currentIndex - 1] : null;
  const nextProblem = currentIndex < problems.length - 1 ? problems[currentIndex + 1] : null;

  return (
    <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50' : 'h-screen'} bg-[var(--bg-canvas)] text-[var(--text-1)] overflow-hidden select-none font-sans relative`}>
      
      {/* 36px Minimal Workspace Topbar */}
      <div className="h-[36px] border-b border-[var(--border)] bg-[var(--bg-canvas)] px-3 flex items-center justify-between shrink-0 text-[13px] z-20">
        {/* Left Section: Back, Problem Title, Difficulty & Bookmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateToPage('problems')}
            className="text-[var(--text-2)] hover:text-[var(--text-1)] text-[16px] p-1 rounded transition-colors flex items-center"
            title="Back to Problems"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="font-medium text-[var(--text-1)] text-[13px] truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {activeProblem.title}
            </span>
            <DifficultyBadge difficulty={activeProblem.difficulty} />
          </div>

          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-1 rounded transition-colors ${
              isBookmarked ? 'text-[var(--amber)]' : 'text-[var(--text-3)] hover:text-[var(--text-2)]'
            }`}
            title={isBookmarked ? 'Bookmarked' : 'Bookmark Problem'}
          >
            {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Center: Mobile Switcher Tabs */}
        <div className="flex lg:hidden items-center bg-[var(--bg-elevated)] p-0.5 rounded-[var(--r-md)] border border-[var(--border)]">
          <button
            onClick={() => setMobileTab('desc')}
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[12px] font-medium transition-colors ${
              mobileTab === 'desc'
                ? 'bg-[var(--bg-card)] text-[var(--text-1)] shadow-sm'
                : 'text-[var(--text-2)]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Problem</span>
          </button>
          <button
            onClick={() => setMobileTab('editor')}
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[12px] font-medium transition-colors ${
              mobileTab === 'editor'
                ? 'bg-[var(--bg-card)] text-[var(--text-1)] shadow-sm'
                : 'text-[var(--text-2)]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Code</span>
          </button>
        </div>

        {/* Right Section: Prev/Next & Quick Tools */}
        <div className="flex items-center gap-1.5 text-[var(--text-2)] text-[14px]">
          
          {/* Keyboard Shortcuts Trigger */}
          <button
            onClick={() => setShowShortcutsModal(true)}
            className="p-1 rounded hover:text-[var(--text-1)] hover:bg-[var(--bg-hover)] transition-colors"
            title="Keyboard Shortcuts"
          >
            <Keyboard className="w-3.5 h-3.5" />
          </button>

          {/* Reset Panel Splits */}
          <button
            onClick={() => { setHorizontalSplit(48); setVerticalSplit(62); }}
            className="hidden lg:flex p-1 rounded hover:text-[var(--text-1)] hover:bg-[var(--bg-hover)] transition-colors"
            title="Reset split layout"
          >
            <Columns className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="hidden sm:flex p-1 rounded hover:text-[var(--text-1)] hover:bg-[var(--bg-hover)] transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Workspace'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <div className="h-3.5 w-px bg-[var(--border)] mx-1" />

          {/* Previous / Next Stepper */}
          <button
            disabled={!prevProblem}
            onClick={() => prevProblem && navigateToProblem(prevProblem.id)}
            className="p-1 rounded hover:text-[var(--text-1)] hover:bg-[var(--bg-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title={prevProblem ? `Previous: ${prevProblem.title}` : undefined}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={!nextProblem}
            onClick={() => nextProblem && navigateToProblem(nextProblem.id)}
            className="p-1 rounded hover:text-[var(--text-1)] hover:bg-[var(--bg-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title={nextProblem ? `Next: ${nextProblem.title}` : undefined}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Workspace Layout with Dual-Axis Resizing */}
      <div 
        ref={containerRef}
        className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden bg-[var(--bg-canvas)] p-1 gap-1"
      >
        {/* Left Panel: Problem Statement / Submissions / Editorial / Help */}
        <div 
          style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${horizontalSplit}%` : '100%' }}
          className={`h-full min-h-0 overflow-hidden rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] ${
            mobileTab === 'desc' ? 'flex flex-col flex-1 lg:flex-none' : 'hidden lg:flex lg:flex-col'
          }`}
        >
          <DescriptionPane
            problem={activeProblem}
            submissions={submissions}
            onSelectSubmissionCode={handleSelectSubmissionCode}
          />
        </div>

        {/* Resizable Horizontal Divider (Left / Right) */}
        <div
          onMouseDown={(e) => { e.preventDefault(); setIsDraggingH(true); }}
          onDoubleClick={() => setHorizontalSplit(50)}
          title="Drag to resize panels"
          className="hidden lg:flex w-1.5 bg-transparent hover:bg-[var(--accent-dim)] active:bg-[var(--accent-dim)] cursor-col-resize items-center justify-center transition-colors group shrink-0 relative z-20 rounded"
        >
          <div className="flex flex-col gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="w-1 h-1 rounded-full bg-[var(--text-3)]" />
            <span className="w-1 h-1 rounded-full bg-[var(--text-3)]" />
            <span className="w-1 h-1 rounded-full bg-[var(--text-3)]" />
          </div>
        </div>

        {/* Right Panel: Editor (Top) & Testcase/Console (Bottom) */}
        <div 
          ref={rightColumnRef}
          style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${100 - horizontalSplit}%` : '100%' }}
          className={`h-full min-h-0 flex flex-col overflow-hidden gap-1 ${
            mobileTab === 'editor' ? 'flex flex-1 lg:flex-none' : 'hidden lg:flex'
          }`}
        >
          {/* Top Half: Code Editor */}
          <div 
            style={{ height: isConsoleOpen ? `${verticalSplit}%` : '100%' }}
            className="min-h-0 flex flex-col overflow-hidden rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] transition-[height] duration-75"
          >
            <MonacoCodeEditor
              language={language}
              onLanguageChange={setLanguage}
              code={currentCode}
              onCodeChange={handleCodeChange}
              onResetCode={handleResetCode}
            />
          </div>

          {/* Resizable Vertical Divider (Editor / Console) */}
          {isConsoleOpen && (
            <div
              onMouseDown={(e) => { e.preventDefault(); setIsDraggingV(true); }}
              onDoubleClick={() => setVerticalSplit(60)}
              title="Drag to resize console"
              className="h-1.5 bg-transparent hover:bg-[var(--accent-dim)] active:bg-[var(--accent-dim)] cursor-row-resize flex items-center justify-center transition-colors group shrink-0 relative z-20 rounded"
            >
              <div className="flex gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="w-1 h-1 rounded-full bg-[var(--text-3)]" />
                <span className="w-1 h-1 rounded-full bg-[var(--text-3)]" />
                <span className="w-1 h-1 rounded-full bg-[var(--text-3)]" />
              </div>
            </div>
          )}

          {/* Bottom Half: Test Cases / Custom Input / Verdict Console */}
          {isConsoleOpen && (
            <div 
              style={{ height: `${100 - verticalSplit}%` }}
              className="min-h-0 flex flex-col overflow-hidden rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] transition-[height] duration-75"
            >
              <ConsoleRunner
                problem={activeProblem}
                results={lastRunResults}
                isRunning={isRunningCode}
                isSubmitting={isSubmitting}
                lastSubmission={lastSubmissionResult}
                customInput={customInput}
                onCustomInputChange={setCustomInput}
                isOpen={isConsoleOpen}
                onToggleOpen={() => setIsConsoleOpen(!isConsoleOpen)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <BottomActionBar
        isConsoleOpen={isConsoleOpen}
        onToggleConsole={() => setIsConsoleOpen(!isConsoleOpen)}
        isRunning={isRunningCode}
        isSubmitting={isSubmitting}
        onRun={handleRun}
        onSubmit={handleSubmit}
        lastResults={lastRunResults}
        lastSubmission={lastSubmissionResult}
      />

      {/* Shortcuts Modal Dialog */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-[var(--r-xl)] bg-[var(--bg-elevated)] border border-[var(--border-mid)] p-5 shadow-[var(--shadow-lg)] space-y-4 page-fade">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-[var(--accent)]" />
                <h3 className="font-semibold text-[var(--text-1)] text-[14px]">Keyboard Shortcuts</h3>
              </div>
              <button 
                onClick={() => setShowShortcutsModal(false)}
                className="p-1 rounded text-[var(--text-3)] hover:text-[var(--text-1)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-[12px]">
              <div className="flex items-center justify-between py-1.5 border-b border-[var(--border)]">
                <span className="text-[var(--text-2)]">Run Code</span>
                <kbd className="px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border)] font-mono text-[var(--text-1)]">Ctrl / ⌘ + Enter</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[var(--border)]">
                <span className="text-[var(--text-2)]">Submit Solution</span>
                <kbd className="px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border)] font-mono text-[var(--text-1)]">Ctrl / ⌘ + Shift + Enter</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-[var(--text-2)]">Search / Command Palette</span>
                <kbd className="px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border)] font-mono text-[var(--text-1)]">Ctrl / ⌘ + K</kbd>
              </div>
            </div>

            <button
              onClick={() => setShowShortcutsModal(false)}
              className="btn-secondary w-full justify-center !py-1.5 !text-[12px]"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};


