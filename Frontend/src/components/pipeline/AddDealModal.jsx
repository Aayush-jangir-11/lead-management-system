import React, { useState, useMemo } from 'react';
import { Plus, X, Search, Target, CheckCircle2, Calendar } from 'lucide-react';
import { SALES_REPS } from '../../pages/sales/Pipeline';

export default function AddDealModal({
  showAddModal,
  onClose,
  newDeal,
  setNewDeal,
  onSubmit,
  stages = [],
  salesReps = SALES_REPS,
  existingLeads = [],
}) {
  if (!showAddModal) return null;

  const [leadSearchQuery, setLeadSearchQuery] = useState('');

  const leadOptions = existingLeads;

  const filteredLeads = useMemo(() => {
    const q = leadSearchQuery.toLowerCase().trim();
    if (!q) return leadOptions;
    return leadOptions.filter(
      (l) =>
        (l.name && l.name.toLowerCase().includes(q)) ||
        (l.contact && l.contact.toLowerCase().includes(q)) ||
        (l.company && l.company.toLowerCase().includes(q))
    );
  }, [leadSearchQuery, leadOptions]);

  const handleLeadSelect = (leadId) => {
    if (!leadId) return;
    const lead = leadOptions.find((l) => String(l.id || l._id) === String(leadId));
    if (lead) {
      setNewDeal((prev) => ({
        ...prev,
        company: lead.company || prev.company,
        contact: lead.contact || lead.name || prev.contact,
        value: lead.value !== undefined ? lead.value : prev.value,
        rep: lead.rep || lead.assignedRepName || lead.assignedRep || prev.rep,
        priority: lead.priority || prev.priority || 'High',
        email: lead.email || prev.email,
        phone: lead.phone || prev.phone,
      }));
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 cursor-default"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Plus size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Add Pipeline Opportunity</h3>
              <p className="text-xs text-slate-500">Insert an active high-value deal into the sales funnel.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-6 space-y-4 text-xs">
          {/* Select Company to Auto-Fill */}
          <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/80 space-y-2">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
              <Target size={13} className="text-emerald-600" />
              <span>Select Company to Auto-Fill *</span>
            </label>

            {/* Quick Search Bar */}
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={leadSearchQuery}
                onChange={(e) => setLeadSearchQuery(e.target.value)}
                placeholder="Search company name to filter..."
                className="w-full pl-7 pr-6 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              {leadSearchQuery && (
                <button
                  type="button"
                  onClick={() => setLeadSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={11} />
                </button>
              )}
            </div>

            {/* Dropdown with Company Names */}
            <select
              onChange={(e) => handleLeadSelect(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs cursor-pointer truncate"
            >
              <option value="">-- Select Company (Auto-fills Company & Contact) --</option>
              {filteredLeads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.company}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">Company / Account *</label>
                {newDeal.company && (
                  <span className="text-[9px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                    Auto-filled
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                placeholder="e.g. Acme Corp"
                value={newDeal.company}
                onChange={(e) => setNewDeal({ ...newDeal, company: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">Contact Person *</label>
                {newDeal.contact && (
                  <span className="text-[9px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                    Auto-filled
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                placeholder="e.g. Rajesh Singhania"
                value={newDeal.contact}
                onChange={(e) => setNewDeal({ ...newDeal, contact: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Deal Value (₹ INR) *</label>
              <input
                type="number"
                required
                placeholder="e.g. 150000"
                value={newDeal.value}
                onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                <Calendar size={13} className="text-emerald-600" />
                <span>Target Close Date</span>
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={newDeal.targetClose || ''}
                onChange={(e) => setNewDeal({ ...newDeal, targetClose: e.target.value })}
                onClick={(e) => {
                  try {
                    e.target.showPicker?.();
                  } catch {}
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Pipeline Stage</label>
              <select
                value={newDeal.stage}
                onChange={(e) => setNewDeal({ ...newDeal, stage: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none cursor-pointer"
              >
                {stages.map((stg) => (
                  <option key={stg.id} value={stg.id}>
                    {stg.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Priority</label>
              <select
                value={newDeal.priority}
                onChange={(e) => setNewDeal({ ...newDeal, priority: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none cursor-pointer"
              >
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Assigned Closer</label>
              <select
                value={newDeal.rep}
                onChange={(e) => setNewDeal({ ...newDeal, rep: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none cursor-pointer"
              >
                {salesReps.map((r) => (
                  <option key={r.name} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Email</label>
              <input
                type="email"
                placeholder="rajesh@acme.com"
                value={newDeal.email}
                onChange={(e) => setNewDeal({ ...newDeal, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Phone</label>
              <input
                type="text"
                placeholder="+91 98000 00000"
                value={newDeal.phone}
                onChange={(e) => setNewDeal({ ...newDeal, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Deal Notes / Requirements</label>
            <textarea
              rows={2}
              placeholder="Enterprise license volume, custom SLA requirements, key competitors..."
              value={newDeal.notes}
              onChange={(e) => setNewDeal({ ...newDeal, notes: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/25 transition-all cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              Add to Funnel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
