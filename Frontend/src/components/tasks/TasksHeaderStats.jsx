import React from 'react';
import {
  CheckSquare, Bell, Clock, AlertTriangle, CheckCircle2, Plus, Calendar,
  Sparkles, TrendingUp, Award, ShieldCheck, User
} from 'lucide-react';

export default function TasksHeaderStats({
  totalCount = 0,
  tasksCount = 0,
  remindersCount = 0,
  dueTodayCount = 0,
  overdueCount = 0,
  completedCount = 0,
  onOpenModal,
  isSalesPerson = false,
}) {
  const completionPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* 1. Header Toolbar (Radiant Ambient Glow Card) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-100/90 via-teal-50 to-green-100/80 text-slate-800 shadow-sm p-6 sm:p-7 border border-emerald-200/90">
        {/* Ambient background glow accents */}
        <div className="absolute -top-24 -left-20 w-80 h-80 bg-emerald-300/35 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-20 w-80 h-80 bg-teal-300/35 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-4">
          {/* Header Title & Badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-200/90 border border-emerald-300/90 text-emerald-900 shadow-2xs">
                {isSalesPerson ? (
                  <>
                    <User size={13} className="text-emerald-700" />
                    Closer Tasks & Follow-up Suite
                  </>
                ) : (
                  <>
                    <ShieldCheck size={13} className="text-emerald-700" />
                    Executive Tasks & Delegation Hub
                  </>
                )}
              </span>
              <span className="text-xs text-emerald-400">•</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/70 border border-emerald-200/80 text-slate-700">
                <Clock size={12} className="text-emerald-600" />
                Real-time Client Alarms & Action Tracker
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>{isSalesPerson ? 'My Daily Tasks & Follow-ups' : 'Tasks & Client Reminders'}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white tracking-normal">
                {totalCount - completedCount} Pending
              </span>
              {overdueCount > 0 && (
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-rose-600 text-white tracking-normal animate-pulse">
                  {overdueCount} Overdue
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mt-1">
              {isSalesPerson
                ? 'Manage your scheduled client calls, contract review deadlines, follow-up alarms, and enterprise deal deliverables.'
                : 'Keep client opportunities moving forward with scheduled sales tasks, follow-up alarms, owner delegation, and timed client reminders.'}
            </p>
          </div>

          {/* Action Toolbar on the Right on the SAME Line */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3.5 border-t border-emerald-200/70">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 border border-emerald-200/90 text-slate-700 shadow-2xs">
                <CheckSquare size={14} className="text-emerald-600" />
                <span>{tasksCount} Active Tasks</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 border border-amber-200 text-amber-900 shadow-2xs">
                <Bell size={14} className="text-amber-600" />
                <span>{remindersCount} Timed Alarms</span>
              </span>
            </div>

            {/* Action Buttons Pinned to Right on the SAME Line */}
            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto sm:ml-auto">
              {/* Set Reminder Button */}
              <button
                onClick={() => onOpenModal('Reminder')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-300 bg-white/95 hover:bg-amber-50/80 text-amber-900 font-bold text-xs shadow-2xs hover:shadow-xs transition-all cursor-pointer hover:-translate-y-0.5"
              >
                <Bell size={14} className="text-amber-600" />
                <span>Set Reminder</span>
              </button>

              {/* Add Task Button */}
              <button
                onClick={() => onOpenModal('Task')}
                className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/25 transition-all cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
              >
                <Plus size={16} />
                <span>Add Task</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. KPI Metrics Bar (4 Vibrant Stat Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Tasks & Reminders */}
        <div className="group relative overflow-hidden bg-white/90 backdrop-blur-md rounded-2xl border border-emerald-200/80 p-5 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Pending Deliverables
            </span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black shadow-xs">
              <CheckSquare size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {totalCount - completedCount}
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              {tasksCount} Tasks • {remindersCount} Reminders
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            {isSalesPerson ? 'Your assigned workload' : 'Across sales organization'}
          </p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full w-[70%]" />
          </div>
        </div>

        {/* KPI 2: Due Today */}
        <div className="group relative overflow-hidden bg-white/90 backdrop-blur-md rounded-2xl border border-blue-200/80 p-5 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Due Today
            </span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Clock size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-900 tracking-tight">
              {dueTodayCount}
            </span>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
              High Priority
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Requires action before 6:00 PM
          </p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full w-[85%]" />
          </div>
        </div>

        {/* KPI 3: Overdue Alarms */}
        <div className="group relative overflow-hidden bg-white/90 backdrop-blur-md rounded-2xl border border-rose-200/80 p-5 shadow-2xs hover:shadow-md hover:border-rose-300 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Overdue Alerts
            </span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center font-bold shadow-xs">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600 tracking-tight">
              {overdueCount}
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
              overdueCount > 0 ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}>
              {overdueCount > 0 ? 'Immediate Action' : 'All Clear'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            {overdueCount > 0 ? 'Follow-up deadline passed' : 'Zero missed customer follow-ups'}
          </p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className={`h-full rounded-full ${overdueCount > 0 ? 'bg-rose-500 w-[100%]' : 'bg-emerald-400 w-0'}`} />
          </div>
        </div>

        {/* KPI 4: Completion Rate Progress */}
        <div className="group relative overflow-hidden bg-white/90 backdrop-blur-md rounded-2xl border border-teal-200/80 p-5 shadow-2xs hover:shadow-md hover:border-teal-300 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Task Velocity Rate
            </span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-teal-900 tracking-tight">
              {completionPercentage}%
            </span>
            <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
              {completedCount} of {totalCount} Done
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Weekly resolution velocity
          </p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
