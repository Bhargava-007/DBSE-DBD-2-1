import { Router, Request, Response } from 'express';
import { plagiarismDetector } from '../plagiarism/PlagiarismDetector';
import { PlagiarismReport } from '../models/PlagiarismReport';

const router = Router();

/**
 * POST /plagiarism/contest/:contestId/analyze
 * Trigger full tournament plagiarism scan
 */
router.post('/contest/:contestId/analyze', async (req: Request, res: Response): Promise<void> => {
  try {
    const { contestId } = req.params;
    const threshold = parseFloat(req.body.threshold) || 0.7;

    const report = await plagiarismDetector.analyzeContest(contestId, threshold);

    res.status(200).json({
      success: true,
      data: report,
      message: `Plagiarism analysis complete for contest ${contestId}.`,
    });
  } catch (error: any) {
    console.error('[Plagiarism Route] Contest Analyze Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze contest plagiarism.',
    });
  }
});

/**
 * GET /plagiarism/contest/:contestId/results
 * Fetch stored plagiarism report for a contest
 */
router.get('/contest/:contestId/results', async (req: Request, res: Response): Promise<void> => {
  try {
    const { contestId } = req.params;

    const report = await PlagiarismReport.findOne({ contestId })
      .populate('matches.submission1Id', 'language executionTimeMs submittedAt')
      .populate('matches.submission2Id', 'language executionTimeMs submittedAt');

    if (!report) {
      res.status(404).json({
        success: false,
        error: `No plagiarism report found for contest ${contestId}. Please run analysis first.`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error('[Plagiarism Route] Results Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve plagiarism results.',
    });
  }
});

/**
 * POST /plagiarism/submission/:submissionId/check
 * Check an individual submission against peer solutions
 */
router.post('/submission/:submissionId/check', async (req: Request, res: Response): Promise<void> => {
  try {
    const { submissionId } = req.params;
    const threshold = parseFloat(req.body.threshold) || 0.7;

    const result = await plagiarismDetector.checkSubmission(submissionId, threshold);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[Plagiarism Route] Submission Check Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to check submission plagiarism.',
    });
  }
});

/**
 * GET /health
 */
router.get('/health', async (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    service: 'AlgoFlow Plagiarism & Token Fingerprinting Service',
    status: 'online',
    timestamp: new Date().toISOString(),
  });
});

export default router;
