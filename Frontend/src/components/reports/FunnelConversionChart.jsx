import React, { useState } from 'react';
import {
  Target, ChevronDown, Flame, ArrowRight, Layers, Filter,
  CheckCircle2, TrendingDown, Sparkles, Award, Info, Zap
} from 'lucide-react';
import { PIPELINE_FUNNEL_DATA } from './ReportsData';

// Extended stage intelligence data for deep-dive inspection
const STAGE_METRICS = {
  inbound: {
    avgDays: '2.4 days',
    lostCount: 52,
    health: 'High Velocity',
    healthColor: 'text-blue-700 bg-blue-50 border-blue-200',
    keyAction: 'Instant SDR follow-up within 15 minutes',
  },
  discovery: {
    avgDays: '5.1 days',
    lostCount: 26,
    health: 'Strong Interest',
    healthColor: 'text-purple-700 bg-purple-50 border-purple-200',
    keyAction: 'Tailored product demo and pain-point mapping',
  },
  qualified: {
    avgDays: '6.8 days',
    lostCount: 22,
    health: 'Healthy Qualification',
    healthColor: 'text-teal-700 bg-teal-50 border-teal-200',
    keyAction: 'Decision maker buy-in & budget validation',
  },
  proposal: {
    avgDays: '5.4 days',
    lostCount: 11,
    health: 'High Acceptance',
    healthColor: 'text-amber-700 bg-amber-50 border-amber-200',
    keyAction: 'Custom enterprise scope & ROI calculation',
  },
  negotiation: {
    avgDays: '8.6 days',
    lostCount: 6,
    health: 'Critical Closing',
    healthColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    keyAction: 'SLA finalization, legal review & sign-off',
  },
  won: {
    avgDays: '28.3 days avg cycle',
    lostCount: 0,
    health: 'Closed Won 🏆',
    healthColor: 'text-emerald-800 bg-emerald-100 border-emerald-300',
    keyAction: 'Client onboarding & customer success handoff',
  },
};

// SVG Geometry for Inverted Funnel Tiers (viewBox: 0 0 760 365)
// 6 stages with smooth continuous angled slope
const FUNNEL_TIERS = [
  { topY: 20, botY: 64, x1: 90, x2: 670, x3: 646, x4: 114, grad: 'grad-blue', stroke: '#60a5fa' },
  { topY: 76, botY: 120, x1: 121, x2: 639, x3: 615, x4: 145, grad: 'grad-purple', stroke: '#a78bfa' },
  { topY: 132, botY: 176, x1: 152, x2: 608, x3: 584, x4: 176, grad: 'grad-teal', stroke: '#2dd4bf' },
  { topY: 188, botY: 232, x1: 183, x2: 577, x3: 553, x4: 207, grad: 'grad-amber', stroke: '#fbbf24' },
  { topY: 244, botY: 288, x1: 214, x2: 546, x3: 522, x4: 238, grad: 'grad-emerald', stroke: '#34d399' },
  { topY: 300, botY: 344, x1: 245, x2: 515, x3: 491, x4: 269, grad: 'grad-green', stroke: '#4ade80' },
];

