const Lead = require('../models/Lead');
const User = require('../models/User');
const Task = require('../models/Task');

// ─── 1. CREATE LEAD ───────────────────────────────────────────────────────────
// POST /api/leads
const createLead = async (req, res) => {
  try {
    const {
      company,
      name,
      title,
      email,
      phone,
      location,
      value,
      status,
      priority,
      source,
      assignedTo,
      notes,
      tags,
      stage,
    } = req.body;

    if (!company || !name) {
      return res.status(400).json({
        success: false,
        message: 'Company name and Contact person name are required.',
      });
    }

    // Auto-generate Lead ID: LD-1001, LD-1002, etc.
    const count = await Lead.countDocuments();
    const finalLeadId = `LD-${1001 + count}`;

    let repName = 'Unassigned';
    let targetRepId = assignedTo || null;

    // If salesperson is creating the lead, automatically assign it to them
    if (req.user.role === 'sales_person') {
      targetRepId = req.user._id;
      repName = req.user.name;
    } else if (targetRepId) {
      const rep = await User.findById(targetRepId);
      if (rep) repName = rep.name;
    } else if (req.body.assignedRep || req.body.assignedRepName) {
      const passedName = req.body.assignedRep || req.body.assignedRepName;
      const rep = await User.findOne({ name: passedName });
      if (rep) {
        targetRepId = rep._id;
        repName = rep.name;
      } else {
        repName = passedName;
      }
    }

    let finalStage = null;
    if (stage && typeof stage === 'string' && stage.match(/^[0-9a-fA-F]{24}$/)) {
      finalStage = stage;
    }

    const newLead = await Lead.create({
      leadId: finalLeadId,
      company: company.trim(),
      name: name.trim(),
      title: title ? title.trim() : '',
      email: email ? email.toLowerCase().trim() : '',
      phone: phone ? phone.trim() : '',
      location: location ? location.trim() : '',
      value: Number(value) || 0,
      stage: finalStage,
      status: status || 'New Lead',
      priority: priority || 'Medium',
      source: source || 'Inbound Website Form',
      assignedTo: targetRepId,
      assignedRepName: repName,
      createdBy: req.user._id,
      notes: notes ? notes.trim() : '',
      tags: Array.isArray(tags) ? tags : [],
      // Auto-attach initial timeline entry
      timeline: [
        {
          type: 'lead',
          title: 'Lead Captured & Assigned',
          author: req.user.name,
          note: `Lead created for ${company.trim()} with initial value ₹${Number(value) || 0}`,
          time: new Date(),
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Lead created successfully.',
      lead: newLead,
    });
  } catch (error) {
    console.error('Error in createLead:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while creating lead.',
    });
  }
};

// ─── 1B. BULK CREATE LEADS (EXCEL / CSV IMPORT) ──────────────────────────────
// POST /api/leads/bulk
const bulkCreateLeads = async (req, res) => {
  try {
    const { leads } = req.body;
    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid leads array is required for bulk import.',
      });
    }

    const currentCount = await Lead.countDocuments();
    const leadsToInsert = leads.map((item, idx) => ({
      company: (item.company || 'Unknown Firm').trim(),
      name: (item.name || 'Direct Lead').trim(),
      title: item.title ? item.title.trim() : '',
      email: item.email ? item.email.toLowerCase().trim() : '',
      phone: item.phone ? item.phone.trim() : '',
      location: item.location ? item.location.trim() : '',
      value: Number(item.value) || 0,
      stage: item.stage || null,
      status: item.status || 'New Lead',
      priority: item.priority || 'Medium',
      source: item.source || 'Excel Import',
      assignedTo: item.assignedTo || null,
      assignedRepName: item.assignedRep || item.assignedRepName || 'Unassigned',
      createdBy: req.user._id,
      notes: item.notes || 'Bulk imported via Excel / CSV.',
      tags: Array.isArray(item.tags) ? item.tags : ['Excel Import'],
      timeline: [
        {
          type: 'lead',
          title: 'Imported via Excel / CSV',
          author: req.user.name,
          note: `Imported and allocated to ${item.assignedRep || item.assignedRepName || 'Unassigned'}.`,
          time: new Date(),
        },
      ],
    }));

    const inserted = await Lead.insertMany(leadsToInsert);

    res.status(201).json({
      success: true,
      message: `Successfully imported ${inserted.length} leads.`,
      count: inserted.length,
      leads: inserted,
    });
  } catch (error) {
    console.error('Error in bulkCreateLeads:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to bulk import leads.',
    });
  }
};

// ─── 2. GET ALL LEADS (Role-based) ───────────────────────────────────────────
// GET /api/leads
const getLeads = async (req, res) => {
  try {
    const query = {};

    // ⭐️ Role check: Salesperson can only see their own assigned leads
    if (req.user.role === 'sales_person') {
      query.assignedTo = req.user._id;
    }

    // Optional query filters
    if (req.query.status && req.query.status !== 'All') {
      query.status = req.query.status;
    }
    if (req.query.priority && req.query.priority !== 'All') {
      query.priority = req.query.priority;
    }
    if (req.query.source && req.query.source !== 'All') {
      query.source = req.query.source;
    }
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [{ name: searchRegex }, { company: searchRegex }, { leadId: searchRegex }];
    }

    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role')
      .populate('stage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (error) {
    console.error('Error in getLeads:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while fetching leads.',
    });
  }
};

