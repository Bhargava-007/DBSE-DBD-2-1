import React, { useState, useEffect } from 'react';
import { MOCK_CONTESTS } from '../../mock/mockContests';
import { useJudge } from '../../context/JudgeContext';
import { getContests, registerForContest } from '../../api/contests';
import type { Contest } from '../../types/judge';
import { Check } from 'lucide-react';

export const ContestsView: React.FC = () => {
  const { navigateToPage, navigateToProblem } = useJudge();
  const [contests, setContests] = useState<Contest[]>(MOCK_CONTESTS);
  const [registeredContests, setRegisteredContests] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadAllContests = async () => {
      try {
        const liveData = await getContests();
        if (liveData && liveData.length > 0) {
          setContests(liveData);
        }
      } catch {
        console.warn('[ContestsView] Backend unavailable, displaying seeded tournaments.');
      }
    };
    loadAllContests();
  }, []);

  const liveContests = contests.filter(c => c.status === 'Live');
  const upcomingContests = contests.filter(c => c.status === 'Upcoming');
  const pastContests = contests.filter(c => c.status === 'Ended');

  const handleToggleRegister = async (contestId: string) => {
    const willRegister = !registeredContests[contestId];
    setRegisteredContests(prev => ({
      ...prev,
      [contestId]: willRegister
    }));

    if (willRegister) {
      try {
        await registerForContest(contestId);
      } catch {
        console.warn(`[ContestsView] Offline registration applied for ${contestId}`);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 page-fade">
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[20px] font-semibold text-[var(--text-1)]">
              Contests
            </h1>
            {liveContests.length > 0 && (
              <span className="text-[12px] text-[var(--text-2)] font-medium flex items-center gap-1.5 ml-2">
                <span className="w-2 h-2 rounded-full bg-[var(--green)] pulse-dot" />
                Live Round Active
              </span>
            )}
          </div>
          <p className="text-[13px] text-[var(--text-2)] mt-1">
            Timed algorithmic competitions with real-time scoring and rating adjustments.
          </p>
        </div>

        <button
          onClick={() => navigateToPage('leaderboard')}
          className="btn-secondary self-start sm:self-auto"
        >
          Global Leaderboard →
        </button>
      </div>

      {/* Live Section */}
      {liveContests.length > 0 && (
        <div className="space-y-3">
          <div className="section-label">
            Live
          </div>

          <div className="space-y-4">
            {liveContests.map(contest => (
              <div 
                key={contest.id}
                className="card p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="badge badge-accent gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] pulse-dot" />
                        Live Now
                      </span>
                      <h3 className="text-[18px] font-semibold text-[var(--text-1)]">
                        {contest.title}
                      </h3>
                    </div>
                    <p className="text-[13px] text-[var(--text-2)]">
                      Started {new Date(contest.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Concludes {new Date(contest.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <button
                    onClick={() => navigateToProblem(contest.problemIds[0])}
                    className="btn-primary shrink-0"
                  >
                    Enter Contest →
                  </button>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-[var(--border)] text-[13px] text-[var(--text-2)]">
                  <span>{contest.durationMinutes} mins</span>
                  <span>·</span>
                  <span>{contest.participantCount.toLocaleString()} Contestants</span>
                  <span>·</span>
                  <span>{contest.problemIds.length} Problems</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Section */}
      <div className="space-y-3">
        <div className="section-label">
          Upcoming
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingContests.map(contest => {
            const isRegistered = registeredContests[contest.id];
            return (
              <div 
                key={contest.id}
                className="card p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[13px] font-medium text-[var(--text-1)]">
                      {contest.title}
                    </h3>
                    <span className="text-[12px] text-[var(--text-2)] font-mono">
                      {new Date(contest.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="text-[12px] text-[var(--text-2)]">
                    {contest.durationMinutes} mins · {contest.participantCount.toLocaleString()} Registered
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                  <span className="text-[12px] text-[var(--text-3)]">Scheduled</span>
                  <button 
                    onClick={() => handleToggleRegister(contest.id)}
                    className={isRegistered ? "btn-secondary py-1 px-3 text-xs" : "btn-primary py-1 px-3 text-xs"}
                  >
                    {isRegistered && <Check className="w-3 h-3" />}
                    <span>{isRegistered ? 'Registered' : 'Register'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Past Section */}
      <div className="space-y-3">
        <div className="section-label">
          Past
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-[var(--border)] section-label h-[36px]">
                  <th className="px-5">Tournament</th>
                  <th className="px-5">Date</th>
                  <th className="px-5">Participants</th>
                  <th className="px-5">Problems</th>
                  <th className="px-5 text-right">Standings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {pastContests.map((c, idx) => (
                  <tr 
                    key={c.id} 
                    className={`h-[52px] hover:bg-[var(--bg-hover)] transition-colors ${
                      idx % 2 === 1 ? 'bg-[var(--bg-card)]' : 'bg-transparent'
                    }`}
                  >
                    <td className="px-5 font-medium text-[var(--text-1)]">
                      {c.title}
                    </td>
                    <td className="px-5 text-[var(--text-2)]">
                      {new Date(c.startTime).toLocaleDateString()}
                    </td>
                    <td className="px-5 text-[var(--text-2)]">
                      {c.participantCount.toLocaleString()}
                    </td>
                    <td className="px-5 text-[var(--text-2)]">
                      {c.problemIds.length} Challenges
                    </td>
                    <td className="px-5 text-right">
                      <button
                        onClick={() => navigateToPage('leaderboard')}
                        className="text-[var(--accent)] hover:underline text-[12px] font-medium"
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


