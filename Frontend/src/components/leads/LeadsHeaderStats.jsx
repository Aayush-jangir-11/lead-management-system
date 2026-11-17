import React from 'react';
import {
  Users, UserPlus, Download, LayoutGrid, Table as TableIcon,
  Flame, Sparkles, TrendingUp, CircleDollarSign, Target, CheckCircle2,
  Upload, RefreshCw
} from 'lucide-react';

// ==========================================
// 1. CONSTANTS & MOCK LEADS DATA
// ==========================================
export const SALES_REPS = [
  { name: 'Ajay Sharma', role: 'Enterprise AE', avatar: 'AS', color: 'bg-emerald-600' },
  { name: 'Priya Patel', role: 'Mid-Market AE', avatar: 'PP', color: 'bg-teal-600' },
  { name: 'Rohan Mehta', role: 'Commercial Rep', avatar: 'RM', color: 'bg-blue-600' },
  { name: 'Sneha Rao', role: 'Inbound SDR', avatar: 'SR', color: 'bg-indigo-600' },
  { name: 'Vikram Joshi', role: 'Outbound Specialist', avatar: 'VJ', color: 'bg-amber-600' },
];

export const STATUS_OPTIONS = [
  'All',
  'New Lead',
  'Discovery & Demo',
  'Qualified',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost',
];

export const SOURCE_OPTIONS = [
  'All',
  'Inbound Website Form',
  'LinkedIn Outreach',
  'Partner Referral',
  'Google Ads',
  'Cold Email',
];

export const PRIORITY_OPTIONS = ['All', 'Urgent', 'High', 'Medium', 'Low'];

export const INITIAL_LEADS = [];

