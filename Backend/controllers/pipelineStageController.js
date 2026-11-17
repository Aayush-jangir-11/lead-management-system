const PipelineStage = require('../models/PipelineStage');
const Lead = require('../models/Lead');
const Task = require('../models/Task');

// ───  GET ALL STAGES ─────────────────────────────────────────────────────────
// GET /api/pipeline/stages
const getStages = async (req, res) => {
  try {
    const stages = await PipelineStage.find().sort({ order: 1 });

    res.status(200).json({
      success: true,
      count: stages.length,
      data: stages,
    });
  } catch (error) {
    console.error('Error in getStages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pipeline stages.',
      error: error.message,
    });
  }
};

// ───  CREATE STAGE ───────────────────────────────────────────────────────────
// POST /api/pipeline/stages
const createStage = async (req, res) => {
  try {
    const { name, targetOrder } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Stage name is required.',
      });
    }

    const trimmedName = name.trim();
    const existing = await PipelineStage.findOne({
      name: trimmedName,
    }).collation({
      locale: 'en',
      strength: 2,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A pipeline stage with this name already exists.',
      });
    }

    const totalCount = await PipelineStage.countDocuments();
    let finalOrder = totalCount + 1;

    // If an insertion order is specified (e.g. inserting between stage 2 and 3)
    if (targetOrder && Number(targetOrder) >= 1 && Number(targetOrder) <= totalCount) {
      finalOrder = Number(targetOrder);
      // Shift all stages at or after targetOrder up by 1
      await PipelineStage.updateMany(
        { order: { $gte: finalOrder } },
        { $inc: { order: 1 } }
      );
    }

    const newStage = await PipelineStage.create({
      name: trimmedName,
      order: finalOrder,
      isSystemDefault: false,
    });

    res.status(201).json({
      success: true,
      message: `Stage '${newStage.name}' created successfully.`,
      data: newStage,
    });
  } catch (error) {
    console.error('Error in createStage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create pipeline stage.',
      error: error.message,
    });
  }
};

// ───  REORDER STAGES (Batch sequence update) ────────────────────────────────
// PUT /api/pipeline/stages/reorder
const reorderStages = async (req, res) => {
  try {
    const { stageIds } = req.body; // Array of stage IDs in desired sequence

    if (!Array.isArray(stageIds) || stageIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'stageIds array is required for reordering.',
      });
    }

    const bulkOps = stageIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order: index + 1 } },
      },
    }));

    await PipelineStage.bulkWrite(bulkOps);

    const reordered = await PipelineStage.find().sort({ order: 1 });

    res.status(200).json({
      success: true,
      message: 'Pipeline stages reordered successfully.',
      data: reordered,
    });
  } catch (error) {
    console.error('Error in reorderStages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder pipeline stages.',
      error: error.message,
    });
  }
};

// ───  UPDATE STAGE NAME ─────────────────────────────────────────────────────
// PUT /api/pipeline/stages/:id
const updateStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Stage name is required.',
      });
    }

    const stage = await PipelineStage.findById(id);
    if (!stage) {
      return res.status(404).json({
        success: false,
        message: 'Pipeline stage not found.',
      });
    }

    // Check duplicate stage name (case-insensitive)
    const existing = await PipelineStage.findOne({
      _id: { $ne: id },
      name: name.trim(),
    }).collation({
      locale: 'en',
      strength: 2,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A pipeline stage with this name already exists.',
      });
    }

    stage.name = name.trim();
    await stage.save();

    res.status(200).json({
      success: true,
      message: 'Stage updated successfully.',
      data: stage,
    });
  } catch (error) {
    console.error('Error in updateStage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update pipeline stage.',
      error: error.message,
    });
  }
};

// ─── 5. DELETE STAGE (With Safety Checks) ─────────────────────────────────────
// DELETE /api/pipeline/stages/:id
const deleteStage = async (req, res) => {
  try {
    const { id } = req.params;

    const stage = await PipelineStage.findById(id);
    if (!stage) {
      return res.status(404).json({
        success: false,
        message: 'Pipeline stage not found.',
      });
    }

    if (stage.isSystemDefault) {
      return res.status(400).json({
        success: false,
        message: 'System default stages (Won / Inbound) cannot be deleted.',
      });
    }

    // Safety Check: Are there active deals in this stage?
    const activeDealsCount = await Lead.countDocuments({ stage: id });
    if (activeDealsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete stage '${stage.name}' because it contains ${activeDealsCount} active deals. Please move them to another stage first.`,
      });
    }

    const deletedOrder = stage.order;
    await PipelineStage.findByIdAndDelete(id);

    // Shift remaining stages down to keep order contiguous (1, 2, 3...)
    await PipelineStage.updateMany(
      { order: { $gt: deletedOrder } },
      { $inc: { order: -1 } }
    );

    const remaining = await PipelineStage.find().sort({ order: 1 });

    res.status(200).json({
      success: true,
      message: `Stage '${stage.name}' deleted successfully.`,
      data: remaining,
    });
  } catch (error) {
    console.error('Error in deleteStage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete pipeline stage.',
      error: error.message,
    });
  }
};

// ─── 6. SAVE DYNAMIC STAGE SECTIONS FOR A DEAL ────────────────────────────────
// PUT /api/pipeline/deals/:dealId/stage-sections
const saveDealStageSections = async (req, res) => {
  try {
    const { dealId } = req.params;
    const { stageId, sections } = req.body;

    if (!stageId || !Array.isArray(sections)) {
      return res.status(400).json({
        success: false,
        message: 'stageId and sections array are required.',
      });
    }

    const lead = await Lead.findById(dealId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Deal/Lead record not found.',
      });
    }

    const assignedId = lead.assignedTo?._id
      ? String(lead.assignedTo._id)
      : (lead.assignedTo ? String(lead.assignedTo) : null);
    if (req.user.role === 'sales_person' && assignedId && assignedId !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only update sections on your own leads.',
      });
    }

    // Add author and timestamp if not already provided
    const enrichedSections = sections.map((sec) => ({
      id: sec.id || `sec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: sec.title,
      content: sec.content,
      recordedBy: req.user ? req.user.name : 'Sales Rep',
      recordedAt: new Date(),
    }));

    if (!lead.stageSections) {
      lead.stageSections = new Map();
    }

    lead.stageSections.set(stageId.toString(), enrichedSections);
    lead.markModified('stageSections');

    // Fetch stage name for descriptive timeline entry
    let stageName = 'Stage';
    if (typeof stageId === 'string' && stageId.match(/^[0-9a-fA-F]{24}$/)) {
      const stageDoc = await PipelineStage.findById(stageId);
      if (stageDoc) stageName = stageDoc.name;
    }

    // Auto-attach timeline activity record
    lead.timeline.unshift({
      type: 'note',
      title: `Stage Info Documented (${stageName})`,
      author: req.user ? req.user.name : 'Sales Representative',
      note: `${enrichedSections.length} requirement section(s) recorded for "${stageName}".`,
      time: new Date(),
    });

    await lead.save();

    const populatedLead = await Lead.findById(lead._id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role')
      .populate('stage');

    res.status(200).json({
      success: true,
      message: 'Stage information sections saved successfully.',
      data: populatedLead || lead,
    });
  } catch (error) {
    console.error('Error in saveDealStageSections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save stage information sections.',
      error: error.message,
    });
  }
};

