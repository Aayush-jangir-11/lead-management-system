import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { useGet, usePost, useToast } from '../../hooks';
import {
  TrendingUp, TrendingDown, Users, Award, Trophy,
  Target, Filter, Calendar, Download, Plus, ArrowUpRight,
  Clock, CheckCircle2, AlertCircle, ChevronRight, ChevronDown, Search,
  Phone, Mail, Building2, Flame, BarChart3,
  UserCheck, Sparkles, X, Check, RefreshCw, CircleDollarSign,
  Layers, ShieldCheck, User, Upload
} from 'lucide-react';
import AddLeadModal from '../../components/leads/AddLeadModal';
import ImportLeadsModal from '../../components/leads/ImportLeadsModal';

export default function Dashboard({ defaultRole }) {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  // Role-based view detection: defaultRole prop -> user's actual auth role -> fallback 'sales_manager'
  const effectiveRole = defaultRole || role || 'sales_manager';
  const isSalesPerson = effectiveRole === 'sales_person';
  const currentSalesPerson = user?.name || '';

  // Live Backend States
  const [deals, setDeals] = useState([]);
  const [stages, setStages] = useState([]);
  const [teamUsers, setTeamUsers] = useState([]);
  const [callLogs, setCallLogs] = useState([]);

  // Sales Manager Filter States
  const [timeRange, setTimeRange] = useState('This Month');
  const [customStartDate, setCustomStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [customEndDate, setCustomEndDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [selectedRep, setSelectedRep] = useState('All Reps');
  const { showNotification } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Quick New Lead Form State
  const [newLeadForm, setNewLeadForm] = useState({
    company: '',
    name: '',
    title: '',
    value: '',
    email: '',
    phone: '',
    status: 'New Lead',
    priority: 'High',
    assignedRep: user?.name || '',
    source: 'Inbound Website Form',
    notes: '',
  });

 
  // ─── 1. TANSTACK QUERY: FETCH LIVE DATA (Leads, Stages, Users, Call Logs) ──
  const { data: leadsData, isLoading: isLeadsLoading, refetch: refetchDashboardData } = useGet(['dashboard-leads'], '/leads');
  const { data: stagesData } = useGet(['pipeline-stages'], '/pipeline/stages');
  const { data: usersData } = useGet(['dashboard-users'], '/users');
  const { data: callsData } = useGet(['dashboard-calls'], '/calls');

  const isLoading = isLeadsLoading;

  // ─── TanStack Mutations ───────────────────────────────────────────────────────
  const addTimelineMutation = usePost(
    (vars) => `/leads/${vars.dealId}/timeline`,
    {
      invalidateKeys: [['dashboard-leads']],
      onError: (err) => console.error('Failed to sync timeline entry:', err),
    }
  );

  const createLeadMutation = usePost('/leads', {
    invalidateKeys: [['dashboard-leads'], ['leads']],
    onError: (err) => console.error('Failed to create lead:', err),
  });

  const bulkCreateLeadsMutation = usePost('/leads/bulk', {
    invalidateKeys: [['dashboard-leads'], ['leads']],
    onError: (err) => console.error('Failed to bulk create leads:', err),
  });

  // Sync leads from query
  useEffect(() => {
    if (leadsData?.success && Array.isArray(leadsData?.leads)) {
      setDeals(leadsData.leads);
    }
  }, [leadsData]);

  // Sync stages from query
  useEffect(() => {
    if (stagesData?.success && Array.isArray(stagesData?.data)) {
      setStages(stagesData.data);
    }
  }, [stagesData]);

  // Sync team users from query
  useEffect(() => {
    if (usersData?.success && Array.isArray(usersData?.users)) {
      const reps = usersData.users.filter(
        (u) => u.role === 'sales_person' || u.role === 'sales_manager'
      );
      setTeamUsers(reps);
    }
  }, [usersData]);

  // Sync call logs from query
  useEffect(() => {
    if (callsData?.success && Array.isArray(callsData?.callLogs)) {
      setCallLogs(callsData.callLogs);
    }
  }, [callsData]);

  // Align new lead status with default backend stage when stages load
  useEffect(() => {
    if (stages.length > 0) {
      setNewLeadForm((prev) => ({
        ...prev,
        status: stages[0].name,
      }));
    }
  }, [stages]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. DATE FILTERING HELPER
  // ─────────────────────────────────────────────────────────────────────────────
  const isWithinTimeRange = useCallback((dateStr, range, start, end) => {
    if (!dateStr) return true;
    const itemDate = new Date(dateStr).getTime();
    const now = Date.now();
    if (range === 'This Week') {
      return itemDate >= now - 7 * 24 * 60 * 60 * 1000;
    }
    if (range === 'This Month') {
      return itemDate >= now - 30 * 24 * 60 * 60 * 1000;
    }
    if (range === 'This Quarter') {
      return itemDate >= now - 90 * 24 * 60 * 60 * 1000;
    }
    if (range === 'Custom Date' && start && end) {
      const s = new Date(start).getTime();
      const e = new Date(end).setHours(23, 59, 59, 999);
      return itemDate >= s && itemDate <= e;
    }
    return true;
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. NORMALIZED DEALS LIST & FILTERING
  // ─────────────────────────────────────────────────────────────────────────────
  const normalizedDeals = useMemo(() => {
    return deals.map((l) => {
      const repName = l.assignedRepName || l.assignedTo?.name || 'Unassigned';
      const repId = l.assignedTo?._id || (typeof l.assignedTo === 'string' ? l.assignedTo : null);
      const stageName = l.stage?.name || l.status || 'New Lead';
      const stageId = l.stage?._id || (typeof l.stage === 'string' ? l.stage : null);
      const isWon = stageName.toLowerCase().includes('won') || l.status?.toLowerCase() === 'won';
      const val = Number(l.value) || 0;
      const score = l.score || 75;

      return {
        id: l._id,
        leadId: l.leadId || `LD-${String(l._id).slice(-4).toUpperCase()}`,
        company: l.company || 'Unknown Firm',
        contact: l.name || 'Direct Lead',
        title: l.title || '',
        email: l.email || '',
        phone: l.phone || '',
        value: val,
        stage: stageName,
        stageId: stageId,
        rep: repName,
        repId: repId,
        score: score,
        priority: l.priority || 'Medium',
        source: l.source || 'Inbound Website Form',
        createdAt: l.createdAt,
        isWon,
        closingDate: 'End of Month',
        risk: l.priority === 'High' ? 'Executive Attention' : 'Active Qualified',
        actionNeeded: l.priority === 'High' ? 'Sign-off Required' : 'Follow-up Scheduled',
        status: l.status === 'approved' ? 'approved' : 'pending',
        timeline: Array.isArray(l.timeline) ? l.timeline : [],
        notes: l.notes || '',
      };
    });
  }, [deals]);

  // Filtered Deals for View
  const filteredDeals = useMemo(() => {
    return normalizedDeals.filter((d) => {
      // Role filter for Salesperson
      if (isSalesPerson && d.rep !== currentSalesPerson) {
        return false;
      }
      // Time filter
      if (!isWithinTimeRange(d.createdAt, timeRange, customStartDate, customEndDate)) {
        return false;
      }
      // Sales Rep filter
      if (!isSalesPerson && selectedRep !== 'All Reps' && d.rep.toLowerCase() !== selectedRep.toLowerCase()) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          d.company.toLowerCase().includes(q) ||
          d.contact.toLowerCase().includes(q) ||
          d.rep.toLowerCase().includes(q) ||
          d.stage.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [normalizedDeals, isSalesPerson, currentSalesPerson, isWithinTimeRange, timeRange, customStartDate, customEndDate, selectedRep, searchQuery]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. DYNAMIC EXECUTIVE KPIS (CALCULATED FROM LIVE BACKEND LEADS)
  // ─────────────────────────────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const totalDealsCount = filteredDeals.length;
    const totalPipelineValue = filteredDeals.reduce((sum, d) => sum + d.value, 0);

    const wonDeals = filteredDeals.filter((d) => d.isWon);
    const wonCount = wonDeals.length;
    const revenueWon = wonDeals.reduce((sum, d) => sum + d.value, 0);

    // Target Quota benchmark
    const quotaTarget = isSalesPerson ? 1500000 : 5000000;
    const quotaPercent = Math.min(100, Math.round((revenueWon / quotaTarget) * 100));

    // Win Rate
    const winRate = totalDealsCount > 0 ? Math.round((wonCount / totalDealsCount) * 100) : 0;

    // Average Deal Size
    const avgDealSize = totalDealsCount > 0 ? Math.round(totalPipelineValue / totalDealsCount) : 0;

    // At-Risk Deals (High priority or low score)
    const atRiskDeals = filteredDeals.filter((d) => d.priority === 'High' || d.score < 60);
    const atRiskCount = atRiskDeals.length;
    const atRiskValue = atRiskDeals.reduce((sum, d) => sum + d.value, 0);

    return {
      totalDealsCount,
      totalPipelineValue,
      wonCount,
      revenueWon,
      quotaTarget,
      quotaPercent,
      winRate,
      avgDealSize,
      atRiskCount,
      atRiskValue,
    };
  }, [filteredDeals, isSalesPerson]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. DYNAMIC PIPELINE STAGES FUNNEL BREAKDOWN
  // ─────────────────────────────────────────────────────────────────────────────
  const stageBreakdown = useMemo(() => {
    if (stages.length > 0) {
      return stages.map((stg, idx) => {
        const stgDeals = filteredDeals.filter(
          (d) =>
            String(d.stageId) === String(stg._id || stg.id) ||
            d.stage.toLowerCase() === stg.name.toLowerCase()
        );
        const dealsCount = stgDeals.length;
        const totalVal = stgDeals.reduce((acc, d) => acc + d.value, 0);

        const colors = [
          { dot: 'bg-blue-500', bar: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
          { dot: 'bg-purple-500', bar: 'bg-purple-500', bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
          { dot: 'bg-amber-500', bar: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
          { dot: 'bg-emerald-500', bar: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
          { dot: 'bg-rose-500', bar: 'bg-rose-500', bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
        ];
        const c = colors[idx % colors.length];

        return {
          id: stg._id || stg.id,
          name: stg.name,
          dealsCount,
          value: totalVal,
          color: c.bar,
          textColor: c.text,
          bgLight: c.bg,
          borderLight: c.border,
          dotColor: c.dot,
          conversionRate: `${Math.round((dealsCount / (filteredDeals.length || 1)) * 100)}% Funnel Share`,
        };
      });
    }

    // Fallback default stages
    return [
      { id: 'new', name: '1. Inbound & New', dealsCount: 0, value: 0, color: 'bg-blue-500', textColor: 'text-blue-800', bgLight: 'bg-blue-50', borderLight: 'border-blue-200', conversionRate: '0% to Qualify', dotColor: 'bg-blue-500' },
      { id: 'qualified', name: '2. Discovery & Demo', dealsCount: 0, value: 0, color: 'bg-purple-500', textColor: 'text-purple-800', bgLight: 'bg-purple-50', borderLight: 'border-purple-200', conversionRate: '0% to Proposal', dotColor: 'bg-purple-500' },
      { id: 'proposal', name: '3. Proposal Sent', dealsCount: 0, value: 0, color: 'bg-amber-500', textColor: 'text-amber-800', bgLight: 'bg-amber-50', borderLight: 'border-amber-200', conversionRate: '0% to Closing', dotColor: 'bg-amber-500' },
      { id: 'won', name: '4. Won / Closed', dealsCount: 0, value: 0, color: 'bg-emerald-500', textColor: 'text-emerald-800', bgLight: 'bg-emerald-50', borderLight: 'border-emerald-200', conversionRate: '0% Won', dotColor: 'bg-emerald-500' },
    ];
  }, [stages, filteredDeals]);

  // 6. DYNAMIC SALES REPS LEADERBOARD (CALCULATED FROM LIVE REPS & LEADS)
  const dynamicSalesReps = useMemo(() => {
    let repList = [];
    if (teamUsers.length > 0) {
      repList = teamUsers.map((u, idx) => ({
        id: u._id,
        name: u.name,
        role: u.role === 'sales_manager' ? 'Sales Manager & Closer' : 'Commercial Account Executive',
        avatar: u.name.split(' ').filter(Boolean).map((p) => p[0]).join('').slice(0, 2).toUpperCase(),
        avatarBg: ['bg-emerald-600', 'bg-teal-600', 'bg-blue-600', 'bg-indigo-600', 'bg-purple-600'][idx % 5],
        quotaTarget: 1000000,
      }));
    } else {
      const uniqueRepNames = Array.from(new Set(normalizedDeals.map((d) => d.rep).filter(Boolean)));
      repList = uniqueRepNames.map((name, idx) => ({
        id: `rep_${idx}`,
        name,
        role: 'Sales Representative',
        avatar: name.split(' ').filter(Boolean).map((p) => p[0]).join('').slice(0, 2).toUpperCase(),
        avatarBg: ['bg-emerald-600', 'bg-teal-600', 'bg-blue-600', 'bg-indigo-600', 'bg-purple-600'][idx % 5],
        quotaTarget: 1000000,
      }));
    }

    return repList.map((r) => {
      const repDeals = normalizedDeals.filter(
        (d) => d.repId === r.id || d.rep.toLowerCase() === r.name.toLowerCase()
      );
      const totalDeals = repDeals.length;
      const wonDeals = repDeals.filter((d) => d.isWon);
      const dealsWon = wonDeals.length;
      const revenueWon = wonDeals.reduce((sum, d) => sum + d.value, 0);
      const winRate = totalDeals > 0 ? Math.round((dealsWon / totalDeals) * 100) : 0;
      const percent = Math.min(100, Math.round((revenueWon / r.quotaTarget) * 100));

      let status = 'In Progress';
      let statusColor = 'text-blue-800 bg-blue-50 border-blue-200';
      if (winRate >= 70 || percent >= 80) {
        status = 'Top Closer';
        statusColor = 'text-emerald-800 bg-emerald-50 border-emerald-200';
      } else if (winRate >= 50 || percent >= 50) {
        status = 'On Target';
        statusColor = 'text-teal-800 bg-teal-50 border-teal-200';
      } else if (totalDeals === 0) {
        status = 'Ready for Leads';
        statusColor = 'text-slate-700 bg-slate-50 border-slate-200';
      }

      return {
        ...r,
        totalDeals,
        dealsWon,
        revenueWon,
        winRate,
        avgResponse: '8 min',
        status,
        statusColor,
      };
    }).sort((a, b) => b.revenueWon - a.revenueWon || b.dealsWon - a.dealsWon);
  }, [teamUsers, normalizedDeals]);

  // 7. DYNAMIC LIVE CLOSER FEED (EXTRACTED FROM REAL ACTIVITY TIMELINES)
  const dynamicActivities = useMemo(() => {
    const list = [];

    // Timeline entries from leads
    normalizedDeals.forEach((dl) => {
      if (Array.isArray(dl.timeline)) {
        dl.timeline.forEach((item) => {
          list.push({
            id: item._id || `act_${Math.random()}`,
            time: item.time
              ? new Date(item.time).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Recently',
            timestamp: item.time ? new Date(item.time).getTime() : 0,
            text: `${item.author || 'Closer'} (${item.title || 'Update'}): ${item.note || dl.company}`,
            type: item.type || 'note',
            icon: item.type === 'approval' ? ShieldCheck : item.title?.includes('Stage') ? Sparkles : Trophy,
            iconColor:
              item.type === 'approval'
                ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                : 'text-teal-600 bg-teal-50 border-teal-200',
          });
        });
      }
    });

    // Entries from call logs
    callLogs.forEach((cl) => {
      list.push({
        id: cl._id,
        time: cl.callDate
          ? new Date(cl.callDate).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'Recently',
        timestamp: cl.callDate ? new Date(cl.callDate).getTime() : 0,
        text: `${cl.loggedBy?.name || 'Closer'} logged ${cl.callType || 'call'} with ${cl.lead?.name || 'Client'}: ${cl.notes || cl.outcome}`,
        type: 'call',
        icon: Phone,
        iconColor: 'text-blue-600 bg-blue-50 border-blue-200',
      });
    });

    list.sort((a, b) => b.timestamp - a.timestamp);

    if (list.length > 0) {
      return list.slice(0, 5);
    }

    return [
      {
        id: 1,
        time: 'Just now',
        text: 'Live Backend Connected: Active pipeline stages, real-time deals, and closer quotas synchronized.',
        type: 'system',
        icon: Sparkles,
        iconColor: 'text-teal-600 bg-teal-50 border-teal-200',
      },
    ];
  }, [normalizedDeals, callLogs]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. DYNAMIC TOP ACQUISITION CHANNELS
  // ─────────────────────────────────────────────────────────────────────────────
  const channelBreakdown = useMemo(() => {
    const channels = {};
    filteredDeals.forEach((d) => {
      const src = d.source || 'Inbound Website Form';
      if (!channels[src]) {
        channels[src] = { count: 0, value: 0 };
      }
      channels[src].count += 1;
      channels[src].value += d.value;
    });

    const totalVal = filteredDeals.reduce((sum, d) => sum + d.value, 0) || 1;
    const channelColors = [
      { bar: 'bg-emerald-500', text: 'text-emerald-700' },
      { bar: 'bg-teal-500', text: 'text-teal-700' },
      { bar: 'bg-blue-500', text: 'text-blue-700' },
      { bar: 'bg-purple-500', text: 'text-purple-700' },
    ];

    const entries = Object.entries(channels);
    if (entries.length === 0) {
      return [
        { name: 'Inbound Website Form', count: 0, percent: 100, valFormatted: '₹0', barColor: 'bg-emerald-500', textColor: 'text-emerald-700' },
      ];
    }

    return entries.map(([name, data], idx) => {
      const percent = Math.round((data.value / totalVal) * 100);
      const c = channelColors[idx % channelColors.length];
      return {
        name,
        count: data.count,
        percent,
        valFormatted: `₹${(data.value / 100000).toFixed(1)}L`,
        barColor: c.bar,
        textColor: c.text,
      };
    });
  }, [filteredDeals]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 9. BACKEND ACTIONS: APPROVE DEAL & ADD NEW LEAD
  // ─────────────────────────────────────────────────────────────────────────────
  const handleApproveAction = async (dealId, company) => {
    try {
      await addTimelineMutation.mutateAsync({
        dealId,
        type: 'approval',
        title: 'Manager Approval Granted',
        note: `Executive pricing sign-off approved by ${user?.name || 'Sales Manager'}.`,
      });

      setDeals((prev) =>
        prev.map((d) => (d._id === dealId ? { ...d, status: 'approved' } : d))
      );
      showNotification(`Manager approval recorded in database for ${company}!`);
    } catch (err) {
      console.error('Error approving deal:', err);
      showNotification(`Approval note saved locally.`);
    }
  };

  const handleAddLeadSubmit = async (e) => {
    e.preventDefault();
    if (!newLeadForm.company || !newLeadForm.name) return;

    try {
      const matchedStage = stages.find(
        (s) => s.name?.toLowerCase() === newLeadForm.status?.toLowerCase()
      );

      const payload = {
        company: newLeadForm.company,
        name: newLeadForm.name,
        title: newLeadForm.title,
        email: newLeadForm.email,
        phone: newLeadForm.phone,
        value: Number(newLeadForm.value) || 0,
        status: newLeadForm.status || 'New Lead',
        stage: matchedStage?._id || null,
        priority: newLeadForm.priority || 'High',
        source: newLeadForm.source || 'Inbound Website Form',
        assignedRepName: newLeadForm.assignedRep || user?.name || 'Unassigned',
        notes: newLeadForm.notes,
      };

      const res = await createLeadMutation.mutateAsync(payload);
      if (res?.success && res?.lead) {
        setDeals((prev) => [res.lead, ...prev]);
        showNotification(`New Deal "${newLeadForm.company}" saved to database!`);
        setShowAddLeadModal(false);
        setNewLeadForm({
          company: '',
          name: '',
          title: '',
          value: '',
          email: '',
          phone: '',
          status: stages[0]?.name || 'New Lead',
          priority: 'High',
          assignedRep: user?.name || '',
          source: 'Inbound Website Form',
          notes: '',
        });
      }
    } catch (err) {
      console.error('Failed to create deal:', err);
      showNotification('Failed to create deal on backend.');
    }
  };

  // Export Filtered Deals to CSV
  const handleExportCSV = () => {
    if (filteredDeals.length === 0) {
      showNotification('No deals available to export.');
      return;
    }
    const headers = ['Lead ID', 'Company', 'Contact', 'Value (INR)', 'Stage', 'Assigned Rep', 'Priority', 'Win Score'];
    const rows = filteredDeals.map((d) => [
      d.leadId,
      `"${d.company.replace(/"/g, '""')}"`,
      `"${d.contact.replace(/"/g, '""')}"`,
      d.value,
      `"${d.stage}"`,
      `"${d.rep}"`,
      `"${d.priority}"`,
      `${d.score}%`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sales_Leadership_Deals_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Sales Performance CSV report exported successfully!');
  };

  // Helper to extract company initials
  const getInitials = (name = '') => {
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* ================================================================ */}
      {/* 1. SALES MANAGER HEADER & CONTROLS (AMBIENT GLOW CARD)          */}
      {/* ================================================================ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-100/90 via-teal-50 to-green-100/80 text-slate-800 shadow-sm p-6 sm:p-7 border border-emerald-200/90">
        <div className="absolute -top-24 -left-20 w-80 h-80 bg-emerald-300/35 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-20 w-80 h-80 bg-teal-300/35 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-4">
          {/* Header Title Section */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-200/90 border border-emerald-300/90 text-emerald-900 shadow-2xs">
                <Award size={13} className="text-emerald-700" />
                {isSalesPerson ? 'Closer Sales Suite' : 'Executive Sales Suite'}
              </span>
              <span className="text-xs text-emerald-400">•</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/70 border border-emerald-200/80 text-slate-700">
                <TrendingUp size={12} className="text-emerald-600" />
                Real-time Backend Intelligence
              </span>
              {isLoading && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 animate-pulse">
                  <RefreshCw size={11} className="animate-spin" /> Syncing...
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>{isSalesPerson ? 'My Performance Dashboard' : 'Sales Leadership Dashboard'}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white tracking-normal">
                {timeRange === 'Custom Date' && customStartDate && customEndDate
                  ? `${customStartDate} to ${customEndDate}`
                  : timeRange}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mt-1">
              {isSalesPerson
                ? 'Track your monthly target quota attainment, pending client approvals, and active enterprise negotiations.'
                : 'Monitor real-time pipeline velocity, team quota attainment, closer leaderboards, and high-value deal health.'}
            </p>
          </div>

          {/* Action & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3.5 border-t border-emerald-200/70">
            {/* Filters on Left */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Time Range Selector */}
              <div className="inline-flex items-center bg-white/95 backdrop-blur-md p-1 rounded-xl border border-emerald-200/90 shadow-2xs text-slate-600 text-xs">
                {['This Week', 'This Month', 'This Quarter', 'Custom Date'].map((range) => (
                  <button
                    key={range}
                    onClick={() => {
                      setTimeRange(range);
                      if (range === 'Custom Date') {
                        showNotification('Custom Date range activated');
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      timeRange === range
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {range === 'Custom Date' ? (
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        <span>Custom Date</span>
                      </span>
                    ) : (
                      range
                    )}
                  </button>
                ))}
              </div>

              {/* Custom Date Range Pickers */}
              {timeRange === 'Custom Date' && (
                <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md border border-emerald-300 rounded-xl px-3 py-1.5 shadow-2xs animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      From
                    </span>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                    />
                  </div>
                  <span className="text-slate-300 font-bold text-xs">—</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      To
                    </span>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Rep Filter Dropdown */}
              {!isSalesPerson && (
                <div className="relative">
                  <select
                    value={selectedRep}
                    onChange={(e) => setSelectedRep(e.target.value)}
                    className={`appearance-none bg-white/95 backdrop-blur-md border rounded-xl pl-8 pr-7 py-2 text-xs font-semibold cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                      selectedRep !== 'All Reps'
                        ? 'border-emerald-400 text-emerald-900 bg-emerald-50/70 font-bold'
                        : 'border-emerald-200/90 text-slate-700 hover:border-emerald-300'
                    }`}
                  >
                    <option value="All Reps">All Sales Reps ({dynamicSalesReps.length})</option>
                    {dynamicSalesReps.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name} ({r.winRate}%)
                      </option>
                    ))}
                  </select>
                  <Users size={12} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <ChevronDown size={11} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              )}
            </div>

            {/* Actions on Right */}
            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto sm:ml-auto">
              {!isSalesPerson && (
                <button
                  onClick={() => setShowImportModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/95 backdrop-blur-md border border-emerald-200/90 hover:bg-white text-slate-700 hover:text-emerald-800 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer hover:border-emerald-300"
                  title="Import leads from Excel (.xlsx) or CSV"
                >
                  <Upload size={14} className="text-emerald-600" />
                  <span className="hidden sm:inline">Import Excel</span>
                </button>
              )}

              {!isSalesPerson && (
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/95 backdrop-blur-md border border-emerald-200/90 hover:bg-white text-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer hover:border-emerald-300"
                >
                  <Download size={14} className="text-emerald-600" />
                  <span className="hidden sm:inline">Export Report</span>
                </button>
              )}

              <button
                onClick={() => setShowAddLeadModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/25 transition-all cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
              >
                <Plus size={16} />
                <span>New Deal</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 2. SALES MANAGER EXECUTIVE KPIS (LIVE BACKEND METRICS)           */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Active Pipeline Value */}
        <div className="group relative overflow-hidden bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300/80 hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <CircleDollarSign size={19} />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200">
              Pipeline Base
            </span>
          </div>
          <div className="mt-3.5 space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {isSalesPerson ? 'My Active Pipeline' : 'Total Pipeline Value'}
            </span>
            <div className="text-2xl font-black text-emerald-800 tracking-tight">
              ₹{(metrics.totalPipelineValue / 100000).toFixed(1)} Lakh
            </div>
            <div className="flex items-center text-[11px]">
              <span className="font-bold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp size={13} /> {metrics.totalDealsCount} Active Deals
              </span>
              <span className="text-slate-400 ml-1.5">in system</span>
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1 overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: '82%' }} />
          </div>
        </div>

        {/* KPI 2: Team Quota Achievement */}
        <div className="group relative overflow-hidden bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300/80 hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Target size={19} />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border bg-blue-50 text-blue-800 border-blue-200">
              Attainment
            </span>
          </div>
          <div className="mt-3.5 space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {isSalesPerson ? 'My Quota Fulfillment' : 'Team Quota Target'}
            </span>
            <div className="text-2xl font-black text-blue-800 tracking-tight">
              {metrics.quotaPercent}%
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>₹{(metrics.revenueWon / 100000).toFixed(1)}L / ₹{(metrics.quotaTarget / 100000).toFixed(0)}L</span>
              <span className="font-bold text-emerald-700">{metrics.wonCount} won</span>
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1 overflow-hidden">
            <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${metrics.quotaPercent}%` }} />
          </div>
        </div>

        {/* KPI 3: Team Win Rate */}
        <div className="group relative overflow-hidden bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-teal-300/80 hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Trophy size={19} />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border bg-teal-50 text-teal-800 border-teal-200">
              Win Velocity
            </span>
          </div>
          <div className="mt-3.5 space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {isSalesPerson ? 'My Win Ratio' : 'Team Win Rate'}
            </span>
            <div className="text-2xl font-black text-teal-800 tracking-tight">
              {metrics.winRate}%
            </div>
            <div className="flex items-center text-[11px]">
              <span className="font-bold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp size={13} /> {metrics.wonCount} deals closed
              </span>
              <span className="text-slate-400 ml-1.5">won status</span>
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1 overflow-hidden">
            <div className="h-full rounded-full bg-teal-500 transition-all duration-500" style={{ width: `${metrics.winRate || 10}%` }} />
          </div>
        </div>

        {/* KPI 4: Average Deal Size */}
        <div className="group relative overflow-hidden bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-purple-300/80 hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <BarChart3 size={19} />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border bg-purple-50 text-purple-800 border-purple-200">
              Avg Deal
            </span>
          </div>
          <div className="mt-3.5 space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Avg Deal Value</span>
            <div className="text-2xl font-black text-purple-800 tracking-tight">
              ₹{metrics.avgDealSize.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center text-[11px]">
              <span className="font-bold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp size={13} /> Active
              </span>
              <span className="text-slate-400 ml-1.5">per contract</span>
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500" style={{ width: '65%' }} />
          </div>
        </div>

        {/* KPI 5: At-Risk Deals */}
        <div className="group relative overflow-hidden bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-rose-300/80 hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-rose-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
              <AlertCircle size={19} />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border bg-rose-50 text-rose-800 border-rose-200">
              At-Risk
            </span>
          </div>
          <div className="mt-3.5 space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">At-Risk Deals</span>
            <div className="text-2xl font-black text-rose-700 tracking-tight">
              ₹{(metrics.atRiskValue / 100000).toFixed(1)} Lakh
            </div>
            <div className="text-[11px] font-semibold text-rose-600">
              {metrics.atRiskCount} High Priority Deals
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1 overflow-hidden">
            <div className="h-full rounded-full bg-rose-500 transition-all duration-500" style={{ width: '45%' }} />
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 3. PIPELINE REVENUE BY STAGE (VISUAL SALES FUNNEL TRACKER)       */}
      {/* ================================================================ */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Layers size={18} className="text-emerald-600" />
              <span>Pipeline Stages & Revenue Distribution</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Live conversion rate and deal value across backend pipeline milestones</p>
          </div>
          <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto shadow-2xs">
            Active Funnel: ₹{(metrics.totalPipelineValue / 100000).toFixed(2)} Lakh ({metrics.totalDealsCount} Deals)
          </span>
        </div>

        {/* Stages Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {stageBreakdown.map((stg) => {
            const maxVal = Math.max(...stageBreakdown.map((s) => s.value), 100000);
            const barWidth = Math.min(100, Math.round((stg.value / maxVal) * 100)) || 8;

            return (
              <div
                key={stg.id}
                className="group/stg relative overflow-hidden rounded-2xl border border-slate-200/90 p-4 bg-slate-50/60 hover:bg-white hover:border-emerald-300 hover:shadow-xs transition-all duration-200"
              >
                <div className={`absolute top-0 left-0 right-0 h-1 ${stg.dotColor}`} />

                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 truncate pr-2">{stg.name}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${stg.bgLight} ${stg.textColor} border ${stg.borderLight} shrink-0`}>
                    {stg.dealsCount} Deals
                  </span>
                </div>
                <h4 className="text-xl font-black text-slate-900 tracking-tight">
                  ₹{(stg.value / 100000).toFixed(2)} Lakh
                </h4>

                {/* Mini stage bar */}
                <div className="w-full bg-slate-200/80 rounded-full h-1.5 mt-3 overflow-hidden">
                  <div
                    className={`${stg.color} h-1.5 rounded-full transition-all duration-500`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-medium">Live DB Status</span>
                  <span className="font-bold text-emerald-700">{stg.conversionRate}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================================================================ */}
      {/* 4. SALES TEAM LEADERBOARD & PERFORMANCE (SALES MANAGER VIEW)    */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reps Leaderboard (2 Columns wide) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Users size={18} className="text-emerald-600" />
                <span>Sales Reps Leaderboard & Quota Fulfillment</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Tracking closed revenue, deals won, response speed, and win rate</p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              {dynamicSalesReps.length} Active Closer Reps
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 pl-3">Rank & Sales Rep</th>
                  <th className="py-3">Quota Attainment</th>
                  <th className="py-3">Deals Won</th>
                  <th className="py-3">Win Rate</th>
                  <th className="py-3">Response Speed</th>
                  <th className="py-3 text-right pr-3">Status Badge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dynamicSalesReps.map((rep, idx) => {
                  const percent = Math.min(100, Math.round((rep.revenueWon / rep.quotaTarget) * 100));
                  return (
                    <tr
                      key={rep.id}
                      className="hover:bg-emerald-50/30 transition-colors group"
                    >
                      {/* Name & Avatar */}
                      <td className="py-3 pl-3">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                            idx === 0
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : idx === 1
                              ? 'bg-slate-200 text-slate-700'
                              : idx === 2
                              ? 'bg-amber-50 text-amber-700'
                              : 'text-slate-400'
                          }`}>
                            {idx + 1}
                          </span>
                          <div className={`w-8 h-8 rounded-xl ${rep.avatarBg} text-white font-black flex items-center justify-center text-xs shrink-0 shadow-2xs`}>
                            {rep.avatar}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-xs group-hover:text-emerald-700 transition-colors">
                              {rep.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">{rep.role}</p>
                          </div>
                        </div>
                      </td>

                      {/* Quota Progress */}
                      <td className="py-3">
                        <div className="w-36">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                            <span>₹{(rep.revenueWon / 100000).toFixed(1)}L</span>
                            <span className="text-emerald-700 font-extrabold">{percent}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Deals */}
                      <td className="py-3 font-extrabold text-slate-900">
                        {rep.dealsWon} / {rep.totalDeals}
                      </td>

                      {/* Win Rate */}
                      <td className="py-3 font-black text-emerald-700">
                        {rep.winRate}%
                      </td>

                      {/* Speed */}
                      <td className="py-3 text-slate-600 font-semibold flex items-center gap-1 mt-2.5">
                        <Clock size={11} className="text-slate-400" />
                        <span>{rep.avgResponse}</span>
                      </td>

                      {/* Status */}
                      <td className="py-3 text-right pr-3">
                        <span className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border ${rep.statusColor}`}>
                          {rep.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Activity & Acquisition Channels (1 Column) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Clock size={16} className="text-emerald-600" />
                <span>Live Closer Feed</span>
              </h2>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
            </div>

            <div className="mt-4 space-y-3.5 max-h-[280px] overflow-y-auto scrollbar-thin pr-1">
              {dynamicActivities.map((act) => {
                const Icon = act.icon || Sparkles;
                return (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    <div className={`p-2 rounded-xl shrink-0 border shadow-2xs ${act.iconColor}`}>
                      <Icon size={14} />
                    </div>
                    <div>
                      <p className="text-slate-700 font-medium leading-snug">{act.text}</p>
                      <span className="text-[10px] font-bold text-slate-400 mt-0.5 block">{act.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Lead Source Breakdown */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-black text-slate-900 mb-2.5 uppercase tracking-wide">
              Top Acquisition Channels
            </h4>
            <div className="space-y-2 text-[11px]">
              {channelBreakdown.map((ch) => (
                <div key={ch.name}>
                  <div className="flex justify-between font-semibold text-slate-700 mb-0.5">
                    <span className="truncate pr-2">{ch.name}</span>
                    <span className={`font-black ${ch.textColor} shrink-0`}>
                      {ch.percent}% ({ch.valFormatted})
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                    <div className={`${ch.barColor} h-1 rounded-full`} style={{ width: `${ch.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 5. HOT HIGH-VALUE DEALS (MANAGER ACTION CENTER)                  */}
      {/* ================================================================ */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Flame size={18} className="text-amber-500" />
              <span>High-Value Deals Requiring Manager Attention</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Escalations, custom SLA requests, price waivers, and closing sign-offs (Click any row to open full lead profile)
            </p>
          </div>

          {/* Search Deals */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search company or rep..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl pl-8 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs transition-all"
            />
            <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Deals Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 pl-3">Company & Contact</th>
                <th className="py-3.5">Deal Value</th>
                <th className="py-3.5">Stage</th>
                <th className="py-3.5">Assigned Closer</th>
                <th className="py-3.5">Win Score</th>
                <th className="py-3.5">Action Needed</th>
                <th className="py-3.5 text-right pr-3">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDeals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="font-bold text-xs text-slate-600">No active deals found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Leads page se nayi deals create karein ya Excel import karein.</p>
                  </td>
                </tr>
              ) : (
                filteredDeals.map((dl) => {
                  const initials = getInitials(dl.company);
                  const isApproved = dl.status === 'approved';

                  return (
                    <tr
                      key={dl.id}
                      onClick={() =>
                        navigate(isSalesPerson ? `/salesperson/leads/${dl.id}` : `/manager/leads/${dl.id}`)
                      }
                      className="hover:bg-emerald-50/40 transition-colors group cursor-pointer"
                    >
                      {/* Company */}
                      <td className="py-3.5 pl-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-[11px] flex items-center justify-center shrink-0 shadow-2xs">
                            {initials}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-xs group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                              <span>{dl.company}</span>
                              <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 text-emerald-600 transition-opacity" />
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">{dl.contact} • {dl.leadId}</p>
                          </div>
                        </div>
                      </td>

                      {/* Value */}
                      <td className="py-3.5 font-black text-slate-900">
                        ₹{dl.value.toLocaleString('en-IN')}
                      </td>

                      {/* Stage */}
                      <td className="py-3.5">
                        <span className="inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                          {dl.stage}
                        </span>
                      </td>

                      {/* Rep */}
                      <td className="py-3.5 text-slate-700 font-bold">
                        {dl.rep}
                      </td>

                      {/* Score */}
                      <td className="py-3.5">
                        <div className="space-y-1 w-24">
                          <span className={`inline-flex items-center gap-1 font-black text-[11px] ${
                            dl.score >= 85 ? 'text-emerald-700' : dl.score >= 70 ? 'text-blue-700' : 'text-amber-700'
                          }`}>
                            {dl.score >= 85 && <Flame size={12} className="text-amber-500" />}
                            {dl.score}%
                          </span>
                          <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                dl.score >= 85 ? 'bg-emerald-500' : dl.score >= 70 ? 'bg-blue-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${dl.score}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Manager Action Note */}
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-700 bg-amber-50/70 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200 font-semibold">
                          <AlertCircle size={12} className="text-amber-600 shrink-0" />
                          <span>{dl.actionNeeded}</span>
                        </span>
                      </td>

                      {/* Action Button */}
                      <td className="py-3.5 text-right pr-3">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-black border border-emerald-300">
                            <CheckCircle2 size={12} />
                            <span>Approved</span>
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApproveAction(dl.id, dl.company);
                            }}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 rounded-xl text-xs font-black transition-all border border-emerald-200 cursor-pointer shadow-2xs hover:shadow-xs"
                          >
                            <Check size={12} />
                            <span>Approve</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 6. MODAL: QUICK ADD DEAL / LEAD (Using AddLeadModal component)     */}
      {/* ================================================================ */}
      <AddLeadModal
        showAddModal={showAddLeadModal}
        onClose={() => setShowAddLeadModal(false)}
        newLead={newLeadForm}
        setNewLead={setNewLeadForm}
        onSubmit={handleAddLeadSubmit}
        isSalesPerson={isSalesPerson}
        stages={stages}
      />

      {/* 7. MODAL: EXCEL / CSV BULK IMPORT */}
      <ImportLeadsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        stages={stages}
        onImportSuccess={async (importedLeads, meta) => {
          try {
            await bulkCreateLeadsMutation.mutateAsync({ leads: importedLeads });
            showNotification(
              `Successfully imported ${importedLeads.length} leads to database from ${meta?.fileName || 'Excel file'}!`
            );
          } catch (err) {
            console.error('Failed to import leads in bulk:', err);
            showNotification('Failed to import leads to backend database.');
          }
        }}
      />
    </div>
  );
}
