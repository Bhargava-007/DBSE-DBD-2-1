import React, { useMemo, useState } from 'react';
import { useJudge } from '../../context/JudgeContext';
import { VerdictBadge } from '../common/VerdictBadge';
import { 
  Building2, 
  Mail, 
  ExternalLink,
  Flame,
  CheckCircle2
} from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const { currentUser, submissions, navigateToProblem } = useJudge();
  const [hoveredCell, setHoveredCell] = useState<{ week: number; day: number; count: number; dateStr: string } | null>(null);

  const userSubmissions = useMemo(() => {
    return submissions.filter(s => s.userId === currentUser?.id);
  }, [submissions, currentUser]);

  const acceptedCount = useMemo(() => {
    return userSubmissions.filter(s => s.verdict === 'Accepted').length;
  }, [userSubmissions]);

  const acceptanceRate = useMemo(() => {
    if (userSubmissions.length === 0) return 0;
    return Math.round((acceptedCount / userSubmissions.length) * 100);
  }, [userSubmissions, acceptedCount]);

  // 52-week activity heatmap data
  const heatmapData = useMemo(() => {
    const weeks = 52;
    const days = 7;
    const grid: { count: number; dateStr: string }[][] = [];
    const now = new Date();

    for (let w = 0; w < weeks; w++) {
      const week: { count: number; dateStr: string }[] = [];
      for (let d = 0; d < days; d++) {
        // Compute realistic dates going back 52 weeks
        const daysAgo = (51 - w) * 7 + (6 - d);
        const cellDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        const dateStr = cellDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const recentBonus = w > 40 ? 0.35 : 0.15;
        const rand = Math.random();
        let count = 0;
        if (rand < 0.35 - recentBonus) {
          count = 0;
        } else if (rand < 0.65) {
          count = Math.floor(Math.random() * 2) + 1;
        } else if (rand < 0.88) {
          count = Math.floor(Math.random() * 3) + 3;
        } else {
          count = Math.floor(Math.random() * 4) + 6;
        }
        week.push({ count, dateStr });
      }
      grid.push(week);
    }
    return grid;
  }, []);

  const totalHeatmapSubmissions = useMemo(() => {
    return heatmapData.reduce((acc, week) => acc + week.reduce((wAcc, cell) => wAcc + cell.count, 0), 0);
  }, [heatmapData]);

  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'bg-slate-100 dark:bg-zinc-800/70 border-slate-200/50 dark:border-zinc-700/50';
    if (count <= 2) return 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60';
    if (count <= 5) return 'bg-emerald-300 dark:bg-emerald-700/80 border-emerald-400 dark:border-emerald-600/80';
    return 'bg-emerald-500 dark:bg-emerald-500 border-emerald-600 dark:border-emerald-400';
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Profile Header Banner */}
      <div className="rounded-lg bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 flex items-center justify-center text-lg font-bold shadow-xs shrink-0">
            {currentUser.username.substring(0, 2).toUpperCase()}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-zinc-50">
                {currentUser.name}
              </h1>
              <span className="font-mono text-xs text-slate-500 dark:text-zinc-400">@{currentUser.username}</span>
              <span className="text-[11px] font-medium px-2 py-0.2 rounded-full bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                Candidate
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-zinc-400">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {currentUser.institution}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {currentUser.email}
              </span>
            </div>
          </div>
        </div>

        {/* Standings Telemetry */}
        <div className="flex items-center gap-2 font-mono self-start md:self-auto text-xs">
          <div className="px-3.5 py-2 rounded-md bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-sans font-medium">Contest Rating</div>
            <div className="text-base font-bold text-slate-900 dark:text-zinc-50 mt-0.5 tabular-nums">{currentUser.rating}</div>
            <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-sans">Top 1.4%</div>
          </div>

          <div className="px-3.5 py-2 rounded-md bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-sans font-medium">Global Rank</div>
            <div className="text-base font-bold text-slate-900 dark:text-zinc-100 mt-0.5 tabular-nums">#{currentUser.rank}</div>
            <div className="text-[10px] text-slate-400 font-sans">142k tracked</div>
          </div>

          <div className="px-3.5 py-2 rounded-md bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-sans font-medium">Streak</div>
            <div className="text-base font-bold text-slate-900 dark:text-zinc-100 mt-0.5 tabular-nums flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" /> 28d
            </div>
            <div className="text-[10px] text-slate-400 font-sans">Active</div>
          </div>
        </div>
      </div>

      {/* Two-Column Progress & Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Solved Breakdown Panel */}
        <div className="rounded-lg bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-50">Solved Challenges Breakdown</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Verified solutions across difficulty thresholds</p>
            </div>
            <div className="font-mono text-xs font-bold text-slate-900 dark:text-zinc-100">
              <span className="text-lg text-emerald-700 dark:text-emerald-400">{currentUser.solvedCount}</span>
              <span className="text-slate-400 font-normal"> / 2,400+ total</span>
            </div>
          </div>

          {/* Segmented Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden flex">
            <div 
              style={{ width: `${(currentUser.easySolved / currentUser.solvedCount) * 100}%` }}
              className="bg-emerald-500 h-full"
              title={`Easy: ${currentUser.easySolved}`}
            />
            <div 
              style={{ width: `${(currentUser.mediumSolved / currentUser.solvedCount) * 100}%` }}
              className="bg-amber-500 h-full"
              title={`Medium: ${currentUser.mediumSolved}`}
            />
            <div 
              style={{ width: `${(currentUser.hardSolved / currentUser.solvedCount) * 100}%` }}
              className="bg-rose-500 h-full"
              title={`Hard: ${currentUser.hardSolved}`}
            />
          </div>

          {/* Detailed Rows */}
          <div className="space-y-3 font-mono text-xs pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-sans font-medium text-slate-700 dark:text-zinc-300">Easy</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-900 dark:text-zinc-100 font-bold">{currentUser.easySolved} <span className="text-slate-400 font-normal">/ 150</span></span>
                <span className="text-[11px] text-slate-400 w-10 text-right">{Math.round((currentUser.easySolved / 150) * 100)}%</span>
              </div>
            </div>
            <div className="w-full h-1 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
              <div className="bg-emerald-500 h-full" style={{ width: `${(currentUser.easySolved / 150) * 100}%` }} />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="font-sans font-medium text-slate-700 dark:text-zinc-300">Medium</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-900 dark:text-zinc-100 font-bold">{currentUser.mediumSolved} <span className="text-slate-400 font-normal">/ 150</span></span>
                <span className="text-[11px] text-slate-400 w-10 text-right">{Math.round((currentUser.mediumSolved / 150) * 100)}%</span>
              </div>
            </div>
            <div className="w-full h-1 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
              <div className="bg-amber-500 h-full" style={{ width: `${(currentUser.mediumSolved / 150) * 100}%` }} />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="font-sans font-medium text-slate-700 dark:text-zinc-300">Hard</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-900 dark:text-zinc-100 font-bold">{currentUser.hardSolved} <span className="text-slate-400 font-normal">/ 50</span></span>
                <span className="text-[11px] text-slate-400 w-10 text-right">{Math.round((currentUser.hardSolved / 50) * 100)}%</span>
              </div>
            </div>
            <div className="w-full h-1 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
              <div className="bg-rose-500 h-full" style={{ width: `${(currentUser.hardSolved / 50) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Evaluation Metrics & Contest Standing Panel */}
        <div className="rounded-lg bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-50">Evaluation Accuracy & Benchmark</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Overall submission success and execution standards</p>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="p-3 rounded-md bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 space-y-1">
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 uppercase font-sans">Acceptance Rate</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-zinc-100 tabular-nums">{acceptanceRate}%</div>
              <div className="text-[11px] text-slate-400 font-sans">{acceptedCount} of {userSubmissions.length} attempts</div>
            </div>

            <div className="p-3 rounded-md bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 space-y-1">
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 uppercase font-sans">Division Standing</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-zinc-100 tabular-nums">Div 1</div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-sans">Rating &gt; 1800 Tier</div>
            </div>
          </div>

          <div className="p-3 rounded-md bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 text-xs space-y-1 font-sans">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-zinc-100">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Standardized Sandbox Guarantees</span>
            </div>
            <p className="text-slate-600 dark:text-zinc-400 text-[11px] leading-relaxed">
              All submissions run inside isolated gVisor containers with strict CPU time quotas and memory ceiling enforcement.
            </p>
          </div>
        </div>

      </div>

      {/* 52-Week Submission Activity Heatmap */}
      <div className="rounded-lg bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-50">Annual Activity Heatmap</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              {totalHeatmapSubmissions} sandbox evaluations recorded across 52 weeks
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
            <span>Less</span>
            <span className="w-2.5 h-2.5 rounded-xs bg-slate-100 border border-slate-200/60 dark:bg-zinc-800 dark:border-zinc-700" />
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-100 border border-emerald-200 dark:bg-emerald-950 dark:border-emerald-900" />
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-300 border border-emerald-400 dark:bg-emerald-800 dark:border-emerald-700" />
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 border border-emerald-600 dark:bg-emerald-500 dark:border-emerald-400" />
            <span>More</span>
          </div>
        </div>

        {/* Interactive Tooltip Banner if cell hovered */}
        <div className="h-5 text-xs font-mono text-slate-600 dark:text-zinc-400">
          {hoveredCell ? (
            <span>
              <strong className="text-slate-900 dark:text-zinc-100">{hoveredCell.count} submissions</strong> on {hoveredCell.dateStr}
            </span>
          ) : (
            <span className="text-slate-400 text-[11px] font-sans">Hover over any square to inspect daily submission volume</span>
          )}
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-1 no-scrollbar">
          <div className="inline-flex gap-1">
            {heatmapData.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1">
                {week.map((cell, dIdx) => (
                  <div
                    key={dIdx}
                    onMouseEnter={() => setHoveredCell({ week: wIdx, day: dIdx, count: cell.count, dateStr: cell.dateStr })}
                    onMouseLeave={() => setHoveredCell(null)}
                    className={`w-2.5 h-2.5 rounded-xs border cursor-pointer transition-transform hover:scale-125 ${getHeatmapColor(cell.count)}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Submissions Log */}
      <div className="rounded-lg bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden space-y-0">
        <div className="px-4 py-3 border-b border-slate-200/80 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 flex items-center justify-between">
          <h2 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider font-mono">
            Recent Practice Submissions
          </h2>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
            {userSubmissions.length} total logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-100 dark:border-zinc-800/80 text-[11px] text-slate-400 uppercase tracking-wider font-sans">
                <th className="py-2.5 px-4">Problem</th>
                <th className="py-2.5 px-4">Verdict</th>
                <th className="py-2.5 px-4">Language</th>
                <th className="py-2.5 px-4">Runtime</th>
                <th className="py-2.5 px-4">Memory</th>
                <th className="py-2.5 px-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {userSubmissions.slice(0, 5).map(sub => (
                <tr 
                  key={sub.id} 
                  onClick={() => navigateToProblem(sub.problemId)}
                  className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-4 font-sans font-medium text-slate-900 dark:text-zinc-100">
                    <span className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1">
                      {sub.problemTitle}
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <VerdictBadge verdict={sub.verdict} size="sm" />
                  </td>
                  <td className="py-2.5 px-4 uppercase text-slate-600 dark:text-zinc-400 text-[11px]">
                    {sub.language}
                  </td>
                  <td className="py-2.5 px-4 text-slate-800 dark:text-zinc-200">
                    {sub.executionTimeMs} ms
                  </td>
                  <td className="py-2.5 px-4 text-slate-800 dark:text-zinc-200">
                    {(sub.memoryKb / 1024).toFixed(1)} MB
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-400 text-[11px]">
                    {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
