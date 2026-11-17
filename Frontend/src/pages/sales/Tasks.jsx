import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  CheckCircle2, Bell, CheckSquare, Clock, AlertTriangle, Sparkles, Plus, Calendar,
  User, ShieldCheck, RefreshCw
} from 'lucide-react';
import { useGet, usePost, useUpdate, useDelete, useToast } from '../../hooks';

import { SALES_REPS } from '../../components/tasks/TasksData';
import TasksHeaderStats from '../../components/tasks/TasksHeaderStats';
import TasksFilters from '../../components/tasks/TasksFilters';
import TaskReminderCard from '../../components/tasks/TaskReminderCard';
import AddTaskReminderModal from '../../components/tasks/AddTaskReminderModal';
import RescheduleModal from '../../components/tasks/RescheduleModal';

// ─── Backend Task Data Mapper ────────────────────────────────────────────────
const mapBackendTask = (t) => {
  const repName = t.assignedRep?.name || (typeof t.assignedRep === 'string' ? t.assignedRep : 'Unassigned');
  const repId = t.assignedRep?._id || (typeof t.assignedRep === 'string' ? t.assignedRep : null);
  const avatar = repName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'SR';

  return {
    id: String(t._id || t.id),
    _id: String(t._id || t.id),
    type: t.type || 'Task',
    title: t.title || '',
    description: t.description || '',
    category: t.category || (t.linkedCompany ? 'Client Outreach' : 'General Work'),
    leadId: t.lead?._id || (typeof t.lead === 'string' ? t.lead : ''),
    leadName: t.lead?.name || '',
    linkedCompany: t.linkedCompany || t.lead?.company || '',
    linkedContact: t.linkedContact || t.lead?.name || '',
    phone: t.phone || '',
    email: t.email || '',
    dueDate: t.dueDate || 'Today',
    dueTime: t.dueTime || '11:00 AM',
    priority: t.priority || 'Medium',
    status: t.status || 'Pending',
    isOverdue: Boolean(t.isOverdue),
    assignedRep: repName,
    assignedRepId: repId,
    repAvatar: avatar,
    repColor: 'bg-emerald-600',
    snoozeCount: 0,
    createdAt: t.createdAt,
  };
};

