import React from 'react';
import {
  Layers, PhoneCall, Calendar, Send, Clock, ShieldCheck,
  CheckCircle2, ArrowRight, Zap, Target, Award, Sparkles
} from 'lucide-react';

export default function MyFunnelAndActivity({ personalFunnel = [], activityScorecard = {} }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      {/* 1. Left: Personal Deal Conversion Funnel */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
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

        {/* Funnel Steps */}
        <div className="space-y-2.5">
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

      {/* 2. Right: Activity & Productivity Scorecard */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 p-5 shadow-2xs space-y-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <Zap size={16} />
              </span>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  My Activity & SLA Scorecard
                </h3>
                <p className="text-xs text-slate-500">
                  Daily cadence, follow-up speed, and client outreach velocity.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
              {activityScorecard.slaAdherence}% SLA Adherence
            </span>
          </div>

          {/* Activity Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 pt-3">
            {/* Metric 1: Calls */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider">Client Calls</span>
                <PhoneCall size={14} className="text-blue-600" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-slate-900">
                  {activityScorecard.callsCompleted}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  / {activityScorecard.callsTarget} Target
                </span>
              </div>
              <span className="inline-block mt-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                {activityScorecard.callsPacing} ahead
              </span>
            </div>

            {/* Metric 2: Demos */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider">Demos Done</span>
                <Calendar size={14} className="text-purple-600" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-slate-900">
                  {activityScorecard.demosDelivered}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  / {activityScorecard.demosTarget} Target
                </span>
              </div>
              <span className="inline-block mt-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                {activityScorecard.demosPacing} ahead
              </span>
            </div>

            {/* Metric 3: Proposals Sent */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider">Proposals Sent</span>
                <Send size={14} className="text-teal-600" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-slate-900">
                  {activityScorecard.proposalsSent}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  / {activityScorecard.proposalsTarget} Target
                </span>
              </div>
              <span className="inline-block mt-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                {activityScorecard.proposalsPacing} ahead
              </span>
            </div>

            {/* Metric 4: Average First Response */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider">Avg First Response</span>
                <Clock size={14} className="text-amber-600" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-slate-900">
                  {activityScorecard.avgFirstResponseMins} Mins
                </span>
              </div>
              <span className="inline-block mt-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                SLA: &lt;30 mins (Pass)
              </span>
            </div>
          </div>
        </div>

        {/* SLA Health Indicator Footer */}
        <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-between text-xs mt-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
            <div>
              <span className="font-extrabold text-emerald-950 block">Outstanding Task & Reminder Adherence</span>
              <span className="text-[11px] text-emerald-800">
                {activityScorecard.tasksCompleted} tasks completed this month • <strong>0 overdue</strong>
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full font-black text-[10px] bg-emerald-600 text-white">
            100% On-Time
          </span>
        </div>
      </div>
    </div>
  );
}
