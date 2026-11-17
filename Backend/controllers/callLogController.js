const CallLog = require('../models/CallLog');
const Lead = require('../models/Lead');
const Team = require('../models/Team');
const User = require('../models/User');

// Helper: Auto-detect outcome status if not explicitly set
const resolveOutcomeStatus = (outcome = '') => {
  const lower = outcome.toLowerCase();
  if (
    lower.includes('demo') ||
    lower.includes('passed') ||
    lower.includes('contract') ||
    lower.includes('won') ||
    lower.includes('positive') ||
    lower.includes('scheduled') ||
    lower.includes('interested')
  ) {
    return 'positive';
  }
  if (
    lower.includes('objection') ||
    lower.includes('needs') ||
    lower.includes('review') ||
    lower.includes('budget') ||
    lower.includes('follow-up') ||
    lower.includes('action')
  ) {
    return 'needs_action';
  }
  if (
    lower.includes('lost') ||
    lower.includes('rejected') ||
    lower.includes('closed') ||
    lower.includes('not interested') ||
    lower.includes('dnc')
  ) {
    return 'closed';
  }
  return 'pending';
};

// CREATE CALL LOG 
// POST /api/calls
const createCallLog = async (req, res) => {
  try {
    const {
      lead: leadInput,
      leadId,
      salesperson: repInput,
      stage,
      callType,
      duration,
      callDate,
      outcome,
      outcomeStatus,
      notes,
      nextFollowUp,
    } = req.body;

    const targetLeadId = leadInput || leadId;
    if (!targetLeadId) {
      return res.status(400).json({
        success: false,
        message: 'Lead reference (lead or leadId) is required.',
      });
    }

    if (!notes || !notes.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Call discussion feedback notes are required.',
      });
    }

    // 1. Resolve Target Lead
    let leadDoc = null;
    if (typeof targetLeadId === 'string' && targetLeadId.match(/^[0-9a-fA-F]{24}$/)) {
      leadDoc = await Lead.findById(targetLeadId);
    }
    if (!leadDoc) {
      // Fallback search by leadId code or company/name
      leadDoc = await Lead.findOne({
        $or: [
          { leadId: targetLeadId },
          { name: targetLeadId },
          { company: targetLeadId },
        ],
      });
    }

    if (!leadDoc) {
      return res.status(404).json({
        success: false,
        message: 'Associated lead not found in database.',
      });
    }

    // 2. Resolve Salesperson
    let salespersonId = req.user._id;
    if (req.user.role === 'admin' || req.user.role === 'sales_manager') {
      if (repInput) {
        if (typeof repInput === 'string' && repInput.match(/^[0-9a-fA-F]{24}$/)) {
          salespersonId = repInput;
        } else {
          const matchedRep = await User.findOne({ name: repInput });
          if (matchedRep) salespersonId = matchedRep._id;
        }
      } else if (leadDoc.assignedTo) {
        salespersonId = leadDoc.assignedTo;
      }
    }

    // 3. Resolve Outcome Status
    const computedStatus = outcomeStatus || resolveOutcomeStatus(outcome || 'Follow-up Required');

    // 4. Create Call Log Record
    const newCallLog = await CallLog.create({
      lead: leadDoc._id,
      salesperson: salespersonId,
      stage: stage || leadDoc.stage || null,
      callType: callType || 'Discovery Call',
      duration: duration || '10 mins',
      callDate: callDate ? new Date(callDate) : new Date(),
      outcome: outcome || 'Follow-up Required',
      outcomeStatus: computedStatus,
      notes: notes.trim(),
      nextFollowUp: nextFollowUp || 'TBD',
    });

    // 5. Automatically Update Lead's lastContacted and Activity Timeline
    leadDoc.lastContacted = new Date();
    leadDoc.timeline.unshift({
      type: 'call',
      title: `${newCallLog.callType} (${newCallLog.duration})`,
      author: req.user.name || 'Sales Representative',
      note: `${newCallLog.outcome}: ${newCallLog.notes}`,
      time: new Date(),
    });
    await leadDoc.save();

    // 6. Populate References for immediate frontend display
    const populatedCallLog = await CallLog.findById(newCallLog._id)
      .populate('lead', 'name company phone email status value stage leadId location')
      .populate('salesperson', 'name email role phone avatar')
      .populate('stage', 'name');

    res.status(201).json({
      success: true,
      message: 'Call log recorded successfully.',
      callLog: populatedCallLog,
    });
  } catch (error) {
    console.error('Error in createCallLog:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while recording call log.',
    });
  }
};

