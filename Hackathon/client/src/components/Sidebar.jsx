import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  Users,
  ShieldAlert,
  Plus,
  ChevronLeft,
  ChevronRight,
  Headphones,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isCollapsed, setIsCollapsed, onOpenNewTicket }) {
  const { isCustomer } = useAuth();

  const agentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tickets', label: 'Tickets', icon: Ticket },
    { to: '/customers', label: 'Customers', icon: Users },
    { to: '/agents', label: 'Agents', icon: Headphones },
  ];

  const customerLinks = [
    { to: '/my-tickets', label: 'My Tickets', icon: Ticket },
  ];

  const links = isCustomer ? customerLinks : agentLinks;

  return (
    <aside
      className={`h-screen bg-gray-50/70 border-r border-gray-200 flex flex-col justify-between shrink-0 transition-all duration-200 select-none ${
        isCollapsed ? 'w-14' : 'w-56'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-3.5 border-b border-gray-200/80">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center text-white shrink-0">
              <Headphones className="w-4 h-4 stroke-[2]" />
            </div>
            {!isCollapsed && (
              <span className="font-medium text-sm text-gray-900 tracking-tight whitespace-nowrap">
                SupportDesk
              </span>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-200/50 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Action button */}
        <div className="p-2.5">
          <button
            onClick={onOpenNewTicket}
            className={`w-full flex items-center justify-center gap-1.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-medium transition-colors shadow-2xs ${
              isCollapsed ? 'px-0' : 'px-3'
            }`}
            title="Create new ticket (Press 'c')"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            {!isCollapsed && <span>New Ticket</span>}
          </button>
        </div>

        {/* Navigation items */}
        <nav className="px-2 space-y-0.5">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-200/60 text-gray-900 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`
                }
                title={link.label}
              >
                <Icon className="w-4 h-4 shrink-0 text-gray-500" />
                {!isCollapsed && <span>{link.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer shortcut helper */}
      {!isCollapsed && (
        <div className="p-3 border-t border-gray-200 text-[11px] text-gray-400 flex items-center justify-between">
          <span>Shortcuts</span>
          <div className="flex gap-1 font-mono text-[10px]">
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded">c</kbd>
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded">/</kbd>
          </div>
        </div>
      )}
    </aside>
  );
}

