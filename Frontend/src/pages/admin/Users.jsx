import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router';
import {
  Users, UserPlus, Search, Filter, ShieldCheck, Download,
  Mail, Phone, MapPin, Target, MoreVertical, CheckCircle2,
  AlertTriangle, Shield, Check, X, RefreshCw, Eye, Trash2,
  Lock, Edit3, ArrowUpRight, Sparkles, Activity, Award, Upload
} from 'lucide-react';
import CreateUserModal from '../../components/admin/CreateUserModal';
import ImportLeadsModal from '../../components/leads/ImportLeadsModal';
import { useGet, usePost, useUpdate, useDelete, useToast } from '../../hooks';

const mapBackendUser = (bUser) => {
  const initials = bUser.name
    ? bUser.name
      .trim()
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
    : 'US';

  // Format display role
  let roleDisplay = 'Sales Representative';
  if (bUser.role === 'admin') roleDisplay = 'Administrator';
  else if (bUser.role === 'sales_manager') roleDisplay = 'Sales Manager';
  else if (bUser.role === 'sales_person') roleDisplay = 'Sales Representative';
  else if (bUser.role) roleDisplay = bUser.role;

  // Format display status
  const statusDisplay =
    bUser.status && bUser.status.toLowerCase() === 'suspended' ? 'Suspended' : 'Active';

  return {
    _id: bUser._id,
    id: bUser.userId || (bUser._id ? `USR-${String(bUser._id).slice(-4).toUpperCase()}` : 'USR-00'),
    name: bUser.name || 'Unnamed User',
    email: bUser.email || '',
    phone: bUser.phone || '+91 98000 00000',
    role: roleDisplay,
    department: bUser.department?.name || (typeof bUser.department === 'string' ? bUser.department : 'Inside Sales'),
    territory: bUser.territory || 'North India & NCR',
    status: statusDisplay,
    twoFactor: bUser.twoFactor ?? true,
    lastActive: bUser.updatedAt ? new Date(bUser.updatedAt).toLocaleDateString() : 'Just now',
    avatar: initials || 'US',
    avatarBg: bUser.role === 'admin' ? 'bg-purple-600' : bUser.role === 'sales_manager' ? 'bg-emerald-600' : 'bg-blue-600',
    quota: bUser.quota || 1500000,
    leadsAssigned: bUser.leadsAssigned || 0,
    closedDeals: bUser.closedDeals || 0,
    conversionRate: bUser.conversionRate || '0.0%',
  };
};

