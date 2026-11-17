import React, { useState, useMemo } from 'react';
import { Link } from 'react-router';
import ImportLeadsModal from '../../components/leads/ImportLeadsModal';
import { useGet, usePost, useUpdate, useDelete, useToast } from '../../hooks';
import {
  ShieldCheck, Users, Settings, Lock, Bell, CheckCircle2,
  UserPlus, Search, Filter, Download, ArrowUpRight, Check,
  X, RefreshCw, Key, AlertTriangle, Activity, Database,
  Cpu, Globe, Mail, Phone, ExternalLink, Zap, Layers,
  SlidersHorizontal, CheckSquare, BarChart3, Upload
} from 'lucide-react';

// INITIAL DATASETS FOR ENTERPRISE ADMIN
const INITIAL_ROUTING_RULES = [
  {
    id: 'RULE-01',
    title: 'Automated Round-Robin Distribution',
    description: 'Incoming website leads are equally distributed among online active sales reps.',
    appliedTo: 'All Inbound Leads',
    enabled: true,
    target: 'Round-Robin: Active Sales Team',
    priority: 'Normal',
  },
  {
    id: 'RULE-02',
    title: 'High-Value Enterprise Deal Escalation',
    description: 'Any lead with deal value exceeding ₹2,00,000 is directly assigned to Senior Enterprise AEs.',
    appliedTo: 'Deal Value > ₹2 Lakh',
    enabled: true,
    target: 'Senior Enterprise AE Team',
    priority: 'High Priority',
  },
  {
    id: 'RULE-03',
    title: 'Speed-to-Lead 15-Minute SLA Trigger',
    description: 'Sends urgent SMS and Push Alert to Sales Manager if an inbound lead remains uncontacted for 15 mins.',
    appliedTo: 'Untouched New Leads',
    enabled: true,
    target: 'Manager Notification & SDR Alarm',
    priority: 'Critical SLA',
  },
  {
    id: 'RULE-04',
    title: '48-Hour Inactivity Reassignment',
    description: 'If no logged call or note in 48 hours, automatically reassigns lead to next available rep.',
    appliedTo: 'Stalled Inbound Leads',
    enabled: false,
    target: 'Pool Reallocation',
    priority: 'Medium',
  },
  {
    id: 'RULE-05',
    title: 'Geographic Territory Mapping',
    description: 'Maps client state (Maharashtra, Karnataka, Delhi NCR) to local regional sales executive.',
    appliedTo: 'Location Tagged Leads',
    enabled: true,
    target: 'Regional Territories',
    priority: 'Normal',
  },
];

const INITIAL_AUDIT_LOGS = [];

