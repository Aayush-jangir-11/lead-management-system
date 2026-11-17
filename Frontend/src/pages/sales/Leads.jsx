import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, User, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
import { useGet, usePost, useUpdate, useDelete, useToast } from '../../hooks';

// Modular Lead Components & Data
import { LeadsHeader, LeadsStats, SALES_REPS, calculateLeadScore } from '../../components/leads/LeadsHeaderStats';
import LeadsTableSection from '../../components/leads/LeadsTableSection';
import LeadDetailsDrawer from '../../components/leads/LeadDetailsDrawer';
import AddLeadModal from '../../components/leads/AddLeadModal';
import ImportLeadsModal from '../../components/leads/ImportLeadsModal';
import { COLOR_THEMES } from '../../components/pipeline/ManageStagesModal';

export default function Leads({ defaultRole }) {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  // Role-based view detection: defaultRole prop -> user's actual auth role -> fallback 'sales_person'
  const effectiveRole = defaultRole || role || 'sales_person';
  const isSalesPerson = effectiveRole === 'sales_person';
  const currentSalesPerson = user?.name || '';
  const { showNotification } = useToast();

  // ==========================================
  // 1. STATE MANAGEMENT
  // ==========================================
  const [leads, setLeads] = useState([]);
  const [salesRepsList, setSalesRepsList] = useState(SALES_REPS);
  const [pipelineStagesList, setPipelineStagesList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedSource, setSelectedSource] = useState('All');
  const [selectedRep, setSelectedRep] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Modals / Drawers
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [activeLeadDetails, setActiveLeadDetails] = useState(null);
  const [drawerTab, setDrawerTab] = useState('profile'); // 'profile' | 'timeline' | 'tasks'

  // Drawer interaction states
  const [newNoteInput, setNewNoteInput] = useState('');
  const [newTaskInput, setNewTaskInput] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  // Add Lead Form State (with Auto-save draft recovery)
  const [newLead, setNewLead] = useState(() => {
    try {
      const savedDraft = localStorage.getItem('lead_form_draft');
      return savedDraft
        ? JSON.parse(savedDraft)
        : {
            name: '',
            title: '',
            company: '',
            email: '',
            phone: '',
            location: '',
            value: '',
            status: 'New Lead',
            priority: 'High',
            source: 'Inbound Website Form',
            assignedRep: user?.name || '',
            notes: '',
          };
    } catch {
      return {
        name: '',
        title: '',
        company: '',
        email: '',
        phone: '',
        location: '',
        value: '',
        status: 'New Lead',
        priority: 'High',
        source: 'Inbound Website Form',
        assignedRep: user?.name || '',
        notes: '',
      };
    }
  });

  // Background auto-save draft to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lead_form_draft', JSON.stringify(newLead));
    } catch (err) {
      console.error('Error saving draft:', err);
    }
  }, [newLead]);

  // Align default stage of newLead with backend pipeline stages when loaded
  useEffect(() => {
    if (pipelineStagesList.length > 0) {
      setNewLead((prev) => {
        const hasMatch = pipelineStagesList.some(
          (s) => s.name?.toLowerCase() === prev.status?.toLowerCase()
        );
        if (!hasMatch) {
          return { ...prev, status: pipelineStagesList[0].name };
        }
        return prev;
      });
    }
  }, [pipelineStagesList]);


  // ─────────────────────────────────────────────────────────────────────────────
  // BACKEND DATA MAPPING & FETCH LOGIC
  // ─────────────────────────────────────────────────────────────────────────────
  const mapBackendLead = useCallback(
    (l, stagesOverride = null) => {
      const availableStages =
        Array.isArray(stagesOverride) && stagesOverride.length > 0
          ? stagesOverride
          : pipelineStagesList;

      const repName = l.assignedRepName || l.assignedTo?.name || 'Unassigned';
      const repInitials = repName
        .split(' ')
        .filter(Boolean)
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

      // Match Stage by ID or Name from dynamic stages
      let stageId = l.stage?._id || l.stage || null;
      let stageName = l.stage?.name || l.status || '';

      if (availableStages.length > 0) {
        if (stageId) {
          const found = availableStages.find((s) => String(s._id || s.id) === String(stageId));
          if (found) {
            stageName = found.name;
            stageId = found._id || found.id;
          }
        } else if (stageName) {
          const foundByName = availableStages.find(
            (s) => s.name?.toLowerCase() === stageName.toLowerCase()
          );
          if (foundByName) {
            stageId = foundByName._id || foundByName.id;
            stageName = foundByName.name;
          }
        }
        if (!stageName && availableStages.length > 0) {
          stageName = availableStages[0].name;
          stageId = availableStages[0]._id || availableStages[0].id;
        }
      }

      const formattedTimeline = Array.isArray(l.timeline)
        ? l.timeline.map((item) => ({
            _id: item._id,
            type: item.type || 'note',
            title: item.title || 'Activity',
            author: item.author || 'User',
            time: item.time
              ? new Date(item.time).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Recently',
            note: item.note || '',
          }))
        : [];

      const { score, scoreGrade } = calculateLeadScore(
        {
          ...l,
          status: stageName,
          stage: stageId,
          value: Number(l.value) || 0,
          priority: l.priority || 'Medium',
          email: l.email || '',
          phone: l.phone || '',
          timeline: formattedTimeline,
          tasks: Array.isArray(l.tasks) ? l.tasks : [],
        },
        availableStages
      );

      return {
        id: String(l._id || l.id),
        _id: String(l._id || l.id),
        leadId: l.leadId || `LD-${String(l._id || l.id).slice(-4).toUpperCase()}`,
        name: l.name || 'Direct Lead',
        title: l.title || 'Decision Maker',
        company: l.company || 'Enterprise Account',
        email: l.email || '',
        phone: l.phone || '',
        location: l.location || 'India',
        value: Number(l.value) || 0,
        status: stageName || 'New Lead',
        stage: stageId,
        priority: l.priority || 'Medium',
        score,
        scoreGrade,
        source: l.source || 'Inbound Website Form',
        assignedTo: l.assignedTo?._id || l.assignedTo || null,
        assignedRep: repName,
        repAvatar: repInitials || 'UN',
        repColor: 'bg-emerald-600',
        createdAt: l.createdAt || new Date().toISOString(),
        lastContacted: l.lastContacted
          ? new Date(l.lastContacted).toLocaleDateString('en-IN')
          : 'Recently',
        notes: l.notes || '',
        tags: Array.isArray(l.tags) && l.tags.length > 0 ? l.tags : ['Active'],
        timeline: formattedTimeline,
        tasks: Array.isArray(l.tasks) ? l.tasks : [],
        stageSections: l.stageSections || {},
      };
    },
    [pipelineStagesList]
  );

  // ─── 1. TANSTACK QUERY: FETCH PIPELINE STAGES, LEADS & USERS ─────────────────
  const { data: stagesData, refetch: refetchStages } = useGet(['pipeline-stages'], '/pipeline/stages');
  const { data: leadsData, isLoading: isLeadsLoading, refetch: refetchLeads } = useGet(['leads'], '/leads');
  const { data: usersData } = useGet(['leads-users'], '/users');

  const isLoading = isLeadsLoading;

  // ─── TanStack Mutations ───────────────────────────────────────────────────────
  const updateLeadMutation = useUpdate(
    (vars) => `/leads/${vars.id}`,
    {
      invalidateKeys: [['leads'], ['pipeline-leads']],
      onError: (err) => console.error('Failed to sync lead update:', err),
    }
  );

  const deleteLeadMutation = useDelete('/leads', {
    invalidateKeys: [['leads'], ['pipeline-leads']],
    onError: (err) => console.error('Failed to delete lead:', err),
  });

  const createLeadMutation = usePost('/leads', {
    invalidateKeys: [['leads'], ['pipeline-leads']],
    onError: (err) => console.error('Failed to create lead:', err),
  });

  const bulkCreateLeadsMutation = usePost('/leads/bulk', {
    invalidateKeys: [['leads'], ['pipeline-leads']],
    onError: (err) => console.error('Failed to bulk create leads:', err),
  });

  const addTimelineMutation = usePost(
    (vars) => `/leads/${vars.leadId}/timeline`,
    {
      invalidateKeys: [['leads']],
      onError: (err) => console.error('Failed to sync timeline note:', err),
    }
  );

  // Sync stages from query
  useEffect(() => {
    if (stagesData?.success && Array.isArray(stagesData?.data)) {
      const currentStages = stagesData.data.map((stg, idx, arr) => {
        const theme = COLOR_THEMES[idx % COLOR_THEMES.length] || COLOR_THEMES[0];
        const dynamicProb =
          arr.length > 0
            ? Math.min(100, Math.round(((idx + 1) / Math.max(arr.length, 1)) * 100))
            : 50;
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
        };
      });
      setPipelineStagesList(currentStages);
    }
  }, [stagesData]);

  // Sync leads from query
  useEffect(() => {
    if (leadsData?.success && Array.isArray(leadsData?.leads)) {
      const mapped = leadsData.leads.map((l) => mapBackendLead(l, pipelineStagesList));
      setLeads(mapped);
    }
  }, [leadsData, pipelineStagesList, mapBackendLead]);

  // Sync users
  useEffect(() => {
    if (usersData?.success && Array.isArray(usersData?.users)) {
      const teamReps = usersData.users.map((u) => ({
        _id: u._id,
        id: u._id,
        name: u.name,
        role: u.role === 'sales_manager' ? 'Sales Manager' : 'Sales Representative',
        avatar: u.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase(),
        color: 'bg-emerald-600',
      }));
      if (teamReps.length > 0) setSalesRepsList(teamReps);
    }
  }, [usersData]);

  // Close modals on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveLeadDetails(null);
        setShowAddModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ==========================================
  // 2. STATS & KPIS (ROLE FILTERED)
  // ==========================================
  const relevantLeads = useMemo(() => {
    return isSalesPerson ? leads.filter((l) => l.assignedRep === currentSalesPerson) : leads;
  }, [leads, isSalesPerson, currentSalesPerson]);

  const totalLeadsCount = relevantLeads.length;
  const hotLeadsCount = relevantLeads.filter((l) => l.score >= 80).length;
  const totalPipelineValue = relevantLeads
    .filter((l) => l.status !== 'Lost')
    .reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
  const activeQualifiedCount = relevantLeads.filter((l) =>
    ['Qualified', 'Proposal Sent', 'Negotiation'].includes(l.status)
  ).length;

  // ==========================================
  // 3. FILTERING & SORTING LOGIC
  // ==========================================
  const filteredLeads = useMemo(() => {
    return relevantLeads
      .filter((lead) => {
        // Search query filter
        const matchSearch =
          searchQuery === '' ||
          lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.phone.includes(searchQuery) ||
          lead.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

        // Filters
        const matchStatus = selectedStatus === 'All' || lead.status === selectedStatus;
        const matchSource = selectedSource === 'All' || lead.source === selectedSource;
        const matchRep = isSalesPerson || selectedRep === 'All' || lead.assignedRep === selectedRep;
        const matchPriority = selectedPriority === 'All' || lead.priority === selectedPriority;

        return matchSearch && matchStatus && matchSource && matchRep && matchPriority;
      })
      .sort((a, b) => {
        if (sortBy === 'value-desc') return b.value - a.value;
        if (sortBy === 'value-asc') return a.value - b.value;
        if (sortBy === 'score-desc') return b.score - a.score;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
        return new Date(b.createdAt) - new Date(a.createdAt); // newest
      });
  }, [relevantLeads, isSalesPerson, searchQuery, selectedStatus, selectedSource, selectedRep, selectedPriority, sortBy]);

  // ==========================================
  // 4. PAGINATION CALCULATIONS
  // ==========================================
  const totalPages = Math.ceil(filteredLeads.length / pageSize) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + pageSize);

  // Auto-reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedSource, selectedRep, selectedPriority]);

  // Bulk Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLeadIds(paginatedLeads.map((l) => l.id));
    } else {
      setSelectedLeadIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Status Change Handler (Inline)
  const handleStatusChange = async (leadId, newStatus) => {
    const targetStage = pipelineStagesList.find(
      (s) => s.name?.toLowerCase() === newStatus?.toLowerCase()
    );

    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          const updatedTimeline = [
            {
              type: 'stage',
              title: `Moved to ${newStatus}`,
              author: user?.name || 'Current User',
              time: 'Just now',
              note: `Stage transitioned from ${l.status} to ${newStatus}.`,
            },
            ...(l.timeline || []),
          ];

          const updatedLeadDraft = {
            ...l,
            status: newStatus,
            stage: targetStage?._id || l.stage,
            timeline: updatedTimeline,
          };
          const { score, scoreGrade } = calculateLeadScore(updatedLeadDraft, pipelineStagesList);

          return {
            ...updatedLeadDraft,
            score,
            scoreGrade,
          };
        }
        return l;
      })
    );

    if (activeLeadDetails?.id === leadId) {
      setActiveLeadDetails((prev) => {
        const updated = {
          ...prev,
          status: newStatus,
          stage: targetStage?._id || prev.stage,
        };
        const { score, scoreGrade } = calculateLeadScore(updated, pipelineStagesList);
        return {
          ...updated,
          score,
          scoreGrade,
        };
      });
    }

    const targetLead = leads.find((l) => l.id === leadId);
    showNotification(`Lead "${targetLead?.name || 'Account'}" stage updated to "${newStatus}"!`);

    // Sync to Backend via TanStack Mutation
    try {
      await updateLeadMutation.mutateAsync({
        id: leadId,
        status: newStatus,
        stage: targetStage?._id || null,
      });
    } catch (err) {
      console.error('Failed to sync status update to backend:', err);
    }
  };

  // Priority Change Handler (Inline - Recalculates Score dynamically on frontend)
  const handlePriorityChange = async (leadId, newPriority) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          const updatedTimeline = [
            {
              type: 'note',
              title: `Priority changed to ${newPriority}`,
              author: user?.name || 'Current User',
              time: 'Just now',
              note: `Lead priority updated from ${l.priority} to ${newPriority}.`,
            },
            ...(l.timeline || []),
          ];

          const updatedLeadDraft = {
            ...l,
            priority: newPriority,
            timeline: updatedTimeline,
          };
          const { score, scoreGrade } = calculateLeadScore(updatedLeadDraft, pipelineStagesList);

          return {
            ...updatedLeadDraft,
            score,
            scoreGrade,
          };
        }
        return l;
      })
    );

    if (activeLeadDetails?.id === leadId) {
      setActiveLeadDetails((prev) => {
        const updated = {
          ...prev,
          priority: newPriority,
        };
        const { score, scoreGrade } = calculateLeadScore(updated, pipelineStagesList);
        return {
          ...updated,
          score,
          scoreGrade,
        };
      });
    }

    const targetLead = leads.find((l) => l.id === leadId);
    showNotification(`Priority for "${targetLead?.name || 'Lead'}" updated to "${newPriority}"!`);

    // Sync to Backend via TanStack Mutation
    try {
      await updateLeadMutation.mutateAsync({
        id: leadId,
        priority: newPriority,
      });
    } catch (err) {
      console.error('Failed to sync priority update to backend:', err);
    }
  };

  // Owner Re-assignment
  const handleOwnerChange = async (leadId, newOwnerName) => {
    const ownerObj =
      salesRepsList.find((r) => r.name === newOwnerName) ||
      SALES_REPS.find((r) => r.name === newOwnerName);
    if (!ownerObj) return;

    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          const updatedTimeline = [
            {
              type: 'lead',
              title: `Reassigned to ${newOwnerName}`,
              author: user?.name || 'Manager',
              time: 'Just now',
              note: `Ownership transferred to ${newOwnerName}.`,
            },
            ...(l.timeline || []),
          ];
          return {
            ...l,
            assignedRep: ownerObj.name,
            assignedTo: ownerObj._id || ownerObj.id || null,
            repAvatar: ownerObj.avatar,
            repColor: ownerObj.color || 'bg-emerald-600',
            timeline: updatedTimeline,
          };
        }
        return l;
      })
    );

    if (activeLeadDetails?.id === leadId) {
      setActiveLeadDetails((prev) => ({
        ...prev,
        assignedRep: ownerObj.name,
        assignedTo: ownerObj._id || ownerObj.id || null,
        repAvatar: ownerObj.avatar,
        repColor: ownerObj.color || 'bg-emerald-600',
      }));
    }
    showNotification(`Assigned ${ownerObj.name} as lead owner.`);

    // Sync to Backend via TanStack Mutation
    try {
      await updateLeadMutation.mutateAsync({
        id: leadId,
        assignedTo: ownerObj._id || null,
        assignedRepName: ownerObj.name,
      });
    } catch (err) {
      console.error('Failed to sync owner reassignment to backend:', err);
    }
  };

  // Delete Lead Handler
  const handleDeleteLead = async (id, company) => {
    if (window.confirm(`Are you sure you want to delete lead from ${company}?`)) {
      setLeads((prev) => prev.filter((l) => l.id !== id));
      setSelectedLeadIds((prev) => prev.filter((item) => item !== id));
      if (activeLeadDetails?.id === id) setActiveLeadDetails(null);
      showNotification(`Lead from "${company}" deleted successfully.`);

      // Sync to Backend via TanStack Mutation
      try {
        await deleteLeadMutation.mutateAsync(id);
      } catch (err) {
        console.error('Failed to delete lead from backend:', err);
      }
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    const idsToDelete = [...selectedLeadIds];
    if (window.confirm(`Delete ${idsToDelete.length} selected leads?`)) {
      setLeads((prev) => prev.filter((l) => !idsToDelete.includes(l.id)));
      setSelectedLeadIds([]);
      showNotification(`Deleted ${idsToDelete.length} leads.`);

      // Sync to Backend via TanStack Mutation
      try {
        await Promise.allSettled(idsToDelete.map((id) => deleteLeadMutation.mutateAsync(id)));
      } catch (err) {
        console.error('Failed to bulk delete leads from backend:', err);
      }
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Lead ID',
      'Name',
      'Designation',
      'Company',
      'Email',
      'Phone',
      'Location',
      'Value (INR)',
      'Status',
      'Priority',
      'Lead Score',
      'Assigned Owner',
      'Source',
      'Created Date',
    ];
    const rows = filteredLeads.map((l) => [
      l.id,
      `"${l.name}"`,
      `"${l.title}"`,
      `"${l.company}"`,
      l.email,
      l.phone,
      `"${l.location}"`,
      l.value,
      l.status,
      l.priority,
      l.score,
      `"${l.assignedRep}"`,
      `"${l.source}"`,
      new Date(l.createdAt).toLocaleDateString('en-IN'),
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification(`Exported ${filteredLeads.length} leads as CSV!`);
  };

  // Add Task inside Lead Drawer
  const handleAddDrawerTask = (e) => {
    e.preventDefault();
    if (!newTaskInput.trim() || !activeLeadDetails) return;

    const taskObj = {
      id: `T-${Date.now().toString().slice(-4)}`,
      title: newTaskInput,
      dueDate: newTaskDueDate || 'Tomorrow, 5:00 PM',
      completed: false,
      priority: 'High',
    };

    const updatedTasks = [taskObj, ...(activeLeadDetails.tasks || [])];
    const updatedLead = { ...activeLeadDetails, tasks: updatedTasks };

    setLeads((prev) => prev.map((l) => (l.id === activeLeadDetails.id ? updatedLead : l)));
    setActiveLeadDetails(updatedLead);
    setNewTaskInput('');
    setNewTaskDueDate('');
    showNotification(`Task "${taskObj.title}" linked to lead!`);
  };

  // Toggle Task Completion
  const handleToggleTask = (taskId) => {
    if (!activeLeadDetails) return;
    const updatedTasks = (activeLeadDetails.tasks || []).map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    const updatedLead = { ...activeLeadDetails, tasks: updatedTasks };
    setLeads((prev) => prev.map((l) => (l.id === activeLeadDetails.id ? updatedLead : l)));
    setActiveLeadDetails(updatedLead);
  };

  // Add Note & Activity Log
  const handleAddDrawerNote = async (e) => {
    e.preventDefault();
    if (!newNoteInput.trim() || !activeLeadDetails) return;

    const noteText = newNoteInput.trim();
    const timelineEntry = {
      type: 'note',
      title: 'Manual Activity Note Logged',
      author: user?.name || 'Current User',
      time: 'Just now',
      note: noteText,
    };

    const updatedTimeline = [timelineEntry, ...(activeLeadDetails.timeline || [])];
    const updatedLead = {
      ...activeLeadDetails,
      notes: `${noteText} (Updated just now)`,
      timeline: updatedTimeline,
    };

    setLeads((prev) => prev.map((l) => (l.id === activeLeadDetails.id ? updatedLead : l)));
    setActiveLeadDetails(updatedLead);
    setNewNoteInput('');
    showNotification('Note & timeline entry saved successfully!');

    // Sync to Backend via TanStack Mutation
    try {
      const res = await addTimelineMutation.mutateAsync({
        leadId: activeLeadDetails.id,
        type: 'note',
        title: 'Manual Activity Note Logged',
        note: noteText,
      });
      if (res?.success && Array.isArray(res?.timeline)) {
        const mappedTimeline = res.timeline.map((item) => ({
          _id: item._id,
          type: item.type || 'note',
          title: item.title || 'Note',
          author: item.author || 'User',
          time: new Date(item.time).toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          note: item.note || '',
        }));
        setActiveLeadDetails((prev) => (prev ? { ...prev, timeline: mappedTimeline } : null));
        setLeads((prev) =>
          prev.map((l) => (l.id === activeLeadDetails.id ? { ...l, timeline: mappedTimeline } : l))
        );
      }
    } catch (err) {
      console.error('Failed to save timeline note to backend:', err);
    }
  };

  // Add Lead Form Submit
  const handleAddLeadSubmit = async (e) => {
    e.preventDefault();
    if (!newLead.name || !newLead.company || !newLead.value) {
      alert('Please fill in Name, Company, and Deal Value.');
      return;
    }

    const assigned =
      salesRepsList.find((r) => r.name === newLead.assignedRep) ||
      salesRepsList[0] ||
      SALES_REPS[0];
    const targetStage = pipelineStagesList.find(
      (s) => s.name?.toLowerCase() === newLead.status?.toLowerCase()
    );

    const payload = {
      company: newLead.company.trim(),
      name: newLead.name.trim(),
      title: (newLead.title || '').trim(),
      email: newLead.email ? newLead.email.toLowerCase().trim() : '',
      phone: (newLead.phone || '').trim(),
      location: (newLead.location || '').trim(),
      value: Number(newLead.value) || 0,
      status: newLead.status || 'New Lead',
      stage: targetStage?._id || null,
      priority: newLead.priority || 'Medium',
      source: newLead.source || 'Inbound Website Form',
      assignedTo: assigned?._id || null,
      assignedRepName: assigned.name,
      notes: (newLead.notes || '').trim(),
    };

    try {
      const res = await createLeadMutation.mutateAsync(payload);
      if (res.data?.success && res.data?.lead) {
        const created = mapBackendLead(res.data.lead);
        setLeads((prev) => [created, ...prev]);
        setShowAddModal(false);

        const emptyForm = {
          name: '',
          title: '',
          company: '',
          email: '',
          phone: '',
          location: '',
          value: '',
          status: 'New Lead',
          priority: 'High',
          source: 'Inbound Website Form',
          assignedRep: assigned.name,
          notes: '',
        };
        setNewLead(emptyForm);
        localStorage.removeItem('lead_form_draft');
        showNotification(`New lead "${created.name}" from ${created.company} saved to database!`);
        return;
      }
    } catch (err) {
      console.error('Failed to create lead in backend, using local fallback:', err);
    }

    // Local Fallback if backend is unavailable
    const fallbackDraft = {
      name: newLead.name,
      title: newLead.title || 'Decision Maker',
      company: newLead.company,
      email: newLead.email || 'contact@' + newLead.company.toLowerCase().replace(/[^a-z]/g, '') + '.com',
      phone: newLead.phone || '+91 98000 00000',
      location: newLead.location || 'India',
      value: Number(newLead.value) || 0,
      status: newLead.status,
      stage: targetStage?._id || null,
      priority: newLead.priority,
      source: newLead.source,
      timeline: [],
      tasks: [],
    };
    const { score, scoreGrade } = calculateLeadScore(fallbackDraft, pipelineStagesList);

    const leadObject = {
      ...fallbackDraft,
      id: `LD-${Math.floor(1000 + Math.random() * 9000)}`,
      score,
      scoreGrade,
      assignedRep: assigned.name,
      repAvatar: assigned.avatar || 'AS',
      repColor: assigned.color || 'bg-emerald-600',
      createdAt: new Date().toISOString(),
      lastContacted: 'Just now',
      notes: newLead.notes || 'Inbound prospect captured via Leads Hub.',
      tags: ['New Added', 'Inbound'],
      timeline: [
        {
          type: 'lead',
          title: 'Lead Created in System',
          author: user?.name || 'System',
          time: 'Just now',
          note: `Lead created and allocated to ${assigned.name}.`,
        },
      ],
      tasks: [
        {
          id: `T-${Math.floor(100 + Math.random() * 900)}`,
          title: `Initial discovery qualification call with ${newLead.name}`,
          dueDate: 'Tomorrow, 11:00 AM',
          completed: false,
          priority: 'Urgent',
        },
      ],
    };

    setLeads((prev) => [leadObject, ...prev]);
    setShowAddModal(false);

    const emptyForm = {
      name: '',
      title: '',
      company: '',
      email: '',
      phone: '',
      location: '',
      value: '',
      status: 'New Lead',
      priority: 'High',
      source: 'Inbound Website Form',
      assignedRep: user?.name || '',
      notes: '',
    };
    setNewLead(emptyForm);
    localStorage.removeItem('lead_form_draft');

    showNotification(`New lead "${leadObject.name}" from ${leadObject.company} created & assigned!`);
  };

  // Bulk Excel Import Callback
  const handleBulkImportSuccess = async (importedLeads, meta) => {
    try {
      const res = await bulkCreateLeadsMutation.mutateAsync({ leads: importedLeads });
      if (res.data?.success && Array.isArray(res.data?.leads)) {
        const mappedCreated = res.data.leads.map(mapBackendLead);
        setLeads((prev) => [...mappedCreated, ...prev]);
        showNotification(
          `Successfully saved ${mappedCreated.length} leads to database from ${meta?.fileName || 'Excel file'}!`
        );
        return;
      }
    } catch (err) {
      console.error('Failed to bulk save leads in backend, using local fallback:', err);
    }

    setLeads((prev) => [...importedLeads, ...prev]);
    showNotification(
      `Successfully imported ${importedLeads.length} leads from ${meta?.fileName || 'Excel file'}!`
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Component */}
      <LeadsHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        onExportCSV={handleExportCSV}
        onOpenAddModal={() => setShowAddModal(true)}
        onOpenImportModal={() => setShowImportModal(true)}
        onSync={fetchLeadsData}
        isLoading={isLoading}
        isSalesPerson={isSalesPerson}
      />

      {/* 2. Top Stats KPIs Component */}
      <LeadsStats
        totalLeadsCount={totalLeadsCount}
        hotLeadsCount={hotLeadsCount}
        activeQualifiedCount={activeQualifiedCount}
        totalPipelineValue={totalPipelineValue}
      />

      {/* 3. Combined Search/Filter Toolbar + Leads Table/Grid + Pagination */}
      <LeadsTableSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedSource={selectedSource}
        setSelectedSource={setSelectedSource}
        selectedRep={selectedRep}
        setSelectedRep={setSelectedRep}
        selectedPriority={selectedPriority}
        setSelectedPriority={setSelectedPriority}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onResetFilters={() => {
          setSearchQuery('');
          setSelectedStatus('All');
          setSelectedSource('All');
          setSelectedRep('All');
          setSelectedPriority('All');
        }}
        allLeadsCount={leads.length}
        leads={leads}
        selectedLeadIds={selectedLeadIds}
        setSelectedLeadIds={setSelectedLeadIds}
        onSelectAll={handleSelectAll}
        onSelectOne={handleSelectOne}
        onBulkDelete={handleBulkDelete}
        viewMode={viewMode}
        filteredLeads={filteredLeads}
        paginatedLeads={paginatedLeads}
        onRowClick={(lead) => {
          const targetId = lead._id || lead.id;
          navigate(isSalesPerson ? `/salesperson/leads/${targetId}` : `/manager/leads/${targetId}`);
        }}
        onStatusChange={handleStatusChange}
        onPriorityChange={handlePriorityChange}
        onOwnerChange={handleOwnerChange}
        onDeleteLead={handleDeleteLead}
        onOpenDrawerTab={(lead, tab) => {
          const targetId = lead._id || lead.id;
          navigate(isSalesPerson ? `/salesperson/leads/${targetId}` : `/manager/leads/${targetId}`);
        }}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        totalPages={totalPages}
        validCurrentPage={validCurrentPage}
        startIndex={startIndex}
        isSalesPerson={isSalesPerson}
        stages={pipelineStagesList}
        salesReps={salesRepsList}
      />

      {/* 4. Separate Slide-over Profile/Timeline/Tasks Drawer Component */}
      <LeadDetailsDrawer
        activeLeadDetails={activeLeadDetails}
        onClose={() => setActiveLeadDetails(null)}
        drawerTab={drawerTab}
        setDrawerTab={setDrawerTab}
        onOwnerChange={handleOwnerChange}
        onStatusChange={handleStatusChange}
        onPriorityChange={handlePriorityChange}
        onDeleteLead={handleDeleteLead}
        newNoteInput={newNoteInput}
        setNewNoteInput={setNewNoteInput}
        onAddNote={handleAddDrawerNote}
        newTaskInput={newTaskInput}
        setNewTaskInput={setNewTaskInput}
        newTaskDueDate={newTaskDueDate}
        setNewTaskDueDate={setNewTaskDueDate}
        onAddTask={handleAddDrawerTask}
        onToggleTask={handleToggleTask}
        salesReps={salesRepsList}
        stages={pipelineStagesList}
      />

      {/* 5. Separate Add New Lead Modal Component */}
      <AddLeadModal
        showAddModal={showAddModal}
        onClose={() => setShowAddModal(false)}
        newLead={newLead}
        setNewLead={setNewLead}
        onSubmit={handleAddLeadSubmit}
        isSalesPerson={isSalesPerson}
        salesReps={salesRepsList}
        stages={pipelineStagesList}
      />

      {/* 6. Excel / CSV Bulk Import Modal */}
      <ImportLeadsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={handleBulkImportSuccess}
        salesReps={salesRepsList}
        stages={pipelineStagesList}
      />
    </div>
  );
}