// Helper: Status badge color classes
export const getStatusBadge = (status) => {
  switch (status) {
    case 'New Lead':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Discovery & Demo':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Qualified':
      return 'bg-teal-50 text-teal-700 border-teal-200';
    case 'Proposal Sent':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'Negotiation':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'Won':
      return 'bg-green-100 text-green-900 border-green-300 font-extrabold';
    case 'Lost':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

// Helper: Status indicator dot color classes
export const getStatusDotColor = (status) => {
  switch (status) {
    case 'New Lead':
      return 'bg-blue-500';
    case 'Discovery & Demo':
      return 'bg-purple-500';
    case 'Qualified':
      return 'bg-teal-500';
    case 'Proposal Sent':
      return 'bg-amber-500';
    case 'Negotiation':
      return 'bg-emerald-500';
    case 'Won':
      return 'bg-green-600';
    case 'Lost':
      return 'bg-rose-500';
    default:
      return 'bg-slate-400';
  }
};

// Helper: Priority badge color classes
export const getPriorityBadge = (priority) => {
  switch (priority) {
    case 'Urgent':
      return 'bg-rose-100 text-rose-800 border-rose-200 font-bold';
    case 'High':
      return 'bg-amber-100 text-amber-900 border-amber-200 font-semibold';
    case 'Medium':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

// ==========================================
// DYNAMIC FRONTEND LEAD SCORE CALCULATION
// ==========================================
export const calculateLeadScore = (lead = {}, stages = []) => {
  let score = 0;

  // 1. Pipeline Stage / Status (max 40)
  if (lead.stage && stages.length > 0) {
    const matched = stages.find((s) => String(s._id || s.id) === String(lead.stage));
    if (matched && matched.probability !== undefined) {
      score += Math.round((matched.probability / 100) * 40);
    } else {
      score += 15;
    }
  } else {
    const st = (lead.status || '').toLowerCase();
    if (st.includes('won')) score += 40;
    else if (st.includes('negotiat')) score += 35;
    else if (st.includes('proposal')) score += 30;
    else if (st.includes('qualif')) score += 25;
    else if (st.includes('discover') || st.includes('demo')) score += 18;
    else if (st.includes('lost')) score += 0;
    else score += 12;
  }

  // 2. Priority (max 25)
  const priority = (lead.priority || 'Medium').toLowerCase();
  if (priority === 'urgent') score += 25;
  else if (priority === 'high') score += 20;
  else if (priority === 'medium') score += 12;
  else score += 5;

  // 3. Contact Details Completeness (max 15)
  if (lead.email && String(lead.email).trim()) score += 5;
  if (lead.phone && String(lead.phone).trim()) score += 5;
  if (lead.title || lead.location) score += 5;

  // 4. Deal Value Intent (max 10)
  const val = Number(lead.value) || 0;
  if (val >= 200000) score += 10;
  else if (val >= 100000) score += 8;
  else if (val >= 50000) score += 5;
  else if (val > 0) score += 3;

  // 5. Activity & Engagement (max 10)
  const activityCount = (lead.timeline?.length || 0) + (lead.tasks?.length || 0);
  if (activityCount >= 3) score += 10;
  else if (activityCount >= 1) score += 5;

  score = Math.min(100, Math.max(0, score));
  const scoreGrade = score >= 80 ? 'Hot' : score >= 50 ? 'Warm' : 'Cold';

  return { score, scoreGrade };
};

// ==========================================
// 2. LEADS HEADER COMPONENT
// ==========================================
export function LeadsHeader({
  viewMode,
  setViewMode,
  onExportCSV,
  onOpenAddModal,
  onOpenImportModal,
  onSync,
  isLoading = false,
  isSalesPerson = false,
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-100/90 via-teal-50 to-green-100/80 text-slate-800 shadow-sm p-6 sm:p-7 border border-emerald-200/90">
      {/* Ambient background glow accents */}
      <div className="absolute -top-24 -left-20 w-80 h-80 bg-emerald-300/35 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-20 w-80 h-80 bg-teal-300/35 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-200/90 border border-emerald-300/90 text-emerald-900 shadow-2xs">
              <Users size={13} className="text-emerald-700" />
              {isSalesPerson ? 'My Assigned Leads' : 'Enterprise Leads Hub'}
            </span>
            <span className="text-xs text-emerald-400">•</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/70 border border-emerald-200/80 text-slate-700">
              <TrendingUp size={12} className="text-emerald-600" />
              Real-time Pipeline Sync
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>{isSalesPerson ? 'My Leads & Pipeline' : 'Leads Management'}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white tracking-normal">
              Active Hub
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {isSalesPerson
              ? 'Track your assigned prospects, execute priority calls, log activity history and push deals forward.'
              : 'Complete lifecycle management: Capture, score, reassign owners, track activity history and execute linked tasks.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Switcher: Table / Grid */}
          <div className="inline-flex items-center bg-white/95 backdrop-blur-md p-1 rounded-xl border border-emerald-200/90 shadow-2xs text-slate-600">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
              title="Table View"
            >
              <TableIcon size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          {/* Import Excel / CSV Button (Hidden for Sales Person) */}
          {!isSalesPerson && (
            <button
              onClick={onOpenImportModal}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/95 backdrop-blur-md border border-emerald-200 hover:bg-white text-slate-700 hover:text-emerald-800 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer hover:shadow-xs hover:border-emerald-300"
              title="Import leads from Excel (.xlsx) or CSV"
            >
              <Upload size={14} className="text-emerald-600" />
              <span className="hidden sm:inline">Import Excel</span>
            </button>
          )}

          {/* Export CSV Button (Hidden for Sales Person) */}
          {!isSalesPerson && (
            <button
              onClick={onExportCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/95 backdrop-blur-md border border-emerald-200 hover:bg-white text-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer hover:shadow-xs hover:border-emerald-300"
            >
              <Download size={14} className="text-emerald-600" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          )}

          {/* Sync DB Button */}
          {onSync && (
            <button
              type="button"
              onClick={onSync}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/95 backdrop-blur-md border border-emerald-200 hover:bg-white text-emerald-800 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer hover:shadow-xs hover:border-emerald-300 disabled:opacity-50"
              title="Sync with MongoDB Database"
            >
              <RefreshCw size={14} className={`text-emerald-600 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync DB</span>
            </button>
          )}

          {/* Add Lead Button */}
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/25 transition-all cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            <UserPlus size={16} />
            <span>Add New Lead</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. LEADS STATS COMPONENT
// ==========================================
export function LeadsStats({
  totalLeadsCount,
  hotLeadsCount,
  activeQualifiedCount,
  totalPipelineValue,
}) {
  const statCards = [
    {
      label: 'Total Leads',
      value: totalLeadsCount,
      sub: '+14% new leads this week',
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      badge: 'Active Base',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      shadow: 'shadow-blue-500/20',
      barColor: 'bg-blue-500',
      percentage: '100%',
    },
    {
      label: 'High Intent (Hot)',
      value: `${hotLeadsCount} Leads`,
      sub: 'Engagement Score > 80 / 100',
      icon: Flame,
      color: 'from-amber-500 to-orange-600',
      badge: 'High Intent',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      shadow: 'shadow-orange-500/20',
      valueColor: 'text-amber-600',
      barColor: 'bg-gradient-to-r from-amber-500 to-orange-500',
      percentage: `${totalLeadsCount > 0 ? Math.round((hotLeadsCount / totalLeadsCount) * 100) : 0}%`,
    },
    {
      label: 'Active in Funnel',
      value: `${activeQualifiedCount} Deals`,
      sub: 'Qualified, Proposal & Negotiation',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-600',
      badge: 'In Progress',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      shadow: 'shadow-purple-500/20',
      barColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
      percentage: `${totalLeadsCount > 0 ? Math.round((activeQualifiedCount / totalLeadsCount) * 100) : 0}%`,
    },
    {
      label: 'Pipeline Potential',
      value: `₹${(totalPipelineValue / 100000).toFixed(2)} Lakh`,
      sub: 'Active unclosed deal potential',
      icon: CircleDollarSign,
      color: 'from-emerald-500 to-teal-600',
      badge: 'Pipeline',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      shadow: 'shadow-emerald-500/20',
      valueColor: 'text-emerald-700',
      barColor: 'bg-emerald-500',
      percentage: '82%',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="group relative overflow-hidden bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300/80 hover:-translate-y-0.5 transition-all duration-300"
          >
            {/* Top row */}
            <div className="flex items-start justify-between">
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shadow-md ${card.shadow} group-hover:scale-105 transition-transform`}
              >
                <Icon size={19} />
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${card.badgeColor}`}>
                {card.badge}
              </span>
            </div>

            {/* Metrics */}
            <div className="mt-3.5 space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {card.label}
              </span>
              <div className={`text-2xl font-black ${card.valueColor || 'text-slate-900'} tracking-tight`}>
                {card.value}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">{card.sub}</p>
            </div>

            {/* Micro progress bar */}
            <div className="mt-3 w-full bg-slate-100 rounded-full h-1 overflow-hidden">
              <div
                className={`h-full rounded-full ${card.barColor} transition-all duration-500`}
                style={{ width: card.percentage }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
