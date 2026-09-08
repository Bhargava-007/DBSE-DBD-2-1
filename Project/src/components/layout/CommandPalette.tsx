import React, { useState, useEffect, useRef } from 'react';
import { useJudge } from '../../context/JudgeContext';
import { Search, X, Code2, ArrowRight } from 'lucide-react';
import { DifficultyBadge } from '../common/DifficultyBadge';

export const CommandPalette: React.FC = () => {
  const { 
    isCommandPaletteOpen, 
    setIsCommandPaletteOpen, 
    problems, 
    navigateToProblem,
    isProblemSolved 
  } = useJudge();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isCommandPaletteOpen]);

  const filteredProblems = problems.filter(p => {
    const q = query.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)) ||
      p.difficulty.toLowerCase().includes(q)
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredProblems.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredProblems[selectedIndex]) {
        navigateToProblem(filteredProblems[selectedIndex].id);
        setIsCommandPaletteOpen(false);
      }
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/40 dark:bg-black/70 backdrop-blur-sm">
      <div 
        className="fixed inset-0" 
        onClick={() => setIsCommandPaletteOpen(false)} 
      />
      <div className="relative w-full max-w-xl rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-elevated overflow-hidden z-10">
        
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-zinc-800 gap-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search problems by title, tag, or difficulty..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none"
          />
          <button 
            onClick={() => setIsCommandPaletteOpen(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/60 p-1.5">
          {filteredProblems.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500 dark:text-zinc-400">
              No matching problems found. Try searching for "Array", "Dynamic Programming", or "Easy".
            </div>
          ) : (
            filteredProblems.map((problem, index) => {
              const isSelected = index === selectedIndex;
              const solved = isProblemSolved(problem.id);
              return (
                <div
                  key={problem.id}
                  onClick={() => {
                    navigateToProblem(problem.id);
                    setIsCommandPaletteOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-50' 
                      : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-slate-400 dark:text-zinc-500">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                          {problem.title}
                        </span>
                        {solved && (
                          <span className="text-2xs font-semibold text-emerald-600 dark:text-emerald-400">
                            ✓ Solved
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {problem.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-2xs text-slate-500 dark:text-zinc-400">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <DifficultyBadge difficulty={problem.difficulty} />
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-900 dark:text-zinc-100' : 'text-transparent'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 flex items-center justify-between text-2xs text-slate-500 dark:text-zinc-400">
          <div className="flex items-center gap-3 font-mono">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>{filteredProblems.length} results</span>
        </div>
      </div>
    </div>
  );
};
