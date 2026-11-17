// ==========================================
// REPORTS & ANALYTICS DATA CONFIG
// ==========================================

export const TIME_RANGES = [
  'Last 7 Days',
  'Last 30 Days',
  'This Quarter',
  'This Year',
  'Custom Date',
];

export const SALES_REPS_LIST = [
  'All Reps',
  'Ajay Sharma',
  'Priya Patel',
  'Rohan Mehta',
  'Sneha Rao',
  'Vikram Joshi',
];

// 1. Monthly Revenue & Target Trends
export const MONTHLY_REVENUE_TREND = [
  { month: 'May', wonValue: 28.5, pipelineValue: 45.0, target: 30.0, dealsWon: 8 },
  { month: 'Jun', wonValue: 34.2, pipelineValue: 52.0, target: 35.0, dealsWon: 11 },
  { month: 'Jul', wonValue: 39.8, pipelineValue: 61.5, target: 40.0, dealsWon: 14 },
  { month: 'Aug', wonValue: 46.5, pipelineValue: 68.0, target: 45.0, dealsWon: 17 },
  { month: 'Sep', wonValue: 54.0, pipelineValue: 79.2, target: 50.0, dealsWon: 21 },
  { month: 'Oct', wonValue: 68.4, pipelineValue: 92.5, target: 60.0, dealsWon: 26 },
];

// 2. 6-Stage Sales Funnel Conversion Waterfall
export const PIPELINE_FUNNEL_DATA = [
  {
    stageId: 'inbound',
    stageName: '1. Inbound Leads',
    count: 148,
    value: 124.5,
    conversionToNext: '64.8%',
    dropOffRate: '35.2%',
    color: 'from-blue-600 to-indigo-600',
    barWidth: '100%',
  },
  {
    stageId: 'discovery',
    stageName: '2. Discovery & Demo',
    count: 96,
    value: 98.2,
    conversionToNext: '72.9%',
    dropOffRate: '27.1%',
    color: 'from-purple-600 to-pink-600',
    barWidth: '82%',
  },
  {
    stageId: 'qualified',
    stageName: '3. Qualified & Scoped',
    count: 70,
    value: 78.4,
    conversionToNext: '68.5%',
    dropOffRate: '31.5%',
    color: 'from-teal-600 to-cyan-600',
    barWidth: '66%',
  },
  {
    stageId: 'proposal',
    stageName: '4. Proposal Sent',
    count: 48,
    value: 58.0,
    conversionToNext: '77.0%',
    dropOffRate: '23.0%',
    color: 'from-amber-600 to-orange-600',
    barWidth: '50%',
  },
  {
    stageId: 'negotiation',
    stageName: '5. Negotiation / SLA',
    count: 37,
    value: 46.2,
    conversionToNext: '83.7%',
    dropOffRate: '16.3%',
    color: 'from-emerald-600 to-green-600',
    barWidth: '38%',
  },
  {
    stageId: 'won',
    stageName: '6. Closed Won 🏆',
    count: 31,
    value: 39.5,
    conversionToNext: '100%',
    dropOffRate: '0%',
    color: 'from-emerald-500 to-teal-500',
    barWidth: '28%',
  },
];

