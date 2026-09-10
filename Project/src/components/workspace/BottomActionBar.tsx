import React from 'react';
import { Play, Send, ChevronUp, ChevronDown, CheckCircle2, XCircle, Loader2, Terminal, Cpu, Clock } from 'lucide-react';
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
    <div className="h-11 border-t border-[var(--border)] bg-[var(--bg-canvas)] px-4 flex items-center justify-between gap-4 shrink-0 select-none">
      
      {/* Left: Console toggle & Quick telemetry results */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleConsole}
          className={`flex items-center gap-2 px-3 py-1 rounded-[var(--r-md)] text-[12px] font-medium transition-colors border ${
            isConsoleOpen
              ? 'bg-[var(--bg-hover)] text-[var(--text-1)] border-[var(--border-strong)]'
              : 'bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-2)] border-[var(--border)]'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-[var(--text-3)]" />
          <span>Console</span>
          {isConsoleOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-3)] ml-0.5" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 text-[var(--text-3)] ml-0.5" />
          )}
        </button>

        {/* Quick run summary pill */}
        {lastResults && !isRunning && !isSubmitting && (
          <div className="hidden sm:flex items-center gap-1.5 text-[12px]">
            {allPassed ? (
              <span className="badge badge-easy gap-1.5 py-1 px-2.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>All sample tests passed</span>
              </span>
            ) : (
              <span className="badge badge-hard gap-1.5 py-1 px-2.5">
                <XCircle className="w-3.5 h-3.5" />
                <span>Sample tests failed</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Center: Live Status Indicator & Runtime State */}
      <div className="hidden md:flex items-center gap-2 text-[12px] text-[var(--text-3)]">
        {isSubmitting ? (
          <span className="flex items-center gap-2 text-[var(--accent)]">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="font-medium">Evaluating across hidden test cases...</span>
          </span>
        ) : isRunning ? (
          <span className="flex items-center gap-2 text-[var(--text-2)]">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="font-medium">Executing code on sandbox runtime...</span>
          </span>
        ) : lastSubmission ? (
          <div className="flex items-center gap-3">
            <span className="text-[var(--text-3)]">Verdict:</span>
            <span className={`badge ${
              lastSubmission.verdict === 'Accepted'
                ? 'badge-easy'
                : 'badge-hard'
            }`}>
              {lastSubmission.verdict === 'Accepted' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
              <span>{lastSubmission.verdict}</span>
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-[var(--text-3)]">
              <Clock className="w-3 h-3" /> {lastSubmission.executionTimeMs}ms
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-[var(--text-3)]">
              <Cpu className="w-3 h-3" /> {(lastSubmission.memoryKb / 1024).toFixed(1)}MB
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[var(--text-3)] text-[12px]">
            <span className="w-2 h-2 rounded-full bg-[var(--green)] inline-block" />
            <span>Sandbox Ready</span>
          </div>
        )}
      </div>

      {/* Right: Modern Run and Submit Action Buttons */}
      <div className="flex items-center gap-2">
        
        {/* Run Button (Secondary Elevated Button) */}
        <button
          onClick={onRun}
          disabled={isRunning || isSubmitting}
          title={`Run Code (${cmdKey} + Enter)`}
          className="btn-secondary !py-1.5 !px-3.5 !text-[12px] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isRunning ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--text-3)]" />
          ) : (
            <Play className="w-3.5 h-3.5 text-[var(--text-2)] fill-[var(--text-2)]" />
          )}
          <span>Run</span>
          <kbd className="hidden lg:inline text-[10px] font-mono text-[var(--text-3)] ml-1">
            {cmdKey}+↵
          </kbd>
        </button>

        {/* Submit Button (Linear Primary Style) */}
        <button
          onClick={onSubmit}
          disabled={isRunning || isSubmitting}
          title={`Submit Solution (Shift + ${cmdKey} + Enter)`}
          className="btn-primary !py-1.5 !px-4 !text-[12px] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>Submit</span>
        </button>
      </div>
    </div>
  );
};

