import React from 'react';
import type { Verdict } from '../../types/judge';
import { CheckCircle2, XCircle, Clock, AlertTriangle, Cpu, HelpCircle } from 'lucide-react';

interface Props {
  verdict: Verdict;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export const VerdictBadge: React.FC<Props> = ({ verdict, size = 'sm', showIcon = true }) => {
  const getConfig = () => {
    switch (verdict) {
      case 'Accepted':
        return {
          style: 'bg-[#ecfdf5] text-[#047857] border-[#a7f3d0] dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50',
          icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 shrink-0 text-[#047857] dark:text-emerald-400" />,
        };
      case 'Wrong Answer':
        return {
          style: 'bg-[#fff1f2] text-[#be123c] border-[#fecdd3] dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/50',
          icon: <XCircle className="w-3.5 h-3.5 mr-1.5 shrink-0 text-[#be123c] dark:text-rose-400" />,
        };
      case 'Time Limit Exceeded':
        return {
          style: 'bg-[#fffbeb] text-[#b45309] border-[#fde68a] dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50',
          icon: <Clock className="w-3.5 h-3.5 mr-1.5 shrink-0 text-[#b45309] dark:text-amber-400" />,
        };
      case 'Memory Limit Exceeded':
        return {
          style: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800/50',
          icon: <AlertTriangle className="w-3.5 h-3.5 mr-1.5 shrink-0 text-orange-600 dark:text-orange-400" />,
        };
      case 'Runtime Error':
        return {
          style: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/50',
          icon: <AlertTriangle className="w-3.5 h-3.5 mr-1.5 shrink-0 text-red-600 dark:text-red-400" />,
        };
      case 'Compilation Error':
        return {
          style: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-800/50',
          icon: <Cpu className="w-3.5 h-3.5 mr-1.5 shrink-0 text-amber-700 dark:text-yellow-400" />,
        };
      case 'Pending':
      default:
        return {
          style: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800/40 dark:text-zinc-400 dark:border-zinc-700/50',
          icon: <HelpCircle className="w-3.5 h-3.5 mr-1.5 shrink-0 text-slate-500 animate-spin" />,
        };
    }
  };

  const config = getConfig();
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center rounded-md border font-mono ${sizeClasses} ${config.style}`}>
      {showIcon && config.icon}
      {verdict}
    </span>
  );
};
