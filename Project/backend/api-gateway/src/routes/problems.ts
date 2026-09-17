import { Router, Response } from 'express';
import { z } from 'zod';
import { Problem, IProblem } from '../models/Problem';
import { authenticate, authorize, optionalAuthenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import logger from '../logger';

const router = Router();

// Validation Schemas
const testCaseSchema = z.object({
  input: z.string().min(1, 'Input is required'),
  expectedOutput: z.string().min(1, 'Expected output is required'),
  explanation: z.string().optional(),
});

const starterCodeSchema = z.object({
  cpp: z.string().optional().default(''),
  python: z.string().optional().default(''),
  java: z.string().optional().default(''),
  javascript: z.string().optional().default(''),
});

const createProblemSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(150),
  slug: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  timeLimitMs: z.number().min(100).max(10000).default(1000),
  memoryLimitMb: z.number().min(16).max(1024).default(256),
  tags: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([]),
  sampleTestCases: z.array(testCaseSchema).min(1, 'At least 1 sample test case is required'),
  hiddenTestCases: z.array(testCaseSchema).default([]),
  starterCode: starterCodeSchema.optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  isPublished: z.boolean().optional(),
});

const updateProblemSchema = createProblemSchema.partial();

const queryFilterSchema = z.object({
  search: z.string().optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
  tag: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived', 'all']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'difficulty', 'acceptanceRate', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Generate URL-friendly slug from title
 */
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

/**
 * GET /api/problems
 * Retrieve paginated problem list with optional filtering
 */
router.get(
  '/',
  validate(queryFilterSchema, 'query'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { search, difficulty, tag, status, page, limit, sortBy, sortOrder } = req.query as any;

      const conditions: any[] = [];

      if (status && status !== 'all') {
        conditions.push({ status });
      } else if (!status) {
        // Public list only shows published problems
        conditions.push({
          $or: [
            { status: 'published' },
            { status: { $exists: false }, isPublished: true },
          ],
        });
      }

      if (difficulty) {
        conditions.push({ difficulty });
      }

      if (tag && tag !== 'All') {
        conditions.push({ tags: tag });
      }

      if (search) {
        conditions.push({
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { tags: { $regex: search, $options: 'i' } },
          ],
        });
      }

      const filter = conditions.length > 0 ? { $and: conditions } : {};

      const skip = (page - 1) * limit;
      const sortOptions: Record<string, 1 | -1> = {
        [sortBy]: sortOrder === 'asc' ? 1 : -1,
      };

      const [problems, total] = await Promise.all([
        Problem.find(filter)
          .select('-hiddenTestCases') // Conceal hidden test cases
          .sort(sortOptions)
          .skip(skip)
          .limit(limit),
        Problem.countDocuments(filter),
      ]);

      res.status(200).json({
        success: true,
        data: {
          problems,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error: any) {
      logger.error({ error }, '[Problems Route] List Error');
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve problems list.',
      });
    }
  }
);

/**
 * GET /api/problems/:id
 * Retrieve problem details by MongoDB ID or slug
 */
router.get(
  '/:id',
  optionalAuthenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Allow querying by either MongoDB ObjectId or URL slug
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      const query = isObjectId ? { _id: id } : { slug: id.toLowerCase() };

      const isStaff = req.user && (req.user.role === 'admin' || req.user.role === 'setter');

      // Conceal hidden test cases unless requester is admin or setter
      const problemQuery = Problem.findOne(query);
      if (!isStaff) {
        problemQuery.select('-hiddenTestCases');
      }

      const problem = await problemQuery;

      if (!problem) {
        res.status(404).json({
          success: false,
          error: 'Problem not found.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: problem,
      });
    } catch (error: any) {
      logger.error({ error }, '[Problems Route] Detail Error');
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve problem details.',
      });
    }
  }
);

/**
 * POST /api/problems
 * Create a new problem (Admin and Setter only)
 */
router.post(
  '/',
  authenticate,
  authorize('admin', 'setter'),
  validate(createProblemSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const payload = req.body;
      const baseSlug = payload.slug ? generateSlug(payload.slug) : generateSlug(payload.title);

      // Check if slug exists, append random suffix if collision
      let finalSlug = baseSlug;
      const slugExists = await Problem.findOne({ slug: finalSlug });
      if (slugExists) {
        finalSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
      }

      const problemStatus = payload.status || 'draft';
      const isPublished = problemStatus === 'published';

      const problem = new Problem({
        ...payload,
        status: problemStatus,
        isPublished,
        slug: finalSlug,
        authorId: req.userId,
        authorName: req.user?.name || req.user?.username,
      });

      await problem.save();

      res.status(201).json({
        success: true,
        data: problem,
        message: 'Problem created successfully.',
      });
    } catch (error: any) {
      logger.error({ error }, '[Problems Route] Create Error');
      res.status(500).json({
        success: false,
        error: 'Failed to create new problem.',
      });
    }
  }
);

/**
 * PUT /api/problems/:id
 * Update an existing problem (Admin and Setter)
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'setter'),
  validate(updateProblemSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (updates.title && !updates.slug) {
        updates.slug = generateSlug(updates.title);
      }

      if (updates.status) {
        updates.isPublished = updates.status === 'published';
      } else if (updates.isPublished !== undefined) {
        updates.status = updates.isPublished ? 'published' : 'draft';
      }

      const problem = await Problem.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      });

      if (!problem) {
        res.status(404).json({
          success: false,
          error: 'Problem not found.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: problem,
        message: 'Problem updated successfully.',
      });
    } catch (error: any) {
      logger.error({ error }, '[Problems Route] Update Error');
      res.status(500).json({
        success: false,
        error: 'Failed to update problem.',
      });
    }
  }
);

/**
 * DELETE /api/problems/:id
 * Delete a problem (Admin only)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const problem = await Problem.findByIdAndDelete(id);

      if (!problem) {
        res.status(404).json({
          success: false,
          error: 'Problem not found.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: `Problem '${problem.title}' deleted successfully.`,
      });
    } catch (error: any) {
      logger.error({ error }, '[Problems Route] Delete Error');
      res.status(500).json({
        success: false,
        error: 'Failed to delete problem.',
      });
    }
  }
);

export default router;
