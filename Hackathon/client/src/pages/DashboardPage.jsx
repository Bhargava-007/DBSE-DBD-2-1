import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Inbox,
  AlertTriangle,
  Clock,
  CheckCircle,
  Database,
  Trash2,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusPill from '../components/StatusPill';
import PriorityPill from '../components/PriorityPill';
import RelativeTime from '../components/RelativeTime';
import SlaCountdown from '../components/SlaCountdown';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import NewTicketModal from '../components/NewTicketModal';

export default function DashboardPage() {
  const { devMode } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, ticketsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/tickets?limit=6&sortBy=createdAt&sortOrder=desc'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json();
        setRecentTickets(ticketsData.tickets || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Dev mode: load demo data
  const handleLoadDemo = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch('/api/dev/seed', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load demo data');
      addToast(`Demo data loaded: 15 customers, 40 tickets`, 'success');
      await fetchDashboardData();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  // Dev mode: clear demo data
  const handleClearDemo = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch('/api/dev/seed', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to clear demo data');
      addToast(`Cleared demo data (${data.deletedTickets} tickets deleted)`, 'info');
      await fetchDashboardData();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  const totalTickets = stats?.totalTickets || 0;
  const openCount = stats?.statusCounts?.open || 0;
  const urgentCount = stats?.priorityCounts?.urgent || 0;
  const breachedCount = stats?.slaBreachedCount || 0;
  const avgResolution = stats?.avgResolutionFormatted || '0h';

  // Status breakdown calculations
  const statusCounts = stats?.statusCounts || {
    open: 0,
    in_progress: 0,
    waiting: 0,
    resolved: 0,
    closed: 0,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with Dev Mode action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium text-gray-900 tracking-tight">Support Overview</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Key operational metrics, resolution velocity, and active tickets
          </p>
        </div>

        {/* Dev Mode button pair (only visible when Dev Mode is ON) */}
        {devMode && (
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 p-1 rounded-md text-xs">
            <span className="text-[11px] font-medium text-gray-500 px-1.5 flex items-center gap-1">
              <Database className="w-3 h-3 text-indigo-600" />
              Dev Data:
            </span>
            <button
              onClick={handleLoadDemo}
              disabled={isSeeding}
              className="px-2 py-1 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded font-medium transition-colors disabled:opacity-50"
            >
              Load demo
            </button>
            <button
              onClick={handleClearDemo}
              disabled={isSeeding}
              className="px-2 py-1 bg-white hover:bg-rose-50 border border-gray-200 hover:border-rose-200 text-gray-700 hover:text-rose-600 rounded font-medium transition-colors disabled:opacity-50"
            >
              Clear demo
            </button>
          </div>
        )}
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Open Tickets */}
        <div className="p-4 bg-white border border-gray-200 rounded-md">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">Open Tickets</span>
            <Inbox className="w-4 h-4 text-blue-500" />
          </div>
          {loading ? (
            <Skeleton className="h-7 w-16 mt-1" />
          ) : (
            <div className="text-2xl font-medium text-gray-900 tracking-tight">
              {openCount}
            </div>
          )}
          <div className="text-[11px] text-gray-400 mt-1">Requires initial response</div>
        </div>

        {/* Urgent Priority */}
        <div className="p-4 bg-white border border-gray-200 rounded-md">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">Urgent Priority</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          {loading ? (
            <Skeleton className="h-7 w-16 mt-1" />
          ) : (
            <div className="text-2xl font-medium text-rose-600 tracking-tight">
              {urgentCount}
            </div>
          )}
          <div className="text-[11px] text-gray-400 mt-1">1h SLA target window</div>
        </div>

        {/* SLA Breached */}
        <div className="p-4 bg-white border border-gray-200 rounded-md">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">SLA Breached</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          {loading ? (
            <Skeleton className="h-7 w-16 mt-1" />
          ) : (
            <div
              className={`text-2xl font-medium tracking-tight ${
                breachedCount > 0 ? 'text-amber-700' : 'text-gray-900'
              }`}
            >
              {breachedCount}
            </div>
          )}
          <div className="text-[11px] text-gray-400 mt-1">Past resolution deadline</div>
        </div>

        {/* Avg Resolution Time */}
        <div className="p-4 bg-white border border-gray-200 rounded-md">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">Avg Resolution</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          {loading ? (
            <Skeleton className="h-7 w-16 mt-1" />
          ) : (
            <div className="text-2xl font-medium text-gray-900 tracking-tight">
              {avgResolution}
            </div>
          )}
          <div className="text-[11px] text-gray-400 mt-1">For resolved & closed tickets</div>
        </div>
      </div>

      {/* Grid: 7-Day Chart & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Line Chart: Last 7 Days Volume */}
        <div className="lg:col-span-2 p-5 bg-white border border-gray-200 rounded-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-medium text-gray-900">Ticket Volume (Last 7 Days)</h2>
              <p className="text-xs text-gray-500">Daily ticket creation velocity</p>
            </div>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </div>

          {loading ? (
            <Skeleton className="h-44 w-full" />
          ) : totalTickets === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-md text-center p-4">
              <span className="text-xs font-medium text-gray-500">No ticket activity in the last 7 days</span>
              <span className="text-[11px] text-gray-400 mt-0.5">Tickets will be charted as they arrive</span>
            </div>
          ) : (
            <div className="h-44 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.volumeChart || []} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '12px',
                      boxShadow: 'none',
                    }}
                    labelStyle={{ fontWeight: 500, color: '#111827' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#4f46e5"
                    strokeWidth={1.5}
                    dot={{ fill: '#4f46e5', r: 2 }}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Tickets By Status Breakdown Bar */}
        <div className="p-5 bg-white border border-gray-200 rounded-md flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-medium text-gray-900 mb-0.5">Status Distribution</h2>
            <p className="text-xs text-gray-500 mb-4">Pipeline health breakdown</p>

            {loading ? (
              <Skeleton className="h-4 w-full" count={4} />
            ) : totalTickets === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No active pipeline tickets</p>
            ) : (
              <div className="space-y-2.5">
                {[
                  { key: 'open', label: 'Open', count: statusCounts.open, color: 'bg-blue-500' },
                  { key: 'in_progress', label: 'In Progress', count: statusCounts.in_progress, color: 'bg-amber-500' },
                  { key: 'waiting', label: 'Waiting', count: statusCounts.waiting, color: 'bg-purple-500' },
                  { key: 'resolved', label: 'Resolved', count: statusCounts.resolved, color: 'bg-emerald-500' },
                  { key: 'closed', label: 'Closed', count: statusCounts.closed, color: 'bg-gray-400' },
                ].map((item) => {
                  const pct = totalTickets > 0 ? Math.round((item.count / totalTickets) * 100) : 0;
                  return (
                    <div key={item.key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 font-medium">{item.label}</span>
                        <span className="text-gray-400 font-mono text-[11px]">
                          {item.count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all duration-300`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between">
            <span>Total tickets in system</span>
            <span className="font-mono font-medium text-gray-700">{totalTickets}</span>
          </div>
        </div>
      </div>

      {/* Recent Tickets Table */}
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-900">Recent Tickets</h2>
          <button
            onClick={() => navigate('/tickets')}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition-colors"
          >
            <span>View all tickets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="p-5">
            <Skeleton className="h-8 w-full" count={4} />
          </div>
        ) : recentTickets.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No tickets in system"
              description="Your support desk is clean. Create your first customer ticket or load demo data."
              actionLabel="Create ticket"
              onAction={() => setNewTicketModalOpen(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-500 font-medium">
                  <th className="py-2.5 px-4">Ticket</th>
                  <th className="py-2.5 px-4">Subject</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4">Priority</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">SLA Deadline</th>
                  <th className="py-2.5 px-4">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentTickets.map((t) => (
                  <tr
                    key={t._id}
                    onClick={() => navigate(`/tickets/${t.ticketId}`)}
                    className="hover:bg-gray-50/70 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-gray-900 whitespace-nowrap">
                      {t.ticketId}
                    </td>
                    <td className="py-3 px-4 text-gray-800 font-medium max-w-xs truncate">
                      {t.subject}
                    </td>
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                      {t.customer?.name || 'Unknown'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <PriorityPill priority={t.priority} />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusPill status={t.status} />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <SlaCountdown
                        slaDueAt={t.slaDueAt}
                        slaBreached={t.slaBreached}
                        status={t.status}
                      />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <RelativeTime date={t.createdAt} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <NewTicketModal
        isOpen={newTicketModalOpen}
        onClose={() => setNewTicketModalOpen(false)}
        onTicketCreated={() => fetchDashboardData()}
      />
    </div>
  );
}

