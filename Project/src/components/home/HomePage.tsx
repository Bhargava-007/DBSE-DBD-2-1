import React from 'react';
import { useJudge } from '../../context/JudgeContext';
import { DifficultyBadge } from '../common/DifficultyBadge';
import { VerdictBadge } from '../common/VerdictBadge';

export const HomePage: React.FC = () => {
  const { 
    problems, 
    submissions, 
    navigateToProblem, 
    navigateToPage 
  } = useJudge();

  const dailyProblem = problems.find(p => p.id === 'prob-1') || problems[0] || {
    id: 'prob-1',
    title: 'Two Sum',
    difficulty: 'Easy',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    tags: ['Array', 'Hash Table']
  };

  const recentSubmissions = submissions.slice(0, 5);

  const steps = [
    {
      num: '01',
      title: 'Pick a Problem',
      desc: 'Browse algorithmic challenges across arrays, dynamic programming, graphs, and data structures.'
    },
    {
      num: '02',
      title: 'Write Your Solution',
      desc: 'Code in C++, Python, Java, or JavaScript with custom test cases and instant execution.'
    },
    {
      num: '03',
      title: 'Get Instant Feedback',
      desc: 'Receive automated verdicts, precise execution runtimes, and memory analytics in milliseconds.'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8 page-fade">
      
      {/* Row 1 — Hero (full width card, padding 48px) */}
      <section className="card p-8 sm:p-12">
        <div className="space-y-3 max-w-2xl">
          <div>
            <span className="badge badge-accent">Online Judge</span>
          </div>

          <h1 className="text-3xl sm:text-[48px] font-bold text-[var(--text-1)] tracking-[-0.03em] leading-[1.1] pt-1">
            Practice. Compete. Improve.
          </h1>

          <p className="text-[16px] text-[var(--text-2)] pt-2 leading-relaxed font-normal">
            Solve algorithmic challenges, compete in live contests, track your growth.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-6">
            <button
              onClick={() => navigateToPage('problems')}
              className="btn-primary"
            >
              Start Practicing →
            </button>

            <button
              onClick={() => navigateToPage('contests')}
              className="btn-secondary"
            >
              View Contests
            </button>
          </div>
        </div>
      </section>

      {/* Row 2 — Stats bento (4 equal cards side by side) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-5 sm:p-6 space-y-1">
          <div className="text-[32px] font-bold text-[var(--text-1)] tabular-nums leading-none">
            {problems.length}
          </div>
          <div className="text-[12px] text-[var(--text-2)] font-medium">Problems</div>
        </div>

        <div className="card p-5 sm:p-6 space-y-1">
          <div className="text-[32px] font-bold text-[var(--text-1)] tabular-nums leading-none">
            2
          </div>
          <div className="text-[12px] text-[var(--text-2)] font-medium">Contests</div>
        </div>

        <div className="card p-5 sm:p-6 space-y-1">
          <div className="text-[32px] font-bold text-[var(--text-1)] tabular-nums leading-none">
            4
          </div>
          <div className="text-[12px] text-[var(--text-2)] font-medium">Languages</div>
        </div>

        <div className="card p-5 sm:p-6 space-y-1">
          <div className="text-[32px] font-bold text-[var(--text-1)] leading-none">
            Live
          </div>
          <div className="text-[12px] text-[var(--text-2)] font-medium">Leaderboard</div>
        </div>
      </section>

      {/* Row 3 — Two columns (60/40 split) */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        
        {/* Left: Daily Challenge card (60% -> col-span-3) */}
        <div className="lg:col-span-3 card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-[var(--text-1)]">
                  Daily Challenge
                </span>
                <span className="text-[12px] text-[var(--text-3)]">
                  · Refreshes every 24 hours
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <h3 className="text-[16px] font-semibold text-[var(--text-1)]">
                {dailyProblem.title.replace(/^prob-\d+\.\s*/i, '')}
              </h3>
              <DifficultyBadge difficulty={dailyProblem.difficulty} />
            </div>

            <p className="text-[13px] text-[var(--text-2)] line-clamp-2 leading-relaxed">
              {dailyProblem.description.split('\n')[0]}
            </p>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {dailyProblem.tags.map(tag => (
                <span key={tag} className="tag-pill">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigateToProblem(dailyProblem.id)}
              className="btn-primary"
            >
              Solve Challenge →
            </button>
          </div>
        </div>

        {/* Right: Active Contest card (40% -> col-span-2) */}
        <div className="lg:col-span-2 card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="badge badge-accent gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] pulse-dot" />
                Live Now
              </span>
              <span className="text-[11px] text-[var(--text-3)]">
                Round 1
              </span>
            </div>

            <div>
              <h3 className="text-[16px] font-semibold text-[var(--text-1)]">
                Bi-Weekly Contest 28
              </h3>
              <p className="text-[13px] text-[var(--text-2)] mt-1">
                4 Problems · 90 Minutes · Rating Updates
              </p>
            </div>

            <div className="text-[12px] text-[var(--text-3)]">
              Ends in <span className="text-[var(--text-2)] font-mono">01:45:20</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigateToPage('contests')}
              className="btn-primary"
            >
              Enter Contest →
            </button>
          </div>
        </div>

      </section>

      {/* Row 4 — How It Works (3 equal columns) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map(item => (
          <div key={item.num} className="card p-6 space-y-2">
            <div className="text-[11px] font-semibold text-[var(--text-3)] font-mono">
              {item.num}
            </div>
            <h4 className="text-[15px] font-semibold text-[var(--text-1)]">
              {item.title}
            </h4>
            <p className="text-[13px] text-[var(--text-2)] leading-relaxed line-clamp-2">
              {item.desc}
            </p>
          </div>
        ))}
      </section>

      {/* Row 5 — Live Submission Feed (full width card) */}
      <section className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <div className="section-label">
            Recent Submissions
          </div>

          <button
            onClick={() => navigateToPage('submissions')}
            className="text-[12px] text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors"
          >
            View all →
          </button>
        </div>

        {recentSubmissions.length === 0 ? (
          <div className="py-12 text-center text-[13px] text-[var(--text-3)]">
            No submissions yet.
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {recentSubmissions.map(sub => (
              <div 
                key={sub.id} 
                onClick={() => navigateToProblem(sub.problemId)}
                className="px-6 py-3.5 min-h-[52px] flex items-center justify-between text-[13px] hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <VerdictBadge verdict={sub.verdict} />
                  <span className="font-medium text-[var(--text-1)] hover:text-[var(--accent)] transition-colors">
                    {sub.problemTitle.replace(/^prob-\d+\.\s*/i, '')}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-[12px] text-[var(--text-2)] font-mono tabular-nums">
                  <span className="uppercase">{sub.language}</span>
                  <span>{sub.executionTimeMs}ms</span>
                  <span className="text-[var(--text-3)] text-[11px]">
                    {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