export default function UsersPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const { showToast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // 1. TanStack useGet Hook: Fetch users from MongoDB backend
  const { data: usersData, isLoading, refetch } = useGet(['users'], '/users');

  const users = useMemo(() => {
    if (usersData?.success && Array.isArray(usersData.users)) {
      return usersData.users.map(mapBackendUser);
    }
    return [];
  }, [usersData]);

  // 2. TanStack Mutations: Auto-invalidate 'users' cache
  const createUserMutation = usePost('/users', {
    invalidateKeys: [['users']],
    onSuccess: (res, vars) => {
      showToast(`New user "${vars?.name || 'User'}" saved to database!`);
      handleCloseModal();
    },
    onError: (err) => {
      showToast(err.response?.data?.message || 'Error saving user to database');
    },
  });

  const updateUserMutation = useUpdate('/users', {
    invalidateKeys: [['users']],
    onSuccess: (res, vars) => {
      showToast(`User "${vars?.name || 'User'}" updated in database!`);
      handleCloseModal();
    },
    onError: (err) => {
      showToast(err.response?.data?.message || 'Error updating user.');
    },
  });

  const toggleStatusMutation = useUpdate(
    (vars) => `/users/${vars.id}/status`,
    {
      invalidateKeys: [['users']],
      onSuccess: (res) => {
        showToast(res?.message || 'Status updated successfully.');
      },
      onError: (err) => {
        showToast(err.response?.data?.message || 'Failed to update user status.');
      },
    }
  );

  const deleteUserMutation = useDelete('/users', {
    invalidateKeys: [['users']],
    onSuccess: (res) => {
      showToast(res?.message || 'User removed from database.');
    },
    onError: (err) => {
      showToast(err.response?.data?.message || 'Failed to delete user.');
    },
  });

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setIsCreateModalOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingUser(null);
  };

  const toBackendRole = (roleStr) => {
    if (!roleStr) return 'sales_person';
    const lower = String(roleStr).toLowerCase();
    if (lower.includes('admin')) return 'admin';
    if (lower.includes('manager')) return 'sales_manager';
    return 'sales_person';
  };

  const handleSaveUser = async (userObj) => {
    if (editingUser) {
      // 1. UPDATE USER via TanStack Mutation
      const targetId = editingUser._id || editingUser.id;
      const payload = {
        id: targetId,
        userId: userObj.id,
        name: userObj.name,
        phone: userObj.phone,
        role: toBackendRole(userObj.role),
      };
      if (userObj.password) payload.password = userObj.password;
      await updateUserMutation.mutateAsync(payload);
    } else {
      // 2. CREATE USER via TanStack Mutation
      const payload = {
        userId: userObj.id,
        name: userObj.name,
        email: userObj.email,
        phone: userObj.phone,
        password: userObj.password,
        role: toBackendRole(userObj.role),
        status: 'active',
      };
      await createUserMutation.mutateAsync(payload);
    }
  };

  const handleToggleStatus = (id) => {
    const target = users.find((u) => u.id === id || u._id === id);
    const targetId = target?._id || id;
    toggleStatusMutation.mutate({ id: targetId });
  };

  const handleDeleteUser = (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from system?`)) return;
    const target = users.find((u) => u.id === id || u._id === id);
    const targetId = target?._id || id;
    deleteUserMutation.mutate(targetId);
  };

  const handleExportCSV = () => {
    const headers = ['User ID', 'Name', 'Email', 'Phone', 'Role', 'Department', 'Territory', 'Status', 'Monthly Quota', '2FA Enabled'];
    const rows = users.map((u) => [
      u.id,
      `"${u.name}"`,
      u.email,
      u.phone,
      `"${u.role}"`,
      `"${u.department}"`,
      `"${u.territory}"`,
      u.status,
      u.quota,
      u.twoFactor ? 'Yes' : 'No',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `leadflow_users_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Users list exported as CSV!');
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.territory.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'All' || u.role.toLowerCase().includes(roleFilter.toLowerCase());
      const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === 'Active').length;
    const managers = users.filter((u) => u.role.includes('Manager')).length;
    const totalQuota = users.reduce((acc, u) => acc + (u.quota || 0), 0);
    return { total, active, managers, totalQuota };
  }, [users]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">

      {/* Aurora Glassmorphic Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-100/90 via-teal-50 to-green-100/80 p-6 sm:p-7 border border-emerald-200/60 shadow-xs">
        {/* Ambient Glow Orbs */}
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-emerald-400/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-teal-400/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 shrink-0">
              <Users size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Users & Team Management
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-emerald-800 font-extrabold text-[11px] border border-emerald-300/80 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {users.length} Active Members
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                Configure roles, adjust monthly revenue quotas, monitor team pipelines, and enforce RBAC access.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <Link
              to="/admin/roles"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/90 hover:bg-white text-emerald-800 border border-emerald-200/80 text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer backdrop-blur-sm"
            >
              <Shield size={14} className="text-emerald-600" />
              <span>Roles & RBAC</span>
            </Link>

            <button
              onClick={fetchUsers}
              disabled={isLoading}
              title="Sync users from MongoDB database"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/90 hover:bg-white text-slate-700 border border-slate-200 text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer backdrop-blur-sm disabled:opacity-60"
            >
              <RefreshCw size={14} className={`text-slate-500 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
              <span>{isLoading ? 'Syncing...' : 'Sync DB'}</span>
            </button>

            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/90 hover:bg-white text-slate-700 hover:text-emerald-800 border border-slate-200 text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer backdrop-blur-sm"
              title="Import from Excel (.xlsx) or CSV"
            >
              <Upload size={14} className="text-emerald-600" />
              <span>Import Excel</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/90 hover:bg-white text-slate-700 border border-slate-200 text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer backdrop-blur-sm"
            >
              <Download size={14} className="text-slate-500" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold shadow-md shadow-emerald-600/25 hover:shadow-lg hover:shadow-emerald-600/35 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <UserPlus size={15} />
              <span>+ Add New User</span>
            </button>
          </div>
        </div>
      </div>

      {/* Create / Edit User Modal Component */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        onUserCreated={handleSaveUser}
        userToEdit={editingUser}
      />

      {/* 4 Elevated Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Total Team Members
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Users size={18} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stats.total}</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
              100% Seats Used
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium flex items-center gap-1.5">
            <Sparkles size={12} className="text-emerald-500 shrink-0" />
            Licensed enterprise seats
          </p>
        </div>

        {/* Active Accounts */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Active Routing
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-sm shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Activity size={18} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">{stats.active}</span>
            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
              {stats.total - stats.active} Suspended
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
            Ready for live lead routing
          </p>
        </div>

        {/* Team Leadership */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Team Leadership
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-purple-700 tracking-tight">{stats.managers}</span>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200/70 px-2 py-0.5 rounded-full">
              Supervisors
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium flex items-center gap-1.5">
            <Award size={12} className="text-purple-500 shrink-0" />
            Monitoring pipeline approvals
          </p>
        </div>

        {/* Combined Team Quota */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Combined Monthly Quota
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Target size={18} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">₹{(stats.totalQuota / 100000).toFixed(1)}L</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
              Monthly
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium flex items-center gap-1.5">
            <ArrowUpRight size={12} className="text-emerald-500 shrink-0" />
            Cumulative sales target
          </p>
        </div>
      </div>

      {/* Filter Toolbar & Search */}
      <div className="bg-white/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, territory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400 shrink-0" />
            <span className="text-xs font-bold text-slate-600">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all cursor-pointer"
            >
              <option value="All">All Roles</option>
              <option value="Manager">Managers</option>
              <option value="Enterprise">Enterprise AEs</option>
              <option value="Commercial">Commercial / Closer</option>
              <option value="Representative">Representatives</option>
              <option value="SDR">SDR Specialists</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="Active">Active Only</option>
              <option value="Suspended">Suspended Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 via-emerald-50/40 to-slate-50 border-b border-slate-200/80 text-[11px] font-black uppercase tracking-wider text-slate-600">
                <th className="py-4 px-5">User & Contact</th>
                <th className="py-4 px-4">Role & Dept</th>
                <th className="py-4 px-4">Territory</th>
                <th className="py-4 px-4 text-right">Target Quota</th>
                <th className="py-4 px-4 text-center">Assigned / Won</th>
                <th className="py-4 px-4 text-center">2FA Security</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/90 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-14 text-center text-slate-400 font-medium">
                    <Users size={32} className="mx-auto mb-2 text-slate-300" />
                    No users found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-emerald-50/30 transition-colors group">
                    {/* User & Contact */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-xs ring-2 ring-white shrink-0 ${user.avatarBg}`}
                        >
                          {user.avatar}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                            {user.name}
                            <span className="text-[10px] font-mono text-slate-400 font-normal">
                              ({user.id})
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Mail size={11} className="text-slate-400" />
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role & Dept */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{user.role}</div>
                      <div className="text-[11px] text-slate-400 font-medium">{user.department}</div>
                    </td>

                    {/* Territory */}
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 bg-slate-100/90 px-2.5 py-1 rounded-lg border border-slate-200/60">
                        <MapPin size={11} className="text-slate-500" />
                        {user.territory}
                      </div>
                    </td>

                    {/* Quota */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{(user.quota / 100000).toFixed(1)}L
                      <span className="block text-[10px] font-sans text-slate-400 font-normal">/month</span>
                    </td>

                    {/* Assigned / Won */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="font-bold text-slate-800">
                        {user.leadsAssigned} <span className="text-slate-400 font-normal">leads</span>
                      </div>
                      <div className="text-[10px] font-bold text-emerald-600">
                        {user.closedDeals} Won ({user.conversionRate})
                      </div>
                    </td>

                    {/* 2FA */}
                    <td className="py-3.5 px-4 text-center">
                      {user.twoFactor ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                          <Check size={11} /> 2FA On
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full">
                          Off
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${user.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 text-slate-500 hover:text-emerald-700 transition-all cursor-pointer shadow-2xs"
                          title="Edit User Details"
                        >
                          <Edit3 size={13} />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          className={`p-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer shadow-2xs ${user.status === 'Active'
                              ? 'bg-white hover:bg-rose-50 border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700'
                            }`}
                          title={user.status === 'Active' ? 'Suspend User' : 'Activate User'}
                        >
                          {user.status === 'Active' ? <Lock size={13} /> : <CheckCircle2 size={13} />}
                        </button>

                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-400 hover:text-rose-600 transition-all cursor-pointer shadow-2xs"
                          title="Delete User"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="py-3.5 px-6 bg-slate-50/80 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 font-semibold">
          <span>Showing <span className="font-bold text-slate-800">{filteredUsers.length}</span> of <span className="font-bold text-slate-800">{users.length}</span> total team members</span>
          <span className="flex items-center gap-1.5 text-slate-400 font-medium">
            <ShieldCheck size={13} className="text-emerald-600" />
            LeadFlow Enterprise RBAC Directory
          </span>
        </div>
      </div>

      {/* Excel / CSV Bulk Import Modal */}
      <ImportLeadsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={(leads, meta) => {
          showToast(
            `Successfully imported ${leads.length} leads from ${meta?.fileName || 'Excel file'}!`
          );
        }}
      />
    </div>
  );
}
