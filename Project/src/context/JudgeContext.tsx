import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  Problem, 
  Submission, 
  User, 
  SupportedLanguage, 
  TestCaseResult, 
  Verdict, 
  SystemStatus 
} from '../types/judge';
import { MOCK_PROBLEMS } from '../mock/mockProblems';
import { MOCK_SUBMISSIONS } from '../mock/mockSubmissions';
import { CURRENT_USER, SYSTEM_STATUS } from '../mock/mockUsers';

export type ActivePage = 
  | 'home'
  | 'problems' 
  | 'problem-detail' 
  | 'dashboard' 
  | 'contests' 
  | 'leaderboard' 
  | 'submissions' 
  | 'login' 
  | 'register';

interface JudgeContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  systemStatus: SystemStatus;
  problems: Problem[];
  submissions: Submission[];
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  activeProblemId: string;
  setActiveProblemId: (id: string) => void;
  activeProblem: Problem;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;
  
  // Execution states
  isRunningCode: boolean;
  isSubmitting: boolean;
  lastRunResults: TestCaseResult[] | null;
  lastSubmissionResult: Submission | null;
  
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  runCode: (problem: Problem, language: SupportedLanguage, code: string, customInput?: string) => Promise<TestCaseResult[]>;
  submitSolution: (problem: Problem, language: SupportedLanguage, code: string) => Promise<Submission>;
  isProblemSolved: (problemId: string) => boolean;
  navigateToProblem: (problemId: string) => void;
  navigateToPage: (page: ActivePage) => void;
  addNewProblem: (newProblem: Problem) => void;
}

const JudgeContext = createContext<JudgeContextType | undefined>(undefined);

