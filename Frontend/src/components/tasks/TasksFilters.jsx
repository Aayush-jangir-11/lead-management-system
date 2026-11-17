import React from 'react';
import {
  Search, Filter, X, CheckSquare, Bell, Clock, AlertTriangle, CheckCircle2, Calendar, ChevronDown
} from 'lucide-react';
import { SALES_REPS, PRIORITY_OPTIONS } from './TasksData';

export default function TasksFilters({
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  selectedPriority,
  setSelectedPriority,
  selectedRep,
  setSelectedRep,
  onResetFilters,
  counts,
  isSalesPerson = false,
  availableReps = SALES_REPS,
}) {
  const hasActiveFilters =
    searchQuery !== '' ||
    selectedPriority !== 'All' ||
    (!isSalesPerson && selectedRep !== 'All') ||
    activeTab !== 'all';

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-200/80 p-4 sm:p-5 shadow-2xs space-y-4">
      {/* Top Row: Search & Dropdown Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search deliverables, follow-up alarms, client names, or accounts..."
            className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Priority & Rep Dropdowns */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Priority Filter */}
          <div className="relative">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200/90 rounded-xl pl-3.5 pr-8 py-2.5 text-xs font-bold text-slate-700 hover:border-emerald-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-2xs"
            >
              <option value="All">All Priorities</option>
              {PRIORITY_OPTIONS.filter((p) => p !== 'All').map((p) => (
                <option key={p} value={p}>
                  {p} Priority
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Rep Filter (Hidden for Salesperson, Shows only Team Reps for Manager) */}
          {!isSalesPerson && (
            <div className="relative">
              <select
                value={selectedRep}
                onChange={(e) => setSelectedRep(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200/90 rounded-xl pl-3.5 pr-8 py-2.5 text-xs font-bold text-slate-700 hover:border-emerald-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-2xs"
              >
                <option value="All">All Team Closers</option>
                {availableReps.map((r) => (
                  <option key={r.name} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          )}

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer shadow-2xs"
              title="Reset all filters"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Tab Switcher Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100 text-xs [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* All Items */}
        <button
          onClick={() => setActiveTab('all')}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
          }`}
        >
          <span>All Items</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
            activeTab === 'all' ? 'bg-slate-800 text-white' : 'bg-white text-slate-700 border border-slate-200'
          }`}>
            {counts.all}
          </span>
        </button>

        {/* Reminders Tab */}
        <button
          onClick={() => setActiveTab('reminders')}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black transition-all cursor-pointer ${
            activeTab === 'reminders'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-800'
          }`}
        >
          <Bell size={13} className={activeTab === 'reminders' ? 'text-white' : 'text-amber-600'} />
          <span>Reminders</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
            activeTab === 'reminders' ? 'bg-amber-700 text-white' : 'bg-white text-slate-700 border border-slate-200'
          }`}>
            {counts.reminders}
          </span>
        </button>

        {/* Tasks Tab */}
        <button
          onClick={() => setActiveTab('tasks')}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black transition-all cursor-pointer ${
            activeTab === 'tasks'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800'
          }`}
        >
          <CheckSquare size={13} className={activeTab === 'tasks' ? 'text-white' : 'text-emerald-600'} />
          <span>Tasks</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
            activeTab === 'tasks' ? 'bg-emerald-700 text-white' : 'bg-white text-slate-700 border border-slate-200'
          }`}>
            {counts.tasks}
          </span>
        </button>

        {/* Today Tab */}
        <button
          onClick={() => setActiveTab('today')}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black transition-all cursor-pointer ${
            activeTab === 'today'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-800'
          }`}
        >
          <Clock size={13} className={activeTab === 'today' ? 'text-white' : 'text-blue-600'} />
          <span>Due Today</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
            activeTab === 'today' ? 'bg-blue-700 text-white' : 'bg-white text-slate-700 border border-slate-200'
          }`}>
            {counts.today}
          </span>
        </button>

        {/* Upcoming Tab */}
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black transition-all cursor-pointer ${
            activeTab === 'upcoming'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-800'
          }`}
        >
          <Calendar size={13} className={activeTab === 'upcoming' ? 'text-white' : 'text-teal-600'} />
          <span>Upcoming</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
            activeTab === 'upcoming' ? 'bg-teal-700 text-white' : 'bg-white text-slate-700 border border-slate-200'
          }`}>
            {counts.upcoming}
          </span>
        </button>

        {/* Overdue Tab */}
        <button
          onClick={() => setActiveTab('overdue')}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black transition-all cursor-pointer ${
            activeTab === 'overdue'
              ? 'bg-rose-600 text-white shadow-xs animate-pulse'
              : 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700'
          }`}
        >
          <AlertTriangle size={13} className={activeTab === 'overdue' ? 'text-white' : 'text-rose-500'} />
          <span>Overdue</span>
          {counts.overdue > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'overdue' ? 'bg-rose-800 text-white' : 'bg-rose-100 text-rose-800'
            }`}>
              {counts.overdue}
            </span>
          )}
        </button>

        {/* Completed Tab */}
        <button
          onClick={() => setActiveTab('completed')}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black transition-all cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-slate-700 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
          }`}
        >
          <CheckCircle2 size={13} className={activeTab === 'completed' ? 'text-white' : 'text-slate-500'} />
          <span>Completed</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
            activeTab === 'completed' ? 'bg-slate-800 text-white' : 'bg-white text-slate-700 border border-slate-200'
          }`}>
            {counts.completed}
          </span>
        </button>
      </div>
    </div>
  );
}
