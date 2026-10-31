import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatPriorityLabel } from '../utils/format';

export default function NewTicketModal({ isOpen, onClose, onTicketCreated }) {
  const { user, isCustomer } = useAuth();
  const { addToast } = useToast();

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerCompany, setCustomerCompany] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');

  const [suggestion, setSuggestion] = useState(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const classifyTimerRef = useRef(null);

  // Prefill if customer
  useEffect(() => {
    if (isCustomer && user) {
      setCustomerEmail(user.email || '');
      setCustomerName(user.name || '');
      setCustomerCompany(user.company || '');
    }
  }, [isCustomer, user, isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced 600ms classifier trigger
  useEffect(() => {
    if (!isOpen) {
      setSuggestion(null);
      return;
    }

    const textToAnalyze = `${subject} ${description}`.trim();
    if (textToAnalyze.length < 5) {
      setSuggestion(null);
      return;
    }

    if (classifyTimerRef.current) {
      clearTimeout(classifyTimerRef.current);
    }

    setIsClassifying(true);
    classifyTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject, description }),
        });
        if (res.ok) {
          const data = await res.json();
          setSuggestion(data);
        }
      } catch (err) {
        console.error('Classification error:', err);
      } finally {
        setIsClassifying(false);
      }
    }, 600);

    return () => {
      if (classifyTimerRef.current) {
        clearTimeout(classifyTimerRef.current);
      }
    };
  }, [subject, description, isOpen]);

  if (!isOpen) return null;

  const handleApplySuggestion = () => {
    if (suggestion) {
      setCategory(suggestion.category);
      setPriority(suggestion.priority);
      addToast(`Applied: ${suggestion.category} (${formatPriorityLabel(suggestion.priority)})`, 'info');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      addToast('Please provide both subject and description', 'error');
      return;
    }

    if (!isCustomer && !customerEmail.trim()) {
      addToast('Please enter customer email', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        subject: subject.trim(),
        description: description.trim(),
        customerEmail: isCustomer ? user.email : customerEmail.trim(),
        customerName: isCustomer ? user.name : customerName.trim() || customerEmail.split('@')[0],
        customerCompany: isCustomer ? user.company : customerCompany.trim(),
        category: category || (suggestion ? suggestion.category : undefined),
        priority: priority || (suggestion ? suggestion.priority : undefined),
        creatorName: user?.name || 'User',
      };

      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create ticket');
      }

      const created = await res.json();
      addToast(`Ticket ${created.ticketId} created successfully`, 'success');

      // Reset
      setSubject('');
      setDescription('');
      setCategory('');
      setPriority('');
      setSuggestion(null);

      onClose();
      if (onTicketCreated) {
        onTicketCreated(created);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-xs">
      <div
        className="w-full max-w-xl bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-gray-50/50">
          <h2 className="text-base font-medium text-gray-900">Create new ticket</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {!isCustomer && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Customer Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="alex@customer.com"
                  className="w-full text-sm px-3 py-1.5 border border-gray-200 rounded-md focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full text-sm px-3 py-1.5 border border-gray-200 rounded-md focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Subject <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Cannot process credit card payment for invoice #1024"
              className="w-full text-sm px-3 py-1.5 border border-gray-200 rounded-md focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide specific details, error messages, or context..."
              className="w-full text-sm px-3 py-2 border border-gray-200 rounded-md focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 resize-none"
            />
          </div>

          {/* Classifier suggestion banner */}
          {(suggestion || isClassifying) && (
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs">
              <div className="flex items-center gap-2 text-gray-700">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                {isClassifying ? (
                  <span className="text-gray-400">Analyzing keywords...</span>
                ) : (
                  <span>
                    Suggested:{' '}
                    <strong className="font-medium text-gray-900 capitalize">
                      {suggestion.category}
                    </strong>
                    ,{' '}
                    <strong className="font-medium text-gray-900">
                      {formatPriorityLabel(suggestion.priority)} priority
                    </strong>{' '}
                    <span className="text-gray-400">
                      ({Math.round(suggestion.confidence * 100)}% match)
                    </span>
                  </span>
                )}
              </div>
              {suggestion && (
                <button
                  type="button"
                  onClick={handleApplySuggestion}
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium py-0.5 px-2 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 rounded transition-colors"
                >
                  <Check className="w-3 h-3" />
                  <span>Accept</span>
                </button>
              )}
            </div>
          )}

          {/* Category & Priority overrides */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 bg-white border border-gray-200 rounded-md focus:outline-hidden focus:border-indigo-600"
              >
                <option value="">Auto-detect (Classifier)</option>
                <option value="billing">Billing</option>
                <option value="technical">Technical</option>
                <option value="account">Account</option>
                <option value="shipping">Shipping</option>
                <option value="general">General</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 bg-white border border-gray-200 rounded-md focus:outline-hidden focus:border-indigo-600"
              >
                <option value="">Auto-detect (Classifier)</option>
                <option value="low">Low (72h SLA)</option>
                <option value="medium">Medium (24h SLA)</option>
                <option value="high">High (4h SLA)</option>
                <option value="urgent">Urgent (1h SLA)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-50 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-md shadow-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Create ticket</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