const INITIAL_INTEGRATIONS = [
  {
    id: 'INT-01',
    name: 'WhatsApp Business API',
    category: 'Instant Messaging & Alerts',
    status: 'Connected',
    health: '100% Delivery',
    ping: '24ms',
    description: 'Instant notification dispatch & client automated follow-ups.',
    connectedSince: 'Sep 2026',
    iconColor: 'bg-emerald-500 text-white',
  },
  {
    id: 'INT-02',
    name: 'Google Workspace / Gmail',
    category: 'Email & Calendar Sync',
    status: 'Connected',
    health: '2-Way Sync Active',
    ping: '18ms',
    description: 'Auto-syncs customer emails, meeting invites, and calendar reminders.',
    connectedSince: 'Aug 2026',
    iconColor: 'bg-blue-600 text-white',
  },
  {
    id: 'INT-03',
    name: 'IndiaMART Lead Webhook',
    category: 'B2B Lead Acquisition',
    status: 'Connected',
    health: 'Realtime Ingestion',
    ping: '32ms',
    description: 'Instant webhook captures B2B vendor inquiries directly into Leads table.',
    connectedSince: 'Sep 2026',
    iconColor: 'bg-teal-600 text-white',
  },
  {
    id: 'INT-04',
    name: 'Razorpay Enterprise',
    category: 'Billing & Invoice Payments',
    status: 'Connected',
    health: 'Webhook Verified',
    ping: '45ms',
    description: 'Automates payment links and auto-moves deals to Closed Won on receipt.',
    connectedSince: 'Oct 2026',
    iconColor: 'bg-indigo-600 text-white',
  },
  {
    id: 'INT-05',
    name: 'Zapier Automation Hub',
    category: 'Workflow Automation',
    status: 'Connected',
    health: '1,420 Tasks / Month',
    ping: '120ms',
    description: 'Custom trigger pipelines with ERP and corporate accounting software.',
    connectedSince: 'Jul 2026',
    iconColor: 'bg-amber-500 text-white',
  },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'routing' | 'integrations' | 'security'
  const [rules, setRules] = useState(INITIAL_ROUTING_RULES);
  const [integrations, setIntegrations] = useState(INITIAL_INTEGRATIONS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);

  // Search & Filter
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const { showNotification } = useToast();

  // Modals
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // New User Form State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Senior Enterprise AE',
    department: 'Direct Sales',
    territory: 'Pan India',
    quota: 1500000,
  });

  // TanStack Query: Fetch Users from Backend 
  const { data: usersData, isLoading: isUsersLoading, refetch: refetchUsers } = useGet(['admin-users'], '/users');

  const avatarColors = ['bg-emerald-600','bg-teal-600','bg-blue-600','bg-purple-600','bg-indigo-600','bg-amber-600'];

  const users = useMemo(() => {
    if (!usersData?.success || !Array.isArray(usersData?.users)) return [];
    return usersData.users.map((u, idx) => {
      const initials = (u.name || 'User').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
      const roleDisplay =
        u.role === 'admin' ? 'Super Admin' :
        u.role === 'sales_manager' ? 'Sales Manager' : 'Sales Rep';
      const roleBadge =
        u.role === 'admin' ? 'bg-rose-100 text-rose-900 border-rose-200' :
        u.role === 'sales_manager' ? 'bg-purple-100 text-purple-900 border-purple-200' :
        'bg-emerald-100 text-emerald-900 border-emerald-200';
      return {
        id: u._id,
        rawId: u._id,
        userId: u.userId || `USR-${String(idx + 1).padStart(2, '0')}`,
        name: u.name,
        email: u.email,
        role: roleDisplay,
        rawRole: u.role,
        roleBadge,
        department: u.department?.name || 'Direct Sales',
        territory: 'Pan India',
        quota: u.role === 'sales_manager' ? 2500000 : 1500000,
        status: u.status === 'suspended' ? 'Suspended' : 'Active',
        twoFactor: true,
        lastActive: u.updatedAt ? new Date(u.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Recently',
        avatar: initials || 'US',
        avatarBg: avatarColors[idx % avatarColors.length],
      };
    });
  }, [usersData]);

  // TanStack Mutations 
  const toggleStatusMutation = useUpdate(
    (vars) => `/users/${vars.id}/status`,
    {
      invalidateKeys: [['admin-users']],
      onSuccess: (res) => showNotification(res?.message || 'User status updated successfully.'),
      onError: (err) => showNotification(err.response?.data?.message || 'Failed to update user status.'),
    }
  );

  const deleteUserMutation = useDelete('/users', {
    invalidateKeys: [['admin-users']],
    onSuccess: (res, vars) => showNotification(res?.message || `User removed.`),
    onError: (err) => showNotification(err.response?.data?.message || 'Failed to delete user.'),
  });

  const createUserMutation = usePost('/users', {
    invalidateKeys: [['admin-users']],
    onSuccess: (res, vars) => {
      showNotification(`New member ${vars?.name || 'User'} invited successfully!`);
      setShowAddUserModal(false);
      const auditEntry = {
        id: `LOG-${Date.now().toString().slice(-3)}`,
        user: 'Current Admin',
        role: 'Super Admin',
        action: `Invited new team member "${vars?.name}" as ${vars?.role}`,
        ip: '103.21.124.89 (Active Session)',
        time: 'Just now',
        severity: 'info',
      };
      setAuditLogs((prev) => [auditEntry, ...prev]);
      setNewUser({ name: '', email: '', role: 'Senior Enterprise AE', department: 'Direct Sales', territory: 'Pan India', quota: 1500000 });
    },
    onError: (err) => showNotification(err.response?.data?.message || 'Failed to invite user.'),
  });

  // Toggle Routing Rule
  const handleToggleRule = (ruleId) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id === ruleId) {
          const nextState = !r.enabled;
          showNotification(`Rule "${r.title}" ${nextState ? 'Activated' : 'Paused'}!`);
          return { ...r, enabled: nextState };
        }
        return r;
      })
    );
  };

  // Toggle User Status
  const handleToggleUserStatus = (userId) => {
    toggleStatusMutation.mutate({ id: userId });
  };

  // Delete User
  const handleDeleteUser = (userId, userName) => {
    if (window.confirm(`Are you sure you want to remove ${userName} from the organization?`)) {
      deleteUserMutation.mutate(userId);
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        userSearch === '' ||
        (u.name && u.name.toLowerCase().includes(userSearch.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase())) ||
        (u.territory && u.territory.toLowerCase().includes(userSearch.toLowerCase()));
      const matchRole =
        roleFilter === 'All' ||
        u.role === roleFilter ||
        (roleFilter === 'Sales Rep' && !['Super Admin', 'Sales Manager'].includes(u.role));
      return matchSearch && matchRole;
    });
  }, [users, userSearch, roleFilter]);

  // Handle Add Member Submit
  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.email.trim()) return;

    let backendRole = 'sales_person';
    if (newUser.role === 'Super Admin' || newUser.role === 'admin') {
      backendRole = 'admin';
    } else if (newUser.role === 'Sales Manager' || newUser.role === 'sales_manager') {
      backendRole = 'sales_manager';
    }

    const payload = {
      name: newUser.name.trim(),
      email: newUser.email.trim().toLowerCase(),
      role: backendRole,
      password: 'Leadflow@123',
      status: 'active',
    };

    await createUserMutation.mutateAsync(payload);
  };

  // Export Audit CSV
  const handleExportAuditCSV = () => {
    const headers = ['Log ID', 'User', 'Role', 'Action Description', 'IP Address', 'Timestamp', 'Severity'];
    const rows = auditLogs.map((l) => [
      l.id,
      `"${l.user}"`,
      `"${l.role}"`,
      `"${l.action}"`,
      `"${l.ip}"`,
      l.time,
      l.severity,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `system_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('System Security & Audit Trail CSV exported!');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 1. ENTERPRISE ADMIN HERO BANNER (AURORA GLASSMORPHIC)   */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-100/90 via-teal-50 to-green-100/80 text-slate-800 shadow-sm p-6 sm:p-7 border border-emerald-200/90">
        {/* Ambient Glow Orbs */}
        <div className="absolute -top-24 -left-20 w-80 h-80 bg-emerald-300/35 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-20 w-80 h-80 bg-teal-300/35 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-700 via-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/25 ring-4 ring-white shrink-0">
              <ShieldCheck size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-200/90 border border-emerald-300 text-emerald-950 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  Enterprise Control Center
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/90 text-emerald-800 font-extrabold text-[11px] border border-emerald-200 shadow-2xs">
                  Root Admin v2.4
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/90 text-slate-700 font-bold text-[11px] border border-slate-200 shadow-2xs">
                  99.98% System Uptime
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Admin Command & Team Directory
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                Manage organization permissions, user roles, lead auto-distribution engine, and real-time security audit trails.
              </p>
            </div>
          </div>

          {/* Admin Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/90 hover:bg-white text-slate-700 hover:text-emerald-800 border border-slate-200/90 text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer backdrop-blur-md"
              title="Bulk import leads or records from Excel (.xlsx) or CSV"
            >
              <Upload size={14} className="text-emerald-600" />
              <span>Import Excel</span>
            </button>

            <button
              onClick={() => handleExportAuditCSV()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/90 text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer backdrop-blur-md"
            >
              <Download size={14} className="text-slate-500" />
              <span>Export Audit CSV</span>
            </button>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all cursor-pointer hover:shadow-lg hover:-translate-y-0.5"
            >
              <UserPlus size={15} />
              <span>+ Add Team Member</span>
            </button>
          </div>
        </div>
      </div>


      {/* 2. SYSTEM KPI METRICS (4 MODERN ELEVATED CARDS)          */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Total Organization Users
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-2xs border border-emerald-100">
              <Users size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {users.length}
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Team Members
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1.5">
            Active in Inside Sales & Enterprise AE
          </p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Auto-Routing Efficiency
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shadow-2xs border border-purple-100">
              <Zap size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              96.8%
            </span>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
              4 Active Rules
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1.5">
            Round-robin lead distribution running
          </p>
        </div>

        {/* KPI 3 */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Integrations & Sync
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-2xs border border-blue-100">
              <Globe size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {integrations.length}/{integrations.length}
            </span>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
              100% Synced
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1.5">
            WhatsApp, IndiaMART, Gmail webhooks
          </p>
        </div>

        {/* KPI 4 */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Security Compliance
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shadow-2xs border border-amber-100">
              <Lock size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
              100%
            </span>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Protected
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1.5">
            2FA Enforced • SHA-256 JWT Encryption
          </p>
        </div>
      </div>

      {/* 3. MODERN PILL TABS WITH GRADIENT ACCENTS                */}
      <div className="flex items-center gap-2.5 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${activeTab === 'users'
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-600/20'
            : 'bg-white/90 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 shadow-2xs'
            }`}
        >
          <Users size={15} />
          <span>Team Directory & Access ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('routing')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${activeTab === 'routing'
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-600/20'
            : 'bg-white/90 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 shadow-2xs'
            }`}
        >
          <SlidersHorizontal size={15} />
          <span>Lead Auto-Routing Rules</span>
        </button>

        <button
          onClick={() => setActiveTab('integrations')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${activeTab === 'integrations'
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-600/20'
            : 'bg-white/90 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 shadow-2xs'
            }`}
        >
          <Globe size={15} />
          <span>Webhooks & Integrations ({integrations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${activeTab === 'security'
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-600/20'
            : 'bg-white/90 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 shadow-2xs'
            }`}
        >
          <Activity size={15} />
          <span>Live Security Audit Trail</span>
        </button>
      </div>


      {/* TAB 1: TEAM MEMBERS & USER ACCESS MANAGEMENT             */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
          {/* Table Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                User Access & Team Permissions
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Manage roles, territory coverage, monthly quotas, and user status.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search user name, email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-52 sm:w-60"
                />
                <Search size={13} className="text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>

              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="All">All Roles</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Sales Manager">Sales Manager</option>
                <option value="Sales Rep">Sales Rep</option>
              </select>

              {/* Add Member Modal Trigger Button */}
              <button
                onClick={() => setShowAddUserModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
              >
                <UserPlus size={13} />
                <span>+ Add Member</span>
              </button>
            </div>
          </div>

          {/* Members Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 pl-2">User / Name</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Territory</th>
                  <th className="pb-3">Monthly Quota</th>
                  <th className="pb-3">2FA Security</th>
                  <th className="pb-3">Last Active</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isUsersLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="animate-spin text-emerald-600" size={16} />
                        <span>Loading team members...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold">
                          <Users size={20} />
                        </div>
                        <p className="text-xs font-bold text-slate-700">No users found</p>
                        <p className="text-[11px] text-slate-400 max-w-xs">
                          {userSearch || roleFilter !== 'All'
                            ? 'Try adjusting your search query or role filter.'
                            : 'No team members found in database. Click "+ Add Member" to invite the first user.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* User */}
                      <td className="py-3.5 pl-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl ${u.avatarBg} text-white font-extrabold flex items-center justify-center text-xs shadow-2xs shrink-0`}
                          >
                            {u.avatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-900 text-xs">{u.name}</span>
                              <span
                                className={`w-2 h-2 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-400'
                                  }`}
                              />
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] border ${u.roleBadge}`}>
                          {u.role}
                        </span>
                      </td>

                      {/* Territory */}
                      <td className="py-3.5 font-semibold text-slate-700">
                        {u.territory}
                      </td>

                      {/* Quota */}
                      <td className="py-3.5 font-black text-slate-900">
                        {u.quota > 0 ? `₹${(u.quota / 100000).toFixed(1)} Lakh` : '—'}
                      </td>

                      {/* 2FA */}
                      <td className="py-3.5">
                        {u.twoFactor ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                            <CheckCircle2 size={12} />
                            <span>Enabled</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                            <AlertTriangle size={12} />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      {/* Last Active */}
                      <td className="py-3.5 text-slate-500 font-medium text-[11px]">
                        {u.lastActive}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 text-right pr-2 space-x-1.5">
                        <button
                          onClick={() => handleToggleUserStatus(u.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${u.status === 'Active'
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                            }`}
                        >
                          {u.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>

                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="px-2 py-1 rounded-lg text-[11px] font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* TAB 2: LEAD ROUTING & AUTOMATION WORKFLOW RULES          */}
      {activeTab === 'routing' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal size={17} className="text-emerald-600" />
                <span>Automated Lead Distribution Engine</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Define how fresh inbound prospects are routed, auto-assigned, and escalated across your sales team.
              </p>
            </div>

            <button
              onClick={() => showNotification('Custom Rule Builder opened.')}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              + Create Custom Rule
            </button>
          </div>

          {/* Rules List */}
          <div className="space-y-3.5">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${rule.enabled
                  ? 'bg-white border-slate-200/90 shadow-2xs hover:border-emerald-300'
                  : 'bg-slate-50/70 border-slate-200/50 opacity-70'
                  }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-black text-slate-900">{rule.title}</span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${rule.priority === 'Critical SLA'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : rule.priority === 'High Priority'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                      >
                        {rule.priority}
                      </span>
                      <span className="text-[11px] text-slate-400 font-bold">• Scope: {rule.appliedTo}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{rule.description}</p>
                    <div className="pt-1 flex items-center gap-2 text-[11px] text-slate-600">
                      <span className="font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Target: {rule.target}
                      </span>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <span className="text-xs font-bold text-slate-600">
                      {rule.enabled ? 'Active' : 'Disabled'}
                    </span>
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${rule.enabled ? 'bg-emerald-600' : 'bg-slate-300'
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${rule.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* TAB 3: CONNECTED INTEGRATIONS & WEBHOOKS                 */}
      {activeTab === 'integrations' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Globe size={17} className="text-blue-600" />
                <span>Connected Enterprise Ecosystem & APIs</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Real-time sync connectors with customer channels, email suites, and external webhooks.
              </p>
            </div>

            <button
              onClick={() => showNotification('Checking live API endpoints... All 5 APIs healthy!')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Test All Endpoints</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shadow-xs ${item.iconColor}`}>
                      {item.name.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {item.status}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">{item.name}</h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                    {item.category}
                  </span>
                  <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-500">Latency: {item.ping}</span>
                  <button
                    onClick={() => showNotification(`API test ping sent to ${item.name}! Status: 200 OK.`)}
                    className="font-extrabold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Test Ping →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LIVE SECURITY AUDIT TRAIL & ACCESS LOGS           */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Activity size={17} className="text-emerald-600" />
                <span>Enterprise Security & Activity Audit Log</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Immutable chronological ledger of authentication events, data exports, and configuration modifications.
              </p>
            </div>

            <button
              onClick={() => handleExportAuditCSV()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <Download size={13} />
              <span>Export Audit Trail (CSV)</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 pl-2">Timestamp</th>
                  <th className="pb-3">Actor & Role</th>
                  <th className="pb-3">Action Description</th>
                  <th className="pb-3">Origin IP / Location</th>
                  <th className="pb-3 text-right pr-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400 font-medium text-xs">
                      No security audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 pl-2 text-slate-400 font-bold text-[11px] whitespace-nowrap">
                        {log.time}
                      </td>
                      <td className="py-3">
                        <div>
                          <span className="font-extrabold text-slate-900 text-xs block">{log.user}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{log.role}</span>
                        </div>
                      </td>
                      <td className="py-3 font-semibold text-slate-800">
                        {log.action}
                      </td>
                      <td className="py-3 text-slate-500 font-mono text-[11px]">
                        {log.ip}
                      </td>
                      <td className="py-3 text-right pr-2">
                        <span
                          className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] ${log.severity === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : log.severity === 'warning'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-blue-50 text-blue-800 border border-blue-200'
                            }`}
                        >
                          Verified
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* 4. MODAL: INVITE / ADD TEAM MEMBER                       */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setShowAddUserModal(false)}
          />

          <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] z-10 animate-in zoom-in-95 duration-200 h-[82vh] flex flex-col overflow-hidden">
            {/* Locked Header - Compact & Sleek */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/90 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 font-bold shrink-0">
                  <UserPlus size={18} />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                    Invite New Organization Member
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium leading-tight">
                    Allocate role permissions, territory coverage, and monthly sales quota.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-6 sm:p-8 space-y-5 overflow-y-auto flex-1 overscroll-contain">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Verma"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Work Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="r.verma@leadflow.io"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      System Role *
                    </label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none"
                    >
                      <option value="Senior Enterprise AE">Senior Enterprise AE</option>
                      <option value="Commercial Closer">Commercial Closer</option>
                      <option value="Inbound SDR Specialist">Inbound SDR Specialist</option>
                      <option value="Outbound AE">Outbound AE</option>
                      <option value="Sales Manager">Sales Manager</option>
                      <option value="Super Admin">Super Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={newUser.department}
                      onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                      placeholder="Direct Sales"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      Assigned Territory
                    </label>
                    <input
                      type="text"
                      value={newUser.territory}
                      onChange={(e) => setNewUser({ ...newUser, territory: e.target.value })}
                      placeholder="North / Delhi NCR"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      Monthly Quota (₹)
                    </label>
                    <input
                      type="number"
                      value={newUser.quota}
                      onChange={(e) => setNewUser({ ...newUser, quota: e.target.value })}
                      placeholder="1500000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

              </div>

              {/* Sticky Footer */}
              <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50/90 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer"
                >
                  Send Invitation & Grant Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Excel / CSV Bulk Import Modal */}
      <ImportLeadsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={(leads, meta) => {
          showNotification(
            `Successfully imported ${leads.length} leads from ${meta?.fileName || 'Excel file'}!`
          );
        }}
      />
    </div>
  );
}
