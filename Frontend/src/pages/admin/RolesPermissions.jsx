import React, { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { useGet, usePost, useUpdate, useDelete, useToast } from '../../hooks';
import {
  Shield, ShieldCheck, Lock, Users, Check, X,
  Plus, Search, Download, RefreshCw, CheckCircle2,
  AlertCircle, Edit3, Trash2, Copy, Sliders, ChevronRight,
  UserCheck, Layers, Eye, EyeOff, Key, Info, Sparkles, Code2,
  SlidersHorizontal, CheckSquare, ToggleLeft, ToggleRight
} from 'lucide-react';

// 1. STANDARD BASE MODULES LIST (CAN BE EXTENDED DYNAMICALLY)
const DEFAULT_SYSTEM_MODULES = [
  {
    id: 'leads',
    name: 'Leads Management',
    description: 'Incoming customer inquiries, lead allocation & stage tracking.',
    availableActions: ['view', 'create', 'edit', 'delete', 'export', 'reassign'],
  },
  {
    id: 'pipeline',
    name: 'Sales Pipeline (Kanban)',
    description: 'Visual deal stages, revenue forecasts, and proposal agreements.',
    availableActions: ['view', 'create', 'edit', 'delete', 'move_stage', 'override_value'],
  },
  {
    id: 'tasks',
    name: 'Tasks & Calendar Follow-ups',
    description: 'Client calls, meetings, reminders and team task delegations.',
    availableActions: ['view', 'create', 'edit', 'delete', 'assign_others'],
  },
  {
    id: 'reports',
    name: 'Analytics & Revenue Reports',
    description: 'Sales performance KPIs, conversion reports and quota health.',
    availableActions: ['view', 'export', 'download_pdf'],
  },
  {
    id: 'users',
    name: 'Team & User Administration',
    description: 'User provisioning, quota assignment, territory mapping & locks.',
    availableActions: ['view', 'create', 'edit', 'delete', 'suspend'],
  },
  {
    id: 'settings',
    name: 'System Security & Automation',
    description: 'Lead routing auto-rules, 2FA enforcement, and live audit trails.',
    availableActions: ['view', 'edit', 'manage_integrations', 'manage_roles'],
  },
];


// Backend Data Mapper 
// Converts backend role shape → frontend role shape
const mapBackendRole = (r) => ({
  id: r._id,
  _id: r._id,
  name: r.name,
  slug: r.slug,
  badge: r.isSystem ? 'System Role' : 'Custom Role',
  badgeColor: r.isSystem
    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
    : 'bg-blue-100 text-blue-800 border-blue-200',
  description: r.description || '',
  userCount: r.userCount || 0,
  assignedUsers: [],
  isSystem: Boolean(r.isSystem),
  permissions: Array.isArray(r.permissions) ? r.permissions : [],
});

export default function RolesPermissions() {
  const [modulesList, setModulesList] = useState(DEFAULT_SYSTEM_MODULES);
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [filterModule, setFilterModule] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Modals
  const [showNewRoleModal, setShowNewRoleModal] = useState(false);
  const [showNewModuleModal, setShowNewModuleModal] = useState(false);

  // New Role Form State
  const [newRoleForm, setNewRoleForm] = useState({
    name: '',
    description: '',
  });

  // New Module Form State (Dynamic Module Creator)
  const [newModuleForm, setNewModuleForm] = useState({
    name: '',
    id: '',
    description: '',
    actionsInput: 'view, create, edit, delete, export',
  });

  // TANSTACK QUERY: FETCH ALL ROLES FROM BACKEND 
  const { data: rolesData, isLoading, refetch: refetchRoles } = useGet(['roles'], '/roles');

  useMemo(() => {
    if (rolesData?.success && Array.isArray(rolesData.roles)) {
      const mapped = rolesData.roles.map(mapBackendRole);
      setRoles(mapped);
      if (!selectedRoleId) {
        const defaultRole = mapped.find((r) => r.slug === 'sales_manager') || mapped[1] || mapped[0];
        if (defaultRole) setSelectedRoleId(defaultRole.id);
      }
    }
  }, [rolesData]);

  // TanStack Mutations 
  const savePermissionsMutation = useUpdate(
    (vars) => `/roles/${vars.id}`,
    {
      invalidateKeys: [['roles']],
      onSuccess: (res, vars) => {
        setHasUnsavedChanges(false);
        showToast(`Permissions for "${selectedRole?.name}" saved to database!`);
      },
      onError: (err) => showToast(err.response?.data?.message || 'Failed to save permissions.', 'error'),
    }
  );

  const createRoleMutation = usePost('/roles', {
    invalidateKeys: [['roles']],
    onSuccess: (res) => {
      if (res?.role) {
        const created = mapBackendRole(res.role);
        setRoles((prev) => [...prev, created]);
        setSelectedRoleId(created.id);
        showToast(`New role "${created.name}" created successfully!`);
      }
      setShowNewRoleModal(false);
      setNewRoleForm({ name: '', description: '' });
    },
    onError: (err) => showToast(err.response?.data?.message || 'Failed to create role.', 'error'),
  });

  const deleteRoleMutation = useDelete('/roles', {
    invalidateKeys: [['roles']],
    onSuccess: (res, vars) => {
      const deletedId = typeof vars === 'string' ? vars : vars?.id;
      setRoles((prev) => prev.filter((r) => (r._id || r.id) !== deletedId));
      const fallback = roles.find((r) => r.slug === 'sales_manager') || roles[0];
      setSelectedRoleId(fallback?.id || null);
      showToast('Role deleted successfully.');
    },
    onError: (err) => showToast(err.response?.data?.message || 'Failed to delete role.', 'error'),
  });

  const selectedRole = useMemo(() => {
    return roles.find((r) => r.id === selectedRoleId) || roles[0];
  }, [roles, selectedRoleId]);

  // Helper: Get permission item for a module inside selected role
  const getRoleModulePermission = (role, moduleId) => {
    const found = role.permissions.find((p) => p.module === moduleId);
    return found || { module: moduleId, enabled: false, actions: [] };
  };

  // 1. Toggle Entire Module Access (Sidebar & Page access) -> `enabled`
  const handleToggleModuleEnabled = (moduleId) => {
    if (selectedRole?.isSystem && selectedRole?.slug === 'admin') {
      showToast('Super Administrator retains all module access by default.');
      return;
    }

    setRoles((prev) =>
      prev.map((r) => {
        if (r.id === selectedRoleId) {
          const current = getRoleModulePermission(r, moduleId);
          const nextEnabled = !current.enabled;

          // If turning ON and actions were empty, default to ['view']
          const nextActions = nextEnabled && current.actions.length === 0
            ? ['view']
            : nextEnabled
              ? current.actions
              : [];

          const existingIndex = r.permissions.findIndex((p) => p.module === moduleId);
          let updatedPerms = [...r.permissions];

          if (existingIndex >= 0) {
            updatedPerms[existingIndex] = {
              module: moduleId,
              enabled: nextEnabled,
              actions: nextActions,
            };
          } else {
            updatedPerms.push({
              module: moduleId,
              enabled: nextEnabled,
              actions: nextActions,
            });
          }

          return { ...r, permissions: updatedPerms };
        }
        return r;
      })
    );
    setHasUnsavedChanges(true);
  };

  // 2. Toggle Specific Action (e.g. 'create', 'edit', 'delete') inside a module
  const handleToggleAction = (moduleId, actionName) => {
    if (selectedRole?.isSystem && selectedRole?.slug === 'admin') return;

    setRoles((prev) =>
      prev.map((r) => {
        if (r.id === selectedRoleId) {
          const current = getRoleModulePermission(r, moduleId);
          const hasAction = current.actions.includes(actionName);
          const nextActions = hasAction
            ? current.actions.filter((a) => a !== actionName)
            : [...current.actions, actionName];

          const existingIndex = r.permissions.findIndex((p) => p.module === moduleId);
          let updatedPerms = [...r.permissions];

          const updatedItem = {
            module: moduleId,
            enabled: current.enabled || nextActions.length > 0,
            actions: nextActions,
          };

          if (existingIndex >= 0) {
            updatedPerms[existingIndex] = updatedItem;
          } else {
            updatedPerms.push(updatedItem);
          }

          return { ...r, permissions: updatedPerms };
        }
        return r;
      })
    );
    setHasUnsavedChanges(true);
  };

  // 3. Grant All Actions in Module
  const handleGrantAllActions = (moduleId, allActions) => {
    if (selectedRole?.isSystem && selectedRole?.slug === 'admin') return;

    setRoles((prev) =>
      prev.map((r) => {
        if (r.id === selectedRoleId) {
          const current = getRoleModulePermission(r, moduleId);
          const isAllSelected = allActions.every((a) => current.actions.includes(a));

          const nextActions = isAllSelected ? ['view'] : [...allActions];
          const existingIndex = r.permissions.findIndex((p) => p.module === moduleId);
          let updatedPerms = [...r.permissions];

          const updatedItem = {
            module: moduleId,
            enabled: true,
            actions: nextActions,
          };

          if (existingIndex >= 0) {
            updatedPerms[existingIndex] = updatedItem;
          } else {
            updatedPerms.push(updatedItem);
          }

          return { ...r, permissions: updatedPerms };
        }
        return r;
      })
    );
    setHasUnsavedChanges(true);
  };

  // SAVE PERMISSIONS TO BACKEND 
  const handleSaveChanges = async () => {
    if (!selectedRole) return;
    setIsSaving(true);
    try {
      await savePermissionsMutation.mutateAsync({
        id: selectedRole._id || selectedRole.id,
        permissions: selectedRole.permissions,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to backend original (re-fetch roles)
  const handleResetDefaults = async () => {
    if (!selectedRole) return;
    try {
      await refetchRoles();
      setHasUnsavedChanges(false);
      showToast(`Permissions for "${selectedRole.name}" reset from server.`);
    } catch (err) {
      showToast('Could not reset from server.', 'error');
    }
  };

  // CREATE CUSTOM ROLE → BACKEND 
  const handleCreateRoleSubmit = async (e) => {
    e.preventDefault();
    if (!newRoleForm.name.trim()) return;

    const defaultPermissions = modulesList.map((m) => ({
      module: m.id,
      enabled: false,
      actions: [],
    }));

    await createRoleMutation.mutateAsync({
      name: newRoleForm.name.trim(),
      description: newRoleForm.description.trim() || 'Custom organization role with configured permissions.',
      permissions: defaultPermissions,
    });
  };

  // Create Dynamic New Module (frontend-only — modules are UI-level config)
  const handleCreateModuleSubmit = (e) => {
    e.preventDefault();
    if (!newModuleForm.name.trim()) return;

    const modId = newModuleForm.id.trim()
      ? newModuleForm.id.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
      : newModuleForm.name.toLowerCase().replace(/[^a-z0-9]/g, '_');

    const parsedActions = newModuleForm.actionsInput
      .split(',')
      .map((a) => a.trim().toLowerCase())
      .filter(Boolean);

    const newModuleObj = {
      id: modId,
      name: newModuleForm.name,
      description: newModuleForm.description || `Management, analytics and operations for ${newModuleForm.name}.`,
      availableActions: parsedActions.length > 0 ? parsedActions : ['view', 'create', 'edit', 'delete'],
    };

    setModulesList((prev) => [...prev, newModuleObj]);

    setRoles((prev) =>
      prev.map((r) => {
        if (r.id === 'super_admin') {
          return {
            ...r,
            permissions: [
              ...r.permissions,
              { module: modId, enabled: true, actions: [...newModuleObj.availableActions] },
            ],
          };
        } else {
          return {
            ...r,
            permissions: [
              ...r.permissions,
              { module: modId, enabled: false, actions: [] },
            ],
          };
        }
      })
    );

    setShowNewModuleModal(false);
    setNewModuleForm({ name: '', id: '', description: '', actionsInput: 'view, create, edit, delete, export' });
    showToast(`New Module "${newModuleObj.name}" added dynamically across all roles!`);
  };

  // DELETE CUSTOM ROLE → BACKEND 
  const handleDeleteRole = (roleId, roleName) => {
    if (!window.confirm(`Are you sure you want to delete the "${roleName}" role?`)) return;
    const target = roles.find((r) => r.id === roleId);
    deleteRoleMutation.mutate(target?._id || roleId);
  };

  // Filter modules
  const displayedModules = useMemo(() => {
    return modulesList.filter((mod) => {
      if (filterModule !== 'all' && mod.id !== filterModule) return false;
      if (searchQuery.trim() === '') return true;

      const q = searchQuery.toLowerCase();
      const matchModName = mod.name.toLowerCase().includes(q) || mod.id.toLowerCase().includes(q);
      const matchAction = mod.availableActions.some((a) => a.toLowerCase().includes(q));
      return matchModName || matchAction;
    });
  }, [modulesList, filterModule, searchQuery]);



  return (
    <div className="space-y-6 pb-14 animate-in fade-in duration-300">
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-slate-500 text-sm font-semibold">
            <RefreshCw size={18} className="animate-spin text-emerald-600" />
            Loading roles from server...
          </div>
        </div>
      )}

      {!isLoading && (<>

      {/* 1. TOP HEADER & NAVIGATION (Aurora Glassmorphic Hero)    */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-100/90 via-teal-50 to-green-100/80 p-6 sm:p-7 border border-emerald-200/60 shadow-xs">
        {/* Ambient Glow Orbs */}
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-emerald-400/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-teal-400/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 shrink-0">
              <ShieldCheck size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Roles & Dynamic Permissions
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-emerald-800 font-extrabold text-[11px] border border-emerald-300/80 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  RBAC Engine Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                Manage role-based access control, enforce sidebar security, and configure granular permissions.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => setShowNewModuleModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/90 hover:bg-white text-emerald-800 border border-emerald-200/80 text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer backdrop-blur-sm"
            >
              <Layers size={14} className="text-emerald-600" />
              <span>+ Add Module</span>
            </button>

            <button
              onClick={() => setShowNewRoleModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold shadow-md shadow-emerald-600/25 hover:shadow-lg hover:shadow-emerald-600/35 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Plus size={15} />
              <span>Create Role</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SUMMARY METRICS CARDS (Elevated Glassmorphism)        */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Configured Roles */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Configured Roles
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Shield size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{roles.length}</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
              System & Custom
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-2 flex items-center gap-1.5">
            <Sparkles size={12} className="text-emerald-500 shrink-0" />
            1 Root SuperAdmin • {roles.length - 1} Custom Tiers
          </p>
        </div>

        {/* Dynamic Modules */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Dynamic Modules
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-sm shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Layers size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {modulesList.length} Modules
            </span>
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200/70 px-2 py-0.5 rounded-full">
              Extensible
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-2 flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-teal-500 shrink-0" />
            Live sync across all role permissions
          </p>
        </div>

        {/* Selected Role Scope */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Selected Role Scope
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <UserCheck size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {selectedRole.permissions.filter((p) => p.enabled).length} Enabled
            </span>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200/70 px-2 py-0.5 rounded-full">
              Active Scope
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-2 flex items-center gap-1.5">
            <Key size={12} className="text-purple-500 shrink-0" />
            {selectedRole.permissions.reduce((acc, p) => acc + (p.enabled ? p.actions.length : 0), 0)} granular actions authorized
          </p>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE: ROLE SELECTOR & PERMISSION MATRIX     */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (4 Cols): Role Selector Cards */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Choose Role to Manage
            </span>
            <span className="text-xs text-slate-500 font-semibold">{roles.length} roles</span>
          </div>

          <div className="space-y-2.5">
            {roles.map((role) => {
              const isSelected = role.id === selectedRoleId;
              const enabledModulesCount = role.permissions.filter((p) => p.enabled).length;

              return (
                <div
                  key={role.id}
                  onClick={() => {
                    setSelectedRoleId(role.id);
                    setHasUnsavedChanges(false);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${isSelected
                      ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-white/80 hover:bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
                    }`}
                >
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600" />
                  )}

                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {role.name}
                        </h3>
                        {role.isSystem && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                            System
                          </span>
                        )}
                      </div>
                      <span className={`inline-block mt-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${role.badgeColor}`}>
                        {role.badge}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-slate-400 shrink-0 flex items-center gap-1">
                      <Users size={12} />
                      {role.userCount} {role.userCount === 1 ? 'user' : 'users'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {role.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span>
                      Sidebar Modules: <strong className="text-slate-800">{enabledModulesCount} Active</strong>
                    </span>
                    <span className="flex items-center gap-1 font-bold text-emerald-600 group-hover:translate-x-0.5 transition-transform">
                      {isSelected ? 'Active Scope' : 'Configure'}
                      <ChevronRight size={13} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Info Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-teal-50 border border-emerald-100 flex items-start gap-3">
            <Sparkles size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-emerald-950 leading-tight">Backend Schema Synchronization</h4>
              <p className="text-[11px] text-emerald-800 font-medium leading-relaxed mt-1">
                When you click <strong>"Save Permissions"</strong>, it outputs the exact schema: <code className="font-mono text-[10px] bg-white px-1 py-0.5 rounded border border-emerald-200">permissions: [&#123; module, enabled, actions &#125;]</code>.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (8 Cols): Granular Permissions Matrix */}
        <div className="lg:col-span-8 space-y-4">
          {/* Active Role Control Bar */}
          <div className="bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <span className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold shrink-0 shadow-sm shadow-emerald-600/20">
                <Key size={18} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-slate-900 tracking-tight">
                    {selectedRole.name}
                  </h2>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${selectedRole.badgeColor}`}>
                    {selectedRole.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Configure CRUD access permissions & sidebar visibility for this tier.
                </p>
              </div>
            </div>

            {/* Save / Reset / Delete Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                Reset Default
              </button>

              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={!hasUnsavedChanges || isSaving}
                className={`px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 shadow-sm ${hasUnsavedChanges && !isSaving
                    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-md shadow-emerald-600/25 cursor-pointer animate-pulse'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }`}
              >
                {isSaving
                  ? <RefreshCw size={14} className="animate-spin" />
                  : <Check size={14} />}
                <span>{isSaving ? 'Saving...' : 'Save Permissions'}</span>
              </button>

              {!selectedRole.isSystem && (
                <button
                  type="button"
                  onClick={() => handleDeleteRole(selectedRole.id, selectedRole.name)}
                  className="p-2.5 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer shadow-2xs"
                  title="Delete Custom Role"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search module or action (e.g. leads, export, delete)..."
                className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setFilterModule('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${filterModule === 'all'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
              >
                All Modules ({modulesList.length})
              </button>
              {modulesList.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setFilterModule(m.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${filterModule === m.id
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  {m.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Module-by-Module Dynamic Permission Cards */}
          <div className="space-y-4">
            {displayedModules.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-400 font-medium">
                No modules found matching "{searchQuery}".
              </div>
            ) : (
              displayedModules.map((module) => {
                const roleModule = getRoleModulePermission(selectedRole, module.id);
                const isEnabled = roleModule.enabled;
                const activeActions = roleModule.actions;
                const isLockedAdmin = selectedRole?.isSystem && selectedRole?.slug === 'admin';

                return (
                  <div
                    key={module.id}
                    className={`bg-white rounded-3xl border transition-all overflow-hidden ${isEnabled
                        ? 'border-slate-200/90 shadow-2xs'
                        : 'border-slate-200/60 opacity-80 bg-slate-50/40'
                      }`}
                  >
                    {/* Header: Module info + Master ON/OFF Switch (Controls sidebar & page access) */}
                    <div className="px-6 py-4 bg-slate-50/90 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-slate-900 tracking-tight">
                            {module.name}
                          </h3>
                          <code className="text-[10px] font-mono text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded font-bold">
                            module: "{module.id}"
                          </code>

                          {isEnabled ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <Check size={10} /> In Sidebar & Page
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <X size={10} /> Hidden / Locked
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {module.description}
                        </p>
                      </div>

                      {/* Master Module Toggle */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-bold text-slate-600">
                          {isEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                        <button
                          type="button"
                          disabled={isLockedAdmin}
                          onClick={() => handleToggleModuleEnabled(module.id)}
                          className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${isEnabled ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                            } ${isLockedAdmin ? 'opacity-80 cursor-not-allowed' : ''}`}
                          title={`Toggle ${module.name} module access`}
                        >
                          <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                        </button>
                      </div>
                    </div>

                    {/* Actions Area */}
                    <div className="p-5">
                      {isEnabled ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                              Allowed Actions ({activeActions.length} of {module.availableActions.length} granted)
                            </span>

                            <button
                              type="button"
                              disabled={isLockedAdmin}
                              onClick={() => handleGrantAllActions(module.id, module.availableActions)}
                              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {activeActions.length === module.availableActions.length ? 'Clear to View Only' : 'Select All Actions'}
                            </button>
                          </div>

                          {/* Action Badges/Toggles */}
                          <div className="flex flex-wrap gap-2.5">
                            {module.availableActions.map((action) => {
                              const isActionActive = activeActions.includes(action);

                              return (
                                <button
                                  key={action}
                                  type="button"
                                  disabled={isLockedAdmin}
                                  onClick={() => handleToggleAction(module.id, action)}
                                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all inline-flex items-center gap-1.5 cursor-pointer ${isActionActive
                                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs'
                                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                                    } ${isLockedAdmin ? 'cursor-default' : ''}`}
                                >
                                  <span
                                    className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${isActionActive
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-slate-100 text-slate-300 border border-slate-200'
                                      }`}
                                  >
                                    {isActionActive && <Check size={11} />}
                                  </span>
                                  <span className="capitalize">{action.replace('_', ' ')}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="py-4 text-center text-xs text-slate-400 font-medium bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                          This module is completely disabled for <strong>{selectedRole.name}</strong>. Toggle the switch above to enable access.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 4. MODAL: DYNAMIC "+ ADD NEW MODULE"                     */}
      {showNewModuleModal && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-6 pt-20 sm:pt-24 pb-6 overflow-hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setShowNewModuleModal(false)}
          />

          <div
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/90 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm shadow-emerald-500/20">
                  <Layers size={18} />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900">Add New Dynamic Module</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Extend CRM with Invoices, Payroll, Recruitment etc.</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewModuleModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateModuleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Module Display Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newModuleForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const autoId = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
                    setNewModuleForm((p) => ({ ...p, name, id: p.id ? p.id : autoId }));
                  }}
                  placeholder="e.g. Invoices & Billing, Payroll, Tickets"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Backend Module Key (`module`) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newModuleForm.id}
                  onChange={(e) => setNewModuleForm((p) => ({ ...p, id: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                  placeholder="e.g. invoices, payroll, recruitment"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-emerald-700 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">This key is saved directly in your database schema.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Available Actions (comma-separated)
                </label>
                <input
                  type="text"
                  value={newModuleForm.actionsInput}
                  onChange={(e) => setNewModuleForm((p) => ({ ...p, actionsInput: e.target.value }))}
                  placeholder="view, create, edit, delete, export, approve"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">e.g. view, create, edit, delete, export, approve</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Description
                </label>
                <textarea
                  rows="2"
                  value={newModuleForm.description}
                  onChange={(e) => setNewModuleForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Short description of this module..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewModuleModal(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  Add Module to System
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* 6. MODAL: CREATE CUSTOM ROLE                             */}
      {showNewRoleModal && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-6 pt-20 sm:pt-24 pb-6 overflow-hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setShowNewRoleModal(false)}
          />

          <div
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/90 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm shadow-emerald-500/20">
                  <Plus size={18} />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900">Create New CRM Role</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Configure customized permission tier.</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewRoleModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRoleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Role Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newRoleForm.name}
                  onChange={(e) => setNewRoleForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Regional Closer Manager, Junior SDR"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Description / Access Scope
                </label>
                <textarea
                  rows="3"
                  value={newRoleForm.description}
                  onChange={(e) => setNewRoleForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Briefly describe the responsibilities and scope of this role..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewRoleModal(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </>)}
    </div>
  );
}
