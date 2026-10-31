import React, { useState, useRef, useEffect } from 'react';
import { Search, User, ChevronDown, LogOut, Terminal, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TopBar({ onSearch, searchValue = '' }) {
  const { user, isCustomer, devMode, toggleDevMode, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const searchInputRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Shortcut "/" focuses search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-14 border-b border-gray-200 bg-white px-5 flex items-center justify-between shrink-0">
      {/* Search Input */}
      <div className="relative w-72 sm:w-80">
        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchValue}
          onChange={(e) => onSearch && onSearch(e.target.value)}
          placeholder="Search tickets, subject, id... (Press '/')"
          className="w-full text-xs pl-8 pr-8 py-1.5 bg-gray-50/70 border border-gray-200 rounded-md focus:bg-white focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
        />
        <kbd className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 border border-gray-200 bg-white px-1 rounded font-mono">
          /
        </kbd>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors text-xs text-gray-700"
          >
            <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-medium text-[11px]">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <span className="block font-medium text-gray-900 leading-tight">
                {user?.name || 'Anonymous'}
              </span>
              <span className="block text-[10px] text-gray-400 uppercase tracking-wider">
                {isCustomer ? 'Customer' : user?.role || 'Agent'}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 mt-1.5 w-56 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50 text-xs">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-gray-500 text-[11px] truncate">{user?.email}</p>
              </div>

              {/* Dev Mode Toggle */}
              <button
                onClick={toggleDevMode}
                className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 text-gray-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-gray-400" />
                  <span>Dev mode</span>
                </div>
                <div
                  className={`w-7 h-4 rounded-full transition-colors relative flex items-center p-0.5 ${
                    devMode ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full bg-white transition-transform ${
                      devMode ? 'translate-x-3' : 'translate-x-0'
                    }`}
                  />
                </div>
              </button>

              <div className="border-t border-gray-100 my-1" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-rose-600 hover:bg-rose-50/50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Switch user / Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
