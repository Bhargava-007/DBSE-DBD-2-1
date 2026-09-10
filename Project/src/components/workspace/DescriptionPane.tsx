import React, { useState } from 'react';
import type { Problem, Submission } from '../../types/judge';
import { VerdictBadge } from '../common/VerdictBadge';
import { 
  History, 
  Lightbulb, 
  HelpCircle,
  Clock, 
  Cpu, 
  Code2
} from 'lucide-react';

interface Props {
  problem: Problem;
  submissions: Submission[];
  onSelectSubmissionCode?: (code: string, language: string) => void;
}

export const DescriptionPane: React.FC<Props> = ({ 
  problem, 
  submissions,
  onSelectSubmissionCode 
}) => {
  const [activeTab, setActiveTab] = useState<'statement' | 'submissions' | 'solution' | 'help'>('statement');
  const [viewingSubmission, setViewingSubmission] = useState<Submission | null>(null);

  const problemSubmissions = submissions.filter(s => s.problemId === problem.id);

  return (
    <div className="h-full flex flex-col bg-[var(--bg-card)] text-[var(--text-1)] overflow-hidden font-sans transition-colors">
      
      {/* Top Tab Bar */}
      <div className="h-9 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-card)] px-3 shrink-0 select-none">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { setActiveTab('statement'); setViewingSubmission(null); }}
            className={`h-7 px-3 flex items-center justify-center rounded-[var(--r-md)] text-[12px] font-medium cursor-pointer transition-colors ${
              activeTab === 'statement'
                ? 'text-[var(--text-1)] bg-[var(--bg-elevated)] border border-[var(--border)] font-semibold shadow-xs'
                : 'text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <span>Statement</span>
          </button>

          <button
            onClick={() => setActiveTab('submissions')}
            className={`h-7 flex items-center gap-1.5 px-3 rounded-[var(--r-md)] text-[12px] font-medium cursor-pointer transition-colors ${
              activeTab === 'submissions'
                ? 'text-[var(--text-1)] bg-[var(--bg-elevated)] border border-[var(--border)] font-semibold shadow-xs'
                : 'text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <span>Submissions</span>
            {problemSubmissions.length > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-[var(--bg-canvas)] text-[var(--text-2)] border border-[var(--border)]">
                {problemSubmissions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('solution'); setViewingSubmission(null); }}
            className={`h-7 px-3 flex items-center justify-center rounded-[var(--r-md)] text-[12px] font-medium cursor-pointer transition-colors ${
              activeTab === 'solution'
                ? 'text-[var(--text-1)] bg-[var(--bg-elevated)] border border-[var(--border)] font-semibold shadow-xs'
                : 'text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <span>Solution</span>
          </button>

          <button
            onClick={() => { setActiveTab('help'); setViewingSubmission(null); }}
            className={`h-7 px-3 flex items-center justify-center rounded-[var(--r-md)] text-[12px] font-medium cursor-pointer transition-colors ${
              activeTab === 'help'
                ? 'text-[var(--text-1)] bg-[var(--bg-elevated)] border border-[var(--border)] font-semibold shadow-xs'
                : 'text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <span>Help</span>
          </button>
        </div>

        {/* Limits info */}
        <div className="hidden sm:flex items-center gap-2.5 text-[11px] font-mono text-[var(--text-3)]">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-[var(--text-3)]" /> {problem.timeLimitMs}ms
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-[var(--text-3)]" /> {problem.memoryLimitMb}MB
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-5 text-[13px] leading-relaxed space-y-6">
        
        {/* Tab 1: Statement */}
        {activeTab === 'statement' && (
          <div className="space-y-6">
            
            {/* Title & Author Meta */}
            <div className="space-y-1.5 pb-3 border-b border-[var(--border)]">
              <h1 className="text-[18px] font-semibold text-[var(--text-1)] tracking-tight">
                {problem.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-[12px] text-[var(--text-2)]">
                <span>Author: <strong className="text-[var(--text-1)] font-medium">{problem.author}</strong></span>
                <span>·</span>
                <span>Success Rate: <strong className="font-mono text-[var(--text-1)]">{problem.acceptanceRate}%</strong></span>
                <span>·</span>
                <span>Submissions: <strong className="font-mono text-[var(--text-1)]">{problem.submissionsCount.toLocaleString()}</strong></span>
              </div>
            </div>

            {/* Problem Description */}
            <div className="text-[var(--text-1)] text-[13px] leading-6 space-y-3 font-normal whitespace-pre-line">
              {problem.description}
            </div>

            {/* Constraints */}
            <div className="space-y-2 pt-2">
              <div className="section-label">
                Constraints
              </div>
              <div className="p-3 rounded-[var(--r-md)] bg-[var(--bg-elevated)] border border-[var(--border)]">
                <ul className="space-y-1 text-[12px] font-mono text-[var(--text-1)] pl-4 list-disc">
                  {problem.constraints.map((constraint, idx) => (
                    <li key={idx} className="leading-relaxed">
                      <code>{constraint}</code>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sample Examples */}
            <div className="space-y-4 pt-2">
              <div className="section-label">
                Sample Test Cases
              </div>

              {problem.sampleTestCases.map((tc, idx) => (
                <div 
                  key={tc.id} 
                  className="rounded-[var(--r-md)] bg-[var(--bg-elevated)] border border-[var(--border)] overflow-hidden"
                >
                  <div className="px-3.5 py-1.5 bg-[var(--bg-card)] border-b border-[var(--border)] flex items-center justify-between text-[12px] font-medium text-[var(--text-2)]">
                    <span className="font-medium text-[var(--text-1)]">Example {idx + 1}</span>
                  </div>
                  <div className="p-3.5 font-mono space-y-2.5 text-[12px]">
                    <div>
                      <span className="text-[var(--text-3)] font-sans text-[11px] block mb-1">Input:</span>
                      <pre className="p-2.5 rounded-[var(--r-sm)] bg-[var(--bg-canvas)] text-[var(--text-1)] whitespace-pre-wrap border border-[var(--border)] overflow-x-auto">{tc.input}</pre>
                    </div>
                    <div>
                      <span className="text-[var(--text-3)] font-sans text-[11px] block mb-1">Expected Output:</span>
                      <pre className="p-2.5 rounded-[var(--r-sm)] bg-[var(--bg-canvas)] text-[var(--green)] whitespace-pre-wrap border border-[var(--border)] overflow-x-auto">{tc.expectedOutput}</pre>
                    </div>
                    {tc.explanation && (
                      <div className="text-[var(--text-2)] text-[12px] font-sans pt-1">
                        <strong className="text-[var(--text-1)]">Explanation: </strong>
                        {tc.explanation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="pt-2">
              <div className="section-label mb-2">
                Topics & Tags
              </div>
              <div className="flex flex-wrap gap-1.5">
                {problem.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="tag-pill"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Submissions */}
        {activeTab === 'submissions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-semibold text-[var(--text-1)]">Your Problem Submissions</span>
              <span className="text-[12px] text-[var(--text-3)]">{problemSubmissions.length} total</span>
            </div>

            {problemSubmissions.length === 0 ? (
              <div className="text-center py-12 rounded-[var(--r-md)] bg-[var(--bg-elevated)] border border-[var(--border)] space-y-2">
                <History className="w-6 h-6 text-[var(--text-3)] mx-auto opacity-50" />
                <div className="text-[13px] text-[var(--text-2)] font-medium">No submissions recorded for this challenge yet.</div>
                <div className="text-[12px] text-[var(--text-3)]">Run or submit your solution to evaluate your code.</div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {problemSubmissions.map(sub => (
                  <div 
                    key={sub.id}
                    className="p-3.5 rounded-[var(--r-md)] bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--border-mid)] transition-colors space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <VerdictBadge verdict={sub.verdict} />
                        <span className="text-[12px] font-mono text-[var(--text-2)]">
                          {sub.language}
                        </span>
                      </div>
                      <span className="text-[11px] text-[var(--text-3)] font-mono">
                        {new Date(sub.submittedAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[12px] font-mono text-[var(--text-2)] pt-1 border-t border-[var(--border)]">
                      <div>Time: <strong className="text-[var(--text-1)]">{sub.executionTimeMs}ms</strong></div>
                      <div>Memory: <strong className="text-[var(--text-1)]">{(sub.memoryKb / 1024).toFixed(1)}MB</strong></div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <button
                        onClick={() => setViewingSubmission(viewingSubmission?.id === sub.id ? null : sub)}
                        className="text-[12px] text-[var(--accent)] hover:underline font-medium"
                      >
                        {viewingSubmission?.id === sub.id ? 'Hide Code' : 'View Code'}
                      </button>

                      {onSelectSubmissionCode && (
                        <button
                          onClick={() => onSelectSubmissionCode(sub.code, sub.language)}
                          className="flex items-center gap-1 text-[12px] text-[var(--green)] hover:underline font-medium"
                        >
                          <Code2 className="w-3 h-3" />
                          <span>Load in Editor</span>
                        </button>
                      )}
                    </div>

                    {/* Expandable Code Inspector */}
                    {viewingSubmission?.id === sub.id && (
                      <pre className="p-3 rounded-[var(--r-sm)] bg-[var(--bg-canvas)] text-[12px] font-mono text-[var(--text-1)] overflow-x-auto border border-[var(--border)] max-h-60 leading-5">
                        {sub.code}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Solution / Editorial */}
        {activeTab === 'solution' && (
          <div className="space-y-5">
            <div className="space-y-1 pb-3 border-b border-[var(--border)]">
              <h2 className="text-[15px] font-semibold text-[var(--text-1)] tracking-tight flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-[var(--amber)]" />
                <span>Editorial & Optimal Solution</span>
              </h2>
              <p className="text-[12px] text-[var(--text-2)]">
                Algorithmic approaches and complexity breakdown.
              </p>
            </div>

            <div className="space-y-4 text-[13px] leading-relaxed text-[var(--text-2)]">
              <div className="p-3.5 rounded-[var(--r-md)] bg-[var(--bg-elevated)] border border-[var(--border)] space-y-2">
                <h4 className="font-semibold text-[var(--text-1)] text-[13px]">Approach & Intuition</h4>
                <p>
                  To solve <strong className="text-[var(--text-1)]">{problem.title}</strong> efficiently within the {problem.timeLimitMs}ms time limit, optimal algorithms use hash indexing or two-pointer techniques to achieve linear time complexity.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-[var(--r-md)] bg-[var(--bg-elevated)] border border-[var(--border)]">
                  <div className="section-label mb-1">Time Complexity</div>
                  <div className="font-mono text-[var(--green)] font-semibold text-[13px]">O(N) / O(log N)</div>
                  <div className="text-[11px] text-[var(--text-3)] mt-1">Single pass hash lookup or divide-and-conquer</div>
                </div>

                <div className="p-3 rounded-[var(--r-md)] bg-[var(--bg-elevated)] border border-[var(--border)]">
                  <div className="section-label mb-1">Space Complexity</div>
                  <div className="font-mono text-[var(--accent)] font-semibold text-[13px]">O(N) auxiliary</div>
                  <div className="text-[11px] text-[var(--text-3)] mt-1">Under the {problem.memoryLimitMb}MB threshold</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Help & Shortcuts */}
        {activeTab === 'help' && (
          <div className="space-y-5">
            <div className="space-y-1 pb-3 border-b border-[var(--border)]">
              <h2 className="text-[15px] font-semibold text-[var(--text-1)] tracking-tight flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[var(--accent)]" />
                <span>Shortcuts & Platform Help</span>
              </h2>
              <p className="text-[12px] text-[var(--text-2)]">
                Keybindings and execution tips for competitive programming.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="section-label">
                Keyboard Shortcuts
              </div>
              <div className="space-y-1.5 font-mono text-[12px]">
                <div className="flex items-center justify-between p-2.5 rounded-[var(--r-md)] bg-[var(--bg-elevated)] border border-[var(--border)]">
                  <span className="text-[var(--text-2)] font-sans">Run Test Cases</span>
                  <kbd className="px-2 py-0.5 rounded bg-[var(--bg-card)] text-[var(--text-1)] border border-[var(--border)]">Ctrl + Enter</kbd>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-[var(--r-md)] bg-[var(--bg-elevated)] border border-[var(--border)]">
                  <span className="text-[var(--text-2)] font-sans">Submit Solution</span>
                  <kbd className="px-2 py-0.5 rounded bg-[var(--bg-card)] text-[var(--text-1)] border border-[var(--border)]">Ctrl + Shift + Enter</kbd>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-[var(--r-md)] bg-[var(--bg-elevated)] border border-[var(--border)]">
                  <span className="text-[var(--text-2)] font-sans">Command Palette</span>
                  <kbd className="px-2 py-0.5 rounded bg-[var(--bg-card)] text-[var(--text-1)] border border-[var(--border)]">Ctrl + K</kbd>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};


