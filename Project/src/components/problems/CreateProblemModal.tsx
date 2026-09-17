import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJudge } from '../../context/JudgeContext';
import type { Difficulty, Problem } from '../../types/judge';
import { 
  X, 
  Plus, 
  Database, 
  Clock, 
  Cpu, 
  FileText,
  Code2
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
  'Breadth-First Search', 
  'Tree', 
  'Graph', 
  'Two Pointers', 
  'Stack'
];

export const CreateProblemModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addNewProblem, problems } = useJudge();
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
      navigate(`/problems/${newProblem.slug || newId}`);
    }, 400);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
    >
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-[var(--r-xl)] bg-[var(--bg-elevated)] border border-[var(--border-mid)] shadow-[var(--shadow-lg)] z-10 my-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[var(--r-md)] bg-[var(--accent-dim)] text-[var(--accent)]">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-[var(--text-1)]">
                Author New Problem
              </h3>
              <p className="text-[12px] text-[var(--text-3)]">
                Create a problem with test cases and resource limits
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body Scrollable */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
          {error && (
            <div className="p-3 rounded-[var(--r-md)] bg-[var(--red-dim)] border border-[var(--red)]/20 text-[12px] text-[var(--red)] font-medium">
              {error}
            </div>
          )}

          {/* Section 1: Title & Difficulty */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[var(--text-2)]">
                Problem Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Longest Substring Without Repeating Characters"
                className="w-full h-[38px] bg-[var(--bg-canvas)] border border-[var(--border)] focus:border-[var(--accent)] rounded-[var(--r-md)] px-3 text-[13px] text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Difficulty */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[var(--text-2)]">
                  Target Difficulty *
                </label>
                <div className="flex items-center gap-1.5">
                  {(['Easy', 'Medium', 'Hard'] as const).map(diff => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`flex-1 py-1.5 text-[12px] font-medium rounded-[var(--r-md)] border transition-colors ${
                        difficulty === diff
                          ? diff === 'Easy'
                            ? 'bg-[var(--green-dim)] text-[var(--green)] border-[var(--green)]/30'
                            : diff === 'Medium'
                            ? 'bg-[var(--amber-dim)] text-[var(--amber)] border-[var(--amber)]/30'
                            : 'bg-[var(--red-dim)] text-[var(--red)] border-[var(--red)]/30'
                          : 'bg-[var(--bg-card)] text-[var(--text-3)] border-[var(--border)] hover:text-[var(--text-2)]'
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
                  <label className="text-[12px] font-medium text-[var(--text-2)] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[var(--text-3)]" /> Time (ms)
                  </label>
                  <input
                    type="number"
                    value={timeLimitMs}
                    onChange={(e) => setTimeLimitMs(Number(e.target.value))}
                    min={100}
                    max={5000}
                    step={100}
                    className="w-full h-[38px] bg-[var(--bg-canvas)] border border-[var(--border)] focus:border-[var(--accent)] rounded-[var(--r-md)] px-3 text-[12px] font-mono text-[var(--text-1)] focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[var(--text-2)] flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-[var(--text-3)]" /> RAM (MB)
                  </label>
                  <input
                    type="number"
                    value={memoryLimitMb}
                    onChange={(e) => setMemoryLimitMb(Number(e.target.value))}
                    min={64}
                    max={1024}
                    step={64}
                    className="w-full h-[38px] bg-[var(--bg-canvas)] border border-[var(--border)] focus:border-[var(--accent)] rounded-[var(--r-md)] px-3 text-[12px] font-mono text-[var(--text-1)] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Topic Tags */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-[var(--text-2)]">
              Topic Tags (Select at least 1)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_TAGS.map(tag => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`tag-pill ${isSelected ? 'active !bg-[var(--accent-dim)] !text-[var(--accent)] !border-[var(--accent-border)]' : ''}`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Problem Description */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-[var(--text-2)] flex items-center gap-1">
              <FileText className="w-3 h-3 text-[var(--text-3)]" /> Problem Statement (Markdown) *
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Given a string s, find the length of the longest substring without duplicate characters..."
              className="w-full bg-[var(--bg-canvas)] border border-[var(--border)] focus:border-[var(--accent)] rounded-[var(--r-md)] p-3 text-[13px] text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none transition-colors leading-relaxed"
            />
          </div>

          {/* Section 4: Sample Test Case */}
          <div className="p-4 rounded-[var(--r-lg)] bg-[var(--bg-card)] border border-[var(--border)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[var(--text-1)] flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-[var(--accent)]" /> Sample Test Case
              </span>
              <span className="text-[11px] font-mono text-[var(--text-3)]">
                Case 1
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-[var(--text-3)]">Sample Input *</label>
                <textarea
                  rows={2}
                  value={sampleInput}
                  onChange={(e) => setSampleInput(e.target.value)}
                  placeholder={`s = "abcabcbb"`}
                  className="w-full bg-[var(--bg-canvas)] border border-[var(--border)] focus:border-[var(--accent)] rounded-[var(--r-md)] p-2 font-mono text-[12px] text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-[var(--text-3)]">Expected Output *</label>
                <textarea
                  rows={2}
                  value={sampleOutput}
                  onChange={(e) => setSampleOutput(e.target.value)}
                  placeholder="3"
                  className="w-full bg-[var(--bg-canvas)] border border-[var(--border)] focus:border-[var(--accent)] rounded-[var(--r-md)] p-2 font-mono text-[12px] text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[var(--text-3)]">Explanation (Optional)</label>
              <input
                type="text"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder={`The answer is "abc", with the length of 3.`}
                className="w-full h-[34px] bg-[var(--bg-canvas)] border border-[var(--border)] focus:border-[var(--accent)] rounded-[var(--r-md)] px-2.5 text-[12px] text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none"
              />
            </div>
          </div>

          {/* Hidden Testcases Count */}
          <div className="flex items-center justify-between p-3.5 rounded-[var(--r-md)] bg-[var(--bg-card)] border border-[var(--border)]">
            <div>
              <div className="text-[13px] font-medium text-[var(--text-1)]">Hidden Test Cases</div>
              <div className="text-[11px] text-[var(--text-3)]">Automated edge case and boundary evaluation count</div>
            </div>
            <input
              type="number"
              value={hiddenTestCasesCount}
              onChange={(e) => setHiddenTestCasesCount(Number(e.target.value))}
              min={10}
              max={200}
              className="w-20 h-[34px] bg-[var(--bg-canvas)] border border-[var(--border)] focus:border-[var(--accent)] rounded-[var(--r-md)] px-2 font-mono text-[12px] text-center text-[var(--text-1)] focus:outline-none"
            />
          </div>

          {/* Form Actions Footer */}
          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary !text-[12px] !py-1.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary !text-[12px] !py-1.5"
            >
              {isSubmitting ? (
                <span>Publishing...</span>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Publish Problem</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

