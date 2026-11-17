import React from 'react';
import {
  Building2, X, Phone, Mail, MessageSquare, Calendar,
  Flame, Award, ArrowRight, Check, Trash2, ExternalLink, Trophy,
  ClipboardList, Bell
} from 'lucide-react';
import { SALES_REPS } from '../../pages/sales/Pipeline';

export default function DealDetailsDrawer({
  activeDeal,
  stages = [],
  salesReps = SALES_REPS,
  onClose,
  onMoveDealStage,
  onUpdateDeal,
  onDeleteDeal,
}) {
  if (!activeDeal) return null;

  const currentStageIndex = stages.findIndex((s) => s.id === activeDeal.stage);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200 cursor-default"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                <Building2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">{activeDeal.company}</h3>
                <span className="text-xs text-slate-500 font-medium">
                  {activeDeal.contactName} • Target: {activeDeal.targetClose}
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

          {/* Stepper Pipeline Stage Progress Bar */}
          <div className="mt-4 pt-3 border-t border-slate-200/70">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
              Pipeline Stage Progression (Click to Move)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {stages.map((stg, idx) => {
                const isPassedOrCurrent = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;

                return (
                  <button
                    key={stg.id}
                    onClick={() => onMoveDealStage(activeDeal.id, stg.id)}
                    className={`flex-1 min-w-[70px] p-1.5 rounded-lg text-center transition-all cursor-pointer ${isCurrent
                      ? 'bg-emerald-600 text-white font-extrabold shadow-2xs ring-2 ring-emerald-500/30'
                      : isPassedOrCurrent
                        ? 'bg-emerald-100 text-emerald-800 font-bold'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                    title={`Click to shift deal to ${stg.name}`}
                  >
                    <span className="text-[10px] block truncate">{idx + 1}. {stg.name.split(' ')[0]}</span>
                    <span className="text-[9px] block opacity-80">{stg.probability}%</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Deal Value</span>
              <span className="text-xl font-extrabold text-emerald-900 mt-1 block">
                ₹{activeDeal.value.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Assigned Closer</span>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-6 h-6 rounded-full ${activeDeal.repColor} text-white font-bold text-[10px] flex items-center justify-center`}>
                  {activeDeal.repAvatar}
                </div>
                <select
                  value={activeDeal.rep}
                  onChange={(e) => {
                    const repObj = SALES_REPS.find((r) => r.name === e.target.value);
                    if (repObj) {
                      onUpdateDeal(activeDeal.id, {
                        rep: repObj.name,
                        repAvatar: repObj.avatar,
                        repColor: repObj.color,
                      });
                    }
                  }}
                  className="bg-transparent font-bold text-slate-800 text-xs focus:outline-none cursor-pointer"
                >
                  {salesReps.map((r) => (
                    <option key={r.name} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Contact Person Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
              Primary Client Contact
            </span>
            <h4 className="text-sm font-bold text-slate-900">{activeDeal.contact}</h4>
            <p className="text-[11px] text-slate-500 mb-3">{activeDeal.company}</p>

            {/* Communication buttons */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200">
              <a
                href={`tel:${activeDeal.phone}`}
                className="flex items-center justify-center gap-1.5 bg-white p-2 rounded-lg border border-slate-200 text-slate-700 hover:text-emerald-700 font-semibold text-xs"
              >
                <Phone size={13} className="text-emerald-600" />
                <span>Call</span>
              </a>

              <a
                href={`mailto:${activeDeal.email}`}
                className="flex items-center justify-center gap-1.5 bg-white p-2 rounded-lg border border-slate-200 text-slate-700 hover:text-blue-700 font-semibold text-xs"
              >
                <Mail size={13} className="text-blue-600" />
                <span>Email</span>
              </a>

              <a
                href={`https://wa.me/${(activeDeal.phone || '').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 bg-white p-2 rounded-lg border border-slate-200 text-slate-700 hover:text-emerald-700 font-semibold text-xs"
              >
                <MessageSquare size={13} className="text-emerald-600" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Stage Collected Dynamic Information (Job-form sections) */}
          {activeDeal.stageSections?.[activeDeal.stage]?.length > 0 && (
            <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList size={14} className="text-emerald-700" />
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">
                    Stage Information ({activeDeal.stageSections[activeDeal.stage].length} Sections Recorded)
                  </h4>
                </div>
              </div>

              <div className="space-y-2">
                {activeDeal.stageSections[activeDeal.stage].map((sec, i) => (
                  <div key={sec.id || i} className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs space-y-1">
                    <span className="text-[11px] font-black text-slate-800 block">
                      {sec.title || `Section #${i + 1}`}
                    </span>
                    <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {sec.content || <em className="text-slate-400">No notes recorded yet.</em>}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Win Score & Probability */}
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Flame size={14} className="text-amber-500" /> Deal Health & Closing Probability
              </span>
              <span className="font-extrabold text-emerald-700 text-xs">
                {activeDeal.score}% Win Score
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
              <div
                className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 rounded-full"
                style={{ width: `${activeDeal.score}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Estimated stage closing probability is {PIPELINE_STAGES[currentStageIndex]?.probability || 0}%.
            </p>
          </div>

          {/* Deal Notes */}
          <div>
            <span className="text-xs font-bold text-slate-900 block mb-1.5">Deal Context & Requirements</span>
            <p className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-slate-700 text-xs leading-relaxed">
              "{activeDeal.notes}"
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={() => onDeleteDeal(activeDeal.id, activeDeal.company)}
            className="px-3.5 py-2 text-rose-600 hover:bg-rose-100 rounded-xl font-bold text-xs transition-colors cursor-pointer"
          >
            Delete Deal
          </button>

          <div className="flex items-center gap-2">
            {activeDeal.stage !== 'won' && (
              <button
                onClick={() => onMoveDealStage(activeDeal.id, 'won')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                <Trophy size={13} className="text-emerald-700" />
                <span>Mark Won</span>
              </button>
            )}
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
