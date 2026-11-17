const mongoose = require('mongoose');

const pipelineStageSchema = new mongoose.Schema(
  {
    // Stage Display Name (e.g. 'Discovery & Demo', 'Proposal Sent')
    name: {
      type: String,
      required: [true, 'Stage name is required'],
      trim: true,
    },

    // Funnel Sequence: 1, 2, 3, 4, 5... (Used for column ordering)
    order: {
      type: Number,
      required: true,
      default: 1,
    },

    // System Protection Flag:
    // Won / Initial stages cannot be deleted to prevent pipeline corruption
    isSystemDefault: {
      type: Boolean,
      default: false,
    },

    // Dynamic Form Questionnaire Template for this Stage
    // Decided by Manager/Admin so reps collect structured data in this stage
    formFields: [
      {
        id: { type: String },
        label: { type: String, required: true }, // Question/Title e.g. "Client Pain Points"
        placeholder: { type: String, default: '' },
        fieldType: {
          type: String,
          enum: ['text', 'textarea', 'number'],
          default: 'textarea',
        },
        required: { type: Boolean, default: false },
      },
    ],

    // Stage-Level Follow-up Review Reminder (For Manager/Team Routine)
    reminder: {
      title: { type: String, default: '', trim: true },
      date: { type: Date, default: null },
      time: { type: String, default: '' },
      note: { type: String, default: '' },
      setBy: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
    // Schema-level collation: English locale, strength 2 (case-insensitive string comparison)
    collation: { locale: 'en', strength: 2 },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 1. Sequence index for fast ascending order sorting
pipelineStageSchema.index({ order: 1 });

// 2. Case-Insensitive Unique Name Index:
// Prevents duplicate stage names with different casing (e.g. 'Discovery' vs 'discovery')
pipelineStageSchema.index(
  { name: 1 },
  {
    unique: true,
    collation: { locale: 'en', strength: 2 },
  }
);

const PipelineStage = mongoose.model('PipelineStage', pipelineStageSchema);

module.exports = PipelineStage;
