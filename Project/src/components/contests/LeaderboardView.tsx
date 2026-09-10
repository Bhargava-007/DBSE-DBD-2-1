import React, { useState, useEffect } from 'react';
import { useJudge } from '../../context/JudgeContext';
import { ArrowLeft } from 'lucide-react';
import { getLeaderboard } from '../../api/contests';
import { 
  getContestSocket, 
  joinContest, 
  leaveContest, 
  onLeaderboardUpdate 
} from '../../socket/contestSocket';
import type { LeaderboardEntry } from '../../types/judge';

interface LeaderboardViewProps {
  contestId?: string;
  contestTitle?: string;
}

const FAKE_USERNAMES = new Set(['tourist', 'ecnerwala', 'benq', 'radewoosh', 'jiangly', 'petr', 'maroonrk']);

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  contestId = 'cnt-411',
  contestTitle = 'Global CodeSprint 2026',
}) => {
  const { navigateToPage, currentUser } = useJudge();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Fetch initial standings via REST API
  const fetchLeaderboardData = async () => {
    try {
      const response = await getLeaderboard(contestId);
      if (response.entries && response.entries.length > 0) {
        // Filter out fake hardcoded accounts
        const realEntries = response.entries.filter(
          entry => !FAKE_USERNAMES.has(entry.user.username.toLowerCase())
        );
        setLeaderboard(realEntries);
      } else {
        setLeaderboard([]);
      }
    } catch {
      setLeaderboard([]);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();

    // Socket Connection and Room Join
    const socket = getContestSocket();
    setIsConnected(socket.connected);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    joinContest(contestId);

    // Real-time broadcast listener
    const unsubscribe = onLeaderboardUpdate((update) => {
      if (update && update.contestId === contestId) {
        fetchLeaderboardData();
      }
    });

    return () => {
      unsubscribe();
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      leaveContest(contestId);
    };
  }, [contestId]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 page-fade">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigateToPage('contests')}
              className="text-[var(--text-3)] hover:text-[var(--text-1)] p-1 -ml-1 rounded-[var(--r-sm)] transition-colors"
              title="Back to Contests"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-[20px] font-semibold text-[var(--text-1)]">
              {contestTitle}
            </h1>
            <span className="badge badge-accent">
              Standings
            </span>
          </div>
          <p className="text-[13px] text-[var(--text-2)] mt-1">
            Real-time scoreboard with standard penalty time scoring.
          </p>
        </div>

        {/* Live WebSocket Status Indicator */}
        <div className="flex items-center gap-2 text-[12px] text-[var(--text-2)]">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[var(--green)] pulse-dot' : 'bg-[var(--text-3)]'}`} />
          <span>{isConnected ? 'Live' : 'Offline'}</span>
        </div>
      </div>

      {/* Leaderboard Body */}
      {leaderboard.length === 0 ? (
        <div className="card py-20 px-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center mx-auto text-[var(--text-3)]">
            <svg 
              className="w-6 h-6 text-[var(--text-2)]" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.8" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
          </div>
          <h3 className="text-[16px] font-semibold text-[var(--text-1)]">
            No rankings yet
          </h3>
          <p className="text-[13px] text-[var(--text-2)] max-w-sm mx-auto">
            Be the first to submit in this contest.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-[var(--border)] section-label h-[36px]">
                  <th className="px-4 w-12 text-center">Rank</th>
                  <th className="px-4">Contestant</th>
                  <th className="px-4 w-20 text-center">Score</th>
                  <th className="px-4 w-20 text-center">Penalty</th>
                  <th className="px-4 w-24 text-center">P1</th>
                  <th className="px-4 w-24 text-center">P2</th>
                  <th className="px-4 w-24 text-center">P3</th>
                  <th className="px-4 w-24 text-center">P4</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {leaderboard.map(entry => {
                  const isCurrentUser = entry.user.id === currentUser?.id;
                  
                  const rankColor = 
                    entry.rank === 1 ? 'text-[var(--amber)] font-semibold' :
                    entry.rank === 2 || entry.rank === 3 ? 'text-[var(--text-2)] font-semibold' :
                    'text-[var(--text-3)]';

                  return (
                    <tr 
                      key={entry.rank}
                      className={`h-[52px] hover:bg-[var(--bg-hover)] transition-colors ${
                        isCurrentUser ? 'bg-[var(--bg-hover)]' : ''
                      }`}
                    >
                      {/* Rank Numeral */}
                      <td className={`px-4 text-center font-mono ${rankColor}`}>
                        {entry.rank}
                      </td>

                      {/* Contestant */}
                      <td className="px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[var(--bg-active)] border border-[var(--border)] flex items-center justify-center font-medium text-[11px] text-[var(--text-1)] shrink-0">
                            {entry.user.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-[var(--text-1)]">
                              {entry.user.name}
                            </span>
                            <span className="text-[12px] text-[var(--text-3)] font-mono">
                              @{entry.user.username}
                            </span>
                            {isCurrentUser && (
                              <span className="badge badge-accent ml-1 text-[10px] py-0 px-1.5">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Score */}
                      <td className="px-4 text-center font-semibold text-[var(--text-1)] tabular-nums">
                        {entry.score}
                      </td>

                      {/* Penalty */}
                      <td className="px-4 text-center text-[var(--text-2)] font-mono text-[12px] tabular-nums">
                        {entry.penaltyMinutes}m
                      </td>

                      {/* Problem Columns */}
                      {['prob-1', 'prob-2', 'prob-7', 'prob-4'].map(pid => {
                        const res = entry.problemResults[pid];
                        return (
                          <td key={pid} className="px-4 text-center font-mono text-[12px]">
                            {res?.solved ? (
                              <span className="text-[var(--green)]">
                                +{res.attempts}
                              </span>
                            ) : res && res.attempts > 0 ? (
                              <span className="text-[var(--red)]">
                                -{res.attempts}
                              </span>
                            ) : (
                              <span className="text-[var(--text-3)]">—</span>
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
      )}

    </div>
  );
};


