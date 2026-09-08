import React, { useState } from 'react';
import { useJudge } from '../../context/JudgeContext';
import type { Difficulty, Problem } from '../../types/judge';
import { 
  X, 
  Plus, 
  Database, 
  Code2, 
  Clock, 
  Cpu, 
  FileText
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_TAGS = [
  'Array', 
  'String', 
  'Hash Table', 
  'Dynamic Programming', 
  'Math', 
  'Sorting', 
  'Greedy', 
  'Depth-First Search', 
  'Binary Search', 
  'Tree', 
  'Graph', 
  'Two Pointers', 
  'Stack'
];

export const CreateProblemModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addNewProblem, navigateToProblem, problems } = useJudge();

  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Array', 'Hash Table']);
  const [timeLimitMs, setTimeLimitMs] = useState(1000);
  const [memoryLimitMb, setMemoryLimitMb] = useState(256);
  const [description, setDescription] = useState('');
  const [sampleInput, setSampleInput] = useState('');
  const [sampleOutput, setSampleOutput] = useState('');
  const [explanation, setExplanation] = useState('');
  const [hiddenTestCasesCount, setHiddenTestCasesCount] = useState(50);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      if (selectedTags.length > 1) {
        setSelectedTags(selectedTags.filter(t => t !== tag));
      }
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Problem Title is required.');
      return;
    }
    if (!description.trim()) {
      setError('Problem Statement / Description is required.');
      return;
    }
    if (!sampleInput.trim() || !sampleOutput.trim()) {
      setError('At least one Sample Test Case (Input and Expected Output) is required.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newId = `prob-${problems.length + 1}`;
      const slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const newProblem: Problem = {
        id: newId,
        title: title.trim(),
        slug,
        difficulty,
        tags: selectedTags,
        acceptanceRate: 50.0,
        submissionsCount: 0,
        totalAccepted: 0,
        author: 'Admin Setter',
        description: description.trim(),
        constraints: [
          `1 <= input.length <= 10^5`,
          `Time Limit: ${timeLimitMs} ms`,
          `Memory Limit: ${memoryLimitMb} MB`
        ],
        timeLimitMs,
        memoryLimitMb,
        sampleTestCases: [
          {
            id: `tc-${newId}-1`,
            input: sampleInput.trim(),
            expectedOutput: sampleOutput.trim(),
            explanation: explanation.trim() || undefined,
          }
        ],
        hiddenTestCasesCount,
        starterCode: {
          cpp: `// ${title}\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solve() {\n        // Enter your solution here\n    }\n};`,
          python: `# ${title}\nclass Solution:\n    def solve(self):\n        # Enter your solution here\n        pass`,
          java: `// ${title}\nimport java.util.*;\n\npublic class Solution {\n    public void solve() {\n        // Enter your solution here\n    }\n}`,
          javascript: `// ${title}\n/**\n * @return {void}\n */\nfunction solve() {\n    // Enter your solution here\n}`,
        }
      };

      addNewProblem(newProblem);
      setIsSubmitting(false);
      onClose();
      navigateToProblem(newId);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-elevated z-10 my-6">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Author New Algorithm Problem
              </h3>
              <p className="text-2xs text-slate-500 dark:text-zinc-400">
                Inserts a problem document and test case entities into the database catalog.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body Scrollable */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-medium">
              {error}
            </div>
          )}

          {/* Section 1: Title & Difficulty */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-2xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Problem Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Longest Substring Without Repeating Characters"
                className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none transition-colors font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Difficulty */}
              <div className="space-y-1.5">
                <label className="text-2xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Target Difficulty *
                </label>
                <div className="flex items-center gap-1.5">
                  {(['Easy', 'Medium', 'Hard'] as const).map(diff => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                        difficulty === diff
                          ? diff === 'Easy'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-700'
                            : diff === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-700'
                            : 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-700'
                          : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resource Constraints */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-2xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> Time (ms)
                  </label>
                  <input
                    type="number"
                    value={timeLimitMs}
                    onChange={(e) => setTimeLimitMs(Number(e.target.value))}
                    min={100}
                    max={5000}
                    step={100}
                    className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-2xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-slate-400" /> RAM (MB)
                  </label>
                  <input
                    type="number"
                    value={memoryLimitMb}
                    onChange={(e) => setMemoryLimitMb(Number(e.target.value))}
                    min={64}
                    max={1024}
                    step={64}
                    className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Topic Tags */}
          <div className="space-y-1.5">
            <label className="text-2xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Categorization Tags (Select at least 1)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_TAGS.map(tag => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`px-2 py-1 rounded text-2xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 dark:bg-zinc-100 dark:text-slate-900 dark:border-white'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Problem Description */}
          <div className="space-y-1.5">
            <label className="text-2xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1">
              <FileText className="w-3 h-3 text-slate-400" /> Problem Statement (Markdown) *
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Given a string s, find the length of the longest substring without duplicate characters..."
              className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 focus:border-blue-500 rounded-lg p-3 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none transition-colors font-sans leading-relaxed"
            />
          </div>

          {/* Section 4: Sample Test Case (Test Oracle / Evaluation) */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Sample Test Case (Public Evaluation)
              </span>
              <span className="text-2xs font-mono text-slate-500 dark:text-zinc-400">
                Oracle Case 1
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-2xs font-mono text-slate-500 dark:text-zinc-400">Sample Input *</label>
                <textarea
                  rows={2}
                  value={sampleInput}
                  onChange={(e) => setSampleInput(e.target.value)}
                  placeholder={`s = "abcabcbb"`}
                  className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-md p-2 font-mono text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-2xs font-mono text-slate-500 dark:text-zinc-400">Expected Output *</label>
                <textarea
                  rows={2}
                  value={sampleOutput}
                  onChange={(e) => setSampleOutput(e.target.value)}
                  placeholder="3"
                  className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-md p-2 font-mono text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-2xs font-mono text-slate-500 dark:text-zinc-400">Explanation (Optional)</label>
              <input
                type="text"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder={`The answer is "abc", with the length of 3.`}
                className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-md px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Hidden Testcases Count */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700">
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">Hidden Evaluation Test Cases</div>
              <div className="text-2xs text-slate-500 dark:text-zinc-400">Strict judging suites against edge cases, overflow, and TLE</div>
            </div>
            <input
              type="number"
              value={hiddenTestCasesCount}
              onChange={(e) => setHiddenTestCasesCount(Number(e.target.value))}
              min={10}
              max={200}
              className="w-20 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-md px-2 py-1 font-mono text-xs text-center text-slate-900 dark:text-zinc-100 focus:outline-none"
            />
          </div>

          {/* Form Actions Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <span>Writing to Database...</span>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save & Publish Problem</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