// ─── 3. GET SINGLE LEAD ──────────────────────────────────────────────────────
// GET /api/leads/:id
const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role')
      .populate('stage');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found.',
      });
    }

    // Role check: Salesperson cannot view leads belonging to another rep
    if (req.user.role === 'sales_person' && String(lead.assignedTo?._id) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this lead.',
      });
    }

    res.status(200).json({
      success: true,
      lead,
    });
  } catch (error) {
    console.error('Error in getLeadById:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while fetching lead.',
    });
  }
};

// ─── 4. UPDATE LEAD ──────────────────────────────────────────────────────────
// PUT /api/leads/:id
const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found.',
      });
    }

    // Salesperson can only update their own leads
    const assignedId = lead.assignedTo?._id
      ? String(lead.assignedTo._id)
      : (lead.assignedTo ? String(lead.assignedTo) : null);

    if (req.user.role === 'sales_person') {
      if (assignedId && assignedId !== String(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only edit your own leads.',
        });
      }
      if (!assignedId) {
        lead.assignedTo = req.user._id;
        lead.assignedRepName = req.user.name;
      }
    }

    const {
      company,
      name,
      title,
      email,
      phone,
      location,
      value,
      status,
      priority,
      source,
      assignedTo,
      notes,
      tags,
      stage,
    } = req.body;

    // Detect status / stage transition -> Auto-attach Timeline entry
    if (status && status !== lead.status) {
      lead.timeline.unshift({
        type: 'stage',
        title: `Moved to ${status}`,
        author: req.user.name,
        note: `Stage updated from "${lead.status}" to "${status}"`,
        time: new Date(),
      });
      lead.status = status;
    }

    // Detect priority transition -> Auto-attach Timeline entry
    if (priority && priority !== lead.priority) {
      lead.timeline.unshift({
        type: 'note',
        title: `Priority changed to ${priority}`,
        author: req.user.name,
        note: `Priority changed from "${lead.priority}" to "${priority}"`,
        time: new Date(),
      });
      lead.priority = priority;
    }

    // Detect reassignment -> Auto-attach Timeline entry
    if (assignedTo && String(assignedTo) !== String(lead.assignedTo)) {
      const newRep = await User.findById(assignedTo);
      const newRepName = newRep ? newRep.name : 'Unassigned';
      lead.timeline.unshift({
        type: 'lead',
        title: `Reassigned to ${newRepName}`,
        author: req.user.name,
        note: `Ownership transferred from ${lead.assignedRepName} to ${newRepName}`,
        time: new Date(),
      });
      lead.assignedTo = assignedTo;
      lead.assignedRepName = newRepName;
    }

    if (company) lead.company = company.trim();
    if (name) lead.name = name.trim();
    if (title !== undefined) lead.title = title ? title.trim() : '';
    if (email !== undefined) lead.email = email ? email.toLowerCase().trim() : '';
    if (phone !== undefined) lead.phone = phone ? phone.trim() : '';
    if (location !== undefined) lead.location = location ? location.trim() : '';
    if (value !== undefined) lead.value = Number(value);
    if (priority) lead.priority = priority;
    if (source) lead.source = source;
    if (notes !== undefined) lead.notes = notes;
    if (tags) lead.tags = Array.isArray(tags) ? tags : [];
    if (stage !== undefined) {
      if (typeof stage === 'string' && stage.match(/^[0-9a-fA-F]{24}$/)) {
        lead.stage = stage;
      } else if (!stage || stage === 'won' || stage === 'lost') {
        lead.stage = null;
      }
    }

    await lead.save();

    const populatedLead = await Lead.findById(lead._id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role')
      .populate('stage');

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully.',
      lead: populatedLead || lead,
    });
  } catch (error) {
    console.error('Error in updateLead:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while updating lead.',
    });
  }
};

// ─── 5. ADD TIMELINE NOTE / ACTIVITY LOG ─────────────────────────────────────
// POST /api/leads/:id/timeline
const addTimelineNote = async (req, res) => {
  try {
    const { type, title, note } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Note content is required.',
      });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found.',
      });
    }

    // Role check: Salesperson can only log notes on their own lead
    if (req.user.role === 'sales_person' && String(lead.assignedTo) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only log notes on your own leads.',
      });
    }

    lead.timeline.unshift({
      type: type || 'note',
      title: title || 'Logged Note',
      author: req.user.name,
      note: note.trim(),
      time: new Date(),
    });

    lead.lastContacted = new Date();
    await lead.save();

    res.status(201).json({
      success: true,
      message: 'Timeline note added successfully.',
      timeline: lead.timeline,
    });
  } catch (error) {
    console.error('Error in addTimelineNote:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while adding timeline note.',
    });
  }
};

// ─── 6. DELETE LEAD (Manager / Admin Only) ──────────────────────────────────
// DELETE /api/leads/:id
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found.',
      });
    }

    await Lead.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `Lead '${lead.company}' deleted successfully.`,
    });
  } catch (error) {
    console.error('Error in deleteLead:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while deleting lead.',
    });
  }
};

module.exports = {
  createLead,
  bulkCreateLeads,
  getLeads,
  getLeadById,
  updateLead,
  addTimelineNote,
  deleteLead,
};