// ─── 7. UPDATE STAGE FORM FIELDS TEMPLATE (Manager/Admin decides form fields) ─
// PUT /api/pipeline/stages/:id/form-fields
const updateStageFormFields = async (req, res) => {
  try {
    const { id } = req.params;
    const { formFields } = req.body;

    if (!Array.isArray(formFields)) {
      return res.status(400).json({
        success: false,
        message: 'formFields array is required.',
      });
    }

    const stage = await PipelineStage.findById(id);
    if (!stage) {
      return res.status(404).json({
        success: false,
        message: 'Pipeline stage not found.',
      });
    }

    // Clean and validate form fields
    const sanitizedFields = formFields
      .filter((f) => f && f.label && f.label.trim().length > 0)
      .map((f, idx) => ({
        id: f.id || `fld_${Date.now()}_${idx}`,
        label: f.label.trim(),
        placeholder: f.placeholder ? f.placeholder.trim() : '',
        fieldType: ['text', 'textarea', 'number'].includes(f.fieldType) ? f.fieldType : 'textarea',
        required: Boolean(f.required),
      }));

    stage.formFields = sanitizedFields;
    await stage.save();

    res.status(200).json({
      success: true,
      message: `Form fields updated for stage '${stage.name}'.`,
      data: stage,
    });
  } catch (error) {
    console.error('Error in updateStageFormFields:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stage form fields.',
      error: error.message,
    });
  }
};

// ─── 8. UPDATE STAGE REMINDER ──────────────────────────────────────────────────
// PUT /api/pipeline/stages/:id/reminder
const updateStageReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reminder } = req.body; // { date, time, note } or null

    const stage = await PipelineStage.findById(id);
    if (!stage) {
      return res.status(404).json({
        success: false,
        message: 'Pipeline stage not found.',
      });
    }

    if (reminder && reminder.date) {
      const defaultTitle = `Stage Follow-up: ${stage.name}`;
      stage.reminder = {
        title: reminder.title && reminder.title.trim() ? reminder.title.trim() : defaultTitle,
        date: new Date(reminder.date),
        time: reminder.time || '11:00 AM',
        note: reminder.note ? reminder.note.trim() : '',
        setBy: req.user ? req.user.name : 'Manager',
      };

      // Also create / sync Task in Task collection for the manager / reps
      try {
        const leadCount = await Lead.countDocuments({ stage: stage._id });
        const formattedDueDate = stage.reminder.date
          ? new Date(stage.reminder.date).toISOString().split('T')[0]
          : 'Today';

        await Task.create({
          type: 'Reminder',
          title: `${stage.reminder.title} (${leadCount} Deals)`,
          description: stage.reminder.note || `Stage follow-up review for all deals in '${stage.name}'`,
          category: 'Pipeline Review',
          dueDate: formattedDueDate,
          dueTime: stage.reminder.time || '11:00 AM',
          priority: 'High',
          assignedRep: req.user ? req.user._id : null,
          createdBy: req.user ? req.user._id : null,
        });
      } catch (taskErr) {
        console.error('Failed to create synced task for stage reminder:', taskErr);
      }
    } else {
      // Clear stage reminder
      stage.reminder = {
        title: '',
        date: null,
        time: '',
        note: '',
        setBy: '',
      };
    }

    await stage.save();

    res.status(200).json({
      success: true,
      message: reminder && reminder.date ? 'Stage reminder scheduled successfully.' : 'Stage reminder cleared.',
      data: stage,
    });
  } catch (error) {
    console.error('Error in updateStageReminder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stage reminder.',
      error: error.message,
    });
  }
};

module.exports = {
  getStages,
  createStage,
  reorderStages,
  updateStage,
  deleteStage,
  saveDealStageSections,
  updateStageFormFields,
  updateStageReminder,
};

