import React from 'react';
import { Link } from 'react-router';
import {
  Flame, Target, ArrowRight, CheckCircle2, Clock, Calendar,
  Building2, User, Sparkles, TrendingUp, DollarSign
} from 'lucide-react';

export default function MyClosingPipeline({ deals = [], gapToQuota = 150000 }) {
  const gapLakh = (gapToQuota / 100000).toFixed(1);

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-200/80 hover:border-emerald-300 transition-all p-5 sm:p-6 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100/80 pb-3.5">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
            <Flame size={16} />
          </span>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Hot Closing Opportunities to Smash Quota
            </h3>
            <p className="text-xs text-slate-500">
              High-probability deals expected to close this month to bridge the ₹{gapLakh} Lakh remaining gap.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1.5">
            <Sparkles size={12} className="text-amber-500" />
            <span>₹10.5L Total Pipeline Value in Final Stages</span>
          </span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {deals.map((deal) => {
          const valueLakh = (deal.value / 100000).toFixed(1);

          return (
            <div
              key={deal.id}
              className="bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between relative overflow-hidden group"
            >
              {/* Top Row: Company & Value */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Building2 size={14} className="text-emerald-600 shrink-0" />
                    <span className="font-extrabold text-slate-900 text-xs truncate max-w-[150px]">
                      {deal.company}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 font-black text-xs shrink-0">
                    ₹{valueLakh} Lakh
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-600 mb-2">
                  <User size={12} className="text-slate-400" />
                  <span className="truncate">{deal.contact}</span>
                </div>

                {/* Stage & Probability */}
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-2 pt-2 border-t border-slate-200/70">
                  <span className="truncate max-w-[130px]">{deal.stage}</span>
                  <span className="text-emerald-700 font-extrabold">{deal.probability}% Win Prob</span>
                </div>

                {/* Probability Bar */}
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                    style={{ width: `${deal.probability}%` }}
                  />
                </div>

                {/* Next Action Box */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-[11px] text-slate-700 space-y-1 mb-2">
                  <span className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400 block">
                    Immediate Action
                  </span>
                  <p className="font-semibold text-slate-800 line-clamp-2">
                    {deal.nextAction}
                  </p>
                </div>
              </div>

              {/* Footer: Close Date & Quota Impact */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="flex items-center gap-1 font-semibold">
                    <Calendar size={11} className="text-slate-400" />
                    <span>Target: {deal.closingDate}</span>
                  </span>
                </div>
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-extrabold text-[10px] text-center border border-emerald-200">
                  {deal.impact}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Strategic Recommendation Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <CheckCircle2 size={16} />
          </div>
          <div>
            <span className="font-black text-slate-900 block text-xs">
              AI Quota Strategy Recommendation:
            </span>
            <span className="text-slate-600 text-[11px]">
              Closing either <strong>CloudNova Systems</strong> or <strong>Nexus FinTech</strong> guarantees full 100% quota attainment and unlocks the <strong>₹45,000 Super-Accelerator Incentive</strong>.
            </span>
          </div>
        </div>

        <Link
          to="/pipeline"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-2xs transition-all shrink-0 cursor-pointer"
        >
          <span>Open Sales Pipeline</span>
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
