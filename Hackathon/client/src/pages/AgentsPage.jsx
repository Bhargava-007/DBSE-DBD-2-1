import React, { useState, useEffect } from 'react';
import { Headphones, Shield, CheckCircle2 } from 'lucide-react';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/agents')
      .then((res) => res.json())
      .then((data) => setAgents(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-medium text-gray-900 tracking-tight">Support Agents</h1>
        <p className="text-xs text-gray-500">
          Agent assignments, operational capacity, and real-time workload distribution
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
        {loading ? (
          <div className="p-6">
            <Skeleton className="h-8 w-full" count={5} />
          </div>
        ) : agents.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No agents found"
              description="Ensure default agents were created on server boot."
              actionLabel=""
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-gray-500 font-medium">
                  <th className="py-2.5 px-4">Agent Name</th>
                  <th className="py-2.5 px-4">Email</th>
                  <th className="py-2.5 px-4">Role</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 w-64">Current Workload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {agents.map((agent) => {
                  const workload = agent.workload || {
                    totalTickets: 0,
                    openTickets: 0,
                    resolvedTickets: 0,
                  };
                  // Progress bar capped at 10 for visual scale
                  const maxCapacity = 10;
                  const workloadPct = Math.min(100, Math.round((workload.openTickets / maxCapacity) * 100));

                  return (
                    <tr key={agent._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-medium text-[11px]">
                            {agent.name.charAt(0)}
                          </div>
                          <span>{agent.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                        {agent.email}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                            agent.role === 'admin'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {agent.role === 'admin' ? 'Admin' : 'Agent'}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Active</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-gray-500">
                            <span>
                              <strong className="font-semibold text-gray-800">
                                {workload.openTickets}
                              </strong>{' '}
                              active
                            </span>
                            <span className="text-gray-400">
                              {workload.totalTickets} total ({workload.resolvedTickets} resolved)
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                workload.openTickets > 5
                                  ? 'bg-rose-500'
                                  : workload.openTickets > 2
                                  ? 'bg-amber-500'
                                  : 'bg-indigo-500'
                              }`}
                              style={{ width: `${workloadPct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

