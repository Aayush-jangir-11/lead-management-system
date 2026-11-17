const Lead = require('../models/Lead');
const Task = require('../models/Task');
const CallLog = require('../models/CallLog');
const User = require('../models/User');
const Team = require('../models/Team');
const PipelineStage = require('../models/PipelineStage');

// HELPER: Scope query by User Role 
async function getRoleScopedFilter(user) {
  if (!user) return { leadFilter: {}, taskFilter: {}, callFilter: {} };

  // 1. Super Admin: full access across company
  if (user.role === 'admin') {
    return { leadFilter: {}, taskFilter: {}, callFilter: {} };
  }

  // 2. Sales Manager: team leads + own assigned leads + unassigned leads
  if (user.role === 'sales_manager') {
    const myTeam = await Team.findOne({ manager: user._id });
    if (myTeam && Array.isArray(myTeam.members) && myTeam.members.length > 0) {
      const teamMemberIds = [user._id, ...myTeam.members];
      return {
        leadFilter: { $or: [{ assignedTo: { $in: teamMemberIds } }, { assignedTo: null }] },
        taskFilter: { assignedRep: { $in: teamMemberIds } },
        callFilter: { caller: { $in: teamMemberIds } },
      };
    }
    return {
      leadFilter: { assignedTo: user._id },
      taskFilter: { assignedRep: user._id },
      callFilter: { caller: user._id },
    };
  }

  // 3. Sales Representative: strictly own records
  return {
    leadFilter: { assignedTo: user._id },
    taskFilter: { assignedRep: user._id },
    callFilter: { caller: user._id },
  };
}

// HELPER: Date Range Filter 
function getDateFilter(timeRange, customStart, customEnd) {
  let start, end;
  const now = new Date();

  if (customStart && customEnd) {
    start = new Date(customStart);
    end = new Date(customEnd);
    end.setHours(23, 59, 59, 999);
  } else if (timeRange === 'Today') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  } else if (timeRange === 'This Week') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    start = new Date(now.setDate(diff));
    start.setHours(0, 0, 0, 0);
    end = new Date();
  } else if (timeRange === 'This Month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date();
  } else if (timeRange === 'This Quarter') {
    const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
    start = new Date(now.getFullYear(), quarterMonth, 1);
    end = new Date();
  } else if (timeRange === 'This Year') {
    start = new Date(now.getFullYear(), 0, 1);
    end = new Date();
  }

  if (start && end) {
    return { createdAt: { $gte: start, $lte: end } };
  }
  return {};
}

// EXECUTIVE / SUMMARY KPIS 
// GET /api/reports/kpis
const getSummaryKPIs = async (req, res) => {
  try {
    const { timeRange, startDate, endDate, repId } = req.query;
    const { leadFilter, taskFilter, callFilter } = await getRoleScopedFilter(req.user);

    const dateFilter = getDateFilter(timeRange, startDate, endDate);

    const baseLeadQuery = { ...leadFilter, ...dateFilter };
    if (repId && repId !== 'All' && repId !== 'All Reps') {
      baseLeadQuery.assignedTo = repId;
    }

    const leads = await Lead.find(baseLeadQuery);

    let totalRevenue = 0;
    let activePipeline = 0;
    let wonCount = 0;
    let lostCount = 0;
    let totalValue = 0;

    leads.forEach((l) => {
      const val = Number(l.value) || 0;
      totalValue += val;
      const statusLower = (l.status || '').toLowerCase();

      if (statusLower.includes('won') || statusLower.includes('closed won')) {
        wonCount++;
        totalRevenue += val;
      } else if (statusLower.includes('lost') || statusLower.includes('closed lost')) {
        lostCount++;
      } else {
        activePipeline += val;
      }
    });

    const totalResolved = wonCount + lostCount;
    const winRate = totalResolved > 0 ? ((wonCount / totalResolved) * 100).toFixed(1) : (leads.length > 0 ? ((wonCount / leads.length) * 100).toFixed(1) : 0);
    const avgDealSize = wonCount > 0 ? Math.round(totalRevenue / wonCount) : (leads.length > 0 ? Math.round(totalValue / leads.length) : 0);

    // Activity stats
    const totalCalls = await CallLog.countDocuments({ ...callFilter, ...dateFilter });
    const completedTasks = await Task.countDocuments({ ...taskFilter, status: 'Completed', ...dateFilter });
    const pendingTasks = await Task.countDocuments({ ...taskFilter, status: { $ne: 'Completed' }, ...dateFilter });

    res.status(200).json({
      success: true,
      kpis: {
        totalLeads: leads.length,
        totalRevenue,
        activePipeline,
        wonCount,
        lostCount,
        winRate: `${winRate}%`,
        avgDealSize,
        totalCalls,
        completedTasks,
        pendingTasks,
      },
    });
  } catch (error) {
    console.error('Error in getSummaryKPIs:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while fetching KPIs.',
    });
  }
};

