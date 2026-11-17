const Role = require('../models/Role');
const User = require('../models/User');

// ─── Default System Roles Definition ──────────────────────────────────────────
const DEFAULT_SYSTEM_ROLES = [
  {
    name: 'Super Administrator',
    slug: 'admin',
    description: 'Full system control, administrative settings, and complete access to all modules.',
    isSystem: true,
    isActive: true,
    permissions: [
      {
        module: 'leads',
        enabled: true,
        actions: ['view', 'create', 'edit', 'delete', 'export', 'reassign'],
      },
      {
        module: 'pipeline',
        enabled: true,
        actions: ['view', 'create', 'edit', 'delete', 'move_stage', 'override_value'],
      },
      {
        module: 'tasks',
        enabled: true,
        actions: ['view', 'create', 'edit', 'delete', 'assign_others'],
      },
      {
        module: 'reports',
        enabled: true,
        actions: ['view', 'export', 'download_pdf'],
      },
      {
        module: 'users',
        enabled: true,
        actions: ['view', 'create', 'edit', 'delete', 'suspend'],
      },
      {
        module: 'settings',
        enabled: true,
        actions: ['view', 'edit', 'manage_integrations', 'manage_roles'],
      },
    ],
  },
  {
    name: 'Sales Manager',
    slug: 'sales_manager',
    description: 'Manages sales teams, allocates leads, oversees pipeline stages, and views revenue reports.',
    isSystem: true,
    isActive: true,
    permissions: [
      {
        module: 'leads',
        enabled: true,
        actions: ['view', 'create', 'edit', 'export', 'reassign'],
      },
      {
        module: 'pipeline',
        enabled: true,
        actions: ['view', 'create', 'edit', 'move_stage', 'override_value'],
      },
      {
        module: 'tasks',
        enabled: true,
        actions: ['view', 'create', 'edit', 'delete', 'assign_others'],
      },
      {
        module: 'reports',
        enabled: true,
        actions: ['view', 'export', 'download_pdf'],
      },
      {
        module: 'users',
        enabled: true,
        actions: ['view'],
      },
      {
        module: 'settings',
        enabled: false,
        actions: ['view'],
      },
    ],
  },
  {
    name: 'Sales Representative',
    slug: 'sales_person',
    description: 'Handles assigned leads, client calls, updates personal pipeline deals, and schedules tasks.',
    isSystem: true,
    isActive: true,
    permissions: [
      {
        module: 'leads',
        enabled: true,
        actions: ['view', 'create', 'edit'],
      },
      {
        module: 'pipeline',
        enabled: true,
        actions: ['view', 'create', 'edit', 'move_stage'],
      },
      {
        module: 'tasks',
        enabled: true,
        actions: ['view', 'create', 'edit'],
      },
      {
        module: 'reports',
        enabled: true,
        actions: ['view'],
      },
      {
        module: 'users',
        enabled: false,
        actions: [],
      },
      {
        module: 'settings',
        enabled: false,
        actions: [],
      },
    ],
  },
];

// Helper: Seed default roles if none exist in the database
async function seedDefaultRolesIfEmpty() {
  const count = await Role.countDocuments();
  if (count === 0) {
    for (const roleData of DEFAULT_SYSTEM_ROLES) {
      await Role.create(roleData);
    }
    console.log('✅ Default system roles seeded successfully.');
  }
}

// ─── 1. GET ALL ROLES ─────────────────────────────────────────────────────────
// GET /api/roles
const getRoles = async (req, res) => {
  try {
    await seedDefaultRolesIfEmpty();

    const roles = await Role.find().sort({ isSystem: -1, createdAt: 1 });

    // Calculate user count assigned to each role slug
    const userCounts = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    userCounts.forEach((item) => {
      if (item._id) countMap[item._id] = item.count;
    });

    const rolesWithCounts = roles.map((role) => {
      const plain = role.toObject();
      plain.userCount = countMap[role.slug] || 0;
      return plain;
    });

    res.status(200).json({
      success: true,
      count: rolesWithCounts.length,
      roles: rolesWithCounts,
    });
  } catch (error) {
    console.error('Error in getRoles:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while fetching roles.',
    });
  }
};

// ─── 2. GET SINGLE ROLE BY ID OR SLUG ─────────────────────────────────────────
// GET /api/roles/:id
const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id.toLowerCase() };
    const role = await Role.findOne(query);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found.',
      });
    }

    const userCount = await User.countDocuments({ role: role.slug });

    res.status(200).json({
      success: true,
      role: {
        ...role.toObject(),
        userCount,
      },
    });
  } catch (error) {
    console.error('Error in getRoleById:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while fetching role.',
    });
  }
};

// ─── 3. CREATE NEW CUSTOM ROLE (Admin Only) ───────────────────────────────────
// POST /api/roles
const createRole = async (req, res) => {
  try {
    const { name, slug, description, permissions, isActive } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Role name is required.',
      });
    }

    const computedSlug = slug
      ? slug.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_')
      : name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '');

    const existingRole = await Role.findOne({
      $or: [{ name: name.trim() }, { slug: computedSlug }],
    });

    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'A role with this name or slug already exists.',
      });
    }

    const newRole = await Role.create({
      name: name.trim(),
      slug: computedSlug,
      description: description ? description.trim() : '',
      isSystem: false,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      permissions: Array.isArray(permissions) ? permissions : [],
    });

    res.status(201).json({
      success: true,
      message: `Custom role '${newRole.name}' created successfully.`,
      role: newRole,
    });
  } catch (error) {
    console.error('Error in createRole:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while creating role.',
    });
  }
};

// ─── 4. UPDATE ROLE (Admin Only) ──────────────────────────────────────────────
// PUT /api/roles/:id
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissions, isActive } = req.body;

    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id.toLowerCase() };
    const role = await Role.findOne(query);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found.',
      });
    }

    // System roles protection: Cannot rename core system role slugs
    if (role.isSystem && name && name.trim() !== role.name) {
      return res.status(400).json({
        success: false,
        message: `System role '${role.name}' name cannot be renamed.`,
      });
    }

    if (name && !role.isSystem) role.name = name.trim();
    if (description !== undefined) role.description = description.trim();
    if (isActive !== undefined) role.isActive = Boolean(isActive);
    if (Array.isArray(permissions)) role.permissions = permissions;

    await role.save();

    res.status(200).json({
      success: true,
      message: `Role '${role.name}' updated successfully.`,
      role,
    });
  } catch (error) {
    console.error('Error in updateRole:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while updating role.',
    });
  }
};

// ─── 5. DELETE ROLE (Admin Only) ──────────────────────────────────────────────
// DELETE /api/roles/:id
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id.toLowerCase() };
    const role = await Role.findOne(query);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found.',
      });
    }

    if (role.isSystem) {
      return res.status(400).json({
        success: false,
        message: `System role '${role.name}' cannot be deleted.`,
      });
    }

    // Check if any active user is assigned to this role
    const assignedUsers = await User.countDocuments({ role: role.slug });
    if (assignedUsers > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete role '${role.name}'. It is currently assigned to ${assignedUsers} user(s). Reassign them first.`,
      });
    }

    await Role.findByIdAndDelete(role._id);

    res.status(200).json({
      success: true,
      message: `Role '${role.name}' deleted successfully.`,
    });
  } catch (error) {
    console.error('Error in deleteRole:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while deleting role.',
    });
  }
};

module.exports = {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  seedDefaultRolesIfEmpty,
};

