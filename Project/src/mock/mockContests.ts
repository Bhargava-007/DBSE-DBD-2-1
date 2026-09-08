import type { Contest, LeaderboardEntry } from '../types/judge';

export const MOCK_CONTESTS: Contest[] = [
  {
    id: 'cnt-412',
    title: 'Weekly Contest 412',
    slug: 'weekly-contest-412',
    startTime: '2026-09-13T08:00:00Z',
    endTime: '2026-09-13T09:30:00Z',
    durationMinutes: 90,
    status: 'Upcoming',
    participantCount: 14209,
    problemIds: ['prob-1', 'prob-3', 'prob-6', 'prob-5'],
    bannerBadge: 'Rated (Div. 1 + Div. 2)',
  },
  {
    id: 'cnt-411',
    title: 'Global CodeSprint 2026',
    slug: 'global-codesprint-2026',
    startTime: '2026-09-08T18:00:00Z',
    endTime: '2026-09-08T21:00:00Z',
    durationMinutes: 180,
    status: 'Live',
    participantCount: 8840,
    problemIds: ['prob-1', 'prob-2', 'prob-7', 'prob-4'],
    bannerBadge: 'LIVE NOW • Division 1',
  },
  {
    id: 'cnt-410',
    title: 'Biweekly Contest 138',
    slug: 'biweekly-contest-138',
    startTime: '2026-09-01T14:30:00Z',
    endTime: '2026-09-01T16:00:00Z',
    durationMinutes: 90,
    status: 'Ended',
    participantCount: 18950,
    problemIds: ['prob-8', 'prob-2', 'prob-3', 'prob-5'],
    bannerBadge: 'Completed',
  }
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    user: {
      id: 'usr_tourist',
      username: 'tourist',
      name: 'Gennady Korotkevich',
      rating: 3845,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      institution: 'ITMO'
    },
    score: 400,
    solvedCount: 4,
    penaltyMinutes: 28,
    problemResults: {
      'prob-1': { solved: true, attempts: 1, timeMinutes: 3 },
      'prob-2': { solved: true, attempts: 1, timeMinutes: 7 },
      'prob-7': { solved: true, attempts: 1, timeMinutes: 11 },
      'prob-4': { solved: true, attempts: 1, timeMinutes: 21 },
    }
  },
  {
    rank: 2,
    user: {
      id: 'usr_ecnerwala',
      username: 'ecnerwala',
      name: 'Andrew He',
      rating: 3620,
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
      institution: 'MIT'
    },
    score: 400,
    solvedCount: 4,
    penaltyMinutes: 34,
    problemResults: {
      'prob-1': { solved: true, attempts: 1, timeMinutes: 4 },
      'prob-2': { solved: true, attempts: 1, timeMinutes: 9 },
      'prob-7': { solved: true, attempts: 1, timeMinutes: 14 },
      'prob-4': { solved: true, attempts: 1, timeMinutes: 24 },
    }
  },
  {
    rank: 3,
    user: {
      id: 'usr_892144',
      username: 'alex_dev',
      name: 'Alex Chen',
      rating: 1842,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      institution: 'San Francisco, CA'
    },
    score: 300,
    solvedCount: 3,
    penaltyMinutes: 42,
    problemResults: {
      'prob-1': { solved: true, attempts: 1, timeMinutes: 5 },
      'prob-2': { solved: true, attempts: 1, timeMinutes: 16 },
      'prob-7': { solved: true, attempts: 2, timeMinutes: 31 },
      'prob-4': { solved: false, attempts: 1 },
    }
  },
  {
    rank: 4,
    user: {
      id: 'usr_892145',
      username: 'sarah_k',
      name: 'Sarah Kim',
      rating: 1910,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      institution: 'Seattle, WA'
    },
    score: 300,
    solvedCount: 3,
    penaltyMinutes: 54,
    problemResults: {
      'prob-1': { solved: true, attempts: 1, timeMinutes: 6 },
      'prob-2': { solved: true, attempts: 2, timeMinutes: 22 },
      'prob-7': { solved: true, attempts: 1, timeMinutes: 38 },
      'prob-4': { solved: false, attempts: 0 },
    }
  },
  {
    rank: 5,
    user: {
      id: 'usr_892146',
      username: 'marcus_v',
      name: 'Marcus Vance',
      rating: 1725,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      institution: 'Austin, TX'
    },
    score: 200,
    solvedCount: 2,
    penaltyMinutes: 29,
    problemResults: {
      'prob-1': { solved: true, attempts: 1, timeMinutes: 8 },
      'prob-2': { solved: true, attempts: 1, timeMinutes: 21 },
      'prob-7': { solved: false, attempts: 2 },
      'prob-4': { solved: false, attempts: 0 },
    }
  }
];
