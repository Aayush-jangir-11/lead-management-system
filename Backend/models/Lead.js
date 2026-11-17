const mongoose = require('mongoose');

// Sub-schema: Har Lead se judi Timeline (Calls, Meetings, Notes, Stage Updates)
const timelineItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['call', 'meeting', 'email', 'note', 'stage', 'lead'],
      default: 'note',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      default: 'System',
      trim: true,
    },
    time: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: true }
);

// Main Lead Schema
const leadSchema = new mongoose.Schema(
  {
    // Custom Readable ID (e.g. LD-1001)
    leadId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    // Organization & Contact Info
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Contact person name is required'],
      trim: true,
    },
    title: {
      type: String,
      default: '', // Designation e.g. 'VP Procurement'
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      default: '', // e.g. 'Mumbai, Maharashtra'
      trim: true,
    },

    // Deal Economics
    value: {
      type: Number,
      required: [true, 'Deal value is required'],
      min: 0,
      default: 0,
    },

    // Pipeline Stage Reference (MongoDB ObjectId of PipelineStage)
    stage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PipelineStage',
      default: null,
      index: true,
    },

    // Dynamic Job-Form Stage Notes collected by sales reps
    // Format: { [stageIdOrMongoId]: [ { id, title, content, recordedBy, recordedAt } ] }
    stageSections: {
      type: Map,
      of: [
        {
          id: { type: String },
          title: { type: String, required: true },
          content: { type: String, required: true },
          recordedBy: { type: String, default: 'Sales Rep' },
          recordedAt: { type: Date, default: Date.now },
        },
      ],
      default: {},
    },

    // General Status / Lifecycle tag (e.g. 'New Lead', 'Active', 'Won', 'Lost')
    status: {
      type: String,
      default: 'New Lead',
      trim: true,
    },

    priority: {
      type: String,
      enum: ['Urgent', 'High', 'Medium', 'Low'],
      default: 'Medium',
    },

    // Acquisition Source
    source: {
      type: String,
      default: 'Inbound Website Form',
      trim: true,
    },

    // Assignment & Ownership (User Reference)
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedRepName: {
      type: String,
      default: 'Unassigned',
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Notes & Tags
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // Embedded Timeline History (Calls, Meetings, Stage updates)
    timeline: [timelineItemSchema],

    lastContacted: {
      type: Date,
      default: null,
    },

    // Next Scheduled Follow-up / Reminder for Pipeline & Stage Progression
    nextFollowUp: {
      date: {
        type: Date,
        default: null,
      },
      time: {
        type: String,
        default: '',
        trim: true,
      },
      note: {
        type: String,
        default: '',
        trim: true,
      },
    },
  },
  {
    timestamps: true, // Auto createdAt & updatedAt
  }
);

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;
