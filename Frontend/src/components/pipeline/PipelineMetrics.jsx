import React from 'react';
import { Target, TrendingUp, Trophy, BarChart3, IndianRupee, Sparkles, CheckCircle2 } from 'lucide-react';

export default function PipelineMetrics({
  totalPipelineValue = 0,
  weightedForecastValue = 0,
  activeDealsCount = 0,
  avgDealSize = 0,
  wonDealsValue = 0,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Active Pipeline */}
      <div className="group relative overflow-hidden bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-emerald-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all hover:-translate-y-0.5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Pipeline Value
          </span>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black shadow-xs">
            <IndianRupee size={16} />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              ₹{(totalPipelineValue / 100000).toFixed(2)}
            </h3>
            <span className="text-xs font-bold text-emerald-700">Lakh</span>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-500 flex items-center gap-1">
              <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">
                {activeDealsCount} Deals
              </span>
              active in funnel
            </span>
            <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
              <TrendingUp size={10} className="mr-0.5" /> +18.4%
            </span>
          </div>

          {/* Micro Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full w-[78%]" />
          </div>
        </div>
      </div>

      {/* 2. Weighted Forecast */}
      <div className="group relative overflow-hidden bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-blue-200/80 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all hover:-translate-y-0.5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Weighted Forecast
          </span>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Target size={16} />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-2xl font-black text-blue-900 tracking-tight">
              ₹{(weightedForecastValue / 100000).toFixed(2)}
            </h3>
            <span className="text-xs font-bold text-blue-700">Lakh</span>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-500">Probability adjusted</span>
            <span className="inline-flex items-center text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
              High Conf. 72%
            </span>
          </div>

          {/* Micro Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full w-[65%]" />
          </div>
        </div>
      </div>

      {/* 3. Average Deal Size */}
      <div className="group relative overflow-hidden bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-purple-200/80 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all hover:-translate-y-0.5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Avg Deal Ticket Size
          </span>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white flex items-center justify-center font-bold shadow-xs">
            <BarChart3 size={16} />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              ₹{Math.round(avgDealSize).toLocaleString('en-IN')}
            </h3>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-500">Per qualified client</span>
            <span className="inline-flex items-center text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-100">
              Enterprise Tier
            </span>
          </div>

          {/* Micro Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-violet-500 h-full rounded-full w-[82%]" />
          </div>
        </div>
      </div>

      {/* 4. Closed Won Value */}
      <div className="group relative overflow-hidden bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-emerald-300/80 shadow-2xs hover:shadow-md hover:border-emerald-400 transition-all hover:-translate-y-0.5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Closed Won Realized
          </span>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold shadow-xs">
            <Trophy size={16} />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-2xl font-black text-emerald-800 tracking-tight">
              ₹{(wonDealsValue / 100000).toFixed(2)}
            </h3>
            <span className="text-xs font-bold text-emerald-700">Lakh</span>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-500">Executed contracts</span>
            <span className="inline-flex items-center text-[10px] font-extrabold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 size={11} className="mr-1 text-emerald-700" /> 100% Realized
            </span>
          </div>

          {/* Micro Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 h-full rounded-full w-[94%]" />
          </div>
        </div>
      </div>
    </div>
  );
}
