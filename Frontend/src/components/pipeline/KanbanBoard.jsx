import React, { useState } from 'react';
import {
  Calendar, Flame, ArrowRight, ArrowLeft, Plus,
  Grid3X3, Sparkles, Building2, User, CheckCircle2,
  Sliders, Layers, ArrowUpRight, ClipboardList, Bell
} from 'lucide-react';

export default function KanbanBoard({
  deals = [],
  stages = [],
  onDealClick,
  onMoveDealStage,
  onOpenAddModalWithStage,
  onMoveStageLeft,
  onMoveStageRight,
  onOpenManageStages,
  onOpenAddStage,
  onOpenStageReminderModal,
}) {
  // Phase Tab Mode: 'all' (All stages) | 'phase1' (First half) | 'phase2' (Second half)
  const [activePhase, setActivePhase] = useState('all');
  const [dragOverStage, setDragOverStage] = useState(null);
  const [selectedStage, setSelectedStage] = useState('all'); // 'all' or stageId

  // Helper to calculate Stage-level follow-up reminder badge status
  const getStageReminderStatus = (reminder) => {
    if (!reminder || !reminder.date) return null;
    try {
      const targetDate = new Date(reminder.date);
      if (isNaN(targetDate.getTime())) return null;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const targetDay = new Date(targetDate);
      targetDay.setHours(0, 0, 0, 0);

      const diffTime = targetDay.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      const formattedDate = targetDate.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      });

      if (diffDays < 0) {
        return {
          type: 'overdue',
          title: reminder.title || '',
          label: `Overdue (${formattedDate})`,
          time: reminder.time || '',
          note: reminder.note || '',
          classes: 'bg-rose-50 text-rose-700 border-rose-200/90 hover:bg-rose-100',
          iconColor: 'text-rose-600',
        };
      } else if (diffDays === 0) {
        return {
          type: 'today',
          title: reminder.title || '',
          label: 'Today',
          time: reminder.time || '',
          note: reminder.note || '',
          classes: 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100',
          iconColor: 'text-amber-600',
        };
      } else if (diffDays === 1) {
        return {
          type: 'tomorrow',
          title: reminder.title || '',
          label: 'Tomorrow',
          time: reminder.time || '',
          note: reminder.note || '',
          classes: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
          iconColor: 'text-emerald-600',
        };
      } else {
        return {
          type: 'upcoming',
          title: reminder.title || '',
          label: formattedDate,
          time: reminder.time || '',
          note: reminder.note || '',
          classes: 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200',
          iconColor: 'text-emerald-700',
        };
      }
    } catch {
      return null;
    }
  };

  // Empty state when no pipeline stages exist
  if (!stages || stages.length === 0) {
    return (
      <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center shadow-xs flex flex-col items-center justify-center my-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100 shadow-xs">
          <Layers size={32} />
        </div>
        <h3 className="text-base font-extrabold text-slate-900 mb-1">
          No Pipeline Stages Configured
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
          Default pipeline stages have been removed. Add custom stages to structure your deal flow and move leads across stages.
        </p>
        {onOpenAddStage && (
          <button
            type="button"
            onClick={onOpenAddStage}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>+ Add Pipeline Stage</span>
          </button>
        )}
      </div>
    );
  }

  // Drag and Drop handlers
  const handleDragStart = (e, dealId) => {
    e.dataTransfer.setData('text/plain', dealId);
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const handleDragLeave = (stageId) => {
    if (dragOverStage === stageId) {
      setDragOverStage(null);
    }
  };

  const handleDrop = (e, targetStageId) => {
    e.preventDefault();
    setDragOverStage(null);
    const dealId = e.dataTransfer.getData('text/plain');
    if (dealId) {
      onMoveDealStage(dealId, targetStageId);
    }
  };

  // Helper for priority badge styling
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-rose-50 text-rose-800 border-rose-200 font-bold';
      case 'High':
        return 'bg-amber-50 text-amber-800 border-amber-200 font-semibold';
      case 'Medium':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Helper for priority left-border accent
  const getPriorityLeftBorder = (priority) => {
    switch (priority) {
      case 'Urgent':
        return 'border-l-rose-500';
      case 'High':
        return 'border-l-amber-500';
      case 'Medium':
        return 'border-l-blue-500';
      default:
        return 'border-l-slate-300';
    }
  };

  // Split stages into First Half and Second Half dynamically based on length
  const midpoint = Math.ceil(stages.length / 2);
  const firstRowStages = stages.slice(0, midpoint);
  const secondRowStages = stages.slice(midpoint);

  // Handle clicking a stage button
  const handleStageSelect = (stgId, stgIdx) => {
    if (selectedStage === stgId) {
      setSelectedStage('all');
    } else {
      setSelectedStage(stgId);
      if (activePhase !== 'all') {
        if (stgIdx >= midpoint) {
          setActivePhase('phase2');
        } else {
          setActivePhase('phase1');
        }
      }
    }
  };

  // Render a single stage column
  const renderColumn = (stg, stgIdx) => {
    const stageDeals = deals.filter(
      (d) => String(d.stage) === String(stg.id) || String(d.stage) === String(stg._id)
    );
    const stageTotal = stageDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
    const globalIdx = stages.findIndex((s) => s.id === stg.id);
    const isDragOver = dragOverStage === stg.id;
    const isFocused = selectedStage === stg.id;
    const isDimmed = selectedStage !== 'all' && !isFocused;
    const isFirstColumn = globalIdx === 0;
    const isLastColumn = globalIdx === stages.length - 1;
    const stgReminder = getStageReminderStatus(stg.reminder);

    return (
      <div
        key={stg.id}
        onDragOver={(e) => handleDragOver(e, stg.id)}
        onDragLeave={() => handleDragLeave(stg.id)}
        onDrop={(e) => handleDrop(e, stg.id)}
        className={`rounded-2xl border p-4 flex flex-col transition-all duration-300 ${isDragOver
            ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/30 shadow-lg scale-[1.01]'
            : isFocused
              ? 'bg-white border-emerald-400 shadow-md opacity-100 ring-2 ring-emerald-500/20'
              : isDimmed
                ? 'bg-slate-50/60 border-slate-200/60 opacity-40 hover:opacity-90 shadow-2xs'
                : 'bg-slate-50/80 border-slate-200/90 hover:border-slate-300 shadow-2xs'
          }`}
      >
        {/* Column Header */}
        <div className="pb-3 border-b border-slate-200/80 mb-3.5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-md bg-white border border-slate-200 text-[10px] font-black text-slate-700 shadow-2xs">
                {globalIdx + 1}
              </span>
              <span className={`w-2.5 h-2.5 rounded-full ${stg.dotColor}`} />
              <h3 className="text-xs font-black text-slate-900 tracking-tight">
                {stg.name}
              </h3>
            </div>

            {/* Quick Reorder Arrows (Left & Right) & Stage Reminder Bell */}
            <div className="flex items-center gap-1">
              {onMoveStageLeft && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveStageLeft(stg.id);
                  }}
                  disabled={isFirstColumn}
                  title="Shift column left (earlier in sequence)"
                  className={`p-1 rounded-md border text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-all ${isFirstColumn
                      ? 'opacity-20 cursor-not-allowed border-transparent'
                      : 'cursor-pointer border-slate-200'
                    }`}
                >
                  <ArrowLeft size={11} />
                </button>
              )}
              {onMoveStageRight && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveStageRight(stg.id);
                  }}
                  disabled={isLastColumn}
                  title="Shift column right (later in sequence)"
                  className={`p-1 rounded-md border text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-all ${isLastColumn
                      ? 'opacity-20 cursor-not-allowed border-transparent'
                      : 'cursor-pointer border-slate-200'
                    }`}
                >
                  <ArrowRight size={11} />
                </button>
              )}

              {/* Stage Follow-up Reminder Bell Button */}
              {onOpenStageReminderModal && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenStageReminderModal(stg, stageDeals.length);
                  }}
                  title={
                    stg.reminder?.date
                      ? `Stage Reminder: ${stg.reminder.title || 'Follow-up'} • ${stg.reminder.time}${stg.reminder.note ? ` ("${stg.reminder.note}")` : ''} - Click to edit`
                      : `Set Follow-up Reminder for ${stg.name} (${stageDeals.length} deals)`
                  }
                  className={`p-1 rounded-md border transition-all cursor-pointer ${stg.reminder?.date
                      ? 'bg-amber-500 border-amber-600 text-white shadow-2xs hover:bg-amber-600'
                      : 'text-slate-400 hover:text-amber-700 hover:bg-amber-50 border-slate-200'
                    }`}
                >
                  <Bell size={11} />
                </button>
              )}

              {/* Deal Count Badge */}
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border shadow-2xs ml-0.5 ${stg.badgeColor}`}>
                {stageDeals.length}
              </span>
            </div>
          </div>

          {/* Value and Win Prob */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="font-black text-slate-900 text-sm">
              ₹{(stageTotal / 100000).toFixed(2)} Lakh
            </span>
            <span className="text-[11px] text-slate-500 font-bold bg-white/80 px-2 py-0.5 rounded-md border border-slate-200/80">
              {stg.probability}% win prob.
            </span>
          </div>

          {/* Probability micro-bar */}
          <div className="w-full bg-slate-200/80 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${stg.probability === 100
                  ? 'bg-green-600'
                  : stg.probability >= 70
                    ? 'bg-emerald-500'
                    : stg.probability >= 40
                      ? 'bg-teal-500'
                      : 'bg-blue-500'
                }`}
              style={{ width: `${stg.probability}%` }}
            />
          </div>

          {/* Active Stage-Level Reminder Pill Banner */}
          {stgReminder && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onOpenStageReminderModal && onOpenStageReminderModal(stg, stageDeals.length);
              }}
              title={
                stgReminder.note
                  ? `${stgReminder.title ? `"${stgReminder.title}" - ` : ''}${stgReminder.note}`
                  : stgReminder.title || 'Click to reschedule or clear stage reminder'
              }
              className={`mt-2.5 px-2.5 py-2 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all shadow-2xs ${stgReminder.classes}`}
            >
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 truncate">
                  <Bell size={12} className={`${stgReminder.iconColor} shrink-0 animate-pulse`} />
                  <span className="font-black truncate">
                    {stgReminder.title || `Review ${stg.name}`}
                  </span>
                </div>
                <span className="text-[10px] underline decoration-dotted ml-1 shrink-0 font-extrabold opacity-80 hover:opacity-100">
                  Manage
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] opacity-80 font-bold pl-4">
                <span>{stgReminder.label}</span>
                {stgReminder.time && <span>• {stgReminder.time}</span>}
                <span>• {stageDeals.length} Deals</span>
              </div>
            </div>
          )}
        </div>

        {/* Deals Cards List */}
        <div className="space-y-3 overflow-y-auto max-h-[440px] min-h-[160px] pr-1">
          {stageDeals.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-7 text-center text-slate-400 bg-white/60">
              <p className="text-xs font-bold text-slate-600 mb-1">No deals in this stage</p>
              <span className="text-[11px] text-slate-400">Drag deals here or add a new opportunity</span>
            </div>
          ) : (
            stageDeals.map((deal) => {
              const prevStage = stages[globalIdx - 1];
              const nextStage = stages[globalIdx + 1];

              return (
                <div
                  key={deal.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, deal.id)}
                  onClick={() => onDealClick(deal)}
                  className={`bg-white rounded-2xl border border-slate-200/90 border-l-4 ${getPriorityLeftBorder(
                    deal.priority
                  )} p-4 shadow-2xs hover:border-emerald-300 hover:shadow-md transition-all cursor-grab active:cursor-grabbing group relative`}
                >
                  {/* Card Header: Company & Priority */}
                  <div className="flex items-start justify-between gap-1.5 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        {deal.company.slice(0, 2).toUpperCase()}
                      </div>
                      <h4 className="font-black text-slate-900 text-xs leading-snug group-hover:text-emerald-700 transition-colors">
                        {deal.company}
                      </h4>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${getPriorityStyle(deal.priority)}`}>
                      {deal.priority}
                    </span>
                  </div>

                  {/* Contact Person */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold mb-3 pl-9">
                    <User size={12} className="text-slate-400" />
                    <span>{deal.contact}</span>
                  </div>

                  {/* Deal Value Strip */}
                  <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-slate-50/80 border border-slate-100 mb-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Deal Value</span>
                      <span className="text-sm font-black text-slate-900">
                        ₹{(Number(deal.value) || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Health Score</span>
                      <span className={`text-xs font-black inline-flex items-center gap-1 ${deal.score >= 80 ? 'text-amber-600' : 'text-slate-600'
                        }`}>
                        {deal.score >= 80 && <Flame size={12} className="text-amber-500" />}
                        {deal.score}%
                      </span>
                    </div>
                  </div>

                  {/* Target Close Date & Deal ID */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2.5">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Calendar size={12} className="text-emerald-600" />
                      <span>{deal.targetClose}</span>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                      {deal.contact}
                    </span>
                  </div>

                  {/* Stage Collected Sections Indicator */}
                  {deal.stageSections?.[stg.id]?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2 pt-1.5 border-t border-slate-100">
                      <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                        <ClipboardList size={10} className="text-emerald-600" />
                        <span>{deal.stageSections[stg.id].length} Sections Recorded</span>
                      </span>
                    </div>
                  )}

                  {/* Card Footer: Closer & Quick Stage Shift Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-5 h-5 rounded-full ${deal.repColor} text-white font-black text-[9px] flex items-center justify-center shadow-2xs`}>
                        {deal.repAvatar}
                      </div>
                      <span className="text-[11px] font-bold text-slate-700">{deal.rep}</span>
                    </div>

                    {/* Stage shift arrows */}
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {prevStage && (
                        <button
                          type="button"
                          onClick={() => onMoveDealStage(deal.id, prevStage.id)}
                          title={`Move back to ${prevStage.name}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <ArrowLeft size={13} />
                        </button>
                      )}
                      {nextStage && (
                        <button
                          type="button"
                          onClick={() => onMoveDealStage(deal.id, nextStage.id)}
                          title={`Advance to ${nextStage.name}`}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-600 hover:text-white rounded-lg text-[10px] font-black transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                        >
                          <span>{nextStage.name.split(' ')[0]}</span>
                          <ArrowRight size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Column Footer: Quick Add Deal */}
        <button
          type="button"
          onClick={() => onOpenAddModalWithStage(stg.id)}
          className="mt-3.5 w-full py-2.5 bg-white hover:bg-emerald-600 hover:text-white border border-slate-200 hover:border-emerald-600 rounded-xl text-xs font-bold text-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs group"
        >
          <Plus size={14} className="text-emerald-600 group-hover:text-white transition-colors" />
          <span>Add Deal to {stg.name.split(' ')[0]}</span>
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Visual Funnel Bar, Connected Flow Stepper & Sequence Manager */}
      <div className="bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-emerald-200/80 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3.5 border-b border-emerald-100">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-xs">
              <Sparkles size={16} />
            </span>
            <div>
              <h2 className="text-xs font-black text-slate-900 tracking-tight uppercase flex items-center gap-1.5">
                <span>Dynamic Funnel Sequence ({stages.length} Connected Stages)</span>
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Columns reflect live company stages • Use ◀ ▶ on headers to reorder sequence or click Manage Stages
              </p>
            </div>
          </div>

          {/* Action Buttons: Add Stage & Reorder Modal & View Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Manage Stages Modal Button */}
            {onOpenManageStages && (
              <button
                type="button"
                onClick={onOpenManageStages}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 transition-all shadow-2xs cursor-pointer"
              >
                <Sliders size={13} className="text-emerald-600" />
                <span>Manage Stages</span>
              </button>
            )}

            {/* Quick Add Stage Button */}
            {onOpenAddStage && (
              <button
                type="button"
                onClick={onOpenAddStage}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 transition-all shadow-2xs cursor-pointer"
              >
                <Plus size={13} className="text-emerald-600" />
                <span>+ Add Stage</span>
              </button>
            )}

            {/* View Switcher Tabs */}
            <div className="inline-flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => {
                  setActivePhase('all');
                  setSelectedStage('all');
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activePhase === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
              >
                <Grid3X3 size={13} />
                <span>All Stages ({stages.length})</span>
              </button>

              {stages.length > 3 && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePhase('phase1');
                      setSelectedStage('all');
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activePhase === 'phase1'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }`}
                  >
                    <span>Early Funnel (1–{midpoint})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActivePhase('phase2');
                      setSelectedStage('all');
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activePhase === 'phase2'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }`}
                  >
                    <span>Late Funnel ({midpoint + 1}–{stages.length})</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Live Funnel Stepper Flow Bar with Connecting Arrows */}
        <div className="pt-3.5">
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            <button
              type="button"
              onClick={() => setSelectedStage('all')}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${selectedStage === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                }`}
            >
              All Deals ({deals.length})
            </button>

            {stages.map((stg, i) => {
              const isSelected = selectedStage === stg.id;
              const count = deals.filter(
                (d) => String(d.stage) === String(stg.id) || String(d.stage) === String(stg._id)
              ).length;

              return (
                <React.Fragment key={stg.id}>
                  <button
                    type="button"
                    onClick={() => handleStageSelect(stg.id, i)}
                    className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer border ${isSelected
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs font-black'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-bold'
                      }`}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-white' : stg.dotColor}`} />
                    <span>
                      {i + 1}. {stg.name}
                    </span>
                    <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                      {count}
                    </span>
                  </button>

                  {/* Funnel sequence connecting arrow */}
                  {i < stages.length - 1 && (
                    <ArrowRight size={13} className="text-slate-300 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Kanban Columns Content */}
      {activePhase === 'phase1' ? (
        /* PHASE 1 VIEW */
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 font-black text-xs tracking-wide uppercase border border-blue-200 shadow-2xs">
                Early Stage • Qualification & Discovery
              </span>
              <span className="text-xs text-slate-500 font-semibold">Steps 1 to {midpoint}</span>
            </div>
            <button
              type="button"
              onClick={() => setActivePhase('phase2')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-all cursor-pointer"
            >
              <span>Next: Late Stage ({midpoint + 1}–{stages.length})</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {firstRowStages.map((stg, idx) => renderColumn(stg, idx))}
          </div>
        </div>
      ) : activePhase === 'phase2' ? (
        /* PHASE 2 VIEW */
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-black text-xs tracking-wide uppercase border border-emerald-200 shadow-2xs">
                Late Stage • Negotiation & Enterprise Closing
              </span>
              <span className="text-xs text-slate-500 font-semibold">Steps {midpoint + 1} to {stages.length}</span>
            </div>
            <button
              type="button"
              onClick={() => setActivePhase('phase1')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Back: Early Stage (1–{midpoint})</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {secondRowStages.map((stg, idx) => renderColumn(stg, idx + midpoint))}
          </div>
        </div>
      ) : (
        /* ALL STAGES VIEW */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            {stages.map((stg, idx) => renderColumn(stg, idx))}
          </div>
        </div>
      )}
    </div>
  );
}
