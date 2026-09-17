import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useJudge } from '../context/JudgeContext';
import { Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
interface DemoUser {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'setter' | 'user';
  rating: number;
}

const DEMO_USERS: DemoUser[] = [
  { id: 'usr_892144', username: 'alex_dev', name: 'Alex Chen', role: 'admin', rating: 1842 },
  { id: 'usr_892145', username: 'sarah_k', name: 'Sarah Kim', role: 'setter', rating: 1910 },
  { id: 'usr_892146', username: 'marcus_v', name: 'Marcus Vance', role: 'user', rating: 1725 },
];

export const LoginPage: React.FC = () => {
  const { loginUser, currentUser } = useJudge();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as { from?: string })?.from || '/dashboard';

  // If already logged in, redirect immediately
  React.useEffect(() => {
    if (currentUser) {
      navigate(from, { replace: true });
    }
  }, [currentUser, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter your username and password.');
      return;
    }

    setIsLoading(true);
    try {
      await loginUser(username, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (demoUser: typeof DEMO_USERS[0]) => {
    setError('');
    const credentialsMap: Record<string, { username: string; password: string }> = {
      alex_dev: { username: 'admin', password: 'Admin@123' },
      sarah_k: { username: 'setter', password: 'Setter@123' },
      marcus_v: { username: 'bhargava', password: 'User@123' },
      admin: { username: 'admin', password: 'Admin@123' },
      setter: { username: 'setter', password: 'Setter@123' },
      bhargava: { username: 'bhargava', password: 'User@123' },
    };

    const creds =
      credentialsMap[demoUser.username] ||
      (demoUser.role === 'admin'
        ? credentialsMap.admin
        : demoUser.role === 'setter'
        ? credentialsMap.setter
        : credentialsMap.bhargava);

    try {
      await loginUser(creds.username, creds.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12 page-fade">
      <div className="w-full max-w-[420px] rounded-[var(--r-xl)] bg-[var(--bg-elevated)] border border-[var(--border)] shadow-[var(--shadow-lg)] overflow-hidden space-y-6 p-7">
        
        {/* Header */}
        <div className="space-y-1.5 text-center">
          <div className="inline-flex items-center gap-1.5 text-[var(--accent)] font-semibold text-xs tracking-wider uppercase mb-1">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            AlgoFlow Auth
          </div>
          <h1 className="text-xl font-bold text-[var(--text-1)] tracking-tight">
            Sign In to Your Account
          </h1>
          <p className="text-[13px] text-[var(--text-3)]">
            Enter your credentials to access problems, contests, and stats.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-[var(--r-md)] bg-[var(--red-dim)] border border-[var(--red)]/20 text-[12px] text-[var(--red)] font-medium">
              {error}
            </div>
          )}

          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-[var(--text-2)]">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[var(--text-3)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin or alex_dev"
                className="w-full h-[38px] bg-[var(--bg-canvas)] border border-[var(--border)] focus:border-[var(--accent)] rounded-[var(--r-md)] px-3 pl-9 text-[14px] text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-[var(--text-2)]">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[var(--text-3)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-[38px] bg-[var(--bg-canvas)] border border-[var(--border)] focus:border-[var(--accent)] rounded-[var(--r-md)] px-3 pl-9 text-[14px] text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full justify-center !h-[38px] !text-[13px]"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Demo Login Grid */}
        <div className="border-t border-[var(--border)] pt-4 space-y-2.5">
          <div className="flex items-center justify-between text-[12px] text-[var(--text-3)]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)]" /> Demo Accounts:
            </span>
            <span className="text-[11px]">Quick Switch</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {DEMO_USERS.map(demoUser => {
              const roleLabel =
                demoUser.username === 'alex_dev' || demoUser.username === 'admin' || demoUser.role === 'admin'
                  ? 'Admin'
                  : demoUser.username === 'sarah_k' || demoUser.username === 'setter' || demoUser.role === 'setter'
                  ? 'Problem Setter'
                  : 'Contestant';

              return (
                <div key={demoUser.id} className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(demoUser)}
                    className="w-full p-2 rounded-[var(--r-md)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-left transition-colors space-y-0.5 cursor-pointer"
                  >
                    <div className="text-[12px] font-medium text-[var(--text-1)] truncate">
                      {demoUser.name.split(' ')[0]}
                    </div>
                    <div className="text-[11px] font-mono text-[var(--accent)]">
                      {demoUser.rating}
                    </div>
                  </button>
                  <span className="text-xs text-[var(--text-3)]">{roleLabel}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Link to Register */}
        <div className="text-center pt-1 text-[12px] text-[var(--text-3)]">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-[var(--accent)] hover:underline font-medium">
            Create an account
          </Link>
        </div>

      </div>
    </div>
  );
};