export default function Tasks({ defaultRole }) {
  const { user, role } = useAuth();
  // Role-based view detection: defaultRole prop -> user's actual auth role -> fallback 'sales_person'
  const effectiveRole = defaultRole || role || 'sales_person';
  const isSalesPerson = effectiveRole === 'sales_person';
  const currentSalesPerson = user?.name || '';

  // Live Backend States
  const [items, setItems] = useState([]);
  const [liveLeads, setLiveLeads] = useState([]);
  const [teamUsers, setTeamUsers] = useState([]);

  // ==========================================
  // DYNAMIC TEAM & REPS DISCOVERY (FROM BACKEND USERS)
  // ==========================================
  const availableReps = useMemo(() => {
    const baseReps = teamUsers.length > 0 ? teamUsers : SALES_REPS;
    if (effectiveRole === 'admin' || effectiveRole === 'sales_manager') {
      return baseReps;
    }
    // Sales person sees only themselves
    const mine = baseReps.filter((r) => r.name === currentSalesPerson);
    return mine.length > 0 ? mine : [{ name: currentSalesPerson || 'Sales Rep', role: 'Sales Rep', avatar: 'SR', color: 'bg-emerald-600' }];
  }, [teamUsers, effectiveRole, currentSalesPerson]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'reminders' | 'tasks' | 'today' | 'overdue' | 'completed'
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedRep, setSelectedRep] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rescheduleItem, setRescheduleItem] = useState(null);
  const { showNotification } = useToast();

  // New Item State
  const [newItem, setNewItem] = useState({
    type: 'Task', // 'Task' | 'Reminder'
    leadId: '',
    leadName: '',
    title: '',
    description: '',
    linkedContact: '',
    linkedCompany: '',
    phone: '',
    email: '',
    dueDate: 'Today',
    dueTime: '11:00 AM',
    priority: 'High',
    assignedRep: availableReps[0]?.name || user?.name || '',
  });

  // Ensure default assignedRep stays synchronized with available team
  useEffect(() => {
    if (availableReps && availableReps.length > 0) {
      if (!isSalesPerson && !availableReps.some((r) => r.name === newItem.assignedRep)) {
        setNewItem((prev) => ({
          ...prev,
          assignedRep: availableReps[0].name,
        }));
      }
    }
  }, [availableReps, isSalesPerson]);


  // ─── 1. TANSTACK QUERY: FETCH LIVE DATA FROM BACKEND ─────────────────────────
  const { data: tasksData, isLoading: isTasksLoading, refetch: refetchTasks } = useGet(['tasks'], '/tasks');
  const { data: leadsData } = useGet(['tasks-leads'], '/leads');
  const { data: usersData } = useGet(['tasks-users'], '/users');

  const isLoading = isTasksLoading;

  // ─── TanStack Mutations ───────────────────────────────────────────────────────
  const updateTaskMutation = useUpdate(
    (vars) => `/tasks/${vars.id}`,
    {
      invalidateKeys: [['tasks']],
      onError: (err) => console.error('Failed to update task:', err),
    }
  );

  const deleteTaskMutation = useDelete('/tasks', {
    invalidateKeys: [['tasks']],
    onError: (err) => console.error('Failed to delete task:', err),
  });

  const createTaskMutation = usePost('/tasks', {
    invalidateKeys: [['tasks']],
    onError: (err) => console.error('Failed to create task:', err),
  });

  useEffect(() => {
    if (tasksData?.success && Array.isArray(tasksData?.tasks)) {
      setItems(tasksData.tasks.map(mapBackendTask));
    }
  }, [tasksData]);

  useEffect(() => {
    if (leadsData?.success && Array.isArray(leadsData?.leads)) {
      setLiveLeads(
        leadsData.leads.map((l) => ({
          id: String(l._id || l.id),
          _id: String(l._id || l.id),
          name: l.name || 'Direct Lead',
          company: l.company || '',
          email: l.email || '',
          phone: l.phone || '',
          status: l.status || '',
          assignedRep: l.assignedRepName || l.assignedTo?.name || '',
        }))
      );
    }
  }, [leadsData]);

  useEffect(() => {
    if (usersData?.success && Array.isArray(usersData?.users)) {
      const reps = usersData.users
        .filter((u) => u.role === 'sales_person' || u.role === 'sales_manager' || u.role === 'admin')
        .map((u, idx) => ({
          _id: u._id,
          id: u._id,
          name: u.name,
          role: u.role,
          avatar: u.name
            .split(' ')
            .filter(Boolean)
            .map((n) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase(),
          color: ['bg-emerald-600', 'bg-teal-600', 'bg-blue-600', 'bg-indigo-600', 'bg-purple-600'][idx % 5],
        }));
      if (reps.length > 0) setTeamUsers(reps);
    }
  }, [usersData]);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Open Modal with pre-selected type
  const handleOpenModalWithType = (type) => {
    setNewItem((prev) => ({
      ...prev,
      type,
      assignedRep: isSalesPerson ? currentSalesPerson : (prev.assignedRep || availableReps[0]?.name || user?.name || ''),
    }));
    setIsModalOpen(true);
  };

  // Relevant items based on role (Manager only sees tasks belonging to their team)
  const relevantItems = useMemo(() => {
    if (isSalesPerson) {
      return items.filter((i) => i.assignedRep === currentSalesPerson);
    }
    if (effectiveRole === 'sales_manager') {
      const allowedNames = new Set(availableReps.map((r) => r.name));
      return items.filter((i) => allowedNames.has(i.assignedRep));
    }
    return items;
  }, [items, isSalesPerson, effectiveRole, currentSalesPerson, availableReps]);

  // Date helper for calendar ISO vs relative strings
  const isToday = (d) => {
    if (!d) return false;
    if (d === 'Today') return true;
    const todayISO = new Date().toISOString().split('T')[0];
    return d === todayISO;
  };

  // 2. COUNTS & KPI METRICS
  const counts = useMemo(() => {
    const all = relevantItems.length;
    const reminders = relevantItems.filter((i) => i.type === 'Reminder' && i.status !== 'Completed').length;
    const tasks = relevantItems.filter((i) => i.type === 'Task' && i.status !== 'Completed').length;
    const today = relevantItems.filter((i) => isToday(i.dueDate) && i.status !== 'Completed').length;
    const upcoming = relevantItems.filter((i) => !isToday(i.dueDate) && !i.isOverdue && i.status !== 'Completed').length;
    const overdue = relevantItems.filter((i) => i.isOverdue && i.status !== 'Completed').length;
    const completed = relevantItems.filter((i) => i.status === 'Completed').length;

    return { all, reminders, tasks, today, upcoming, overdue, completed };
  }, [relevantItems]);

  // 3. FILTERING & SEARCH LOGIC
  const filteredItems = useMemo(() => {
    return relevantItems.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        q === '' ||
        item.title.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.linkedContact && item.linkedContact.toLowerCase().includes(q)) ||
        (item.linkedCompany && item.linkedCompany.toLowerCase().includes(q)) ||
        item.id.toLowerCase().includes(q);

      const matchPriority =
        selectedPriority === 'All' || item.priority === selectedPriority;

      const matchRep = isSalesPerson
        ? true
        : selectedRep === 'All' || item.assignedRep === selectedRep;

      // Tab matching
      let matchTab = true;
      if (activeTab === 'reminders') matchTab = item.type === 'Reminder';
      else if (activeTab === 'tasks') matchTab = item.type === 'Task';
      else if (activeTab === 'today') matchTab = isToday(item.dueDate) && item.status !== 'Completed';
      else if (activeTab === 'upcoming') matchTab = !isToday(item.dueDate) && !item.isOverdue && item.status !== 'Completed';
      else if (activeTab === 'overdue') matchTab = item.isOverdue && item.status !== 'Completed';
      else if (activeTab === 'completed') matchTab = item.status === 'Completed';

      return matchSearch && matchPriority && matchRep && matchTab;
    });
  }, [relevantItems, searchQuery, selectedPriority, selectedRep, activeTab, isSalesPerson]);

  // Separate into Reminders and Tasks for Dual-Section Overview
  const activeRemindersList = useMemo(() => {
    return filteredItems.filter((i) => i.type === 'Reminder' && i.status !== 'Completed');
  }, [filteredItems]);

  const activeTasksList = useMemo(() => {
    return filteredItems.filter((i) => i.type === 'Task' && i.status !== 'Completed');
  }, [filteredItems]);

  const completedList = useMemo(() => {
    return filteredItems.filter((i) => i.status === 'Completed');
  }, [filteredItems]);

  // 4. HANDLERS (CONNECTED TO BACKEND)
  const handleToggleComplete = async (id) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const newStatus = item.status === 'Completed' ? 'Pending' : 'Completed';

    // Optimistic UI update
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
    );

    if (newStatus === 'Completed') {
      showNotification(`Completed: "${item.title}"!`);
    } else {
      showNotification(`Reopened: "${item.title}".`);
    }

    try {
      await updateTaskMutation.mutateAsync({ id, status: newStatus });
    } catch (err) {
      console.error('Failed to update task status:', err);
      // Revert if error
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: item.status } : i))
      );
      showNotification('Failed to update task status on backend.');
    }
  };

  const handleSnoozeReminder = async (id) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    setItems((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          showNotification(`Snoozed reminder: "${i.title}" by 1 hour.`);
          return {
            ...i,
            dueTime: 'In 1 hour',
            isOverdue: false,
            snoozeCount: (i.snoozeCount || 0) + 1,
          };
        }
        return i;
      })
    );

    try {
      await updateTaskMutation.mutateAsync({ id, dueTime: 'In 1 hour' });
    } catch (err) {
      console.warn('Snooze note:', err?.message);
    }
  };

  const handleRescheduleSubmit = async ({ id, newDate, newTime, reason, resetAlarm }) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    setItems((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          showNotification(`Rescheduled "${i.title}" to ${newDate} at ${newTime}.`);
          return {
            ...i,
            dueDate: newDate,
            dueTime: newTime,
            isOverdue: false,
            rescheduleCount: (i.rescheduleCount || 0) + 1,
            lastRescheduledAt: new Date().toISOString(),
            rescheduleReason: reason,
            notifiedWindows: resetAlarm ? [] : (i.notifiedWindows || []),
          };
        }
        return i;
      })
    );

    try {
      await updateTaskMutation.mutateAsync({ id, dueDate: newDate, dueTime: newTime });
    } catch (err) {
      console.error('Failed to reschedule task:', err);
      showNotification('Failed to reschedule task on backend.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this action item?')) {
      const prevItems = [...items];
      setItems((prev) => prev.filter((i) => i.id !== id));
      showNotification('Item removed.');

      try {
        await deleteTaskMutation.mutateAsync(id);
      } catch (err) {
        console.error('Failed to delete task from backend:', err);
        setItems(prevItems);
        showNotification('Failed to delete task on backend.');
      }
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedPriority('All');
    setSelectedRep('All');
    setActiveTab('all');
  };

  const handleAddItemSubmit = async (e) => {
    e.preventDefault();

    const assigned = isSalesPerson
      ? currentSalesPerson
      : newItem.assignedRep || availableReps[0]?.name || user?.name || 'Unassigned';

    const repObj = availableReps.find((r) => r.name === assigned) || availableReps[0] || {
      name: assigned,
      avatar: 'SR',
      color: 'bg-emerald-600',
    };

    const targetRepId = repObj?._id || repObj?.id || user?.id;

    const payload = {
      type: newItem.type || 'Task',
      title: (newItem.title || '').trim(),
      description: (newItem.description || '').trim(),
      category: newItem.type === 'Reminder' ? 'Follow-up Call' : 'Deliverable',
      lead: newItem.leadId && String(newItem.leadId).match(/^[0-9a-fA-F]{24}$/) ? newItem.leadId : null,
      linkedCompany: newItem.linkedCompany || '',
      linkedContact: newItem.linkedContact || '',
      phone: newItem.phone || '',
      email: newItem.email || '',
      dueDate: newItem.dueDate || 'Today',
      dueTime: newItem.dueTime || '11:00 AM',
      priority: newItem.priority || 'High',
      status: 'Pending',
      assignedRep: targetRepId,
    };

    try {
      const res = await createTaskMutation.mutateAsync(payload);
      if (res?.success && res?.task) {
        const createdItem = mapBackendTask(res.task);
        setItems((prev) => [createdItem, ...prev]);
        setIsModalOpen(false);
        showNotification(
          `${createdItem.type === 'Reminder' ? 'Reminder scheduled' : 'Task added'} successfully in database!`
        );

        // Reset Form
        setNewItem({
          type: 'Task',
          leadId: '',
          leadName: '',
          title: '',
          description: '',
          linkedContact: '',
          linkedCompany: '',
          phone: '',
          email: '',
          dueDate: 'Today',
          dueTime: '11:00 AM',
          priority: 'High',
          assignedRep: availableReps[0]?.name || user?.name || '',
        });
      }
    } catch (err) {
      console.error('Failed to create task:', err);
      showNotification(err.response?.data?.message || 'Failed to create task on backend.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2.5 text-xs font-bold text-slate-500 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <RefreshCw size={15} className="animate-spin text-emerald-600" />
            Loading tasks from server...
          </div>
        </div>
      )}

      {/* 1. Header & KPI Bar */}
      <TasksHeaderStats
        totalCount={counts.all}
        tasksCount={counts.tasks}
        remindersCount={counts.reminders}
        dueTodayCount={counts.today}
        overdueCount={counts.overdue}
        completedCount={counts.completed}
        onOpenModal={handleOpenModalWithType}
      />

      {/* 2. Unified Filter & Tab Bar */}
      <TasksFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedPriority={selectedPriority}
        setSelectedPriority={setSelectedPriority}
        selectedRep={selectedRep}
        setSelectedRep={setSelectedRep}
        onResetFilters={handleResetFilters}
        counts={counts}
        isSalesPerson={isSalesPerson}
        availableReps={availableReps}
      />

      {/* 3. Main Views */}
      {activeTab === 'all' && (
        <div className="space-y-6">
          {/* Section 1: Active Reminders / Alarms */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-amber-100 text-amber-700">
                  <Bell size={14} />
                </span>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Scheduled Follow-up Calls & Alarms
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                  {activeRemindersList.length} Active
                </span>
              </div>
              <button
                onClick={() => handleOpenModalWithType('Reminder')}
                className="text-xs font-bold text-amber-700 hover:underline cursor-pointer"
              >
                Set Reminder
              </button>
            </div>

            {activeRemindersList.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400">
                <Bell size={24} className="mx-auto mb-1 text-slate-300" />
                <p className="text-xs font-bold">No active reminders</p>
                <p className="text-[11px] text-slate-400 mt-0.5">You're completely caught up on scheduled calls!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {activeRemindersList.map((item) => (
                  <TaskReminderCard
                    key={item.id}
                    item={item}
                    onToggleComplete={handleToggleComplete}
                    onSnoozeReminder={handleSnoozeReminder}
                    onOpenReschedule={(item) => setRescheduleItem(item)}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Active Deliverables & Action Tasks */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-emerald-100 text-emerald-700">
                  <CheckSquare size={14} />
                </span>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Deliverables & Closing Tasks
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {activeTasksList.length} Active
                </span>
              </div>
              <button
                onClick={() => handleOpenModalWithType('Task')}
                className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                Add Task
              </button>
            </div>

            {activeTasksList.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400">
                <CheckSquare size={24} className="mx-auto mb-1 text-slate-300" />
                <p className="text-xs font-bold">No active deliverables</p>
                <p className="text-[11px] text-slate-400 mt-0.5">All action items and decks are signed off!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {activeTasksList.map((item) => (
                  <TaskReminderCard
                    key={item.id}
                    item={item}
                    onToggleComplete={handleToggleComplete}
                    onSnoozeReminder={handleSnoozeReminder}
                    onOpenReschedule={(item) => setRescheduleItem(item)}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Completed Archive */}
          {completedList.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200/80">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-slate-100 text-slate-600">
                    <CheckCircle2 size={14} />
                  </span>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Recently Completed
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-600">
                    {completedList.length}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 opacity-80 hover:opacity-100 transition-opacity">
                {completedList.map((item) => (
                  <TaskReminderCard
                    key={item.id}
                    item={item}
                    onToggleComplete={handleToggleComplete}
                    onSnoozeReminder={handleSnoozeReminder}
                    onOpenReschedule={(item) => setRescheduleItem(item)}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* View Case B: Filtered Tab View (Single unified grid) */}
      {activeTab !== 'all' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold text-slate-700 capitalize">
              Showing {filteredItems.length} items in {activeTab}
            </span>
            <button
              onClick={() => handleOpenModalWithType(activeTab === 'reminders' ? 'Reminder' : 'Task')}
              className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              + Create {activeTab === 'reminders' ? 'Reminder' : 'Task'}
            </button>
          </div>

          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
              <Clock size={28} className="mx-auto mb-2 text-slate-300" />
              <h3 className="text-sm font-extrabold text-slate-800">No items in this view</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No tasks or reminders match your selected filter criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <TaskReminderCard
                  key={item.id}
                  item={item}
                  onToggleComplete={handleToggleComplete}
                  onSnoozeReminder={handleSnoozeReminder}
                  onOpenReschedule={(item) => setRescheduleItem(item)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Unified Add Task / Reminder Modal */}
      <AddTaskReminderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        newItem={newItem}
        setNewItem={setNewItem}
        onSubmit={handleAddItemSubmit}
        isSalesPerson={isSalesPerson}
        currentSalesPerson={currentSalesPerson}
        availableReps={availableReps}
        leads={liveLeads}
      />

      {/* 5. Full Reschedule & Date Change Picker Modal */}
      <RescheduleModal
        isOpen={!!rescheduleItem}
        onClose={() => setRescheduleItem(null)}
        item={rescheduleItem}
        onReschedule={handleRescheduleSubmit}
      />
    </div>
  );
}
