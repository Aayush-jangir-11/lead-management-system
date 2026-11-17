import React, { useState, useEffect } from 'react';
import { X, Bell, Calendar, Clock, Check, Trash2, Layers, Sparkles } from 'lucide-react';

/**
 * StageReminderModal
 * Schedule / Reschedule or Clear Follow-up Reminder on an entire Pipeline Stage.
 * Covers all deals in this stage with a single clean master reminder.
 */
export default function StageReminderModal({
  isOpen,
  onClose,
  stage,
  dealCount = 0,
  onSaveReminder,
  isSaving = false,
}) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('11:00 AM');
  const [note, setNote] = useState('');

  // Quick preset helper
  const setQuickDate = (daysFromToday) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromToday);
    const isoDate = d.toISOString().split('T')[0];
    setDate(isoDate);
  };

  const setToNextWeekday = (dayOfWeek) => {
    // 1 = Monday, 5 = Friday
    const d = new Date();
    const currentDay = d.getDay();
    let distance = (dayOfWeek + 7 - currentDay) % 7;
    if (distance === 0) distance = 7;
    d.setDate(d.getDate() + distance);
    setDate(d.toISOString().split('T')[0]);
  };

  useEffect(() => {
    if (!stage || !isOpen) return;

    const defaultTitle = `Stage Follow-up: ${stage.name}`;

    if (stage.reminder && stage.reminder.date) {
      try {
        const parsedDate = new Date(stage.reminder.date).toISOString().split('T')[0];
        setDate(parsedDate);
        setTime(stage.reminder.time || '11:00 AM');
        setTitle(stage.reminder.title || defaultTitle);
        setNote(stage.reminder.note || '');
      } catch {
        setQuickDate(1);
        setTime('11:00 AM');
        setTitle(defaultTitle);
        setNote('');
      }
    } else {
      // Default to tomorrow 11:00 AM
      setQuickDate(1);
      setTime('11:00 AM');
      setTitle(defaultTitle);
      setNote('');
    }
  }, [stage, isOpen]);

  if (!isOpen || !stage) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date) return;

    onSaveReminder({
      stageId: stage.id || stage._id,
      reminder: {
        title: title.trim() || `Stage Follow-up: ${stage.name}`,
        date: new Date(date).toISOString(),
        time,
        note: note.trim(),
      },
    });
  };

  const handleClear = () => {
    onSaveReminder({
      stageId: stage.id || stage._id,
      reminder: null,
    });
  };

  const hasExistingReminder = Boolean(stage.reminder && stage.reminder.date);
  const todayIso = new Date().toISOString().split('T')[0];

  const TIME_OPTIONS = [
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '12:00 PM',
    '02:00 PM',
    '02:30 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
    '06:00 PM',
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pt-16 sm:pt-20 pb-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shadow-sm shrink-0">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                <span>Stage Follow-up Reminder</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Entire Stage
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                <Layers size={13} className="text-emerald-600" />
                <strong className="text-slate-800">{stage.name}</strong>
                <span>• Covers all {dealCount} deals</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Quick Date Presets */}
          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-2 flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-500" />
              <span>Quick Date Selection</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setQuickDate(0)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-amber-400 bg-white hover:bg-amber-50/60 font-bold text-slate-700 text-xs transition-all cursor-pointer shadow-2xs"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setQuickDate(1)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-amber-400 bg-white hover:bg-amber-50/60 font-bold text-slate-700 text-xs transition-all cursor-pointer shadow-2xs"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setQuickDate(2)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-amber-400 bg-white hover:bg-amber-50/60 font-bold text-slate-700 text-xs transition-all cursor-pointer shadow-2xs"
              >
                In 2 Days
              </button>
              <button
                type="button"
                onClick={() => setToNextWeekday(5)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-amber-400 bg-white hover:bg-amber-50/60 font-bold text-slate-700 text-xs transition-all cursor-pointer shadow-2xs"
              >
                This Friday
              </button>
              <button
                type="button"
                onClick={() => setToNextWeekday(1)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-amber-400 bg-white hover:bg-amber-50/60 font-bold text-slate-700 text-xs transition-all cursor-pointer shadow-2xs"
              >
                Next Monday
              </button>
            </div>
          </div>

          {/* Reminder Title (Identifies what this reminder is for) */}
          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <Bell size={13} className="text-amber-500" />
              <span>Reminder Title * (What is this reminder for?)</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`e.g. Follow-up Call for ${stage.name} deals`}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white shadow-2xs"
            />
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Calendar size={13} className="text-emerald-600" />
                <span>Follow-up Date *</span>
              </label>
              <input
                type="date"
                min={todayIso}
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white shadow-2xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Clock size={13} className="text-emerald-600" />
                <span>Reminder Time</span>
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white shadow-2xs cursor-pointer"
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Note / Follow-up Objective */}
          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block mb-1.5">
              Stage Agenda / Follow-up Note (Optional)
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={`e.g. Run calling drive for all ${dealCount} leads in ${stage.name}, check updated quotes, review stage progress.`}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white shadow-2xs"
            />
          </div>

          {/* Info Banner */}
          <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200/80 flex items-start gap-2.5 text-[11px] text-emerald-900 leading-relaxed">
            <Check size={15} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-black">Whole-Stage Advantage:</strong> This schedules 1 clean master reminder for the entire <strong>"{stage.name}"</strong> stage without cluttering individual deals. A synced review task will be visible on your Tasks & Calendar dashboard.
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            {hasExistingReminder ? (
              <button
                type="button"
                onClick={handleClear}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Clear Reminder</span>
              </button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !date}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Bell size={13} />
                <span>{isSaving ? 'Saving...' : hasExistingReminder ? 'Update Reminder' : 'Set Stage Reminder'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

