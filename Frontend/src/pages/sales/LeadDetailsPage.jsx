import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { useGet, usePost, useUpdate, useDelete, useToast } from '../../hooks';
import {
  ArrowLeft, Building2, User, Phone, Mail, MessageSquare, MapPin,
  Clock, Flame, Trophy, CheckCircle2, AlertCircle, Calendar,
  Tag, Shield, Edit3, Trash2, PhoneOutgoing, Plus, Check,
  RefreshCw, Layers, ExternalLink, Sparkles, Filter, ChevronRight,
  ClipboardList, Save
} from 'lucide-react';
import { COLOR_THEMES } from '../../components/pipeline/ManageStagesModal';
import { SALES_REPS, STATUS_OPTIONS, getStatusBadge, getPriorityBadge } from '../../components/leads/LeadsHeaderStats';
import StageInfoFormModal from '../../components/leads/StageInfoFormModal';

export default function LeadDetailsPage({ defaultRole }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const effectiveRole = defaultRole || role || 'sales_person';
  const isSalesPerson = effectiveRole === 'sales_person' || role === 'sales_person';

  // State
  const { showNotification } = useToast();
  const [lead, setLead] = useState(null);
  const [stages, setStages] = useState([]);
  const [calls, setCalls] = useState([]);
  const [salesReps, setSalesReps] = useState(SALES_REPS);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' | 'calls' | 'notes' | 'stage_info'

  // Call logger form state
  const [showCallForm, setShowCallForm] = useState(false);
  const [isSubmittingCall, setIsSubmittingCall] = useState(false);
  const [callForm, setCallForm] = useState({
    callType: 'Discovery Call',
    duration: '10 mins',
    outcome: 'Demo Scheduled',
    notes: '',
    nextFollowUp: 'Tomorrow, 02:00 PM',
  });

  // Note logger form state
  const [newNote, setNewNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Stage Information Modal State (opened by clicking stage in stepper)
  const [selectedStageForModal, setSelectedStageForModal] = useState(null);
  const [isSavingStageModal, setIsSavingStageModal] = useState(false);

  // Back button destination
  const backPath = isSalesPerson ? '/salesperson/leads' : '/manager/leads';

  // 1. TanStack Query hooks
  const { data: leadData, isLoading: isLeadLoading } = useGet(
    ['lead-detail', id],
    `/leads/${id}`,
    { enabled: !!id }
  );
  const { data: stagesData } = useGet(['pipeline-stages'], '/pipeline/stages');
  const { data: callsData } = useGet(
    ['lead-calls', id],
    `/calls?lead=${id}`,
    { enabled: !!id }
  );
  const { data: usersData } = useGet(['leads-users'], '/users');
  const isLoading = isLeadLoading;

  // Mutations
  const updateLeadMutation = useUpdate('/leads', {
    invalidateKeys: [['lead-detail', id], ['leads'], ['pipeline-leads'], ['dashboard-leads']],
  });
  const deleteLeadMutation = useDelete('/leads', {
    invalidateKeys: [['leads'], ['pipeline-leads'], ['dashboard-leads']],
  });
  const updateStageSectionsMutation = useUpdate(
    (vars) => `/pipeline/stages/deals/${vars.dealId || id}/stage-sections`,
    { invalidateKeys: [['lead-detail', id]] }
  );
  const updateStageFormFieldsMutation = useUpdate(
    (vars) => `/pipeline/stages/${vars.stageId}/form-fields`,
    { invalidateKeys: [['pipeline-stages']] }
  );
  const createCallMutation = usePost('/calls', {
    invalidateKeys: [['lead-calls', id], ['contacts-calls'], ['dashboard-calls']],
  });
  const addTimelineMutation = usePost(`/leads/${id}/timeline`, {
    invalidateKeys: [['lead-detail', id]],
  });

  // Sync server data to local states
  useEffect(() => {
    if (leadData?.success && leadData?.lead) {
      setLead(leadData.lead);
    }
  }, [leadData]);

  useEffect(() => {
    if (stagesData?.success && Array.isArray(stagesData?.data)) {
      const loadedStages = stagesData.data.map((stg, idx) => {
        const theme = COLOR_THEMES[idx % COLOR_THEMES.length] || COLOR_THEMES[0];
        return {
          id: String(stg._id),
          _id: String(stg._id),
          name: stg.name,
          order: stg.order !== undefined ? stg.order : idx + 1,
          probability: stg.probability !== undefined ? stg.probability : 50,
          color: stg.color || theme.color,
          badgeColor: stg.badgeColor || theme.badgeColor,
          dotColor: stg.dotColor || theme.dotColor,
          formFields: Array.isArray(stg.formFields) ? stg.formFields : [],
        };
      });
      setStages(loadedStages);
    }
  }, [stagesData]);

  useEffect(() => {
    if (callsData?.success && Array.isArray(callsData?.callLogs)) {
      setCalls(callsData.callLogs);
    }
  }, [callsData]);

  useEffect(() => {
    if (usersData?.success && Array.isArray(usersData?.users)) {
      setSalesReps(
        usersData.users.map((u) => ({
          name: u.name,
          role: u.role === 'sales_manager' ? 'Sales Manager' : 'Sales Representative',
          avatar: u.name
            .split(' ')
            .map((p) => p[0])
            .join('')
            .slice(0, 2)
            .toUpperCase(),
          color: 'bg-emerald-600',
        }))
      );
    }
  }, [usersData]);

  // Current stage index in stages list
  const currentStageIndex = useMemo(() => {
    if (!lead || !stages.length) return -1;
    const leadStageId = lead.stage?._id || lead.stage;
    let idx = stages.findIndex((s) => String(s.id) === String(leadStageId));
    if (idx === -1 && lead.status) {
      idx = stages.findIndex((s) => s.name?.toLowerCase() === lead.status?.toLowerCase());
    }
    return idx;
  }, [lead, stages]);

  // Safe helper to get stage sections for a stage ID
  const getStageSections = useCallback((targetStageId) => {
    if (!lead || !lead.stageSections) return [];
    if (lead.stageSections instanceof Map) {
      return lead.stageSections.get(String(targetStageId)) || [];
    }
    if (typeof lead.stageSections === 'object') {
      return lead.stageSections[String(targetStageId)] || [];
    }
    return [];
  }, [lead]);

  // 2. Change Stage (Stepper Click)
  const handleStageChange = async (targetStage) => {
    if (!lead || !targetStage) return;
    setIsUpdating(true);
    try {
      const targetStageId = targetStage._id || targetStage.id;
      const res = await updateLeadMutation.mutateAsync({
        id: lead._id,
        stage: targetStageId,
        status: targetStage.name,
      });

      if (res?.success && res?.lead) {
        setLead(res.lead);
        showNotification(`Stage updated to "${targetStage.name}"!`);
      }
    } catch (err) {
      console.error('Failed to change stage:', err);
      showNotification('Failed to update stage on server.');
    } finally {
      setIsUpdating(false);
    }
  };

  // 2b. Save Dynamic Stage Modal (opened from Stepper)
  const handleSaveStageModal = async ({ stageId, stageName, sections, advanceStage }) => {
    if (!lead || !stageId) return;
    setIsSavingStageModal(true);
    try {
      const validSections = sections.filter(
        (sec) => (sec.title && sec.title.trim() !== '') || (sec.content && sec.content.trim() !== '')
      );

      // Save dynamic stage answers to deal stageSections
      const res = await updateStageSectionsMutation.mutateAsync({
        dealId: lead._id,
        data: {
          stageId,
          sections: validSections,
        },
      });

      let updatedLead = lead;

      // If requested, also advance lead's status & stage
      if (advanceStage) {
        const stageRes = await updateLeadMutation.mutateAsync({
          id: lead._id,
          stage: stageId,
          status: stageName,
        });
        if (stageRes?.success && stageRes?.lead) {
          updatedLead = stageRes.lead;
        }
      }

      setLead((prev) => {
        let prevMap = {};
        if (prev.stageSections instanceof Map) {
          prevMap = Object.fromEntries(prev.stageSections);
        } else if (typeof prev.stageSections === 'object') {
          prevMap = { ...(prev.stageSections || {}) };
        }
        return {
          ...prev,
          stage: advanceStage ? stageId : prev.stage,
          status: advanceStage ? stageName : prev.status,
          timeline: res?.data?.timeline || updatedLead.timeline || prev.timeline,
          stageSections: {
            ...prevMap,
            [String(stageId)]: validSections,
          },
        };
      });

      showNotification(`Stage information for "${stageName}" saved successfully!`);
      setSelectedStageForModal(null);
    } catch (err) {
      console.error('Failed to save stage form data:', err);
      showNotification('Failed to save stage information.');
    } finally {
      setIsSavingStageModal(false);
    }
  };

  // 2c. Save Stage Form Questions Template from Modal
  const handleSaveStageTemplateFromModal = async ({ stageId, formFields }) => {
    try {
      await updateStageFormFieldsMutation.mutateAsync({
        stageId,
        data: { formFields },
      });

      // Update local stages so modal immediately reflects new fields
      setStages((prev) =>
        prev.map((stg) =>
          String(stg.id) === String(stageId) || String(stg._id) === String(stageId)
            ? { ...stg, formFields }
            : stg
        )
      );

      // Also update selectedStageForModal
      setSelectedStageForModal((prev) =>
        prev ? { ...prev, formFields } : prev
      );

      showNotification('Stage questions template saved successfully!');
    } catch (err) {
      console.error('Failed to save stage form fields from modal:', err);
      showNotification('Failed to save stage questions template.');
    }
  };

  // 3. Change Status
  const handleStatusChange = async (newStatus) => {
    if (!lead || !newStatus) return;
    setIsUpdating(true);
    try {
      const matchedStage = stages.find((s) => s.name?.toLowerCase() === newStatus.toLowerCase());
      const res = await updateLeadMutation.mutateAsync({
        id: lead._id,
        status: newStatus,
        stage: matchedStage ? (matchedStage._id || matchedStage.id) : null,
      });
      if (res?.success && res?.lead) {
        setLead(res.lead);
        showNotification(`Status changed to "${newStatus}"!`);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // 4. Change Priority
  const handlePriorityChange = async (newPriority) => {
    if (!lead || !newPriority) return;
    setIsUpdating(true);
    try {
      const res = await updateLeadMutation.mutateAsync({
        id: lead._id,
        priority: newPriority,
      });
      if (res?.success && res?.lead) {
        setLead(res.lead);
        showNotification(`Priority set to "${newPriority}"!`);
      }
    } catch (err) {
      console.error('Failed to update priority:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // 5. Change Assigned Owner
  const handleOwnerChange = async (newRepName) => {
    if (!lead || !newRepName) return;
    setIsUpdating(true);
    try {
      const res = await updateLeadMutation.mutateAsync({
        id: lead._id,
        assignedRepName: newRepName,
      });
      if (res?.success && res?.lead) {
        setLead(res.lead);
        showNotification(`Lead assigned to "${newRepName}"!`);
      }
    } catch (err) {
      console.error('Failed to reassign lead:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // 6. Log New Call
  const handleSaveCall = async (e) => {
    e.preventDefault();
    if (!callForm.notes.trim() || !lead) return;

    setIsSubmittingCall(true);
    try {
      const payload = {
        lead: lead._id,
        callType: callForm.callType,
        duration: callForm.duration,
        outcome: callForm.outcome,
        notes: callForm.notes.trim(),
        nextFollowUp: callForm.nextFollowUp,
      };

      const res = await createCallMutation.mutateAsync(payload);
      if (res?.success && res?.callLog) {
        setCalls((prev) => [res.callLog, ...prev]);

        // Auto update timeline in UI
        const newTimelineEntry = {
          type: 'call',
          title: `${callForm.callType} (${callForm.duration})`,
          author: user?.name || 'Sales Representative',
          time: new Date(),
          note: `${callForm.outcome}: ${callForm.notes.trim()}`,
        };
        setLead((prev) => ({
          ...prev,
          timeline: [newTimelineEntry, ...(prev.timeline || [])],
        }));

        setCallForm({
          callType: 'Follow-up Call',
          duration: '10 mins',
          outcome: 'Follow-up Required',
          notes: '',
          nextFollowUp: 'Tomorrow, 02:00 PM',
        });
        setShowCallForm(false);
        showNotification('Call log recorded successfully!');
      }
    } catch (err) {
      console.error('Failed to log call:', err);
      showNotification('Failed to record call log.');
    } finally {
      setIsSubmittingCall(false);
    }
  };

  // 7. Add Quick Note
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || !lead) return;

    setIsSubmittingNote(true);
    try {
      const res = await addTimelineMutation.mutateAsync({
        type: 'note',
        title: 'Manual Activity Note Logged',
        note: newNote.trim(),
      });

      if (res?.success && Array.isArray(res?.timeline)) {
        setLead((prev) => ({ ...prev, timeline: res.timeline }));
        setNewNote('');
        showNotification('Note added to activity timeline!');
      }
    } catch (err) {
      console.error('Failed to add note:', err);
      showNotification('Failed to save note.');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  // 8. Delete Lead
  const handleDelete = async () => {
    if (!lead) return;
    if (window.confirm(`Are you sure you want to permanently delete lead for "${lead.company}"?`)) {
      try {
        await deleteLeadMutation.mutateAsync(lead._id);
        showNotification('Lead deleted successfully.');
        navigate(backPath);
      } catch (err) {
        console.error('Failed to delete lead:', err);
        showNotification('Failed to delete lead.');
      }
    }
  };

  // Initials generator
  const getInitials = (name = '') => {
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw size={32} className="animate-spin text-emerald-600" />
        <p className="text-sm font-bold text-slate-700">Loading Lead Details from Database...</p>
      </div>
    );
  }

  // Not Found State
  if (!lead) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-12 shadow-sm">
        <AlertCircle size={48} className="text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-black text-slate-900 mb-1">Lead Record Not Found</h3>
        <p className="text-xs text-slate-500 mb-6">
          The requested lead ID might have been deleted or you do not have permission to access it.
        </p>
        <Link
          to={backPath}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
        >
          <ArrowLeft size={14} />
          <span>Back to Leads</span>
        </Link>
      </div>
    );
  }

  const initials = getInitials(lead.name);
  const repName = lead.assignedRepName || lead.assignedTo?.name || 'Unassigned';
  const repInitials = getInitials(repName);

  return (
    <div className="space-y-5 pb-10 animate-in fade-in duration-200">
      {/* ─── Compact Top Navigation Bar ───────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Link
            to={backPath}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white border border-slate-200 text-slate-700 hover:text-emerald-800 text-xs font-bold shadow-2xs transition-all cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Back to Leads</span>
          </Link>
          <span className="text-slate-300">|</span>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-200">
            {lead.leadId || `LD-${String(lead._id).slice(-4).toUpperCase()}`}
          </span>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Created {new Date(lead.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Quick Contact & Action Buttons */}
        <div className="flex items-center gap-2">
          {lead.phone && (
            <a
              href={`tel:${lead.phone}`}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold transition-all"
              title="Call Contact"
            >
              <Phone size={12} className="text-emerald-600" />
              <span>Call</span>
            </a>
          )}
          {lead.email && (
            <a
              href={`mailto:${lead.email}`}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 text-xs font-bold transition-all"
              title="Send Email"
            >
              <Mail size={12} className="text-blue-600" />
              <span>Email</span>
            </a>
          )}
          {lead.phone && (
            <a
              href={`https://wa.me/${(lead.phone || '').replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-green-50 text-green-800 border border-green-200 hover:bg-green-100 text-xs font-bold transition-all"
              title="Chat on WhatsApp"
            >
              <MessageSquare size={12} className="text-green-600" />
              <span>WhatsApp</span>
            </a>
          )}

          {!isSalesPerson && (
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer"
              title="Delete Lead"
            >
              <Trash2 size={12} />
              <span className="hidden sm:inline">Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── Compact Hero Overview Card ───────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-emerald-100/50 via-teal-50/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-100">
          {/* Avatar + Main Details */}
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-green-600 text-white font-black text-lg flex items-center justify-center shadow-md shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {lead.name}
                </h1>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  {lead.title || 'Decision Maker'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-600 font-medium mt-0.5">
                <span className="flex items-center gap-1 font-bold text-slate-900">
                  <Building2 size={13} className="text-emerald-600" />
                  {lead.company}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-500">
                  <MapPin size={12} className="text-slate-400" />
                  {lead.location || 'India'}
                </span>
                <span>•</span>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.2 rounded-full text-[10px] font-bold">
                  {lead.source || 'Inbound'}
                </span>
              </div>
            </div>
          </div>

          {/* Economics Highlights */}
          <div className="flex items-center gap-3 bg-slate-50/90 px-4 py-2.5 rounded-2xl border border-slate-200/80 shrink-0 self-start md:self-auto">
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Deal Value
              </span>
              <span className="text-xl font-black text-emerald-700">
                ₹{Number(lead.value || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="h-7 w-px bg-slate-200" />
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
                Priority
              </span>
              <select
                value={lead.priority}
                onChange={(e) => handlePriorityChange(e.target.value)}
                className={`text-xs font-bold px-2 py-0.5 rounded-lg border cursor-pointer focus:outline-none ${getPriorityBadge(lead.priority)}`}
              >
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* ─── Compact Interactive Stage Progression Stepper ───────────────── */}
        <div className="relative z-10 pt-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers size={12} className="text-emerald-600" />
              <span>Pipeline Stage Progression</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-emerald-900 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Current: {lead.status}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {stages.map((stg, idx) => {
              const isCurrent = idx === currentStageIndex || stg.name?.toLowerCase() === lead.status?.toLowerCase();
              const isPassed = currentStageIndex !== -1 && idx < currentStageIndex;
              const hasCustomFields = Array.isArray(stg.formFields) && stg.formFields.length > 0;

              return (
                <button
                  key={stg.id}
                  onClick={() => setSelectedStageForModal(stg)}
                  disabled={isUpdating}
                  className={`flex-1 min-w-[110px] p-2 rounded-xl border text-left transition-all cursor-pointer shrink-0 ${
                    isCurrent
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20 font-black'
                      : isPassed
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold hover:bg-emerald-100'
                      : 'bg-slate-50 border-slate-200 text-slate-600 font-medium hover:bg-white hover:border-slate-300'
                  }`}
                  title={`Click to fill "${stg.name}" stage information questionnaire`}
                >
                  <div className="flex items-center justify-between text-[9px] mb-0.5">
                    <span className="font-extrabold opacity-75">#{idx + 1}</span>
                    <span className="font-bold flex items-center gap-1">
                      {hasCustomFields && (
                        <span className={`px-1 py-0.2 rounded-sm text-[8px] ${isCurrent ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-200 text-slate-700'}`}>
                          {stg.formFields.length}Q
                        </span>
                      )}
                      <span>{stg.probability}%</span>
                    </span>
                  </div>
                  <div className="text-xs truncate font-bold flex items-center justify-between gap-1">
                    <span className="truncate">{stg.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── 3-Column Detailed Workspace (Sticky Sidebar + Internal Scroller) ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* ─── COLUMN 1: Profile, Contact & Ownership (Sticky Sidebar) ──────── */}
        <div className="space-y-4 lg:sticky lg:top-4 self-start">
          {/* Contact Details Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <User size={13} className="text-emerald-600" />
                <span>Contact Specifications</span>
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[9px] font-extrabold uppercase text-slate-400 block mb-0.5">Direct Phone</span>
                <a href={`tel:${lead.phone}`} className="font-bold text-slate-900 hover:text-emerald-700 flex items-center gap-1.5">
                  <Phone size={12} className="text-emerald-600 shrink-0" />
                  <span>{lead.phone || 'Not recorded'}</span>
                </a>
              </div>

              <div>
                <span className="text-[9px] font-extrabold uppercase text-slate-400 block mb-0.5">Corporate Email</span>
                <a href={`mailto:${lead.email}`} className="font-bold text-slate-900 hover:text-blue-700 flex items-center gap-1.5 break-all">
                  <Mail size={12} className="text-blue-600 shrink-0" />
                  <span>{lead.email || 'Not recorded'}</span>
                </a>
              </div>

              <div>
                <span className="text-[9px] font-extrabold uppercase text-slate-400 block mb-0.5">Geographic Location</span>
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin size={12} className="text-slate-400 shrink-0" />
                  <span>{lead.location || 'India'}</span>
                </span>
              </div>

              <div>
                <span className="text-[9px] font-extrabold uppercase text-slate-400 block mb-0.5">Acquisition Channel</span>
                <span className="font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md inline-block">
                  {lead.source || 'Website Inbound'}
                </span>
              </div>
            </div>
          </div>

          {/* Account Owner & Closer Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-2.5">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Assigned Account Closer
            </span>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                  {repInitials}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-xs">{repName}</h4>
                  <p className="text-[10px] text-slate-400">Account Executive</p>
                </div>
              </div>

              {!isSalesPerson && (
                <select
                  value={repName}
                  onChange={(e) => handleOwnerChange(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-2 py-1 focus:outline-none cursor-pointer"
                >
                  {salesReps.map((r) => (
                    <option key={r.name} value={r.name}>{r.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Tags Card */}
          {Array.isArray(lead.tags) && lead.tags.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-2.5">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Tag size={11} className="text-emerald-600" />
                <span>Segmentation Tags</span>
              </span>
              <div className="flex flex-wrap gap-1">
                {lead.tags.map((tag, i) => (
                  <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─── COLUMN 2: Activities, Calls & Logs (Center / Right Workspace) ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Quick Action Logger Bar */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
              {/* Tab Selector */}
              <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'timeline'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Activity Feed ({(lead.timeline || []).length})
                </button>
                <button
                  onClick={() => setActiveTab('calls')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    activeTab === 'calls'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <PhoneOutgoing size={12} />
                  <span>Call Logs ({calls.length})</span>
                </button>
              </div>

              {/* Action Button to Open Call Logger */}
              <button
                type="button"
                onClick={() => setShowCallForm((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <PhoneOutgoing size={12} className="text-emerald-700" />
                <span>{showCallForm ? 'Close Call Form' : '+ Record Call Feedback'}</span>
              </button>
            </div>

            {/* Expandable Call Logger Form */}
            {showCallForm && (
              <form onSubmit={handleSaveCall} className="mt-3.5 p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                    <PhoneOutgoing size={13} className="text-emerald-700" />
                    <span>Log Call with {lead.name}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Saved directly to database & timeline
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Call Type</label>
                    <select
                      value={callForm.callType}
                      onChange={(e) => setCallForm({ ...callForm, callType: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-none"
                    >
                      <option value="Discovery Call">Discovery Call</option>
                      <option value="Product Demo">Product Demo</option>
                      <option value="Negotiation Call">Negotiation Call</option>
                      <option value="Follow-up Call">Follow-up Call</option>
                      <option value="Contract Review">Contract Review</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Duration</label>
                    <select
                      value={callForm.duration}
                      onChange={(e) => setCallForm({ ...callForm, duration: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-none"
                    >
                      <option value="5 mins">5 mins</option>
                      <option value="10 mins">10 mins</option>
                      <option value="15 mins">15 mins</option>
                      <option value="25 mins">25 mins</option>
                      <option value="45 mins">45 mins</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Call Outcome</label>
                    <select
                      value={callForm.outcome}
                      onChange={(e) => setCallForm({ ...callForm, outcome: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-none"
                    >
                      <option value="Demo Scheduled">Demo Scheduled (Positive)</option>
                      <option value="Contract Sent">Contract Sent (Positive)</option>
                      <option value="Follow-up Required">Follow-up Required</option>
                      <option value="Pricing Objection">Pricing Objection (Action Needed)</option>
                      <option value="Closed Won">Closed Won</option>
                      <option value="Not Interested">Not Interested / Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Next Follow-up Plan</label>
                    <input
                      type="text"
                      placeholder="e.g. Tomorrow, 02:00 PM"
                      value={callForm.nextFollowUp}
                      onChange={(e) => setCallForm({ ...callForm, nextFollowUp: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Key Discussion Notes *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Record conversation takeaways, client feedback, commitments..."
                    value={callForm.notes}
                    onChange={(e) => setCallForm({ ...callForm, notes: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCallForm(false)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCall || !callForm.notes.trim()}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Check size={13} />
                    <span>{isSubmittingCall ? 'Recording...' : 'Save Call Log'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* In-line Quick Note Logger */}
            <form onSubmit={handleAddNote} className="mt-3 flex items-center gap-2">
              <input
                type="text"
                placeholder="Log a quick meeting note, email note, or observation..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              <button
                type="submit"
                disabled={isSubmittingNote || !newNote.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
              >
                {isSubmittingNote ? 'Saving...' : 'Add Note'}
              </button>
            </form>
          </div>

          {/* ─── TAB 1: Activity Timeline View (Fixed Height Internal Scroller) ── */}
          {activeTab === 'timeline' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Clock size={13} className="text-emerald-600" />
                  <span>Activity Timeline Feed</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {(lead.timeline || []).length} events
                </span>
              </div>

              {(!lead.timeline || lead.timeline.length === 0) ? (
                <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                  <Clock size={24} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">No activity logged yet.</p>
                  <span className="text-[11px]">Use the box above to log your first call or note.</span>
                </div>
              ) : (
                /* ⭐️ FIXED INTERNAL SCROLLER: Limits height to prevent page stretching */
                <div className="max-h-[500px] overflow-y-auto pr-2.5 space-y-3.5 scrollbar-thin">
                  <div className="relative pl-6 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {lead.timeline.map((item, idx) => (
                      <div key={item._id || idx} className="relative group">
                        {/* Timeline Dot */}
                        <span className={`absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-2xs ${
                          item.type === 'call'
                            ? 'bg-emerald-600 ring-2 ring-emerald-100'
                            : item.type === 'stage'
                            ? 'bg-blue-600 ring-2 ring-blue-100'
                            : item.type === 'lead'
                            ? 'bg-purple-600 ring-2 ring-purple-100'
                            : 'bg-slate-400'
                        }`} />

                        <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-3 hover:bg-emerald-50/30 transition-all">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-black text-slate-900">
                              {item.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {new Date(item.time).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          {item.note && (
                            <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                              {item.note}
                            </p>
                          )}
                          <span className="text-[9px] font-bold text-slate-400 mt-1 block">
                            Logged by: {item.author || 'Sales Representative'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── TAB 2: Call Logs Tab View (Fixed Height Internal Scroller) ──── */}
          {activeTab === 'calls' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <PhoneOutgoing size={13} className="text-emerald-600" />
                  <span>Call Logs & Conversation History</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-semibold">{calls.length} logs recorded</span>
              </div>

              {calls.length === 0 ? (
                <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                  <PhoneOutgoing size={24} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">No calls recorded for this lead yet.</p>
                  <span className="text-[11px]">Click "+ Record Call Feedback" above to log a call.</span>
                </div>
              ) : (
                /* ⭐️ FIXED INTERNAL SCROLLER: Limits height to prevent page stretching */
                <div className="max-h-[500px] overflow-y-auto pr-2 space-y-3 scrollbar-thin">
                  {calls.map((call) => (
                    <div
                      key={call._id}
                      className="bg-slate-50/80 rounded-2xl border border-slate-200/90 p-3.5 space-y-2 hover:border-emerald-300 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                            <Phone size={13} />
                          </span>
                          <div>
                            <h4 className="text-xs font-black text-slate-900">{call.callType}</h4>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              Duration: {call.duration} • {new Date(call.callDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          call.outcomeStatus === 'positive'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : call.outcomeStatus === 'needs_action'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {call.outcome}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-wrap">
                        "{call.notes}"
                      </p>

                      {call.nextFollowUp && (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium pt-0.5">
                          <Calendar size={11} className="text-emerald-600" />
                          <span>Follow-up: <strong className="text-slate-800">{call.nextFollowUp}</strong></span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── Stage Questionnaire Dynamic Modal ────────────────────────────── */}
      <StageInfoFormModal
        isOpen={Boolean(selectedStageForModal)}
        onClose={() => setSelectedStageForModal(null)}
        stage={selectedStageForModal}
        lead={lead}
        onSave={handleSaveStageModal}
        isSaving={isSavingStageModal}
        onSaveTemplate={handleSaveStageTemplateFromModal}
      />
    </div>
  );
}

