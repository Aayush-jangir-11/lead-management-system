import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Target, Phone, CheckCircle2, Clock, TrendingUp,
  Flame, Award, Plus, ArrowRight, Star,
  Users, Sparkles, Check, PhoneCall, MessageSquare,
  Mail, Zap, Calendar, Search, Filter, AlertCircle,
  ChevronRight, ExternalLink, RefreshCw, Trophy,
  DollarSign, ArrowUpRight, CheckCircle, MoreVertical, X, PhoneOutgoing
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useGet, usePost, useToast } from '../../hooks';

export default function SalesPersonDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useToast();
  const currentRepName = user?.name || 'Sales Rep';

  // Current active filter for leads tab
  const [leadTab, setLeadTab] = useState('hot'); // 'all' | 'hot' | 'today' | 'proposal'
  const [searchQuery, setSearchQuery] = useState('');

  // Call queue state (local + synchronized with backend)
  const [calls, setCalls] = useState([]);

  // ─── TanStack Query: Live call logs and leads from MongoDB backend ────────────
  const { data: callsData, isLoading: isCallsLoading, refetch: refetchCalls } = useGet(['salesperson-calls'], '/calls');
  const { data: leadsData, isLoading: isLeadsLoading, refetch: refetchLeads } = useGet(['salesperson-leads'], '/leads');

  // ─── TanStack Mutation: Log Call Feedback ─────────────────────────────────────
  const logCallMutation = usePost('/calls', {
    invalidateKeys: [['salesperson-calls']],
    onError: (apiErr) => {
      console.warn('Backend call log sync note:', apiErr?.message);
    },
  });

  // Derived lead items list from TanStack Query
  const leadsList = useMemo(() => {
    if (leadsData?.success && Array.isArray(leadsData?.leads) && leadsData.leads.length > 0) {
      return leadsData.leads.map((l) => ({
        id: l.leadId || `LD-${String(l._id).slice(-4).toUpperCase()}`,
        _id: l._id,
        name: l.name,
        title: l.title || 'Decision Maker',
        company: l.company,
        email: l.email || '',
        phone: l.phone || '+91 98000 00000',
        city: l.location || 'India',
        source: l.source || 'Inbound',
        score: l.score || 75,
        stage: l.status || 'New Lead',
        value: `₹${Number(l.value || 0).toLocaleString('en-IN')}`,
        isHot: (l.score || 75) >= 80,
        lastContact: l.lastContacted ? new Date(l.lastContacted).toLocaleDateString('en-IN') : 'Recently',
        nextFollowUp: 'Tomorrow, 11:00 AM',
      }));
    }
    return [];
  }, [leadsData]);

  // Synchronize backend calls into local call queue
  useEffect(() => {
    if (callsData?.success && Array.isArray(callsData?.callLogs) && callsData.callLogs.length > 0) {
      const backendCalls = callsData.callLogs.map((log) => ({
        id: log._id,
        name: log.lead?.name || 'Client',
        company: log.lead?.company || 'Organization',
        dealValue: log.lead?.value ? `₹${Number(log.lead.value).toLocaleString('en-IN')}` : '₹5,00,000',
        phone: log.lead?.phone || '+91 98000 00000',
        time: new Date(log.callDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        overdue: false,
        stage: log.stage?.name || log.lead?.status || 'Follow-up',
        priority: log.outcomeStatus === 'needs_action' ? 'high' : 'medium',
        notes: log.notes,
        done: true,
        _id: log._id,
        leadDoc: log.lead,
      }));

      setCalls((prev) => {
        const pendingCalls = prev.filter((c) => !c.done);
        return [...pendingCalls, ...backendCalls];
      });
    }
  }, [callsData]);

  // Modal State for Quick Call & Feedback Logging
  const [activeCallModalItem, setActiveCallModalItem] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({
    duration: '8 mins',
    callType: 'Follow-up Call',
    outcome: 'Demo Scheduled',
    notes: '',
    nextFollowUp: 'Tomorrow, 02:00 PM',
  });

  // Quick stats
  const stats = [
    {
      label: "Today's Target Calls",
      value: '14 / 20',
      progress: 70,
      sub: '6 remaining for daily goal',
      icon: PhoneCall,
      color: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-500/15',
      badge: 'On Pace',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      label: 'My Hot Leads',
      value: '9 Leads',
      sub: '₹24.7L pipeline value',
      icon: Flame,
      color: 'from-amber-500 to-orange-600',
      shadow: 'shadow-orange-500/15',
      badge: 'High Intent',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      label: 'Deals Closed (Oct)',
      value: '₹11.4L',
      sub: '7 deals won this month',
      icon: Trophy,
      color: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/15',
      badge: '+18% MoM',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      label: 'Closing Ratio',
      value: '31.2%',
      sub: 'Team avg: 22.5%',
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-600',
      shadow: 'shadow-purple-500/15',
      badge: 'Top 5%',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    },
  ];

  // Open Call Log Modal for a specific client
  const handleOpenCallLogger = (callOrLead) => {
    setActiveCallModalItem(callOrLead);
    setFeedbackForm({
      duration: '8 mins',
      callType: 'Follow-up Call',
      outcome: 'Demo Scheduled',
      notes: callOrLead.notes || '',
      nextFollowUp: 'Tomorrow, 02:00 PM',
    });
  };

  // Submit Call Log & Auto-sync with Manager Contacts
  const handleSaveCallFeedback = async (e) => {
    e.preventDefault();
    if (!activeCallModalItem) return;

    // 1. Mark call done in local queue
    setCalls((prev) =>
      prev.map((c) => (c.name === activeCallModalItem.name ? { ...c, done: true, notes: feedbackForm.notes } : c))
    );

    // 2. Persist to Backend MongoDB API via TanStack Mutation
    try {
      await logCallMutation.mutateAsync({
        lead: activeCallModalItem._id || activeCallModalItem.id,
        duration: feedbackForm.duration,
        callType: feedbackForm.callType,
        outcome: feedbackForm.outcome,
        notes: feedbackForm.notes,
        nextFollowUp: feedbackForm.nextFollowUp,
      });
    } catch (apiErr) {
      console.warn('Backend call log sync note:', apiErr?.message);
    }

    // 3. Auto-sync with Manager's Contacts Storage (leadflow_manager_contacts_records)
    try {
      const savedContacts = localStorage.getItem('leadflow_manager_contacts_records');
      let contactsList = savedContacts ? JSON.parse(savedContacts) : [];

      const newHistoryEntry = {
        id: `CH-${Date.now()}`,
        rep: currentRepName,
        date: 'Just now',
        duration: feedbackForm.duration,
        type: feedbackForm.callType,
        outcome: feedbackForm.outcome,
        notes: feedbackForm.notes,
      };

      let outcomeStatus = 'pending';
      if (
        feedbackForm.outcome.includes('Demo') ||
        feedbackForm.outcome.includes('Passed') ||
        feedbackForm.outcome.includes('Contract') ||
        feedbackForm.outcome.includes('Won')
      ) {
        outcomeStatus = 'positive';
      } else if (feedbackForm.outcome.includes('Objection') || feedbackForm.outcome.includes('Needs')) {
        outcomeStatus = 'needs_action';
      }

      const existingIndex = contactsList.findIndex(
        (c) => c.name.toLowerCase() === activeCallModalItem.name.toLowerCase()
      );

      if (existingIndex !== -1) {
        // Update existing contact
        contactsList[existingIndex] = {
          ...contactsList[existingIndex],
          assignedRep: currentRepName,
          totalCalls: (contactsList[existingIndex].totalCalls || 0) + 1,
          lastCallDate: 'Just now',
          lastCallDuration: feedbackForm.duration,
          lastCallType: feedbackForm.callType,
          lastCallOutcome: feedbackForm.outcome,
          outcomeStatus,
          lastCallFeedback: feedbackForm.notes || contactsList[existingIndex].lastCallFeedback,
          nextFollowUp: feedbackForm.nextFollowUp,
          callHistory: [newHistoryEntry, ...(contactsList[existingIndex].callHistory || [])],
        };
      } else {
        // Add as a new contact for manager
        const newContact = {
          id: `CNT-${Date.now()}`,
          name: activeCallModalItem.name,
          title: activeCallModalItem.title || 'Client Stakeholder',
          company: activeCallModalItem.company || 'Enterprise Account',
          email: activeCallModalItem.email || 'client@contact.com',
          phone: activeCallModalItem.phone || '+91 98000 00000',
          assignedRep: currentRepName,
          repAvatar: currentRepName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase(),
          repColor: 'bg-blue-600',
          totalCalls: 1,
          lastCallDate: 'Just now',
          lastCallDuration: feedbackForm.duration,
          lastCallType: feedbackForm.callType,
          lastCallOutcome: feedbackForm.outcome,
          outcomeStatus,
          lastCallFeedback: feedbackForm.notes,
          nextFollowUp: feedbackForm.nextFollowUp,
          status: 'In Progress',
          callHistory: [newHistoryEntry],
        };
        contactsList.unshift(newContact);
      }

      localStorage.setItem('leadflow_manager_contacts_records', JSON.stringify(contactsList));
      showNotification(`Call with ${activeCallModalItem.name} logged! Auto-synced to Manager's Contact Board.`);
    } catch (err) {
      console.error('Error auto-syncing call log:', err);
    }

    setActiveCallModalItem(null);
  };

  const toggleCallDone = (id) => {
    setCalls(calls.map((c) => (c.id === id ? { ...c, done: !c.done } : c)));
  };

  // Filtered leads
  const filteredLeads = leadsList.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (leadTab === 'hot') return l.isHot;
    if (leadTab === 'today') return l.nextFollowUp.toLowerCase().includes('today');
    if (leadTab === 'proposal') return l.stage === 'Proposal Sent' || l.stage === 'Negotiation';
    return true;
  });

  const getStageColor = (stage) => {
    switch (stage) {
      case 'Negotiation':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Proposal Sent':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Demo Scheduled':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Contacted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-7 pb-10 font-sans">
      {/* HERO BANNER & PERSONAL QUOTA CARD (SEAMLESS LIGHT GREEN) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-200/70 via-teal-100/60 to-emerald-100/80 text-slate-800 shadow-sm p-6 sm:p-7 border border-emerald-300/70">
        {/* Glow ambient effects */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-300/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Welcome User Info */}
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-300/40 border border-emerald-400/50 text-emerald-900 text-xs font-bold backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                Sales Champion Portal • Active Shift
              </div>
              {(isCallsLoading || isLeadsLoading) && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/70 border border-emerald-300 text-emerald-800 animate-pulse">
                  <RefreshCw size={11} className="animate-spin text-emerald-600" /> Live Syncing...
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome back, <span className="text-emerald-800">{currentRepName}!</span> 🔥
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              You are on pace to crush your monthly target! 4 scheduled callbacks pending today. Dialing now auto-syncs with your team manager's dashboard.
            </p>
          </div>

          {/* Mini Quota Card */}
          <div className="bg-white/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-emerald-300/60 shadow-xs flex items-center gap-5 w-full sm:w-auto shrink-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">Monthly Quota</div>
              <div className="text-xl font-black text-slate-900">₹14.8L / ₹18L</div>
              <div className="text-[11px] font-extrabold text-emerald-800 flex items-center gap-1 mt-0.5">
                <TrendingUp className="w-3 h-3 text-emerald-600" /> 82% Attained • 8 Days Left
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK KPI STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${s.color} text-white flex items-center justify-center shadow-md ${s.shadow} group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${s.badgeColor}`}>
                  {s.badge}
                </span>
              </div>

              <div className="mt-4 space-y-1">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{s.label}</span>
                <div className="text-2xl font-black text-slate-900">{s.value}</div>
                <p className="text-xs text-slate-500 font-medium">{s.sub}</p>
              </div>

              {s.progress !== undefined && (
                <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${s.progress}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* TODAY'S ACTION CALL QUEUE & MINI WINS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Priority Call & Action Queue */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                <h2 className="text-lg font-bold text-slate-900">Today's Priority Action Queue</h2>
                <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-indigo-200">
                  {calls.filter((c) => !c.done).length} Pending
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Dial contacts and log outcomes. Notes automatically sync to your manager's contact intelligence board.
              </p>
            </div>
          </div>

          {/* Call queue items */}
          <div className="space-y-3">
            {calls.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <PhoneCall className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">No calls in your priority action queue</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Leads create hone par yahan calls reflect hongi.</p>
              </div>
            ) : (
              calls.map((call) => (
              <div
                key={call.id}
                className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  call.done
                    ? 'bg-slate-50/70 border-slate-200 opacity-60'
                    : call.overdue
                    ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300 shadow-sm'
                    : 'bg-white border-slate-200/80 hover:border-indigo-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <button
                    onClick={() => toggleCallDone(call.id)}
                    className={`mt-1 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                      call.done
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'border-2 border-slate-300 hover:border-indigo-600 bg-white'
                    }`}
                    title={call.done ? 'Mark as Pending' : 'Mark as Done'}
                  >
                    {call.done && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`font-bold text-sm ${call.done ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {call.name}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-medium text-slate-600">{call.company}</span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {call.dealValue}
                      </span>
                      {call.overdue && !call.done && (
                        <span className="text-[10px] font-extrabold uppercase bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Overdue
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{call.notes}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1 font-medium text-slate-600">
                        <Clock className="w-3 h-3 text-indigo-500" /> {call.time}
                      </span>
                      <span>•</span>
                      <span className="font-medium text-indigo-600">{call.stage}</span>
                    </div>
                  </div>
                </div>

                {/* Instant Actions & Log Call */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <a
                    href={`tel:${call.phone}`}
                    onClick={() => handleOpenCallLogger(call)}
                    className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 transition-colors shadow-sm"
                    title={`Call ${call.name}`}
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <a
                    href={`https://wa.me/${call.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-green-50 text-green-700 hover:bg-green-600 hover:text-white border border-green-200 transition-colors shadow-sm"
                    title="Send WhatsApp message"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleOpenCallLogger(call)}
                    className="inline-flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs cursor-pointer"
                  >
                    <PhoneOutgoing className="w-3.5 h-3.5" />
                    <span>Log Feedback</span>
                  </button>
                </div>
              </div>
            )))}
          </div>
        </div>

        {/* Right Col: Performance & Daily Motivation Card */}
        <div className="space-y-6">
          {/* Performance Card */}
          <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="flex items-center justify-between pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                Rep Scorecard
              </span>
              <Award className="w-6 h-6 text-amber-300" />
            </div>

            <div className="space-y-3">
              <div className="text-3xl font-black">94 / 100</div>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Superb conversion speed! Your average time to first touch is <strong>8 minutes</strong> (team target &lt; 15m).
              </p>

              <div className="pt-3 border-t border-white/20 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-200">Avg Deal Size</span>
                  <span className="font-bold">₹3.8 Lakhs</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-200">Calls Handled (Week)</span>
                  <span className="font-bold">64 Calls</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-200">Pipeline Velocity</span>
                  <span className="font-bold text-amber-300">14 Days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Script / Objection Helper */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Today's Smart Tip</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <em>"When discussing pricing objections with SaaS prospects today, highlight our zero-downtime SLA and 30-day money-back assurance."</em>
            </p>
            <div className="flex justify-between items-center pt-1 text-xs">
              <span className="text-slate-400">Battlecard #4</span>
              <a href="#pipeline" className="text-indigo-600 font-semibold hover:underline">
                Open Pitch Deck →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* MY ASSIGNED LEADS WITH QUICK TABS & ATTRACTIVE ACTIONS */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-6">
        {/* Header & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">My Assigned Pipeline</h2>
            <p className="text-xs text-slate-500 mt-1">
              Active leads currently assigned exclusively to you
            </p>
          </div>

          {/* Action Tabs & Search */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search lead or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all w-56"
              />
            </div>

            {/* Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
              <button
                onClick={() => setLeadTab('hot')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  leadTab === 'hot' ? 'bg-white text-orange-600 shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                <Flame className="w-3.5 h-3.5" /> Hot ({leadsList.filter((l) => l.isHot).length})
              </button>
              <button
                onClick={() => setLeadTab('today')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  leadTab === 'today' ? 'bg-white text-indigo-600 shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                Today's Follow-up
              </button>
              <button
                onClick={() => setLeadTab('proposal')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  leadTab === 'proposal' ? 'bg-white text-indigo-600 shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                Proposals
              </button>
              <button
                onClick={() => setLeadTab('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  leadTab === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                All ({leadsList.length})
              </button>
            </div>
          </div>
        </div>

        {/* Lead Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Lead / Company</th>
                <th className="py-3 px-4">Deal Value</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Lead Score</th>
                <th className="py-3 px-4">Next Follow-up</th>
                <th className="py-3 px-4 text-right">Quick Connect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-xs text-slate-600">No leads found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Database me leads add hone par yahan show hongi.</p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => navigate(`/salesperson/leads/${lead._id || lead.id}`)}
                  className="hover:bg-indigo-50/40 transition-colors group cursor-pointer"
                >
                  {/* Lead Info */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-indigo-900 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                        {lead.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                            {lead.name}
                          </span>
                          {lead.isHot && (
                            <span className="bg-orange-100 text-orange-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <Flame className="w-2.5 h-2.5" /> HOT
                            </span>
                          )}
                        </div>
                        <div className="text-slate-500 text-xs mt-0.5">
                          {lead.title} • <strong className="text-slate-700">{lead.company}</strong> ({lead.city})
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Deal Value */}
                  <td className="py-4 px-4 font-black text-slate-900 text-sm">{lead.value}</td>

                  {/* Stage Pill */}
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStageColor(lead.stage)}`}>
                      {lead.stage}
                    </span>
                  </td>

                  {/* Lead Score */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${
                            lead.score > 85 ? 'bg-emerald-500' : lead.score > 70 ? 'bg-indigo-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${lead.score}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-700">{lead.score}</span>
                    </div>
                  </td>

                  {/* Next Follow Up */}
                  <td className="py-4 px-4 text-slate-600">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      {lead.nextFollowUp}
                    </div>
                  </td>

                  {/* Quick Connect Actions */}
                  <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenCallLogger(lead)}
                        className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-200 transition-colors shadow-sm cursor-pointer"
                        title="Quick Call & Log Feedback"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-green-50 hover:bg-green-600 hover:text-white text-green-700 border border-green-200 transition-colors shadow-sm"
                        title="WhatsApp Lead"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`mailto:${lead.email}`}
                        className="p-2 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 border border-blue-200 transition-colors shadow-sm"
                        title="Send Email"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination / View More */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
          <span>Showing {filteredLeads.length} of {leadsList.length} leads assigned to you</span>
          <button className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 transition-colors">
            View Complete Leads Table <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* POPUP MODAL: SALESPERSON QUICK CALL & FEEDBACK LOGGER (AUTO-SYNCS WITH MANAGER) */}
      {activeCallModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setActiveCallModalItem(null)}
          />

          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 z-10 animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <PhoneCall size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Log Call & Discussion Notes
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {activeCallModalItem.name} • {activeCallModalItem.company}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveCallModalItem(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveCallFeedback} className="space-y-3.5">
              {/* Call Type & Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block mb-1">
                    Call Purpose *
                  </label>
                  <select
                    value={feedbackForm.callType}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, callType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="Discovery Call">Discovery Call</option>
                    <option value="Follow-up Call">Follow-up Call</option>
                    <option value="Product Architecture Walkthrough">Product Architecture Walkthrough</option>
                    <option value="Custom Pricing Review">Custom Pricing Review</option>
                    <option value="Contract Clearance">Contract Clearance</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block mb-1">
                    Call Duration
                  </label>
                  <input
                    type="text"
                    value={feedbackForm.duration}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, duration: e.target.value })}
                    placeholder="e.g. 10 mins"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* Outcome Selection */}
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block mb-1">
                  Call Outcome / Status *
                </label>
                <select
                  value={feedbackForm.outcome}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, outcome: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="Demo Scheduled">Demo Scheduled</option>
                  <option value="Interested - Send Deck">Interested - Send Deck</option>
                  <option value="Pricing Objection">Pricing Objection (Budget / Discount)</option>
                  <option value="Follow-up Required">Follow-up Required</option>
                  <option value="Security Review Passed">Security Review Passed</option>
                  <option value="Contract Sent">Contract Sent (Legal Review)</option>
                  <option value="Closed Won">Closed Won</option>
                </select>
              </div>

              {/* Rep Feedback / Discussion Notes */}
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block mb-1">
                  What did the client say? (Discussion Feedback) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={feedbackForm.notes}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, notes: e.target.value })}
                  placeholder="e.g. Client agreed on 3-year term but asked for 15% discount. Requested updated quote by 4 PM..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Next Scheduled Follow-up */}
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block mb-1">
                  Next Follow-up Date & Time
                </label>
                <input
                  type="text"
                  value={feedbackForm.nextFollowUp}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, nextFollowUp: e.target.value })}
                  placeholder="e.g. Tomorrow, 11:30 AM or Nov 05"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>

              {/* Auto Sync Banner */}
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-2">
                <Sparkles size={14} className="text-emerald-600 shrink-0" />
                <span>Saving will automatically update your manager's call intelligence dashboard.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveCallModalItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={logCallMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs disabled:opacity-60 flex items-center gap-1.5 cursor-pointer"
                >
                  {logCallMutation.isPending && <RefreshCw size={12} className="animate-spin" />}
                  <span>{logCallMutation.isPending ? 'Syncing...' : 'Save & Sync to Manager'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
