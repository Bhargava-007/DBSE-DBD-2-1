import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, X, Ticket, Building, Mail, Calendar, ArrowRight } from 'lucide-react';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import StatusPill from '../components/StatusPill';
import PriorityPill from '../components/PriorityPill';
import RelativeTime from '../components/RelativeTime';
import { formatFullDate } from '../utils/format';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/customers')
      .then((res) => res.json())
      .then((data) => setCustomers(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Fetch customer detail when selected
  useEffect(() => {
    if (selectedCustomerId) {
      setDetailLoading(true);
      fetch(`/api/customers/${selectedCustomerId}`)
        .then((res) => res.json())
        .then((data) => setCustomerDetail(data))
        .catch((err) => console.error(err))
        .finally(() => setDetailLoading(false));
    } else {
      setCustomerDetail(null);
    }
  }, [selectedCustomerId]);

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-medium text-gray-900 tracking-tight">Customers</h1>
        <p className="text-xs text-gray-500">
          Directory of registered clients and their active ticket histories
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
        {loading ? (
          <div className="p-6">
            <Skeleton className="h-8 w-full" count={6} />
          </div>
        ) : customers.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No customers registered yet"
              description="Customers will appear here automatically when tickets are created or customers sign in."
              actionLabel=""
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-gray-500 font-medium">
                  <th className="py-2.5 px-4">Customer Name</th>
                  <th className="py-2.5 px-4">Email</th>
                  <th className="py-2.5 px-4">Company</th>
                  <th className="py-2.5 px-4">Total Tickets</th>
                  <th className="py-2.5 px-4">Customer Since</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((c) => (
                  <tr
                    key={c._id}
                    onClick={() => setSelectedCustomerId(c._id)}
                    className="hover:bg-gray-50/70 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">
                      {c.name}
                    </td>
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">{c.email}</td>
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                      {c.company || '—'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-gray-100 text-gray-700">
                        {c.ticketCount || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 whitespace-nowrap">
                      <RelativeTime date={c.createdAt} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Ticket History Drawer / Modal */}
      {selectedCustomerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-gray-900/20 backdrop-blur-xs">
          <div className="w-full max-w-lg h-full bg-white border-l border-gray-200 shadow-xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/60">
              <h2 className="text-sm font-medium text-gray-900">Customer Profile & History</h2>
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {detailLoading || !customerDetail ? (
                <Skeleton className="h-10 w-full" count={4} />
              ) : (
                <>
                  {/* Customer Info Card */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-md space-y-2 text-xs">
                    <h3 className="font-medium text-sm text-gray-900">
                      {customerDetail.customer?.name}
                    </h3>
                    <div className="space-y-1 text-gray-600">
                      <p className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span>{customerDetail.customer?.email}</span>
                      </p>
                      {customerDetail.customer?.company && (
                        <p className="flex items-center gap-2">
                          <Building className="w-3.5 h-3.5 text-gray-400" />
                          <span>{customerDetail.customer?.company}</span>
                        </p>
                      )}
                      <p className="flex items-center gap-2 text-gray-400 text-[11px]">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          Joined {formatFullDate(customerDetail.customer?.createdAt)}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Customer's Tickets */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-medium text-gray-900">
                        Submitted Tickets ({customerDetail.tickets?.length || 0})
                      </h4>
                    </div>

                    {customerDetail.tickets?.length === 0 ? (
                      <p className="text-xs text-gray-400 py-4 text-center">
                        No tickets recorded for this customer yet.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {customerDetail.tickets?.map((t) => (
                          <div
                            key={t._id}
                            onClick={() => {
                              setSelectedCustomerId(null);
                              navigate(`/tickets/${t.ticketId}`);
                            }}
                            className="p-3 bg-white border border-gray-200 rounded-md hover:border-indigo-300 hover:shadow-xs cursor-pointer transition-all space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[11px] font-semibold text-gray-900">
                                {t.ticketId}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <PriorityPill priority={t.priority} />
                                <StatusPill status={t.status} />
                              </div>
                            </div>
                            <p className="text-xs font-medium text-gray-900 truncate">
                              {t.subject}
                            </p>
                            <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                              <span>
                                Assignee: {t.assignedAgent?.name || 'Unassigned'}
                              </span>
                              <RelativeTime date={t.createdAt} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

