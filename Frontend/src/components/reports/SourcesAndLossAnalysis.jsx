import React, { useState } from 'react';
import { Share2, AlertOctagon, Sparkles, ShieldAlert, PieChart as PieIcon } from 'lucide-react';
import { LEAD_SOURCES_ATTRIBUTION, LOST_DEALS_ANALYSIS } from './ReportsData';

// Helper to compute exact 2D solid pie wedges (zero space / contiguous slices)
function computePieWedges(data, cx = 100, cy = 100, radius = 82) {
  let currentAngle = -Math.PI / 2; // Start at 12 o'clock
  const total = data.reduce((sum, item) => sum + item.percentage, 0);

  return data.map((item) => {
    const sliceAngle = (item.percentage / total) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);

    const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

    // SVG path: Center -> Start Edge -> Arc -> End Edge -> Close
    const pathData = `M ${cx} ${cy} L ${x1.toFixed(3)} ${y1.toFixed(3)} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2.toFixed(3)} ${y2.toFixed(3)} Z`;

    // Mid angle for percentage label position & 2D hover pop-out vector
    const midAngle = startAngle + sliceAngle / 2;
    const labelRadius = radius * 0.65;
    const labelX = cx + labelRadius * Math.cos(midAngle);
    const labelY = cy + labelRadius * Math.sin(midAngle);

    // Subtle 2D pop-out offset (4px)
    const offsetX = Math.round(5 * Math.cos(midAngle));
    const offsetY = Math.round(5 * Math.sin(midAngle));

    return {
      ...item,
      pathData,
      labelX,
      labelY,
      offsetX,
      offsetY,
    };
  });
}

