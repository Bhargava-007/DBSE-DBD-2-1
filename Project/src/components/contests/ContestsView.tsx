import React, { useState } from 'react';
import { MOCK_CONTESTS } from '../../mock/mockContests';
import { useJudge } from '../../context/JudgeContext';
import { 
  Trophy, 
  Clock, 
  Users, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2,
  Check
} from 'lucide-react';

export const ContestsView: React.FC = () => {
  const { navigateToPage, navigateToProblem } = useJudge();
  const [registeredContests, setRegisteredContests] = useState<Record<string, boolean>>({});

  const liveContests = MOCK_CONTESTS.filter(c => c.status === 'Live');
  const upcomingContests = MOCK_CONTESTS.filter(c => c.status === 'Upcoming');
  const pastContests = MOCK_CONTESTS.filter(c => c.status === 'Ended');

  const handleToggleRegister = (contestId: string) => {
    setRegisteredContests(prev => ({
      ...prev,
      [contestId]: !prev[contestId]
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
              Contests & Competitions
            </h1>
            {liveContests.length > 0 && (
              <span className="text-[11px] font-mono font-semibold px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Round Active
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Scheduled rated tournaments with real-time scoring, live rankings, and automated test penalty evaluation.
          </p>
        </div>

        <button
          onClick={() => navigateToPage('leaderboard')}
          className="self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-200 transition-colors shadow-2xs"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span>Global Leaderboard</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
        </button>
      </div>

      {/* Live Contests Arena */}
      {liveContests.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-mono">
              Live Contest Arena
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {liveContests.map(contest => (
              <div 
                key={contest.id}
                className="p-5 rounded-lg bg-white dark:bg-zinc-900 border border-emerald-300 dark:border-emerald-800/60 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        {contest.bannerBadge || 'LIVE'}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-zinc-50">{contest.title}</h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
                      Started {new Date(contest.startTime).toLocaleTimeString()} • Concludes {new Date(contest.endTime).toLocaleTimeString()}
                    </p>
                  </div>

                  <button
                    onClick={() => navigateToProblem(contest.problemIds[0])}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <span>Enter Contest Arena</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Duration: <strong className="text-slate-900 dark:text-zinc-100 font-sans">{contest.durationMinutes}m</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Contestants: <strong className="text-slate-900 dark:text-zinc-100 font-sans">{contest.participantCount.toLocaleString()}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Integrity Guard: <strong className="text-emerald-700 dark:text-emerald-400 font-sans">Active</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Problems: <strong className="text-slate-900 dark:text-zinc-100 font-sans">{contest.problemIds.length}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Contests */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-mono">
          Upcoming Tournaments
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingContests.map(contest => {
            const isRegistered = registeredContests[contest.id];
            return (
              <div 
                key={contest.id}
                className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium px-2 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300">
                      {contest.bannerBadge}
                    </span>
                    <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 font-mono">
                      {new Date(contest.startTime).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-50">{contest.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400 font-mono">
                    <span>Duration: {contest.durationMinutes} mins</span>
                    <span>•</span>
                    <span>{contest.participantCount.toLocaleString()} Registered</span>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">Scheduled in 4 days</span>
                  <button 
                    onClick={() => handleToggleRegister(contest.id)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                      isRegistered
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-slate-900'
                    }`}
                  >
                    {isRegistered && <Check className="w-3 h-3" />}
                    <span>{isRegistered ? 'Registered' : 'Register Now'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Past Contests Table */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-mono">
          Past Contest Archives
        </h2>

        <div className="rounded-lg bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Tournament Round</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Participants</th>
                  <th className="py-2.5 px-3">Problems</th>
                  <th className="py-2.5 px-3 text-right">Standings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                {pastContests.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-zinc-100">
                      {c.title}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 dark:text-zinc-400 font-mono text-xs">
                      {new Date(c.startTime).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-300 font-mono">
                      {c.participantCount.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-300">
                      {c.problemIds.length} Challenges
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => navigateToPage('leaderboard')}
                        className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-semibold font-mono"
                      >
                        Rankings →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

