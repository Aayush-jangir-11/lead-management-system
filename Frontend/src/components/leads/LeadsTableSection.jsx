import React, { useMemo } from 'react';
import {
  Search, X, Filter, Users, Flame, ArrowUpDown, Trash2,
  Building2, Mail, Phone, MessageSquare, Eye, CheckSquare, Clock,
  ChevronLeft, ChevronRight, ChevronDown, MapPin, RotateCcw, Sparkles
} from 'lucide-react';
import {
  SALES_REPS, STATUS_OPTIONS, SOURCE_OPTIONS, PRIORITY_OPTIONS,
  getStatusBadge, getPriorityBadge, getStatusDotColor
} from './LeadsHeaderStats';

export default function LeadsTableSection({
  // Search & Filter state & handlers
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
  selectedSource,
  setSelectedSource,
  selectedRep,
  setSelectedRep,
  selectedPriority,
  setSelectedPriority,
  sortBy,
  setSortBy,
  onResetFilters,
  allLeadsCount,
  leads,

  // Selection
  selectedLeadIds,
  setSelectedLeadIds,
  onSelectAll,
  onSelectOne,
  onBulkDelete,

  // Table / Grid View
  viewMode,
  filteredLeads,
  paginatedLeads,
  onRowClick,
  onStatusChange,
  onPriorityChange,
  onOwnerChange,
  onDeleteLead,
  onOpenDrawerTab,

  // Pagination
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  totalPages,
  validCurrentPage,
  startIndex,

  // Role
  isSalesPerson = false,
  stages = [],
  salesReps = SALES_REPS,
}) {
  const hasActiveFilters =
    searchQuery !== '' ||
    selectedStatus !== 'All' ||
    selectedSource !== 'All' ||
    selectedRep !== 'All' ||
    selectedPriority !== 'All';

  // Dynamic stages from backend
  const stageOptions = useMemo(() => {
    if (stages && stages.length > 0) {
      return stages.map((s) => s.name);
    }
    return STATUS_OPTIONS.filter((s) => s !== 'All');
  }, [stages]);

  const allStagePills = useMemo(() => ['All', ...stageOptions], [stageOptions]);

  const getDynamicStageBadge = (statusName) => {
    const matched = stages.find((s) => s.name?.toLowerCase() === statusName?.toLowerCase());
    if (matched && matched.badgeColor) return matched.badgeColor;
    return getStatusBadge(statusName);
  };

  const getDynamicStageDot = (statusName) => {
    const matched = stages.find((s) => s.name?.toLowerCase() === statusName?.toLowerCase());
    if (matched && matched.dotColor) return matched.dotColor;
    return getStatusDotColor(statusName);
  };

  // Helper to extract clean initials from full contact name
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
    <div className="space-y-4">
      {/* ================================================================ */}
      {/* 1. SEARCH & ADVANCED FILTER TOOLBAR                              */}
      {/* ================================================================ */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        {/* Top Search & Dropdown Filters */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by contact name, company, email, phone, location, tags or #ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl pl-9 pr-9 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Dropdown Filters (Owner/Rep, Source, Priority, Sort) */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Owner / Rep Dropdown (Hidden for Sales Person) */}
            {!isSalesPerson && (
              <div className="relative">
                <select
                  value={selectedRep}
                  onChange={(e) => setSelectedRep(e.target.value)}
                  className={`appearance-none bg-slate-50/90 border rounded-xl pl-8 pr-8 py-2 text-xs font-semibold cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                    selectedRep !== 'All'
                      ? 'border-emerald-400 text-emerald-900 bg-emerald-50/60 font-bold'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <option value="All">All Owners (Reps)</option>
                  {SALES_REPS.map((r) => (
                    <option key={r.name} value={r.name}>{r.name}</option>
                  ))}
                </select>
                <Users size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            )}

            {/* Source Dropdown */}
            <div className="relative">
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className={`appearance-none bg-slate-50/90 border rounded-xl pl-8 pr-8 py-2 text-xs font-semibold cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                  selectedSource !== 'All'
                    ? 'border-emerald-400 text-emerald-900 bg-emerald-50/60 font-bold'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <option value="All">All Lead Sources</option>
                {SOURCE_OPTIONS.filter((s) => s !== 'All').map((src) => (
                  <option key={src} value={src}>{src}</option>
                ))}
              </select>
              <Filter size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Priority Filter */}
            <div className="relative">
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className={`appearance-none bg-slate-50/90 border rounded-xl pl-8 pr-8 py-2 text-xs font-semibold cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                  selectedPriority !== 'All'
                    ? 'border-emerald-400 text-emerald-900 bg-emerald-50/60 font-bold'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <option value="All">All Priorities</option>
                <option value="Urgent">Urgent Priority</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
              <Flame size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-slate-50/90 border border-slate-200 rounded-xl pl-8 pr-8 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-2xs transition-all"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="value-desc">Highest Deal Value (₹)</option>
                <option value="value-asc">Lowest Deal Value (₹)</option>
                <option value="score-desc">AI Score (High to Low)</option>
                <option value="name">Contact Name (A-Z)</option>
              </select>
              <ArrowUpDown size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Reset Filters Pill (visible when any filter is active) */}
            {hasActiveFilters && (
              <button
                onClick={onResetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                title="Reset all search and filter conditions"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Stage Filter Pills Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1.5 border-t border-slate-100 text-xs no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Pipeline Stage:
          </span>
          {allStagePills.map((st) => {
            const count =
              st === 'All'
                ? allLeadsCount
                : leads.filter((l) => l.status?.toLowerCase() === st.toLowerCase()).length;
            const isSelected = selectedStatus === st;
            const dotColor = getDynamicStageDot(st);
            return (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-2xs hover:bg-emerald-700'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/90'
                }`}
              >
                {st !== 'All' && (
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isSelected ? 'bg-white' : dotColor
                    }`}
                  />
                )}
                <span>{st}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isSelected
                      ? 'bg-emerald-700 text-white'
                      : 'bg-slate-200/80 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bulk Action Bar (when leads are selected) */}
        {selectedLeadIds.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-emerald-50/90 rounded-xl border border-emerald-200 text-xs animate-in fade-in shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="font-extrabold text-emerald-950">
                {selectedLeadIds.length} lead{selectedLeadIds.length > 1 ? 's' : ''} selected
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {!isSalesPerson && (
                <button
                  onClick={onBulkDelete}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-lg font-bold transition-all cursor-pointer shadow-2xs hover:border-rose-300"
                >
                  <Trash2 size={13} />
                  <span>Delete Selected</span>
                </button>
              )}
              <button
                onClick={() => setSelectedLeadIds([])}
                className="text-slate-500 hover:text-slate-800 font-semibold px-2.5 py-1 rounded-lg hover:bg-white/60 transition-colors cursor-pointer"
              >
                Deselect
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/* 2. LEADS TABLE OR GRID VIEW                                      */}
      {/* ================================================================ */}
      {filteredLeads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-2xs">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3.5 shadow-2xs">
            <Search size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-900">No matching leads found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
            Try adjusting your search query, changing the pipeline stage filter, or clearing your active filters.
          </p>
          <button
            onClick={onResetFilters}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <RotateCcw size={13} />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 pl-4 pr-2 w-10">
                    <input
                      type="checkbox"
                      checked={selectedLeadIds.length === paginatedLeads.length && paginatedLeads.length > 0}
                      onChange={onSelectAll}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                    />
                  </th>
                  <th className="py-3.5 px-3">Contact & Company</th>
                  <th className="py-3.5 px-3">Lead Owner</th>
                  <th className="py-3.5 px-3">Pipeline Stage</th>
                  <th className="py-3.5 px-3">Deal Value</th>
                  <th className="py-3.5 px-3">Priority</th>
                  <th className="py-3.5 px-3">Lead Score</th>
                  <th className="py-3.5 px-3">Activity & Tasks</th>
                  <th className="py-3.5 pr-4 pl-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedLeads.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-14 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 mb-1">
                          <Users size={24} />
                        </div>
                        <h4 className="font-extrabold text-slate-800 text-sm">No leads found</h4>
                        <p className="text-xs text-slate-400">
                          {hasActiveFilters
                            ? 'No leads match the selected filter criteria. Try resetting your filters.'
                            : 'Database me abhi koi leads available nahi hain. "+ Add New Lead" ya "Import Excel" se leads create karein.'}
                        </p>
                        {hasActiveFilters && (
                          <button
                            type="button"
                            onClick={onResetFilters}
                            className="mt-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                          >
                            Reset all filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedLeads.map((lead) => {
                  const pendingTasksCount = (lead.tasks || []).filter((t) => !t.completed).length;
                  const initials = getInitials(lead.name);
                  const isHot = lead.score >= 80;

                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-emerald-50/30 transition-colors group cursor-pointer"
                      onClick={() => onRowClick(lead)}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 pl-4 pr-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedLeadIds.includes(lead.id)}
                          onChange={() => onSelectOne(lead.id)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                        />
                      </td>

                      {/* Contact Profile & Company */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          {/* Modern Initials Avatar */}
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-slate-900 text-xs group-hover:text-emerald-700 transition-colors">
                                {lead.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">({lead.title})</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 mt-0.5">
                              <Building2 size={12} className="text-slate-400 shrink-0" />
                              <span>{lead.company}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                              <span className="flex items-center gap-0.5">
                                <MapPin size={10} className="text-slate-400" />
                                {lead.location}
                              </span>
                              <span>•</span>
                              <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-medium">
                                {lead.source}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Owner (Rep) with quick re-assign dropdown */}
                      <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full ${lead.repColor} text-white font-black text-[10px] flex items-center justify-center shrink-0 shadow-2xs`}
                          >
                            {lead.repAvatar}
                          </div>
                          {isSalesPerson ? (
                            <span className="text-slate-800 font-bold text-xs">{lead.assignedRep}</span>
                          ) : (
                            <div className="relative group/rep inline-block">
                              <select
                                value={lead.assignedRep}
                                onChange={(e) => onOwnerChange(lead.id, e.target.value)}
                                className="appearance-none bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs py-1 pl-2 pr-6 rounded-lg border border-slate-200/80 cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              >
                                {salesReps.map((r) => (
                                  <option key={r.name} value={r.name}>{r.name}</option>
                                ))}
                              </select>
                              <ChevronDown size={11} className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Stage Dropdown */}
                      <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block">
                          <select
                            value={lead.status}
                            onChange={(e) => onStatusChange(lead.id, e.target.value)}
                            className={`appearance-none text-[11px] font-bold pl-2.5 pr-6 py-1 rounded-xl border focus:outline-none cursor-pointer shadow-2xs transition-all ${getDynamicStageBadge(
                              lead.status
                            )}`}
                          >
                            {stageOptions.map((st) => (
                              <option key={st} value={st} className="bg-white text-slate-800 font-medium text-xs">
                                {st}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={11} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-70" />
                        </div>
                      </td>

                      {/* Deal Value */}
                      <td className="py-3.5 px-3">
                        <span className="font-black text-slate-900 text-xs block">
                          ₹{lead.value.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">{lead.source}</span>
                      </td>

                      {/* Priority Dropdown (Changable) */}
                      <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block">
                          <select
                            value={lead.priority || 'Medium'}
                            onChange={(e) => onPriorityChange && onPriorityChange(lead.id, e.target.value)}
                            className={`appearance-none text-[10px] font-extrabold pl-2.5 pr-6 py-1 rounded-lg border focus:outline-none cursor-pointer shadow-2xs transition-all ${getPriorityBadge(
                              lead.priority
                            )}`}
                          >
                            {['Urgent', 'High', 'Medium', 'Low'].map((p) => (
                              <option key={p} value={p} className="bg-white text-slate-800 font-semibold text-xs">
                                {p}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={10} className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 opacity-60" />
                        </div>
                      </td>

                      {/* Lead Score (Dynamic Frontend Calculated) */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-1.5 w-28">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[11px] font-black flex items-center gap-1 ${
                                isHot ? 'text-amber-600' : 'text-slate-700'
                              }`}
                            >
                              {isHot && <Flame size={12} className="text-amber-500 shrink-0" />}
                              <span>{lead.score}/100</span>
                            </span>
                            <span
                              className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                                lead.scoreGrade === 'Hot' || isHot
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : lead.scoreGrade === 'Warm' || lead.score >= 50
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              {lead.scoreGrade || (isHot ? 'Hot' : lead.score >= 50 ? 'Warm' : 'Cold')}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                isHot
                                  ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                                  : lead.score >= 50
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                  : 'bg-gradient-to-r from-slate-400 to-slate-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, lead.score))}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Linked Tasks & Notes Indicator */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          {/* Activity Timeline count */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenDrawerTab(lead, 'timeline');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="View activity timeline"
                          >
                            <Clock size={11} className="text-slate-400" />
                            <span>{(lead.timeline || []).length} logs</span>
                          </button>
                        </div>
                      </td>

                      {/* Quick Actions (WhatsApp, Call, Mail, View, Delete) */}
                      <td className="py-3.5 pr-4 pl-2 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick WhatsApp */}
                          <a
                            href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Chat on WhatsApp"
                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <MessageSquare size={14} />
                          </a>

                          {/* Quick Direct Call */}
                          <a
                            href={`tel:${lead.phone}`}
                            title={`Call ${lead.name}`}
                            className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Phone size={14} />
                          </a>

                          {/* Quick Email */}
                          <a
                            href={`mailto:${lead.email}`}
                            title={`Email ${lead.name}`}
                            className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Mail size={14} />
                          </a>

                          {/* View Full Drawer */}
                          <button
                            onClick={() => onRowClick(lead)}
                            title="View Lead Profile & History"
                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye size={14} />
                          </button>

                          {/* Delete Lead (Hidden for Sales Person) */}
                          {!isSalesPerson && (
                            <button
                              onClick={() => onDeleteLead(lead.id, lead.company)}
                              title="Delete Lead"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          <div className="p-4 bg-slate-50/70 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <span>
                Showing <b className="text-slate-900">{filteredLeads.length === 0 ? 0 : startIndex + 1}</b> to{' '}
                <b className="text-slate-900">{Math.min(startIndex + pageSize, filteredLeads.length)}</b> of{' '}
                <b className="text-slate-900">{filteredLeads.length}</b> leads
              </span>

              {/* Rows Per Page Selector */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value={6}>6</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>

            {/* Page Navigation Buttons */}
            <div className="flex items-center gap-1">
              <button
                disabled={validCurrentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={`p-1.5 rounded-lg border transition-all ${
                  validCurrentPage === 1
                    ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50'
                    : 'border-slate-200 text-slate-600 hover:bg-white hover:text-emerald-700 cursor-pointer shadow-2xs'
                }`}
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    validCurrentPage === pageNum
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                disabled={validCurrentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={`p-1.5 rounded-lg border transition-all ${
                  validCurrentPage === totalPages
                    ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50'
                    : 'border-slate-200 text-slate-600 hover:bg-white hover:text-emerald-700 cursor-pointer shadow-2xs'
                }`}
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="space-y-4">
          {paginatedLeads.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 mx-auto mb-2">
                <Users size={24} />
              </div>
              <h4 className="font-extrabold text-slate-800 text-sm mb-1">No leads found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {hasActiveFilters
                  ? 'No leads match the selected filter criteria. Try resetting your filters.'
                  : 'Database me abhi koi leads available nahi hain. "+ Add New Lead" ya "Import Excel" se leads create karein.'}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="mt-3 text-xs font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                >
                  Reset all filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedLeads.map((lead) => {
              const pendingTasks = (lead.tasks || []).filter((t) => !t.completed).length;
              const initials = getInitials(lead.name);
              const isHot = lead.score >= 80;
              const dotColor = getDynamicStageDot(lead.status);

              return (
                <div
                  key={lead.id}
                  onClick={() => onRowClick(lead)}
                  className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  {/* Top stage accent line */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${dotColor}`} />

                  <div>
                    {/* Card Top: Contact Avatar + Company + Priority */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {initials}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                            {lead.company}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium">
                            {lead.name} • <span className="text-slate-400">{lead.title}</span>
                          </p>
                        </div>
                      </div>
                      <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={lead.priority || 'Medium'}
                          onChange={(e) => onPriorityChange && onPriorityChange(lead.id, e.target.value)}
                          className={`appearance-none text-[10px] font-extrabold pl-2 pr-5 py-0.5 rounded-md border focus:outline-none cursor-pointer shadow-2xs transition-all ${getPriorityBadge(
                            lead.priority
                          )}`}
                        >
                          {['Urgent', 'High', 'Medium', 'Low'].map((p) => (
                            <option key={p} value={p} className="bg-white text-slate-800 font-semibold text-xs">
                              {p}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={10} className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 opacity-60" />
                      </div>
                    </div>

                    {/* Deal Value & Stage */}
                    <div className="flex items-center justify-between py-2.5 border-y border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Deal Value</span>
                        <span className="text-base font-black text-slate-900">
                          ₹{lead.value.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-0.5">Stage</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getDynamicStageBadge(lead.status)}`}>
                          {lead.status}
                        </span>
                      </div>
                    </div>

                    {/* Score Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-500 font-medium flex items-center gap-1">
                          {isHot && <Flame size={12} className="text-amber-500" />}
                          AI Intent Score
                        </span>
                        <span className={`font-black ${isHot ? 'text-amber-600' : 'text-emerald-700'}`}>
                          {lead.score}/100
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${
                            isHot
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                              : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                          }`}
                          style={{ width: `${lead.score}%` }}
                        />
                      </div>
                    </div>

                    {/* Tasks & Location */}
                    <div className="mt-3 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1 font-medium">
                        <CheckSquare size={12} className={pendingTasks > 0 ? 'text-amber-600' : 'text-slate-400'} />
                        <b>{pendingTasks}</b> pending task{pendingTasks === 1 ? '' : 's'}
                      </span>
                      <span className="text-slate-400 flex items-center gap-0.5 text-[10px]">
                        <MapPin size={10} />
                        {lead.location}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2.5 line-clamp-2">
                      "{lead.notes}"
                    </p>
                  </div>

                  {/* Card Footer: Owner & Quick Contact Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-6 h-6 rounded-full ${lead.repColor} text-white font-black text-[10px] flex items-center justify-center shadow-2xs`}>
                        {lead.repAvatar}
                      </div>
                      <span className="text-slate-700 font-bold text-[11px]">{lead.assignedRep}</span>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <a
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-500 transition-colors cursor-pointer"
                        title="WhatsApp Chat"
                      >
                        <MessageSquare size={13} />
                      </a>
                      <a
                        href={`tel:${lead.phone}`}
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 hover:text-teal-700 text-slate-500 transition-colors cursor-pointer"
                        title="Call Contact"
                      >
                        <Phone size={13} />
                      </a>
                      <a
                        href={`mailto:${lead.email}`}
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-500 transition-colors cursor-pointer"
                        title="Send Email"
                      >
                        <Mail size={13} />
                      </a>
                      <button
                        onClick={() => onRowClick(lead)}
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-500 transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <Eye size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

          {/* Grid View Pagination Footer */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 shadow-2xs">
            <span>
              Showing Page <b className="text-slate-900">{validCurrentPage}</b> of <b className="text-slate-900">{totalPages}</b> ({filteredLeads.length} leads total)
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={validCurrentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Previous
              </button>
              <button
                disabled={validCurrentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
