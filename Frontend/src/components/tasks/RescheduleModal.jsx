import React, { useState, useEffect } from 'react';
import {
  X, CalendarClock, Calendar, Clock, AlertTriangle, CheckCircle2,
  Sparkles, History, RotateCw, ShieldCheck, MessageSquare, ArrowRight
} from 'lucide-react';

const RESCHEDULE_REASONS = [
  'Client requested callback later',
  'Awaiting pricing / quote approval',
  'Key decision maker unavailable',
  'Proposal / deck needs revision',
  'Technical demo rescheduled',
  'Other / Custom note'
];

export default function RescheduleModal({
  isOpen,
  onClose,
  item,
  onReschedule,
}) {
  // Format today as YYYY-MM-DD for min date
  const getTodayStr = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  };

  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [dateType, setDateType] = useState('preset'); // 'preset' or 'custom'
  const [selectedPresetDate, setSelectedPresetDate] = useState('Tomorrow');
  const [customDate, setCustomDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('11:00 AM');
  const [selectedReason, setSelectedReason] = useState(RESCHEDULE_REASONS[0]);
  const [customNotes, setCustomNotes] = useState('');
  const [resetReminderAlarm, setResetReminderAlarm] = useState(true);

  // Initialize form when item changes or modal opens
  useEffect(() => {
    if (item) {
      setSelectedPresetDate('Tomorrow');
      setCustomDate(getTomorrowStr());
      setSelectedTime(item.dueTime || '11:00 AM');
      setSelectedReason(RESCHEDULE_REASONS[0]);
      setCustomNotes('');
      setResetReminderAlarm(true);
      setDateType('preset');
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  // Quick 1-Click Presets
  const applyQuickPreset = (presetName, timeStr, presetDateVal, isCustom = false, customVal = '') => {
    if (isCustom) {
      setDateType('custom');
      setCustomDate(customVal);
    } else {
      setDateType('preset');
      setSelectedPresetDate(presetDateVal);
    }
    setSelectedTime(timeStr);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const finalDate = dateType === 'preset' ? selectedPresetDate : customDate;
    const finalReason = selectedReason === 'Other / Custom note' && customNotes
      ? customNotes
      : selectedReason;

    onReschedule({
      id: item.id,
      newDate: finalDate,
      newTime: selectedTime,
      reason: finalReason,
      resetAlarm: resetReminderAlarm,
      rawDate: dateType === 'custom' ? customDate : null,
    });

    onClose();
  };

  // Helper for computing dynamic preset targets
  const getNextWeekStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + ((1 + 7 - d.getDay()) % 7 || 7)); // Next Monday
    return d.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white/98 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200/90 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-amber-50/70 via-white to-emerald-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-600 text-white shadow-md shadow-emerald-600/20 flex items-center justify-center ring-1 ring-emerald-300">
              <CalendarClock size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Reschedule Action Item
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                  {item.type || 'Task'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate max-w-sm">
                {item.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current Schedule & Context Banner */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500">Current Schedule:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-black text-slate-700 shadow-2xs">
              <Clock size={11} className="text-slate-400" />
              <span>{item.dueDate} at {item.dueTime}</span>
            </span>
            {item.isOverdue && (
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-black text-[10px] flex items-center gap-1">
                <AlertTriangle size={10} />
                <span>Overdue</span>
              </span>
            )}
          </div>

          {item.rescheduleCount > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80">
              <History size={11} />
              <span>Rescheduled {item.rescheduleCount}x previously</span>
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Quick 1-Click Preset Shortcuts */}
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 block mb-2 flex items-center gap-1.5">
              <Sparkles size={12} className="text-amber-500" />
              <span>Quick 1-Click Presets</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => applyQuickPreset('Today (+2 Hours)', 'In 2 hours', 'Today')}
                className="px-2.5 py-2 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 font-bold text-[11px] transition-all text-left cursor-pointer flex flex-col"
              >
                <span className="text-slate-500 text-[10px]">Today</span>
                <span className="text-emerald-700 font-extrabold">+2 Hours</span>
              </button>

              <button
                type="button"
                onClick={() => applyQuickPreset('Tomorrow Morning', '10:00 AM', 'Tomorrow')}
                className="px-2.5 py-2 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 font-bold text-[11px] transition-all text-left cursor-pointer flex flex-col"
              >
                <span className="text-slate-500 text-[10px]">Tomorrow</span>
                <span className="text-emerald-700 font-extrabold">10:00 AM</span>
              </button>

              <button
                type="button"
                onClick={() => applyQuickPreset('Tomorrow Afternoon', '03:00 PM', 'Tomorrow')}
                className="px-2.5 py-2 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 font-bold text-[11px] transition-all text-left cursor-pointer flex flex-col"
              >
                <span className="text-slate-500 text-[10px]">Tomorrow</span>
                <span className="text-emerald-700 font-extrabold">03:00 PM</span>
              </button>

              <button
                type="button"
                onClick={() => applyQuickPreset('Next Week', '10:00 AM', 'Next Week', true, getNextWeekStr())}
                className="px-2.5 py-2 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 font-bold text-[11px] transition-all text-left cursor-pointer flex flex-col"
              >
                <span className="text-slate-500 text-[10px]">Next Week</span>
                <span className="text-emerald-700 font-extrabold">Mon 10 AM</span>
              </button>
            </div>
          </div>

          {/* Date Picker Mode Tabs: Preset vs Custom Calendar */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                New Due Date *
              </label>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setDateType('preset')}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    dateType === 'preset'
                      ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Quick Chips
                </button>
                <button
                  type="button"
                  onClick={() => setDateType('custom')}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    dateType === 'custom'
                      ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Custom Calendar
                </button>
              </div>
            </div>

            {dateType === 'preset' ? (
              <div className="grid grid-cols-4 gap-2">
                {['Today', 'Tomorrow', 'In 2 Days', 'Next Week'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setSelectedPresetDate(preset)}
                    className={`py-2 px-2 rounded-xl text-center font-bold text-xs transition-all border cursor-pointer ${
                      selectedPresetDate === preset
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20 font-black shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            ) : (
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  min={getTodayStr()}
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  onClick={(e) => {
                    try {
                      e.target.showPicker?.();
                    } catch {}
                  }}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs cursor-pointer"
                  required={dateType === 'custom'}
                />
              </div>
            )}
          </div>

          {/* New Time Selector */}
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block mb-1.5">
              New Target Time *
            </label>
            <div className="space-y-2">
              <div className="relative">
                <Clock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  placeholder="e.g. 11:30 AM or 03:00 PM"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
                />
              </div>

              {/* Quick Time Pills */}
              <div className="flex flex-wrap gap-1.5">
                {['10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM', '06:30 PM'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTime(t)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      selectedTime === t
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reschedule Reason */}
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block mb-1.5">
              Reason for Rescheduling *
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs cursor-pointer"
            >
              {RESCHEDULE_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            {selectedReason === 'Other / Custom note' && (
              <textarea
                rows={2}
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Explain the reason for rescheduling with client details..."
                className="w-full mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                required
              />
            )}
          </div>

          {/* In-App Alarm & Duplicate Prevention Checkbox */}
          <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 flex items-start gap-2.5">
            <div className="mt-0.5">
              <input
                id="reset-alarm"
                type="checkbox"
                checked={resetReminderAlarm}
                onChange={(e) => setResetReminderAlarm(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
              />
            </div>
            <div>
              <label htmlFor="reset-alarm" className="text-xs font-black text-emerald-950 cursor-pointer block">
                Reset in-app reminder alarm for new window
              </label>
              <p className="text-[11px] text-emerald-800/80 font-medium">
                Clears past trigger history to prevent duplicate alarms and triggers alert on new due date.
              </p>
            </div>
          </div>

          {/* Summary Preview Box */}
          <div className="bg-slate-100/90 rounded-2xl p-3 border border-slate-200 text-xs flex items-center justify-between">
            <span className="text-slate-500 font-bold">New Scheduled Window:</span>
            <div className="flex items-center gap-1.5 font-black text-slate-800">
              <span className="text-emerald-700">
                {dateType === 'preset' ? selectedPresetDate : customDate}
              </span>
              <span>at</span>
              <span className="text-emerald-700">{selectedTime}</span>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-md shadow-emerald-600/25 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              <CalendarClock size={14} />
              <span>Confirm Reschedule</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
