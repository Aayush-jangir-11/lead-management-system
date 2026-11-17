const Department = require('../models/Department');
const Team = require('../models/Team');

// GET /api/departments (List all departments)
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ createdAt: -1 });

    // Har department ke linked teams count nikaalna
    const departmentsWithCounts = await Promise.all(
      departments.map(async (dept) => {
        const teamsCount = await Team.countDocuments({ department: dept._id });
        return {
          ...dept.toObject(),
          teamsCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      departments: departmentsWithCounts,
    });
  } catch (error) {
    console.error('Error in getDepartments:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching departments',
    });
  }
};

// GET /api/departments/:id (Get single department)
const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    const teams = await Team.find({ department: department._id })
      .populate('manager', 'name email role')
      .populate('members', 'name email role');

    res.status(200).json({
      success: true,
      department,
      teams,
    });
  } catch (error) {
    console.error('Error in getDepartmentById:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// POST /api/departments (Create department - Admin only)
const createDepartment = async (req, res) => {
  try {
    const { name, code, description, headName } = req.body;

    if (!name || !code || !headName) {
      return res.status(400).json({
        success: false,
        message: 'Name, code, and headName are required fields.',
      });
    }

    const existingCode = await Department.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: `Department code '${code}' already exists.`,
      });
    }

    const department = await Department.create({
      name: name.trim(),
      code: code.toUpperCase().trim(),
      description: description ? description.trim() : '',
      headName: headName.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully.',
      department,
    });
  } catch (error) {
    console.error('Error in createDepartment:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// PUT /api/departments/:id (Update department - Admin only)
const updateDepartment = async (req, res) => {
  try {
    const { name, code, description, headName } = req.body;
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    if (code && code.toUpperCase() !== department.code) {
      const existingCode = await Department.findOne({ code: code.toUpperCase() });
      if (existingCode) {
        return res.status(400).json({ success: false, message: 'Department code already in use' });
      }
      department.code = code.toUpperCase().trim();
    }

    if (name) department.name = name.trim();
    if (headName) department.headName = headName.trim();
    if (description !== undefined) department.description = description.trim();

    await department.save();

    res.status(200).json({
      success: true,
      message: 'Department updated successfully.',
      department,
    });
  } catch (error) {
    console.error('Error in updateDepartment:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// DELETE /api/departments/:id (Delete department - Admin only)
const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    // Check if teams are linked
    const linkedTeamsCount = await Team.countDocuments({ department: department._id });
    if (linkedTeamsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department: ${linkedTeamsCount} active teams are assigned to it.`,
      });
    }

    await Department.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `Department '${department.name}' deleted successfully.`,
    });
  } catch (error) {
    console.error('Error in deleteDepartment:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
