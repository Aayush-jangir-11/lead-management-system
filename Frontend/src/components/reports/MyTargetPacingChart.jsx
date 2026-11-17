import React, { useState } from 'react';
import {
  TrendingUp, Calendar, Target, Award, Sparkles, CheckCircle2,
  ArrowUpRight, Zap, Info, ShieldCheck
} from 'lucide-react';

export default function MyTargetPacingChart({ monthlyData = [] }) {
  const [hoveredMonth, setHoveredMonth] = useState(null);

  // Maximum scale value for chart height normalization
  const maxTarget = 32.0;

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-200/80 hover:border-emerald-300 transition-all p-5 sm:p-6 shadow-2xs space-y-4 h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100/80 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <TrendingUp size={16} />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Monthly Target vs Achieved Revenue Pacing
              </h3>
              <p className="text-xs text-slate-500">
                Track monthly quota consistency and sales velocity over the last 6 months.
              </p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-bold text-slate-700 bg-emerald-50/60 px-3 py-1.5 rounded-xl border border-emerald-200/70">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-emerald-600 to-teal-400 shadow-2xs" />
            <span>Achieved (₹ Lakh)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-300 border border-slate-400" />
            <span>Target Quota (₹ Lakh)</span>
          </div>
        </div>
      </div>

      {/* Main Chart Graphic Area */}
      <div className="pt-2">
        <div className="h-60 flex items-end justify-between gap-2 sm:gap-6 px-2 sm:px-6 border-b border-slate-200/80 pb-2 relative">
          {/* Background horizontal benchmark guide lines */}
          <div className="absolute inset-x-0 top-0 border-b border-dashed border-slate-200/70 pointer-events-none" />
          <div className="absolute inset-x-0 top-1/4 border-b border-dashed border-slate-200/70 pointer-events-none" />
          <div className="absolute inset-x-0 top-2/4 border-b border-dashed border-slate-200/70 pointer-events-none" />
          <div className="absolute inset-x-0 top-3/4 border-b border-dashed border-slate-200/70 pointer-events-none" />

          {monthlyData.map((m, idx) => {
            const achievedHeight = Math.round((m.achieved / maxTarget) * 100);
            const targetHeight = Math.round((m.target / maxTarget) * 100);
            const isPassed = m.achieved >= m.target;
            const isHovered = hoveredMonth === m.month;

            return (
              <div
                key={m.month}
                className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
                onMouseEnter={() => setHoveredMonth(m.month)}
                onMouseLeave={() => setHoveredMonth(null)}
              >
                {/* Tooltip on hover */}
                {isHovered && (
                  <div className="absolute -top-16 z-30 bg-slate-900 text-white text-[11px] font-semibold py-1.5 px-3 rounded-xl shadow-xl border border-slate-700 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                    <div className="font-extrabold text-emerald-400 flex items-center justify-between gap-2">
                      <span>{m.month} FY26</span>
                      <span>{m.percentage}%</span>
                    </div>
                    <div>Won: ₹{m.achieved}L • Target: ₹{m.target}L</div>
                    <div className="text-[10px] text-slate-400">{m.deals} Deals Closed</div>
                  </div>
                )}

                {/* Bars Container */}
                <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full">
                  {/* Target Bar */}
                  <div
                    className="w-1/2 max-w-[28px] bg-slate-200 rounded-t-lg transition-all duration-300 group-hover:bg-slate-300 relative"
                    style={{ height: `${targetHeight}%` }}
                    title={`Target: ₹${m.target}L`}
                  />

                  {/* Achieved Bar */}
                  <div
                    className={`w-1/2 max-w-[28px] rounded-t-lg transition-all duration-500 shadow-md relative ${m.isCurrent
                        ? 'bg-gradient-to-t from-emerald-600 via-emerald-500 to-teal-400 ring-2 ring-emerald-300'
                        : isPassed
                          ? 'bg-gradient-to-t from-emerald-600 to-teal-500'
                          : 'bg-gradient-to-t from-amber-500 to-amber-400'
                      }`}
                    style={{ height: `${achievedHeight}%` }}
                  >
                    {/* Live indicator on current month */}
                    {m.isCurrent && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white animate-ping" />
                    )}
                  </div>
                </div>

                {/* X-Axis Month Label */}
                <div className="mt-3 text-center">
                  <span
                    className={`text-xs block ${m.isCurrent
                        ? 'font-black text-emerald-700'
                        : 'font-bold text-slate-600'
                      }`}
                  >
                    {m.month}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold block ${isPassed ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                  >
                    {m.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Attainment Milestone Badges Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2">
        <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/70 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-extrabold text-emerald-950">Bronze Level</span>
            <CheckCircle2 size={13} className="text-emerald-600" />
          </div>
          <p className="text-[11px] text-emerald-800 font-medium">80% Quota Attained (Base 3% Commission)</p>
        </div>

        <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-300 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-extrabold text-emerald-950">Silver Target</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-emerald-600 text-white">95% Active</span>
          </div>
          <p className="text-[11px] text-emerald-800 font-medium">100% Quota Target (6% Accelerated Tier)</p>
        </div>

        <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/70 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-extrabold text-amber-950">Gold Milestone</span>
            <span className="text-[10px] font-extrabold text-amber-800">Next Unlock</span>
          </div>
          <p className="text-[11px] text-amber-800 font-medium">120% Quota Overachievement (+₹45k Bonus)</p>
        </div>

        <div className="p-2.5 rounded-xl bg-purple-50/80 border border-purple-200/70 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-extrabold text-purple-950">President's Club</span>
            <Award size={13} className="text-purple-600" />
          </div>
          <p className="text-[11px] text-purple-800 font-medium">Top Performer Annual Executive Retreat</p>
        </div>
      </div>
    </div>
  );
}