// DYNAMIC PIPELINE FUNNEL DATA (100% Dynamic based on PipelineStage collection)
// GET /api/reports/funnel
const getFunnelData = async (req, res) => {
  try {
    const { timeRange, startDate, endDate, repId } = req.query;
    const { leadFilter } = await getRoleScopedFilter(req.user);
    const dateFilter = getDateFilter(timeRange, startDate, endDate);

    const query = { ...leadFilter, ...dateFilter };
    if (repId && repId !== 'All' && repId !== 'All Reps') {
      query.assignedTo = repId;
    }

    // 1. Fetch dynamic pipeline stages sorted by sequence order
    const pipelineStages = await PipelineStage.find().sort({ order: 1 });

    // 2. Fetch scoped leads
    const leads = await Lead.find(query).populate('stage');
    const totalLeads = leads.length;

    // 3. Build dynamic stage map
    const stageMap = {};
    pipelineStages.forEach((s) => {
      stageMap[String(s._id)] = {
        id: s._id,
        stage: s.name,
        order: s.order,
        count: 0,
        value: 0,
      };
    });

    let unassignedCount = 0;
    let unassignedValue = 0;

    leads.forEach((l) => {
      const val = Number(l.value) || 0;
      const stageId = l.stage?._id ? String(l.stage._id) : (l.stage ? String(l.stage) : null);
      const stLower = (l.status || '').toLowerCase();

      if (stageId && stageMap[stageId]) {
        stageMap[stageId].count++;
        stageMap[stageId].value += val;
      } else {
        // Match by stage name if ObjectId link wasn't populated
        const matched = Object.values(stageMap).find(
          (s) => s.stage.toLowerCase() === stLower
        );
        if (matched) {
          matched.count++;
          matched.value += val;
        } else {
          unassignedCount++;
          unassignedValue += val;
        }
      }
    });

    // 4. Return dynamic funnel array in sequence order
    const funnel = Object.values(stageMap).map((s) => ({
      stageId: s.id,
      stage: s.stage,
      order: s.order,
      count: s.count,
      value: s.value,
      percentage: totalLeads > 0 ? Math.round((s.count / totalLeads) * 100) : 0,
    }));

    res.status(200).json({
      success: true,
      totalLeads,
      funnel,
      unassigned: {
        count: unassignedCount,
        value: unassignedValue,
      },
    });
  } catch (error) {
    console.error('Error in getFunnelData:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while fetching funnel data.',
    });
  }
};

// LEAD SOURCE ANALYSIS 
// GET /api/reports/sources
const getSourceAnalysis = async (req, res) => {
  try {
    const { timeRange, startDate, endDate } = req.query;
    const { leadFilter } = await getRoleScopedFilter(req.user);
    const dateFilter = getDateFilter(timeRange, startDate, endDate);

    const leads = await Lead.find({ ...leadFilter, ...dateFilter });
    const totalLeads = leads.length || 1;

    const sourceMap = {};

    leads.forEach((l) => {
      const src = l.source || 'Other';
      if (!sourceMap[src]) {
        sourceMap[src] = { source: src, count: 0, totalValue: 0, wonCount: 0, wonRevenue: 0 };
      }

      const val = Number(l.value) || 0;
      sourceMap[src].count++;
      sourceMap[src].totalValue += val;

      const st = (l.status || '').toLowerCase();
      if (st.includes('won')) {
        sourceMap[src].wonCount++;
        sourceMap[src].wonRevenue += val;
      }
    });

    const sources = Object.values(sourceMap).map((s) => ({
      ...s,
      share: Math.round((s.count / totalLeads) * 100),
      winRate: s.count > 0 ? `${Math.round((s.wonCount / s.count) * 100)}%` : '0%',
    })).sort((a, b) => b.count - a.count);

    res.status(200).json({
      success: true,
      sources,
    });
  } catch (error) {
    console.error('Error in getSourceAnalysis:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while fetching sources analysis.',
    });
  }
};

