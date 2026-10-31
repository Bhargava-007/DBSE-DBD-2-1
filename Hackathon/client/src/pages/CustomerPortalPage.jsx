import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusPill from '../components/StatusPill';
import PriorityPill from '../components/PriorityPill';
import RelativeTime from '../components/RelativeTime';
import SlaCountdown from '../components/SlaCountdown';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import NewTicketModal from '../components/NewTicketModal';

export default function CustomerPortalPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get('search') || '';
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newModalOpen, setNewModalOpen] = useState(false);

  const fetchMyTickets = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('customer', user.id);
      if (searchQuery) params.set('search', searchQuery);

      const res = await fetch(`/api/tickets?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load tickets');
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [user?.id, searchQuery, addToast]);

  useEffect(() => {
    fetchMyTickets();
  }, [fetchMyTickets]);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-medium text-gray-900 tracking-tight">My Support Requests</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Track inquiries, system requests, and resolution updates
          </p>
        </div>

        <button
          onClick={() => setNewModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-md shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Request</span>
        </button>
      </div>

      {loading ? (
        <div className="p-4 bg-white border border-gray-200 rounded-md">
          <Skeleton className="h-10 w-full" count={4} />
        </div>
      ) : tickets.length === 0 ? (
        <EmptyState
          title="No support tickets yet"
          description="Have a question or running into an issue? Create a request and our support team will help you."
          actionLabel="Create request"
          onAction={() => setNewModalOpen(true)}
        />
      ) : (
        <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
          <div className="divide-y divide-gray-100">
            {tickets.map((t) => (
              <div
                key={t._id}
                onClick={() => navigate(`/tickets/${t.ticketId}`)}
                className="p-4 hover:bg-gray-50/70 cursor-pointer transition-colors flex items-center justify-between gap-4 group"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-medium text-gray-900">
                      {t.ticketId}
                    </span>
                    <PriorityPill priority={t.priority} />
                    <StatusPill status={t.status} />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 truncate transition-colors">
                    {t.subject}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>
                      Created <RelativeTime date={t.createdAt} />
                    </span>
                    <span>•</span>
                    <span>
                      {t.messages?.length || 1} message{t.messages?.length === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <SlaCountdown
                      slaDueAt={t.slaDueAt}
                      slaBreached={t.slaBreached}
                      status={t.status}
                    />
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <NewTicketModal
        isOpen={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        onTicketCreated={() => fetchMyTickets()}
      />
    </div>
  );
}
