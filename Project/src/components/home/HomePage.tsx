import React from 'react';
import { useJudge } from '../../context/JudgeContext';
import { DifficultyBadge } from '../common/DifficultyBadge';
import { VerdictBadge } from '../common/VerdictBadge';
import { 
  Trophy, 
  Cpu, 
  Terminal, 
  ArrowRight, 
  Flame, 
  CheckCircle2, 
  Layers, 
  Radio, 
  Server,
  Zap,
  Box
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { 
    problems, 
    submissions, 
    navigateToProblem, 
    navigateToPage 
  } = useJudge();

  const dailyProblem = problems.find(p => p.id === 'prob-1') || problems[0];
  const recentSubmissions = submissions.slice(0, 5);

  const pipelineStages = [
    {
      step: '01',
      title: 'Code Ingestion',
      desc: 'Monaco editor streams multi-language source payloads to API Gateway.',
      badge: 'REST / WS',
      icon: <Terminal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
    },
    {
      step: '02',
      title: 'Queue Dispatch',
      desc: 'BullMQ orchestrates priority jobs into Redis in-memory storage.',
      badge: 'Redis 7',
      icon: <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400" />
    },
    {
      step: '03',
      title: 'Docker Sandbox',
      desc: 'Isolated Linux containers run code with strict CPU & memory fences.',
      badge: 'gVisor Engine',
      icon: <Box className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
    },
    {
      step: '04',
      title: 'Verdict Evaluation',
      desc: 'Automated test suite diffs stdout vs expected output in milliseconds.',
      badge: 'Test Oracle',
      icon: <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
    },
    {
      step: '05',
      title: 'Scoreboard Update',
      desc: 'MongoDB persists audit records while Redis Sorted Sets update live ranks.',
      badge: 'O(log N)',
      icon: <Radio className="w-4 h-4 text-rose-600 dark:text-rose-400" />
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* 1. Hero Section */}
      <section className="relative rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-8 sm:p-10 shadow-xs overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
            Distributed Judging Engine v2.1 • Multi-Tenant Sandbox
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-50 leading-tight">
            High-Throughput Distributed Code Judge & Assessment Platform
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed font-normal">
            AlgoFlow executes user-submitted code in container-isolated sandboxes with Redis BullMQ job queues, real-time telemetry, and microsecond testcase evaluation across C++, Python 3, Java, and JavaScript.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => navigateToProblem(dailyProblem.id)}
              className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-slate-900 text-xs font-bold shadow-subtle flex items-center gap-2 transition-colors"
            >
              <span>Solve Daily Challenge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => navigateToPage('problems')}
              className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-semibold transition-colors"
            >
              Explore {problems.length} Problems
            </button>

            <button
              onClick={() => navigateToPage('contests')}
              className="px-4 py-2.5 rounded-lg bg-transparent hover:bg-slate-50 dark:hover:bg-zinc-800/50 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Live Tournaments</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Platform Telemetry Strip */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-2xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Worker Sandboxes</span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-zinc-50 tabular-nums">8 Active</div>
          <div className="text-2xs text-slate-500 dark:text-zinc-400">gVisor Container Isolation</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-2xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Queue Latency</span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-zinc-50 tabular-nums">84ms</div>
          <div className="text-2xs text-slate-500 dark:text-zinc-400">Redis BullMQ Job Broker</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-2xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Evaluations</span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-zinc-50 tabular-nums">12,842+</div>
          <div className="text-2xs text-slate-500 dark:text-zinc-400">Multi-Language Submissions</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-2xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            <Server className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Persistence</span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-zinc-50 tabular-nums">99.98%</div>
          <div className="text-2xs text-slate-500 dark:text-zinc-400">MongoDB Replica Set</div>
        </div>
      </section>

      {/* 3. Daily Challenge Card & Featured Contests Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Challenge Card (2 cols) */}
        <div className="lg:col-span-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                <Flame className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-100">
                  Daily Algorithm Challenge
                </h3>
                <p className="text-2xs text-slate-500 dark:text-zinc-400">Refreshed every 24 hours at 00:00 UTC</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-2xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-semibold">
              <Flame className="w-3 h-3 text-emerald-600" /> +1 Day Streak
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-400 dark:text-zinc-500">
                  {dailyProblem.id.replace('prob-', '')}.
                </span>
                <span className="text-base font-bold text-slate-900 dark:text-zinc-100">
                  {dailyProblem.title}
                </span>
                <DifficultyBadge difficulty={dailyProblem.difficulty} size="sm" />
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-xl line-clamp-2">
                {dailyProblem.description.split('\n')[0]}
              </p>
              <div className="flex items-center gap-2 pt-1">
                {dailyProblem.tags.map(tag => (
                  <span key={tag} className="text-2xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigateToProblem(dailyProblem.id)}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold shrink-0 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Solve Challenge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Contest Highlight (1 col) */}
        <div className="rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-500" /> Contest Arena
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-2xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Now
              </span>
            </div>

            <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              Weekly Contest 412
            </h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              4 Algorithmic Problems • 90 Minutes ICPC Scoring • Dynamic Rating Adjustment
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <span className="font-mono text-2xs text-slate-500 dark:text-zinc-400">
              1,248 Registered
            </span>
            <button
              onClick={() => navigateToPage('contests')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              <span>Enter Arena</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </section>

      {/* 4. Distributed Judging Pipeline (System Architecture Step Flow) */}
      <section className="rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-zinc-50">
            Distributed Execution Pipeline
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Architectural lifecycle from client code keystroke to sandboxed container evaluation and scoreboard broadcast.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {pipelineStages.map(stage => (
            <div 
              key={stage.step}
              className="p-4 rounded-lg bg-slate-50/70 dark:bg-zinc-800/50 border border-slate-200/70 dark:border-zinc-700/60 space-y-2.5 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xs font-bold text-slate-400 dark:text-zinc-500">
                  {stage.step}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 font-semibold">
                  {stage.badge}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700">
                  {stage.icon}
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                  {stage.title}
                </h4>
              </div>

              <p className="text-2xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                {stage.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Recent Platform Activity Log */}
      <section className="rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-100">
              Live Submission Stream
            </h3>
            <p className="text-2xs text-slate-500 dark:text-zinc-400">Real-time verdict telemetry across all problem sets</p>
          </div>

          <button
            onClick={() => navigateToPage('submissions')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 transition-colors"
          >
            <span>View All Submissions</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-zinc-800/60">
          {recentSubmissions.map(sub => (
            <div 
              key={sub.id} 
              className="px-6 py-3 flex items-center justify-between text-xs hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <VerdictBadge verdict={sub.verdict} size="sm" />
                <button
                  onClick={() => navigateToProblem(sub.problemId)}
                  className="font-medium text-slate-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {sub.problemTitle}
                </button>
              </div>

              <div className="flex items-center gap-4 text-2xs font-mono text-slate-500 dark:text-zinc-400 tabular-nums">
                <span className="uppercase font-semibold">{sub.language}</span>
                <span>{sub.executionTimeMs}ms</span>
                <span className="hidden sm:inline">{(sub.memoryKb / 1024).toFixed(1)}MB</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
