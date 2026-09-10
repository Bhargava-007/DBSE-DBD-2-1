import React, { useState, useEffect } from 'react';
import type { Problem, TestCaseResult, TestCase, Submission } from '../../types/judge';
import { VerdictBadge } from '../common/VerdictBadge';
import { 
  Clock, 
  Cpu, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ShieldAlert,
  ChevronDown
} from 'lucide-react';

interface Props {
  problem: Problem;
  results: TestCaseResult[] | null;
  isRunning: boolean;
  isSubmitting?: boolean;
  lastSubmission?: Submission | null;
  customInput: string;
  onCustomInputChange: (input: string) => void;
  isOpen: boolean;
  onToggleOpen?: () => void;
}

export const ConsoleRunner: React.FC<Props> = ({
  problem,
  results,
  isRunning,
  isSubmitting = false,
  lastSubmission = null,
  customInput,
  onCustomInputChange,
  isOpen,
  onToggleOpen,
}) => {
  // activeTab: -2 = Verdict, -1 = Custom Input, 0..N = Sample Test Case index
  const [activeTab, setActiveTab] = useState<number>(0);

  // Auto-switch to verdict tab when submission or run starts/finishes
  useEffect(() => {
    if (isSubmitting || lastSubmission) {
      setActiveTab(-2);
    }
  }, [isSubmitting, lastSubmission]);

  useEffect(() => {
    if (results && !isSubmitting) {
      if (activeTab === -2) {
        setActiveTab(0);
      }
    }
  }, [results]);

  if (!isOpen) return null;

  const isVerdictTab = activeTab === -2;
  const isCustomInputTab = activeTab === -1;
  const currentTestCase: TestCase | undefined = (!isVerdictTab && !isCustomInputTab) 
    ? problem.sampleTestCases[activeTab] 
    : undefined;

  const sampleResults = results?.filter(r => r.testCaseId !== 'custom-input') || [];
  const customResult = results?.find(r => r.testCaseId === 'custom-input');

  const currentResult: TestCaseResult | undefined = (!isVerdictTab && !isCustomInputTab)
    ? (results?.find(r => currentTestCase && r.testCaseId === currentTestCase.id) || sampleResults[activeTab])
    : isCustomInputTab 
      ? customResult
      : undefined;

  return (
    <div className="h-full flex flex-col bg-[var(--bg-card)] text-[var(--text-1)] overflow-hidden font-sans border-t border-[var(--border)] transition-colors">
      
      {/* Console Header Tabs */}
      <div className="h-9 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-card)] px-3 shrink-0 select-none">
        
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          
          {/* Submission Verdict Tab */}
          {(lastSubmission || isSubmitting) && (
            <button
              onClick={() => setActiveTab(-2)}
              className={`h-7 flex items-center gap-1.5 px-2.5 rounded-[var(--r-md)] text-[12px] font-medium cursor-pointer transition-colors ${
                isVerdictTab
                  ? 'bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--accent-border)] font-semibold shadow-xs'
                  : 'text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent)]" />
              ) : lastSubmission?.verdict === 'Accepted' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--green)]" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-[var(--red)]" />
              )}
              <span>Verdict</span>
              {lastSubmission && !isSubmitting && (
                <span className={`text-[10px] font-mono px-1 rounded ${
                  lastSubmission.verdict === 'Accepted' 
                    ? 'text-[var(--green)] bg-[var(--green-dim)]' 
                    : 'text-[var(--red)] bg-[var(--red-dim)]'
                }`}>
                  {lastSubmission.verdict === 'Accepted' ? 'AC' : 'WA'}
                </span>
              )}
            </button>
          )}

          {/* Test cases tab pills */}
          {problem.sampleTestCases.map((tc, idx) => {
            const res = results?.find(r => r.testCaseId === tc.id) || sampleResults[idx];
            const isSelected = activeTab === idx;
            return (
              <button
                key={tc.id}
                onClick={() => setActiveTab(idx)}
                className={`h-7 flex items-center gap-1.5 px-2.5 rounded-[var(--r-md)] text-[12px] font-mono cursor-pointer transition-colors shrink-0 ${
                  isSelected
                    ? 'bg-[var(--bg-elevated)] text-[var(--text-1)] font-semibold border border-[var(--border)] shadow-xs'
                    : 'text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                <span>Case {idx + 1}</span>
                {res && (
                  res.passed ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)]" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--red)]" />
                  )
                )}
              </button>
            );
          })}

          {/* Test against Custom Input */}
          <button
            onClick={() => setActiveTab(-1)}
            className={`h-7 flex items-center gap-1.5 px-2.5 rounded-[var(--r-md)] text-[12px] font-medium cursor-pointer transition-colors shrink-0 ${
              isCustomInputTab
                ? 'bg-[var(--bg-elevated)] text-[var(--text-1)] font-semibold border border-[var(--border)] shadow-xs'
                : 'text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <span>+ Custom Input</span>
            {customResult ? (
              <span className={`w-1.5 h-1.5 rounded-full ${customResult.passed ? 'bg-[var(--green)]' : 'bg-[var(--red)]'}`} />
            ) : customInput.trim().length > 0 ? (
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            ) : null}
          </button>
        </div>

        {/* Collapse toggle */}
        {onToggleOpen && (
          <button
            onClick={onToggleOpen}
            className="p-1 rounded text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors"
            title="Toggle Console"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Console Drawer Body */}
      <div className="flex-1 overflow-y-auto p-4 text-[12px] font-mono space-y-4 bg-[var(--bg-canvas)]">
        
        {/* State A: Running / Submitting In-Flight Loader */}
        {(isRunning || isSubmitting) && (
          <div className="flex flex-col items-center justify-center py-8 space-y-3 font-sans">
            <Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" />
            <div className="text-center">
              <div className="text-[var(--text-1)] font-medium text-[13px]">
                {isSubmitting ? 'Evaluating submission...' : 'Running solution on test cases...'}
              </div>
              <div className="text-[var(--text-3)] text-[12px] mt-0.5">
                Executing inside isolated worker runtime
              </div>
            </div>
          </div>
        )}

        {/* State B: Verdict View */}
        {!isRunning && !isSubmitting && isVerdictTab && lastSubmission && (
          <div className="space-y-4 font-sans">
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-[var(--r-md)] bg-[var(--bg-card)] border border-[var(--border)]">
              <div className="flex items-center gap-3">
                <VerdictBadge verdict={lastSubmission.verdict} />
                <div>
                  <div className="text-[var(--text-1)] font-semibold text-[14px]">
                    {lastSubmission.testCasesPassed ?? (lastSubmission.verdict === 'Accepted' ? 3 : 0)} / {lastSubmission.totalTestCases ?? 3} Testcases Passed
                  </div>
                  <div className="text-[var(--text-3)] text-[11px] font-mono mt-0.5">
                    Evaluated at {new Date(lastSubmission.submittedAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[12px] font-mono text-[var(--text-2)]">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[var(--text-3)]" />
                  <span>{lastSubmission.executionTimeMs} ms</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[var(--text-3)]" />
                  <span>{(lastSubmission.memoryKb / 1024).toFixed(1)} MB</span>
                </div>
                <div className="text-[var(--text-1)] font-mono text-[11px]">
                  {lastSubmission.language}
                </div>
              </div>
            </div>

            {/* Error Diagnostics if compilation or runtime failed */}
            {lastSubmission.errorMessage && (
              <div className="p-3.5 rounded-[var(--r-md)] bg-[var(--red-dim)] border border-[var(--red)]/20 space-y-1.5 font-mono">
                <div className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--red)]">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Execution Diagnostics:</span>
                </div>
                <pre className="text-[12px] text-[var(--red)] whitespace-pre-wrap leading-relaxed">
                  {lastSubmission.errorMessage}
                </pre>
              </div>
            )}

            {/* Telemetry Output */}
            {lastSubmission.stdout && (
              <div className="space-y-1 font-mono">
                <span className="text-[var(--text-3)] text-[11px]">Runner Telemetry:</span>
                <pre className="p-3 rounded-[var(--r-sm)] bg-[var(--bg-card)] text-[12px] text-[var(--text-1)] border border-[var(--border)] whitespace-pre-wrap">
                  {lastSubmission.stdout}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* State C: Custom Input Editor */}
        {!isRunning && !isSubmitting && isCustomInputTab && (
          <div className="space-y-3 font-sans">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-[var(--text-1)]">Standard Input (stdin):</span>
              {customInput && (
                <button
                  onClick={() => onCustomInputChange('')}
                  className="flex items-center gap-1 text-[11px] text-[var(--text-3)] hover:text-[var(--red)] transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear Input</span>
                </button>
              )}
            </div>

            <textarea
              value={customInput}
              onChange={(e) => onCustomInputChange(e.target.value)}
              placeholder="Paste custom standard input (stdin) for your program, e.g. 2 1 3 1 2 or nums = [2, 7, 11, 15], target = 9..."
              className="w-full h-24 p-3 rounded-[var(--r-md)] bg-[var(--bg-card)] text-[var(--text-1)] font-mono text-[12px] border border-[var(--border)] focus:border-[var(--accent)] focus:outline-none transition-colors resize-none"
            />

            {currentResult ? (
              <div className="space-y-3 font-mono pt-1">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[var(--text-2)] font-sans font-medium">Standard Output:</span>
                    <div className="flex items-center gap-3 text-[11px] text-[var(--text-3)]">
                      <span>CPU: <strong className="text-[var(--text-1)]">{currentResult.executionTimeMs}ms</strong></span>
                      <span>·</span>
                      <span>Memory: <strong className="text-[var(--text-1)]">{(currentResult.memoryKb ? currentResult.memoryKb / 1024 : 0).toFixed(1)}MB</strong></span>
                    </div>
                  </div>
                  <pre className="p-3 rounded-[var(--r-sm)] bg-[var(--bg-card)] text-[13px] text-[var(--green)] border border-[var(--border)] whitespace-pre-wrap font-semibold">
                    {currentResult.actualOutput || '(No standard output generated)'}
                  </pre>
                </div>

                {currentResult.stdout && (
                  <div className="space-y-1">
                    <span className="text-[var(--text-3)] text-[11px]">Program Telemetry / Debug:</span>
                    <pre className="p-2.5 rounded-[var(--r-sm)] bg-[var(--bg-card)] text-[11px] text-[var(--text-2)] border border-[var(--border)] whitespace-pre-wrap">
                      {currentResult.stdout}
                    </pre>
                  </div>
                )}

                {currentResult.error && (
                  <div className="p-2.5 rounded-[var(--r-sm)] bg-[var(--red-dim)] border border-[var(--red)]/20 space-y-1">
                    <span className="text-[11px] font-semibold text-[var(--red)]">Execution Error:</span>
                    <pre className="text-[12px] text-[var(--red)] whitespace-pre-wrap">
                      {currentResult.error}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-[var(--r-sm)] bg-[var(--bg-card)] border border-[var(--border)] text-[11px] text-[var(--text-3)] font-sans text-center">
                Click <strong className="text-[var(--text-1)]">Run</strong> (Ctrl+Enter) to evaluate your code on this custom input.
              </div>
            )}
          </div>
        )}

        {/* State D: Sample Test Cases View */}
        {!isRunning && !isSubmitting && !isVerdictTab && !isCustomInputTab && currentTestCase && (
          <div className="space-y-3 font-mono">
            
            {/* Input Box */}
            <div className="space-y-1">
              <div className="text-[var(--text-3)] font-sans text-[11px]">Input:</div>
              <pre className="p-2.5 rounded-[var(--r-sm)] bg-[var(--bg-card)] text-[var(--text-1)] border border-[var(--border)] whitespace-pre-wrap">
                {currentTestCase.input}
              </pre>
            </div>

            {/* Expected vs Actual Output */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="text-[var(--text-3)] font-sans text-[11px]">Expected Output:</div>
                <pre className="p-2.5 rounded-[var(--r-sm)] bg-[var(--bg-card)] text-[var(--green)] border border-[var(--border)] whitespace-pre-wrap">
                  {currentTestCase.expectedOutput}
                </pre>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-sans text-[var(--text-3)]">
                  <span>Actual Output:</span>
                  {currentResult && (
                    <span className={`text-[10px] font-medium px-1.5 rounded ${
                      currentResult.passed 
                        ? 'text-[var(--green)] bg-[var(--green-dim)]' 
                        : 'text-[var(--red)] bg-[var(--red-dim)]'
                    }`}>
                      {currentResult.passed ? 'PASSED' : 'WRONG ANSWER'}
                    </span>
                  )}
                </div>
                <pre className={`p-2.5 rounded-[var(--r-sm)] bg-[var(--bg-card)] text-[12px] border whitespace-pre-wrap ${
                  currentResult?.passed 
                    ? 'text-[var(--green)] border-[var(--green)]/30' 
                    : currentResult 
                    ? 'text-[var(--red)] border-[var(--red)]/30' 
                    : 'text-[var(--text-3)] border-[var(--border)]'
                }`}>
                  {currentResult ? (currentResult.actualOutput || '(Empty output)') : 'Run code to see output.'}
                </pre>
              </div>
            </div>

            {/* Execution Telemetry if evaluated */}
            {currentResult && (
              <div className="flex items-center gap-4 text-[11px] font-mono text-[var(--text-3)] pt-1">
                <span>CPU: <strong className="text-[var(--text-1)]">{currentResult.executionTimeMs}ms</strong></span>
                <span>·</span>
                <span>Memory: <strong className="text-[var(--text-1)]">{(currentResult.memoryKb ? currentResult.memoryKb / 1024 : 0).toFixed(1)}MB</strong></span>
              </div>
            )}

            {currentResult?.stdout && (
              <div className="space-y-1 font-mono pt-1">
                <span className="text-[var(--text-3)] text-[11px]">Runner Telemetry:</span>
                <pre className="p-2.5 rounded-[var(--r-sm)] bg-[var(--bg-card)] text-[11px] text-[var(--text-2)] border border-[var(--border)] whitespace-pre-wrap">
                  {currentResult.stdout}
                </pre>
              </div>
            )}

            {currentResult?.error && (
              <pre className="p-2.5 rounded-[var(--r-sm)] bg-[var(--red-dim)] text-[12px] text-[var(--red)] border border-[var(--red)]/20 whitespace-pre-wrap">
                {currentResult.error}
              </pre>
            )}
          </div>
        )}

      </div>
    </div>
  );
};


