import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, User, ShieldCheck, RefreshCw } from 'lucide-react';
import { useGet, usePost, useUpdate, useDelete, useToast } from '../../hooks';

// Pipeline Components
import PipelineHeader from '../../components/pipeline/PipelineHeader';
import PipelineMetrics from '../../components/pipeline/PipelineMetrics';
import KanbanBoard from '../../components/pipeline/KanbanBoard';
import DealDetailsDrawer from '../../components/pipeline/DealDetailsDrawer';
import AddDealModal from '../../components/pipeline/AddDealModal';
import ManageStagesModal, { COLOR_THEMES } from '../../components/pipeline/ManageStagesModal';
import StageReminderModal from '../../components/pipeline/StageReminderModal';

// ==========================================
// 1. DEFAULT PIPELINE STAGES (EMPTY BY DEFAULT)
// ==========================================
export const PIPELINE_STAGES = [];

// ==========================================
// 2. SALES REPS (DEAL OWNERS)
// ==========================================
export const SALES_REPS = [
  { name: 'Ajay Sharma', role: 'Enterprise AE', avatar: 'AS', color: 'bg-emerald-600' },
  { name: 'Priya Patel', role: 'Mid-Market AE', avatar: 'PP', color: 'bg-teal-600' },
  { name: 'Rohan Mehta', role: 'Commercial Rep', avatar: 'RM', color: 'bg-blue-600' },
  { name: 'Sneha Rao', role: 'Inbound SDR', avatar: 'SR', color: 'bg-indigo-600' },
  { name: 'Vikram Joshi', role: 'Outbound Specialist', avatar: 'VJ', color: 'bg-amber-600' },
];

// ==========================================
// 3. INITIAL PIPELINE DEALS DATA (EMPTY BY DEFAULT)
// ==========================================
export const INITIAL_DEALS = [];

