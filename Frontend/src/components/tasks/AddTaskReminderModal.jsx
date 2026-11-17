import React, { useState, useMemo, useEffect } from 'react';
import {
  X, CheckSquare, Bell, Calendar, Clock, User, Building2,
  Phone, Mail, MessageSquare, Sparkles, ShieldCheck,
  ChevronDown, CheckCircle2, UserCheck, Search
} from 'lucide-react';
import { SALES_REPS, PRIORITY_OPTIONS } from './TasksData';

export default function AddTaskReminderModal({
  isOpen,
  onClose,
  newItem,
  setNewItem,
  onSubmit,
  isSalesPerson = false,
  currentSalesPerson = 'Sales Rep',
  leads = [],
  availableReps = SALES_REPS,
}) {
  if (!isOpen) return null;

  const leadsList = leads || [];
  const isReminder = newItem.type === 'Reminder';
  const selectedLead = leadsList.find((l) => l.id === newItem.leadId);

  const getTodayISO = () => new Date().toISOString().split('T')[0];
  const getTomorrowISO = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [leadSearchQuery, setLeadSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Reset search when modal opens
  useEffect(() => {
    if (isOpen) {
      setLeadSearchQuery('');
      setIsDropdownOpen(false);
    }
  }, [isOpen]);

  const filteredLeads = useMemo(() => {
    const q = leadSearchQuery.toLowerCase().trim();
    if (!q) return leadsList;
    return leadsList.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.company && l.company.toLowerCase().includes(q)) ||
        (l.status && l.status.toLowerCase().includes(q)) ||
        (l.assignedRep && l.assignedRep.toLowerCase().includes(q))
    );
  }, [leadsList, leadSearchQuery]);

  // Handle lead selection & auto-fill
  const handleLeadSelect = (leadId) => {
    if (!leadId || leadId === 'manual') {
      setNewItem((prev) => ({
        ...prev,
        leadId: '',
        leadName: '',
      }));
      return;
    }

    const lead = leadsList.find((l) => l.id === leadId);
    if (lead) {
      setNewItem((prev) => ({
        ...prev,
        leadId: lead.id,
        leadName: lead.name,
        linkedCompany: lead.company || prev.linkedCompany,
        linkedContact: `${lead.name}${lead.title ? ` (${lead.title})` : ''}`,
        phone: lead.phone || prev.phone,
        email: lead.email || prev.email,
        priority: lead.priority || prev.priority || 'High',
        assignedRep: !isSalesPerson
          ? (lead.assignedRep || prev.assignedRep || availableReps[0]?.name || 'Unassigned')
          : (currentSalesPerson || 'Sales Rep'),
        title: prev.title.trim() === ''
          ? `${prev.type === 'Reminder' ? 'Follow-up Call with' : 'Action Deliverable for'} ${lead.name} (${lead.company})`
          : prev.title,
      }));
    }
  };

  const handleClearLead = () => {
    setNewItem((prev) => ({
      ...prev,
      leadId: '',
      leadName: '',
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[92vh] overflow-y-auto z-10 animate-in zoom-in-95 duration-200 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-2xl ${
                isReminder
                  ? 'bg-amber-50 text-amber-600 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              }`}
            >
              {isReminder ? <Bell size={20} /> : <CheckSquare size={20} />}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                {isReminder ? 'Schedule Follow-up Alarm' : 'Create Sales Task / Deliverable'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {isReminder
                  ? 'Auto-triggers notification countdown for pipeline lead call'
                  : 'Assign closing milestone, review, or contract task'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {/* 1. Type Toggle */}
          <div className="p-1 bg-slate-100 rounded-2xl flex items-center">
            <button
              type="button"
              onClick={() => setNewItem({ ...newItem, type: 'Task' })}
              className={`flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                !isReminder
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckSquare size={14} className={!isReminder ? 'text-emerald-600' : 'text-slate-400'} />
              <span>Standard Task</span>
            </button>
            <button
              type="button"
              onClick={() => setNewItem({ ...newItem, type: 'Reminder' })}
              className={`flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isReminder
                  ? 'bg-white text-amber-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bell size={14} className={isReminder ? 'text-amber-600' : 'text-slate-400'} />
              <span>Follow-up Alarm</span>
            </button>
          </div>

          {/* 2. Lead Link (Smart Auto-fill) */}
          <div className="p-3.5 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 rounded-2xl border border-emerald-100 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <Sparkles size={13} className="text-emerald-600" />
                <span>Link from Pipeline (Auto-Fills Details)</span>
              </label>
              {newItem.leadId && (
                <button
                  type="button"
                  onClick={handleClearLead}
                  className="text-[10px] font-bold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  Unlink Lead
                </button>
              )}
            </div>

            {/* Quick Search input for dropdown */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={leadSearchQuery}
                onChange={(e) => setLeadSearchQuery(e.target.value)}
                placeholder="Search company name in dropdown..."
                className="w-full pl-8 pr-7 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
              />
              {leadSearchQuery && (
                <button
                  type="button"
                  onClick={() => setLeadSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Dropdown with Company Names ONLY */}
            <div className="relative">
              <select
                value={newItem.leadId || ''}
                onChange={(e) => handleLeadSelect(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs cursor-pointer truncate"
              >
                <option value="">-- Select Company Name (Auto-fills Company & Stakeholder) --</option>
                <optgroup label="Registered Companies">
                  {filteredLeads.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.company}
                    </option>
                  ))}
                </optgroup>
                <option value="manual">+ Manual Entry / Clear Fields</option>
              </select>
            </div>

            {/* Live Auto-fill confirmation card */}
            {selectedLead && (
              <div className="p-3 bg-white/95 rounded-xl border border-emerald-300/80 shadow-2xs space-y-1.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    <span className="font-extrabold text-slate-900">{selectedLead.company}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {selectedLead.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="flex items-center gap-1 font-semibold">
                    <User size={11} className="text-emerald-600" />
                    <span>Stakeholder: {selectedLead.name} {selectedLead.title ? `(${selectedLead.title})` : ''}</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Owner: {selectedLead.assignedRep || 'Unassigned'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 3. Title */}
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block mb-1">
              {isReminder ? 'Alarm Summary / Title *' : 'Task Title / Action Item *'}
            </label>
            <input
              type="text"
              required
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              placeholder={
                isReminder
                  ? 'e.g. Closing Call with CIO on contract clause 4'
                  : 'e.g. Finalize enterprise custom pricing tier deck'
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
            />
          </div>

          {/* 4. Contact Details (Shows when company/contact/phone/email is present) */}
          {(newItem.linkedCompany || newItem.linkedContact || newItem.phone || newItem.email) && (
            <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                <span className="flex items-center gap-1">
                  <Building2 size={12} className="text-slate-500" />
                  <span>Company & Stakeholder Linkage</span>
                </span>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Quick Dial Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={newItem.linkedCompany}
                    onChange={(e) => setNewItem({ ...newItem, linkedCompany: e.target.value })}
                    placeholder="Acme Enterprise Solutions"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Key Decision Maker</label>
                  <input
                    type="text"
                    value={newItem.linkedContact}
                    onChange={(e) => setNewItem({ ...newItem, linkedContact: e.target.value })}
                    placeholder="Rajesh Singhania (VP Sales)"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Phone / WhatsApp</label>
                  <div className="relative">
                    <Phone size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={newItem.phone}
                      onChange={(e) => setNewItem({ ...newItem, phone: e.target.value })}
                      placeholder="+91 98201 44521"
                      className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Client Email</label>
                  <div className="relative">
                    <Mail size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={newItem.email}
                      onChange={(e) => setNewItem({ ...newItem, email: e.target.value })}
                      placeholder="rajesh.s@acmesolutions.in"
                      className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. Due Date (Calendar Picker) & Exact Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1 mb-1">
                <Calendar size={12} className="text-emerald-600" />
                <span>Due Date (Calendar) *</span>
              </label>
              <div className="relative">
                <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  required
                  min={getTodayISO()}
                  value={
                    newItem.dueDate && newItem.dueDate.match(/^\d{4}-\d{2}-\d{2}$/)
                      ? newItem.dueDate
                      : newItem.dueDate === 'Tomorrow'
                      ? getTomorrowISO()
                      : getTodayISO()
                  }
                  onChange={(e) => setNewItem({ ...newItem, dueDate: e.target.value })}
                  onClick={(e) => {
                    try {
                      e.target.showPicker?.();
                    } catch {}
                  }}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block mb-1">
                {isReminder ? 'Alarm Trigger Time *' : 'Estimated Target Time'}
              </label>
              <div className="relative">
                <Clock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={newItem.dueTime}
                  onChange={(e) => setNewItem({ ...newItem, dueTime: e.target.value })}
                  placeholder="e.g. 11:30 AM or 03:45 PM"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* 6. Priority & Assigned Sales Rep (Manager assignment vs Salesperson) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block mb-1">
                Priority
              </label>
              <select
                value={newItem.priority}
                onChange={(e) => setNewItem({ ...newItem, priority: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs cursor-pointer"
              >
                {PRIORITY_OPTIONS.filter((p) => p !== 'All').map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                  {isSalesPerson ? 'Assigned Sales Closer' : 'Assign Task To Sales Rep *'}
                </label>
                {!isSalesPerson ? (
                  <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">
                    Team Control
                  </span>
                ) : (
                  <span className="text-[9px] font-extrabold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                    My Task
                  </span>
                )}
              </div>

              {!isSalesPerson ? (
                <select
                  value={newItem.assignedRep}
                  onChange={(e) => setNewItem({ ...newItem, assignedRep: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs cursor-pointer"
                >
                  {availableReps.map((r) => (
                    <option key={r.name} value={r.name}>
                      {r.name} ({r.role || 'Sales Rep'})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck size={13} className="text-emerald-600" />
                    <span>{currentSalesPerson || 'Sales Rep'}</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Assigned to You
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 7. Description / Checklist */}
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block mb-1">
              {isReminder ? 'Call Agenda & Talking Points' : 'Checklist & Deliverable Notes'}
            </label>
            <textarea
              rows={3}
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              placeholder={
                isReminder
                  ? 'Key questions to ask client, discount limits, or next steps to agree upon...'
                  : 'Add sub-deliverable items, review guidelines, or deck links...'
              }
              className="w-full p-3 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className={`px-6 py-2.5 rounded-xl text-white font-black text-xs shadow-md transition-all cursor-pointer hover:scale-102 active:scale-98 flex items-center gap-2 ${
                isReminder
                  ? 'bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 shadow-amber-600/25'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/25'
              }`}
            >
              <CheckCircle2 size={14} />
              <span>{isReminder ? 'Set Follow-up Alarm' : 'Assign Sales Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
