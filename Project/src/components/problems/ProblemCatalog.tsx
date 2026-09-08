import React, { useState, useMemo } from 'react';
import { useJudge } from '../../context/JudgeContext';
import type { Difficulty } from '../../types/judge';
import { DifficultyBadge } from '../common/DifficultyBadge';
import { CreateProblemModal } from './CreateProblemModal';
import { 
  Search, 
  CheckCircle2, 
  Circle, 
  ArrowUpDown, 
  Tag, 
  ChevronRight,
  X,
  Plus
} from 'lucide-react';

export const ProblemCatalog: React.FC = () => {
  const { 
    problems, 
    isProblemSolved, 
    navigateToProblem 
  } = useJudge();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | Difficulty>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Solved' | 'Unsolved'>('All');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'id' | 'acceptance' | 'difficulty'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Extract unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    problems.forEach(p => p.tags.forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [problems]);

  // Solved counts
  const solvedCount = useMemo(() => {
    return problems.filter(p => isProblemSolved(p.id)).length;
  }, [problems, isProblemSolved]);

  const easySolved = useMemo(() => {
    return problems.filter(p => p.difficulty === 'Easy' && isProblemSolved(p.id)).length;
  }, [problems, isProblemSolved]);

  const mediumSolved = useMemo(() => {
    return problems.filter(p => p.difficulty === 'Medium' && isProblemSolved(p.id)).length;
  }, [problems, isProblemSolved]);

  const hardSolved = useMemo(() => {
    return problems.filter(p => p.difficulty === 'Hard' && isProblemSolved(p.id)).length;
  }, [problems, isProblemSolved]);

  const filteredProblems = useMemo(() => {
    return problems
      .filter(p => {
        const matchesQuery = 
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
          p.id.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesDiff = selectedDifficulty === 'All' || p.difficulty === selectedDifficulty;
        
        const isSolved = isProblemSolved(p.id);
        const matchesStatus = 
          selectedStatus === 'All' || 
          (selectedStatus === 'Solved' && isSolved) || 
          (selectedStatus === 'Unsolved' && !isSolved);

        const matchesTag = selectedTag === 'All' || p.tags.includes(selectedTag);

        return matchesQuery && matchesDiff && matchesStatus && matchesTag;
      })
      .sort((a, b) => {
        if (sortBy === 'acceptance') {
          return sortOrder === 'asc' 
            ? a.acceptanceRate - b.acceptanceRate 
            : b.acceptanceRate - a.acceptanceRate;
        }
        if (sortBy === 'difficulty') {
          const diffWeight = { Easy: 1, Medium: 2, Hard: 3 };
          return sortOrder === 'asc' 
            ? diffWeight[a.difficulty] - diffWeight[b.difficulty] 
            : diffWeight[b.difficulty] - diffWeight[a.difficulty];
        }
        const idA = parseInt(a.id.replace('prob-', '')) || 0;
        const idB = parseInt(b.id.replace('prob-', '')) || 0;
        return sortOrder === 'asc' ? idA - idB : idB - idA;
      });
  }, [problems, searchQuery, selectedDifficulty, selectedStatus, selectedTag, sortBy, sortOrder, isProblemSolved]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      
      {/* SaaS Page Header — Compact & focused on problems */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
              Problems
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-medium">
              {filteredProblems.length} available
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Algorithmic challenges with sandboxed multi-language test evaluation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress summary pill */}
          <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 px-3.5 py-1.5 rounded-lg shadow-2xs font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-zinc-400 font-sans">Solved:</span>
              <span className="font-bold text-slate-900 dark:text-zinc-100">{solvedCount}/{problems.length}</span>
            </div>

            <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
              <div 
                className="bg-emerald-600 dark:bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${(solvedCount / problems.length) * 100}%` }}
              />
            </div>

            <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-400 border-l border-slate-200 dark:border-zinc-700 pl-2">
              <span className="text-emerald-700 dark:text-emerald-400">{easySolved}E</span>
              <span>•</span>
              <span className="text-amber-700 dark:text-amber-400">{mediumSolved}M</span>
              <span>•</span>
              <span className="text-rose-700 dark:text-rose-400">{hardSolved}H</span>
            </div>
          </div>

          {/* New Problem Button (CRUD Form trigger) */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-2xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Problem</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-lg p-3 shadow-xs space-y-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problems by title, topic, or ID..."
              className="w-full bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 focus:border-slate-400 dark:focus:border-zinc-500 rounded-md pl-9 pr-8 py-1.5 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Difficulty Toggles */}
          <div className="flex items-center bg-slate-100/80 dark:bg-zinc-800/80 p-0.5 rounded-md border border-slate-200/60 dark:border-zinc-700 shrink-0 text-xs">
            {(['All', 'Easy', 'Medium', 'Hard'] as const).map(diff => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  selectedDifficulty === diff
                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-50 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center bg-slate-100/80 dark:bg-zinc-800/80 p-0.5 rounded-md border border-slate-200/60 dark:border-zinc-700 shrink-0 text-xs">
            {(['All', 'Solved', 'Unsolved'] as const).map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  selectedStatus === status
                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-50 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Topics Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar text-xs">
          <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500 flex items-center gap-1 shrink-0 mr-1">
            <Tag className="w-3 h-3" /> Topics:
          </span>
          <button
            onClick={() => setSelectedTag('All')}
            className={`px-2 py-0.5 rounded-md text-[11px] font-medium shrink-0 transition-colors border ${
              selectedTag === 'All'
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-zinc-100 dark:text-slate-900 dark:border-white'
                : 'bg-slate-100/70 text-slate-600 border-slate-200/70 hover:bg-slate-200/70 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
            }`}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? 'All' : tag)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium shrink-0 transition-colors border ${
                selectedTag === tag
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-zinc-100 dark:text-slate-900 dark:border-white'
                  : 'bg-slate-100/70 text-slate-600 border-slate-200/70 hover:bg-slate-200/70 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Dense Problem Table */}
      <div className="rounded-lg bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                <th className="py-2.5 px-3 w-10 text-center">Status</th>
                <th className="py-2.5 px-3">
                  <button 
                    onClick={() => {
                      if (sortBy === 'id') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else { setSortBy('id'); setSortOrder('asc'); }
                    }}
                    className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    <span>Title</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>
                <th className="py-2.5 px-3 w-36 text-right">
                  <button 
                    onClick={() => {
                      if (sortBy === 'acceptance') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else { setSortBy('acceptance'); setSortOrder('desc'); }
                    }}
                    className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    <span>Acceptance</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>
                <th className="py-2.5 px-3 w-28 text-center">
                  <button 
                    onClick={() => {
                      if (sortBy === 'difficulty') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else { setSortBy('difficulty'); setSortOrder('asc'); }
                    }}
                    className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    <span>Difficulty</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>
                <th className="py-2.5 px-3 w-48 hidden md:table-cell">Topics</th>
                <th className="py-2.5 px-3 w-8 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-xs">
              {filteredProblems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-zinc-400 font-sans">
                    No problems match the current filter selection.
                  </td>
                </tr>
              ) : (
                filteredProblems.map((problem) => {
                  const solved = isProblemSolved(problem.id);
                  return (
                    <tr
                      key={problem.id}
                      onClick={() => navigateToProblem(problem.id)}
                      className="hover:bg-slate-50/90 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors group"
                    >
                      {/* Status Icon */}
                      <td className="py-2.5 px-3 text-center">
                        {solved ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-zinc-600 mx-auto group-hover:text-slate-400 dark:group-hover:text-zinc-400 transition-colors" />
                        )}
                      </td>

                      {/* Title & Index */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums">
                            {problem.id.replace('prob-', '')}.
                          </span>
                          <span className="font-medium text-slate-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {problem.title}
                          </span>
                        </div>
                      </td>

                      {/* Acceptance Rate */}
                      <td className="py-2.5 px-3 text-right font-mono text-xs text-slate-600 dark:text-zinc-400 tabular-nums">
                        <div className="inline-flex items-center gap-2">
                          <span>{problem.acceptanceRate.toFixed(1)}%</span>
                          <div className="w-12 h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                            <div 
                              className="h-full bg-slate-400 dark:bg-zinc-500 rounded-full" 
                              style={{ width: `${problem.acceptanceRate}%` }} 
                            />
                          </div>
                        </div>
                      </td>

                      {/* Difficulty centered */}
                      <td className="py-2.5 px-3 text-center">
                        <DifficultyBadge difficulty={problem.difficulty} size="sm" />
                      </td>

                      {/* Topics */}
                      <td className="py-2.5 px-3 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {problem.tags.slice(0, 2).map(tag => (
                            <span 
                              key={tag}
                              className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-700"
                            >
                              {tag}
                            </span>
                          ))}
                          {problem.tags.length > 2 && (
                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                              +{problem.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action Arrow */}
                      <td className="py-2.5 px-3 text-right">
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-zinc-600 group-hover:text-slate-600 dark:group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all inline" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Problem CRUD Modal */}
      <CreateProblemModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
};

