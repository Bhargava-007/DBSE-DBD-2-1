import React, { useState } from 'react';
import { useJudge } from '../../context/JudgeContext';
import type { ActivePage } from '../../context/JudgeContext';
import { 
  Search, 
  Sun, 
  Moon, 
  LayoutDashboard, 
  FileText,
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

  const navItems: { id: ActivePage; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'problems', label: 'Problems' },
    { id: 'contests', label: 'Contests' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'submissions', label: 'Submissions' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full h-[48px] border-b border-[var(--border)] bg-[var(--bg-canvas)] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        
        {/* Left: Brand mark & Nav tabs */}
        <div className="flex items-center gap-8 h-full">
          <button 
            onClick={() => navigateToPage('home')}
            className="flex items-center gap-2 text-[var(--text-1)] focus:outline-none"
          >
            <svg 
              className="w-4 h-4 text-[var(--text-1)]" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            <span className="font-semibold text-[14px] tracking-tight text-[var(--text-1)]">
              AlgoFlow
            </span>
          </button>

          {/* Nav Links: 13px, text-2 default, text-1 active, 2px bottom border on active */}
          <nav className="hidden md:flex items-center gap-6 h-full">
            {navItems.map(item => {
              const isActive = activePage === item.id || (item.id === 'problems' && activePage === 'problem-detail');
              return (
                <button
                  key={item.id}
                  onClick={() => navigateToPage(item.id)}
                  className={`relative h-full flex items-center text-[13px] transition-colors ${
                    isActive
                      ? 'text-[var(--text-1)] font-medium'
                      : 'text-[var(--text-2)] hover:text-[var(--text-1)]'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--accent)]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right side: Search pill, Theme toggle, User */}
        <div className="flex items-center gap-3">
          
          {/* 180px search pill with ⌘K badge */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="w-[180px] h-[30px] flex items-center justify-between px-2.5 rounded-[6px] bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-3)] hover:text-[var(--text-2)] text-xs transition-colors"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-[var(--text-3)]" />
              <span className="text-[12px] text-[var(--text-3)]">Search...</span>
            </div>
            <kbd className="inline-flex items-center font-mono text-[10px] px-1 rounded bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-3)]">
              ⌘K
            </kbd>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-1 rounded-[var(--r-sm)] text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--bg-hover)] transition-colors"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </button>

          {/* User Avatar Circle (28px) or Sign in */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-7 h-7 rounded-full bg-[var(--bg-active)] border border-[var(--border-mid)] text-[var(--text-1)] flex items-center justify-center text-[12px] font-medium hover:border-[var(--border-strong)] transition-colors"
              >
                {currentUser.username.substring(0, 2).toUpperCase()}
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-52 rounded-[var(--r-lg)] bg-[var(--bg-elevated)] border border-[var(--border-mid)] shadow-[var(--shadow-lg)] py-1.5 z-50 divide-y divide-[var(--border)]">
                    <div className="px-3 py-2">
                      <p className="text-xs font-medium text-[var(--text-1)]">{currentUser.name}</p>
                      <p className="text-[11px] text-[var(--text-3)] truncate">@{currentUser.username}</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          navigateToPage('dashboard');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--bg-hover)]"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-[var(--text-3)]" />
                        <span>Profile & Stats</span>
                      </button>
                      <button
                        onClick={() => {
                          navigateToPage('submissions');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--bg-hover)]"
                      >
                        <FileText className="w-3.5 h-3.5 text-[var(--text-3)]" />
                        <span>Submissions</span>
                      </button>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setCurrentUser(null);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--red)] hover:bg-[var(--bg-hover)]"
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
                className="btn-secondary py-1 px-2.5 text-xs"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthModalMode('register');
                  setIsAuthModalOpen(true);
                }}
                className="btn-primary py-1 px-2.5 text-xs"
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