// REVENUE & PIPELINE MONTHLY TRENDS 
// GET /api/reports/revenue-trend
const getRevenueTrends = async (req, res) => {
  try {
    const { leadFilter } = await getRoleScopedFilter(req.user);

    // Aggregate monthly performance for the past 6 months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
        year: d.getFullYear(),
        month: d.getMonth(),
        start: new Date(d.getFullYear(), d.getMonth(), 1),
        end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999),
        target: 3500000 + (5 - i) * 500000,
        wonRevenue: 0,
        pipelineCreated: 0,
        dealsCount: 0,
      });
    }

    const sixMonthsAgo = months[0].start;
    const leads = await Lead.find({
      ...leadFilter,
      createdAt: { $gte: sixMonthsAgo },
    });

    leads.forEach((l) => {
      const lDate = new Date(l.createdAt);
      const val = Number(l.value) || 0;
      const st = (l.status || '').toLowerCase();

      months.forEach((m) => {
        if (lDate >= m.start && lDate <= m.end) {
          m.pipelineCreated += val;
          if (st.includes('won')) {
            m.wonRevenue += val;
            m.dealsCount++;
          }
        }
      });
    });

    const trendData = months.map((m) => ({
      month: m.label,
      target: m.target,
      achieved: m.wonRevenue,
      pipeline: m.pipelineCreated,
      deals: m.dealsCount,
    }));

    res.status(200).json({
      success: true,
      trends: trendData,
    });
  } catch (error) {
    console.error('Error in getRevenueTrends:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while fetching revenue trends.',
    });
  }
};

// REP LEADERBOARD / PERFORMANCE 
// GET /api/reports/leaderboard
const getRepLeaderboard = async (req, res) => {
  try {
    const { timeRange, startDate, endDate } = req.query;
    const dateFilter = getDateFilter(timeRange, startDate, endDate);

    // Get all sales users
    const users = await User.find({ status: 'active' }).select('name email role avatar');

    const repMap = {};
    users.forEach((u) => {
      repMap[String(u._id)] = {
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        avatar: u.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
        assignedLeads: 0,
        closedDeals: 0,
        wonRevenue: 0,
        pipelineValue: 0,
      };
    });

    const leads = await Lead.find({ ...dateFilter });

    leads.forEach((l) => {
      const repId = l.assignedTo ? String(l.assignedTo) : null;
      if (repId && repMap[repId]) {
        const val = Number(l.value) || 0;
        repMap[repId].assignedLeads++;

        const st = (l.status || '').toLowerCase();
        if (st.includes('won')) {
          repMap[repId].closedDeals++;
          repMap[repId].wonRevenue += val;
        } else if (!st.includes('lost')) {
          repMap[repId].pipelineValue += val;
        }
      }
    });

    const leaderboard = Object.values(repMap)
      .map((r) => {
        const winRate = r.assignedLeads > 0 ? Math.round((r.closedDeals / r.assignedLeads) * 100) : 0;
        const avgDeal = r.closedDeals > 0 ? Math.round(r.wonRevenue / r.closedDeals) : 0;
        return {
          ...r,
          winRate: `${winRate}%`,
          avgDealSize: avgDeal,
        };
      })
      .sort((a, b) => b.wonRevenue - a.wonRevenue)
      .map((r, idx) => ({ ...r, rank: `#${idx + 1}` }));

    res.status(200).json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    console.error('Error in getRepLeaderboard:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while fetching leaderboard.',
    });
  }
};

