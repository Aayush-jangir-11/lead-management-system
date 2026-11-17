import React, { useMemo, useState } from 'react';
import {
  Building2, X, Phone, Mail, MessageSquare, Sparkles, Clock,
  ArrowRight, CheckCircle2, Trophy, PhoneOutgoing, Check
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { SALES_REPS, STATUS_OPTIONS, getStatusBadge, getPriorityBadge } from './LeadsHeaderStats';

export default function LeadDetailsDrawer({
  activeLeadDetails,
  onClose,
  drawerTab,
  setDrawerTab,
  onOwnerChange,
  onStatusChange,
  onPriorityChange,
  onDeleteLead,
  // Note logging
  newNoteInput,
  setNewNoteInput,
  onAddNote,
  salesReps = SALES_REPS,
  stages = [],
}) {
  const stageOptions = useMemo(() => {
    if (stages && stages.length > 0) {
      return stages.map((s) => s.name);
    }
    return STATUS_OPTIONS.filter((s) => s !== 'All');
  }, [stages]);

  const getDynamicBadge = (stName) => {
    const matched = stages.find((s) => s.name?.toLowerCase() === stName?.toLowerCase());
    if (matched && matched.badgeColor) return matched.badgeColor;
    return getStatusBadge(stName);
  };

  const { user } = useAuth();
  const [showCallLogForm, setShowCallLogForm] = useState(false);
  const [isSubmittingCall, setIsSubmittingCall] = useState(false);
  const [callLogForm, setCallLogForm] = useState({
    callType: 'Discovery Call',
    duration: '10 mins',
    outcome: 'Demo Scheduled',
    notes: '',
    nextFollowUp: 'Tomorrow, 02:00 PM',
  });

  const handleSaveDrawerCall = async (e) => {
    e.preventDefault();
    if (!callLogForm.notes.trim() || !activeLeadDetails) return;

    setIsSubmittingCall(true);
    try {
      const payload = {
        lead: activeLeadDetails._id || activeLeadDetails.id,
        callType: callLogForm.callType,
        duration: callLogForm.duration,
        outcome: callLogForm.outcome,
        notes: callLogForm.notes.trim(),
        nextFollowUp: callLogForm.nextFollowUp,
      };
      await api.post('/calls', payload);

      const newTimelineEntry = {
        type: 'call',
        title: `${callLogForm.callType} (${callLogForm.duration})`,
        author: user?.name || 'Sales Representative',
        time: 'Just now',
        note: `${callLogForm.outcome}: ${callLogForm.notes.trim()}`,
      };

      if (activeLeadDetails.timeline) {
        activeLeadDetails.timeline.unshift(newTimelineEntry);
      }

      setCallLogForm({
        callType: 'Follow-up Call',
        duration: '10 mins',
        outcome: 'Follow-up Required',
        notes: '',
        nextFollowUp: 'Tomorrow, 02:00 PM',
      });
      setShowCallLogForm(false);
    } catch (err) {
      console.error('Failed to log call in backend:', err);
    } finally {
      setIsSubmittingCall(false);
    }
  };

  if (!activeLeadDetails) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200 cursor-default"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                <Building2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">{activeLeadDetails.company}</h3>
                <span className="text-xs text-slate-500 font-medium">
                  {activeLeadDetails.id} • {activeLeadDetails.source}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-200/70 text-xs">
            <button
              onClick={() => setDrawerTab('profile')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                drawerTab === 'profile'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Contact Profile & Stage
            </button>
            <button
              onClick={() => setDrawerTab('timeline')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                drawerTab === 'timeline'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Clock size={13} />
              <span>Activity Timeline ({(activeLeadDetails.timeline || []).length})</span>
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* TAB 1: CONTACT PROFILE, OWNER & STAGE */}
          {drawerTab === 'profile' && (
            <div className="space-y-5">
              {/* Primary Contact Person Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
                  Primary Contact Person
                </span>
                <h4 className="text-base font-bold text-slate-900">{activeLeadDetails.name}</h4>
                <p className="text-slate-500 text-xs font-medium mb-3">
                  {activeLeadDetails.title} • {activeLeadDetails.location}
                </p>

                {/* Quick Communication Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/60">
                  <a
                    href={`tel:${activeLeadDetails.phone}`}
                    className="flex items-center justify-center gap-1.5 text-slate-700 hover:text-emerald-700 bg-white p-2 rounded-lg border border-slate-200 font-semibold"
                  >
                    <Phone size={13} className="text-emerald-600" />
                    <span>Call</span>
                  </a>

                  <a
                    href={`mailto:${activeLeadDetails.email}`}
                    className="flex items-center justify-center gap-1.5 text-slate-700 hover:text-blue-700 bg-white p-2 rounded-lg border border-slate-200 font-semibold"
                  >
                    <Mail size={13} className="text-blue-600" />
                    <span>Email</span>
                  </a>

                  <a
                    href={`https://wa.me/${activeLeadDetails.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 text-slate-700 hover:text-emerald-700 bg-white p-2 rounded-lg border border-slate-200 font-semibold"
                  >
                    <MessageSquare size={13} className="text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>

                  {/* Toggle Call Logger Button */}
                  <button
                    type="button"
                    onClick={() => setShowCallLogForm((prev) => !prev)}
                    className="col-span-1 sm:col-span-3 mt-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all cursor-pointer shadow-2xs"
                  >
                    <PhoneOutgoing size={13} className="text-emerald-700" />
                    <span>{showCallLogForm ? 'Close Call Logger' : '+ Record Call Feedback / Outcome'}</span>
                  </button>
                </div>

                {/* Expandable Call Logger Form */}
                {showCallLogForm && (
                  <form onSubmit={handleSaveDrawerCall} className="mt-3 p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between pb-1.5 border-b border-emerald-200/60">
                      <span className="text-[11px] font-black text-emerald-950 flex items-center gap-1.5">
                        <PhoneOutgoing size={12} className="text-emerald-700" /> Log Call with {activeLeadDetails.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowCallLogForm(false)}
                        className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Call Type</label>
                        <select
                          value={callLogForm.callType}
                          onChange={(e) => setCallLogForm({ ...callLogForm, callType: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-semibold focus:outline-none"
                        >
                          <option value="Discovery Call">Discovery Call</option>
                          <option value="Demo Scheduled">Product Demo</option>
                          <option value="Negotiation Call">Negotiation Call</option>
                          <option value="Follow-up Call">Follow-up Call</option>
                          <option value="Contract Review">Contract Review</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Duration</label>
                        <select
                          value={callLogForm.duration}
                          onChange={(e) => setCallLogForm({ ...callLogForm, duration: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-semibold focus:outline-none"
                        >
                          <option value="5 mins">5 mins</option>
                          <option value="10 mins">10 mins</option>
                          <option value="15 mins">15 mins</option>
                          <option value="25 mins">25 mins</option>
                          <option value="45 mins">45 mins</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Call Outcome</label>
                        <select
                          value={callLogForm.outcome}
                          onChange={(e) => setCallLogForm({ ...callLogForm, outcome: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-semibold focus:outline-none"
                        >
                          <option value="Demo Scheduled">Demo Scheduled (Positive)</option>
                          <option value="Contract Sent">Contract Sent (Positive)</option>
                          <option value="Follow-up Required">Follow-up Required</option>
                          <option value="Pricing Objection">Pricing Objection (Action Needed)</option>
                          <option value="Closed Won">Closed Won</option>
                          <option value="Not Interested">Not Interested / Closed</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Next Follow-up</label>
                        <input
                          type="text"
                          placeholder="Tomorrow, 02:00 PM"
                          value={callLogForm.nextFollowUp}
                          onChange={(e) => setCallLogForm({ ...callLogForm, nextFollowUp: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Discussion Takeaways & Feedback</label>
                      <textarea
                        rows={2}
                        placeholder="Key conversation points, objections, or commitments discussed..."
                        value={callLogForm.notes}
                        onChange={(e) => setCallLogForm({ ...callLogForm, notes: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowCallLogForm(false)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingCall || !callLogForm.notes.trim()}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <Check size={12} />
                        <span>{isSubmittingCall ? 'Saving...' : 'Save Call Log'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Owner (Assigned Sales Rep) */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Lead Owner & Closer
                </span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-full ${activeLeadDetails.repColor} text-white font-bold flex items-center justify-center text-xs shrink-0`}>
                      {activeLeadDetails.repAvatar}
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900">{activeLeadDetails.assignedRep}</h5>
                      <p className="text-[11px] text-slate-400">Assigned Account Executive</p>
                    </div>
                  </div>

                  {/* Reassign dropdown */}
                  <select
                    value={activeLeadDetails.assignedRep}
                    onChange={(e) => onOwnerChange(activeLeadDetails.id, e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 cursor-pointer"
                  >
                    {salesReps.map((r) => (
                      <option key={r.name} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Deal Value, Stage & Priority Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Estimated Value</span>
                  <span className="text-lg font-extrabold text-emerald-900 mt-1 block">
                    ₹{activeLeadDetails.value.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Pipeline Stage</span>
                  <select
                    value={activeLeadDetails.status}
                    onChange={(e) => onStatusChange(activeLeadDetails.id, e.target.value)}
                    className={`w-full text-xs font-bold px-2 py-1.5 rounded-lg border cursor-pointer ${getDynamicBadge(activeLeadDetails.status)}`}
                  >
                    {stageOptions.map((st) => (
                      <option key={st} value={st} className="bg-white text-slate-800 font-medium">
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Priority</span>
                  <select
                    value={activeLeadDetails.priority || 'Medium'}
                    onChange={(e) => onPriorityChange && onPriorityChange(activeLeadDetails.id, e.target.value)}
                    className={`w-full text-xs font-bold px-2 py-1.5 rounded-lg border cursor-pointer ${getPriorityBadge(activeLeadDetails.priority)}`}
                  >
                    {['Urgent', 'High', 'Medium', 'Low'].map((p) => (
                      <option key={p} value={p} className="bg-white text-slate-800 font-medium">
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Lead AI Intent & Score */}
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-500" /> Lead Engagement Score
                  </span>
                  <span className="font-extrabold text-emerald-700 text-sm">
                    {activeLeadDetails.score}/100 ({activeLeadDetails.scoreGrade})
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 rounded-full"
                    style={{ width: `${activeLeadDetails.score}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Calculated from email response rates, decision-maker hierarchy, and company budget qualification.
                </p>
              </div>

              {/* Context Notes & Quick Note Logger */}
              <div>
                <span className="text-xs font-bold text-slate-900 block mb-1.5">Context & Qualification Notes</span>
                <p className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-slate-700 text-xs leading-relaxed mb-3">
                  {activeLeadDetails.notes}
                </p>

                {/* Quick Add Note Form */}
                <form onSubmit={onAddNote} className="space-y-2">
                  <textarea
                    rows={2}
                    placeholder="Log a new call note, conversation takeaway or requirement..."
                    value={newNoteInput}
                    onChange={(e) => setNewNoteInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!newNoteInput.trim()}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-lg font-bold text-xs cursor-pointer"
                  >
                    + Log Note
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: ACTIVITY TIMELINE */}
          {drawerTab === 'timeline' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900">Lead Activity Log & Audit Trail</span>
                <span className="text-[11px] text-slate-400">Chronological History</span>
              </div>

              <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                {(activeLeadDetails.timeline || []).map((item, idx) => (
                  <div key={item._id || idx} className="relative flex items-start gap-3.5 pl-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] shrink-0 z-10 shadow-xs">
                      {item.type === 'call' ? (
                        <Phone size={11} />
                      ) : item.type === 'email' ? (
                        <Mail size={11} />
                      ) : item.type === 'stage' ? (
                        <ArrowRight size={11} />
                      ) : (
                        <CheckCircle2 size={11} />
                      )}
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{item.title}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{item.time}</span>
                      </div>
                      <p className="text-slate-600 text-xs">{item.note}</p>
                      <span className="text-[10px] font-semibold text-emerald-700 block">Logged by: {item.author}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={() => onDeleteLead(activeLeadDetails.id, activeLeadDetails.company)}
            className="px-3.5 py-2 text-rose-600 hover:bg-rose-100 rounded-xl font-bold text-xs transition-colors cursor-pointer"
          >
            Delete Lead
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onStatusChange(activeLeadDetails.id, 'Won')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl font-bold text-xs transition-colors cursor-pointer"
            >
              <Trophy size={14} className="text-emerald-700 shrink-0" />
              <span>Mark Deal Won</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
