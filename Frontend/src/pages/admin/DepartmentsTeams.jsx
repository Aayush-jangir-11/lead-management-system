import React, { useState, useMemo } from 'react';
import { useGet, usePost, useUpdate, useDelete, useToast } from '../../hooks';
import {
  Building2, Users, Shield, Plus, Search, Filter, Edit3, Trash2,
  ChevronRight, ChevronDown, Check, X, Sparkles, UserCheck, Layers, Award,
  Target, Mail, Phone, ArrowUpRight, CheckCircle2, CircleDollarSign,
  TrendingUp, ShieldCheck, Activity, RefreshCw
} from 'lucide-react';

export default function DepartmentsTeams() {
  const { showNotification } = useToast();

  // Tab & Filter States
  const [activeTab, setActiveTab] = useState('teams'); // 'teams' | 'departments'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');

  // Modals State
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [editingDept, setEditingDept] = useState(null);

  // Team Form State
  const [teamForm, setTeamForm] = useState({
    name: '',
    departmentId: '',
    managerId: '',
    memberIds: [],
    targetQuota: 2000000,
    description: '',
  });

  // Department Form State
  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    description: '',
    headName: '',
  });

  // Searchable Department Head Dropdown
  const [headDropdownOpen, setHeadDropdownOpen] = useState(false);
  const [headSearchQuery, setHeadSearchQuery] = useState('');

  // Helper to get initials
  const getInitials = (name = '') => {
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // Helper for dynamic user avatar background
  const getUserColor = (idOrIndex) => {
    const palette = [
      'bg-emerald-600',
      'bg-teal-600',
      'bg-blue-600',
      'bg-indigo-600',
      'bg-purple-600',
      'bg-amber-600',
    ];
    const hash = String(idOrIndex || '')
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return palette[hash % palette.length];
  };

  // 1. TANSTACK QUERY: FETCH LIVE DATA (Departments, Teams, Users)
  const { data: deptsData, isLoading: deptsLoading, refetch: refetchDepts } = useGet(['departments'], '/departments');
  const { data: teamsData, isLoading: teamsLoading, refetch: refetchTeams } = useGet(['teams'], '/teams');
  const { data: usersData, isLoading: usersLoading } = useGet(['dt-users'], '/users');

  const isLoading = deptsLoading || teamsLoading || usersLoading;

  const departments = useMemo(() => {
    return deptsData?.success && Array.isArray(deptsData.departments) ? deptsData.departments : [];
  }, [deptsData]);

  const teams = useMemo(() => {
    const list = teamsData?.success && Array.isArray(teamsData.teams) ? teamsData.teams : [];
    // keep localStorage in sync
    try { localStorage.setItem('leadflow_teams_records', JSON.stringify(list)); } catch (_) {}
    return list;
  }, [teamsData]);

  const users = useMemo(() => {
    return usersData?.success && Array.isArray(usersData.users) ? usersData.users : [];
  }, [usersData]);

  // TanStack Mutations 
  const createTeamMutation = usePost('/teams', {
    invalidateKeys: [['teams']],
    onSuccess: (res, vars) => { showNotification(`New Team "${vars?.name || ''}" created in database!`); setShowTeamModal(false); },
    onError: (err) => showNotification(err.response?.data?.message || 'Failed to save team.'),
  });

  const updateTeamMutation = useUpdate(
    (vars) => `/teams/${vars.id}`,
    {
      invalidateKeys: [['teams']],
      onSuccess: (res, vars) => { showNotification(`Team "${teamForm.name}" updated in database!`); setShowTeamModal(false); },
      onError: (err) => showNotification(err.response?.data?.message || 'Failed to save team.'),
    }
  );

  const deleteTeamMutation = useDelete(
    (vars) => `/teams/${vars}`,
    {
      invalidateKeys: [['teams']],
      onSuccess: () => showNotification('Team deleted successfully from database.'),
      onError: (err) => showNotification(err.response?.data?.message || 'Failed to delete team.'),
    }
  );

  const createDeptMutation = usePost('/departments', {
    invalidateKeys: [['departments']],
    onSuccess: (res, vars) => { showNotification(`Department "${vars?.name || ''}" created in database!`); setShowDeptModal(false); },
    onError: (err) => showNotification(err.response?.data?.message || 'Failed to save department.'),
  });

  const updateDeptMutation = useUpdate(
    (vars) => `/departments/${vars.id}`,
    {
      invalidateKeys: [['departments']],
      onSuccess: () => { showNotification(`Department "${deptForm.name}" updated!`); setShowDeptModal(false); },
      onError: (err) => showNotification(err.response?.data?.message || 'Failed to save department.'),
    }
  );

  const deleteDeptMutation = useDelete(
    (vars) => `/departments/${vars}`,
    {
      invalidateKeys: [['departments']],
      onSuccess: () => showNotification('Department deleted successfully from database.'),
      onError: (err) => showNotification(err.response?.data?.message || 'Cannot delete department with active teams.'),
    }
  );

  // Derived loading state for form submit buttons
  const isSubmitting =
    createTeamMutation.isPending ||
    updateTeamMutation.isPending ||
    createDeptMutation.isPending ||
    updateDeptMutation.isPending;

  // Available Managers from Backend Users ONLY
  const availableManagers = useMemo(() => {
    return users.filter(
      (u) => u.role === 'sales_manager' || u.role === 'admin'
    );
  }, [users]);

  // Available Closer Reps / Employees from Backend Users ONLY
  const availableMembers = useMemo(() => {
    return users.filter((u) => u.role === 'sales_person');
  }, [users]);

  // Available Heads for Department selection from Backend Users ONLY
  const availableHeads = useMemo(() => {
    return users.map((u) => ({
      id: u._id,
      name: u.name,
      title:
        u.role === 'sales_manager'
          ? 'Sales Manager'
          : u.role === 'admin'
          ? 'Executive Director'
          : 'Sales Representative',
    }));
  }, [users]);

  // Filtered Heads for search
  const filteredHeads = useMemo(() => {
    return availableHeads.filter((h) =>
      h.name.toLowerCase().includes(headSearchQuery.toLowerCase().trim())
    );
  }, [availableHeads, headSearchQuery]);

  // Combined metrics from real database data
  const totalCombinedQuota = useMemo(() => {
    return teams.reduce((acc, t) => acc + (Number(t.targetQuota) || 0), 0);
  }, [teams]);

  const totalEmployeesCount = useMemo(() => {
    const uniqueIds = new Set();
    teams.forEach((t) => {
      if (Array.isArray(t.members)) {
        t.members.forEach((m) => uniqueIds.add(m._id || m.id));
      }
    });
    return uniqueIds.size;
  }, [teams]);

  // Filtered Teams based on search & selected department
  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const deptName = t.department?.name || t.departmentName || '';
      const mgrName = t.manager?.name || '';
      const memberNames = Array.isArray(t.members)
        ? t.members.map((m) => m.name || '').join(' ')
        : '';

      const matchSearch =
        q === '' ||
        t.name.toLowerCase().includes(q) ||
        deptName.toLowerCase().includes(q) ||
        mgrName.toLowerCase().includes(q) ||
        memberNames.toLowerCase().includes(q);

      const deptId = t.department?._id || t.department || t.departmentId;
      const matchDept =
        selectedDeptFilter === 'All' || String(deptId) === String(selectedDeptFilter);

      return matchSearch && matchDept;
    });
  }, [teams, searchQuery, selectedDeptFilter]);


  // MODAL OPEN HANDLERS
  const handleOpenCreateTeam = () => {
    setEditingTeam(null);
    setTeamForm({
      name: '',
      departmentId: departments[0]?._id || '',
      managerId: availableManagers[0]?._id || '',
      memberIds: [],
      targetQuota: 2500000,
      description: '',
    });
    setShowTeamModal(true);
  };

  const handleOpenEditTeam = (team) => {
    setEditingTeam(team);
    const deptId = team.department?._id || team.department || team.departmentId;
    const mgrId = team.manager?._id || team.manager?.id || team.manager;
    const mbrIds = Array.isArray(team.members)
      ? team.members.map((m) => m._id || m.id || m)
      : [];

    setTeamForm({
      name: team.name,
      departmentId: deptId || '',
      managerId: mgrId || '',
      memberIds: mbrIds,
      targetQuota: team.targetQuota || 2000000,
      description: team.description || '',
    });
    setShowTeamModal(true);
  };

  const handleOpenCreateDept = () => {
    setEditingDept(null);
    setDeptForm({
      name: '',
      code: '',
      description: '',
      headName: availableHeads[0]?.name || '',
    });
    setShowDeptModal(true);
  };

  const handleOpenEditDept = (dept) => {
    setEditingDept(dept);
    setDeptForm({
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
      headName: dept.headName,
    });
    setShowDeptModal(true);
  };

  // BACKEND CRUD: TEAM SAVE & DELETE
  const handleSaveTeam = async (e) => {
    e.preventDefault();
    if (!teamForm.name || !teamForm.departmentId || !teamForm.managerId) {
      showNotification('Team name, department, and manager are required.');
      return;
    }

    const payload = {
      name: teamForm.name.trim(),
      department: teamForm.departmentId,
      manager: teamForm.managerId,
      members: teamForm.memberIds,
      targetQuota: Number(teamForm.targetQuota) || 0,
      description: teamForm.description.trim(),
    };

    if (editingTeam) {
      const teamId = editingTeam._id || editingTeam.id;
      await updateTeamMutation.mutateAsync({ id: teamId, ...payload });
    } else {
      await createTeamMutation.mutateAsync(payload);
    }
  };

  const handleDeleteTeam = (id) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    deleteTeamMutation.mutate(id);
  };

  // BACKEND CRUD: DEPARTMENT SAVE & DELETE
  const handleSaveDept = async (e) => {
    e.preventDefault();
    if (!deptForm.name || !deptForm.code || !deptForm.headName) {
      showNotification('Department name, code, and headName are required.');
      return;
    }

    const payload = {
      name: deptForm.name.trim(),
      code: deptForm.code.toUpperCase().trim(),
      description: deptForm.description.trim(),
      headName: deptForm.headName.trim(),
    };

    if (editingDept) {
      const deptId = editingDept._id || editingDept.id;
      await updateDeptMutation.mutateAsync({ id: deptId, ...payload });
    } else {
      await createDeptMutation.mutateAsync(payload);
    }
  };

  const handleDeleteDept = (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    deleteDeptMutation.mutate(id);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/*  AMBIENT GLOW HEADER  */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-100/90 via-teal-50 to-green-100/80 text-slate-800 shadow-sm p-6 sm:p-7 border border-emerald-200/90">
        <div className="absolute -top-24 -left-20 w-80 h-80 bg-emerald-300/35 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-20 w-80 h-80 bg-teal-300/35 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-200/90 border border-emerald-300/90 text-emerald-900 shadow-2xs">
                <Building2 size={13} className="text-emerald-700" />
                Enterprise Organizational Hierarchy
              </span>
              <span className="text-xs text-emerald-400">•</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/70 border border-emerald-200/80 text-slate-700">
                <Sparkles size={12} className="text-emerald-600" />
                Live Database Synchronized
              </span>
              {isLoading && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 animate-pulse">
                  <RefreshCw size={11} className="animate-spin" /> Fetching...
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Departments & Teams Hub</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white tracking-normal">
                {teams.length} Active Teams
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mt-1">
              Structure corporate departments, configure specialized closer pods, assign Team Managers, and bind sales representatives under their respective leadership.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleOpenCreateDept}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white/95 backdrop-blur-md border border-emerald-200/90 hover:bg-white text-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer hover:border-emerald-300"
            >
              <Building2 size={14} className="text-emerald-600" />
              <span>Add Department</span>
            </button>

            <button
              onClick={handleOpenCreateTeam}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/25 transition-all cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus size={16} />
              <span>Add New Team</span>
            </button>
          </div>
        </div>
      </div>

      {/* ATTRACTIVE EXECUTIVE KPI METRICS (5 VIBRANT CARDS)  */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Departments */}
        <div className="group relative overflow-hidden bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-lg hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Building2 size={19} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200">
              Active Hub
            </span>
          </div>
          <div className="mt-3.5 space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Departments
            </span>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {departments.length} Divs
            </div>
            <div className="flex items-center text-[11px] text-slate-500 font-medium">
              <span className="font-bold text-emerald-600 flex items-center gap-0.5">
                <CheckCircle2 size={12} /> {departments.length > 0 ? 'Active' : 'No Data'}
              </span>
              <span className="ml-1.5">{departments.length > 0 ? 'Operational' : 'Empty'}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Closer Teams */}
        <div className="group relative overflow-hidden bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-lg hover:border-blue-300 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Layers size={19} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border bg-blue-50 text-blue-800 border-blue-200">
              Structured
            </span>
          </div>
          <div className="mt-3.5 space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Closer Pods
            </span>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {teams.length} Teams
            </div>
            <div className="flex items-center text-[11px] text-slate-500 font-medium">
              <span className="font-bold text-blue-600 flex items-center gap-0.5">
                <TrendingUp size={12} /> Live
              </span>
              <span className="ml-1.5">Assigned pods</span>
            </div>
          </div>
        </div>

        {/* Card 3: Cumulative Team Target Quota */}
        <div className="group relative overflow-hidden bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-lg hover:border-teal-300 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <CircleDollarSign size={19} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border bg-teal-50 text-teal-800 border-teal-200">
              Pipeline Quota
            </span>
          </div>
          <div className="mt-3.5 space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Combined Quota
            </span>
            <div className="text-2xl font-black text-emerald-800 tracking-tight">
              ₹{(totalCombinedQuota / 100000).toFixed(1)}L
            </div>
            <div className="flex items-center text-[11px] text-slate-500 font-medium">
              <span className="font-bold text-teal-700">Across {teams.length} teams</span>
            </div>
          </div>
        </div>

        {/* Card 4: Designated Team Managers */}
        <div className="group relative overflow-hidden bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-lg hover:border-purple-300 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck size={19} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border bg-purple-50 text-purple-800 border-purple-200">
              Authority
            </span>
          </div>
          <div className="mt-3.5 space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Managers
            </span>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {availableManagers.length} Leaders
            </div>
            <div className="flex items-center text-[11px] text-slate-500 font-medium">
              <span className="font-bold text-purple-700">Registered Leads</span>
            </div>
          </div>
        </div>

        {/* Card 5: Subordinate Closer Employees */}
        <div className="group relative overflow-hidden bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-lg hover:border-amber-300 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Users size={19} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-800 border-amber-200">
              Field Force
            </span>
          </div>
          <div className="mt-3.5 space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Closer Members
            </span>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {availableMembers.length} Reps
            </div>
            <div className="flex items-center text-[11px] text-slate-500 font-medium">
              <span className="font-bold text-amber-600">Assigned: {totalEmployeesCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* TAB CONTROLS & FILTER BAR  */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-emerald-200/80 shadow-2xs">
        {/* Switcher: Teams vs Departments */}
        <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'teams' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Teams ({teams.length})
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'departments' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Departments ({departments.length})
          </button>
        </div>

        {/* Search & Department Dropdown */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <input
              type="text"
              placeholder="Search team, manager, member..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 sm:w-64 bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {activeTab === 'teams' && (
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d._id || d.id} value={d._id || d.id}>{d.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* TEAMS VIEW  */}
      {activeTab === 'teams' ? (
        filteredTeams.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center text-slate-400 shadow-2xs">
            <Layers size={40} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-black text-slate-800">No teams found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              {searchQuery || selectedDeptFilter !== 'All'
                ? 'Aapke search query ya filter ke anusaar koi team match nahi hui.'
                : 'Database me koi team create nahi ki gayi hai. Nayi team configure karne ke liye "+ Add New Team" button use karein.'}
            </p>
            {(!searchQuery && selectedDeptFilter === 'All') && (
              <button
                onClick={handleOpenCreateTeam}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <Plus size={14} />
                <span>Create First Team</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredTeams.map((team) => {
              const teamId = team._id || team.id;
              const deptName = team.department?.name || team.departmentName || 'General Sales';
              const managerName = team.manager?.name || 'Unassigned Manager';
              const managerRole = team.manager?.role || 'Team Lead';
              const managerEmail = team.manager?.email || '';
              const managerAvatar = team.manager?.avatar || getInitials(managerName);
              const managerColor = getUserColor(managerName);
              const membersList = Array.isArray(team.members) ? team.members : [];

              return (
                <div
                  key={teamId}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-6 space-y-5 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />

                  {/* Team Header */}
                  <div className="flex items-start justify-between gap-3 pt-1">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {deptName}
                        </span>
                        <span className="text-[11px] text-slate-400">•</span>
                        <span className="text-[11px] font-bold text-slate-500">
                          Target: ₹{((team.targetQuota || 0) / 100000).toFixed(1)}L
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">{team.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {team.description || 'Enterprise closing pod.'}
                      </p>
                    </div>

                    {/* Edit / Delete Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditTeam(team)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                        title="Edit Team"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(teamId)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Team"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* 👑 TEAM MANAGER CARD (THE HEAD) */}
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                        <Shield size={12} className="text-emerald-700" />
                        Assigned Team Manager (Leader)
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-200/80 text-emerald-900">
                        Team Authority
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${managerColor} text-white flex items-center justify-center font-black text-xs shadow-xs`}>
                        {managerAvatar}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900">{managerName}</h4>
                        <p className="text-[11px] text-slate-500">{managerRole}</p>
                        {managerEmail && (
                          <span className="text-[10px] font-semibold text-emerald-700">{managerEmail}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 👥 TEAM MEMBERS LIST (SUBORDINATE REPS) */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <Users size={13} className="text-slate-500" />
                        Subordinate Employees / Sales Reps ({membersList.length})
                      </span>
                      <span className="text-[11px] text-slate-400">Reports to {managerName}</span>
                    </div>

                    {membersList.length === 0 ? (
                      <div className="p-3 text-center border border-dashed border-slate-200 rounded-xl text-[11px] text-slate-400">
                        No team members assigned yet
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {membersList.map((mbr) => {
                          const mbrId = mbr._id || mbr.id;
                          const mbrName = mbr.name || 'Sales Rep';
                          const mbrRole = mbr.role || 'Closer Rep';
                          const mbrAvatar = mbr.avatar || getInitials(mbrName);
                          const mbrColor = getUserColor(mbrName);

                          return (
                            <div
                              key={mbrId}
                              className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-emerald-200 transition-all"
                            >
                              <div className={`w-7 h-7 rounded-lg ${mbrColor} text-white flex items-center justify-center font-bold text-[10px]`}>
                                {mbrAvatar}
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-800 truncate">{mbrName}</div>
                                <div className="text-[10px] text-slate-500 truncate">{mbrRole}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        // DEPARTMENTS VIEW  
        departments.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center text-slate-400 shadow-2xs">
            <Building2 size={40} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-black text-slate-800">No departments found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Database me abhi koi department configure nahi kiya gaya hai. Nayi division add karne ke liye "+ Add Department" button use karein.
            </p>
            <button
              onClick={handleOpenCreateDept}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Plus size={14} />
              <span>Create First Department</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {departments.map((dept) => {
              const deptId = dept._id || dept.id;
              const deptTeams = teams.filter(
                (t) => String(t.department?._id || t.department || t.departmentId) === String(deptId)
              );

              return (
                <div
                  key={deptId}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-6 space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold shadow-xs">
                      <Building2 size={20} />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditDept(dept)}
                        className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteDept(deptId)}
                        className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {dept.code}
                    </span>
                    <h3 className="text-base font-black text-slate-900 mt-2">{dept.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {dept.description || 'Department focus and enterprise operations.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Head of Division</span>
                      <span className="font-bold text-slate-800">{dept.headName}</span>
                    </div>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100">
                      {dept.teamsCount !== undefined ? dept.teamsCount : deptTeams.length} Teams
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/*  ADD / EDIT TEAM  */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                {editingTeam ? 'Edit Team Configuration' : 'Create New Closer Team'}
              </h3>
              <button
                onClick={() => setShowTeamModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTeam} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Team Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Titans"
                  value={teamForm.name}
                  onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Belongs to Department *</label>
                  {departments.length === 0 ? (
                    <div className="p-2 border border-amber-200 rounded-xl bg-amber-50 text-[11px] text-amber-800 font-semibold">
                      No departments found. Please create a department first.
                    </div>
                  ) : (
                    <select
                      value={teamForm.departmentId}
                      onChange={(e) => setTeamForm({ ...teamForm, departmentId: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs cursor-pointer"
                    >
                      {departments.map((d) => (
                        <option key={d._id || d.id} value={d._id || d.id}>{d.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Team Target Quota (₹)</label>
                  <input
                    type="number"
                    value={teamForm.targetQuota}
                    onChange={(e) => setTeamForm({ ...teamForm, targetQuota: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              {/* Assign Manager */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assign Team Manager (Leader) *</label>
                {availableManagers.length === 0 ? (
                  <div className="p-2 border border-amber-200 rounded-xl bg-amber-50 text-[11px] text-amber-800 font-semibold">
                    No managers found in database. Please register a user with role 'sales_manager' or 'admin'.
                  </div>
                ) : (
                  <select
                    value={teamForm.managerId}
                    onChange={(e) => setTeamForm({ ...teamForm, managerId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs cursor-pointer font-bold text-emerald-900"
                  >
                    {availableManagers.map((m) => {
                      const mId = m._id || m.id;
                      return (
                        <option key={mId} value={mId}>
                          {m.name} ({m.role || 'Sales Manager'})
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              {/* Assign Members */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Team Members / Sales Reps ({teamForm.memberIds.length} selected)
                </label>
                {availableMembers.length === 0 ? (
                  <div className="p-3 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                    No sales representatives found in database.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50/50">
                    {availableMembers.map((mbr) => {
                      const mbrId = mbr._id || mbr.id;
                      const isChecked = teamForm.memberIds.includes(mbrId);
                      return (
                        <label
                          key={mbrId}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                            isChecked ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900' : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setTeamForm({
                                  ...teamForm,
                                  memberIds: teamForm.memberIds.filter((id) => id !== mbrId),
                                });
                              } else {
                                setTeamForm({
                                  ...teamForm,
                                  memberIds: [...teamForm.memberIds, mbrId],
                                });
                              }
                            }}
                            className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span className="truncate">{mbr.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Team scope and closing focus..."
                  value={teamForm.description}
                  onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowTeamModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || departments.length === 0 || availableManagers.length === 0}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting && <RefreshCw size={13} className="animate-spin" />}
                  <span>{editingTeam ? 'Update Team' : 'Save Team'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/*  ADD / EDIT DEPARTMENT  */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                {editingDept ? 'Edit Department' : 'Create Department'}
              </h3>
              <button
                onClick={() => setShowDeptModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDept} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Sales"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ENT-SALES"
                    value={deptForm.code}
                    onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs uppercase"
                  />
                </div>
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Head of Division *</label>
                  
                  {availableHeads.length === 0 ? (
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Verma"
                      value={deptForm.headName}
                      onChange={(e) => setDeptForm({ ...deptForm, headName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                    />
                  ) : (
                    <>
                      {/* Trigger Button showing Only Selected Name */}
                      <button
                        type="button"
                        onClick={() => setHeadDropdownOpen(!headDropdownOpen)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 flex items-center justify-between focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                      >
                        <span className={deptForm.headName ? 'text-slate-900 font-bold truncate' : 'text-slate-400 font-normal'}>
                          {deptForm.headName || 'Select Head'}
                        </span>
                        <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform ${headDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Searchable Dropdown Menu */}
                      {headDropdownOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-1.5 animate-in fade-in zoom-in-95 duration-100">
                          <div className="relative">
                            <input
                              type="text"
                              autoFocus
                              placeholder="Search leader..."
                              value={headSearchQuery}
                              onChange={(e) => setHeadSearchQuery(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          </div>

                          <div className="max-h-44 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden space-y-0.5 pt-1">
                            {filteredHeads.length === 0 ? (
                              <div className="text-center py-2 text-[11px] text-slate-400 font-medium">No leader found</div>
                            ) : (
                              filteredHeads.map((head) => (
                                <button
                                  key={head.id}
                                  type="button"
                                  onClick={() => {
                                    setDeptForm({ ...deptForm, headName: head.name });
                                    setHeadDropdownOpen(false);
                                    setHeadSearchQuery('');
                                  }}
                                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                                    deptForm.headName === head.name
                                      ? 'bg-emerald-50 text-emerald-900'
                                      : 'text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  <span>{head.name}</span>
                                  {deptForm.headName === head.name && (
                                    <Check size={14} className="text-emerald-600" />
                                  )}
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Division focus and scope..."
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting && <RefreshCw size={13} className="animate-spin" />}
                  <span>{editingDept ? 'Update Department' : 'Save Department'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
