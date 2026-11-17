import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2 } from 'lucide-react';
import { useGet, useToast } from '../../hooks';

import ReportsHeaderStats from '../../components/reports/ReportsHeaderStats';
import RevenueTrendChart from '../../components/reports/RevenueTrendChart';
import FunnelConversionChart from '../../components/reports/FunnelConversionChart';
import RepLeaderboard from '../../components/reports/RepLeaderboard';
import SourcesAndLossAnalysis from '../../components/reports/SourcesAndLossAnalysis';

// Salesperson Personal View Components
import MyPerformanceHero from '../../components/reports/MyPerformanceHero';
import MyTargetPacingChart from '../../components/reports/MyTargetPacingChart';
import MyActivityScorecard from '../../components/reports/MyActivityScorecard';
import MyLeadConversionFunnel from '../../components/reports/MyLeadConversionFunnel';
import MyClosingPipeline from '../../components/reports/MyClosingPipeline';

import {
  SALES_REP_LEADERBOARD,
  PIPELINE_FUNNEL_DATA,
  PERSONAL_PERFORMANCE_DATA,
} from '../../components/reports/ReportsData';

export default function Reports({ defaultRole }) {
  const { user, role } = useAuth();
  // Role-based view detection: defaultRole prop -> user's actual auth role -> fallback 'sales_manager'
  const effectiveRole = defaultRole || role || 'sales_manager';
  const isSalesPerson = effectiveRole === 'sales_person';
  const currentSalesPerson = user?.name || '';

  const [timeRange, setTimeRange] = useState('This Quarter');
  const [customStartDate, setCustomStartDate] = useState(
    new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [customEndDate, setCustomEndDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [selectedRep, setSelectedRep] = useState('All Reps');
  const { showNotification } = useToast();

  // ─── TanStack Query: Live Personal Report Sync ───────────────────────────────
  const { data: personalReportsData } = useGet(
    ['reports-personal'],
    '/reports/personal',
    { enabled: isSalesPerson }
  );

  const livePersonal = personalReportsData?.success && personalReportsData?.performance
    ? personalReportsData.performance
    : null;

  const basePersonalData =
    PERSONAL_PERFORMANCE_DATA[currentSalesPerson] ||
    Object.values(PERSONAL_PERFORMANCE_DATA)[0] || {};

  const personalData = livePersonal
    ? {
        ...basePersonalData,
        ...livePersonal,
        monthlyTargetTrend: basePersonalData.monthlyTargetTrend,
        personalFunnel: basePersonalData.personalFunnel,
      }
    : basePersonalData;

  // Full CSV Report Export Handler (Dynamic for Personal vs Team view)
  const handleExportReport = () => {
    if (isSalesPerson) {
      // Personal Performance Export
      const headers = [
        'Metric / Target',
        'Target Value',
        'Achieved Value',
        'Attainment (%)',
        'Status / Notes',
      ];

      const rows = [
        ['Quarterly Quota Target', `INR ${personalData.quotaTarget}`, `INR ${personalData.wonRevenue}`, `${personalData.quotaAttainment}%`, 'On Track (Rank #1)'],
        ['Deals Won Count', '10 Deals', `${personalData.wonDealsCount} Deals`, '120%', 'Target Exceeded'],
        ['Average Deal Size', 'INR 2,00,000', `INR ${personalData.avgDealSize}`, '118.7%', 'Enterprise Tier'],
        ['Win Rate', '30.0%', `${personalData.winRate}%`, '128.3%', '+9.1% vs Team Benchmark'],
        ['Sales Velocity Cycle', '15 Days', `${personalData.avgCycleDays} Days`, 'Fastest', '3 Days Faster than Team'],
        ['Earned Commission', 'INR 1,50,000', `INR ${personalData.commissionEarned}`, '114%', 'Tier 2 Active (6% rate)'],
        ['Quarterly Bonus Milestone', 'INR 45,000', 'Pending Quota 100%', '95%', '₹1.5L Gap to Unlock'],
      ];

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [
          `"Personal Performance & Target Report - ${currentSalesPerson} (${personalData.currentQuarter})"`,
          headers.join(','),
          ...rows.map((row) => row.map((c) => `"${c}"`).join(',')),
        ].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute(
        'download',
        `my_sales_performance_${currentSalesPerson.toLowerCase().replace(/ /g, '_')}_${new Date()
          .toISOString()
          .slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showNotification(`Exported My Performance & Target Report for ${personalData.currentQuarter}!`);
      return;
    }

    // Manager View Team Report
    const headers = [
      'Rep Name',
      'Role',
      'Quota Attainment (%)',
      'Deals Won Count',
      'Won Revenue (INR)',
      'Quota Target (INR)',
      'Avg Cycle (Days)',
      'Win Rate (%)',
      'Performance Status',
    ];

    const rows = SALES_REP_LEADERBOARD.map((r) => [
      `"${r.name}"`,
      `"${r.role}"`,
      r.quotaAttainment,
      r.wonDealsCount,
      r.wonRevenue,
      r.quotaTarget,
      r.avgCycleDays,
      r.winRate,
      `"${r.badge}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const rangeSlug =
      timeRange === 'Custom Date' && customStartDate && customEndDate
        ? `custom_${customStartDate}_to_${customEndDate}`
        : timeRange.toLowerCase().replace(/ /g, '_');
    link.setAttribute(
      'download',
      `leadflow_sales_team_report_${rangeSlug}_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const rangeLabel =
      timeRange === 'Custom Date' && customStartDate && customEndDate
        ? `${customStartDate} to ${customEndDate}`
        : timeRange;
    showNotification(`Exported Team Sales Intelligence Report for ${rangeLabel}!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Toolbar, Role Switcher & Filters */}
      <ReportsHeaderStats
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        customStartDate={customStartDate}
        setCustomStartDate={setCustomStartDate}
        customEndDate={customEndDate}
        setCustomEndDate={setCustomEndDate}
        selectedRep={selectedRep}
        setSelectedRep={setSelectedRep}
        onExportReport={handleExportReport}
        activeRole={effectiveRole}
        currentSalesPerson={currentSalesPerson}
        showNotification={showNotification}
        personalData={personalData}
      />

      {/* 2A. SALESPERSON MODE: MY PERFORMANCE & TARGET REPORTS */}

      {isSalesPerson ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Hero Quota Attainment, Progress Ring & Key KPI Cards */}
          <MyPerformanceHero data={personalData} />

          {/* Row 1: Target Pacing Graph (Left) + My Activity & SLA Scorecard (Right) */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-stretch">
            <MyTargetPacingChart monthlyData={personalData.monthlyTargetTrend} />
            <MyActivityScorecard activityScorecard={personalData.activityScorecard} />
          </div>

          {/* Row 2: Personal Conversion Funnel (Full Width) */}
          <MyLeadConversionFunnel personalFunnel={personalData.personalFunnel} />

          {/* Row 3: Hot Closing Opportunities to Smash Quota (Last Section, Full Width) */}
          <MyClosingPipeline
            deals={personalData.closingPipelineDeals}
            gapToQuota={personalData.gapToQuota}
          />
        </div>
      ) : (

        /* 2B. SALES MANAGER MODE: TEAM INTELLIGENCE & LEADERBOARDS */

        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Charts Grid: Revenue Velocity & Sales Funnel Waterfall */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <RevenueTrendChart />
            <FunnelConversionChart />
          </div>

          {/* Sales Reps Quota Attainment & Leaderboard */}
          <RepLeaderboard selectedRep={selectedRep} />

          {/* Lead Sources Attribution & Lost Deals Analysis */}
          <SourcesAndLossAnalysis />
        </div>
      )}
    </div>
  );
}