export default function SourcesAndLossAnalysis() {
  const [hoveredSource, setHoveredSource] = useState(null);
  const [hoveredLoss, setHoveredLoss] = useState(null);

  // Exact 2D Solid Pie Slices (Zero space between wedges)
  const sourceWedges = computePieWedges(LEAD_SOURCES_ATTRIBUTION, 100, 100, 82);
  const lossWedges = computePieWedges(LOST_DEALS_ANALYSIS, 100, 100, 82);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

      {/* 1. LEAD ACQUISITION SOURCES (SOLID 2D PIE CHART)        */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-200/80 hover:border-emerald-300 transition-all p-5 sm:p-6 shadow-2xs space-y-4">
        {/* Header Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-50 text-blue-700 font-bold">
                <Share2 size={13} />
              </span>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                Lead Source Channel Attribution (2D Pie)
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Continuous 2D pie distribution of 162 inbound enterprise leads
            </p>
          </div>

          <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-800 text-[11px] font-extrabold border border-blue-200 shrink-0">
            Top: Inbound Website (41%)
          </span>
        </div>

        {/* 2D Pie & Synchronized Legend */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pt-1">
          {/* Solid 2D SVG Pie Canvas (Zero Gaps / Contiguous) */}
          <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full select-none overflow-visible filter drop-shadow-xs"
            >
              {sourceWedges.map((wedge) => {
                const isHovered = hoveredSource?.source === wedge.source;
                return (
                  <g
                    key={wedge.source}
                    className="cursor-pointer transition-transform duration-200"
                    style={{
                      transform: isHovered
                        ? `translate(${wedge.offsetX}px, ${wedge.offsetY}px)`
                        : 'translate(0px, 0px)',
                    }}
                    onMouseEnter={() => setHoveredSource(wedge)}
                    onMouseLeave={() => setHoveredSource(null)}
                  >
                    {/* Solid 2D Pie Wedge */}
                    <path
                      d={wedge.pathData}
                      fill={wedge.hex}
                      stroke="#ffffff"
                      strokeWidth={isHovered ? 2 : 1.5}
                      strokeLinejoin="round"
                      className="transition-colors duration-200 hover:brightness-105"
                    />

                    {/* In-Wedge Percentage Text (for slices >= 10%) */}
                    {wedge.percentage >= 10 && (
                      <text
                        x={wedge.labelX}
                        y={wedge.labelY + 4}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="11"
                        fontWeight="900"
                        className="pointer-events-none drop-shadow-xs"
                      >
                        {wedge.percentage}%
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Interactive Synchronized Legend Cards */}
          <div className="flex-1 w-full space-y-1.5">
            {LEAD_SOURCES_ATTRIBUTION.map((item) => {
              const isHovered = hoveredSource?.source === item.source;
              return (
                <div
                  key={item.source}
                  onMouseEnter={() => setHoveredSource(item)}
                  onMouseLeave={() => setHoveredSource(null)}
                  className={`flex flex-col p-2 rounded-xl transition-all duration-200 cursor-pointer border ${isHovered
                      ? 'bg-slate-50 border-slate-300 shadow-xs translate-x-1'
                      : 'bg-white/60 border-transparent hover:bg-slate-50/80 hover:border-slate-200/80'
                    }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: item.hex }}
                      />
                      <span className="font-bold text-slate-800 truncate text-[11px] sm:text-xs">
                        {item.source}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-xs">
                      <span className="text-[11px] font-semibold text-slate-400">
                        {item.count} leads
                      </span>
                      <span className="text-[11px] font-extrabold text-slate-700">
                        ₹{item.value}L
                      </span>
                      <span className="text-[11px] font-black text-slate-900 bg-slate-100 px-1.5 py-0.2 rounded-md">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Micro Progress Bar */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.hex,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Hover/Status Pill */}
        <div className="mt-2 pt-3 border-t border-slate-100 flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
            <Sparkles size={13} className="text-blue-600" />
            <span>
              {hoveredSource ? (
                <>
                  Selected: <strong className="text-slate-800">{hoveredSource.source}</strong>
                </>
              ) : (
                'Highest conversion efficiency:'
              )}
            </span>
          </div>
          <span className="text-[11px] font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            {hoveredSource
              ? `${hoveredSource.count} Leads • ₹${hoveredSource.value}L (${hoveredSource.percentage}%)`
              : 'Inbound Website (₹34.5L Revenue • 41% share)'}
          </span>
        </div>
      </div>

      {/* 2. LOST DEAL REASON ANALYSIS (SOLID 2D PIE CHART)        */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-200/80 hover:border-emerald-300 transition-all p-5 sm:p-6 shadow-2xs space-y-4">
        {/* Header Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-rose-50 text-rose-700 font-bold">
                <AlertOctagon size={13} />
              </span>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                Lost Deal Reason Analysis (2D Pie)
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Continuous 2D pie breakdown of deal drop-off factors
            </p>
          </div>

          <span className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-800 text-[11px] font-extrabold border border-rose-200 shrink-0">
            Primary: Budget (38%)
          </span>
        </div>

        {/* 2D Pie & Synchronized Legend */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pt-1">
          {/* Solid 2D SVG Pie Canvas (Zero Gaps / Contiguous) */}
          <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full select-none overflow-visible filter drop-shadow-xs"
            >
              {lossWedges.map((wedge) => {
                const isHovered = hoveredLoss?.reason === wedge.reason;
                return (
                  <g
                    key={wedge.reason}
                    className="cursor-pointer transition-transform duration-200"
                    style={{
                      transform: isHovered
                        ? `translate(${wedge.offsetX}px, ${wedge.offsetY}px)`
                        : 'translate(0px, 0px)',
                    }}
                    onMouseEnter={() => setHoveredLoss(wedge)}
                    onMouseLeave={() => setHoveredLoss(null)}
                  >
                    {/* Solid 2D Pie Wedge */}
                    <path
                      d={wedge.pathData}
                      fill={wedge.hex}
                      stroke="#ffffff"
                      strokeWidth={isHovered ? 2 : 1.5}
                      strokeLinejoin="round"
                      className="transition-colors duration-200 hover:brightness-105"
                    />

                    {/* In-Wedge Percentage Text (for slices >= 10%) */}
                    {wedge.percentage >= 10 && (
                      <text
                        x={wedge.labelX}
                        y={wedge.labelY + 4}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="11"
                        fontWeight="900"
                        className="pointer-events-none drop-shadow-xs"
                      >
                        {wedge.percentage}%
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Interactive Synchronized Legend Cards */}
          <div className="flex-1 w-full space-y-1.5">
            {LOST_DEALS_ANALYSIS.map((item) => {
              const isHovered = hoveredLoss?.reason === item.reason;
              return (
                <div
                  key={item.reason}
                  onMouseEnter={() => setHoveredLoss(item)}
                  onMouseLeave={() => setHoveredLoss(null)}
                  className={`flex flex-col p-2 rounded-xl transition-all duration-200 cursor-pointer border ${isHovered
                      ? 'bg-slate-50 border-slate-300 shadow-xs translate-x-1'
                      : 'bg-white/60 border-transparent hover:bg-slate-50/80 hover:border-slate-200/80'
                    }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: item.hex }}
                      />
                      <span className="font-bold text-slate-800 truncate text-[11px] sm:text-xs">
                        {item.reason}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-xs">
                      <span className="text-[11px] font-semibold text-slate-400">
                        {item.count} deals
                      </span>
                      <span className="text-[11px] font-black text-slate-900 bg-slate-100 px-1.5 py-0.2 rounded-md">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Micro Progress Bar */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.hex,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Churn Action Insight Callout */}
        <div className="mt-2 pt-3 border-t border-slate-100 flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
            <ShieldAlert size={13} className="text-rose-600" />
            <span>
              {hoveredLoss ? (
                <>
                  Reason: <strong className="text-slate-800">{hoveredLoss.reason}</strong>
                </>
              ) : (
                'Primary drop-off factor:'
              )}
            </span>
          </div>
          <span className="text-[11px] font-extrabold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
            {hoveredLoss
              ? `${hoveredLoss.count} deals lost (${hoveredLoss.percentage}%)`
              : 'Budget Delays (38% deals • Offer flexible payment plans)'}
          </span>
        </div>
      </div>
    </div>
  );
}
