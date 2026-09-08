import React, { useState } from 'react';
import { useJudge } from '../../context/JudgeContext';
import { VerdictBadge } from '../common/VerdictBadge';
import type { Submission } from '../../types/judge';
import { 
  X,
  Copy,
  Check,
  Code2,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export const SubmissionsView: React.FC = () => {
  const { submissions, navigateToProblem } = useJudge();
  const [selectedVerdict, setSelectedVerdict] = useState<string>('All');
  const [selectedLang, setSelectedLang] = useState<string>('All');
  const [inspectSubmission, setInspectSubmission] = useState<Submission | null>(null);
  const [copied, setCopied] = useState(false);

  const filteredSubmissions = submissions.filter(s => {
    const matchesVerdict = selectedVerdict === 'All' || s.verdict === selectedVerdict;
    const matchesLang = selectedLang === 'All' || s.language === selectedLang;
    return matchesVerdict && matchesLang;
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
              Submissions Log
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-medium">
              {filteredSubmissions.length} recorded
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Execution audit trail from all practice submissions and contest rounds.
          </p>
        </div>

        {/* Quick filters */}
        <div className="flex items-center gap-2">
          {/* Verdict filter */}
          <select
            value={selectedVerdict}
            onChange={(e) => setSelectedVerdict(e.target.value)}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md px-2.5 py-1.5 text-xs font-mono text-slate-700 dark:text-zinc-200 focus:outline-none focus:border-slate-400 dark:focus:border-zinc-600 shadow-2xs"
          >
            <option value="All">All Verdicts</option>
            <option value="Accepted">Accepted</option>
            <option value="Wrong Answer">Wrong Answer</option>
            <option value="Time Limit Exceeded">Time Limit Exceeded</option>
            <option value="Memory Limit Exceeded">Memory Limit Exceeded</option>
            <option value="Runtime Error">Runtime Error</option>
          </select>

          {/* Language filter */}
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md px-2.5 py-1.5 text-xs font-mono text-slate-700 dark:text-zinc-200 focus:outline-none focus:border-slate-400 dark:focus:border-zinc-600 shadow-2xs uppercase"
          >
            <option value="All">All Languages</option>
            <option value="cpp">C++</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="javascript">JavaScript</option>
          </select>
        </div>
      </div>

      {/* Main Content Layout with optional slide-over inspector */}
      <div className="flex gap-4 items-start relative">
        
        {/* Submissions Table */}
        <div className={`rounded-lg bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden transition-all duration-200 ${
          inspectSubmission ? 'hidden xl:block xl:w-7/12' : 'w-full'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Problem</th>
                  <th className="py-2.5 px-3">Verdict</th>
                  <th className="py-2.5 px-3">Language</th>
                  <th className="py-2.5 px-3">Runtime</th>
                  <th className="py-2.5 px-3">Memory</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-mono">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-zinc-400 font-sans">
                      No submissions match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map(sub => {
                    const isSelected = inspectSubmission?.id === sub.id;
                    return (
                      <tr 
                        key={sub.id}
                        onClick={() => setInspectSubmission(sub)}
                        className={`cursor-pointer transition-colors ${
                          isSelected 
                            ? 'bg-slate-100/90 dark:bg-zinc-800/80' 
                            : 'hover:bg-slate-50 dark:hover:bg-zinc-800/40'
                        }`}
                      >
                        {/* Problem */}
                        <td className="py-2.5 px-3 font-sans">
                          <span className="font-semibold text-slate-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400">
                            {sub.problemTitle}
                          </span>
                        </td>

                        {/* Verdict */}
                        <td className="py-2.5 px-3">
                          <VerdictBadge verdict={sub.verdict} size="sm" />
                        </td>

                        {/* Language */}
                        <td className="py-2.5 px-3 uppercase text-slate-600 dark:text-zinc-400 text-[11px]">
                          {sub.language}
                        </td>

                        {/* Runtime */}
                        <td className="py-2.5 px-3 text-slate-800 dark:text-zinc-200">
                          {sub.executionTimeMs} ms
                        </td>

                        {/* Memory */}
                        <td className="py-2.5 px-3 text-slate-800 dark:text-zinc-200">
                          {(sub.memoryKb / 1024).toFixed(1)} MB
                        </td>

                        {/* Timestamp */}
                        <td className="py-2.5 px-3 text-slate-500 dark:text-zinc-400 text-[11px]">
                          {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>

                        {/* Action */}
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectSubmission(sub);
                            }}
                            className={`px-2 py-0.5 rounded text-[11px] font-sans font-medium transition-colors ${
                              isSelected
                                ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-slate-900'
                                : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200'
                            }`}
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Slide-over / Split Inspector Panel */}
        {inspectSubmission && (
          <div className="w-full xl:w-5/12 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs p-4 space-y-4 shrink-0 transition-all">
            
            {/* Inspector Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <VerdictBadge verdict={inspectSubmission.verdict} size="sm" />
                  <span className="font-semibold text-slate-900 dark:text-zinc-50 text-sm">
                    {inspectSubmission.problemTitle}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-zinc-400">
                  <span>ID: {inspectSubmission.id}</span>
                  <span>•</span>
                  <span>@{inspectSubmission.username}</span>
                  <span>•</span>
                  <span>{new Date(inspectSubmission.submittedAt).toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => setInspectSubmission(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Telemetry Metrics Row */}
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-2 rounded-md bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800">
                <div className="text-[10px] text-slate-400 uppercase font-sans">Runtime</div>
                <div className="font-bold text-slate-900 dark:text-zinc-100 mt-0.5">{inspectSubmission.executionTimeMs} ms</div>
              </div>

              <div className="p-2 rounded-md bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800">
                <div className="text-[10px] text-slate-400 uppercase font-sans">Memory</div>
                <div className="font-bold text-slate-900 dark:text-zinc-100 mt-0.5">{(inspectSubmission.memoryKb / 1024).toFixed(1)} MB</div>
              </div>

              <div className="p-2 rounded-md bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800">
                <div className="text-[10px] text-slate-400 uppercase font-sans">Language</div>
                <div className="font-bold text-slate-900 dark:text-zinc-100 uppercase mt-0.5">{inspectSubmission.language}</div>
              </div>
            </div>

            {/* Error message if any */}
            {inspectSubmission.errorMessage && (
              <div className="p-2.5 rounded-md bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 font-mono text-xs text-rose-800 dark:text-rose-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5 font-sans text-xs">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  <span>Execution Diagnostics:</span>
                </div>
                <p className="text-[11px] whitespace-pre-wrap">{inspectSubmission.errorMessage}</p>
              </div>
            )}

            {/* Code View with Copy */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600 dark:text-zinc-400 flex items-center gap-1.5 font-sans">
                  <Code2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Submitted Source Code</span>
                </span>

                <button
                  onClick={() => handleCopyCode(inspectSubmission.code)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <pre className="p-3 rounded-md bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 font-mono text-xs text-slate-900 dark:text-zinc-100 overflow-x-auto max-h-80 leading-5">
                {inspectSubmission.code}
              </pre>
            </div>

            {/* Open in Workspace CTA */}
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <button
                onClick={() => setInspectSubmission(null)}
                className="text-xs text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                Close Inspector
              </button>

              <button
                onClick={() => navigateToProblem(inspectSubmission.problemId)}
                className="flex items-center gap-1 text-xs font-semibold text-slate-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <span>Open in Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

