import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJudge } from '../../context/JudgeContext';
import { ArrowLeft, Trophy } from 'lucide-react';
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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const activeContestId = id || contestId;

  const { currentUser } = useJudge();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Fetch initial standings via REST API
  const fetchLeaderboardData = async () => {
    try {
      const response = await getLeaderboard(activeContestId);
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

    joinContest(activeContestId);

    // Real-time broadcast listener
    const unsubscribe = onLeaderboardUpdate((update) => {
      if (update && update.contestId === activeContestId) {
        fetchLeaderboardData();
      }
    });

    return () => {
      unsubscribe();
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      leaveContest(activeContestId);
    };
  }, [activeContestId]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 page-fade text-[var(--bone)]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/contests')}
              className="text-[var(--text-3)] hover:text-[var(--bone)] p-1.5 -ml-1.5 rounded-[var(--r-sm)] hover:bg-[var(--ash)] transition-colors cursor-pointer"
              title="Back to Contests"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-2xl font-bold text-[var(--bone)] tracking-tight">
              {contestTitle}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--accent-dim)] border border-[var(--accent-border)] text-xs font-mono font-semibold text-[var(--verdigris)]">
              Standings
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-2)]">
            Real-time ICPC scoreboard with penalty time calculations and verified evaluations.
          </p>
        </div>

        {/* Live WebSocket Status Indicator */}
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-2)] self-start sm:self-auto">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[var(--green)] pulse-dot' : 'bg-[var(--text-3)]'}`} />
          <span>{isConnected ? 'LIVE FEED ACTIVE' : 'OFFLINE SYNC'}</span>
        </div>
      </div>

      {/* Leaderboard Body */}
      {leaderboard.length === 0 ? (
        <div className="card py-20 px-6 text-center space-y-3 bg-[var(--carbon)] border-[var(--border)]">
          <div className="w-12 h-12 rounded-full bg-[var(--ash)] border border-[var(--border)] flex items-center justify-center mx-auto text-[var(--verdigris)]">
            <Trophy className="w-5 h-5 text-[var(--verdigris)]" />
          </div>
          <h3 className="text-base font-bold text-[var(--bone)] tracking-tight">
            No rankings yet
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-2)] max-w-sm mx-auto">
            Be the first contestant to submit in this tournament round.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden bg-[var(--carbon)] border-[var(--border)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--ash)] text-xs font-mono text-[var(--text-3)] uppercase tracking-wider h-9">
                  <th className="px-4 w-14 text-center font-medium">Rank</th>
                  <th className="px-4 font-medium">Contestant</th>
                  <th className="px-4 w-20 text-center font-medium">Score</th>
                  <th className="px-4 w-20 text-center font-medium">Penalty</th>
                  <th className="px-4 w-24 text-center font-medium">P1</th>
                  <th className="px-4 w-24 text-center font-medium">P2</th>
                  <th className="px-4 w-24 text-center font-medium">P3</th>
                  <th className="px-4 w-24 text-center font-medium">P4</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {leaderboard.map(entry => {
                  const isCurrentUser = entry.user.id === currentUser?.id;
                  
                  const rankColor = 
                    entry.rank === 1 ? 'text-[var(--amber)] font-bold' :
                    entry.rank === 2 || entry.rank === 3 ? 'text-[var(--verdigris)] font-semibold' :
                    'text-[var(--text-3)] font-medium';

                  return (
                    <tr 
                      key={entry.rank}
                      className={`h-[52px] hover:bg-[var(--ash)] transition-colors border-b border-[var(--border)] last:border-0 ${
                        isCurrentUser ? 'bg-[var(--accent-dim)]/40 hover:bg-[var(--ash)]' : ''
                      }`}
                    >
                      {/* Rank Numeral */}
                      <td className={`px-4 text-center font-mono text-xs ${rankColor}`}>
                        {entry.rank}
                      </td>

                      {/* Contestant */}
                      <td className="px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-[var(--ash)] border border-[var(--border)] flex items-center justify-center font-mono font-semibold text-xs text-[var(--bone)] shrink-0">
                            {entry.user.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-semibold text-[var(--bone)] text-sm truncate">
                              {entry.user.name}
                            </span>
                            <span className="text-xs text-[var(--text-3)] font-mono truncate">
                              @{entry.user.username}
                            </span>
                            {isCurrentUser && (
                              <span className="px-1.5 py-0.2 rounded bg-[var(--accent-dim)] border border-[var(--accent-border)] text-[10px] font-mono text-[var(--verdigris)] font-bold">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Score */}
                      <td className="px-4 text-center font-bold text-[var(--bone)] tabular-nums font-mono text-sm">
                        {entry.score}
                      </td>

                      {/* Penalty */}
                      <td className="px-4 text-center text-[var(--text-2)] font-mono text-xs tabular-nums">
                        {entry.penaltyMinutes}m
                      </td>

                      {/* Problem Columns */}
                      {['prob-1', 'prob-2', 'prob-7', 'prob-4'].map(pid => {
                        const res = entry.problemResults[pid];
                        return (
                          <td key={pid} className="px-4 text-center font-mono text-xs">
                            {res?.solved ? (
                              <span className="text-[var(--green)] font-semibold">
                                +{res.attempts}
                              </span>
                            ) : res && res.attempts > 0 ? (
                              <span className="text-[var(--red)]">
                                -{res.attempts}
                              </span>
                            ) : (
                              <span className="text-[var(--text-4)]">—</span>
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