// GET /api/calls
const getCallLogs = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;

    let filter = {};

    // 1. Role-based scoping
    if (userRole === 'admin') {
      filter = {};
    } else if (userRole === 'sales_manager') {
      const myTeam = await Team.findOne({ manager: userId });
      if (myTeam && myTeam.members && myTeam.members.length > 0) {
        const teamMemberIds = [userId, ...myTeam.members];
        filter = { salesperson: { $in: teamMemberIds } };
      } else {
        filter = { salesperson: userId };
      }
    } else if (userRole === 'sales_person') {
      filter = { salesperson: userId };
    }

    // 2. Query filter options
    if (req.query.lead) {
      filter.lead = req.query.lead;
    }
    if (req.query.salesperson && userRole !== 'sales_person') {
      filter.salesperson = req.query.salesperson;
    }
    if (req.query.outcomeStatus && req.query.outcomeStatus !== 'All') {
      filter.outcomeStatus = req.query.outcomeStatus;
    }
    if (req.query.callType && req.query.callType !== 'All') {
      filter.callType = req.query.callType;
    }
    if (req.query.startDate || req.query.endDate) {
      filter.callDate = {};
      if (req.query.startDate) filter.callDate.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.callDate.$lte = new Date(req.query.endDate);
    }

    // 3. Optional Search in notes
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { notes: searchRegex },
        { outcome: searchRegex },
        { callType: searchRegex },
      ];
    }

    const callLogs = await CallLog.find(filter)
      .populate('lead', 'name company phone email status value stage leadId location')
      .populate('salesperson', 'name email role phone avatar')
      .populate('stage', 'name')
      .sort({ callDate: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: callLogs.length,
      callLogs,
    });
  } catch (error) {
    console.error('Error in getCallLogs:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while fetching call logs.',
    });
  }
};

// GET CALL LOGS HISTORY FOR ONE PARTICULAR LEAD 
// GET /api/calls/lead/:leadId
const getCallLogsByLead = async (req, res) => {
  try {
    const { leadId } = req.params;

    let leadObjectId = leadId;
    if (!leadId.match(/^[0-9a-fA-F]{24}$/)) {
      const foundLead = await Lead.findOne({ leadId });
      if (!foundLead) {
        return res.status(404).json({
          success: false,
          message: 'Lead not found.',
        });
      }
      leadObjectId = foundLead._id;
    }

    const callLogs = await CallLog.find({ lead: leadObjectId })
      .populate('salesperson', 'name email role phone avatar')
      .populate('stage', 'name')
      .sort({ callDate: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: callLogs.length,
      callLogs,
    });
  } catch (error) {
    console.error('Error in getCallLogsByLead:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while fetching lead call logs.',
    });
  }
};

// GET SINGLE CALL LOG 
// GET /api/calls/:id
const getCallLogById = async (req, res) => {
  try {
    const callLog = await CallLog.findById(req.params.id)
      .populate('lead', 'name company phone email status value stage leadId location')
      .populate('salesperson', 'name email role phone avatar')
      .populate('stage', 'name color probability');

    if (!callLog) {
      return res.status(404).json({
        success: false,
        message: 'Call log record not found.',
      });
    }

    // Role security check
    if (
      req.user.role === 'sales_person' &&
      String(callLog.salesperson?._id) !== String(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this call log.',
      });
    }

    res.status(200).json({
      success: true,
      callLog,
    });
  } catch (error) {
    console.error('Error in getCallLogById:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while fetching call log.',
    });
  }
};

