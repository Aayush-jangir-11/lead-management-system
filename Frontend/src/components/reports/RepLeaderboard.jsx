import React from 'react';
import { Award, Trophy, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { SALES_REP_LEADERBOARD } from './ReportsData';

export default function RepLeaderboard({ selectedRep }) {
  const displayedReps =
    selectedRep && selectedRep !== 'All Reps'
      ? SALES_REP_LEADERBOARD.filter((r) => r.name === selectedRep)
      : SALES_REP_LEADERBOARD;

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-200/80 hover:border-emerald-300 transition-all p-5 sm:p-6 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-50 text-amber-700 font-bold">
              <Trophy size={13} />
            </span>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              Sales Rep Performance Leaderboard
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Ranked by quarterly closed-won revenue, quota attainment, and sales velocity
          </p>
        </div>

        <span className="text-[11px] font-extrabold text-slate-500">
          Showing {displayedReps.length} Reps
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200/70">
              <th className="py-2.5 px-3">Rank & Sales Rep</th>
              <th className="py-2.5 px-3">Quota Attainment</th>
              <th className="py-2.5 px-3 text-center">Deals Won</th>
              <th className="py-2.5 px-3 text-right">Won Revenue</th>
              <th className="py-2.5 px-3 text-center">Avg. Cycle</th>
              <th className="py-2.5 px-3 text-center">Win Rate</th>
              <th className="py-2.5 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {displayedReps.map((rep, idx) => {
              return (
                <tr key={rep.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Rank & Rep Avatar */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 text-center font-black text-xs text-slate-400">
                        #{idx + 1}
                      </span>
                      <div
                        className={`w-7 h-7 rounded-lg ${rep.color} text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs`}
                      >
                        {rep.avatar}
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 block leading-tight">
                          {rep.name}
                        </span>
                        <span className="text-[10px] text-slate-400">{rep.role}</span>
                      </div>
                    </div>
                  </td>

                  {/* Quota Progress */}
                  <td className="py-3 px-3 min-w-[140px]">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-700">{rep.quotaAttainment}%</span>
                        <span className="text-slate-400 font-normal">
                          ₹{(rep.quotaTarget / 100000).toFixed(0)}L goal
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            rep.quotaAttainment >= 90
                              ? 'bg-emerald-500'
                              : rep.quotaAttainment >= 75
                              ? 'bg-blue-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(rep.quotaAttainment, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Deals Won */}
                  <td className="py-3 px-3 text-center font-extrabold text-slate-800">
                    {rep.wonDealsCount}
                  </td>

                  {/* Won Revenue */}
                  <td className="py-3 px-3 text-right font-black text-slate-900">
                    ₹{(rep.wonRevenue / 100000).toFixed(2)} Lakh
                  </td>

                  {/* Avg Cycle */}
                  <td className="py-3 px-3 text-center text-slate-600 font-bold">
                    {rep.avgCycleDays} days
                  </td>

                  {/* Win Rate */}
                  <td className="py-3 px-3 text-center">
                    <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {rep.winRate}%
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border whitespace-nowrap ${rep.badgeColor}`}
                    >
                      {rep.badge}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
