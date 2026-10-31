import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  User,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusPill from '../components/StatusPill';
import PriorityPill from '../components/PriorityPill';
import SlaCountdown from '../components/SlaCountdown';
import RelativeTime from '../components/RelativeTime';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import NewTicketModal from '../components/NewTicketModal';

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'waiting', label: 'Waiting' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'closed', label: 'Closed' },
];

const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'];
const STATUS_OPTIONS = ['open', 'in_progress', 'waiting', 'resolved', 'closed'];

export default function TicketsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL-synced state
  const statusFilter = searchParams.get('status') || 'all';
  const priorityFilter = searchParams.get('priority') || 'all';
  const assignedFilter = searchParams.get('agent') || 'all';
  const searchQuery = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1 });
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newModalOpen, setNewModalOpen] = useState(false);

  // Local search text for debouncing
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const searchTimeoutRef = useRef(null);

  // Load agents for inline dropdown
  useEffect(() => {
    fetch('/api/agents')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAgents(data);
      })
      .catch((err) => console.error('Failed to load agents:', err));
  }, []);

  // Sync debounced search to URL params
  useEffect(() => {
    if (localSearch !== searchQuery) {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => {
        updateQueryParam('search', localSearch, true);
      }, 350);
    }
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [localSearch]);

  const updateQueryParam = (key, value, resetPage = false) => {
    const params = new URLSearchParams(searchParams);
    if (!value || value === 'all' || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    if (resetPage) {
      params.delete('page');
    }
    setSearchParams(params);
  };

  // Fetch tickets based on filters
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (priorityFilter !== 'all') params.set('priority', priorityFilter);
      if (assignedFilter !== 'all') params.set('assignedAgent', assignedFilter);
      if (searchQuery) params.set('search', searchQuery);
      params.set('page', currentPage.toString());
      params.set('limit', '15');

      const res = await fetch(`/api/tickets?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load tickets');
      const data = await res.json();
      setTickets(data.tickets || []);
      setPagination(data.pagination || { total: 0, totalPages: 1, page: 1 });
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, assignedFilter, searchQuery, currentPage, addToast]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Inline optimistic status update
  const handleInlineStatusChange = async (ticketId, newStatus, e) => {
    e.stopPropagation();
    const prevTickets = [...tickets];

    // Optimistic update
    setTickets((prev) =>
      prev.map((t) => (t._id === ticketId || t.ticketId === ticketId ? { ...t, status: newStatus } : t))
    );

    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, by: user?.name || 'Agent' }),
      });
      if (!res.ok) throw new Error('Status update failed');
      const updated = await res.json();
      // Replace with server data
      setTickets((prev) =>
        prev.map((t) => (t._id === ticketId || t.ticketId === ticketId ? updated : t))
      );
      addToast(`Ticket ${ticketId} status changed to ${newStatus}`, 'success');
    } catch (err) {
      setTickets(prevTickets);
      addToast(err.message, 'error');
    }
  };

  // Inline optimistic priority update
  const handleInlinePriorityChange = async (ticketId, newPriority, e) => {
    e.stopPropagation();
    const prevTickets = [...tickets];

    // Optimistic update
    setTickets((prev) =>
      prev.map((t) => (t._id === ticketId || t.ticketId === ticketId ? { ...t, priority: newPriority } : t))
    );

    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority, by: user?.name || 'Agent' }),
      });
      if (!res.ok) throw new Error('Priority update failed');
      const updated = await res.json();
      setTickets((prev) =>
        prev.map((t) => (t._id === ticketId || t.ticketId === ticketId ? updated : t))
      );
      addToast(`Ticket ${ticketId} priority set to ${newPriority}`, 'success');
    } catch (err) {
      setTickets(prevTickets);
      addToast(err.message, 'error');
    }
  };

  // Inline optimistic assignee update
  const handleInlineAssigneeChange = async (ticketId, newAgentId, e) => {
    e.stopPropagation();
    const prevTickets = [...tickets];

    const chosenAgent = agents.find((a) => a._id === newAgentId);

    // Optimistic update
    setTickets((prev) =>
      prev.map((t) =>
        t._id === ticketId || t.ticketId === ticketId
          ? { ...t, assignedAgent: chosenAgent || null }
          : t
      )
    );

    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedAgent: newAgentId || null,
          by: user?.name || 'Agent',
        }),
      });
      if (!res.ok) throw new Error('Assignee update failed');
      const updated = await res.json();
      setTickets((prev) =>
        prev.map((t) => (t._id === ticketId || t.ticketId === ticketId ? updated : t))
      );
      addToast(
        `Ticket ${ticketId} assigned to ${chosenAgent ? chosenAgent.name : 'Unassigned'}`,
        'success'
      );
    } catch (err) {
      setTickets(prevTickets);
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-medium text-gray-900 tracking-tight">Tickets</h1>
          <p className="text-xs text-gray-500">
            {pagination.total} ticket{pagination.total === 1 ? '' : 's'} total
          </p>
        </div>

        <button
          onClick={() => setNewModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-md shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Ticket</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-white border border-gray-200 rounded-md">
        {/* Status filter chips */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 text-xs">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => updateQueryParam('status', f.id, true)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors shrink-0 ${
                statusFilter === f.id
                  ? 'bg-gray-900 text-white shadow-2xs'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Priority & Assignee filters */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => updateQueryParam('priority', e.target.value, true)}
            className="text-xs px-2.5 py-1 bg-white border border-gray-200 rounded-md text-gray-700 focus:outline-hidden focus:border-indigo-600"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Assignee filter */}
          <select
            value={assignedFilter}
            onChange={(e) => updateQueryParam('agent', e.target.value, true)}
            className="text-xs px-2.5 py-1 bg-white border border-gray-200 rounded-md text-gray-700 focus:outline-hidden focus:border-indigo-600"
          >
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {agents.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
        {loading ? (
          <div className="p-6">
            <Skeleton className="h-8 w-full" count={8} />
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No tickets match criteria"
              description="Try adjusting your status or priority filters, or create a new support ticket."
              actionLabel="Create ticket"
              onAction={() => setNewModalOpen(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-gray-500 font-medium">
                  <th className="py-2.5 px-3.5 w-24">ID</th>
                  <th className="py-2.5 px-3.5">Subject</th>
                  <th className="py-2.5 px-3.5">Customer</th>
                  <th className="py-2.5 px-3.5">Priority</th>
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5">Assignee</th>
                  <th className="py-2.5 px-3.5">SLA Countdown</th>
                  <th className="py-2.5 px-3.5">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.map((ticket) => (
                  <tr
                    key={ticket._id}
                    onClick={() => navigate(`/tickets/${ticket.ticketId}`)}
                    className="hover:bg-gray-50/70 cursor-pointer transition-colors group"
                  >
                    {/* Ticket ID */}
                    <td className="py-3 px-3.5 font-mono font-medium text-gray-900 whitespace-nowrap">
                      {ticket.ticketId}
                    </td>

                    {/* Subject */}
                    <td className="py-3 px-3.5 text-gray-900 font-medium max-w-sm truncate group-hover:text-indigo-600 transition-colors">
                      {ticket.subject}
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-3.5 text-gray-600 whitespace-nowrap">
                      <div className="truncate max-w-[140px] font-medium text-gray-800">
                        {ticket.customer?.name || 'Customer'}
                      </div>
                      {ticket.customer?.company && (
                        <div className="text-[11px] text-gray-400 truncate max-w-[140px]">
                          {ticket.customer.company}
                        </div>
                      )}
                    </td>

                    {/* Inline Priority Dropdown */}
                    <td
                      className="py-3 px-3.5 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={ticket.priority}
                        onChange={(e) =>
                          handleInlinePriorityChange(ticket.ticketId, e.target.value, e)
                        }
                        className="bg-transparent text-xs rounded border border-transparent hover:border-gray-200 focus:border-indigo-600 px-1 py-0.5 cursor-pointer"
                      >
                        {PRIORITY_OPTIONS.map((p) => (
                          <option key={p} value={p}>
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Inline Status Dropdown */}
                    <td
                      className="py-3 px-3.5 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={ticket.status}
                        onChange={(e) =>
                          handleInlineStatusChange(ticket.ticketId, e.target.value, e)
                        }
                        className="bg-transparent text-xs rounded border border-transparent hover:border-gray-200 focus:border-indigo-600 px-1 py-0.5 cursor-pointer"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Inline Assignee Dropdown */}
                    <td
                      className="py-3 px-3.5 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={ticket.assignedAgent?._id || ''}
                        onChange={(e) =>
                          handleInlineAssigneeChange(ticket.ticketId, e.target.value, e)
                        }
                        className="bg-transparent text-xs text-gray-700 rounded border border-transparent hover:border-gray-200 focus:border-indigo-600 px-1 py-0.5 cursor-pointer max-w-[130px] truncate"
                      >
                        <option value="">Unassigned</option>
                        {agents.map((a) => (
                          <option key={a._id} value={a._id}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* SLA Countdown */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <SlaCountdown
                        slaDueAt={ticket.slaDueAt}
                        slaBreached={ticket.slaBreached}
                        status={ticket.status}
                      />
                    </td>

                    {/* Updated */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <RelativeTime date={ticket.updatedAt || ticket.createdAt} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
            <span>
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} tickets)
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={pagination.page <= 1}
                onClick={() => updateQueryParam('page', (pagination.page - 1).toString())}
                className="p-1 rounded border border-gray-200 hover:bg-white disabled:opacity-40 transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => updateQueryParam('page', (pagination.page + 1).toString())}
                className="p-1 rounded border border-gray-200 hover:bg-white disabled:opacity-40 transition-colors"
                title="Next page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <NewTicketModal
        isOpen={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        onTicketCreated={() => fetchTickets()}
      />
    </div>
  );
}