// ==========================================
// 4. MAIN PIPELINE COMPONENT
// ==========================================
export default function Pipeline({ defaultRole }) {
  const { user, role } = useAuth();
  // Role-based view detection: defaultRole prop -> user's actual auth role -> fallback 'sales_manager'
  const effectiveRole = defaultRole || role || 'sales_manager';
  const isSalesPerson = effectiveRole === 'sales_person' || role === 'sales_person';
  const currentSalesPerson = user?.name || (isSalesPerson ? 'Sales Rep' : 'Admin');
  const { showNotification } = useToast();

  // Loading & Sync States
  const [salesRepsList, setSalesRepsList] = useState(SALES_REPS);

  // Dynamic Stages State with LocalStorage Persistence
  const [stages, setStages] = useState(() => {
    try {
      const saved = localStorage.getItem('leadflow_pipeline_stages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // If cached stages are the old default 6 stages ('new', 'discovery', etc.), clear them out
          const isOldDefault = parsed.some(
            (s) => s.id === 'new' || s.id === 'discovery' || s.name === 'Inbound & New'
          );
          if (!isOldDefault) {
            return parsed;
          } else {
            localStorage.removeItem('leadflow_pipeline_stages');
          }
        }
      }
    } catch (e) {
      console.error('Failed to load saved pipeline stages:', e);
    }
    return [];
  });

  // State
  const [deals, setDeals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRep, setSelectedRep] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [activeDeal, setActiveDeal] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageStagesModal, setShowManageStagesModal] = useState(false);
  const [stageReminderModal, setStageReminderModal] = useState(null); // { stage, dealCount }
  const [isSavingReminder, setIsSavingReminder] = useState(false);

  // New Deal Form State
  const [newDeal, setNewDeal] = useState({
    company: '',
    contact: '',
    email: '',
    phone: '',
    value: '',
    stage: '',
    rep: user?.name || '',
    priority: 'High',
    targetClose: 'Nov 15, 2026',
    notes: '',
  });

  // Helper to persist stages
  const saveStages = (newStages) => {
    setStages(newStages);
    try {
      localStorage.setItem('leadflow_pipeline_stages', JSON.stringify(newStages));
    } catch (e) {
      console.error('Failed to save pipeline stages to localStorage:', e);
    }
  };

  // Helper to map backend lead to frontend deal
  const mapLeadToDeal = useCallback((l, availableStages) => {
    let stageId = null;
    const leadStageRef = l.stage?._id || l.stage;
    if (leadStageRef) {
      const found = availableStages.find((s) => String(s._id || s.id) === String(leadStageRef));
      if (found) stageId = found.id || found._id;
    }
    if (!stageId && l.status) {
      const foundByName = availableStages.find(
        (s) => s.name?.toLowerCase() === l.status?.toLowerCase()
      );
      if (foundByName) stageId = foundByName.id || foundByName._id;
    }
    if (!stageId && availableStages.length > 0) {
      stageId = availableStages[0].id || availableStages[0]._id;
    }

    const repName = l.assignedRepName || l.assignedTo?.name || 'Unassigned';
    const repInitials = repName
      .split(' ')
      .filter(Boolean)
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    // Normalize stageSections
    let sectionsMap = {};
    if (l.stageSections) {
      if (l.stageSections instanceof Map) {
        sectionsMap = Object.fromEntries(l.stageSections);
      } else if (typeof l.stageSections === 'object') {
        sectionsMap = l.stageSections;
      }
    }

    return {
      id: String(l._id || l.id),
      _id: String(l._id || l.id),
      leadId: l.leadId,
      company: l.company,
      contact: l.name || 'Direct Lead',
      name: l.name || 'Direct Lead',
      email: l.email || '',
      phone: l.phone || '',
      value: Number(l.value) || 0,
      stage: stageId,
      rep: repName,
      assignedTo: l.assignedTo?._id || (typeof l.assignedTo === 'string' ? l.assignedTo : null),
      assignedRepName: l.assignedRepName || repName,
      repAvatar: repInitials || 'UN',
      repColor: 'bg-emerald-600',
      priority: l.priority || 'Medium',
      score: l.score || 70,
      notes: l.notes || '',
      nextFollowUp: l.nextFollowUp || null,
      stageSections: sectionsMap,
      timeline: l.timeline || [],
      tasks: l.tasks || [],
      createdAt: l.createdAt,
      lastContacted: l.lastContacted ? new Date(l.lastContacted).toLocaleDateString() : 'Recently',
      targetClose: 'End of Month',
    };
  }, []);

  // ─── 1. TANSTACK QUERY: FETCH STAGES, LEADS & USERS ─────────────────────────
  const { data: stagesData, isLoading: isStagesLoading, refetch: refetchStages } = useGet(['pipeline-stages'], '/pipeline/stages');
  const { data: leadsData, isLoading: isLeadsLoading, refetch: refetchLeads } = useGet(['pipeline-leads'], '/leads');
  const { data: usersData } = useGet(['pipeline-users'], '/users');

  const isLoading = isStagesLoading || isLeadsLoading;

  // ─── TanStack Mutations ───────────────────────────────────────────────────────
  const updateDealMutation = useUpdate(
    (vars) => `/leads/${vars.id}`,
    {
      invalidateKeys: [['pipeline-leads']],
      onError: (err) => console.error('Failed to sync deal update:', err),
    }
  );

  const deleteDealMutation = useDelete('/leads', {
    invalidateKeys: [['pipeline-leads']],
    onError: (err) => console.error('Failed to delete deal:', err),
  });

  const createDealMutation = usePost('/leads', {
    invalidateKeys: [['pipeline-leads']],
    onError: (err) => console.error('Failed to create lead:', err),
  });

  const updateStageSectionsMutation = useUpdate(
    (vars) => `/pipeline/stages/deals/${vars.dealId}/stage-sections`,
    {
      invalidateKeys: [['pipeline-leads']],
      onError: (err) => console.error('Failed to sync stage sections:', err),
    }
  );

  const updateStageReminderMutation = useUpdate(
    (vars) => `/pipeline/stages/${vars.stageId}/reminder`,
    {
      invalidateKeys: [['pipeline-stages']],
      onError: (err) => console.error('Failed to save stage reminder:', err),
    }
  );

  const reorderStagesMutation = useUpdate('/pipeline/stages/reorder', {
    invalidateKeys: [['pipeline-stages']],
    onError: (err) => console.error('Failed to sync stage reorder:', err),
  });

  const createStageMutation = usePost('/pipeline/stages', {
    invalidateKeys: [['pipeline-stages']],
    onError: (err) => console.error('Failed to create stage:', err),
  });

  const updateStageMutation = useUpdate(
    (vars) => `/pipeline/stages/${vars.id}`,
    {
      invalidateKeys: [['pipeline-stages']],
      onError: (err) => console.error('Failed to update stage:', err),
    }
  );

  const deleteStageMutation = useDelete('/pipeline/stages', {
    invalidateKeys: [['pipeline-stages']],
    onError: (err) => console.error('Failed to delete stage:', err),
  });

  // Sync stages from query data
  useEffect(() => {
    if (stagesData?.success && Array.isArray(stagesData?.data)) {
      const loadedStages = stagesData.data.map((stg, idx, arr) => {
        const theme = COLOR_THEMES[idx % COLOR_THEMES.length] || COLOR_THEMES[0];
        const dynamicProb = arr.length > 0 ? Math.min(100, Math.round(((idx + 1) / Math.max(arr.length, 1)) * 100)) : 50;
        return {
          id: String(stg._id),
          _id: String(stg._id),
          name: stg.name,
          order: stg.order !== undefined ? stg.order : idx + 1,
          isSystemDefault: Boolean(stg.isSystemDefault),
          probability: stg.probability !== undefined ? stg.probability : dynamicProb,
          color: stg.color || theme.color,
          badgeColor: stg.badgeColor || theme.badgeColor,
          dotColor: stg.dotColor || theme.dotColor,
          formFields: Array.isArray(stg.formFields) ? stg.formFields : [],
          reminder: stg.reminder || null,
        };
      });
      setStages(loadedStages);
      saveStages(loadedStages);
    }
  }, [stagesData]);

  // Sync deals from query data
  useEffect(() => {
    if (leadsData?.success && Array.isArray(leadsData?.leads)) {
      const mapped = leadsData.leads.map((l) => mapLeadToDeal(l, stages));
      setDeals(mapped);
    }
  }, [leadsData, stages, mapLeadToDeal]);

  // Sync users
  useEffect(() => {
    if (usersData?.success && Array.isArray(usersData?.users)) {
      const teamReps = usersData.users.map((u) => ({
        id: u._id,
        name: u.name,
        role: u.role === 'sales_manager' ? 'Sales Manager' : 'Sales Representative',
        avatar: u.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase(),
        color: 'bg-emerald-600',
      }));
      if (teamReps.length > 0) setSalesRepsList(teamReps);
    }
  }, [usersData]);

  // Save Dynamic Sections for a Deal in a Specific Stage (Job-form Pattern)
  const handleSaveDealSections = async (dealId, stageId, sections) => {
    setDeals((prev) =>
      prev.map((d) => {
        if (d.id === dealId) {
          const existing = d.stageSections || {};
          return {
            ...d,
            stageSections: {
              ...existing,
              [stageId]: sections,
            },
          };
        }
        return d;
      })
    );

    if (activeDeal && activeDeal.id === dealId) {
      setActiveDeal((prev) => ({
        ...prev,
        stageSections: {
          ...(prev.stageSections || {}),
          [stageId]: sections,
        },
      }));
    }

    const matchedDeal = deals.find((d) => d.id === dealId);
    showNotification(`Stage information updated for "${matchedDeal?.company || 'Deal'}"!`);

    // Sync to Backend
    try {
      await updateStageSectionsMutation.mutateAsync({
        dealId,
        stageId,
        data: { stageId, sections },
      });
    } catch (err) {
      console.error('Failed to sync stage sections to backend:', err);
    }
  };

  // Always keep stages sorted by numeric order
  const sortedStages = useMemo(() => {
    return [...stages].sort((a, b) => a.order - b.order);
  }, [stages]);

  // Close modals on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveDeal(null);
        setShowAddModal(false);
        setShowManageStagesModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered Deals
  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const matchSearch =
        searchQuery === '' ||
        (deal.company && deal.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (deal.contact && deal.contact.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (deal.id && deal.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (deal.rep && deal.rep.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchRep = isSalesPerson
        ? (role === 'sales_person'
            ? true // Backend already scopes leads to this authenticated salesperson
            : deal.assignedTo === user?._id ||
              deal.rep?.toLowerCase() === currentSalesPerson?.toLowerCase() ||
              selectedRep === 'All' ||
              deal.rep === selectedRep)
        : selectedRep === 'All' || deal.rep === selectedRep;

      const matchPriority = selectedPriority === 'All' || deal.priority === selectedPriority;

      return matchSearch && matchRep && matchPriority;
    });
  }, [deals, searchQuery, selectedRep, selectedPriority, isSalesPerson, role, user, currentSalesPerson]);

  // Executive KPI Calculations
  const relevantDeals = isSalesPerson
    ? (role === 'sales_person'
        ? deals
        : deals.filter((d) => d.rep?.toLowerCase() === currentSalesPerson?.toLowerCase() || d.assignedTo === user?._id))
    : deals;

  const activeUnclosedDeals = relevantDeals.filter((d) => d.stage !== 'won');
  const totalPipelineValue = activeUnclosedDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);

  const weightedForecastValue = activeUnclosedDeals.reduce((sum, d) => {
    const stage = sortedStages.find((s) => String(s.id) === String(d.stage) || String(s._id) === String(d.stage));
    const prob = stage ? stage.probability : 20;
    return sum + (Number(d.value) || 0) * (prob / 100);
  }, 0);

  const wonDealsValue = relevantDeals
    .filter((d) => d.stage === 'won')
    .reduce((sum, d) => sum + (Number(d.value) || 0), 0);

  const avgDealSize = relevantDeals.length > 0
    ? relevantDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0) / relevantDeals.length
    : 0;

  // Move Deal to Another Stage (Kanban Drag & Drop or Stepper Click)
  const handleMoveDealStage = async (dealId, targetStageId) => {
    const targetStage = sortedStages.find(
      (s) => String(s.id) === String(targetStageId) || String(s._id) === String(targetStageId)
    );
    const stageName = targetStage?.name || (targetStageId === 'won' ? 'Closed Won' : 'In Progress');
    const stageMongoId = (targetStageId && String(targetStageId).match(/^[0-9a-fA-F]{24}$/))
      ? targetStageId
      : (targetStage?._id && String(targetStage._id).match(/^[0-9a-fA-F]{24}$/) ? targetStage._id : null);

    setDeals((prev) =>
      prev.map((d) => (String(d.id) === String(dealId) ? { ...d, stage: targetStageId, status: stageName } : d))
    );

    if (activeDeal && String(activeDeal.id) === String(dealId)) {
      setActiveDeal((prev) => ({ ...prev, stage: targetStageId, status: stageName }));
    }

    showNotification(`Deal moved to "${stageName}"!`);

    // Sync to Backend Lead API via TanStack Mutation
    try {
      await updateDealMutation.mutateAsync({
        id: dealId,
        stage: stageMongoId,
        status: stageName,
      });
    } catch (err) {
      console.error('Failed to sync stage transition to backend:', err);
      showNotification('Notice: Saved locally (backend lead will sync).');
    }
  };

  // Update Deal details (e.g. Assigned Rep, Value, Notes)
  const handleUpdateDeal = async (dealId, updates) => {
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, ...updates } : d))
    );
    if (activeDeal?.id === dealId) {
      setActiveDeal((prev) => ({ ...prev, ...updates }));
    }
    showNotification('Deal details updated.');

    // Sync to Backend Lead API via TanStack Mutation
    try {
      const payload = { ...updates };
      if (updates.contact) payload.name = updates.contact;
      await updateDealMutation.mutateAsync({ id: dealId, ...payload });
    } catch (err) {
      console.error('Failed to sync deal update to backend:', err);
    }
  };

  // Delete Deal
  const handleDeleteDeal = async (dealId, company) => {
    if (window.confirm(`Are you sure you want to remove deal for ${company}?`)) {
      setDeals((prev) => prev.filter((d) => d.id !== dealId));
      if (activeDeal?.id === dealId) setActiveDeal(null);
      showNotification(`Deal for "${company}" removed.`);

      // Sync to Backend Lead API via TanStack Mutation
      try {
        await deleteDealMutation.mutateAsync(dealId);
      } catch (err) {
        console.error('Failed to delete lead from backend:', err);
      }
    }
  };

  // Handle Save / Update / Clear Stage Follow-up Reminder
  const handleSaveStageReminder = async ({ stageId, reminder }) => {
    setIsSavingReminder(true);
    try {
      const res = await updateStageReminderMutation.mutateAsync({ stageId, reminder });
      const updatedData = res?.data;

      const newStages = stages.map((s) => {
        if (s.id === stageId || s._id === stageId) {
          return {
            ...s,
            reminder: updatedData?.reminder || reminder,
          };
        }
        return s;
      });

      saveStages(newStages);

      showNotification(
        reminder && reminder.date
          ? 'Stage follow-up reminder scheduled successfully!'
          : 'Stage reminder cleared.'
      );
      setStageReminderModal(null);
    } catch (err) {
      console.error('Failed to save stage reminder:', err);
      showNotification('Failed to save stage reminder.');
    } finally {
      setIsSavingReminder(false);
    }
  };

  // ==========================================
  // STAGE MANAGEMENT & REORDERING HANDLERS
  // ==========================================
  const handleMoveStage = async (stageId, direction) => {
    const currentSorted = [...stages].sort((a, b) => a.order - b.order);
    const index = currentSorted.findIndex((s) => s.id === stageId);
    if (index === -1) return;

    const targetIndex = direction === 'left' || direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentSorted.length) return;

    const temp = currentSorted[index];
    currentSorted[index] = currentSorted[targetIndex];
    currentSorted[targetIndex] = temp;

    const reordered = currentSorted.map((stg, idx) => ({
      ...stg,
      order: idx + 1,
    }));

    saveStages(reordered);
    showNotification(`Moved "${temp.name}" to position #${targetIndex + 1}!`);

    // Sync to Backend Reorder API
    try {
      const stageIds = reordered.map((s) => s._id || s.id);
      await reorderStagesMutation.mutateAsync({ stageIds });
    } catch (err) {
      console.error('Failed to sync stage reorder to backend:', err);
    }
  };

  const handleAddStage = async ({ name, probability, color, badgeColor, dotColor, position }) => {
    const currentSorted = [...stages].sort((a, b) => a.order - b.order);
    let targetOrder = undefined;
    if (position === 'start') {
      targetOrder = 1;
    } else if (position !== 'end') {
      const targetIdx = currentSorted.findIndex((s) => s.id === position);
      if (targetIdx !== -1) {
        targetOrder = targetIdx + 2;
      }
    }

    try {
      // 1. Post to Backend API via TanStack Mutation
      const res = await createStageMutation.mutateAsync({
        name,
        targetOrder,
      });

      if (res?.success && res?.data) {
        const createdStage = res.data;
        const newStageObj = {
          id: String(createdStage._id),
          _id: String(createdStage._id),
          name: createdStage.name,
          order: createdStage.order,
          isSystemDefault: Boolean(createdStage.isSystemDefault),
          probability: Number(probability) || 50,
          color,
          badgeColor,
          dotColor,
        };

        let updatedList = [...currentSorted, newStageObj];
        if (targetOrder) {
          // Re-fetch clean list from backend to get adjusted orders
          const refreshed = await refetchStages();
          if (refreshed.data?.success && Array.isArray(refreshed.data?.data)) {
            updatedList = refreshed.data.data.map((stg, idx, arr) => {
              const theme = COLOR_THEMES[idx % COLOR_THEMES.length] || COLOR_THEMES[0];
              const dynamicProb = Math.min(100, Math.round(((idx + 1) / Math.max(arr.length, 1)) * 100));
              return {
                id: String(stg._id),
                _id: String(stg._id),
                name: stg.name,
                order: stg.order !== undefined ? stg.order : idx + 1,
                isSystemDefault: Boolean(stg.isSystemDefault),
                probability: dynamicProb,
                color: theme.color,
                badgeColor: theme.badgeColor,
                dotColor: theme.dotColor,
              };
            });
          }
        }

        saveStages(updatedList);
        showNotification(`Stage "${name}" successfully created in database!`);
        return;
      }
    } catch (err) {
      console.error('Failed to create stage in backend, using local fallback:', err);
    }

    // Local Fallback if backend is unavailable
    const newId = `stg_${Date.now()}`;
    const newStageObj = {
      id: newId,
      name,
      probability,
      color,
      badgeColor,
      dotColor,
      order: 1,
    };

    let updatedList = [];
    if (position === 'start') {
      updatedList = [newStageObj, ...currentSorted];
    } else if (position === 'end') {
      updatedList = [...currentSorted, newStageObj];
    } else {
      const targetIdx = currentSorted.findIndex((s) => s.id === position);
      if (targetIdx !== -1) {
        updatedList = [
          ...currentSorted.slice(0, targetIdx + 1),
          newStageObj,
          ...currentSorted.slice(targetIdx + 1),
        ];
      } else {
        updatedList = [...currentSorted, newStageObj];
      }
    }

    const reordered = updatedList.map((stg, idx) => ({
      ...stg,
      order: idx + 1,
    }));

    saveStages(reordered);
    showNotification(`Stage "${name}" added to pipeline.`);
  };

  const handleUpdateStage = async (stageId, updates) => {
    const updated = stages.map((s) => (s.id === stageId ? { ...s, ...updates } : s));
    saveStages(updated);
    showNotification(`Stage details updated.`);

    // Sync to Backend
    try {
      await updateStageMutation.mutateAsync({ id: stageId, name: updates.name });
    } catch (err) {
      console.error('Failed to update stage in backend:', err);
    }
  };

  const handleDeleteStage = async (stageId) => {
    const stageToDelete = stages.find((s) => s.id === stageId);
    if (!stageToDelete) return;

    const stageDeals = deals.filter((d) => d.stage === stageId);
    if (stageDeals.length > 0) {
      const fallbackStage = stages.find((s) => s.id !== stageId);
      const confirmMove = window.confirm(
        `Stage "${stageToDelete.name}" has ${stageDeals.length} active deal(s). Move them to "${fallbackStage?.name}" before deleting?`
      );
      if (!confirmMove) return;

      if (fallbackStage) {
        setDeals((prev) =>
          prev.map((d) => (d.stage === stageId ? { ...d, stage: fallbackStage.id } : d))
        );
        // Sync deals to new stage
        stageDeals.forEach((d) => {
          updateDealMutation.mutateAsync({
            id: d.id,
            stage: fallbackStage._id || fallbackStage.id,
            status: fallbackStage.name,
          }).catch(() => {});
        });
      }
    } else {
      if (!window.confirm(`Are you sure you want to delete stage "${stageToDelete.name}"?`)) {
        return;
      }
    }

    // Call Backend Delete
    try {
      await deleteStageMutation.mutateAsync(stageId);
      showNotification(`Stage "${stageToDelete.name}" removed from database.`);
    } catch (err) {
      console.error('Failed to delete stage from backend:', err);
      const msg = err.response?.data?.message || 'Failed to delete stage from backend.';
      showNotification(msg);
      return;
    }

    const remaining = stages.filter((s) => s.id !== stageId);
    const reordered = remaining
      .sort((a, b) => a.order - b.order)
      .map((stg, idx) => ({ ...stg, order: idx + 1 }));

    saveStages(reordered);
  };

  const handleResetDefaultStages = async () => {
    if (window.confirm('Clear all stages from pipeline?')) {
      saveStages([]);
      showNotification('Pipeline stages cleared.');
    }
  };

  // Open Add Modal with pre-selected stage (when clicked in column)
  const handleOpenAddModalWithStage = (stageId) => {
    setNewDeal((prev) => ({ ...prev, stage: stageId }));
    setShowAddModal(true);
  };

  // Add Deal Submit (Save to Backend)
  const handleAddDealSubmit = async (e) => {
    e.preventDefault();
    if (!newDeal.company || !newDeal.value) return;

    const repObj = salesRepsList.find((r) => r.name === newDeal.rep) || salesRepsList[0] || SALES_REPS[0];
    const initialStageId = newDeal.stage || sortedStages[0]?.id || null;
    const targetStage = sortedStages.find(
      (s) => String(s.id) === String(initialStageId) || String(s._id) === String(initialStageId)
    ) || sortedStages[0];
    const stageMongoId = (targetStage?._id || targetStage?.id || '').match(/^[0-9a-fA-F]{24}$/)
      ? (targetStage._id || targetStage.id)
      : null;

    try {
      // 1. Post to Backend /api/leads
      const payload = {
        company: newDeal.company.trim(),
        name: (newDeal.contact || newDeal.company).trim(),
        email: newDeal.email ? newDeal.email.trim() : '',
        phone: newDeal.phone ? newDeal.phone.trim() : '',
        value: Number(newDeal.value) || 0,
        stage: stageMongoId,
        status: targetStage?.name || 'New Lead',
        priority: newDeal.priority || 'Medium',
        notes: newDeal.notes || 'Pipeline opportunity added.',
        assignedTo: isSalesPerson ? user?._id : (repObj?.id || repObj?._id || undefined),
        assignedRepName: isSalesPerson ? (user?.name || currentSalesPerson) : repObj.name,
      };

      const res = await createDealMutation.mutateAsync(payload);

      if (res.data?.success && res.data?.lead) {
        const createdDeal = mapLeadToDeal(res.data.lead, sortedStages);
        setDeals((prev) => [createdDeal, ...prev]);
        setShowAddModal(false);
        setNewDeal({
          company: '',
          contact: '',
          email: '',
          phone: '',
          value: '',
          stage: sortedStages[0]?.id || '',
          rep: isSalesPerson ? (user?.name || currentSalesPerson) : repObj.name,
          priority: 'High',
          targetClose: 'Nov 15, 2026',
          notes: '',
        });
        showNotification(`New deal "${createdDeal.company}" saved to database!`);
        return;
      }
    } catch (err) {
      console.error('Failed to create lead in backend, using local fallback:', err);
    }

    // Local Fallback if backend fails
    const dealObj = {
      id: `DL-${Math.floor(200 + Math.random() * 800)}`,
      company: newDeal.company,
      contact: newDeal.contact || 'Direct Lead',
      email: newDeal.email || 'contact@' + newDeal.company.toLowerCase().replace(/[^a-z]/g, '') + '.com',
      phone: newDeal.phone || '+91 98000 00000',
      value: Number(newDeal.value),
      stage: initialStageId,
      rep: isSalesPerson ? (user?.name || currentSalesPerson) : repObj.name,
      repAvatar: (user?.name || repObj.name || 'AS').slice(0, 2).toUpperCase(),
      repColor: 'bg-emerald-600',
      score: Math.floor(70 + Math.random() * 25),
      priority: newDeal.priority,
      targetClose: newDeal.targetClose || 'End of Month',
      notes: newDeal.notes || 'New pipeline opportunity added.',
      activitiesCount: 1,
      tasksCount: 1,
    };

    setDeals([dealObj, ...deals]);
    setShowAddModal(false);
    setNewDeal({
      company: '',
      contact: '',
      email: '',
      phone: '',
      value: '',
      stage: sortedStages[0]?.id || '',
      rep: user?.name || currentSalesPerson || '',
      priority: 'High',
      targetClose: 'Nov 15, 2026',
      notes: '',
    });
    showNotification(`New deal "${dealObj.company}" added!`);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Deal ID', 'Company', 'Contact', 'Email', 'Phone', 'Value (INR)', 'Stage', 'Closer', 'Priority', 'Score', 'Target Close Date'];
    const rows = filteredDeals.map((d) => [
      d.id,
      `"${d.company}"`,
      `"${d.contact}"`,
      d.email,
      d.phone,
      d.value,
      d.stage,
      `"${d.rep}"`,
      d.priority,
      d.score,
      `"${d.targetClose}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pipeline_deals_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification(`Exported ${filteredDeals.length} pipeline deals to CSV!`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Toolbar */}
      <PipelineHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedRep={selectedRep}
        setSelectedRep={setSelectedRep}
        selectedPriority={selectedPriority}
        setSelectedPriority={setSelectedPriority}
        salesReps={salesRepsList}
        onOpenAddModal={() => setShowAddModal(true)}
        onExportCSV={handleExportCSV}
        onSync={fetchPipelineData}
        isLoading={isLoading}
        isSalesPerson={isSalesPerson}
      />

      {/* 2. Revenue Forecast Metrics */}
      <PipelineMetrics
        totalPipelineValue={totalPipelineValue}
        weightedForecastValue={weightedForecastValue}
        activeDealsCount={activeUnclosedDeals.length}
        avgDealSize={avgDealSize}
        wonDealsValue={wonDealsValue}
      />

      {/* 3. Interactive Kanban Board with Dynamic Stages */}
      <KanbanBoard
        deals={filteredDeals}
        stages={sortedStages}
        onDealClick={(deal) => setActiveDeal(deal)}
        onMoveDealStage={handleMoveDealStage}
        onOpenAddModalWithStage={handleOpenAddModalWithStage}
        onMoveStageLeft={(stageId) => handleMoveStage(stageId, 'left')}
        onMoveStageRight={(stageId) => handleMoveStage(stageId, 'right')}
        onOpenManageStages={() => setShowManageStagesModal(true)}
        onOpenAddStage={() => setShowManageStagesModal(true)}
        onOpenStageReminderModal={(stg, count) => setStageReminderModal({ stage: stg, dealCount: count })}
      />

      {/* 4. Slide-Over Deal Details Drawer */}
      <DealDetailsDrawer
        activeDeal={activeDeal}
        stages={sortedStages}
        salesReps={salesRepsList}
        onClose={() => setActiveDeal(null)}
        onMoveDealStage={handleMoveDealStage}
        onUpdateDeal={handleUpdateDeal}
        onDeleteDeal={handleDeleteDeal}
      />

      {/* 5. Add Deal Modal */}
      <AddDealModal
        showAddModal={showAddModal}
        stages={sortedStages}
        salesReps={salesRepsList}
        existingLeads={deals}
        onClose={() => setShowAddModal(false)}
        newDeal={newDeal}
        setNewDeal={setNewDeal}
        onSubmit={handleAddDealSubmit}
      />

      {/* 6. Dynamic Pipeline Stages & Sequence Manager Modal */}
      <ManageStagesModal
        isOpen={showManageStagesModal}
        onClose={() => setShowManageStagesModal(false)}
        stages={sortedStages}
        deals={deals}
        onMoveStageUp={(stageId) => handleMoveStage(stageId, 'up')}
        onMoveStageDown={(stageId) => handleMoveStage(stageId, 'down')}
        onAddStage={handleAddStage}
        onUpdateStage={handleUpdateStage}
        onDeleteStage={handleDeleteStage}
        onResetDefaultStages={handleResetDefaultStages}
      />

      {/* 7. Quick Stage-Level Follow-up Reminder Modal */}
      <StageReminderModal
        isOpen={Boolean(stageReminderModal)}
        onClose={() => setStageReminderModal(null)}
        stage={stageReminderModal?.stage}
        dealCount={stageReminderModal?.dealCount || 0}
        onSaveReminder={handleSaveStageReminder}
        isSaving={isSavingReminder}
      />
    </div>
  );
}
