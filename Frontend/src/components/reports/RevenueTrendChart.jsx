import React, { useState } from 'react';
import { TrendingUp, Sparkles, BarChart3, Layers } from 'lucide-react';
import { MONTHLY_REVENUE_TREND } from './ReportsData';

export default function RevenueTrendChart() {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // SVG Geometry Dimensions
  const svgWidth = 680;
  const svgHeight = 240;
  const marginLeft = 52;
  const marginRight = 24;
  const marginTop = 25;
  const marginBottom = 35;

  const plotWidth = svgWidth - marginLeft - marginRight;
  const plotHeight = svgHeight - marginTop - marginBottom;
  const maxVal = 100; // ₹100 Lakhs scale

  const getY = (val) => marginTop + (1 - val / maxVal) * plotHeight;
  const getX = (index) => marginLeft + (index + 0.5) * (plotWidth / MONTHLY_REVENUE_TREND.length);

  // Y-Axis Grid ticks
  const yTicks = [0, 25, 50, 75, 100];
  const barWidth = 15;

  const activeItem = hoveredIndex !== null ? MONTHLY_REVENUE_TREND[hoveredIndex] : null;

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-200/80 hover:border-emerald-300 transition-all p-5 sm:p-6 shadow-2xs space-y-4">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 font-bold">
              <TrendingUp size={13} />
            </span>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              Revenue Growth & Pipeline Velocity
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-200">
              H2 Performance
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Monthly closed-won revenue vs. active pipeline volume (in ₹ Lakhs)
          </p>
        </div>

        {/* Clean Legend (No dotted line) */}
        <div className="flex items-center gap-4 text-[11px] font-bold shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-600 shadow-2xs" />
            <span className="text-slate-700">Closed Won</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-teal-200 border border-teal-300" />
            <span className="text-slate-500">Pipeline Volume</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive SVG Bar Chart Canvas (DOTTED LINE COMPLETELY REMOVED) */}
      <div className="relative pt-1">
        {/* Floating Tooltip Card */}
        {activeItem && (
          <div className="absolute top-0 right-4 z-20 bg-slate-900/95 backdrop-blur-md text-white rounded-xl px-3.5 py-2 shadow-xl border border-slate-700 text-xs flex items-center gap-3 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <span className="text-slate-400 font-bold text-[10px] uppercase block">
                {activeItem.month} 2026
              </span>
              <span className="text-emerald-400 font-black text-sm">
                ₹{activeItem.wonValue}L Won
              </span>
            </div>
            <div className="h-7 w-[1px] bg-slate-700" />
            <div className="text-[11px] space-y-0.5">
              <div className="text-slate-300">
                Pipeline: <strong className="text-white">₹{activeItem.pipelineValue}L</strong>
              </div>
              <div className="text-emerald-400 font-bold">
                {activeItem.dealsWon} Deals Closed
              </div>
            </div>
          </div>
        )}

        {/* Vector SVG Dual-Bar Chart */}
        <div className="w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto select-none overflow-visible"
          >
            <defs>
              {/* Won Bar Gradient */}
              <linearGradient id="won-bar-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>

              {/* Pipeline Bar Gradient */}
              <linearGradient id="pipe-bar-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ccfbf1" />
                <stop offset="100%" stopColor="#99f6e4" />
              </linearGradient>

              {/* Active Column Highlight */}
              <linearGradient id="col-highlight" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(16, 185, 129, 0.08)" />
                <stop offset="100%" stopColor="rgba(16, 185, 129, 0.01)" />
              </linearGradient>
            </defs>

            {/* Y-Axis Horizontal Gridlines & Labels */}
            {yTicks.map((tick) => {
              const y = getY(tick);
              return (
                <g key={tick}>
                  <line
                    x1={marginLeft}
                    y1={y}
                    x2={svgWidth - marginRight}
                    y2={y}
                    stroke={tick === 0 ? '#cbd5e1' : '#f1f5f9'}
                    strokeWidth={tick === 0 ? '1.5' : '1'}
                    strokeDasharray={tick === 0 ? 'none' : '3 3'}
                  />
                  <text
                    x={marginLeft - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    fill="#94a3b8"
                    fontSize="10"
                    fontWeight="700"
                  >
                    ₹{tick}L
                  </text>
                </g>
              );
            })}

            {/* Columns & Dual Bars for each Month (NO DOTTED LINE) */}
            {MONTHLY_REVENUE_TREND.map((item, idx) => {
              const cx = getX(idx);
              const wonY = getY(item.wonValue);
              const wonHeight = plotHeight - (wonY - marginTop);

              const pipeY = getY(item.pipelineValue);
              const pipeHeight = plotHeight - (pipeY - marginTop);

              const isHovered = hoveredIndex === idx;
              const colWidth = plotWidth / MONTHLY_REVENUE_TREND.length;

              return (
                <g
                  key={item.month}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Invisible Full-Height Hover Column Area */}
                  <rect
                    x={cx - colWidth / 2}
                    y={marginTop}
                    width={colWidth}
                    height={plotHeight}
                    fill={isHovered ? 'url(#col-highlight)' : 'transparent'}
                    className="transition-colors duration-150"
                  />

                  {/* Left Bar: Pipeline Volume */}
                  <rect
                    x={cx - barWidth - 2}
                    y={pipeY}
                    width={barWidth}
                    height={Math.max(2, pipeHeight)}
                    rx="4"
                    fill={isHovered ? '#5eead4' : 'url(#pipe-bar-grad)'}
                    stroke="#2dd4bf"
                    strokeWidth="0.5"
                    className="transition-all duration-200"
                  />

                  {/* Right Bar: Closed Won Revenue */}
                  <rect
                    x={cx + 2}
                    y={wonY}
                    width={barWidth}
                    height={Math.max(2, wonHeight)}
                    rx="4"
                    fill="url(#won-bar-grad)"
                    stroke={isHovered ? '#ffffff' : 'none'}
                    strokeWidth={isHovered ? '1.5' : '0'}
                    className={`transition-all duration-200 ${
                      isHovered ? 'filter brightness-110 drop-shadow-sm' : ''
                    }`}
                  />

                  {/* Month Label (X-Axis) */}
                  <text
                    x={cx}
                    y={svgHeight - 14}
                    textAnchor="middle"
                    fill={isHovered ? '#047857' : '#64748b'}
                    fontSize="11"
                    fontWeight={isHovered ? '900' : '700'}
                    className="transition-colors"
                  >
                    {item.month}
                  </text>

                  {/* Won Value Text Tag under month */}
                  <text
                    x={cx}
                    y={svgHeight - 2}
                    textAnchor="middle"
                    fill={isHovered ? '#065f46' : '#94a3b8'}
                    fontSize="9.5"
                    fontWeight="800"
                  >
                    ₹{item.wonValue}L
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* 3. Executive KPI Footer Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
        <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">
              Peak Month Velocity
            </span>
            <span className="text-xs font-black text-slate-900">October (₹68.4 Lakhs)</span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black">
            26 Deals
          </span>
        </div>

        <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">
              Monthly Avg Closed
            </span>
            <span className="text-xs font-black text-slate-900">₹45.2 Lakhs / mo</span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 text-[10px] font-black">
            16 Deals Avg
          </span>
        </div>

        <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">
              Quarter Target Status
            </span>
            <span className="text-xs font-black text-emerald-700">114% Attained 🎯</span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black">
            +₹8.4L Surplus
          </span>
        </div>
      </div>
    </div>
  );
}
