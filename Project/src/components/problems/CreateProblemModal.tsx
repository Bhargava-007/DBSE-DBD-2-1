import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJudge } from '../../context/JudgeContext';
import type { Difficulty, Problem } from '../../types/judge';
import { 
  X, 
  Plus, 
  Clock, 
  Cpu, 
  Code2,
  ArrowLeft
} from 'lucide-react';

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
  mode?: 'modal' | 'page';
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
  'Breadth-First Search', 
  'Tree', 
  'Graph', 
  'Two Pointers', 
  'Stack'
];

export const CreateProblemModal: React.FC<Props> = ({ 
  isOpen = true, 
  onClose,
  mode = 'modal'
}) => {
  const { addNewProblem, currentUser } = useJudge();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Array', 'Hash Table']);
  const [timeLimitMs, setTimeLimitMs] = useState(1000);
  const [memoryLimitMb, setMemoryLimitMb] = useState(256);
  const [description, setDescription] = useState('');
  const [sampleInput, setSampleInput] = useState('');
  const [sampleOutput, setSampleOutput] = useState('');
  const [explanation, setExplanation] = useState('');
  const [hiddenTestCasesCount] = useState(50);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (mode === 'modal' && !isOpen) return null;

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      if (selectedTags.length > 1) {
        setSelectedTags(selectedTags.filter(t => t !== tag));
      }
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    const slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newProblem: Problem = {
      id: '',
      title: title.trim(),
      slug,
      difficulty,
      tags: selectedTags,
      acceptanceRate: 0,
      submissionsCount: 0,
      totalAccepted: 0,
      author: currentUser?.username || 'admin',
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
          id: `tc-${Date.now()}-1`,
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

    try {
      await addNewProblem(newProblem);
      setIsSubmitting(false);
      if (onClose) onClose();
      navigate(`/problems/${slug || 'catalog'}`);
    } catch (err: any) {
      setError(err.message || 'Failed to publish problem to backend database.');
      setIsSubmitting(false);
    }
  };

  const formContent = (
    <div className={`flex flex-col bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--r-xl)] shadow-[var(--shadow-lg)] ${mode === 'page' ? 'w-full max-w-4xl mx-auto p-6 md:p-8' : 'w-full max-w-2xl max-h-[90vh] overflow-hidden'}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] p-5">
        <div className="flex items-center gap-2.5">
          {mode === 'page' && (
            <button
              onClick={() => navigate('/admin')}
              className="p-1.5 -ml-1 text-[var(--text-3)] hover:text-[var(--text-1)] rounded-[var(--r-sm)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer mr-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="w-8 h-8 rounded-[var(--r-sm)] bg-[var(--accent-dim)] border border-[var(--border)] flex items-center justify-center text-[var(--verdigris)]">
            <Plus className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--text-1)] tracking-tight">
              Create New Problem
            </h2>
            <p className="text-[12px] text-[var(--text-3)]">
              Author: <span className="text-[var(--text-2)] font-mono">@{currentUser?.username || 'admin'}</span>
            </p>
          </div>
        </div>

        {mode === 'modal' && onClose && (
          <button 
            onClick={onClose}
            className="p-1 text-[var(--text-3)] hover:text-[var(--text-1)] rounded-[var(--r-sm)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-[var(--r-md)] bg-[var(--red-dim)] border border-[var(--red)]/20 text-[var(--red)] font-medium">
            {error}
          </div>
        )}

        {/* Title */}
        <div className="space-y-1.5">
          <label className="font-medium text-[var(--text-2)]">Problem Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Invert Binary Tree"
            className="w-full h-9 bg-[var(--bg-canvas)] border border-[var(--border)] focus:border-[var(--accent)] rounded-[var(--r-md)] px-3 text-[13px] text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none transition-colors"
          />
        </div>

        {/* Difficulty & Limits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="font-medium text-[var(--text-2)]">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="w-full h-9 bg-[var(--bg-canvas)] border border-[var(--border)] focus:border-[var(--accent)] rounded-[var(--r-md)] px-3 text-[13px] text-[var(--text-1)] focus:outline-none transition-colors"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-medium text-[var(--text-2)] flex items-center gap-1">
              <Clock className="w-3 h-3 text-[var(--text-3)]" /> Time Limit (ms)
            </label>
            <input
              type="number"
              value={timeLimitMs}
              onChange={(e) => setTimeLimitMs(Number(e.target.value))}
              min={100}
              max={10000}
              step={100}
              className="w-full h-9 bg-[var(--bg-canvas)] border border-[var(--border)] focus:border-[var(--accent)] rounded-[var(--r-md)] px-3 text-[13px] text-[var(--text-1)] focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-medium text-[var(--text-2)] flex items-center gap-1">
              <Cpu className="w-3 h-3 text-[var(--text-3)]" /> Memory Limit (MB)
            </label>
            <input
              type="number"
              value={memoryLimitMb}
              onChange={(e) => setMemoryLimitMb(Number(e.target.value))}
              min={16}
              max={1024}
              step={16}
              className="w-full h-9 bg-[var(--bg-canvas)] border border-[var(--border)] focus:border-[var(--accent)] rounded-[var(--r-md)] px-3 text-[13px] text-[var(--text-1)] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label className="font-medium text-[var(--text-2)]">Topic Tags</label>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-[var(--bg-canvas)] border border-[var(--border)] rounded-[var(--r-md)]">
            {AVAILABLE_TAGS.map(tag => {
              const selected = selectedTags.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => handleToggleTag(tag)}
                  className={`px-2 py-0.5 rounded-[var(--r-sm)] text-[11px] font-medium transition-colors cursor-pointer ${
                    selected
                      ? 'bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--accent)]/30'
                      : 'bg-[var(--bg-card)] text-[var(--text-3)] border border-[var(--border)] hover:text-[var(--text-1)]'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Description / Problem Statement */}
        <div className="space-y-1.5">
          <label className="font-medium text-[var(--text-2)]">Problem Statement (Markdown supported) *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Given an array of integers nums and an integer target..."
            rows={4}
            className="w-full bg-[var(--bg-canvas)] border border-[var(--border)] focus:border-[var(--accent)] rounded-[var(--r-md)] p-3 text-[13px] text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none transition-colors resize-y font-sans"
          />
        </div>

        {/* Sample Test Case */}
        <div className="p-3.5 rounded-[var(--r-md)] bg-[var(--bg-canvas)] border border-[var(--border)] space-y-3">
          <div className="font-semibold text-[var(--text-1)] text-[12px] flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-[var(--accent)]" /> Sample Test Case 1
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] text-[var(--text-3)]">Sample Input *</label>
              <textarea
                value={sampleInput}
                onChange={(e) => setSampleInput(e.target.value)}
                placeholder="nums = [2,7,11,15], target = 9"
                rows={2}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] focus:border-[var(--accent)] rounded-[var(--r-sm)] p-2 text-[12px] font-mono text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-[var(--text-3)]">Expected Output *</label>
              <textarea
                value={sampleOutput}
                onChange={(e) => setSampleOutput(e.target.value)}
                placeholder="[0,1]"
                rows={2}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] focus:border-[var(--accent)] rounded-[var(--r-sm)] p-2 text-[12px] font-mono text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-[var(--text-3)]">Explanation (Optional)</label>
            <input
              type="text"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Because nums[0] + nums[1] == 9, we return [0, 1]."
              className="w-full h-8 bg-[var(--bg-elevated)] border border-[var(--border)] focus:border-[var(--accent)] rounded-[var(--r-sm)] px-2.5 text-[12px] text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
          {mode === 'modal' && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary !h-8 !text-[12px]"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary !h-8 !text-[12px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isSubmitting ? 'Publishing Problem...' : 'Publish Problem'}</span>
          </button>
        </div>
      </form>
    </div>
  );

  if (mode === 'page') {
    return (
      <div className="min-h-[calc(100vh-60px)] py-8 px-4 sm:px-6 page-fade">
        {formContent}
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
    >
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />
      <div className="relative z-10 w-full max-w-2xl my-6 animate-in fade-in zoom-in-95 duration-150">
        {formContent}
      </div>
    </div>
  );
};
