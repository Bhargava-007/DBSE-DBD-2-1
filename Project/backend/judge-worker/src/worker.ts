import { Worker, Job } from 'bullmq';
import { redisClient } from './config/redis';
import { Submission, ISubmission } from './models/Submission';
import { Problem, IProblem } from './models/Problem';
import { User } from './models/User';
import { Contest } from './models/Contest';
import { testRunner, EvaluationSummary } from './judge/TestRunner';
import { SupportedLanguage } from './judge/languages';

export interface SubmissionJobPayload {
  submissionId: string;
  problemId: string;
  userId: string;
  contestId?: string;
  language: SupportedLanguage;
  code: string;
  timeLimitMs: number;
  memoryLimitMb: number;
  testCases: Array<{
    input: string;
    expectedOutput: string;
    isSample?: boolean;
  }>;
}

const SUBMISSION_QUEUE_NAME = 'submissions';
const CONCURRENCY = parseInt(process.env.MAX_CONCURRENT_JOBS || '3', 10);

/**
 * Update Redis Sorted Set for real-time contest leaderboard rankings
 * Score formula: score = (problemsSolved * 1_000_000) - totalPenaltyMinutes
 */
const updateContestLeaderboard = async (
  contestId: string,
  userId: string
): Promise<void> => {
  try {
    const contest = await Contest.findById(contestId);
    if (!contest) return;

    // Fetch all submissions for this user in this contest
    const submissions = await Submission.find({
      contestId: contest._id,
      userId,
    }).sort({ createdAt: 1 });

    const problemAttempts: Record<string, { solved: boolean; attempts: number; timeMinutes: number }> = {};

    for (const sub of submissions) {
      const pId = sub.problemId.toString();
      if (!problemAttempts[pId]) {
        problemAttempts[pId] = { solved: false, attempts: 0, timeMinutes: 0 };
      }

      if (!problemAttempts[pId].solved) {
        problemAttempts[pId].attempts += 1;

        if (sub.verdict === 'Accepted') {
          problemAttempts[pId].solved = true;
          const minutes = Math.max(
            0,
            Math.floor((sub.createdAt.getTime() - contest.startTime.getTime()) / (1000 * 60))
          );
          problemAttempts[pId].timeMinutes = minutes;
        }
      }
    }

    let solvedCount = 0;
    let penaltyMinutes = 0;

    for (const pId in problemAttempts) {
      const p = problemAttempts[pId];
      if (p.solved) {
        solvedCount += 1;
        penaltyMinutes += p.timeMinutes + (p.attempts - 1) * 20; // 20 min penalty per rejected attempt before AC
      }
    }

    // High score ranks top: solve count is primary weight, penalty minutes deduct from score
    const rankScore = solvedCount * 1000000 - penaltyMinutes;
    const redisKey = `contest:${contestId}:leaderboard`;

    await redisClient.zadd(redisKey, rankScore, userId);
    console.log(`[Contest Leaderboard] Updated Redis ZSET '${redisKey}': user=${userId} score=${rankScore} (solved=${solvedCount}, penalty=${penaltyMinutes}m)`);
  } catch (error: any) {
    console.warn(`[Contest Leaderboard] Error updating leaderboard for contest ${contestId}:`, error.message);
  }
};

/**
 * Core submission processor executed for each BullMQ job
 */
export const processSubmissionJob = async (job: Job<SubmissionJobPayload>): Promise<EvaluationSummary> => {
  const { submissionId, problemId, userId, contestId, language, code, timeLimitMs, memoryLimitMb, testCases } = job.data;

  console.log(`[Worker] Started judging submission ${submissionId} (Lang: ${language.toUpperCase()}, TestCases: ${testCases.length})`);

  // 1. Mark submission status as 'Running' in MongoDB
  await Submission.findByIdAndUpdate(submissionId, { verdict: 'Running' });

  // 2. Execute sandboxed test evaluation
  const evaluation = await testRunner.runAgainstTestCases({
    code,
    language,
    testCases,
    timeLimitMs,
    memoryLimitMb,
  });

  console.log(`[Worker] Judged submission ${submissionId} -> Verdict: ${evaluation.finalVerdict} (${evaluation.testCasesPassed}/${evaluation.totalTestCases} passed, ${evaluation.maxExecutionTimeMs}ms, ${evaluation.maxMemoryKb}KB)`);

  // 3. Persist final results to MongoDB
  const stdoutSnippet = evaluation.results.find((r) => r.stdout.length > 0)?.stdout;

  const updatedSubmission = await Submission.findByIdAndUpdate(
    submissionId,
    {
      verdict: evaluation.finalVerdict,
      executionTimeMs: evaluation.maxExecutionTimeMs,
      memoryKb: evaluation.maxMemoryKb,
      testCasesPassed: evaluation.testCasesPassed,
      totalTestCases: evaluation.totalTestCases,
      errorLog: evaluation.errorLog || evaluation.compilationError,
      stdout: stdoutSnippet,
    },
    { new: true }
  );

  // 4. If problem was solved (Accepted), update User stats & problem counters
  if (evaluation.finalVerdict === 'Accepted') {
    try {
      const problem = await Problem.findById(problemId);
      const user = await User.findById(userId);

      if (problem && user) {
        const alreadySolved = user.solvedProblems.some((id) => id.toString() === problemId);

        if (!alreadySolved) {
          user.solvedProblems.push(problem._id);
          user.rating += 8;

          if (problem.difficulty === 'Easy') user.easySolved += 1;
          else if (problem.difficulty === 'Medium') user.mediumSolved += 1;
          else if (problem.difficulty === 'Hard') user.hardSolved += 1;

          await user.save();
          await Problem.findByIdAndUpdate(problemId, { $inc: { totalAccepted: 1 } });
          console.log(`[Worker] Solved problem recorded for user ${user.username}. New rating: ${user.rating}`);
        }
      }
    } catch (statErr: any) {
      console.warn(`[Worker] User stat update error: ${statErr.message}`);
    }
  }

  // 5. If this submission belongs to a contest, update Redis Leaderboard
  if (contestId) {
    await updateContestLeaderboard(contestId, userId);
  }

  return evaluation;
};

/**
 * Initialize and return the BullMQ Worker instance
 */
export const startJudgeWorker = (): Worker<SubmissionJobPayload> => {
  const worker = new Worker<SubmissionJobPayload>(
    SUBMISSION_QUEUE_NAME,
    async (job) => {
      return await processSubmissionJob(job);
    },
    {
      connection: redisClient,
      concurrency: CONCURRENCY,
      limiter: {
        max: 10,
        duration: 1000,
      },
    }
  );

  worker.on('ready', () => {
    console.log(`[Worker] BullMQ Worker connected to '${SUBMISSION_QUEUE_NAME}' queue (Concurrency: ${CONCURRENCY})`);
  });

  worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed successfully.`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed with error:`, err.message);
  });

  worker.on('error', (err) => {
    console.warn(`[Worker] BullMQ worker connection notice:`, err.message);
  });

  return worker;
};
