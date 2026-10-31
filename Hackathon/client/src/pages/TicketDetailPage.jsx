import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  Sparkles,
  Clock,
  User,
  ShieldAlert,
  Calendar,
  Building,
  CheckCircle2,
  FileText,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  Loader2,
  Bot,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusPill from '../components/StatusPill';
import PriorityPill from '../components/PriorityPill';
import SlaCountdown from '../components/SlaCountdown';
import RelativeTime from '../components/RelativeTime';
import Skeleton from '../components/Skeleton';
import { formatFullDate, formatStatusLabel, formatPriorityLabel } from '../utils/format';

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isCustomer } = useAuth();
  const { addToast } = useToast();

  const [ticket, setTicket] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [suggestedReply, setSuggestedReply] = useState('');
  const [isClassifying, setIsClassifying] = useState(false);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);

  const messagesEndRef = useRef(null);

  // Check if ticket needs to show assistant typing / polling for initial bot auto-reply
  useEffect(() => {
    if (!ticket) return;
    const hasBotReply = ticket.messages?.some((m) => m.authorType === 'bot');
    const ageSeconds = (Date.now() - new Date(ticket.createdAt).getTime()) / 1000;

    // If ticket was created less than 45 seconds ago and no bot reply yet
    if (!hasBotReply && ageSeconds < 45) {
      setIsAssistantTyping(true);

      const pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/tickets/${id}`);
          if (res.ok) {
            const freshData = await res.json();
            const foundBot = freshData.messages?.some((m) => m.authorType === 'bot');
            if (foundBot) {
              setTicket(freshData);
              setIsAssistantTyping(false);
              clearInterval(pollInterval);
            }
          }
        } catch (e) {
          // ignore polling errors
        }
      }, 2000);

      // Timeout typing indicator after 8s if no bot reply
      const stopTimer = setTimeout(() => {
        setIsAssistantTyping(false);
        clearInterval(pollInterval);
      }, 8000);

      return () => {
        clearInterval(pollInterval);
        clearTimeout(stopTimer);
      };
    } else {
      setIsAssistantTyping(false);
    }
  }, [ticket?._id, id]);

  // Fetch ticket details
  const fetchTicket = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tickets/${id}`);
      if (!res.ok) {
        throw new Error('Ticket not found');
      }
      const data = await res.json();
      setTicket(data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [id, addToast]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  // Fetch agents for properties panel
  useEffect(() => {
    fetch('/api/agents')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAgents(data);
      })
      .catch((err) => console.error(err));
  }, []);

  // Fetch canned classifier suggested reply for this ticket
  useEffect(() => {
    if (ticket && !isCustomer) {
      setIsClassifying(true);
      fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: ticket.subject,
          description: ticket.description,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.suggestedReply) {
            setSuggestedReply(data.suggestedReply);
          }
        })
        .catch((err) => console.error('Failed to get suggested reply:', err))
        .finally(() => setIsClassifying(false));
    }
  }, [ticket?._id, isCustomer]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  // Send reply
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSubmittingReply(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: user?.name || (isCustomer ? 'Customer' : 'Agent'),
          authorType: isCustomer ? 'customer' : 'agent',
          body: replyText.trim(),
        }),
      });

      if (!res.ok) throw new Error('Failed to send reply');
      const updated = await res.json();
      setTicket(updated);
      setReplyText('');
      addToast('Reply sent', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Property update (status, priority, assignee)
  const handlePropertyChange = async (updates) => {
    try {
      const res = await fetch(`/api/tickets/${ticket.ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          by: user?.name || (isCustomer ? 'Customer' : 'Agent'),
        }),
      });

      if (!res.ok) throw new Error('Update failed');
      const updated = await res.json();
      setTicket(updated);
      addToast('Ticket updated', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-96" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <h2 className="text-base font-medium text-gray-900 mb-2">Ticket not found</h2>
        <p className="text-xs text-gray-500 mb-4">
          The requested ticket does not exist or may have been deleted.
        </p>
        <button
          onClick={() => navigate('/tickets')}
          className="text-xs text-indigo-600 font-medium hover:underline"
        >
          Back to tickets
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Top Header / Breadcrumb */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(isCustomer ? '/my-tickets' : '/tickets')}
            className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="Back to list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
              {ticket.ticketId}
            </span>
            <h1 className="text-lg font-medium text-gray-900 truncate max-w-xl">
              {ticket.subject}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PriorityPill priority={ticket.priority} />
          <StatusPill status={ticket.status} />
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Conversation Thread & Reply */}
        <div className="lg:col-span-2 space-y-4">
          {/* Messages list */}
          <div className="bg-white border border-gray-200 rounded-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="text-xs font-medium text-gray-700">Conversation History</span>
              <span className="text-[11px] text-gray-400">
                Created <RelativeTime date={ticket.createdAt} />
              </span>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {ticket.messages?.map((msg, index) => {
                const isBot = msg.authorType === 'bot';
                const isMsgCustomer = msg.authorType === 'customer';

                if (isBot) {
                  return (
                    <div
                      key={index}
                      className="p-4 rounded-md border border-gray-200 bg-gray-50/80 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bot className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                          <span className="font-medium text-gray-900">Support Assistant</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-normal bg-gray-100 border border-gray-200 text-gray-500">
                            Automated
                          </span>
                        </div>
                        <RelativeTime date={msg.createdAt} />
                      </div>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {msg.body}
                      </p>
                    </div>
                  );
                }

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-md border text-xs space-y-1.5 ${
                      isMsgCustomer
                        ? 'bg-gray-50/70 border-gray-200'
                        : 'bg-white border-indigo-100 ring-1 ring-indigo-500/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{msg.author}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                            isMsgCustomer
                              ? 'bg-gray-200/60 text-gray-600'
                              : 'bg-indigo-50 text-indigo-700'
                          }`}
                        >
                          {isMsgCustomer ? 'Customer' : 'Support Specialist'}
                        </span>
                      </div>
                      <RelativeTime date={msg.createdAt} />
                    </div>
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {msg.body}
                    </p>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isAssistantTyping && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-500 animate-in fade-in">
                  <Bot className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>Support Assistant is typing</span>
                  <span className="flex items-center gap-1 ml-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Reply Box */}
          <div className="bg-white border border-gray-200 rounded-md p-4 space-y-3">
            {/* Suggested Reply Chip (Classifier) */}
            {!isCustomer && suggestedReply && (
              <div className="p-2.5 bg-indigo-50/60 border border-indigo-100 rounded-md text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-indigo-700 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>AI Classifier Canned Response</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplyText(suggestedReply)}
                    className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-0.5"
                  >
                    <span>Insert into reply</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-gray-600 line-clamp-2 italic text-[11px]">
                  "{suggestedReply}"
                </p>
              </div>
            )}

            <form onSubmit={handleSendReply} className="space-y-3">
              <textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={
                  isCustomer
                    ? 'Write a reply to support...'
                    : 'Write a response to the customer...'
                }
                className="w-full text-xs p-3 border border-gray-200 rounded-md focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 resize-none"
              />

              <div className="flex items-center justify-between pt-1">
                <div className="text-[11px] text-gray-400">
                  {!isCustomer && (
                    <span>Customer will receive an email notification</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReply || !replyText.trim()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-md shadow-2xs transition-colors disabled:opacity-40"
                >
                  {isSubmittingReply ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Send reply</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Properties & Activity History */}
        <div className="space-y-5">
          {/* Properties Card */}
          <div className="bg-white border border-gray-200 rounded-md p-4 space-y-4">
            <h3 className="text-xs font-medium text-gray-900 border-b border-gray-100 pb-2">
              Ticket Properties
            </h3>

            <div className="space-y-3 text-xs">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Status</span>
                {!isCustomer ? (
                  <select
                    value={ticket.status}
                    onChange={(e) => handlePropertyChange({ status: e.target.value })}
                    className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-800 focus:outline-hidden focus:border-indigo-600"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="waiting">Waiting</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                ) : (
                  <StatusPill status={ticket.status} />
                )}
              </div>

              {/* Priority */}
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Priority</span>
                {!isCustomer ? (
                  <select
                    value={ticket.priority}
                    onChange={(e) => handlePropertyChange({ priority: e.target.value })}
                    className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-800 focus:outline-hidden focus:border-indigo-600"
                  >
                    <option value="low">Low (72h SLA)</option>
                    <option value="medium">Medium (24h SLA)</option>
                    <option value="high">High (4h SLA)</option>
                    <option value="urgent">Urgent (1h SLA)</option>
                  </select>
                ) : (
                  <PriorityPill priority={ticket.priority} />
                )}
              </div>

              {/* Assignee */}
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Assignee</span>
                {!isCustomer ? (
                  <select
                    value={ticket.assignedAgent?._id || ''}
                    onChange={(e) =>
                      handlePropertyChange({ assignedAgent: e.target.value || null })
                    }
                    className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-800 focus:outline-hidden focus:border-indigo-600 max-w-[140px] truncate"
                  >
                    <option value="">Unassigned</option>
                    {agents.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="font-medium text-gray-800">
                    {ticket.assignedAgent?.name || 'Support Team'}
                  </span>
                )}
              </div>

              {/* Category */}
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Category</span>
                <span className="capitalize font-medium text-gray-800 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                  {ticket.category || 'General'}
                </span>
              </div>

              {/* SLA Target */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-gray-500">SLA Countdown</span>
                <SlaCountdown
                  slaDueAt={ticket.slaDueAt}
                  slaBreached={ticket.slaBreached}
                  status={ticket.status}
                />
              </div>

              {ticket.slaDueAt && (
                <div className="text-[11px] text-gray-400 text-right">
                  Target: {formatFullDate(ticket.slaDueAt)}
                </div>
              )}
            </div>

            {/* Customer Details */}
            <div className="border-t border-gray-100 pt-3 space-y-2 text-xs">
              <span className="text-gray-400 uppercase text-[10px] tracking-wider font-medium">
                Customer Information
              </span>
              <div className="space-y-1">
                <p className="font-medium text-gray-900">{ticket.customer?.name}</p>
                <p className="text-gray-500 text-[11px]">{ticket.customer?.email}</p>
                {ticket.customer?.company && (
                  <p className="text-gray-400 text-[11px] flex items-center gap-1">
                    <Building className="w-3 h-3" />
                    <span>{ticket.customer.company}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Activity History Timeline */}
          <div className="bg-white border border-gray-200 rounded-md p-4 space-y-3">
            <h3 className="text-xs font-medium text-gray-900 border-b border-gray-100 pb-2">
              Activity History
            </h3>

            {(!ticket.history || ticket.history.length === 0) ? (
              <p className="text-xs text-gray-400 py-2">No activity recorded yet.</p>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {ticket.history.map((event, idx) => {
                  let eventDesc = `${event.action}`;
                  if (event.action === 'created') {
                    eventDesc = `Ticket created by ${event.by}`;
                  } else if (event.action === 'status_changed') {
                    eventDesc = `Status changed to ${formatStatusLabel(event.to)} by ${event.by}`;
                  } else if (event.action === 'priority_changed') {
                    eventDesc = `Priority changed to ${formatPriorityLabel(event.to)} by ${event.by}`;
                  } else if (event.action === 'assignee_changed') {
                    eventDesc = `Assigned to ${event.to} by ${event.by}`;
                  } else if (event.action === 'sla_breached') {
                    eventDesc = `SLA breached target deadline`;
                  } else if (event.action === 'message_added') {
                    eventDesc = `New message added by ${event.by}`;
                  }

                  return (
                    <div key={idx} className="flex items-start gap-2 text-[11px]">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-gray-700 leading-snug">{eventDesc}</p>
                        <RelativeTime date={event.at} className="text-[10px] text-gray-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

