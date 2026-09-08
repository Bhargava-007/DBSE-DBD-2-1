import React from 'react';
import { Play, Send, ChevronUp, ChevronDown, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import type { Submission, TestCaseResult } from '../../types/judge';

interface Props {
  isConsoleOpen: boolean;
  onToggleConsole: () => void;
  isRunning: boolean;
  isSubmitting: boolean;
  onRun: () => void;
  onSubmit: () => void;
  lastResults: TestCaseResult[] | null;
  lastSubmission: Submission | null;
}

export const BottomActionBar: React.FC<Props> = ({
  isConsoleOpen,
  onToggleConsole,
  isRunning,
  isSubmitting,
  onRun,
  onSubmit,
  lastResults,
  lastSubmission,
}) => {
  const allPassed = lastResults?.every(r => r.passed);
  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const cmdKey = isMac ? '⌘' : 'Ctrl';

  return (
    <div className="h-12 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 flex items-center justify-between gap-4 shrink-0 shadow-xs select-none">
      
      {/* Left: Console toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleConsole}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-200 transition-colors"
        >
          <span>Console</span>
          {isConsoleOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {/* Quick result pill */}
        {lastResults && !isRunning && !isSubmitting && (
          <div className="hidden sm:flex items-center gap-1 text-[11px] font-medium font-mono">
            {allPassed ? (
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Sample tests passed
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-700 dark:text-rose-400">
                <XCircle className="w-3.5 h-3.5" /> Sample tests failed
              </span>
            )}
          </div>
        )}
      </div>

      {/* Center: Status telemetry */}
      <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-zinc-400">
        {isSubmitting ? (
          <span className="flex items-center gap-1.5 text-slate-900 dark:text-zinc-100 font-sans">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400" />
            <span>Judging against full test suite...</span>
          </span>
        ) : isRunning ? (
          <span className="flex items-center gap-1.5 text-slate-700 dark:text-zinc-300 font-sans">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400" />
            <span>Evaluating sample inputs...</span>
          </span>
        ) : lastSubmission ? (
          <span className="flex items-center gap-1.5">
            <span>Verdict:</span>
            <strong className={`font-semibold ${lastSubmission.verdict === 'Accepted' ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
              {lastSubmission.verdict} ({lastSubmission.executionTimeMs}ms)
            </strong>
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-slate-400 dark:text-zinc-500 font-sans text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Sandbox Ready</span>
          </span>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Run Code (Secondary) */}
        <button
          onClick={onRun}
          disabled={isRunning || isSubmitting}
          title={`Run Code (${cmdKey} + Enter)`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700/80 text-xs font-medium text-slate-700 dark:text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
        >
          {isRunning ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
          ) : (
            <Play className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
          )}
          <span>Run</span>
          <kbd className="hidden lg:inline-flex items-center font-mono text-[10px] px-1 py-0.2 rounded bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-400 dark:text-zinc-400 ml-0.5">
            {cmdKey}↵
          </kbd>
        </button>

        {/* Submit Solution (Primary) */}
        <button
          onClick={onSubmit}
          disabled={isRunning || isSubmitting}
          title={`Submit Solution (Shift + ${cmdKey} + Enter)`}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-xs font-semibold text-white dark:text-slate-900 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>Submit</span>
          <kbd className="hidden lg:inline-flex items-center font-mono text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-300 dark:bg-zinc-200 dark:text-zinc-700 ml-0.5">
            ⇧{cmdKey}↵
          </kbd>
        </button>
      </div>
    </div>
  );
};

