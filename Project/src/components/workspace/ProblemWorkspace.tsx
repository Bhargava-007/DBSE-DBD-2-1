import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useJudge } from '../../context/JudgeContext';
import type { SupportedLanguage } from '../../types/judge';
import { DescriptionPane } from './DescriptionPane';
import { MonacoCodeEditor } from './MonacoCodeEditor';
import { ConsoleRunner } from './ConsoleRunner';
import { BottomActionBar } from './BottomActionBar';
import { ChevronLeft, ChevronRight, FileText, Code2 } from 'lucide-react';

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
    lastSubmissionResult
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

  // Responsive mobile tab ('desc' | 'editor')
  const [mobileTab, setMobileTab] = useState<'desc' | 'editor'>('desc');

  // Draggable splitter percentage (desktop only, bounded between 25% and 75%)
  const [splitPercent, setSplitPercent] = useState<number>(46);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Global workspace keyboard shortcuts (Cmd+Enter to Run, Cmd+Shift+Enter to Submit)
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

  // Splitter drag event handling
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newPercent = ((e.clientX - rect.left) / rect.width) * 100;
      // Clamp between 25% and 75%
      if (newPercent >= 25 && newPercent <= 75) {
        setSplitPercent(newPercent);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const currentIndex = problems.findIndex(p => p.id === activeProblem.id);
  const prevProblem = currentIndex > 0 ? problems[currentIndex - 1] : null;
  const nextProblem = currentIndex < problems.length - 1 ? problems[currentIndex + 1] : null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-zinc-950 overflow-hidden select-none">
      
      {/* Top Workspace Bar: Navigation & Quick Problem Switch */}
      <div className="h-10 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 flex items-center justify-between shrink-0 text-xs shadow-2xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigateToPage('problems')}
            className="text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 flex items-center gap-1 font-medium transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Problems</span>
          </button>
          <span className="text-slate-300 dark:text-zinc-700">/</span>
          <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-zinc-100 truncate max-w-xs sm:max-w-md">
            <span className="font-mono text-slate-400 dark:text-zinc-500 font-normal tabular-nums">#{activeProblem.id.replace('prob-', '')}.</span>
            <span className="truncate">{activeProblem.title}</span>
          </div>
        </div>

        {/* Center: Mobile View Switcher (Visible only < 1024px) */}
        <div className="flex lg:hidden items-center bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-md border border-slate-200 dark:border-zinc-700">
          <button
            onClick={() => setMobileTab('desc')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              mobileTab === 'desc'
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-zinc-400'
            }`}
          >
            <FileText className="w-3 h-3" />
            <span>Problem</span>
          </button>
          <button
            onClick={() => setMobileTab('editor')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              mobileTab === 'editor'
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-zinc-400'
            }`}
          >
            <Code2 className="w-3 h-3" />
            <span>Code</span>
          </button>
        </div>

        {/* Previous / Next Problem buttons */}
        <div className="flex items-center gap-1">
          <button
            disabled={!prevProblem}
            onClick={() => prevProblem && navigateToProblem(prevProblem.id)}
            className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title={prevProblem ? `Previous Problem: ${prevProblem.title}` : undefined}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={!nextProblem}
            onClick={() => nextProblem && navigateToProblem(nextProblem.id)}
            className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title={nextProblem ? `Next Problem: ${nextProblem.title}` : undefined}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div 
        ref={containerRef}
        className={`flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden p-2 gap-2 ${
          isDragging ? 'cursor-col-resize select-none pointer-events-none' : ''
        }`}
      >
        
        {/* Left Pane: Description & Editorial */}
        <div 
          style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${splitPercent}%` : '100%' }}
          className={`h-full min-h-0 overflow-hidden ${
            mobileTab === 'desc' ? 'flex flex-col flex-1 lg:flex-none' : 'hidden lg:flex lg:flex-col'
          }`}
        >
          <DescriptionPane
            problem={activeProblem}
            submissions={submissions}
            onSelectSubmissionCode={handleSelectSubmissionCode}
          />
        </div>

        {/* Interactive Desktop Splitter Handle */}
        <div
          onMouseDown={handleMouseDown}
          onDoubleClick={() => setSplitPercent(50)}
          title="Drag to resize panels (Double click to center 50%)"
          className="hidden lg:flex w-1.5 hover:w-2 hover:bg-slate-300 dark:hover:bg-zinc-700 bg-transparent cursor-col-resize items-center justify-center transition-all duration-100 group shrink-0 relative z-20"
        >
          <div className="w-0.5 h-8 rounded-full bg-slate-300 dark:bg-zinc-700 group-hover:bg-slate-500 dark:group-hover:bg-zinc-400 transition-colors" />
        </div>

        {/* Right Pane: Code Editor & Console */}
        <div 
          style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${100 - splitPercent}%` : '100%' }}
          className={`h-full min-h-0 flex flex-col gap-2 overflow-hidden ${
            mobileTab === 'editor' ? 'flex flex-1 lg:flex-none' : 'hidden lg:flex'
          }`}
        >
          <div className="flex-1 min-h-0 overflow-hidden">
            <MonacoCodeEditor
              language={language}
              onLanguageChange={setLanguage}
              code={currentCode}
              onCodeChange={handleCodeChange}
              onResetCode={handleResetCode}
            />
          </div>

          {/* Inline Console Runner */}
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

    </div>
  );
};

