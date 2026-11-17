const mongoose = require('mongoose');

const callLogSchema = new mongoose.Schema(
  {
    // 1. Associated Lead Reference
    // Contact Name, Company Name, and Phone are populated from here
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'Associated lead reference is required'],
      index: true,
    },

    // 2. Associated Salesperson Reference
    // Rep Name and Avatar are populated from here
    salesperson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Salesperson reference is required'],
      index: true,
    },

    // 3. Dynamic Pipeline Stage Reference (Optional - which stage deal was in during the call)
    stage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PipelineStage',
      default: null,
      index: true,
    },

    // 4. Dynamic Call Type
    // Fully flexible string without rigid enums to support custom dynamic stages
    callType: {
      type: String,
      required: [true, 'Call type is required'],
      trim: true,
      default: 'Discovery Call',
    },

    duration: {
      type: String, // e.g. '12 mins', '18 mins'
      default: '10 mins',
      trim: true,
    },
    callDate: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // 5. Outcome & Sales Feedback
    outcome: {
      type: String,
      required: [true, 'Call outcome is required'],
      trim: true,
      default: 'Follow-up Required',
    },
    outcomeStatus: {
      type: String,
      enum: ['positive', 'needs_action', 'closed', 'pending'],
      default: 'pending',
    },
    notes: {
      type: String,
      required: [true, 'Call discussion feedback notes are required'],
      trim: true,
    },

    // 6. Next Scheduled Follow-up
    nextFollowUp: {
      type: String, // e.g. 'Tomorrow, 02:00 PM'
      default: 'TBD',
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for fast queries
callLogSchema.index({ salesperson: 1, callDate: -1 });
callLogSchema.index({ lead: 1, callDate: -1 });
callLogSchema.index({ stage: 1 });

const CallLog = mongoose.model('CallLog', callLogSchema);

module.exports = CallLog;
