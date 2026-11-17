import React from 'react';
import {
  Bell, CheckSquare, Clock, Phone, Mail, Check, Trash2, RotateCw,
  AlertTriangle, Building2, User, ChevronRight, Sparkles, MessageSquare,
  CalendarClock
} from 'lucide-react';

export default function TaskReminderCard({
  item,
  onToggleComplete,
  onSnoozeReminder,
  onOpenReschedule,
  onDelete,
}) {
  const isCompleted = item.status === 'Completed';
  const isReminder = item.type === 'Reminder';

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-rose-50 text-rose-800 border-rose-200 font-bold';
      case 'High':
        return 'bg-amber-50 text-amber-800 border-amber-200 font-semibold';
      case 'Medium':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

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

  const formatDueDate = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr === 'Today' || dateStr === 'Tomorrow' || dateStr === 'Next Week' || dateStr === 'In 2 Days') {
      return dateStr;
    }
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      try {
        const todayISO = new Date().toISOString().split('T')[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowISO = tomorrow.toISOString().split('T')[0];

        if (dateStr === todayISO) return 'Today';
        if (dateStr === tomorrowISO) return 'Tomorrow';

        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      } catch {
        return dateStr;
      }
    }
    return dateStr;
  };

  return (
    <div
      className={`group bg-white/95 backdrop-blur-md rounded-2xl border border-l-4 ${getPriorityLeftBorder(
        item.priority
      )} p-4 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between relative overflow-hidden ${
        isCompleted
          ? 'opacity-60 bg-slate-50/70 border-slate-200'
          : item.isOverdue
          ? 'border-rose-300 ring-1 ring-rose-400/20 shadow-rose-500/5 hover:border-rose-400'
          : isReminder
          ? 'border-amber-200 hover:border-amber-400'
          : 'border-slate-200 hover:border-emerald-400'
      }`}
    >
      <div>
        {/* Header: Checkbox, Type Badge & Priority */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {/* Interactive Animated Checkbox */}
            <button
              onClick={() => onToggleComplete(item.id)}
              className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs scale-95'
                  : 'bg-white border-slate-300 hover:border-emerald-500 text-transparent hover:text-emerald-500 hover:scale-105'
              }`}
              title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
            >
              <Check size={12} strokeWidth={3} />
            </button>

            {/* Type Pill */}
            <span
              className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-0.5 rounded-full border shadow-2xs ${
                isReminder
                  ? 'bg-amber-50 text-amber-900 border-amber-200'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-200'
              }`}
            >
              {isReminder ? (
                <Bell size={11} className="text-amber-600" />
              ) : (
                <CheckSquare size={11} className="text-emerald-600" />
              )}
              <span>{item.type}</span>
            </span>

            {/* Category tag */}
            {item.category && (
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100/90 px-2 py-0.5 rounded-lg border border-slate-200/60">
                {item.category}
              </span>
            )}

            {/* Linked Lead Name */}
            {item.leadName && (
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200" title={`Linked Lead: ${item.leadName}`}>
                {item.leadName}
              </span>
            )}
          </div>

          {/* Priority Pill */}
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border ${getPriorityStyle(
              item.priority
            )}`}
          >
            {item.priority}
          </span>
        </div>

        {/* Title */}
        <h3
          className={`text-sm font-extrabold leading-snug transition-colors mb-2 ${
            isCompleted
              ? 'line-through text-slate-400'
              : 'text-slate-900 group-hover:text-emerald-700'
          }`}
        >
          {item.title}
        </h3>

        {/* Description */}
        {item.description && (
          <p className="text-xs text-slate-500 font-medium leading-relaxed mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Linked Client & Company Glass Box */}
        {(item.linkedContact || item.linkedCompany) && (
          <div className="bg-slate-50/80 backdrop-blur-xs rounded-xl p-2.5 border border-slate-200/70 mb-3 space-y-1 text-xs">
            {item.linkedContact && (
              <div className="flex items-center gap-1.5 font-extrabold text-slate-800 truncate">
                <User size={12} className="text-emerald-600 shrink-0" />
                <span className="truncate">{item.linkedContact}</span>
              </div>
            )}
            {item.linkedCompany && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold truncate">
                <Building2 size={11} className="text-slate-400 shrink-0" />
                <span className="truncate">{item.linkedCompany}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Footer: Due Date, Assigned Rep & Quick Communication */}
      <div className="pt-3 border-t border-slate-100/90 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          {/* Due Date & Time indicator */}
          <div
            className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${
              item.isOverdue && !isCompleted
                ? 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200'
                : 'text-slate-500'
            }`}
          >
            {item.isOverdue && !isCompleted ? (
              <AlertTriangle size={12} className="text-rose-600 animate-pulse" />
            ) : (
              <Clock size={12} className="text-slate-400" />
            )}
            <span>
              {formatDueDate(item.dueDate)} • {item.dueTime}
            </span>
          </div>

          {/* Assigned Rep Avatar */}
          <div className="flex items-center gap-1.5">
            <div
              className={`w-5 h-5 rounded-full ${item.repColor || 'bg-emerald-600'} text-white font-black text-[9px] flex items-center justify-center shadow-2xs`}
              title={`Assigned to ${item.assignedRep}`}
            >
              {item.repAvatar}
            </div>
            <span className="text-[10px] font-bold text-slate-600 truncate max-w-[80px]">
              {item.assignedRep}
            </span>
          </div>
        </div>

        {/* Action Buttons Strip */}
        <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-slate-100/70">
          <div className="flex items-center gap-1.5">
            {item.phone && (
              <>
                <a
                  href={`tel:${item.phone}`}
                  className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 border border-slate-200 transition-all flex items-center justify-center hover:scale-105"
                  title={`Call ${item.linkedContact}`}
                >
                  <Phone size={12} />
                </a>

                <a
                  href={`https://wa.me/${(item.phone || '').replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 border border-slate-200 transition-all flex items-center justify-center hover:scale-105"
                  title={`WhatsApp ${item.linkedContact}`}
                >
                  <MessageSquare size={12} />
                </a>
              </>
            )}

            {item.email && (
              <a
                href={`mailto:${item.email}`}
                className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-700 border border-slate-200 transition-all flex items-center justify-center hover:scale-105"
                title={`Email ${item.linkedContact}`}
              >
                <Mail size={12} />
              </a>
            )}

            {/* Full Reschedule Button */}
            {!isCompleted && onOpenReschedule && (
              <button
                onClick={() => onOpenReschedule(item)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black text-slate-700 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer shadow-2xs hover:scale-102"
                title="Reschedule / Change Date"
              >
                <CalendarClock size={11} className="text-emerald-600" />
                <span>Reschedule</span>
              </button>
            )}

            {/* Snooze Button for Reminders */}
            {isReminder && !isCompleted && (
              <button
                onClick={() => onSnoozeReminder(item.id)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all cursor-pointer shadow-2xs hover:scale-102"
                title="Snooze for 1 hour"
              >
                <RotateCw size={10} className="text-amber-600" />
                <span>+1h</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleComplete(item.id)}
              className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer shadow-2xs ${
                isCompleted
                  ? 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
              }`}
            >
              {isCompleted ? 'Reopen' : 'Done'}
            </button>

            <button
              onClick={() => onDelete(item.id)}
              className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
