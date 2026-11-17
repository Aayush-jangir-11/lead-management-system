const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Team = require('../models/Team');

// Password Validation Regex: At least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]).{8,}$/;

// ─── 1. CREATE USER (Admin Only) ─────────────────────────────────────────────
// POST /api/users
const createUser = async (req, res) => {
  try {
    const {
      userId,
      name,
      email,
      phone,
      password,
      role,
      employeeId,
      department,
      manager,
      status,
    } = req.body;

    // 1. Basic validation (name and email are required)
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required fields.',
      });
    }

    // Default password to 'Leadflow@123' if not manually provided
    const rawPassword = password && password.trim().length > 0 ? password.trim() : 'Leadflow@123';

    if (!PASSWORD_REGEX.test(rawPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
      });
    }

    // 2. Check for duplicate email
    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    // 3. Format or auto-generate userId if not provided
    let finalUserId = userId && userId.trim() ? userId.trim() : null;
    if (finalUserId) {
      const existingUserId = await User.findOne({ userId: finalUserId });
      if (existingUserId) {
        return res.status(400).json({
          success: false,
          message: `User ID '${finalUserId}' is already assigned to another user.`,
        });
      }
    } else {
      const userCount = await User.countDocuments();
      finalUserId = `USR-${String(userCount + 1).padStart(2, '0')}`;
    }

    // 4. Check for duplicate employeeId if provided
    if (employeeId && employeeId.trim()) {
      const existingEmpId = await User.findOne({ employeeId: employeeId.trim() });
      if (existingEmpId) {
        return res.status(400).json({
          success: false,
          message: `Employee ID '${employeeId}' is already assigned to another user.`,
        });
      }
    }

    // 5. Hash password with bcrypt before saving
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    // 6. Create new user with hashed password & userId
    const newUser = await User.create({
      userId: finalUserId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : null,
      password: hashedPassword,
      role: role || 'sales_person',
      employeeId: employeeId ? employeeId.trim() : null,
      department: department || null,
      manager: manager || null,
      status: status || 'active',
    });

    // 7. Exclude password in response
    const sanitizedUser = newUser.toObject();
    delete sanitizedUser.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      user: sanitizedUser,
    });
  } catch (error) {
    console.error('Error in createUser:', error);

    // Mongoose duplicate key error fallback (code 11000)
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0] || 'field';
      return res.status(400).json({
        success: false,
        message: `A user with this ${duplicateField} already exists.`,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while creating user.',
    });
  }
};

// ─── 2. GET USERS (Role-Based Scoped: Admin sees all, Manager sees team, Rep sees self) ────
// GET /api/users
const getUsers = async (req, res) => {
  try {
    const userRole = req.user ? req.user.role : 'admin';
    const userId = req.user ? req.user._id : null;

    let filter = {};

    // 1. ADMIN -> Can see all users across the entire organization
    if (userRole === 'admin') {
      filter = {};
    }
    // 2. SALES MANAGER -> Only see members of their assigned team + manager themselves
    else if (userRole === 'sales_manager') {
      // Find the team managed by this manager
      const myTeam = await Team.findOne({ manager: userId });

      if (myTeam && myTeam.members && myTeam.members.length > 0) {
        // Manager's own ID + all member IDs of their team
        const allowedIds = [userId, ...myTeam.members];
        filter = { _id: { $in: allowedIds } };
      } else {
        // Fallback: If team not set yet, check direct User.manager reference, self, or all sales representatives
        filter = { $or: [{ _id: userId }, { manager: userId }, { role: 'sales_person' }] };
      }
    }
    // 3. SALES PERSON -> Only see themselves
    else if (userRole === 'sales_person') {
      filter = { _id: userId };
    }

    const users = await User.find(filter)
      .populate('department', 'name code')
      .populate('manager', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('Error in getUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching users.',
    });
  }
};

// ─── 3. GET SINGLE USER ──────────────────────────────────────────────────────
// GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('department', 'name code')
      .populate('manager', 'name email role');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching user.',
    });
  }
};

// ─── 4. UPDATE USER ──────────────────────────────────────────────────────────
// PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const { userId, name, phone, password, role, employeeId, department, manager, status } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Update password if provided
    if (password && password.trim().length > 0) {
      const trimmedPassword = password.trim();
      if (!PASSWORD_REGEX.test(trimmedPassword)) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
        });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(trimmedPassword, salt);
    }

    // Update fields
    if (userId !== undefined) user.userId = userId ? userId.trim() : user.userId;
    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone ? phone.trim() : null;
    if (role) user.role = role;
    if (employeeId !== undefined) user.employeeId = employeeId ? employeeId.trim() : null;
    if (department !== undefined) user.department = department || null;
    if (manager !== undefined) user.manager = manager || null;
    if (status) user.status = status;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      user,
    });
  } catch (error) {
    console.error('Error in updateUser:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating user.',
    });
  }
};

// ─── 5. DELETE USER (Admin Only) ─────────────────────────────────────────────
// DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Prevent admin from deleting themselves
    if (req.user && req.user._id && req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account.',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `User '${user.name}' deleted successfully.`,
    });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting user.',
    });
  }
};

// ─── 6. TOGGLE USER STATUS / SUSPEND (Admin Only) ───────────────────────────
// PUT /api/users/:id/status
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Prevent admin from suspending their own account
    if (req.user && req.user._id && req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot suspend your own account.',
      });
    }

    // Toggle between active and suspended
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    user.status = nextStatus;

    await user.save();

    res.status(200).json({
      success: true,
      message: `User '${user.name}' is now ${nextStatus}.`,
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Error in toggleUserStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating user status.',
    });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
};
