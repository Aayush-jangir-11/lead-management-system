import React, { useState, useEffect } from 'react';
import {
  X, Phone, Mail, MessageSquare, Building2, User, Calendar,
  Clock, CheckCircle2, AlertCircle, PhoneCall, History,
  ExternalLink, Shield, ArrowUpRight, Award, ChevronRight,
  Layers, FileText
} from 'lucide-react';

export default function ContactDetailsDrawer({
  contact,
  initialTab = 'history', // 'history' | 'overview'
  onClose,
  onOpenLogModal,
}) {
  if (!contact) return null;

  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync active tab whenever initialTab or contact changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, contact]);

  const getOutcomeBadge = (outcome, status) => {
    switch (status) {
      case 'positive':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'closed':
        return 'bg-green-100 text-green-950 border-green-400 font-extrabold';
      case 'needs_action':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      case 'pending':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200 cursor-pointer pt-16 sm:pt-18"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-250 cursor-default"
      >
        {/* 1. Drawer Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/90 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
              {contact.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 truncate">
                  {contact.name}
                </h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                  {contact.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                {contact.title}
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mt-0.5 truncate">
                <Building2 size={13} className="text-slate-400 shrink-0" />
                <span className="truncate">{contact.company}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0"
            title="Close Drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* 2. Navigation Tab Bar */}
        <div className="px-5 py-2.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white text-slate-900 shadow-2xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History size={13} className={activeTab === 'history' ? 'text-emerald-600' : 'text-slate-400'} />
              <span>Call History ({contact.callHistory?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-white text-slate-900 shadow-2xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers size={13} className={activeTab === 'overview' ? 'text-emerald-600' : 'text-slate-400'} />
              <span>Account Overview</span>
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenLogModal(contact);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs hover:shadow-sm transition-all cursor-pointer shrink-0"
          >
            <PhoneCall size={12} />
            <span>+ Log Call</span>
          </button>
        </div>

        {/* 3. Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* TAB 1: HISTORY ONLY VIEW */}
          {activeTab === 'history' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* History Top Summary Strip */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                    <History size={16} />
                  </div>
                  <div>
                    <span className="font-black text-slate-900 block text-xs">
                      Complete Discussion History Timeline
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {contact.totalCalls} total calls logged with {contact.name}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Next Action</span>
                  <span className="text-xs font-bold text-emerald-800">{contact.nextFollowUp}</span>
                </div>
              </div>

              {/* Connected Vertical Timeline */}
              {!contact.callHistory || contact.callHistory.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-400">
                  No call logs recorded yet for this client account. Click <strong>+ Log Call</strong> to add the first discussion note.
                </div>
              ) : (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-emerald-200">
                  {contact.callHistory.map((call, idx) => (
                    <div key={call.id || idx} className="relative group">
                      {/* Milestone Bullet */}
                      <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-white border-2 border-emerald-600 flex items-center justify-center shadow-2xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      </div>

                      {/* Card Content */}
                      <div className="p-4 rounded-2xl bg-slate-50/90 hover:bg-slate-50 border border-slate-200/80 transition-colors space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-xs text-slate-900">{call.type}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                              ⏱️ {call.duration}
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-slate-400">
                            {call.date}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-100/80 text-emerald-900 text-[11px] font-bold">
                            <User size={11} />
                            Closer: {call.rep}
                          </span>

                          {call.outcome && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black border ${getOutcomeBadge(call.outcome, 'positive')}`}>
                              Result: {call.outcome}
                            </span>
                          )}
                        </div>

                        {call.notes && (
                          <div className="p-3 rounded-xl bg-white border border-slate-200/70 text-xs text-slate-700 italic font-medium leading-relaxed">
                            "{call.notes}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: OVERVIEW & PROFILE VIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Quick Action Contacts Bar */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${contact.phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-bold transition-colors"
                  >
                    <Phone size={13} className="text-emerald-600" />
                    <span>Call</span>
                  </a>
                  <a
                    href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-bold transition-colors"
                  >
                    <MessageSquare size={13} className="text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`mailto:${contact.email}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-bold transition-colors"
                  >
                    <Mail size={13} className="text-emerald-600" />
                    <span>Email</span>
                  </a>
                </div>

                <span className="text-[11px] font-bold text-slate-400">Direct Actions</span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Total Calls
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-lg font-black text-slate-900">{contact.totalCalls}</span>
                    <span className="text-[10px] font-bold text-emerald-600">Logged</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Last Call
                  </span>
                  <span className="text-xs font-black text-slate-800 block mt-1 truncate">
                    {contact.lastCallDuration}
                  </span>
                  <span className="text-[9px] text-slate-400 block truncate font-medium">
                    {contact.lastCallDate}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Assigned Closer
                  </span>
                  <span className="text-xs font-black text-slate-800 block mt-1 truncate">
                    {contact.assignedRep}
                  </span>
                  <span className="text-[9px] text-slate-400 block truncate font-medium">
                    Sales Rep
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Next Follow-up
                  </span>
                  <span className="text-xs font-black text-emerald-800 block mt-1 truncate">
                    {contact.nextFollowUp}
                  </span>
                  <span className="text-[9px] text-slate-400 block truncate font-medium">
                    Scheduled
                  </span>
                </div>
              </div>

              {/* Contact Details Card */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <User size={13} className="text-slate-400" />
                  Account & Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Email Address</span>
                    <span className="font-bold text-slate-800 break-all">{contact.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Direct Phone</span>
                    <span className="font-bold text-slate-800">{contact.phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Enterprise Company</span>
                    <span className="font-bold text-slate-800">{contact.company}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Job Title / Role</span>
                    <span className="font-bold text-slate-800">{contact.title}</span>
                  </div>
                </div>
              </div>

              {/* Latest Call Outcome & Sales Notes */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900">
                    Latest Call Intelligence & Outcome
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getOutcomeBadge(contact.lastCallOutcome, contact.outcomeStatus)}`}>
                    {contact.outcomeStatus === 'positive' || contact.outcomeStatus === 'closed' ? (
                      <CheckCircle2 size={11} className="shrink-0" />
                    ) : (
                      <AlertCircle size={11} className="shrink-0" />
                    )}
                    <span>{contact.lastCallOutcome}</span>
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                  <span>Type: <strong className="text-slate-800">{contact.lastCallType}</strong></span>
                  <span>•</span>
                  <span>Duration: <strong className="text-slate-800">{contact.lastCallDuration}</strong></span>
                  <span>•</span>
                  <span>Date: <strong className="text-slate-800">{contact.lastCallDate}</strong></span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-emerald-100 text-xs text-slate-700 italic font-medium leading-relaxed">
                  "{contact.lastCallFeedback}"
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400">
            Account ID: {contact.id}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
}
