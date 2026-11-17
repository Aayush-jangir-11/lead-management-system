import React from 'react';
import {
  Zap, PhoneCall, Calendar, Send, Clock, ShieldCheck,
  CheckCircle2, TrendingUp, Award, Sparkles, ArrowUpRight
} from 'lucide-react';

export default function MyActivityScorecard({ activityScorecard = {} }) {
  const callsCompleted = activityScorecard.callsCompleted || 184;
  const callsTarget = activityScorecard.callsTarget || 160;
  const callsPacing = activityScorecard.callsPacing || '+15.0%';

  const demosDelivered = activityScorecard.demosDelivered || 28;
  const demosTarget = activityScorecard.demosTarget || 24;
  const demosPacing = activityScorecard.demosPacing || '+16.7%';

  const proposalsSent = activityScorecard.proposalsSent || 18;
  const proposalsTarget = activityScorecard.proposalsTarget || 15;
  const proposalsPacing = activityScorecard.proposalsPacing || '+20.0%';

  const avgFirstResponseMins = activityScorecard.avgFirstResponseMins || 14;
  const slaAdherence = activityScorecard.slaAdherence || 98.4;
  const tasksCompleted = activityScorecard.tasksCompleted || 92;

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-200/80 hover:border-emerald-300 transition-all p-5 sm:p-6 shadow-2xs space-y-4 h-full flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100/80 pb-3.5">
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
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200 self-start sm:self-auto">
            {slaAdherence}% SLA Adherence
          </span>
        </div>

        {/* 4 Activity KPI Metric Cards Grid */}
        <div className="grid grid-cols-2 gap-3 pt-3">
          {/* Metric 1: Calls */}
          <div className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 transition-all">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider">Client Calls</span>
              <PhoneCall size={14} className="text-blue-600" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900">
                {callsCompleted}
              </span>
              <span className="text-xs font-bold text-slate-400">
                / {callsTarget} Target
              </span>
            </div>
            <span className="inline-block mt-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              {callsPacing} ahead
            </span>
          </div>

          {/* Metric 2: Demos */}
          <div className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 transition-all">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider">Demos Done</span>
              <Calendar size={14} className="text-purple-600" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900">
                {demosDelivered}
              </span>
              <span className="text-xs font-bold text-slate-400">
                / {demosTarget} Target
              </span>
            </div>
            <span className="inline-block mt-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              {demosPacing} ahead
            </span>
          </div>

          {/* Metric 3: Proposals Sent */}
          <div className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 transition-all">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider">Proposals Sent</span>
              <Send size={14} className="text-teal-600" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900">
                {proposalsSent}
              </span>
              <span className="text-xs font-bold text-slate-400">
                / {proposalsTarget} Target
              </span>
            </div>
            <span className="inline-block mt-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              {proposalsPacing} ahead
            </span>
          </div>

          {/* Metric 4: Average First Response */}
          <div className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 transition-all">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider">Avg First Response</span>
              <Clock size={14} className="text-amber-600" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900">
                {avgFirstResponseMins} Mins
              </span>
            </div>
            <span className="inline-block mt-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              SLA: &lt;30 mins (Pass)
            </span>
          </div>
        </div>

        {/* Middle Performance Milestone Snapshot */}
        <div className="mt-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-slate-800">Lead Response Velocity</span>
            <span className="font-black text-emerald-700">96.8% under 20 mins</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full w-[96.8%]" />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span>Industry Benchmark: 60 mins</span>
            <span className="text-emerald-700 font-bold">3.2x Faster</span>
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
              {tasksCompleted} tasks completed this month • <strong>0 overdue</strong>
            </span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full font-black text-[10px] bg-emerald-600 text-white shrink-0">
          100% On-Time
        </span>
      </div>
    </div>
  );
}
