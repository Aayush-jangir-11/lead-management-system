const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
      default: null,
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // never returned in queries by default
    },

    role: {
      type: String,
      enum: ['admin', 'sales_manager', 'sales_person'],
      default: 'sales_person',
    },

    userId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      default: null, // e.g. 'USR-01'
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },

    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // self-reference to another User
      default: null,
    },

    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
  },
  {
    timestamps: true, // createdAt, updatedAt auto
  }
);

module.exports = mongoose.model('User', userSchema);