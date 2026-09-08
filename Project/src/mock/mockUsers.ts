import type { User, SystemStatus } from '../types/judge';

export const CURRENT_USER: User = {
  id: 'usr_892144',
  username: 'alex_dev',
  name: 'Alex Chen',
  email: 'alex.chen@example.com',
  role: 'user',
  rating: 1842,
  rank: 142,
  solvedCount: 148,
  easySolved: 74,
  mediumSolved: 58,
  hardSolved: 16,
  institution: 'San Francisco, CA',
  createdAt: '2024-08-15T09:00:00Z',
};

export const DEMO_USERS: User[] = [
  CURRENT_USER,
  {
    id: 'usr_892145',
    username: 'sarah_k',
    name: 'Sarah Kim',
    email: 'sarah.k@example.com',
    role: 'setter',
    rating: 1910,
    rank: 98,
    solvedCount: 172,
    easySolved: 80,
    mediumSolved: 68,
    hardSolved: 24,
    institution: 'Seattle, WA',
    createdAt: '2024-05-10T10:00:00Z',
  },
  {
    id: 'usr_892146',
    username: 'marcus_v',
    name: 'Marcus Vance',
    email: 'marcus.v@example.com',
    role: 'user',
    rating: 1725,
    rank: 310,
    solvedCount: 115,
    easySolved: 62,
    mediumSolved: 43,
    hardSolved: 10,
    institution: 'Austin, TX',
    createdAt: '2024-09-01T11:00:00Z',
  },
];

export const SYSTEM_STATUS: SystemStatus = {
  bullMqQueueStatus: 'Active',
  activeWorkers: 8,
  totalWorkers: 8,
  avgLatencyMs: 28,
  submissionsToday: 4291,
  redisMemoryUsage: '142.8 MB / 2.0 GB',
  dockerSandbox: 'Online (gVisor Isolated)',
};