// ─── 5. GET CALL LOG STATISTICS ───────────────────────────────────────────────
// GET /api/calls/stats
const getCallLogStats = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;

    let filter = {};
    if (userRole === 'sales_manager') {
      const myTeam = await Team.findOne({ manager: userId });
      if (myTeam && myTeam.members && myTeam.members.length > 0) {
        filter = { salesperson: { $in: [userId, ...myTeam.members] } };
      } else {
        filter = { salesperson: userId };
      }
    } else if (userRole === 'sales_person') {
      filter = { salesperson: userId };
    }

    const allCalls = await CallLog.find(filter);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayCalls = allCalls.filter(
      (c) => new Date(c.callDate) >= startOfToday
    );

    const positiveCalls = allCalls.filter(
      (c) => c.outcomeStatus === 'positive'
    );
    const needsActionCalls = allCalls.filter(
      (c) => c.outcomeStatus === 'needs_action'
    );
    const closedCalls = allCalls.filter(
      (c) => c.outcomeStatus === 'closed'
    );

    res.status(200).json({
      success: true,
      stats: {
        totalCalls: allCalls.length,
        todayCalls: todayCalls.length,
        positiveCalls: positiveCalls.length,
        needsActionCalls: needsActionCalls.length,
        closedCalls: closedCalls.length,
        conversionRate:
          allCalls.length > 0
            ? Math.round((positiveCalls.length / allCalls.length) * 100)
            : 0,
      },
    });
  } catch (error) {
    console.error('Error in getCallLogStats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while calculating call stats.',
    });
  }
};

// ─── 6. UPDATE CALL LOG ───────────────────────────────────────────────────────
// PUT /api/calls/:id
const updateCallLog = async (req, res) => {
  try {
    const callLog = await CallLog.findById(req.params.id);
    if (!callLog) {
      return res.status(404).json({
        success: false,
        message: 'Call log not found.',
      });
    }

    // Role check: sales_person can only edit their own call logs
    if (
      req.user.role === 'sales_person' &&
      String(callLog.salesperson) !== String(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only edit your own call logs.',
      });
    }

    const {
      callType,
      duration,
      callDate,
      outcome,
      outcomeStatus,
      notes,
      nextFollowUp,
      stage,
    } = req.body;

    if (callType) callLog.callType = callType;
    if (duration) callLog.duration = duration;
    if (callDate) callLog.callDate = new Date(callDate);
    if (outcome) {
      callLog.outcome = outcome;
      if (!outcomeStatus) {
        callLog.outcomeStatus = resolveOutcomeStatus(outcome);
      }
    }
    if (outcomeStatus) callLog.outcomeStatus = outcomeStatus;
    if (notes !== undefined) callLog.notes = notes.trim();
    if (nextFollowUp !== undefined) callLog.nextFollowUp = nextFollowUp;
    if (stage !== undefined) callLog.stage = stage || null;

    await callLog.save();

    const updated = await CallLog.findById(callLog._id)
      .populate('lead', 'name company phone email status value stage leadId location')
      .populate('salesperson', 'name email role phone avatar')
      .populate('stage', 'name color probability');

    res.status(200).json({
      success: true,
      message: 'Call log updated successfully.',
      callLog: updated,
    });
  } catch (error) {
    console.error('Error in updateCallLog:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while updating call log.',
    });
  }
};

// ─── 7. DELETE CALL LOG ───────────────────────────────────────────────────────
// DELETE /api/calls/:id
const deleteCallLog = async (req, res) => {
  try {
    const callLog = await CallLog.findById(req.params.id);
    if (!callLog) {
      return res.status(404).json({
        success: false,
        message: 'Call log not found.',
      });
    }

    // Role check: Only admin, manager, or creator can delete
    if (
      req.user.role === 'sales_person' &&
      String(callLog.salesperson) !== String(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only delete your own call logs.',
      });
    }

    await callLog.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Call log deleted successfully.',
    });
  } catch (error) {
    console.error('Error in deleteCallLog:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while deleting call log.',
    });
  }
};

module.exports = {
  createCallLog,
  getCallLogs,
  getCallLogsByLead,
  getCallLogById,
  getCallLogStats,
  updateCallLog,
  deleteCallLog,
};

