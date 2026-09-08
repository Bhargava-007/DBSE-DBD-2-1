import React from 'react';
import { JudgeProvider, useJudge } from './context/JudgeContext';
import { Navbar } from './components/layout/Navbar';
import { CommandPalette } from './components/layout/CommandPalette';
import { AuthModal } from './components/auth/AuthModal';
import { HomePage } from './components/home/HomePage';
import { ProblemCatalog } from './components/problems/ProblemCatalog';
import { ProblemWorkspace } from './components/workspace/ProblemWorkspace';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { ContestsView } from './components/contests/ContestsView';
import { LeaderboardView } from './components/contests/LeaderboardView';
import { SubmissionsView } from './components/submissions/SubmissionsView';
import { Terminal, Code2, ShieldCheck } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activePage } = useJudge();

  const renderActiveView = () => {
    switch (activePage) {
      case 'home':
        return <HomePage />;
      case 'problem-detail':
        return <ProblemWorkspace />;
      case 'dashboard':
        return <UserDashboard />;
      case 'contests':
        return <ContestsView />;
      case 'leaderboard':
        return <LeaderboardView />;
      case 'submissions':
        return <SubmissionsView />;
      case 'problems':
      default:
        return <ProblemCatalog />;
    }
  };

  const isWorkspace = activePage === 'problem-detail';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-100 selection:bg-blue-500/20 selection:text-blue-700 dark:selection:bg-blue-500/30 dark:selection:text-white transition-colors duration-150">
      {/* Navbar */}
      <Navbar />

      {/* Main Content View */}
      <main className="flex-1 flex flex-col">
        {renderActiveView()}
      </main>

      {/* Editorial footer (hidden in problem workspace to give maximum code editor space) */}
      {!isWorkspace && (
        <footer className="border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 mt-auto py-6 shadow-subtle">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-zinc-400">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-slate-900 dark:text-zinc-100 font-bold">
                <Terminal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>AlgoFlow</span>
              </div>
              <span>•</span>
              <span>Modern Code Practice & Evaluation Platform</span>
            </div>

            <div className="flex items-center gap-4 text-2xs font-medium">
              <span className="flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Multi-Language Sandbox
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Automated Test Suite
              </span>
              <span>•</span>
              <span>Privacy & Terms</span>
            </div>
          </div>
        </footer>
      )}

      {/* Global Modals */}
      <CommandPalette />
      <AuthModal />
    </div>
  );
};

export function App() {
  return (
    <JudgeProvider>
      <MainContent />
    </JudgeProvider>
  );
}

export default App;
