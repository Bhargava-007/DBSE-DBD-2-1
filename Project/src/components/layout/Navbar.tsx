import React, { useState } from 'react';
import { useJudge } from '../../context/JudgeContext';
import type { ActivePage } from '../../context/JudgeContext';
import { 
  Code2, 
  Trophy, 
  Radio, 
  FileText, 
  Search, 
  Sun, 
  Moon, 
  Bell, 
  ChevronDown, 
  LayoutDashboard, 
  LogOut 
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    setCurrentUser, 
    activePage, 
    navigateToPage, 
    setIsCommandPaletteOpen,
    setIsAuthModalOpen,
    setAuthModalMode,
    theme,
    toggleTheme
  } = useJudge();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navItems: { id: ActivePage; label: string; icon: React.ReactNode }[] = [
    { id: 'problems', label: 'Problems', icon: <Code2 className="w-3.5 h-3.5" /> },
    { id: 'contests', label: 'Contests', icon: <Trophy className="w-3.5 h-3.5" /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Radio className="w-3.5 h-3.5" /> },
    { id: 'submissions', label: 'Submissions', icon: <FileText className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full h-16 border-b border-slate-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-full flex items-center justify-between gap-6">
        
        {/* Left: Brand mark & Understated Nav tabs */}
        <div className="flex items-center gap-8">
          <button 
            onClick={() => navigateToPage('problems')}
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            {/* Minimalist Geometric Brand Mark */}
            <div className="w-7 h-7 rounded-md bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 shadow-subtle transition-transform duration-150 group-hover:scale-105">
              <svg 
                className="w-4 h-4" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <span className="font-semibold tracking-tight text-slate-900 dark:text-zinc-50 text-[15px]">
              AlgoFlow
            </span>
          </button>

          {/* Understated Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const isActive = activePage === item.id || (item.id === 'problems' && activePage === 'problem-detail');
              return (
                <button
                  key={item.id}
                  onClick={() => navigateToPage(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 dark:bg-zinc-800 dark:text-zinc-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right side: Search, Theme Toggle, Notifications, User */}
        <div className="flex items-center gap-2.5">
          
          {/* Linear-Style Search Trigger */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex items-center gap-3 px-3 py-1.5 rounded-md bg-slate-100/70 hover:bg-slate-100 dark:bg-zinc-900/80 dark:hover:bg-zinc-800 border border-slate-200/60 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 text-xs transition-colors duration-150"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline font-normal text-[12px]">Search problems...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center font-mono text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 shadow-2xs">
              ⌘K
            </kbd>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-md text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors duration-150"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* Notifications Bell */}
          <button
            onClick={() => alert('No new notifications')}
            aria-label="Notifications"
            className="p-2 rounded-md text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors duration-150 hidden sm:inline-flex"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* User Profile Pill or Sign in */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-full bg-slate-100/70 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors duration-150"
              >
                <div className="w-6 h-6 rounded-full bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 flex items-center justify-center text-[10px] font-bold">
                  {currentUser.username.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-medium text-slate-900 dark:text-zinc-100 leading-none">
                    {currentUser.username}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5 font-mono text-[10px] text-slate-500 dark:text-zinc-400 tabular-nums">
                    <span className="text-slate-700 dark:text-zinc-300 font-medium">{currentUser.rating}</span>
                    <span>•</span>
                    <span>#{currentUser.rank}</span>
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-elevated py-1.5 z-50 divide-y divide-slate-100 dark:divide-zinc-800">
                    <div className="px-3.5 py-2.5">
                      <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100">{currentUser.name}</p>
                      <p className="text-2xs text-slate-500 dark:text-zinc-400 truncate">{currentUser.email}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-2xs font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 font-medium tabular-nums">
                          Rating {currentUser.rating}
                        </span>
                        <span className="text-2xs text-slate-400">•</span>
                        <span className="text-2xs text-slate-500 dark:text-zinc-400">Rank #{currentUser.rank}</span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          navigateToPage('dashboard');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 font-medium"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
                        <span>Developer Dashboard</span>
                      </button>
                      <button
                        onClick={() => {
                          navigateToPage('submissions');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 font-medium"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>Submissions ({currentUser.solvedCount} Solved)</span>
                      </button>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setCurrentUser(null);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAuthModalMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthModalMode('register');
                  setIsAuthModalOpen(true);
                }}
                className="px-3.5 py-1.5 text-xs font-medium rounded-md bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-slate-900 shadow-subtle transition-colors duration-150"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