// 3. Sales Reps Leaderboard Performance
export const SALES_REP_LEADERBOARD = [
  {
    id: 1,
    name: 'Ajay Sharma',
    role: 'Enterprise AE',
    avatar: 'AS',
    color: 'bg-emerald-600',
    wonDealsCount: 12,
    wonRevenue: 2850000,
    quotaTarget: 3000000,
    quotaAttainment: 95,
    avgCycleDays: 13,
    winRate: 38.5,
    badge: 'Top Performer 🏆',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  {
    id: 2,
    name: 'Priya Patel',
    role: 'Mid-Market AE',
    avatar: 'PP',
    color: 'bg-teal-600',
    wonDealsCount: 9,
    wonRevenue: 2150000,
    quotaTarget: 2200000,
    quotaAttainment: 98,
    avgCycleDays: 11,
    winRate: 34.2,
    badge: 'Quota Crusher 🚀',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  },
  {
    id: 3,
    name: 'Rohan Mehta',
    role: 'Commercial Closer',
    avatar: 'RM',
    color: 'bg-blue-600',
    wonDealsCount: 6,
    wonRevenue: 1450000,
    quotaTarget: 1800000,
    quotaAttainment: 80,
    avgCycleDays: 16,
    winRate: 28.0,
    badge: 'Consistent Closer',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
  },
  {
    id: 4,
    name: 'Sneha Rao',
    role: 'Inbound SDR Specialist',
    avatar: 'SR',
    color: 'bg-indigo-600',
    wonDealsCount: 4,
    wonRevenue: 980000,
    quotaTarget: 1200000,
    quotaAttainment: 82,
    avgCycleDays: 15,
    winRate: 25.5,
    badge: 'Fast Responder ⚡',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
  },
  {
    id: 5,
    name: 'Vikram Joshi',
    role: 'Outbound AE',
    avatar: 'VJ',
    color: 'bg-amber-600',
    wonDealsCount: 3,
    wonRevenue: 680000,
    quotaTarget: 1000000,
    quotaAttainment: 68,
    avgCycleDays: 19,
    winRate: 21.0,
    badge: 'Ramping Up',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
  },
];

// 4. Lead Acquisition Sources Breakdown
export const LEAD_SOURCES_ATTRIBUTION = [
  { source: 'Inbound Website Form', count: 68, value: 34.5, percentage: 41, color: 'bg-emerald-500', hex: '#10b981' },
  { source: 'LinkedIn Outreach', count: 38, value: 24.2, percentage: 26, color: 'bg-blue-600', hex: '#2563eb' },
  { source: 'Partner & Client Referral', count: 28, value: 21.8, percentage: 18, color: 'bg-teal-500', hex: '#14b8a6' },
  { source: 'Google Ads & Retargeting', count: 18, value: 11.2, percentage: 10, color: 'bg-amber-500', hex: '#f59e0b' },
  { source: 'Cold Email & SDR Events', count: 10, value: 6.8, percentage: 5, color: 'bg-purple-500', hex: '#a855f7' },
];

// 5. Lost Deal Analysis & Reasons
export const LOST_DEALS_ANALYSIS = [
  { reason: 'Budget Stalled / Delayed to Next Year', percentage: 38, count: 14, color: 'bg-rose-500', hex: '#f43f5e' },
  { reason: 'Selected Legacy ERP Competitor', percentage: 27, count: 10, color: 'bg-amber-500', hex: '#f59e0b' },
  { reason: 'Missing Custom On-Prem Deployment', percentage: 19, count: 7, color: 'bg-indigo-500', hex: '#6366f1' },
  { reason: 'Lack of Internal Executive Sponsor', percentage: 11, count: 4, color: 'bg-slate-500', hex: '#64748b' },
  { reason: 'Product Complexity / Feature Gap', percentage: 5, count: 2, color: 'bg-blue-500', hex: '#3b82f6' },
];

// 6. Salesperson Personal Performance & Target Profile Data
export const PERSONAL_PERFORMANCE_DATA = {
  'Ajay Sharma': {
    name: 'Ajay Sharma',
    role: 'Enterprise Account Executive',
    avatar: 'AS',
    department: 'Strategic Accounts & Enterprise Sales',
    joinedDate: 'Jan 2024',
    currentQuarter: 'Q4 FY26',
    quotaTarget: 3000000, // ₹30,00,000
    wonRevenue: 2850000,   // ₹28,50,000
    gapToQuota: 150000,    // ₹1,50,000 remaining
    quotaAttainment: 95.0, // 95%
    runRateAttainment: 114.0, // Projected 114% by end of quarter
    daysLeftInQuarter: 18,
    wonDealsCount: 12,
    pipelineValue: 1450000, // ₹14.5L active pipeline
    avgDealSize: 237500,     // ₹2.38L
    avgCycleDays: 13,
    winRate: 38.5,
    teamRank: 1,
    totalReps: 5,
    commissionEarned: 171000, // ₹1,71,000 to date
    projectedBonus: 45000,    // ₹45,000 accelerator if quota hits 100%
    commissionRateCurrent: '6.0%',
    nextTierThreshold: 3000000,
    nextTierRate: '10.0% Super-Accelerator',

    // Monthly Target vs Achieved History
    monthlyTargetTrend: [
      { month: 'May', target: 20.0, achieved: 19.5, percentage: 97.5, deals: 8 },
      { month: 'Jun', target: 22.0, achieved: 23.8, percentage: 108.2, deals: 10 },
      { month: 'Jul', target: 25.0, achieved: 24.2, percentage: 96.8, deals: 9 },
      { month: 'Aug', target: 26.0, achieved: 27.5, percentage: 105.8, deals: 11 },
      { month: 'Sep', target: 28.0, achieved: 26.8, percentage: 95.7, deals: 10 },
      { month: 'Oct', target: 30.0, achieved: 28.5, percentage: 95.0, deals: 12, isCurrent: true },
    ],

    // Personal 5-Stage Conversion Funnel
    personalFunnel: [
      { stage: 'Assigned Leads', count: 48, value: '₹58.2L', conversionRate: '100%', drop: '0%' },
      { stage: 'First Contact / Discovery', count: 44, value: '₹53.0L', conversionRate: '91.7%', drop: '8.3%' },
      { stage: 'Product Demo Scheduled', count: 28, value: '₹38.4L', conversionRate: '63.6%', drop: '36.4%' },
      { stage: 'Commercial Proposal', count: 18, value: '₹26.2L', conversionRate: '64.3%', drop: '35.7%' },
      { stage: 'Contract & Negotiation', count: 14, value: '₹21.5L', conversionRate: '77.8%', drop: '22.2%' },
      { stage: 'Closed Won 🏆', count: 12, value: '₹28.5L', conversionRate: '85.7%', drop: '14.3%' },
    ],

    // Personal Activity & Productivity Scorecard
    activityScorecard: {
      callsCompleted: 184,
      callsTarget: 160,
      callsPacing: '+15.0%',
      demosDelivered: 28,
      demosTarget: 24,
      demosPacing: '+16.7%',
      proposalsSent: 18,
      proposalsTarget: 15,
      proposalsPacing: '+20.0%',
      tasksCompleted: 92,
      tasksOverdue: 0,
      avgFirstResponseMins: 14, // minutes
      slaAdherence: 98.4,       // %
    },

    // High Probability Deals in Closing Pipeline (Needed to smash remaining ₹1.5L gap)
    closingPipelineDeals: [
      {
        id: 'DEAL-801',
        company: 'CloudNova Systems',
        contact: 'Vikram Malhotra (CTO)',
        value: 520000,
        stage: 'Contract & SLA Review',
        probability: 90,
        closingDate: 'Nov 02, 2026',
        nextAction: 'Final SLA sign-off with Legal Head',
        impact: 'Will bridge full quota gap + ₹3.7L surplus!',
      },
      {
        id: 'DEAL-802',
        company: 'Nexus FinTech Labs',
        contact: 'Kavita Pillai (VP Product)',
        value: 350000,
        stage: 'Pricing Negotiation',
        probability: 75,
        closingDate: 'Nov 05, 2026',
        nextAction: 'Offer 5% annual payment incentive',
        impact: 'Pushes attainment to 106% Gold Tier',
      },
      {
        id: 'DEAL-803',
        company: 'Apex Retailers India',
        contact: 'Rohan Mehra (Head of Ops)',
        value: 180000,
        stage: 'Proposal Follow-up',
        probability: 70,
        closingDate: 'Nov 08, 2026',
        nextAction: 'Demo review call with warehouse team',
        impact: 'Secures 100% individual quota attainment',
      },
    ],

    // Achievement Badges & Milestones
    achievements: [
      { id: 1, title: 'Top Performer 🏆', desc: 'Rank #1 in enterprise revenue closed across all 5 reps', date: 'Oct 2026', color: 'bg-amber-50 text-amber-800 border-amber-200' },
      { id: 2, title: 'Speed Demon ⚡', desc: 'Fastest avg sales cycle at 13 days (team avg 16 days)', date: 'Q4 2026', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
      { id: 3, title: '95% Quota Attained 🎯', desc: 'Only ₹1.5L needed to hit full quarterly milestone bonus', date: 'This Month', color: 'bg-purple-50 text-purple-800 border-purple-200' },
      { id: 4, title: 'Flawless SLA 🛡️', desc: 'Zero overdue follow-up tasks and 98.4% SLA adherence', date: 'Always On', color: 'bg-blue-50 text-blue-800 border-blue-200' },
    ],
  },
};

