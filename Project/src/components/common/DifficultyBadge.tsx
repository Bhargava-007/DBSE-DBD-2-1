import React from 'react';
import type { Difficulty } from '../../types/judge';

interface Props {
  difficulty: Difficulty;
  size?: 'sm' | 'md';
}

export const DifficultyBadge: React.FC<Props> = ({ difficulty, size = 'sm' }) => {
  const getStyles = () => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-[#ecfdf5] text-[#047857] border-[#a7f3d0] dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40';
      case 'Medium':
        return 'bg-[#fffbeb] text-[#b45309] border-[#fde68a] dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40';
      case 'Hard':
        return 'bg-[#fff1f2] text-[#be123c] border-[#fecdd3] dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40';
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center rounded-md border font-medium ${sizeClasses} ${getStyles()}`}>
      {difficulty}
    </span>
  );
};