// ALL-IN-ONE FULL REPORT (Fast Dashboard Load) 
// GET /api/reports/full
const getFullReport = async (req, res) => {
  try {
    const { timeRange, startDate, endDate, repId } = req.query;
    const { leadFilter, taskFilter, callFilter } = await getRoleScopedFilter(req.user);
    const dateFilter = getDateFilter(timeRange, startDate, endDate);

    const query = { ...leadFilter, ...dateFilter };
    if (repId && repId !== 'All' && repId !== 'All Reps') {
      query.assignedTo = repId;
    }

    const leads = await Lead.find(query);

    let totalRevenue = 0;
    let activePipeline = 0;
    let wonCount = 0;
    let lostCount = 0;
    let totalValue = 0;

    const sourceMap = {};

    leads.forEach((l) => {
      const val = Number(l.value) || 0;
      totalValue += val;
      const st = (l.status || '').toLowerCase();

      // Revenue Calculation
      if (st.includes('won')) {
        wonCount++;
        totalRevenue += val;
      } else if (st.includes('lost')) {
        lostCount++;
      } else {
        activePipeline += val;
      }

      // Sources Attribution
      const src = l.source || 'Other';
      if (!sourceMap[src]) {
        sourceMap[src] = { source: src, count: 0, totalValue: 0, wonCount: 0, wonRevenue: 0 };
      }
      sourceMap[src].count++;
      sourceMap[src].totalValue += val;
      if (st.includes('won')) {
        sourceMap[src].wonCount++;
        sourceMap[src].wonRevenue += val;
      }
    });

    const totalLeads = leads.length;
    const totalResolved = wonCount + lostCount;
    const winRate = totalResolved > 0 ? ((wonCount / totalResolved) * 100).toFixed(1) : (totalLeads > 0 ? ((wonCount / totalLeads) * 100).toFixed(1) : 0);
    const avgDealSize = wonCount > 0 ? Math.round(totalRevenue / wonCount) : (totalLeads > 0 ? Math.round(totalValue / totalLeads) : 0);

    const sources = Object.values(sourceMap).map((s) => ({
      ...s,
      share: totalLeads > 0 ? Math.round((s.count / totalLeads) * 100) : 0,
      winRate: s.count > 0 ? `${Math.round((s.wonCount / s.count) * 100)}%` : '0%',
    })).sort((a, b) => b.count - a.count);

    // Activity stats
    const totalCalls = await CallLog.countDocuments({ ...callFilter, ...dateFilter });
    const completedTasks = await Task.countDocuments({ ...taskFilter, status: 'Completed', ...dateFilter });

    res.status(200).json({
      success: true,
      kpis: {
        totalLeads,
        totalRevenue,
        activePipeline,
        wonCount,
        lostCount,
        winRate: `${winRate}%`,
        avgDealSize,
        totalCalls,
        completedTasks,
      },
      sources,
    });
  } catch (error) {
    console.error('Error in getFullReport:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while fetching full report.',
    });
  }
};

// DEPARTMENT COMPARISONS (Admin Executive BI) 
// GET /api/reports/departments
const getDepartmentComparison = async (req, res) => {
  try {
    const Department = require('../models/Department');
    const departments = await Department.find();

    const result = await Promise.all(
      departments.map(async (dept) => {
        // Find users in this department
        const users = await User.find({ department: dept._id });
        const userIds = users.map((u) => u._id);

        // Find leads assigned to users in this department
        const leads = await Lead.find({ assignedTo: { $in: userIds } });

        let wonRevenue = 0;
        let activePipeline = 0;
        let wonCount = 0;
        let lostCount = 0;

        leads.forEach((l) => {
          const val = Number(l.value) || 0;
          const st = (l.status || '').toLowerCase();
          if (st.includes('won')) {
            wonCount++;
            wonRevenue += val;
          } else if (st.includes('lost')) {
            lostCount++;
          } else {
            activePipeline += val;
          }
        });

        const totalResolved = wonCount + lostCount;
        const winRate = totalResolved > 0 ? `${((wonCount / totalResolved) * 100).toFixed(1)}%` : '0%';
        const monthlyTarget = 5000000; // Standard benchmark ₹50 Lakhs
        const attainment = Number(((wonRevenue / monthlyTarget) * 100).toFixed(1));

        return {
          id: dept.code || dept._id,
          name: dept.name,
          headName: dept.headName || 'Department Head',
          activeReps: users.length,
          monthlyTarget,
          wonRevenue,
          attainment,
          activePipeline,
          winRate,
          avgCycleDays: 18,
          status: attainment >= 100 ? 'Overperforming' : attainment >= 80 ? 'On Track' : 'Needs Focus',
        };
      })
    );

    res.status(200).json({
      success: true,
      departments: result,
    });
  } catch (error) {
    console.error('Error in getDepartmentComparison:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while fetching department comparison.',
    });
  }
};

