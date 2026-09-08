import React from 'react';
import { MOCK_LEADERBOARD } from '../../mock/mockContests';
import { useJudge } from '../../context/JudgeContext';
import { ArrowLeft, Radio } from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const { navigateToPage, currentUser } = useJudge();

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-700/60 flex items-center justify-center font-bold text-[11px]">
            1
          </span>
        );
      case 2:
        return (
          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 border border-slate-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 flex items-center justify-center font-bold text-[11px]">
            2
          </span>
        );
      case 3:
        return (
          <span className="w-5 h-5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/40 flex items-center justify-center font-bold text-[11px]">
            3
          </span>
        );
      default:
        return <span className="font-mono text-xs text-slate-500 dark:text-zinc-400 tabular-nums">#{rank}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigateToPage('contests')}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 p-1 -ml-1 rounded-md"
              title="Back to Contests"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
              Global CodeSprint 2026
            </h1>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              Official Ladder
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Real-time ranked tournament scoreboard calculated with standard ICPC/competitive penalty rules.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <div className="px-2.5 py-1 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center gap-1.5 text-slate-600 dark:text-zinc-400 shadow-2xs">
            <Radio className="w-3 h-3 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span>Connection: <strong className="text-emerald-700 dark:text-emerald-400 font-sans">Live WebSocket</strong></span>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-lg bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider font-sans">
                <th className="py-2.5 px-3 w-14 text-center">Rank</th>
                <th className="py-2.5 px-3">Contestant</th>
                <th className="py-2.5 px-3 w-24 text-center">Score</th>
                <th className="py-2.5 px-3 w-24 text-center">Penalty</th>
                <th className="py-2.5 px-3 w-24 text-center">P1 (Two Sum)</th>
                <th className="py-2.5 px-3 w-24 text-center">P2 (Add Two)</th>
                <th className="py-2.5 px-3 w-24 text-center">P3 (Course Sched)</th>
                <th className="py-2.5 px-3 w-24 text-center">P4 (Median 2)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-mono">
              {MOCK_LEADERBOARD.map(entry => {
                const isCurrentUser = entry.user.id === currentUser?.id;
                return (
                  <tr 
                    key={entry.rank}
                    className={`transition-colors ${
                      isCurrentUser 
                        ? 'bg-slate-100/90 dark:bg-zinc-800/80 border-l-2 border-l-slate-900 dark:border-l-white' 
                        : 'hover:bg-slate-50 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center">
                        {getRankBadge(entry.rank)}
                      </div>
                    </td>

                    {/* Contestant */}
                    <td className="py-2.5 px-3 font-sans">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center font-bold text-[11px] text-slate-700 dark:text-zinc-200 shrink-0">
                          {entry.user.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900 dark:text-zinc-100">
                              {entry.user.name}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              @{entry.user.username}
                            </span>
                            {isCurrentUser && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-800 dark:bg-zinc-700 dark:text-zinc-200">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-sans">
                            {entry.user.institution} • Rating: <strong className="font-mono text-slate-700 dark:text-zinc-300">{entry.user.rating}</strong>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Score */}
                    <td className="py-2.5 px-3 text-center font-bold text-slate-900 dark:text-zinc-100 text-sm tabular-nums">
                      {entry.score}
                    </td>

                    {/* Penalty */}
                    <td className="py-2.5 px-3 text-center text-slate-600 dark:text-zinc-400 text-xs tabular-nums">
                      {entry.penaltyMinutes}m
                    </td>

                    {/* Problem Columns */}
                    {['prob-1', 'prob-2', 'prob-7', 'prob-4'].map(pid => {
                      const res = entry.problemResults[pid];
                      return (
                        <td key={pid} className="py-2.5 px-3 text-center">
                          {res?.solved ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="px-1.5 py-0.2 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-400 text-[11px] font-bold">
                                +{res.attempts}
                              </span>
                              <span className="text-[10px] text-slate-400 mt-0.5">{res.timeMinutes}m</span>
                            </div>
                          ) : res && res.attempts > 0 ? (
                            <span className="px-1.5 py-0.2 rounded bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/60 dark:border-rose-800/60 dark:text-rose-400 text-[11px] font-bold">
                              -{res.attempts}
                            </span>
                          ) : (
                            <span className="text-slate-300 dark:text-zinc-700 text-xs">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

