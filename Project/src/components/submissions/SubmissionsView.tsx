import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJudge } from '../../context/JudgeContext';
import { VerdictBadge } from '../common/VerdictBadge';
import type { Submission } from '../../types/judge';
import { 
  X,
  Copy,
  Check,
  Code2,
  ArrowRight,
  ShieldAlert,
  Inbox
} from 'lucide-react';

export const SubmissionsView: React.FC = () => {
  const { submissions, problems } = useJudge();
  const navigate = useNavigate();
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 page-fade text-[var(--bone)]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--border)]">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[var(--bone)] tracking-tight">
              Execution Ledger
            </h1>
            <span className="text-xs font-mono text-[var(--text-3)] px-2 py-0.5 rounded bg-[var(--ash)] border border-[var(--border)]">
              {submissions.length} recorded
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-2)]">
            Verified algorithmic code evaluations, resource benchmarks, and diagnostics.
          </p>
        </div>

        {/* Quick filters */}
        <div className="flex items-center gap-2">
          {/* Verdict filter */}
          <select
            value={selectedVerdict}
            onChange={(e) => setSelectedVerdict(e.target.value)}
            className="h-8 bg-[var(--ash)] border border-[var(--border)] rounded-[var(--r-md)] px-3 text-xs font-mono text-[var(--bone)] focus:outline-none focus:border-[var(--verdigris)] cursor-pointer"
          >
            <option value="All">All Verdicts</option>
            <option value="Accepted">Accepted</option>
            <option value="Wrong Answer">Wrong Answer</option>
            <option value="Time Limit Exceeded">Time Limit Exceeded</option>
            <option value="Memory Limit Exceeded">Memory Limit Exceeded</option>
            <option value="Runtime Error">Runtime Error</option>
            <option value="Compilation Error">Compilation Error</option>
          </select>

          {/* Language filter */}
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="h-8 bg-[var(--ash)] border border-[var(--border)] rounded-[var(--r-md)] px-3 text-xs font-mono text-[var(--bone)] focus:outline-none focus:border-[var(--verdigris)] cursor-pointer"
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
      <div className="flex gap-6 items-start relative">
        
        {/* Submissions Table */}
        <div className={`card overflow-hidden bg-[var(--carbon)] border-[var(--border)] transition-all duration-200 ${
          inspectSubmission ? 'hidden xl:block xl:w-7/12' : 'w-full'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--ash)] text-xs font-mono text-[var(--text-3)] uppercase tracking-wider h-9">
                  <th className="px-4 font-medium">Status</th>
                  <th className="px-4 font-medium">Problem</th>
                  <th className="px-4 font-medium">Verdict</th>
                  <th className="px-4 font-medium">Language</th>
                  <th className="px-4 font-medium">Runtime</th>
                  <th className="px-4 font-medium">Memory</th>
                  <th className="px-4 font-medium">Time</th>
                  <th className="px-4 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-[var(--text-3)] bg-[var(--carbon)]">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Inbox className="w-7 h-7 text-[var(--text-3)]" />
                        <span className="text-xs font-mono text-[var(--text-3)]">No submissions match your filters.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((sub) => {
                    const isSelected = inspectSubmission?.id === sub.id;
                    return (
                      <tr 
                        key={sub.id}
                        onClick={() => setInspectSubmission(sub)}
                        className={`h-[52px] cursor-pointer transition-colors border-b border-[var(--border)] last:border-0 ${
                          isSelected 
                            ? 'bg-[var(--accent-dim)]/50' 
                            : 'hover:bg-[var(--ash)]'
                        }`}
                      >
                        {/* Status Icon */}
                        <td className="px-4 w-10">
                          {sub.verdict === 'Accepted' ? (
                            <span className="w-2 h-2 rounded-full bg-[var(--green)] inline-block"></span>
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-[var(--red)] inline-block"></span>
                          )}
                        </td>

                        {/* Problem */}
                        <td className="px-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const p = problems.find(pr => pr.id === sub.problemId);
                              navigate(`/problems/${p?.slug || sub.problemId}`);
                            }}
                            className="font-semibold text-[var(--bone)] hover:text-[var(--verdigris)] transition-colors text-left cursor-pointer text-sm truncate max-w-[220px] block"
                          >
                            {sub.problemTitle.replace(/^prob-\d+\.\s*/i, '')}
                          </button>
                        </td>

                        {/* Verdict */}
                        <td className="px-4">
                          <VerdictBadge verdict={sub.verdict} size="sm" />
                        </td>

                        {/* Language */}
                        <td className="px-4 text-[var(--text-2)] text-xs font-mono uppercase">
                          {sub.language}
                        </td>

                        {/* Runtime */}
                        <td className="px-4 text-[var(--bone)] font-mono text-xs">
                          {sub.executionTimeMs} ms
                        </td>

                        {/* Memory */}
                        <td className="px-4 text-[var(--text-2)] font-mono text-xs">
                          {(sub.memoryKb / 1024).toFixed(1)} MB
                        </td>

                        {/* Timestamp */}
                        <td className="px-4 text-[var(--text-3)] font-mono text-xs">
                          {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>

                        {/* Action */}
                        <td className="px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectSubmission(sub);
                            }}
                            className="btn-secondary !px-2.5 !py-1 !text-xs font-mono"
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
          <div className="w-full xl:w-5/12 card bg-[var(--carbon)] border-[var(--border-strong)] p-5 space-y-4 shrink-0 page-fade">
            
            {/* Inspector Header */}
            <div className="flex items-start justify-between border-b border-[var(--border)] pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <VerdictBadge verdict={inspectSubmission.verdict} size="sm" />
                  <span className="font-bold text-[var(--bone)] text-base">
                    {inspectSubmission.problemTitle.replace(/^prob-\d+\.\s*/i, '')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-3)]">
                  <span>ID: {inspectSubmission.id.slice(0, 8)}</span>
                  <span>·</span>
                  <span>@{inspectSubmission.username}</span>
                  <span>·</span>
                  <span>{new Date(inspectSubmission.submittedAt).toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => setInspectSubmission(null)}
                className="text-[var(--text-3)] hover:text-[var(--bone)] p-1 rounded hover:bg-[var(--ash)] transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Telemetry Metrics Row */}
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-3 rounded-[var(--r-md)] bg-[var(--ash)] border border-[var(--border)]">
                <div className="text-xs uppercase text-[var(--text-3)] font-medium">Runtime</div>
                <div className="font-bold text-[var(--bone)] text-sm mt-1">{inspectSubmission.executionTimeMs} ms</div>
              </div>

              <div className="p-3 rounded-[var(--r-md)] bg-[var(--ash)] border border-[var(--border)]">
                <div className="text-xs uppercase text-[var(--text-3)] font-medium">Memory</div>
                <div className="font-bold text-[var(--bone)] text-sm mt-1">{(inspectSubmission.memoryKb / 1024).toFixed(1)} MB</div>
              </div>

              <div className="p-3 rounded-[var(--r-md)] bg-[var(--ash)] border border-[var(--border)]">
                <div className="text-xs uppercase text-[var(--text-3)] font-medium">Language</div>
                <div className="font-bold text-[var(--bone)] text-sm mt-1 uppercase">{inspectSubmission.language}</div>
              </div>
            </div>

            {/* Error message if any */}
            {inspectSubmission.errorMessage && (
              <div className="p-3.5 rounded-[var(--r-md)] bg-[var(--red-dim)] border border-[var(--red)]/30 font-mono text-xs text-[var(--red)] space-y-1.5">
                <div className="font-medium flex items-center gap-1.5 uppercase tracking-wider text-xs">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Execution Diagnostics</span>
                </div>
                <p className="text-xs whitespace-pre-wrap leading-relaxed">{inspectSubmission.errorMessage}</p>
              </div>
            )}

            {/* Code View with Copy */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-[var(--text-2)] flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-[var(--verdigris)]" />
                  <span>Submitted Source</span>
                </span>

                <button
                  onClick={() => handleCopyCode(inspectSubmission.code)}
                  className="btn-secondary !px-2.5 !py-0.5 !text-xs font-mono flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3 h-3 text-[var(--green)]" /> : <Copy className="w-3 h-3 text-[var(--text-3)]" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <pre className="p-3.5 rounded-[var(--r-md)] bg-[var(--obsidian)] border border-[var(--border)] font-mono text-xs text-[var(--bone)] overflow-x-auto max-h-72 leading-relaxed">
                {inspectSubmission.code}
              </pre>
            </div>

            {/* Open in Workspace CTA */}
            <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
              <button
                onClick={() => setInspectSubmission(null)}
                className="text-xs font-mono text-[var(--text-3)] hover:text-[var(--bone)] transition-colors"
              >
                Close Inspector
              </button>

              <button
                onClick={() => {
                  const p = problems.find(pr => pr.id === inspectSubmission.problemId);
                  navigate(`/problems/${p?.slug || inspectSubmission.problemId}`);
                }}
                className="btn-primary !bg-[var(--verdigris)] !text-[var(--obsidian)] !font-semibold !text-xs font-mono !py-1.5 !px-3.5 flex items-center gap-1.5 cursor-pointer"
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
