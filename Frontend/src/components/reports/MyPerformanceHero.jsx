import React from 'react';
import {
  Target, Award, TrendingUp, ArrowUpRight, IndianRupee
} from 'lucide-react';

export default function MyPerformanceHero({ data }) {
  if (!data) return null;

  const attainment = data.quotaAttainment || 95.0;
  const targetLakh = (data.quotaTarget / 100000).toFixed(1);
  const wonLakh = (data.wonRevenue / 100000).toFixed(1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Quota Attainment */}
      <div className="group relative overflow-hidden bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-emerald-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all hover:-translate-y-0.5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Personal Quota Attainment
          </span>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Target size={16} />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {attainment}%
            </h3>
            <span className="text-xs font-bold text-emerald-700">Attained</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-500 flex items-center gap-1">
              <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">
                ₹{wonLakh}L
              </span>
              of ₹{targetLakh}L
            </span>
            <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
              <ArrowUpRight size={11} className="mr-0.5" /> On Track
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full w-[95%]" />
          </div>
        </div>
      </div>

      {/* KPI 2: Deals Closed & Avg Size */}
      <div className="group relative overflow-hidden bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-purple-200/80 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all hover:-translate-y-0.5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Deals Won & Avg Size
          </span>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Award size={16} />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {data.wonDealsCount} Closed
            </h3>
            <span className="text-xs font-bold text-purple-700">Deals</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-500 flex items-center gap-1">
              <span className="font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-md border border-purple-100">
                ₹{(data.avgDealSize / 100000).toFixed(2)}L
              </span>
              avg size
            </span>
            <span className="inline-flex items-center text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
              Enterprise Tier
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full w-[78%]" />
          </div>
        </div>
      </div>

      {/* KPI 3: Win Rate vs Benchmark */}
      <div className="group relative overflow-hidden bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-teal-200/80 shadow-2xs hover:shadow-md hover:border-teal-300 transition-all hover:-translate-y-0.5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Personal Win Rate
          </span>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
            <TrendingUp size={16} />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {data.winRate}%
            </h3>
            <span className="text-xs font-bold text-teal-700">Win Rate</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-500 flex items-center gap-1">
              <span className="font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-md border border-teal-100">
                {data.avgCycleDays} Days
              </span>
              cycle
            </span>
            <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
              +9.1% vs Team
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full w-[86%]" />
          </div>
        </div>
      </div>

      {/* KPI 4: Commission & Incentive */}
      <div className="group relative overflow-hidden bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-amber-200/80 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all hover:-translate-y-0.5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Incentive / Commission
          </span>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold shadow-xs">
            <IndianRupee size={16} />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              ₹{(data.commissionEarned / 1000).toFixed(0)}k
            </h3>
            <span className="text-xs font-bold text-amber-700">Earned</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-500 flex items-center gap-1">
              <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100">
                Rate: {data.commissionRateCurrent}
              </span>
            </span>
            <span className="inline-flex items-center text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
              Tier 2 Active
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full w-[91%]" />
          </div>
        </div>
      </div>
    </div>
  );
}


