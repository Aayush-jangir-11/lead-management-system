import React, { useMemo } from 'react';
import { UserPlus, X } from 'lucide-react';
import { SALES_REPS, STATUS_OPTIONS, SOURCE_OPTIONS } from './LeadsHeaderStats';

export default function AddLeadModal({
  showAddModal,
  onClose,
  newLead,
  setNewLead,
  onSubmit,
  isSalesPerson = false,
  salesReps = SALES_REPS,
  stages = [],
}) {
  const stageOptions = useMemo(() => {
    if (stages && stages.length > 0) {
      return stages.map((s) => s.name);
    }
    return STATUS_OPTIONS.filter((s) => s !== 'All');
  }, [stages]);

  if (!showAddModal) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 cursor-default"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <UserPlus size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Add New Prospect / Lead</h3>
              <p className="text-xs text-slate-500">Directly add and assign an incoming enterprise opportunity.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={onSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Company Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Acme Corp"
                value={newLead.company}
                onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Contact Person Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={newLead.name}
                onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Designation / Title</label>
              <input
                type="text"
                placeholder="e.g. VP Operations"
                value={newLead.title}
                onChange={(e) => setNewLead({ ...newLead, title: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Deal Value (₹ INR) *</label>
              <input
                type="number"
                required
                placeholder="e.g. 150000"
                value={newLead.value}
                onChange={(e) => setNewLead({ ...newLead, value: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                placeholder="rahul@acme.com"
                value={newLead.email}
                onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+91 98765 00000"
                value={newLead.phone}
                onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Stage</label>
              <select
                value={newLead.status}
                onChange={(e) => setNewLead({ ...newLead, status: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none cursor-pointer"
              >
                {stageOptions.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Priority</label>
              <select
                value={newLead.priority}
                onChange={(e) => setNewLead({ ...newLead, priority: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none cursor-pointer"
              >
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Assign Owner {isSalesPerson && <span className="text-emerald-600 font-semibold text-[10px]">(Auto-Assigned)</span>}
              </label>
              {isSalesPerson ? (
                <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-xl px-2.5 py-2 text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  {newLead.assignedRep || 'Self'}
                </div>
              ) : (
                <select
                  value={newLead.assignedRep}
                  onChange={(e) => setNewLead({ ...newLead, assignedRep: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none cursor-pointer"
                >
                  {salesReps.map((r) => (
                    <option key={r.name} value={r.name}>{r.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Acquisition Source</label>
            <select
              value={newLead.source}
              onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none cursor-pointer"
            >
              {SOURCE_OPTIONS.filter((s) => s !== 'All').map((src) => (
                <option key={src} value={src}>{src}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Notes / Qualification Info</label>
            <textarea
              rows={2}
              placeholder="Key requirements, budget timeline, specific tech requirements..."
              value={newLead.notes}
              onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Modal Footer */}
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
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm transition-colors cursor-pointer"
            >
              Create & Assign Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