export const JudgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(CURRENT_USER);
  const [systemStatus] = useState<SystemStatus>(SYSTEM_STATUS);
  const [problems, setProblems] = useState<Problem[]>(MOCK_PROBLEMS);
  const [submissions, setSubmissions] = useState<Submission[]>(MOCK_SUBMISSIONS);
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [activeProblemId, setActiveProblemId] = useState<string>('prob-1');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isRunningCode, setIsRunningCode] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastRunResults, setLastRunResults] = useState<TestCaseResult[] | null>(null);
  const [lastSubmissionResult, setLastSubmissionResult] = useState<Submission | null>(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Global key listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setIsAuthModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeProblem = problems.find(p => p.id === activeProblemId) || problems[0];

  const isProblemSolved = (problemId: string): boolean => {
    return submissions.some(
      s => s.problemId === problemId && s.verdict === 'Accepted' && s.userId === currentUser?.id
    );
  };

  const navigateToProblem = (problemId: string) => {
    setActiveProblemId(problemId);
    setActivePage('problem-detail');
    setLastRunResults(null);
    setLastSubmissionResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPage = (page: ActivePage) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Run Code against Sample Test Cases or Custom Input
  const runCode = async (
    problem: Problem,
    language: SupportedLanguage,
    code: string,
    customInput?: string
  ): Promise<TestCaseResult[]> => {
    setIsRunningCode(true);
    // Simulate BullMQ dispatch & container boot latency
    await new Promise(resolve => setTimeout(resolve, 600));

    let results: TestCaseResult[] = [];

    if (customInput && customInput.trim().length > 0) {
      // Test against custom input
      const executionTime = Math.floor(Math.random() * 25) + 12;
      results = [{
        testCaseId: 'custom-input',
        input: customInput,
        expectedOutput: '(Custom input evaluation)',
        actualOutput: 'Evaluated output for custom test case successfully.',
        passed: true,
        executionTimeMs: executionTime,
        memoryKb: 13500 + Math.floor(Math.random() * 2000),
        stdout: `[stdout] Language runtime: ${language.toUpperCase()}\n[stdout] Docker container ID: sandbox-${Math.random().toString(36).substring(2, 8)}\nFinished in ${executionTime}ms`,
      }];
    } else {
      // Check code syntax / sample test cases
      const isSyntaxError = code.trim().length < 15 || code.includes('SYNTAX_ERROR');
      
      results = problem.sampleTestCases.map((tc, idx) => {
        const executionTime = Math.floor(Math.random() * 20) + 8;
        if (isSyntaxError) {
          return {
            testCaseId: tc.id,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            actualOutput: '',
            passed: false,
            executionTimeMs: executionTime,
            memoryKb: 12400,
            stdout: '',
            error: `Compile Error in user code: missing expected token near line 5`
          };
        }

        return {
          testCaseId: tc.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: tc.expectedOutput,
          passed: true,
          executionTimeMs: executionTime,
          memoryKb: 14200 + idx * 300,
          stdout: `[stdout] Processed sample test case ${idx + 1} within ${executionTime}ms.`,
        };
      });
    }

    setLastRunResults(results);
    setIsRunningCode(false);
    return results;
  };

  // Submit Solution against complete suite
  const submitSolution = async (
    problem: Problem,
    language: SupportedLanguage,
    code: string
  ): Promise<Submission> => {
    setIsSubmitting(true);
    // Realistic multi-test case sandboxed evaluation latency
    await new Promise(resolve => setTimeout(resolve, 1400));

    // Determine verdict
    let verdict: Verdict = 'Accepted';
    let errorMessage: string | undefined = undefined;
    let passed = problem.sampleTestCases.length + problem.hiddenTestCasesCount;
    const total = passed;

    if (code.includes('TLE') || code.includes('while (true)') || code.includes('while(true)')) {
      verdict = 'Time Limit Exceeded';
      passed = Math.floor(total * 0.65);
      errorMessage = `Time Limit Exceeded: Process terminated after ${problem.timeLimitMs}ms threshold.`;
    } else if (code.includes('WA') || code.includes('return false') || code.length < 25) {
      verdict = 'Wrong Answer';
      passed = Math.floor(total * 0.4);
      errorMessage = 'Wrong Answer: Output mismatch on hidden test case #18.';
    } else if (code.includes('MLE')) {
      verdict = 'Memory Limit Exceeded';
      passed = Math.floor(total * 0.7);
      errorMessage = `Memory Limit Exceeded: Allocated 278MB exceeds ${problem.memoryLimitMb}MB limit.`;
    } else if (code.includes('RTE') || code.includes('null')) {
      verdict = 'Runtime Error';
      passed = 4;
      errorMessage = 'Segmentation fault (core dumped): Invalid memory reference.';
    }

    const execTime = verdict === 'Time Limit Exceeded' ? problem.timeLimitMs + 10 : Math.floor(Math.random() * 45) + 6;
    const memKb = verdict === 'Memory Limit Exceeded' ? problem.memoryLimitMb * 1024 + 500 : 13800 + Math.floor(Math.random() * 4000);

    const newSubmission: Submission = {
      id: `sub_${Math.floor(100000 + Math.random() * 900000)}`,
      userId: currentUser?.id || 'guest',
      username: currentUser?.username || 'Guest',
      problemId: problem.id,
      problemTitle: problem.title,
      problemDifficulty: problem.difficulty,
      language,
      code,
      verdict,
      executionTimeMs: execTime,
      memoryKb: memKb,
      submittedAt: new Date().toISOString(),
      testCasesPassed: passed,
      totalTestCases: total,
      stdout: verdict === 'Accepted' ? `Container isolation: gVisor\nAll ${total} test cases passed.\nCPU time: ${execTime}ms | Peak RSS: ${(memKb / 1024).toFixed(1)} MB` : undefined,
      errorMessage,
    };

    setSubmissions(prev => [newSubmission, ...prev]);
    setLastSubmissionResult(newSubmission);
    setIsSubmitting(false);

    // If accepted and not solved yet, update user stats!
    if (verdict === 'Accepted' && currentUser && !isProblemSolved(problem.id)) {
      const diffKey = problem.difficulty === 'Easy' ? 'easySolved' : problem.difficulty === 'Medium' ? 'mediumSolved' : 'hardSolved';
      setCurrentUser({
        ...currentUser,
        solvedCount: currentUser.solvedCount + 1,
        [diffKey]: currentUser[diffKey] + 1,
        rating: currentUser.rating + 8,
      });
    }

    return newSubmission;
  };

  const addNewProblem = (newProblem: Problem) => {
    setProblems(prev => [newProblem, ...prev]);
  };

  return (
    <JudgeContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        systemStatus,
        problems,
        submissions,
        activePage,
        setActivePage,
        activeProblemId,
        setActiveProblemId,
        activeProblem,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        isRunningCode,
        isSubmitting,
        theme,
        toggleTheme,
        lastRunResults,
        lastSubmissionResult,
        runCode,
        submitSolution,
        isProblemSolved,
        navigateToProblem,
        navigateToPage,
        addNewProblem,
      }}
    >
      {children}
    </JudgeContext.Provider>
  );
};

export const useJudge = () => {
  const context = useContext(JudgeContext);
  if (!context) {
    throw new Error('useJudge must be used within a JudgeProvider');
  }
  return context;
};
