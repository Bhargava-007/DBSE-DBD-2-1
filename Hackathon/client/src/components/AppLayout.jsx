import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import NewTicketModal from './NewTicketModal';
import { useAuth } from '../context/AuthContext';

export default function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [user, location.pathname, navigate]);

  // Global keyboard shortcut: 'c' opens new ticket modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName;
      if (
        e.key.toLowerCase() === 'c' &&
        activeTag !== 'INPUT' &&
        activeTag !== 'TEXTAREA' &&
        activeTag !== 'SELECT' &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        e.preventDefault();
        setNewTicketOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleGlobalSearch = (val) => {
    // If not already on tickets page, navigate to tickets with search
    if (user?.type === 'customer') {
      navigate(`/my-tickets?search=${encodeURIComponent(val)}`);
    } else {
      navigate(`/tickets?search=${encodeURIComponent(val)}`);
    }
  };

  const handleTicketCreated = (newTicket) => {
    // Navigate to ticket detail or reload current view
    if (newTicket && newTicket.ticketId) {
      navigate(`/tickets/${newTicket.ticketId}`);
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-white overflow-hidden text-sm">
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        onOpenNewTicket={() => setNewTicketOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onSearch={handleGlobalSearch} />

        <main className="flex-1 overflow-y-auto bg-white p-6">
          <Outlet />
        </main>
      </div>

      <NewTicketModal
        isOpen={newTicketOpen}
        onClose={() => setNewTicketOpen(false)}
        onTicketCreated={handleTicketCreated}
      />
    </div>
  );
}
