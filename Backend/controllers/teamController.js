const Team = require('../models/Team');
const User = require('../models/User');
const Department = require('../models/Department');

// GET /api/teams (List all teams with populated details)
const getTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('department', 'name code')
      .populate('manager', 'name email role phone avatar status')
      .populate('members', 'name email role phone avatar status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      teams,
    });
  } catch (error) {
    console.error('Error in getTeams:', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching teams' });
  }
};

// GET /api/teams/my-team (Logged-in Manager fetches their own team & members)
const getMyTeam = async (req, res) => {
  try {
    const team = await Team.findOne({ manager: req.user._id })
      .populate('department', 'name code')
      .populate('manager', 'name email role phone')
      .populate('members', 'name email role phone status');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'No active team assigned to this manager.',
      });
    }

    res.status(200).json({
      success: true,
      team,
      members: team.members,
    });
  } catch (error) {
    console.error('Error in getMyTeam:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// GET /api/teams/:id (Get single team)
const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('department', 'name code')
      .populate('manager', 'name email role phone')
      .populate('members', 'name email role phone');

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    res.status(200).json({ success: true, team });
  } catch (error) {
    console.error('Error in getTeamById:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// POST /api/teams (Create team - Admin only)
const createTeam = async (req, res) => {
  try {
    const { name, department, manager, members, targetQuota, description } = req.body;

    if (!name || !department || !manager) {
      return res.status(400).json({
        success: false,
        message: 'Team name, department ID, and manager ID are required.',
      });
    }

    // Verify Department exists
    const deptExists = await Department.findById(department);
    if (!deptExists) {
      return res.status(404).json({ success: false, message: 'Selected department does not exist' });
    }

    // Verify Manager exists
    const mgrUser = await User.findById(manager);
    if (!mgrUser) {
      return res.status(404).json({ success: false, message: 'Selected manager does not exist' });
    }

    const team = await Team.create({
      name: name.trim(),
      department,
      manager,
      members: Array.isArray(members) ? members : [],
      targetQuota: Number(targetQuota) || 0,
      description: description ? description.trim() : '',
    });

    const populatedTeam = await Team.findById(team._id)
      .populate('department', 'name code')
      .populate('manager', 'name email role')
      .populate('members', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Team created successfully.',
      team: populatedTeam,
    });
  } catch (error) {
    console.error('Error in createTeam:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// PUT /api/teams/:id (Update team - Admin only)
const updateTeam = async (req, res) => {
  try {
    const { name, department, manager, members, targetQuota, description } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (name) team.name = name.trim();
    if (department) team.department = department;
    if (manager) team.manager = manager;
    if (members !== undefined) team.members = Array.isArray(members) ? members : [];
    if (targetQuota !== undefined) team.targetQuota = Number(targetQuota);
    if (description !== undefined) team.description = description.trim();

    await team.save();

    const populatedTeam = await Team.findById(team._id)
      .populate('department', 'name code')
      .populate('manager', 'name email role')
      .populate('members', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Team updated successfully.',
      team: populatedTeam,
    });
  } catch (error) {
    console.error('Error in updateTeam:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// DELETE /api/teams/:id (Delete team - Admin only)
const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    await Team.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `Team '${team.name}' deleted successfully.`,
    });
  } catch (error) {
    console.error('Error in deleteTeam:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

module.exports = {
  getTeams,
  getMyTeam,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
};

