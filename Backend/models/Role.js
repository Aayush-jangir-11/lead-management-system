const mongoose = require('mongoose');

// ─── 1. MODULE PERMISSION SUB-SCHEMA ─────────────────────────────────────────
// Defines granular access for each system module (e.g. leads, pipeline, tasks, reports, users, settings)
const permissionSchema = new mongoose.Schema(
  {
    module: {
      type: String,
      required: [true, 'Permission module name is required'],
      trim: true,
      lowercase: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    actions: {
      type: [String],
      default: ['view'],
      // Available actions: ['view', 'create', 'edit', 'delete', 'export', 'reassign', 'move_stage', 'override_value', 'suspend']
    },
  },
  { _id: false }
);

// ─── 2. ROLE SCHEMA ──────────────────────────────────────────────────────────
const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      unique: true,
      trim: true,
    },

    slug: {
      type: String,
      required: [true, 'Role slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      // e.g. 'admin', 'sales_manager', 'sales_person', 'enterprise_ae'
    },

    description: {
      type: String,
      trim: true,
      default: '',
    },

    isSystem: {
      type: Boolean,
      default: false,
      // System roles (like 'admin') cannot be deleted or have critical permissions revoked
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    permissions: {
      type: [permissionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug from name before saving if slug was not explicitly provided
roleSchema.pre('save', function () {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }
});

module.exports = mongoose.model('Role', roleSchema);

