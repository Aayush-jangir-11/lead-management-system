import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGet, usePost, useToast } from '../../hooks';
import {
  Users, Phone, PhoneCall, PhoneIncoming, PhoneOutgoing, Mail,
  Building2, Calendar, Clock, MessageSquare, CheckCircle2,
  AlertCircle, ChevronRight, Search, Filter, Plus, ArrowUpRight,
  TrendingUp, Award, UserCheck, Sparkles, X, History, ExternalLink, Shield
} from 'lucide-react';
import ContactDetailsDrawer from '../../components/contacts/ContactDetailsDrawer';

export default function Contacts() {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Local state for contacts with call tracking
  const [contacts, setContacts] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRep, setSelectedRep] = useState('All');
  const [selectedOutcome, setSelectedOutcome] = useState('All');

  // Drawer & Modal States
  const [selectedContactForDrawer, setSelectedContactForDrawer] = useState(null);
  const [drawerInitialTab, setDrawerInitialTab] = useState('history');
  const [selectedContactForLog, setSelectedContactForLog] = useState(null);
  const [isLogCallModalOpen, setIsLogCallModalOpen] = useState(false);

  // New Call Form State
  const [callForm, setCallForm] = useState({
    repName: user?.name || '',
    callDuration: '15 mins',
    callType: 'Follow-up Call',
    callOutcome: 'Demo Scheduled',
    feedbackNotes: '',
    nextFollowUp: 'Tomorrow, 03:00 PM',
  });

  // Persist contacts to localStorage
  const saveContacts = (updated) => {
    setContacts(updated);
  };

  // Close modals & drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedContactForDrawer(null);
        setIsLogCallModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ─── TanStack Query: Fetch live Call Logs and Leads from Backend ────────────
  const { data: callsData, isLoading: isCallsLoading, refetch: refetchCalls } = useGet(['contacts-calls'], '/calls');
  const { data: leadsData, isLoading: isLeadsLoading, refetch: refetchLeads } = useGet(['contacts-leads'], '/leads');

  // ─── TanStack Mutation: Log Call ─────────────────────────────────────────────
  const logCallMutation = usePost('/calls', {
    invalidateKeys: [['contacts-calls']],
    onError: (apiErr) => {
      console.warn('Backend call log sync note:', apiErr?.message);
    },
  });

  // Sync live leads and call logs into contacts
  useEffect(() => {
    const leadsList = Array.isArray(leadsData?.leads) ? leadsData.leads : [];
    const callsList = Array.isArray(callsData?.callLogs) ? callsData.callLogs : [];

    if (!leadsData && !callsData) return;

    const contactsMap = new Map();

    // 1. Populate contacts from live leads
    leadsList.forEach((lead) => {
      const leadId = String(lead._id || lead.id);
      const repName = lead.assignedRepName || lead.assignedTo?.name || 'Unassigned';
      const repInitials = repName
        .split(' ')
        .filter(Boolean)
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

      contactsMap.set(leadId, {
        id: leadId,
        _id: lead._id,
        name: lead.name || 'Unnamed Contact',
        title: lead.title || lead.companyRole || 'Client Stakeholder',
        company: lead.company || 'Unknown Company',
        email: lead.email || '',
        phone: lead.phone || '',
        assignedRep: repName,
        repAvatar: repInitials || 'UN',
        repColor: 'bg-emerald-600',
        totalCalls: 0,
        lastCallDate: 'No calls yet',
        lastCallDuration: '-',
        lastCallType: '-',
        lastCallOutcome: 'Pending Contact',
        outcomeStatus: 'pending',
        lastCallFeedback: 'No calls logged yet.',
        nextFollowUp: 'TBD',
        status: lead.status || 'Active',
        callHistory: [],
      });
    });

    // 2. Attach calls to the contacts
    callsList.forEach((call) => {
      if (!call.lead) return;
      const leadObj = typeof call.lead === 'object' ? call.lead : { _id: call.lead };
      const leadId = String(leadObj._id || leadObj.id || call.lead);
      const leadName = leadObj.name;

      const historyItem = {
        id: call._id,
        rep: call.salesperson?.name || 'Sales Rep',
        date: call.callDate
          ? new Date(call.callDate).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'Recent',
        duration: call.duration || '10 mins',
        type: call.callType || 'Call',
        outcome: call.outcome || 'Completed',
        notes: call.notes || '',
      };

      let contact = contactsMap.get(leadId);
      if (!contact && leadName) {
        for (const c of contactsMap.values()) {
          if (c.name?.toLowerCase() === leadName.toLowerCase()) {
            contact = c;
            break;
          }
        }
      }

      if (contact) {
        contact.totalCalls = (contact.totalCalls || 0) + 1;
        contact.callHistory.unshift(historyItem);
        contact.lastCallDate = historyItem.date;
        contact.lastCallDuration = call.duration || '10 mins';
        contact.lastCallType = call.callType || 'Call';
        contact.lastCallOutcome = call.outcome || 'Completed';
        contact.outcomeStatus = call.outcomeStatus || 'pending';
        contact.lastCallFeedback = call.notes || 'Call discussion logged.';
        contact.nextFollowUp = call.nextFollowUp || 'TBD';
      } else if (leadObj.name) {
        const dynamicId = leadId || `lead-${Date.now()}`;
        contactsMap.set(dynamicId, {
          id: dynamicId,
          _id: leadObj._id,
          name: leadObj.name,
          title: leadObj.title || 'Client Stakeholder',
          company: leadObj.company || 'Enterprise Client',
          email: leadObj.email || '',
          phone: leadObj.phone || '',
          assignedRep: call.salesperson?.name || 'Sales Rep',
          repAvatar: (call.salesperson?.name || 'SR')
            .split(' ')
            .filter(Boolean)
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase(),
          repColor: 'bg-emerald-600',
          totalCalls: 1,
          lastCallDate: historyItem.date,
          lastCallDuration: call.duration || '10 mins',
          lastCallType: call.callType || 'Call',
          lastCallOutcome: call.outcome || 'Completed',
          outcomeStatus: call.outcomeStatus || 'pending',
          lastCallFeedback: call.notes || 'Call discussion logged.',
          nextFollowUp: call.nextFollowUp || 'TBD',
          status: 'Active',
          callHistory: [historyItem],
        });
      }
    });

    setContacts(Array.from(contactsMap.values()));
  }, [leadsData, callsData]);

  // Compute Sales Reps summary
  const teamReps = useMemo(() => {
    const repsMap = {};
    contacts.forEach((c) => {
      if (!repsMap[c.assignedRep]) {
        repsMap[c.assignedRep] = {
          name: c.assignedRep,
          avatar: c.repAvatar || c.assignedRep.substring(0, 2).toUpperCase(),
          color: c.repColor || 'bg-emerald-600',
          totalCalls: 0,
          contactsCount: 0,
          latestFeedback: c.lastCallFeedback,
          latestContact: c.name,
        };
      }
      repsMap[c.assignedRep].totalCalls += c.totalCalls || 0;
      repsMap[c.assignedRep].contactsCount += 1;
    });
    return Object.values(repsMap);
  }, [contacts]);

  // Aggregate Metrics
  const totalCallsLogged = useMemo(() => {
    return contacts.reduce((sum, c) => sum + (c.totalCalls || 0), 0);
  }, [contacts]);

  const activeContactsCount = contacts.length;

  const positiveCallsCount = useMemo(() => {
    return contacts.filter((c) => c.outcomeStatus === 'positive' || c.outcomeStatus === 'closed').length;
  }, [contacts]);

  const needsActionCount = useMemo(() => {
    return contacts.filter((c) => c.outcomeStatus === 'needs_action').length;
  }, [contacts]);

  // Filtered Contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const matchSearch =
        searchQuery === '' ||
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.lastCallFeedback.toLowerCase().includes(searchQuery.toLowerCase());

      const matchRep = selectedRep === 'All' || contact.assignedRep === selectedRep;
      const matchOutcome = selectedOutcome === 'All' || contact.outcomeStatus === selectedOutcome;

      return matchSearch && matchRep && matchOutcome;
    });
  }, [contacts, searchQuery, selectedRep, selectedOutcome]);

  // Open Log Call Modal
  const handleOpenLogModal = (contact) => {
    setSelectedContactForLog(contact);
    setCallForm({
      repName: contact.assignedRep,
      callDuration: '15 mins',
      callType: 'Follow-up Call',
      callOutcome: 'Demo Scheduled',
      feedbackNotes: '',
      nextFollowUp: 'Tomorrow, 03:00 PM',
    });
    setIsLogCallModalOpen(true);
  };

  // Submit Call Log
  const handleLogCallSubmit = async (e) => {
    e.preventDefault();
    if (!selectedContactForLog) return;

    let outcomeStatus = 'pending';
    if (callForm.callOutcome === 'Demo Scheduled' || callForm.callOutcome === 'Contract Sent') {
      outcomeStatus = 'positive';
    } else if (callForm.callOutcome === 'Closed Won') {
      outcomeStatus = 'closed';
    } else if (callForm.callOutcome === 'Pricing Objection' || callForm.callOutcome === 'Follow-up Required') {
      outcomeStatus = 'needs_action';
    }

    // Persist to Backend API via TanStack Mutation
    try {
      await logCallMutation.mutateAsync({
        lead: selectedContactForLog._id || selectedContactForLog.id,
        duration: callForm.callDuration || '10 mins',
        callType: callForm.callType,
        outcome: callForm.callOutcome,
        outcomeStatus,
        notes: callForm.feedbackNotes || 'Call discussion logged.',
        nextFollowUp: callForm.nextFollowUp || 'TBD',
      });
    } catch (apiErr) {
      console.warn('Backend call log sync note:', apiErr?.message);
    }

    const newLogEntry = {
      id: `CH-${Date.now()}`,
      rep: callForm.repName,
      date: 'Just Now',
      duration: callForm.callDuration || '10 mins',
      type: callForm.callType,
      notes: callForm.feedbackNotes || 'Call logged with client.',
    };

    const updated = contacts.map((c) => {
      if (c.id === selectedContactForLog.id) {
        return {
          ...c,
          totalCalls: (c.totalCalls || 0) + 1,
          lastCallDate: 'Just Now',
          lastCallDuration: callForm.callDuration || '10 mins',
          lastCallType: callForm.callType,
          lastCallOutcome: callForm.callOutcome,
          outcomeStatus: outcomeStatus,
          lastCallFeedback: callForm.feedbackNotes || 'Discussion completed.',
          nextFollowUp: callForm.nextFollowUp || 'TBD',
          callHistory: [newLogEntry, ...(c.callHistory || [])],
        };
      }
      return c;
    });

    saveContacts(updated);

    // If currently inspecting this contact in drawer, keep it synced
    if (selectedContactForDrawer && selectedContactForDrawer.id === selectedContactForLog.id) {
      const refreshed = updated.find((c) => c.id === selectedContactForLog.id);
      setSelectedContactForDrawer(refreshed);
    }

    setIsLogCallModalOpen(false);
    showToast(`Call logged successfully for ${selectedContactForLog.name}!`);
  };

  const getOutcomeBadge = (outcome, status) => {
    switch (status) {
      case 'positive':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'closed':
        return 'bg-green-100 text-green-950 border-green-400 font-extrabold';
      case 'needs_action':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      case 'pending':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-100/90 via-teal-50 to-green-100/80 text-slate-800 shadow-sm p-5 sm:p-6 border border-emerald-200/90">
        <div className="absolute -top-24 -left-20 w-80 h-80 bg-emerald-300/35 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-20 w-80 h-80 bg-teal-300/35 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-3.5">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-200/90 border border-emerald-300/90 text-emerald-900 shadow-2xs">
              <PhoneCall size={13} className="text-emerald-700" />
              Manager Contacts & Call Intelligence
            </span>
            <span className="text-xs text-emerald-400">•</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/70 border border-emerald-200/80 text-slate-700">
              <Users size={12} className="text-emerald-600" />
              {activeContactsCount} Enterprise Accounts
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Client Contacts & Call Intelligence</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-600 text-white tracking-normal">
              Active Radar
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
            Monitor client discussions, total calls executed per sales representative, discussion outcomes, and sales process feedback notes in real time. Click any row to inspect the full account drawer.
          </p>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Total Calls Logged</span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <PhoneCall size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalCallsLogged}</span>
            <span className="text-xs font-bold text-emerald-600">Across Team</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">
            {teamReps.length} active closers in rotation
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Positive / Won</span>
            <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{positiveCallsCount}</span>
            <span className="text-xs font-bold text-teal-700">Advancing</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">
            Demos & contract executions
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Objections / Action</span>
            <div className="p-2 rounded-xl bg-rose-100 text-rose-800">
              <AlertCircle size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600">{needsActionCount}</span>
            <span className="text-xs font-bold text-rose-600">Pending Review</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">
            Price or SLA clearance needed
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Average Calls / Deal</span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {activeContactsCount ? (totalCallsLogged / activeContactsCount).toFixed(1) : 0}
            </span>
            <span className="text-xs font-bold text-amber-700">Calls/Client</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">
            Velocity before closing
          </span>
        </div>
      </div>

      {/* 3. Filter Bar & Search */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name, company, phone, email, or discussion notes..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Closer Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <Filter size={13} className="text-slate-400" />
            <span className="text-[11px] font-bold text-slate-500">Closer:</span>
            <select
              value={selectedRep}
              onChange={(e) => setSelectedRep(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All Closers</option>
              {teamReps.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Outcome Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <span className="text-[11px] font-bold text-slate-500">Outcome:</span>
            <select
              value={selectedOutcome}
              onChange={(e) => setSelectedOutcome(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All Outcomes</option>
              <option value="positive">Positive / Advanced</option>
              <option value="closed">Closed Won</option>
              <option value="needs_action">Needs Action / Objection</option>
              <option value="pending">Follow-up Pending</option>
            </select>
          </div>

          {(searchQuery || selectedRep !== 'All' || selectedOutcome !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedRep('All');
                setSelectedOutcome('All');
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 4. Enterprise CRM Contacts Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-5">Contact & Company</th>
                <th className="py-3.5 px-4">Assigned Closer</th>
                <th className="py-3.5 px-4 text-center">Calls</th>
                <th className="py-3.5 px-4">Latest Call Outcome</th>
                <th className="py-3.5 px-4">Process Notes / Feedback</th>
                <th className="py-3.5 px-4">Next Follow-up</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users size={32} className="mx-auto mb-2 text-slate-300" />
                    <h3 className="text-sm font-extrabold text-slate-800">No client contacts found</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      No contacts match your active search or sales rep filter criteria.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr
                    key={contact.id}
                    onClick={() => {
                      setDrawerInitialTab('overview');
                      setSelectedContactForDrawer(contact);
                    }}
                    className="hover:bg-emerald-50/40 transition-colors group cursor-pointer"
                    title="Click to open full account intelligence drawer"
                  >
                    {/* 1. Contact & Company */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-black text-xs shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          {contact.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-slate-900 block truncate text-xs group-hover:text-emerald-700 transition-colors">
                              {contact.name}
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 shrink-0">
                              {contact.status}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 block truncate font-medium">
                            {contact.title}
                          </span>
                          <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1 mt-0.5 truncate">
                            <Building2 size={11} className="text-slate-400 shrink-0" />
                            <span className="truncate">{contact.company}</span>
                          </span>
                        </div>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-600 transition-colors shrink-0 ml-1" />
                      </div>
                    </td>

                    {/* 2. Assigned Closer */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full ${contact.repColor} text-white flex items-center justify-center text-[10px] font-black shrink-0`}>
                          {contact.repAvatar}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-800 block text-xs">
                            {contact.assignedRep}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-medium">
                            Account Closer
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 3. Call Counter & Velocity */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <PhoneCall size={11} className="text-emerald-600" />
                        <span>{contact.totalCalls} Calls</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium block mt-1">
                        Last: {contact.lastCallDate}
                      </span>
                    </td>

                    {/* 4. Last Call Outcome */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${getOutcomeBadge(contact.lastCallOutcome, contact.outcomeStatus)}`}>
                        {contact.outcomeStatus === 'positive' || contact.outcomeStatus === 'closed' ? (
                          <CheckCircle2 size={11} className="shrink-0" />
                        ) : (
                          <AlertCircle size={11} className="shrink-0" />
                        )}
                        <span>{contact.lastCallOutcome}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium block mt-1">
                        {contact.lastCallType} ({contact.lastCallDuration})
                      </span>
                    </td>

                    {/* 5. Process Feedback / Notes */}
                    <td className="py-4 px-4 max-w-xs">
                      <p className="text-[11px] text-slate-600 line-clamp-2 italic font-medium leading-relaxed bg-slate-50/80 p-2 rounded-xl border border-slate-100">
                        "{contact.lastCallFeedback}"
                      </p>
                    </td>

                    {/* 6. Next Follow-up */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
                        <Clock size={12} className="text-emerald-600 shrink-0" />
                        <span>{contact.nextFollowUp}</span>
                      </div>
                    </td>

                    {/* 7. Action Buttons */}
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenLogModal(contact);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                          title="Log discussion and feedback"
                        >
                          <PhoneCall size={12} />
                          <span>Log Call</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDrawerInitialTab('history');
                            setSelectedContactForDrawer(contact);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-[11px] font-bold transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                          title="View complete call history timeline in Account Drawer"
                        >
                          <History size={12} className="text-emerald-600" />
                          <span>History</span>
                        </button>

                        <a
                          href={`tel:${contact.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 transition-colors"
                          title={`Call ${contact.phone}`}
                        >
                          <Phone size={13} />
                        </a>

                        <a
                          href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`}
                          onClick={(e) => e.stopPropagation()}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 transition-colors"
                          title="WhatsApp chat"
                        >
                          <MessageSquare size={13} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary Bar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800">{filteredContacts.length}</strong> of <strong className="text-slate-800">{contacts.length}</strong> managed enterprise contacts
          </span>
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
            Click any row to open slide-over Account Drawer
          </span>
        </div>
      </div>

      {/* 5. Log Call & Process Feedback Modal */}
      {isLogCallModalOpen && selectedContactForLog && (
        <div className="fixed inset-0 z-[110] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 pt-16 sm:pt-18">
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 z-10 animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Log Call & Discussion Feedback
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedContactForLog.name} • {selectedContactForLog.company}
                </p>
              </div>
              <button
                onClick={() => setIsLogCallModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleLogCallSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block mb-1">
                    Sales Person *
                  </label>
                  <select
                    value={callForm.repName}
                    onChange={(e) => setCallForm({ ...callForm, repName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    {teamReps.map((r) => (
                      <option key={r.name} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block mb-1">
                    Call Type *
                  </label>
                  <select
                    value={callForm.callType}
                    onChange={(e) => setCallForm({ ...callForm, callType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="Discovery Call">Discovery Call</option>
                    <option value="Follow-up Call">Follow-up Call</option>
                    <option value="Product Architecture Walkthrough">Product Architecture Walkthrough</option>
                    <option value="Custom Pricing Review">Custom Pricing Review</option>
                    <option value="Contract Clearance">Contract Clearance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block mb-1">
                    Call Duration
                  </label>
                  <input
                    type="text"
                    value={callForm.callDuration}
                    onChange={(e) => setCallForm({ ...callForm, callDuration: e.target.value })}
                    placeholder="e.g. 15 mins"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block mb-1">
                    Outcome / Process Result *
                  </label>
                  <select
                    value={callForm.callOutcome}
                    onChange={(e) => setCallForm({ ...callForm, callOutcome: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="Demo Scheduled">Demo Scheduled</option>
                    <option value="Interested - Send Deck">Interested - Send Deck</option>
                    <option value="Pricing Objection">Pricing Objection</option>
                    <option value="Follow-up Required">Follow-up Required</option>
                    <option value="Security Review Passed">Security Review Passed</option>
                    <option value="Contract Sent">Contract Sent</option>
                    <option value="Closed Won">Closed Won</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block mb-1">
                  Salesperson Feedback & Process Notes *
                </label>
                <textarea
                  required
                  rows={3}
                  value={callForm.feedbackNotes}
                  onChange={(e) => setCallForm({ ...callForm, feedbackNotes: e.target.value })}
                  placeholder="Detail client feedback, objections, agreed next steps..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block mb-1">
                  Next Scheduled Action / Follow-up *
                </label>
                <input
                  type="text"
                  required
                  value={callForm.nextFollowUp}
                  onChange={(e) => setCallForm({ ...callForm, nextFollowUp: e.target.value })}
                  placeholder="e.g. Tomorrow, 11:30 AM"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLogCallModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={logCallMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/20 disabled:opacity-60 cursor-pointer"
                >
                  {logCallMutation.isPending ? 'Saving...' : 'Save Call Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Contact Details Drawer (Slide-over panel on row click or History click) */}
      <ContactDetailsDrawer
        contact={selectedContactForDrawer}
        initialTab={drawerInitialTab}
        onClose={() => setSelectedContactForDrawer(null)}
        onOpenLogModal={handleOpenLogModal}
      />
    </div>
  );
}
