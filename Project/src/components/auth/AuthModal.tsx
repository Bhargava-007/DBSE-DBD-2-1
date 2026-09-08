import React, { useState } from 'react';
import { useJudge } from '../../context/JudgeContext';
import { DEMO_USERS } from '../../mock/mockUsers';
import { Lock, Mail, User, X, ArrowRight, ShieldCheck } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    authModalMode, 
    setAuthModalMode, 
    setCurrentUser 
  } = useJudge();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (authModalMode === 'login' && (!username || !password)) {
      setError('Please fill in all credentials.');
      return;
    }
    if (authModalMode === 'register' && (!username || !email || !password)) {
      setError('All fields are required.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setCurrentUser({
        id: `usr_${Math.floor(100000 + Math.random() * 900000)}`,
        username: username || 'new_coder',
        name: username || 'Developer Candidate',
        email: email || `${username.toLowerCase()}@example.com`,
        role: 'user',
        rating: 1500,
        rank: 450,
        solvedCount: 12,
        easySolved: 8,
        mediumSolved: 4,
        hardSolved: 0,
        institution: 'Global',
        createdAt: new Date().toISOString(),
      });
      setIsLoading(false);
      setIsAuthModalOpen(false);
    }, 400);
  };

  const handleQuickLogin = (user: typeof DEMO_USERS[0]) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/75 backdrop-blur-sm">
      <div 
        className="fixed inset-0" 
        onClick={() => setIsAuthModalOpen(false)} 
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-elevated overflow-hidden z-10 space-y-5 p-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header with Tab switcher */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-lg border border-slate-200 dark:border-zinc-700">
            <button
              onClick={() => { setAuthModalMode('login'); setError(''); }}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                authModalMode === 'login'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-50 font-bold shadow-2xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthModalMode('register'); setError(''); }}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                authModalMode === 'register'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-50 font-bold shadow-2xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-medium">
              {error}
            </div>
          )}

          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-2xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Username or Handle
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. alex_dev"
                className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 focus:border-blue-500 rounded-lg px-3 py-2 pl-9 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Email for register mode */}
          {authModalMode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-2xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 focus:border-blue-500 rounded-lg px-3 py-2 pl-9 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-2xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 focus:border-blue-500 rounded-lg px-3 py-2 pl-9 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <span>{authModalMode === 'login' ? 'Sign In' : 'Create Candidate Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Demo Login Switcher */}
        <div className="border-t border-slate-100 dark:border-zinc-800 pt-4 space-y-2.5">
          <div className="flex items-center justify-between text-2xs text-slate-500 dark:text-zinc-400 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Demo Profiles:
            </span>
            <span>1-Click Switch</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {DEMO_USERS.map(user => (
              <button
                key={user.id}
                onClick={() => handleQuickLogin(user)}
                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-left transition-colors space-y-0.5 shadow-2xs"
              >
                <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">{user.name.split(' ')[0]}</div>
                <div className="text-[10px] font-mono text-blue-600 dark:text-blue-400">Rating {user.rating}</div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
