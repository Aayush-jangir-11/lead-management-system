import React from 'react';
import { Layers, Target, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function MyLeadConversionFunnel({ personalFunnel = [] }) {
  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-200/80 hover:border-emerald-300 transition-all p-5 sm:p-6 shadow-2xs space-y-4 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-emerald-100/80 pb-3.5">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Layers size={16} />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                My Lead Conversion Funnel
              </h3>
              <p className="text-xs text-slate-500">
                Stage-by-stage progression from assigned lead to closed won deal.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
            38.5% Win Rate
          </span>
        </div>

        {/* Funnel Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-3">
          {personalFunnel.map((item, index) => {
            const widthPercentage = 100 - index * 14;

            return (
              <div
                key={item.stage}
                className="group p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-100/90 border border-slate-200/70 transition-all duration-200"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="font-extrabold text-slate-800">
                      {item.stage}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-500 text-[11px]">{item.value}</span>
                    <span className="px-2 py-0.5 rounded-md font-black text-[11px] bg-white border border-slate-200 text-slate-900 shadow-2xs">
                      {item.count} Deals
                    </span>
                  </div>
                </div>

                {/* Progress Visual Bar */}
                <div className="h-2 bg-slate-200/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${widthPercentage}%` }}
                  />
                </div>

                {/* Micro Metric */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 font-semibold">
                  <span>Conversion to next: <strong className="text-emerald-700">{item.conversionRate}</strong></span>
                  {index > 0 && (
                    <span className="text-slate-400">Drop-off: {item.drop}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Funnel Summary Footer */}
      <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between text-xs mt-3">
        <span className="text-[11px] text-slate-600 font-semibold">
          Lead to Won Velocity: <strong className="text-slate-900">13 Days Avg</strong>
        </span>
        <span className="font-extrabold text-emerald-700 text-[11px]">
          +9.1% Higher Than Team Avg
        </span>
      </div>
    </div>
  );
}