export default function FunnelConversionChart() {
  const [hoveredStageId, setHoveredStageId] = useState(null);
  const [selectedStageId, setSelectedStageId] = useState('inbound');

  // Stage currently active in inspector (hovered takes precedence, otherwise selected)
  const activeStageId = hoveredStageId || selectedStageId || 'inbound';
  const activeStage =
    PIPELINE_FUNNEL_DATA.find((s) => s.stageId === activeStageId) || PIPELINE_FUNNEL_DATA[0];
  const activeMetrics = STAGE_METRICS[activeStage.stageId] || STAGE_METRICS.inbound;

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-200/80 hover:border-emerald-300 transition-all p-5 sm:p-6 shadow-2xs space-y-4">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-purple-50 text-purple-700 font-bold">
              <Filter size={13} />
            </span>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              Sales Pipeline Funnel
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-extrabold border border-purple-200">
              6 Conversion Tiers
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Geometric multi-tier conversion flow from inbound leads to closed-won revenue
          </p>
        </div>

        {/* Live Funnel Stat Pill */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold text-slate-500">Pipeline Volume:</span>
          <span className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-800 text-xs font-black border border-purple-200 shadow-2xs">
            148 Leads • ₹346.8L
          </span>
        </div>
      </div>

      {/* 2. Main Funnel Geometric Visualization */}
      <div className="space-y-4">
        {/* SVG Geometric Funnel Canvas */}
        <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-slate-50/70 via-slate-50/30 to-slate-100/40 p-2 sm:p-4 border border-slate-100">
          <svg
            viewBox="0 0 760 365"
            className="w-full h-auto select-none overflow-visible filter drop-shadow-xs"
          >
            <defs>
              {/* Stage 1: Blue to Indigo */}
              <linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>

              {/* Stage 2: Purple to Violet */}
              <linearGradient id="grad-purple" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>

              {/* Stage 3: Teal to Cyan */}
              <linearGradient id="grad-teal" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0d9488" />
                <stop offset="50%" stopColor="#14b8a6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>

              {/* Stage 4: Amber to Orange */}
              <linearGradient id="grad-amber" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d97706" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>

              {/* Stage 5: Emerald to Green */}
              <linearGradient id="grad-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#16a34a" />
              </linearGradient>

              {/* Stage 6: Emerald Closed Won */}
              <linearGradient id="grad-green" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#047857" />
                <stop offset="50%" stopColor="#059669" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>

              {/* Hover Glow Filter */}
              <filter id="hover-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Render Funnel Trapezoid Slices */}
            {PIPELINE_FUNNEL_DATA.map((stage, idx) => {
              const tier = FUNNEL_TIERS[idx];
              const isActive = activeStageId === stage.stageId;
              const points = `${tier.x1},${tier.topY} ${tier.x2},${tier.topY} ${tier.x3},${tier.botY} ${tier.x4},${tier.botY}`;
              const centerY = (tier.topY + tier.botY) / 2;

              return (
                <g
                  key={stage.stageId}
                  className="cursor-pointer transition-all duration-300"
                  onMouseEnter={() => setHoveredStageId(stage.stageId)}
                  onMouseLeave={() => setHoveredStageId(null)}
                  onClick={() => setSelectedStageId(stage.stageId)}
                >
                  {/* Shadow & Glow under layer when active */}
                  {isActive && (
                    <polygon
                      points={points}
                      fill={tier.stroke}
                      opacity={0.35}
                      filter="url(#hover-glow)"
                    />
                  )}

                  {/* Main Trapezoid Polygon Body */}
                  <polygon
                    points={points}
                    fill={`url(#${tier.grad})`}
                    stroke={isActive ? '#ffffff' : 'rgba(255,255,255,0.25)'}
                    strokeWidth={isActive ? 2.5 : 1}
                    className="transition-all duration-200 hover:brightness-110"
                  />

                  {/* Glass Surface Reflection Line (Top Edge) */}
                  <line
                    x1={tier.x1 + 4}
                    y1={tier.topY + 1.5}
                    x2={tier.x2 - 4}
                    y2={tier.topY + 1.5}
                    stroke="rgba(255,255,255,0.5)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />

                  {/* Tier Number Badge */}
                  <circle
                    cx={tier.x4 + 28}
                    cy={centerY}
                    r="12"
                    fill="rgba(0,0,0,0.28)"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="1"
                  />
                  <text
                    x={tier.x4 + 28}
                    y={centerY + 4}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="900"
                  >
                    {idx + 1}
                  </text>

                  {/* Stage Title */}
                  <text
                    x={tier.x4 + 48}
                    y={centerY + 4}
                    fill="#ffffff"
                    fontSize="13"
                    fontWeight="800"
                    className="tracking-wide"
                    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}
                  >
                    {stage.stageName}
                  </text>

                  {/* Stage Metrics (Deals & Lakhs) */}
                  <text
                    x={tier.x3 - 22}
                    y={centerY + 4}
                    textAnchor="end"
                    fill="#ffffff"
                    fontSize="12"
                    fontWeight="900"
                    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}
                  >
                    {stage.count} deals • ₹{stage.value}L
                  </text>

                  {/* Right-side Step Conversion Badge (Between Tiers) */}
                  {idx < PIPELINE_FUNNEL_DATA.length - 1 && (
                    <g transform={`translate(${tier.x3 + 12}, ${tier.botY + 6})`}>
                      <rect
                        x="0"
                        y="-9"
                        width="58"
                        height="18"
                        rx="9"
                        fill="#ecfdf5"
                        stroke="#a7f3d0"
                        strokeWidth="1"
                      />
                      <text
                        x="29"
                        y="4"
                        textAnchor="middle"
                        fill="#047857"
                        fontSize="10"
                        fontWeight="800"
                      >
                        ↓ {stage.conversionToNext}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* 3. Interactive Stage Deep-Dive Inspector Card */}
        <div className="bg-slate-50/90 rounded-2xl border border-slate-200/90 p-4 transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/70">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-purple-600 text-white font-extrabold text-xs shadow-xs">
                <Zap size={15} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-slate-900 tracking-tight">
                    {activeStage.stageName} Intelligence
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] border ${activeMetrics.healthColor}`}
                  >
                    {activeMetrics.health}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Recommended action: {activeMetrics.keyAction}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                Stage Pipeline Share
              </span>
              <span className="text-sm font-black text-slate-800">
                ₹{activeStage.value} Lakhs ({activeStage.count} deals)
              </span>
            </div>
          </div>

          {/* Metric Pills Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">
                Deals Volume
              </span>
              <span className="text-xs font-black text-slate-900">
                {activeStage.count} In-Flight
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">
                Conversion To Next
              </span>
              <span className="text-xs font-black text-emerald-700">
                {activeStage.conversionToNext} Proceed
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">
                Drop-off Loss
              </span>
              <span className="text-xs font-black text-rose-600">
                {activeStage.dropOffRate} ({activeMetrics.lostCount} lost)
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">
                Avg Cycle Time
              </span>
              <span className="text-xs font-black text-slate-800">
                {activeMetrics.avgDays}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Bottom Summary Metric */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-xs gap-2 px-1">
          <div className="flex items-center gap-2 text-slate-600 font-bold">
            <Flame size={15} className="text-purple-600" />
            <span>Pipeline Full-Funnel Efficiency:</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="font-extrabold text-slate-400 line-through">148 Inbound Leads</span>
            <span className="font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
              31 Closed Won (20.9% Win Rate • ₹39.5L Revenue) 🏆
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
