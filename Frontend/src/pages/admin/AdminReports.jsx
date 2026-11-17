import React, { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { useToast } from '../../hooks';
import {
  BarChart3, TrendingUp, Target, Building2, Users, Download,
  Filter, Calendar, CheckCircle2, ArrowUpRight, ArrowDownRight,
  Sparkles, Clock, Globe, Shield, Printer, Layers, FileSpreadsheet,
  AlertTriangle, Zap, Search, ChevronDown, Check, RefreshCw
} from 'lucide-react';

// ==========================================
// 1. DATASETS FOR ADMIN EXECUTIVE BI & REPORTS
// ==========================================

const EXECUTIVE_KPI_DATA = {
  totalRevenue: 18450000, // ₹1.84 Cr
  revenueGrowthYoY: '+26.4%',
  quarterlyTarget: 20000000, // ₹2.00 Cr
  targetAttainment: 92.25,
  pipelineForecast: 34200000, // ₹3.42 Cr active pipeline
  pipelineCoverageRatio: '2.8x',
  avgDealSize: 385000, // ₹3.85 Lakhs
  avgDealSizeGrowth: '+14.2%',
  avgSalesCycleDays: 18.5,
  cycleDaysImprovement: '-3.2 Days faster',
  blendedCAC: 14200, // ₹14,200 per customer
  marketingROI: '8.6x',
  winRate: '34.8%',
  winRateYoY: '+4.2%',
};

const MONTHLY_REVENUE_PERFORMANCE = [
  { month: 'May 2026', target: 3000000, achieved: 2850000, pipeline: 4800000, deals: 9 },
  { month: 'Jun 2026', target: 3500000, achieved: 3620000, pipeline: 5600000, deals: 12 },
  { month: 'Jul 2026', target: 4000000, achieved: 4150000, pipeline: 6400000, deals: 15 },
  { month: 'Aug 2026', target: 4500000, achieved: 4780000, pipeline: 7200000, deals: 18 },
  { month: 'Sep 2026', target: 5000000, achieved: 5400000, pipeline: 8400000, deals: 22 },
  { month: 'Oct 2026', target: 6000000, achieved: 6840000, pipeline: 9800000, deals: 27 },
];

const DEPARTMENT_COMPARISON = [
  {
    id: 'DEPT-01',
    name: 'Enterprise Strategic Accounts',
    leadName: 'Ajay Sharma',
    leadAvatar: 'AS',
    activeReps: 4,
    monthlyTarget: 8500000,
    wonRevenue: 8950000,
    attainment: 105.3,
    activePipeline: 18500000,
    winRate: '41.2%',
    avgCycleDays: 24,
    status: 'Overperforming',
    statusColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  {
    id: 'DEPT-02',
    name: 'Commercial & Mid-Market Sales',
    leadName: 'Rohan Mehta',
    leadAvatar: 'RM',
    activeReps: 3,
    monthlyTarget: 4500000,
    wonRevenue: 4200000,
    attainment: 93.3,
    activePipeline: 8900000,
    winRate: '36.5%',
    avgCycleDays: 14,
    status: 'On Track',
    statusColor: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  {
    id: 'DEPT-03',
    name: 'Inbound SDR & Qualification',
    leadName: 'Sneha Rao',
    leadAvatar: 'SR',
    activeReps: 3,
    monthlyTarget: 3000000,
    wonRevenue: 2850000,
    attainment: 95.0,
    activePipeline: 5400000,
    winRate: '28.4%',
    avgCycleDays: 8,
    status: 'On Track',
    statusColor: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  {
    id: 'DEPT-04',
    name: 'Outbound Prospecting & Alliances',
    leadName: 'Priya Patel',
    leadAvatar: 'PP',
    activeReps: 2,
    monthlyTarget: 4000000,
    wonRevenue: 3950000,
    attainment: 98.8,
    activePipeline: 7800000,
    winRate: '33.8%',
    avgCycleDays: 21,
    status: 'On Track',
    statusColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
];

const CHANNEL_ROI_DATA = [
  {
    source: 'Website Inbound Form',
    category: 'Organic / SEO',
    leadsCount: 148,
    qualifiedCount: 96,
    dealsWon: 34,
    revenue: 6840000,
    cost: 520000,
    roi: '13.1x',
    conversionRate: '23.0%',
    trend: '+18%',
  },
  {
    source: 'Direct Client Referrals',
    category: 'Word of Mouth',
    leadsCount: 42,
    qualifiedCount: 38,
    dealsWon: 24,
    revenue: 5400000,
    cost: 150000,
    roi: '36.0x',
    conversionRate: '57.1%',
    trend: '+32%',
  },
  {
    source: 'IndiaMART B2B Portal',
    category: 'Marketplace Webhook',
    leadsCount: 92,
    qualifiedCount: 58,
    dealsWon: 18,
    revenue: 3250000,
    cost: 410000,
    roi: '7.9x',
    conversionRate: '19.5%',
    trend: '+8%',
  },
  {
    source: 'LinkedIn Sales Navigator',
    category: 'Social Outbound',
    leadsCount: 68,
    qualifiedCount: 41,
    dealsWon: 14,
    revenue: 3100000,
    cost: 480000,
    roi: '6.4x',
    conversionRate: '20.6%',
    trend: '+12%',
  },
  {
    source: 'Google Search Ads (PPC)',
    category: 'Paid Search',
    leadsCount: 114,
    qualifiedCount: 52,
    dealsWon: 12,
    revenue: 2200000,
    cost: 650000,
    roi: '3.4x',
    conversionRate: '10.5%',
    trend: '-4%',
  },
  {
    source: 'Inbound WhatsApp Business',
    category: 'Direct Messaging',
    leadsCount: 78,
    qualifiedCount: 46,
    dealsWon: 16,
    revenue: 1950000,
    cost: 180000,
    roi: '10.8x',
    conversionRate: '20.5%',
    trend: '+24%',
  },
];

const REGIONAL_TERRITORY_DATA = [
  { region: 'Maharashtra & Mumbai Metro', revenue: 6840000, target: 6500000, attainment: 105.2, activeDeals: 28, topRep: 'Ajay Sharma' },
  { region: 'Delhi NCR & North Hub', revenue: 4520000, target: 4800000, attainment: 94.2, activeDeals: 21, topRep: 'Rohan Mehta' },
  { region: 'Karnataka & Bengaluru Tech Corridor', revenue: 3680000, target: 3500000, attainment: 105.1, activeDeals: 19, topRep: 'Sneha Rao' },
  { region: 'Gujarat (Ahmedabad / Surat / Vadodara)', revenue: 2250000, target: 2400000, attainment: 93.8, activeDeals: 14, topRep: 'Priya Patel' },
  { region: 'Rest of India / Tier 2 & 3 Growth', revenue: 1160000, target: 1400000, attainment: 82.9, activeDeals: 11, topRep: 'Vikram Joshi' },
];

const DEAL_LOSS_REASONS = [
  { reason: 'Competitor Price Discounting', percentage: 38, count: 19, avgLostValue: '₹3.4L' },
  { reason: 'Client Budget Cut / Delayed FY Allocation', percentage: 26, count: 13, avgLostValue: '₹2.8L' },
  { reason: 'Missing Custom Enterprise Integration', percentage: 18, count: 9, avgLostValue: '₹4.2L' },
  { reason: 'Internal Stakeholder Misalignment', percentage: 12, count: 6, avgLostValue: '₹2.5L' },
  { reason: 'No Response / Ghosted after Demo', percentage: 6, count: 3, avgLostValue: '₹1.5L' },
];

// ==========================================
// 2. MAIN COMPONENT: ADMIN REPORTS PAGE
// ==========================================
export default function AdminReports() {
  const { showToast } = useToast();
  const [dateRange, setDateRange] = useState('This Quarter (Q3 FY 2026-27)');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [activeReportTab, setActiveReportTab] = useState('revenue'); // 'revenue' | 'departments' | 'channels' | 'territories' | 'loss'

  // Filtered Departments
  const filteredDepartments = useMemo(() => {
    if (departmentFilter === 'All Departments') return DEPARTMENT_COMPARISON;
    return DEPARTMENT_COMPARISON.filter((d) => d.name === departmentFilter);
  }, [departmentFilter]);

  // Total metrics calculation based on filter
  const currentTotalRevenue = useMemo(() => {
    if (departmentFilter === 'All Departments') return EXECUTIVE_KPI_DATA.totalRevenue;
    const match = DEPARTMENT_COMPARISON.find((d) => d.name === departmentFilter);
    return match ? match.wonRevenue : EXECUTIVE_KPI_DATA.totalRevenue;
  }, [departmentFilter]);

  // Export Executive Summary CSV
  const handleExportCSV = () => {
    const headers = [
      'Report Section',
      'Entity / Dimension',
      'Metric 1',
      'Metric 2',
      'Value (INR)',
      'Attainment / ROI',
      'Notes',
    ];

    const rows = [
      ['Executive Summary', 'Total Realized Revenue', 'Quarter Target', '₹2.00 Cr', '₹1,84,50,000', '92.25%', 'Q3 Pacing on track'],
      ['Executive Summary', 'Average Deal Size', 'YoY Growth', '+14.2%', '₹3,85,000', 'Enterprise Tier', 'Contract value expanding'],
      ['Executive Summary', 'Blended CAC', 'Marketing ROI', '8.6x', '₹14,200 / customer', 'High Efficiency', 'Organic referrals leading'],
      ...filteredDepartments.map((d) => [
        'Department Pacing',
        d.name,
        `Lead: ${d.leadName}`,
        `Active Reps: ${d.activeReps}`,
        `₹${(d.wonRevenue / 100000).toFixed(1)} Lakhs`,
        `${d.attainment}%`,
        d.status,
      ]),
      ...CHANNEL_ROI_DATA.map((c) => [
        'Channel Attribution',
        c.source,
        `Leads: ${c.leadsCount}`,
        `Won: ${c.dealsWon}`,
        `₹${(c.revenue / 100000).toFixed(1)} Lakhs`,
        `ROI: ${c.roi}`,
        `Conv: ${c.conversionRate}`,
      ]),
      ...REGIONAL_TERRITORY_DATA.map((r) => [
        'Territory Performance',
        r.region,
        `Target: ₹${(r.target / 100000).toFixed(1)}L`,
        `Top Rep: ${r.topRep}`,
        `₹${(r.revenue / 100000).toFixed(1)} Lakhs`,
        `${r.attainment}%`,
        `${r.activeDeals} Active Deals`,
      ]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [`"LeadFlow Executive Business Intelligence Report (${dateRange})"`, headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');

    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `leadflow_admin_executive_report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Executive BI & Revenue Report exported as CSV!');
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* ======================================================== */}
      {/* 1. TOP EXECUTIVE HEADER BANNER (Aurora Glassmorphism)    */}
      {/* ======================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-100/90 via-teal-50 to-green-100/80 p-6 sm:p-7 border border-emerald-200/60 shadow-xs">
        {/* Ambient Glow Orbs */}
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-emerald-400/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-teal-400/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 shrink-0">
              <BarChart3 size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Executive BI & Organization Reports
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-emerald-800 font-extrabold text-[11px] border border-emerald-300/80 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Realtime BI Analytics
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-200/60 text-emerald-900 font-extrabold text-[10px]">
                  Fiscal Q3
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                Executive revenue pacing, pod-level quota attainment, channel marketing ROI, and regional market penetration.
              </p>
            </div>
          </div>

          {/* Global Filter Toolbar & Export Actions */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {/* Date Range Selector */}
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-slate-200/80 px-3 py-2 rounded-xl shadow-2xs">
              <Calendar size={13} className="text-slate-400" />
              <select
                value={dateRange}
                onChange={(e) => {
                  setDateRange(e.target.value);
                  showToast(`Report filtered for ${e.target.value}`);
                }}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="This Quarter (Q3 FY 2026-27)">This Quarter (Q3 FY 2026-27)</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Year to Date (YTD 2026)">Year to Date (YTD 2026)</option>
                <option value="Full FY 2026-27">Full FY 2026-27</option>
              </select>
            </div>

            {/* Department Filter */}
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-slate-200/80 px-3 py-2 rounded-xl shadow-2xs">
              <Building2 size={13} className="text-slate-400" />
              <select
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value);
                  showToast(`Filtered by ${e.target.value}`);
                }}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="All Departments">All Departments</option>
                <option value="Enterprise Strategic Accounts">Enterprise Accounts</option>
                <option value="Commercial & Mid-Market Sales">Commercial & Mid-Market</option>
                <option value="Inbound SDR & Qualification">Inbound SDR</option>
                <option value="Outbound Prospecting & Alliances">Outbound Prospecting</option>
              </select>
            </div>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold shadow-md shadow-emerald-600/25 hover:shadow-lg hover:shadow-emerald-600/35 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrintReport}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/90 hover:bg-white text-slate-700 border border-slate-200 text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer backdrop-blur-sm"
              title="Print Executive Dashboard"
            >
              <Printer size={14} className="text-slate-500" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. FOUR EXECUTIVE KPI SCORECARDS (Elevated Glassmorphism)*/}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Realized Revenue */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Total Realized Revenue
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
              ₹{(currentTotalRevenue / 10000000).toFixed(2)} Cr
            </span>
            <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
              <ArrowUpRight size={12} className="mr-0.5" />
              {EXECUTIVE_KPI_DATA.revenueGrowthYoY}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-2 flex items-center gap-1.5">
            <Sparkles size={12} className="text-emerald-500 shrink-0" />
            Target: ₹{(EXECUTIVE_KPI_DATA.quarterlyTarget / 10000000).toFixed(2)} Cr • <strong className="text-emerald-700 font-bold">{EXECUTIVE_KPI_DATA.targetAttainment}% Attained</strong>
          </p>
        </div>

        {/* KPI 2: Average Deal Size */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Average Deal Size (ACV)
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-600 text-white flex items-center justify-center font-bold shadow-sm shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Target size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
              ₹{(EXECUTIVE_KPI_DATA.avgDealSize / 100000).toFixed(2)}L
            </span>
            <span className="inline-flex items-center text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200/70 px-2 py-0.5 rounded-full">
              <ArrowUpRight size={12} className="mr-0.5" />
              {EXECUTIVE_KPI_DATA.avgDealSizeGrowth}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-2 flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-teal-500 shrink-0" />
            Enterprise Tier deals expanding contract values
          </p>
        </div>

        {/* KPI 3: Pipeline Coverage Ratio */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Active Pipeline Coverage
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-sm shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <Layers size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
              {EXECUTIVE_KPI_DATA.pipelineCoverageRatio}
            </span>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200/70 px-2 py-0.5 rounded-full">
              ₹{(EXECUTIVE_KPI_DATA.pipelineForecast / 10000000).toFixed(2)} Cr Active
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-2 flex items-center gap-1.5">
            <Shield size={12} className="text-purple-500 shrink-0" />
            Healthy 2.8x multiple against remaining target
          </p>
        </div>

        {/* KPI 4: Acquisition Efficiency (CAC & ROI) */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Blended Unit Economics
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold shadow-sm shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Zap size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
              {EXECUTIVE_KPI_DATA.marketingROI}
            </span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-full">
              CAC: ₹{EXECUTIVE_KPI_DATA.blendedCAC}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-2 flex items-center gap-1.5">
            <Clock size={12} className="text-amber-500 shrink-0" />
            {EXECUTIVE_KPI_DATA.avgSalesCycleDays} Days Avg Cycle • <strong className="text-emerald-700 font-bold">{EXECUTIVE_KPI_DATA.winRate} Win Rate</strong>
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. REPORT SUB-TABS NAVIGATION (Pill Switcher)             */}
      {/* ======================================================== */}
      <div className="flex items-center gap-2 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveReportTab('revenue')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeReportTab === 'revenue'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-600/25'
              : 'bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 shadow-2xs'
          }`}
        >
          <TrendingUp size={14} />
          <span>Monthly Revenue & Pacing Forecast</span>
        </button>

        <button
          onClick={() => setActiveReportTab('departments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeReportTab === 'departments'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-600/25'
              : 'bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 shadow-2xs'
          }`}
        >
          <Building2 size={14} />
          <span>Department & Pod Attainment ({filteredDepartments.length})</span>
        </button>

        <button
          onClick={() => setActiveReportTab('channels')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeReportTab === 'channels'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-600/25'
              : 'bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 shadow-2xs'
          }`}
        >
          <Globe size={14} />
          <span>Channel Attribution & Marketing ROI</span>
        </button>

        <button
          onClick={() => setActiveReportTab('territories')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeReportTab === 'territories'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-600/25'
              : 'bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 shadow-2xs'
          }`}
        >
          <Target size={14} />
          <span>Regional Market Penetration</span>
        </button>

        <button
          onClick={() => setActiveReportTab('loss')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeReportTab === 'loss'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-600/25'
              : 'bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 shadow-2xs'
          }`}
        >
          <AlertTriangle size={14} />
          <span>Deal Loss Post-Mortem & Churn</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: REVENUE & PACING FORECAST                         */}
      {/* ======================================================== */}
      {activeReportTab === 'revenue' && (
        <div className="space-y-6">
          {/* Revenue Trend Visual Bar Matrix */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <TrendingUp size={17} className="text-emerald-600" />
                  <span>Monthly Realized Revenue vs Targets (May - Oct 2026)</span>
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Actual closed revenue booked month-over-month compared to monthly budget quotas.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-600" />
                  <span className="text-slate-700">Achieved Revenue</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-slate-300" />
                  <span className="text-slate-500">Target Budget</span>
                </div>
              </div>
            </div>

            {/* Custom Visual Bar Comparison */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
              {MONTHLY_REVENUE_PERFORMANCE.map((m) => {
                const pct = Math.round((m.achieved / m.target) * 100);
                const isOver = pct >= 100;
                return (
                  <div
                    key={m.month}
                    className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:border-emerald-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-xs font-extrabold text-slate-800 block">{m.month}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{m.deals} Deals Won</span>
                    </div>

                    <div className="my-4 space-y-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-500">Achieved:</span>
                          <span className="text-slate-900 font-mono">₹{(m.achieved / 100000).toFixed(1)}L</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isOver ? 'bg-emerald-600' : 'bg-blue-600'}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Target:</span>
                        <span className="font-mono">₹{(m.target / 100000).toFixed(1)}L</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                        isOver ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {pct}% Attainment
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quarter Forecast Confidence Run-Rate */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                Conservative Run-Rate (90% Confidence)
              </span>
              <span className="text-2xl font-black text-slate-900 font-mono">₹1.95 Crore</span>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Based on contracts currently in verbal agreement & pending legal signature.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-300 shadow-sm shadow-emerald-500/10">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 block mb-1">
                Expected Executive Run-Rate (Baseline)
              </span>
              <span className="text-2xl font-black text-emerald-600 font-mono">₹2.12 Crore</span>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Expected outcome at 106% of Q3 Target with current 34.8% pipeline conversion.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                Optimistic Run-Rate (Upside)
              </span>
              <span className="text-2xl font-black text-slate-900 font-mono">₹2.35 Crore</span>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Assumes accelerated closure of 2 enterprise deals currently in negotiation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: DEPARTMENT & SQUAD COMPARISON                     */}
      {/* ======================================================== */}
      {activeReportTab === 'departments' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Building2 size={17} className="text-purple-600" />
                <span>Departmental Performance & Quota Pacing</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Comparative analysis of each squad's target attainment, active pipeline volume, and sales velocity.
              </p>
            </div>

            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
              {filteredDepartments.length} Departments Active
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 via-emerald-50/40 to-slate-50 border-b border-slate-200/80 text-[11px] font-black uppercase tracking-wider text-slate-600">
                  <th className="py-3.5 pl-4">Department Name</th>
                  <th className="py-3.5 px-3">Pod Lead</th>
                  <th className="py-3.5 px-3">Reps</th>
                  <th className="py-3.5 px-3">Target Quota</th>
                  <th className="py-3.5 px-3">Realized Revenue</th>
                  <th className="py-3.5 px-3">Attainment (%)</th>
                  <th className="py-3.5 px-3">Active Pipeline</th>
                  <th className="py-3.5 px-3">Win Rate</th>
                  <th className="py-3.5 pr-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDepartments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-emerald-50/30 transition-colors group">
                    <td className="py-3.5 pl-4 font-bold text-slate-900 text-xs">
                      {dept.name}
                      <span className="block text-[10px] font-normal text-slate-400">{dept.id}</span>
                    </td>

                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 font-bold text-[10px] flex items-center justify-center">
                          {dept.leadAvatar}
                        </span>
                        <span className="font-semibold text-slate-800">{dept.leadName}</span>
                      </div>
                    </td>

                    <td className="py-3.5 font-bold text-slate-700">
                      {dept.activeReps}
                    </td>

                    <td className="py-3.5 font-mono font-bold text-slate-600">
                      ₹{(dept.monthlyTarget / 100000).toFixed(1)}L
                    </td>

                    <td className="py-3.5 font-mono font-black text-slate-900">
                      ₹{(dept.wonRevenue / 100000).toFixed(1)}L
                    </td>

                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 font-mono">{dept.attainment}%</span>
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${dept.attainment >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min(dept.attainment, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 font-mono text-slate-600 font-bold">
                      ₹{(dept.activePipeline / 100000).toFixed(1)}L
                    </td>

                    <td className="py-3.5 font-bold text-emerald-700">
                      {dept.winRate}
                    </td>

                    <td className="py-3.5 text-right pr-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${dept.statusColor}`}>
                        {dept.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: CHANNEL ATTRIBUTION & MARKETING ROI               */}
      {/* ======================================================== */}
      {activeReportTab === 'channels' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Globe size={17} className="text-blue-600" />
                <span>Customer Acquisition Channels & Blended ROI</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Analysis of inbound and outbound marketing channels by customer acquisition cost (CAC) and revenue return.
              </p>
            </div>

            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
              Blended ROI: 8.6x
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 via-emerald-50/40 to-slate-50 border-b border-slate-200/80 text-[11px] font-black uppercase tracking-wider text-slate-600">
                  <th className="py-3.5 pl-4">Channel Source</th>
                  <th className="py-3.5 px-3">Category</th>
                  <th className="py-3.5 px-3">Inbound Volume</th>
                  <th className="py-3.5 px-3">Qualified</th>
                  <th className="py-3.5 px-3">Deals Won</th>
                  <th className="py-3.5 px-3">Realized Revenue</th>
                  <th className="py-3.5 px-3">Marketing Spend</th>
                  <th className="py-3.5 px-3">Net ROI Multiplier</th>
                  <th className="py-3.5 pr-4 text-right">Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {CHANNEL_ROI_DATA.map((ch, idx) => (
                  <tr key={idx} className="hover:bg-emerald-50/30 transition-colors group">
                    <td className="py-3.5 pl-4 font-bold text-slate-900 text-xs">
                      {ch.source}
                    </td>

                    <td className="py-3.5 text-slate-500 font-medium">
                      {ch.category}
                    </td>

                    <td className="py-3.5 font-bold text-slate-700">
                      {ch.leadsCount} leads
                    </td>

                    <td className="py-3.5 font-semibold text-slate-600">
                      {ch.qualifiedCount} ({Math.round((ch.qualifiedCount / ch.leadsCount) * 100)}%)
                    </td>

                    <td className="py-3.5 font-bold text-emerald-700">
                      {ch.dealsWon} Won
                    </td>

                    <td className="py-3.5 font-mono font-black text-slate-900">
                      ₹{(ch.revenue / 100000).toFixed(1)}L
                    </td>

                    <td className="py-3.5 font-mono text-slate-500">
                      ₹{(ch.cost / 1000).toFixed(0)}k
                    </td>

                    <td className="py-3.5">
                      <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                        {ch.roi}
                      </span>
                    </td>

                    <td className="py-3.5 text-right pr-2">
                      <span className="font-bold text-slate-800">{ch.conversionRate}</span>
                      <span className="text-[10px] text-emerald-600 block font-semibold">{ch.trend}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: REGIONAL MARKET PENETRATION                       */}
      {/* ======================================================== */}
      {activeReportTab === 'territories' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Target size={17} className="text-emerald-600" />
                <span>Geographic Territory Performance & Regional Penetration</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Revenue generation across key metropolitan hubs and commercial state clusters in India.
              </p>
            </div>

            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl">
              5 Regional Zones
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {REGIONAL_TERRITORY_DATA.map((reg, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xs font-black text-slate-900">{reg.region}</h3>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      reg.attainment >= 100
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-blue-50 text-blue-800 border border-blue-200'
                    }`}>
                      {reg.attainment}% Target
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Realized Revenue:</span>
                      <span className="font-mono font-black text-slate-900">
                        ₹{(reg.revenue / 100000).toFixed(1)} Lakhs
                      </span>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Assigned Target:</span>
                      <span className="font-mono text-slate-600">
                        ₹{(reg.target / 100000).toFixed(1)} Lakhs
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{ width: `${Math.min(reg.attainment, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">{reg.activeDeals} Active Inquiries</span>
                  <span className="font-bold text-slate-700">Top Rep: {reg.topRep}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: DEAL LOSS POST-MORTEM & CHURN                     */}
      {/* ======================================================== */}
      {activeReportTab === 'loss' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                <AlertTriangle size={17} className="text-amber-600" />
                <span>Deal Loss Post-Mortem & Obstacle Root-Cause</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Analysis of disqualified or lost prospect opportunities to guide sales enablement and pricing strategy.
              </p>
            </div>

            <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-xl">
              50 Total Lost Deals Analyzed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEAL_LOSS_REASONS.map((reason, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:border-slate-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{reason.reason}</span>
                  <span className="text-xs font-black text-rose-600 font-mono">{reason.percentage}%</span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2 mt-2.5 overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full"
                    style={{ width: `${reason.percentage}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Occurred in {reason.count} Lost Opportunities</span>
                  <span className="font-semibold text-slate-700">Avg Value Lost: {reason.avgLostValue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. FOOTER QUICK ACTION BAR                               */}
      {/* ======================================================== */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <CheckCircle2 size={15} className="text-emerald-500" />
          <span>Real-time intelligence synced across CRM leads and confirmed invoice ledgers.</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
          >
            ← Admin Dashboard
          </Link>
          <Link
            to="/admin/settings"
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all border border-emerald-200"
          >
            Configure Quotas & Targets →
          </Link>
        </div>
      </div>
    </div>
  );
}

