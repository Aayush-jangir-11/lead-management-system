const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    // Task Type
    type: {
      type: String,
      enum: ['Task', 'Reminder', 'Follow-up', 'Meeting', 'Call'],
      default: 'Task',
    },

    // Task Title
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },

    // Task Description / Details
    description: {
      type: String,
      trim: true,
      default: '',
    },

    // Category / Tag
    category: {
      type: String,
      trim: true,
      default: 'General Work',
    },

    // Lead Reference (Optional - sirf tab bhara jayega jab task kisi specific lead se linked ho)
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      default: null,
    },

    // Contact/Company Details (Optional)
    linkedCompany: {
      type: String,
      trim: true,
      default: '',
    },

    linkedContact: {
      type: String,
      trim: true,
      default: '',
    },

    phone: {
      type: String,
      trim: true,
      default: '',
    },

    email: {
      type: String,
      trim: true,
      default: '',
    },

    // Due Date & Time
    dueDate: {
      type: String,
      required: [true, 'Due date is required'],
      default: 'Today',
    },

    dueTime: {
      type: String,
      default: '11:00 AM',
    },

    // Priority
    priority: {
      type: String,
      enum: ['Urgent', 'High', 'Medium', 'Low'],
      default: 'Medium',
    },

    // Status
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
    },

    isOverdue: {
      type: Boolean,
      default: false,
    },

    // Assigned Sales Person (Jisko task karna hai)
    assignedRep: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigned user is required'],
    },

    // Created By (Manager ya Admin jisne task assign kiya)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user is required'],
    },
  },
  {
    timestamps: true, // auto createdAt & updatedAt
  }
);

module.exports = mongoose.model('Task', taskSchema);

