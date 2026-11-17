import React from 'react';
import {
  TrendingUp, Download, Calendar, Target, Award, Clock, ArrowUpRight,
  Sparkles, BarChart3, ShieldCheck, ChevronDown, User, Layers, IndianRupee
} from 'lucide-react';
import { TIME_RANGES, SALES_REPS_LIST } from './ReportsData';

export default function ReportsHeaderStats({
  timeRange,
  setTimeRange,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  selectedRep,
  setSelectedRep,
  onExportReport,
  activeRole = 'sales_person',
  setActiveRole,
  currentSalesPerson = 'Sales Rep',
  showNotification,
  personalData,
}) {
  const isSalesPerson = activeRole === 'sales_person';

  return (
    <div className="space-y-5">
      {/* 1. Signature Radiant Ambient Glow Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-100/90 via-teal-50 to-green-100/80 text-slate-800 shadow-sm p-6 sm:p-7 border border-emerald-200/90">
        {/* Ambient background glow accents */}
        <div className="absolute -top-24 -left-20 w-80 h-80 bg-emerald-300/35 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-20 w-80 h-80 bg-teal-300/35 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-4">
          {/* Header Title & Profile Section */}
          {isSalesPerson ? (
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              {/* Profile Block with Avatar */}
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-black text-xl flex items-center justify-center shadow-md shadow-emerald-500/20 ring-2 ring-emerald-300/80 shrink-0">
                  {personalData?.avatar || 'AS'}
                </div>
                <div>
                  <div className="mb-1">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {personalData?.name || currentSalesPerson}
                    </h1>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    Enterprise Account Executive •{' '}
                    <span className="text-slate-500 font-semibold">
                      Strategic Accounts & Enterprise Sales
                    </span>
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} className="text-emerald-600" />
                      <span>
                        Days Left in Quarter:{' '}
                        <strong className="text-slate-900 font-bold">
                          {personalData?.daysLeftInQuarter || 18} Days
                        </strong>
                      </span>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1.5">
                      <TrendingUp size={13} className="text-teal-600" />
                      <span>
                        Forecast Run-Rate:{' '}
                        <strong className="text-emerald-700 font-bold">
                          {personalData?.runRateAttainment || 114}%
                        </strong>
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Target Quota / Won Revenue / Gap Snapshot Box */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-3.5 border border-emerald-200/90 flex items-center gap-4 shrink-0 shadow-2xs self-start lg:self-auto">
                <div className="text-center px-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-0.5">
                    Target Quota
                  </span>
                  <span className="text-lg font-black text-slate-900">
                    ₹{((personalData?.quotaTarget || 3000000) / 100000).toFixed(1)}L
                  </span>
                </div>
                <div className="h-8 w-[1px] bg-emerald-200/80" />
                <div className="text-center px-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block mb-0.5">
                    Won Revenue
                  </span>
                  <span className="text-lg font-black text-emerald-700">
                    ₹{((personalData?.wonRevenue || 2850000) / 100000).toFixed(1)}L
                  </span>
                </div>
                <div className="h-8 w-[1px] bg-emerald-200/80" />
                <div className="text-center px-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 block mb-0.5">
                    Gap to 100%
                  </span>
                  <span className="text-lg font-black text-amber-700">
                    ₹{((personalData?.gapToQuota || 150000) / 100000).toFixed(1)}L
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-200/90 border border-emerald-300/90 text-emerald-900 shadow-2xs">
                  <TrendingUp size={13} className="text-emerald-700" />
                  <span>Sales Velocity & Executive Hub</span>
                </span>
                <span className="text-xs text-emerald-400">•</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/70 border border-emerald-200/80 text-slate-700">
                  <Sparkles size={12} className="text-emerald-600" />
                  Live Revenue Analytics & Target Attainment
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                <span>Sales Intelligence & Team Reports</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white tracking-normal">
                  {timeRange}
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mt-1">
                Executive revenue velocity, team leaderboard, stage drop-offs, and deal source attribution.
              </p>
            </div>
          )}

          {/* Action & Filter Toolbar on the SAME Line */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3.5 border-t border-emerald-200/70">
            {/* Left Controls: Rep Filter & Date Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Rep Filter Dropdown (Manager View Only) */}
              {!isSalesPerson && (
                <div className="relative">
                  <select
                    value={selectedRep}
                    onChange={(e) => setSelectedRep(e.target.value)}
                    className="appearance-none pl-3.5 pr-8 py-2 bg-white/95 backdrop-blur-md hover:bg-white border border-emerald-200/90 rounded-xl text-xs font-bold text-slate-700 hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs cursor-pointer transition-all"
                  >
                    {SALES_REPS_LIST.map((rep) => (
                      <option key={rep} value={rep}>
                        {rep}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={13}
                    className="text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  />
                </div>
              )}

              {/* Time Range Selector */}
              <div className="relative">
                <Calendar
                  size={13}
                  className="text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="appearance-none pl-8 pr-8 py-2 bg-white/95 backdrop-blur-md hover:bg-white border border-emerald-200/90 rounded-xl text-xs font-bold text-slate-700 hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs cursor-pointer transition-all"
                >
                  {TIME_RANGES.map((range) => (
                    <option key={range} value={range}>
                      {range}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={13}
                  className="text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                />
              </div>

              {/* Custom Date Pickers */}
              {timeRange === 'Custom Date' && (
                <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md border border-emerald-300 rounded-xl px-3 py-1.5 shadow-2xs animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      From
                    </span>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate && setCustomStartDate(e.target.value)}
                      className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                    />
                  </div>
                  <span className="text-slate-300 text-xs font-bold">→</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      To
                    </span>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate && setCustomEndDate(e.target.value)}
                      className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Controls: Export Report Button */}
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto sm:ml-auto">
              <button
                onClick={onExportReport}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md shadow-slate-900/10 hover:shadow-lg transition-all cursor-pointer"
              >
                <Download size={14} />
                <span>{isSalesPerson ? 'Export My Report' : 'Export CSV'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Executive KPI Cards (Rendered only for Sales Manager View) */}
      {!isSalesPerson && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Closed Won Revenue */}
          <div className="group relative overflow-hidden bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-emerald-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Closed Won Revenue
              </span>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black shadow-xs">
                <IndianRupee size={16} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  ₹68.4
                </h3>
                <span className="text-xs font-bold text-emerald-700">Lakh</span>
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-500 flex items-center gap-1">
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">
                    26 Deals
                  </span>
                  closed won
                </span>
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                  <ArrowUpRight size={11} className="mr-0.5" /> +18.2%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full w-[91%]" />
              </div>
            </div>
          </div>

          {/* KPI 2: Conversion Win Rate */}
          <div className="group relative overflow-hidden bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-purple-200/80 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Funnel Win Rate
              </span>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Target size={16} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  28.4%
                </h3>
                <span className="text-xs font-bold text-purple-700">Conversion</span>
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-500 flex items-center gap-1">
                  <span className="font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-md border border-purple-100">
                    Lead-to-Deal
                  </span>
                  efficiency
                </span>
                <span className="inline-flex items-center text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                  <ArrowUpRight size={11} className="mr-0.5" /> +4.6%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full w-[72%]" />
              </div>
            </div>
          </div>

          {/* KPI 3: Sales Cycle Velocity */}
          <div className="group relative overflow-hidden bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-blue-200/80 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Avg. Sales Velocity
              </span>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Clock size={16} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  13.5
                </h3>
                <span className="text-xs font-bold text-blue-700">Days</span>
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-500 flex items-center gap-1">
                  <span className="font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100">
                    -2.3 Days
                  </span>
                  faster closing
                </span>
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                  Top Quartile
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full w-[84%]" />
              </div>
            </div>
          </div>

          {/* KPI 4: Quota Attainment */}
          <div className="group relative overflow-hidden bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-amber-200/80 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Team Quota Target
              </span>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Award size={16} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  91.2%
                </h3>
                <span className="text-xs font-bold text-amber-700">Attained</span>
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-500 flex items-center gap-1">
                  <span className="font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100">
                    ₹68.4L
                  </span>
                  of ₹75L target
                </span>
                <span className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                  On Track
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full w-[91%]" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

