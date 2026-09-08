import React, { useState } from 'react';
import type { Problem, Submission } from '../../types/judge';
import { DifficultyBadge } from '../common/DifficultyBadge';
import { VerdictBadge } from '../common/VerdictBadge';
import { 
  FileText, 
  History, 
  Lightbulb, 
  Clock, 
  Cpu, 
  User, 
  Tag,
  ArrowUpRight
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
  const [activeTab, setActiveTab] = useState<'description' | 'submissions' | 'editorial'>('description');
  const [viewingSubmission, setViewingSubmission] = useState<Submission | null>(null);

  const problemSubmissions = submissions.filter(s => s.problemId === problem.id);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg shadow-xs overflow-hidden">
      
      {/* Pane Tabs Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-950/70 px-3 py-1.5 shrink-0 select-none">
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setActiveTab('description'); setViewingSubmission(null); }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'description'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-50 shadow-xs font-semibold border border-slate-200 dark:border-zinc-700'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Description</span>
          </button>

          <button
            onClick={() => setActiveTab('submissions')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'submissions'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-50 shadow-xs font-semibold border border-slate-200 dark:border-zinc-700'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Submissions</span>
            {problemSubmissions.length > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 ml-0.5">
                {problemSubmissions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('editorial'); setViewingSubmission(null); }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'editorial'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-50 shadow-xs font-semibold border border-slate-200 dark:border-zinc-700'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Editorial</span>
          </button>
        </div>

        {/* Runtime & Memory Limits info */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-zinc-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" /> {problem.timeLimitMs}ms
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-slate-400" /> {problem.memoryLimitMb}MB
          </span>
        </div>
      </div>

      {/* Pane Content Area with 14px base font */}
      <div className="flex-1 overflow-y-auto p-5 text-sm leading-relaxed space-y-6">
        
        {/* Description Tab */}
        {activeTab === 'description' && (
          <div className="space-y-6">
            
            {/* Header: Title & Metadata */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-50 tracking-tight">
                  {problem.title}
                </h1>
                <DifficultyBadge difficulty={problem.difficulty} />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs text-slate-500 dark:text-zinc-400">
                <span className="flex items-center gap-1 font-medium">
                  <User className="w-3 h-3 text-slate-400" /> {problem.author}
                </span>
                <span>•</span>
                <span>Acceptance: <strong className="font-mono text-slate-800 dark:text-zinc-200">{problem.acceptanceRate}%</strong></span>
                <span>•</span>
                <span>Submissions: <strong className="font-mono text-slate-800 dark:text-zinc-200">{problem.submissionsCount.toLocaleString()}</strong></span>
              </div>
            </div>

            {/* Problem Statement (14px font, highly readable) */}
            <div className="text-slate-800 dark:text-zinc-200 text-sm leading-6 space-y-3 font-normal whitespace-pre-line border-t border-slate-100 dark:border-zinc-800/80 pt-4">
              {problem.description}
            </div>

            {/* Sample Examples */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider font-mono">
                Sample Test Cases
              </h3>

              {problem.sampleTestCases.map((tc, idx) => (
                <div 
                  key={tc.id} 
                  className="rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 overflow-hidden"
                >
                  <div className="px-3.5 py-1.5 bg-slate-100/80 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs font-medium text-slate-600 dark:text-zinc-400">
                    <span>Example {idx + 1}</span>
                  </div>
                  <div className="p-3.5 font-mono space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 dark:text-zinc-400">Input: </span>
                      <span className="text-slate-900 dark:text-zinc-100 font-semibold">{tc.input}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-zinc-400">Output: </span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">{tc.expectedOutput}</span>
                    </div>
                    {tc.explanation && (
                      <div className="pt-2 text-slate-600 dark:text-zinc-400 font-sans text-xs italic border-t border-slate-200/60 dark:border-zinc-800/60">
                        Explanation: {tc.explanation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Constraints */}
            <div className="space-y-2 border-t border-slate-100 dark:border-zinc-800/80 pt-4">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider font-mono">
                Constraints
              </h3>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700 dark:text-zinc-300 font-mono">
                {problem.constraints.map((c, i) => (
                  <li key={i}>
                    <code className="text-xs bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200">
                      {c}
                    </code>
                  </li>
                ))}
              </ul>
            </div>

            {/* Topics & Tags */}
            <div className="border-t border-slate-100 dark:border-zinc-800/80 pt-4 space-y-2">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider font-mono">
                Topics & Categories
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {problem.tags.map(tag => (
                  <span 
                    key={tag}
                    className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300"
                  >
                    <Tag className="w-3 h-3 text-slate-400" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider font-mono">
                Your Submissions ({problemSubmissions.length})
              </h3>
            </div>

            {problemSubmissions.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 dark:text-zinc-400 border border-dashed border-slate-200 dark:border-zinc-800 rounded-lg">
                No submissions for this challenge yet. Click "Submit" to run your solution against the judging suite.
              </div>
            ) : (
              <div className="space-y-2">
                {problemSubmissions.map(sub => (
                  <div
                    key={sub.id}
                    onClick={() => setViewingSubmission(sub === viewingSubmission ? null : sub)}
                    className="p-3.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 cursor-pointer transition-colors space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <VerdictBadge verdict={sub.verdict} />
                        <span className="font-mono text-xs font-medium uppercase px-2 py-0.5 rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400">
                          {sub.language}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">
                        {new Date(sub.submittedAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-slate-600 dark:text-zinc-400">
                      <span>Runtime: <strong className="text-slate-900 dark:text-zinc-100">{sub.executionTimeMs} ms</strong></span>
                      <span>•</span>
                      <span>Memory: <strong className="text-slate-900 dark:text-zinc-100">{(sub.memoryKb / 1024).toFixed(1)} MB</strong></span>
                      {sub.testCasesPassed !== undefined && sub.totalTestCases && (
                        <>
                          <span>•</span>
                          <span>Passed: <strong className={sub.verdict === 'Accepted' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>{sub.testCasesPassed}/{sub.totalTestCases}</strong></span>
                        </>
                      )}
                    </div>

                    {sub.errorMessage && (
                      <div className="p-2.5 rounded-md bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-xs font-mono text-rose-700 dark:text-rose-300">
                        {sub.errorMessage}
                      </div>
                    )}

                    {/* Code inspection viewer */}
                    {viewingSubmission?.id === sub.id && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">Submitted Code ({sub.id})</span>
                          {onSelectSubmissionCode && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectSubmissionCode(sub.code, sub.language);
                              }}
                              className="text-xs font-medium px-2.5 py-1 rounded-md bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 text-slate-700 dark:text-zinc-200 flex items-center gap-1"
                            >
                              <span>Load in Editor</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <pre className="p-3 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 font-mono text-xs text-slate-900 dark:text-zinc-100 overflow-x-auto">
                          {sub.code}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Editorial Tab */}
        {activeTab === 'editorial' && (
          <div className="space-y-5 text-sm">
            <div className="border-b border-slate-200 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">Optimal Algorithmic Approach</h3>
              <p className="text-xs font-mono text-slate-500 dark:text-zinc-400 mt-0.5">Asymptotic Complexity & Proof</p>
            </div>

            <div className="space-y-4 text-slate-800 dark:text-zinc-200 leading-relaxed">
              <p>
                <strong className="text-slate-900 dark:text-zinc-100">Intuition:</strong> A brute-force search evaluates every candidate combination, resulting in <code className="text-xs font-mono bg-slate-100 dark:bg-zinc-800 px-1 py-0.5 rounded">O(N²)</code> time. By employing an auxiliary hash map or two-pointer scan, we reduce the time complexity to <code className="text-xs font-mono bg-slate-100 dark:bg-zinc-800 px-1 py-0.5 rounded">O(N)</code>.
              </p>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-1.5 font-mono text-xs">
                <div className="text-emerald-700 dark:text-emerald-400 font-semibold">// Complexity Guarantees</div>
                <div>Time Complexity: <span className="text-slate-900 dark:text-zinc-100 font-bold">O(N)</span> — Single pass traversal</div>
                <div>Space Complexity: <span className="text-slate-900 dark:text-zinc-100 font-bold">O(N)</span> — Hash map storage</div>
              </div>

              <p>
                As we iterate over the elements, for each value <code className="text-xs font-mono bg-slate-100 dark:bg-zinc-800 px-1 py-0.5 rounded">x</code>, we check whether its required complement exists in our map. If found, we return the stored pair. Otherwise, we record the element into our map in amortized <code className="text-xs font-mono bg-slate-100 dark:bg-zinc-800 px-1 py-0.5 rounded">O(1)</code> time.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

