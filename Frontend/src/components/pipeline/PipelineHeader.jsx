import React from 'react';
import {
  TrendingUp, Plus, Download, Search, X,
  Users, Flame, ChevronDown, Layers, RefreshCw
} from 'lucide-react';
import { SALES_REPS } from '../../pages/sales/Pipeline';

export default function PipelineHeader({
  searchQuery,
  setSearchQuery,
  selectedRep,
  setSelectedRep,
  selectedPriority,
  setSelectedPriority,
  salesReps = SALES_REPS,
  onOpenAddModal,
  onExportCSV,
  onSync,
  isLoading = false,
  isSalesPerson = false,
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-100/90 via-teal-50 to-green-100/80 text-slate-800 shadow-sm p-5 sm:p-6 border border-emerald-200/90">
      {/* Ambient background glow accents */}
      <div className="absolute -top-24 -left-20 w-80 h-80 bg-emerald-300/35 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-20 w-80 h-80 bg-teal-300/35 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-3.5">
        {/* Title & Badges */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-200/90 border border-emerald-300/90 text-emerald-900 shadow-2xs">
              <TrendingUp size={13} className="text-emerald-700" />
              {isSalesPerson ? 'Closer Pipeline Hub' : 'Sales Funnel Velocity'}
            </span>
            <span className="text-xs text-emerald-400">•</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/70 border border-emerald-200/80 text-slate-700">
              <Layers size={12} className="text-emerald-600" />
              Interactive Kanban & 6-Stage Tracking
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>{isSalesPerson ? 'My Sales Deal Pipeline' : 'Sales Deal Pipeline'}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white tracking-normal">
              Active Funnel
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mt-1">
            {isSalesPerson
              ? 'Track your assigned deals, execute stage transitions, negotiate agreements, and accelerate contracts to closed won.'
              : 'Drag and drop opportunities through qualification, proposals, and enterprise closing with real-time probability forecasting.'}
          </p>
        </div>

        {/* Action & Filter Toolbar: Filters on Left, + Add Deal on Right on the SAME LINE */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-2.5 border-t border-emerald-200/70">
          {/* Filters Group */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search company, contact or deal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 sm:w-60 bg-white/95 backdrop-blur-md border border-emerald-200/90 rounded-xl pl-8 pr-7 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none shadow-2xs transition-all"
              />
              <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Rep Filter (Hidden for Salesperson) */}
            {!isSalesPerson && (
              <div className="relative">
                <select
                  value={selectedRep}
                  onChange={(e) => setSelectedRep(e.target.value)}
                  className={`appearance-none bg-white/95 backdrop-blur-md border rounded-xl pl-8 pr-7 py-2 text-xs font-semibold cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${selectedRep !== 'All'
                      ? 'border-emerald-400 text-emerald-900 bg-emerald-50/70 font-bold'
                      : 'border-emerald-200/90 text-slate-700 hover:border-emerald-300'
                    }`}
                >
                  <option value="All">All Sales Reps ({salesReps.length})</option>
                  {salesReps.map((r) => (
                    <option key={r.name} value={r.name}>{r.name}</option>
                  ))}
                </select>
                <Users size={12} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <ChevronDown size={11} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            )}

            {/* Priority Filter */}
            <div className="relative">
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className={`appearance-none bg-white/95 backdrop-blur-md border rounded-xl pl-8 pr-7 py-2 text-xs font-semibold cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${selectedPriority !== 'All'
                    ? 'border-emerald-400 text-emerald-900 bg-emerald-50/70 font-bold'
                    : 'border-emerald-200/90 text-slate-700 hover:border-emerald-300'
                  }`}
              >
                <option value="All">All Priorities</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
              </select>
              <Flame size={12} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <ChevronDown size={11} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Action Buttons Pinned to Right on the SAME Line */}
          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto sm:ml-auto">
            {/* Sync DB Button */}
            {onSync && (
              <button
                onClick={onSync}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/95 backdrop-blur-md border border-emerald-200/90 hover:bg-white text-slate-700 hover:text-emerald-800 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer hover:border-emerald-300 disabled:opacity-60"
                title="Sync Pipeline & Deals from Database"
              >
                <RefreshCw size={13} className={`text-emerald-600 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isLoading ? 'Syncing...' : 'Sync DB'}</span>
              </button>
            )}

            {/* Export CSV Button (Hidden for Salesperson) */}
            {!isSalesPerson && (
              <button
                onClick={onExportCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/95 backdrop-blur-md border border-emerald-200/90 hover:bg-white text-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer hover:border-emerald-300"
              >
                <Download size={14} className="text-emerald-600" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            )}

            {/* Add Deal Button */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/25 transition-all cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
            >
              <Plus size={16} />
              <span>Add Deal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