// SALESPERSON PERSONAL PERFORMANCE (My Performance) 
// GET /api/reports/personal
const getMyPerformance = async (req, res) => {
  try {
    const userId = req.user._id;

    const leads = await Lead.find({ assignedTo: userId }).populate('stage');

    let wonRevenue = 0;
    let pipelineValue = 0;
    let wonDealsCount = 0;
    let lostDealsCount = 0;

    leads.forEach((l) => {
      const val = Number(l.value) || 0;
      const st = (l.status || '').toLowerCase();

      if (st.includes('won')) {
        wonDealsCount++;
        wonRevenue += val;
      } else if (st.includes('lost')) {
        lostDealsCount++;
      } else {
        pipelineValue += val;
      }
    });

    const quotaTarget = 3000000; // ₹30,00,000 target
    const gapToQuota = Math.max(0, quotaTarget - wonRevenue);
    const quotaAttainment = Number(((wonRevenue / quotaTarget) * 100).toFixed(1));
    const totalResolved = wonDealsCount + lostDealsCount;
    const winRate = totalResolved > 0 ? Number(((wonDealsCount / totalResolved) * 100).toFixed(1)) : 0;
    const avgDealSize = wonDealsCount > 0 ? Math.round(wonRevenue / wonDealsCount) : 0;

    // Calculate Rank
    const allUsers = await User.find({ status: 'active', role: 'sales_person' }).select('_id');
    const allRepWon = await Lead.aggregate([
      { $match: { status: { $regex: /won/i } } },
      { $group: { _id: '$assignedTo', totalWon: { $sum: '$value' } } },
      { $sort: { totalWon: -1 } },
    ]);
    const rankIndex = allRepWon.findIndex((r) => String(r._id) === String(userId));
    const teamRank = rankIndex !== -1 ? rankIndex + 1 : (allUsers.length || 1);

    // Activities
    const callsLogged = await CallLog.countDocuments({ caller: userId });
    const tasksCompleted = await Task.countDocuments({ assignedRep: userId, status: 'Completed' });
    const tasksPending = await Task.countDocuments({ assignedRep: userId, status: { $ne: 'Completed' } });

    // Closing Opportunities (active pipeline deals sorted by value descending)
    const closingDeals = leads
      .filter((l) => !((l.status || '').toLowerCase().includes('won') || (l.status || '').toLowerCase().includes('lost')))
      .sort((a, b) => (b.value || 0) - (a.value || 0))
      .slice(0, 5)
      .map((l) => ({
        id: l._id,
        leadId: l.leadId,
        company: l.company,
        name: l.name,
        value: l.value,
        stage: l.status || 'Proposal Sent',
        probability: (l.status || '').toLowerCase().includes('proposal') ? 75 : 50,
        priority: l.priority || 'High',
      }));

    res.status(200).json({
      success: true,
      performance: {
        name: req.user.name,
        role: req.user.role,
        quotaTarget,
        wonRevenue,
        gapToQuota,
        quotaAttainment,
        wonDealsCount,
        pipelineValue,
        avgDealSize,
        winRate,
        teamRank,
        totalReps: allUsers.length || 1,
        activityScorecard: {
          callsLogged,
          tasksCompleted,
          tasksPending,
        },
        closingPipelineDeals: closingDeals,
      },
    });
  } catch (error) {
    console.error('Error in getMyPerformance:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while fetching personal performance.',
    });
  }
};

module.exports = {
  getSummaryKPIs,
  getFunnelData,
  getSourceAnalysis,
  getRevenueTrends,
  getRepLeaderboard,
  getFullReport,
  getDepartmentComparison,
  getMyPerformance,
};

