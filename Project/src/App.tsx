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
import { Code2, ShieldCheck } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-1)] selection:bg-[var(--accent-dim)] selection:text-[var(--text-1)] transition-colors duration-150 font-sans">
      {/* Navbar — Hidden when in problem-detail workspace */}
      {!isWorkspace && <Navbar />}

      {/* Main Content View */}
      <main className="flex-1 flex flex-col">
        {renderActiveView()}
      </main>

      {/* Editorial footer (hidden in problem workspace to give maximum code editor space) */}
      {!isWorkspace && (
        <footer className="border-t border-[var(--border)] bg-[var(--bg-card)] mt-auto py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-[var(--text-3)]">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-[var(--text-1)] font-semibold">
                <svg className="w-4 h-4 text-[var(--text-1)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
                <span>AlgoFlow</span>
              </div>
              <span>·</span>
              <span>Online Judge & Algorithmic Practice</span>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-[var(--text-3)]">
              <span className="flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5 text-[var(--text-2)]" /> Multi-Language Sandbox
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--green)]" /> Automated Evaluation
              </span>
              <span>·</span>
              <span>Fast & Deterministic</span>
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

