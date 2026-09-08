import React, { useState, useEffect } from 'react';
import type { Problem, TestCaseResult, TestCase, Submission } from '../../types/judge';
import { VerdictBadge } from '../common/VerdictBadge';
import { 
  Terminal, 
  Clock, 
  Cpu, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ShieldAlert,
  ChevronUp,
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
}) => {
  // activeTab: -2 = Verdict, -1 = Custom Input, 0..N = Sample Test Case index
  const [activeTab, setActiveTab] = useState<number>(0);
  const [activeSubTab, setActiveSubTab] = useState<'output' | 'stdout'>('output');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Auto-switch to verdict tab when submission starts or finishes
  useEffect(() => {
    if (isSubmitting || lastSubmission) {
      setActiveTab(-2);
    }
  }, [isSubmitting, lastSubmission]);

  // Auto-switch to testcase 0 when runCode completes
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
  const currentResult: TestCaseResult | undefined = (!isVerdictTab && !isCustomInputTab)
    ? results?.[activeTab]
    : isCustomInputTab 
      ? results?.find(r => r.testCaseId === 'custom-input')
      : undefined;

  return (
    <div className={`bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden flex flex-col shrink-0 transition-all duration-150 ${
      isExpanded ? 'h-96' : 'h-64'
    }`}>
      
      {/* Console Tabs Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 bg-slate-50/90 dark:bg-zinc-950/80 px-3 py-1.5 shrink-0 select-none">
        
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          
          {/* Submission Verdict Tab (shows when a submission exists or is evaluating) */}
          {(lastSubmission || isSubmitting) && (
            <button
              onClick={() => setActiveTab(-2)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors shrink-0 ${
                isVerdictTab
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-50 shadow-xs font-semibold border border-slate-200 dark:border-zinc-700'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400" />
              ) : lastSubmission?.verdict === 'Accepted' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              )}
              <span>Verdict</span>
              {lastSubmission && !isSubmitting && (
                <span className={`text-[10px] font-mono font-bold px-1 rounded ${
                  lastSubmission.verdict === 'Accepted' 
                    ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60' 
                    : 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60'
                }`}>
                  {lastSubmission.verdict === 'Accepted' ? 'AC' : 'WA'}
                </span>
              )}
            </button>
          )}

          {/* Divider */}
          {(lastSubmission || isSubmitting) && (
            <span className="text-slate-300 dark:text-zinc-700">|</span>
          )}

          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-zinc-400 mr-1 shrink-0">
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Cases:</span>
          </div>

          {/* Sample test cases buttons */}
          {problem.sampleTestCases.map((tc, idx) => {
            const res = results?.[idx];
            const isSelected = activeTab === idx;
            return (
              <button
                key={tc.id}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-colors shrink-0 ${
                  isSelected
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-50 shadow-xs font-semibold border border-slate-200 dark:border-zinc-700'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                <span>Case {idx + 1}</span>
                {res && (
                  res.passed ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  )
                )}
              </button>
            );
          })}

          {/* Custom Input Tab */}
          <button
            onClick={() => setActiveTab(-1)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono transition-colors shrink-0 ${
              isCustomInputTab
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-50 shadow-xs font-semibold border border-slate-200 dark:border-zinc-700'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <span>+ Custom</span>
            {results?.some(r => r.testCaseId === 'custom-input') && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            )}
          </button>
        </div>

        {/* Right side tools */}
        <div className="flex items-center gap-1.5">
          {/* Subtab toggle (Output vs Stdout) for test cases */}
          {!isVerdictTab && results && (
            <div className="flex items-center bg-slate-200/70 dark:bg-zinc-800 p-0.5 rounded-md text-[11px]">
              <button
                onClick={() => setActiveSubTab('output')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  activeSubTab === 'output' 
                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 font-medium shadow-xs' 
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                }`}
              >
                Output
              </button>
              <button
                onClick={() => setActiveSubTab('stdout')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  activeSubTab === 'stdout' 
                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 font-medium shadow-xs' 
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                }`}
              >
                Stdout
              </button>
            </div>
          )}

          {/* Expand / Collapse Height Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse Height' : 'Expand Height'}
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Console Body */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs bg-white dark:bg-zinc-900">
        
        {/* State: Code Running / Evaluating */}
        {isRunning && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-zinc-400 space-y-2 py-8">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
            <span className="font-sans text-xs">Evaluating test cases in sandboxed container...</span>
          </div>
        )}

        {/* State: Submitting solution */}
        {isSubmitting && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-zinc-400 space-y-3 py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
            <div className="text-center font-sans">
              <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100">Judging Submission</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Running against complete hidden test suite in isolated runner...</p>
            </div>
          </div>
        )}

        {/* Tab Content: Submission Verdict */}
        {!isRunning && !isSubmitting && isVerdictTab && lastSubmission && (
          <div className="space-y-4 font-sans">
            {/* Verdict Header banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <VerdictBadge verdict={lastSubmission.verdict} size="md" />
                <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 font-mono">
                  {lastSubmission.testCasesPassed} / {lastSubmission.totalTestCases} Testcases Passed
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-slate-600 dark:text-zinc-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <strong className="text-slate-900 dark:text-zinc-100">{lastSubmission.executionTimeMs} ms</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-slate-400" />
                  <strong className="text-slate-900 dark:text-zinc-100">{(lastSubmission.memoryKb / 1024).toFixed(1)} MB</strong>
                </span>
                <span>•</span>
                <span className="uppercase text-[11px] font-semibold text-slate-500">
                  {lastSubmission.language}
                </span>
              </div>
            </div>

            {/* Error Message if failed */}
            {lastSubmission.errorMessage && (
              <div className="p-3 rounded-md bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 font-mono text-xs text-rose-800 dark:text-rose-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5 font-sans text-xs">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  <span>Execution Diagnostics:</span>
                </div>
                <p className="text-[11px] whitespace-pre-wrap">{lastSubmission.errorMessage}</p>
              </div>
            )}

            {/* Stdout Output */}
            {lastSubmission.stdout && (
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 font-mono">Runner Telemetry:</span>
                <pre className="p-2.5 rounded-md bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-[11px] text-slate-700 dark:text-zinc-300 font-mono whitespace-pre-wrap">
                  {lastSubmission.stdout}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Custom Input */}
        {!isRunning && !isSubmitting && isCustomInputTab && (
          <div className="space-y-3 h-full flex flex-col font-sans">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
              <span>Custom Input (passed directly via stdin to user program):</span>
              <button 
                onClick={() => onCustomInputChange('')} 
                className="text-slate-400 hover:text-rose-600 flex items-center gap-1 text-[11px] transition-colors"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            </div>
            <textarea
              value={customInput}
              onChange={(e) => onCustomInputChange(e.target.value)}
              placeholder="e.g. nums = [2, 7, 11, 15], target = 9"
              className="flex-1 min-h-[70px] w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:border-slate-400 dark:focus:border-zinc-600 rounded-md p-2.5 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none resize-none font-mono"
            />
            {currentResult && (
              <div className="p-2.5 rounded-md bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 font-mono text-xs space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">Execution Output:</span>
                <p className="text-emerald-700 dark:text-emerald-400 font-medium">{currentResult.actualOutput}</p>
                <div className="text-[10px] text-slate-400">Time: {currentResult.executionTimeMs}ms • Memory: {((currentResult.memoryKb || 0) / 1024).toFixed(1)} MB</div>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Sample Test Case Output */}
        {!isRunning && !isSubmitting && !isVerdictTab && !isCustomInputTab && (
          <div className="space-y-3 font-mono">
            {/* Input display */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 font-sans">Input</span>
              <div className="p-2 rounded-md bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-xs">
                {currentTestCase?.input}
              </div>
            </div>

            {/* Test Results comparison */}
            {activeSubTab === 'output' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 font-sans">Expected Output</span>
                  <div className="p-2 rounded-md bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                    {currentTestCase?.expectedOutput}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between font-sans">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">Actual Output</span>
                    {currentResult && (
                      <span className={`text-[11px] font-bold ${currentResult.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {currentResult.passed ? '✓ Passed' : '✗ Failed'}
                      </span>
                    )}
                  </div>
                  <div className={`p-2 rounded-md border text-xs font-mono ${
                    currentResult 
                      ? currentResult.passed 
                        ? 'bg-emerald-50/60 text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/40 dark:text-emerald-300' 
                        : 'bg-rose-50/60 text-rose-800 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800/40 dark:text-rose-300'
                      : 'bg-slate-50 text-slate-400 border-slate-200 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-500'
                  }`}>
                    {currentResult ? currentResult.actualOutput || currentResult.error : '(Click "Run" to test)'}
                  </div>
                </div>
              </div>
            ) : (
              /* Stdout tab */
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 font-sans">Standard Output</span>
                <pre className="p-2.5 rounded-md bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 whitespace-pre-wrap">
                  {currentResult?.stdout || 'No standard output produced.'}
                </pre>
              </div>
            )}

            {/* Execution telemetry */}
            {currentResult && (
              <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-zinc-400 border-t border-slate-100 dark:border-zinc-800 pt-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" /> 
                  Runtime: <strong className="text-slate-900 dark:text-zinc-100">{currentResult.executionTimeMs} ms</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-slate-400" /> 
                  Memory: <strong className="text-slate-900 dark:text-zinc-100">{((currentResult.memoryKb || 0) / 1024).toFixed(1)} MB</strong>
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

