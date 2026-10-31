import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Headphones, User, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const [mode, setMode] = useState('agent'); // 'agent' or 'customer'
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerCompany, setCustomerCompany] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginAsAgent, loginAsCustomer, user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      navigate(user.type === 'customer' ? '/my-tickets' : '/dashboard');
    }
  }, [user, navigate]);

  // Fetch agents on mount
  useEffect(() => {
    fetch('/api/agents')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAgents(data);
          setSelectedAgentId(data[0]._id);
        }
      })
      .catch((err) => console.error('Failed to load agents:', err));
  }, []);

  const handleAgentLogin = (e) => {
    e.preventDefault();
    const agent = agents.find((a) => a._id === selectedAgentId) || agents[0];
    if (!agent) {
      addToast('No agent profiles found. Ensure the server is running.', 'error');
      return;
    }
    loginAsAgent(agent);
    addToast(`Signed in as ${agent.name} (${agent.role})`, 'success');
    navigate('/dashboard');
  };

  const handleCustomerLogin = async (e) => {
    e.preventDefault();
    if (!customerEmail.trim() || !customerName.trim()) {
      addToast('Please enter your name and email address', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customerName.trim(),
          email: customerEmail.trim(),
          company: customerCompany.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to sign in');
      }

      const customer = await res.json();
      loginAsCustomer(customer);
      addToast(`Welcome, ${customer.name}!`, 'success');
      navigate('/my-tickets');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-md shadow-sm p-6 space-y-6">
        {/* Brand */}
        <div className="text-center space-y-1">
          <div className="inline-flex w-9 h-9 rounded-md bg-indigo-600 items-center justify-center text-white mb-2 shadow-2xs">
            <Headphones className="w-5 h-5 stroke-[2]" />
          </div>
          <h1 className="text-lg font-medium text-gray-900">SupportDesk</h1>
          <p className="text-xs text-gray-500">Sign in to your customer support account</p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-md text-xs font-medium">
          <button
            type="button"
            onClick={() => setMode('agent')}
            className={`py-1.5 rounded transition-all ${
              mode === 'agent'
                ? 'bg-white text-gray-900 shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Agent Portal
          </button>
          <button
            type="button"
            onClick={() => setMode('customer')}
            className={`py-1.5 rounded transition-all ${
              mode === 'customer'
                ? 'bg-white text-gray-900 shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Customer Portal
          </button>
        </div>

        {/* Agent Form */}
        {mode === 'agent' && (
          <form onSubmit={handleAgentLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Select Agent Profile
              </label>
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              >
                {agents.map((agent) => (
                  <option key={agent._id} value={agent._id}>
                    {agent.name} — {agent.role === 'admin' ? 'Admin' : 'Support Specialist'}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-medium transition-colors shadow-2xs"
            >
              <span>Continue as Agent</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* Customer Form */}
        {mode === 'customer' && (
          <form onSubmit={handleCustomerLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Your Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Jane Cooper"
                className="w-full text-xs px-3 py-1.5 border border-gray-200 rounded-md focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="jane@company.com"
                className="w-full text-xs px-3 py-1.5 border border-gray-200 rounded-md focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Company (Optional)
              </label>
              <input
                type="text"
                value={customerCompany}
                onChange={(e) => setCustomerCompany(e.target.value)}
                placeholder="Acme Corp"
                className="w-full text-xs px-3 py-1.5 border border-gray-200 rounded-md focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-medium transition-colors shadow-2xs disabled:opacity-50 pt-2"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <span>Continue as Customer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="pt-2 text-center text-[11px] text-gray-400 border-t border-gray-100">
          Fast local authentication with zero third-party tracking.
        </div>
      </div>
    </div>
  );
}
