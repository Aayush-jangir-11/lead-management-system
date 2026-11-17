import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Consume authenticated user directly from AuthContext
  const { user, role, logout } = useAuth();

  const notificationsRef = useRef(null);
  const profileRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  const currentRole = role || 'admin';

  // ─── 1. DYNAMIC ROLE-BASED NAVIGATION ITEMS ──────────────────────────────────
  const getNavItems = (userRole) => {
    // 👑 ADMIN: Sirf Admin pages
    if (userRole === 'admin') {
      return [
        { id: 'admin-dashboard', path: '/admin', label: 'Dashboard' },
        { id: 'admin-users', path: '/admin/users', label: 'Users' },
        { id: 'admin-teams', path: '/admin/teams', label: 'Teams & Depts' },
        { id: 'admin-roles', path: '/admin/roles', label: 'Roles' },
        { id: 'admin-reports', path: '/admin/reports', label: 'Reports' },
        { id: 'admin-settings', path: '/admin/settings', label: 'Settings' },
      ];
    }

    // 💼 SALES PERSON: Sirf Sales Person pages
    if (userRole === 'sales_person') {
      return [
        { id: 'sp-dashboard', path: '/salesperson/dashboard', label: 'Dashboard' },
        { id: 'sp-leads', path: '/salesperson/leads', label: 'My Leads' },
        { id: 'sp-pipeline', path: '/salesperson/pipeline', label: 'Pipeline' },
        { id: 'sp-tasks', path: '/salesperson/tasks', label: 'Tasks' },
        { id: 'sp-reports', path: '/salesperson/reports', label: 'Reports' },
      ];
    }

    // 👔 SALES MANAGER: Manager pages
    return [
      { id: 'mgr-dashboard', path: '/manager/dashboard', label: 'Dashboard' },
      { id: 'mgr-team', path: '/manager/team', label: 'My Team' },
      { id: 'mgr-contacts', path: '/manager/contacts', label: 'Contacts' },
      { id: 'mgr-leads', path: '/manager/leads', label: 'Leads' },
      { id: 'mgr-pipeline', path: '/manager/pipeline', label: 'Pipeline' },
      { id: 'mgr-tasks', path: '/manager/tasks', label: 'Tasks' },
      { id: 'mgr-reports', path: '/manager/reports', label: 'Reports' },
    ];
  };

  const navItems = getNavItems(currentRole);

  // ─── 2. Helpers for Display Info ─────────────────────────────────────────────
  const getHomePath = (userRole) => {
    if (userRole === 'admin') return '/admin';
    if (userRole === 'sales_person') return '/salesperson/dashboard';
    return '/manager/dashboard';
  };

  const getPortalLabel = (userRole) => {
    if (userRole === 'admin') return 'Admin Control Portal';
    if (userRole === 'sales_person') return 'Sales Representative Portal';
    if (userRole === 'sales_manager') return 'Sales Management Portal';
    return 'Lead Management System';
  };

  const getRoleBadge = (userRole) => {
    if (userRole === 'admin') return 'Super Admin';
    if (userRole === 'sales_person') return 'Sales Representative';
    if (userRole === 'sales_manager') return 'Sales Manager';
    return 'CRM User';
  };

  const getInitials = (name) => {
    if (!name) return 'LF';
    return name
      .split(' ')
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const userName = user?.name || (currentRole === 'admin' ? 'Vikramaditya Singhania' : 'Arjun Mehta');
  const userInitials = getInitials(userName);
  const roleBadge = getRoleBadge(currentRole);

  const notifications = [
    {
      id: 1,
      title: 'New Lead Assigned',
      desc: 'Rahul Verma from Acme Corp was assigned to you.',
      time: '2m ago',
      unread: true,
    },
    {
      id: 2,
      title: 'Status Updated',
      desc: 'Priya Singh moved to Qualified stage.',
      time: '1h ago',
      unread: true,
    },
    {
      id: 3,
      title: 'Task Reminder',
      desc: 'Call Vikram Joshi regarding proposal discussion.',
      time: '3h ago',
      unread: false,
    },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut ⌘K / Ctrl+K listener for search
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const searchTarget = currentRole === 'sales_person' ? '/salesperson/leads' : '/leads';
      navigate(`${searchTarget}?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = () => {
    setShowProfileMenu(false);
    logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-md border-b border-slate-200/70 shadow-xs">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[68px]">

          {/* LEFT: Brand Logo & Role-Specific Navigation */}
          <div className="flex items-center space-x-6 lg:space-x-10">
            {/* Logo */}
            <Link
              to={getHomePath(currentRole)}
              className="flex items-center space-x-3 group select-none"
            >
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center">
                <svg
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
                >
                  <circle cx="20" cy="20" r="19" fill="#ECFDF5" />
                  <path
                    d="M11 20C11 15.0294 15.0294 11 20 11C23.5 11 26.5 13 27.8 16"
                    stroke="url(#emerald-grad-1)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M29 20C29 24.9706 24.9706 29 20 29C16.5 29 13.5 27 12.2 24"
                    stroke="url(#emerald-grad-2)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <circle cx="20" cy="20" r="4.5" fill="#059669" />
                  <defs>
                    <linearGradient id="emerald-grad-1" x1="11" y1="11" x2="28" y2="16" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#10B981" />
                      <stop offset="1" stopColor="#047857" />
                    </linearGradient>
                    <linearGradient id="emerald-grad-2" x1="29" y1="29" x2="12" y2="24" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#34D399" />
                      <stop offset="1" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Title & Dynamic Portal Subtitle */}
              <div className="flex flex-col">
                <span className="text-[17px] sm:text-[18px] font-bold text-slate-900 tracking-tight leading-tight group-hover:text-emerald-600 transition-colors">
                  LeadFlow
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-600 tracking-normal leading-tight">
                  {getPortalLabel(currentRole)}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links (ROLE BASED) */}
            <nav className="hidden lg:flex items-center space-x-1 sm:space-x-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.path === '/admin' || item.path === '/salesperson/dashboard' || item.path === '/manager/dashboard'}
                  className={({ isActive }) =>
                    `relative px-3.5 py-5 text-[14px] font-medium transition-all duration-200 cursor-pointer ${isActive
                      ? 'text-emerald-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/70 rounded-lg'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-emerald-600 rounded-t-full shadow-xs" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* RIGHT: Search, Notifications & User Profile */}
          <div className="flex items-center space-x-3 sm:space-x-4">

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-64 lg:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M16.65 11a5.65 5.65 0 11-11.3 0 5.65 5.65 0 0111.3 0z" />
                </svg>
              </div>

              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leads, records..."
                className="w-full pl-9 pr-14 py-2 text-xs sm:text-[13px] bg-slate-50/90 hover:bg-slate-100/70 focus:bg-white text-slate-800 placeholder-slate-400 border border-slate-200/90 rounded-xl outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
              />

              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                <kbd className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded shadow-2xs">
                  ⌘ K
                </kbd>
              </div>
            </form>

            {/* Notification Bell */}
            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border transition-all duration-150 cursor-pointer ${showNotifications
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200/80 shadow-2xs'
                  }`}
                aria-label="View notifications"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-slate-900 text-sm">Notifications</span>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      2 New
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100/80 max-h-80 overflow-y-auto">
                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3.5 hover:bg-slate-50/80 transition-colors cursor-pointer flex items-start space-x-3 ${item.unread ? 'bg-emerald-50/30' : ''
                          }`}
                      >
                        <div
                          className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${item.unread ? 'bg-emerald-600' : 'bg-transparent'
                            }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">{item.title}</p>
                          <p className="text-[12px] text-slate-500 mt-0.5 leading-snug">{item.desc}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{item.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="px-4 pt-2 border-t border-slate-100 text-center">
                    <button className="text-xs font-medium text-emerald-600 hover:text-emerald-700 py-1 cursor-pointer">
                      Mark all as read
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Section */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/60 transition-all cursor-pointer group"
              >
                {/* Dynamic Avatar */}
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-emerald-700 via-teal-600 to-emerald-500 text-white flex items-center justify-center font-bold text-xs sm:text-[13px] tracking-wide shadow-2xs group-hover:ring-2 group-hover:ring-emerald-500/20">
                  {userInitials}
                </div>

                {/* Dynamic Name & Role Badge */}
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-[13px] font-semibold text-slate-800 leading-tight group-hover:text-emerald-600 transition-colors truncate max-w-[130px]">
                    {userName}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 leading-tight">
                    {roleBadge}
                  </span>
                </div>

                {/* Chevron */}
                <svg
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-180 text-slate-600' : ''
                    }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900 truncate">{userName}</p>
                    <p className="text-[11px] text-emerald-700 font-semibold">{roleBadge}</p>
                  </div>

                  <div className="py-1">
                    {/* ADMIN MENU */}
                    {currentRole === 'admin' && (
                      <>
                        <Link
                          to="/admin/profile"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center px-4 py-2 text-xs sm:text-[13px] text-slate-700 hover:bg-slate-50 hover:text-emerald-700 font-medium transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Admin Profile
                        </Link>
                        <Link
                          to="/admin/users"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center px-4 py-2 text-xs sm:text-[13px] text-slate-700 hover:bg-slate-50 hover:text-emerald-700 font-medium transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          Users & Teams
                        </Link>
                        <Link
                          to="/admin/roles"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center px-4 py-2 text-xs sm:text-[13px] text-slate-700 hover:bg-slate-50 hover:text-emerald-700 font-medium transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Roles & Permissions
                        </Link>
                        <Link
                          to="/admin/settings"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center px-4 py-2 text-xs sm:text-[13px] text-slate-700 hover:bg-slate-50 hover:text-emerald-700 font-medium transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          System Settings
                        </Link>
                      </>
                    )}

                    {/* SALES PERSON MENU */}
                    {currentRole === 'sales_person' && (
                      <>
                        <Link
                          to="/salesperson/profile"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center px-4 py-2 text-xs sm:text-[13px] text-slate-700 hover:bg-slate-50 hover:text-emerald-700 font-medium transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          My Profile
                        </Link>
                        <Link
                          to="/salesperson/pipeline"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center px-4 py-2 text-xs sm:text-[13px] text-slate-700 hover:bg-slate-50 hover:text-emerald-700 font-medium transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          My Deals Pipeline
                        </Link>
                        <Link
                          to="/salesperson/tasks"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center px-4 py-2 text-xs sm:text-[13px] text-slate-700 hover:bg-slate-50 hover:text-emerald-700 font-medium transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          My Tasks
                        </Link>
                      </>
                    )}

                    {/* SALES MANAGER MENU */}
                    {currentRole !== 'admin' && currentRole !== 'sales_person' && (
                      <>
                        <Link
                          to="/manager/profile"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center px-4 py-2 text-xs sm:text-[13px] text-slate-700 hover:bg-slate-50 hover:text-emerald-700 font-medium transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Manager Profile
                        </Link>
                        <Link
                          to="/manager/settings"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center px-4 py-2 text-xs sm:text-[13px] text-slate-700 hover:bg-slate-50 hover:text-emerald-700 font-medium transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Settings
                        </Link>
                      </>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center px-4 py-2 text-xs sm:text-[13px] text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left font-semibold"
                    >
                      <svg className="w-4 h-4 mr-2.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu (Strictly Role Based) */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-100 animate-in fade-in duration-150">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative mb-3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M16.65 11a5.65 5.65 0 11-11.3 0 5.65 5.65 0 0111.3 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </form>

            {/* Navigation links for mobile */}
            <div className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.path === '/admin' || item.path === '/salesperson/dashboard' || item.path === '/manager/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive
                      ? 'bg-emerald-50 text-emerald-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}

              {/* Mobile Profile & Sign Out Links */}
              <div className="pt-2 mt-2 border-t border-slate-100 space-y-1">
                <Link
                  to={currentRole === 'admin' ? '/admin/profile' : currentRole === 'sales_person' ? '/salesperson/profile' : '/manager/profile'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>My Profile</span>
                </Link>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                >
                  <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
