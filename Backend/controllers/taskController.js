const Task = require('../models/Task');
const Team = require('../models/Team');
const User = require('../models/User');

// GET ALL TASKS (Role-Scoped: Admin sees all, Manager sees team, Rep sees own) 
// GET /api/tasks
const getTasks = async (req, res) => {
  try {
    const userRole = req.user ? req.user.role : 'admin';
    const userId = req.user ? req.user._id : null;

    let filter = {};

    // 1. ADMIN -> Can see all tasks across the company
    if (userRole === 'admin') {
      filter = {};
    }
    // 2. SALES MANAGER -> Sees tasks assigned to their team members + themselves
    else if (userRole === 'sales_manager') {
      const myTeam = await Team.findOne({ manager: userId });
      if (myTeam && myTeam.members && myTeam.members.length > 0) {
        const teamMemberIds = [userId, ...myTeam.members];
        filter = { assignedRep: { $in: teamMemberIds } };
      } else {
        filter = { $or: [{ assignedRep: userId }, { createdBy: userId }] };
      }
    }
    // 3. SALES PERSON -> Sees only tasks assigned to themselves
    else if (userRole === 'sales_person') {
      filter = { assignedRep: userId };
    }

    // Filter by Status: 'Pending' | 'In Progress' | 'Completed'
    if (req.query.status && req.query.status !== 'All') {
      filter.status = req.query.status;
    }

    // Filter by Priority: 'Urgent' | 'High' | 'Medium' | 'Low'
    if (req.query.priority && req.query.priority !== 'All') {
      filter.priority = req.query.priority;
    }

    // Filter by Specific Lead (if requested from Lead Details page)
    if (req.query.lead) {
      filter.lead = req.query.lead;
    }

    // Search by title, description, company, or contact
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { linkedCompany: searchRegex },
        { linkedContact: searchRegex },
      ];
    }

    const tasks = await Task.find(filter)
      .populate('assignedRep', 'name email role phone avatar status')
      .populate('createdBy', 'name email role')
      .populate('lead', 'name company status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error('Error in getTasks:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching tasks.',
    });
  }
};

// CREATE TASK
// POST /api/tasks
const createTask = async (req, res) => {
  try {
    const {
      type,
      title,
      description,
      category,
      lead,
      linkedCompany,
      linkedContact,
      phone,
      email,
      dueDate,
      dueTime,
      priority,
      status,
      assignedRep,
    } = req.body;

    // Title validation
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required.',
      });
    }

    const userRole = req.user ? req.user.role : 'admin';
    const userId = req.user ? req.user._id : null;

    // Determine target sales rep
    let targetRepId = assignedRep || userId;

    // Sales Person can only assign task to themselves
    if (userRole === 'sales_person') {
      targetRepId = userId;
    }

    // Sales Manager can assign to members of their team or themselves
    if (userRole === 'sales_manager') {
      const myTeam = await Team.findOne({ manager: userId });
      const allowedIds = myTeam && myTeam.members
        ? [String(userId), ...myTeam.members.map((m) => String(m))]
        : [String(userId)];

      if (!allowedIds.includes(String(targetRepId))) {
        return res.status(403).json({
          success: false,
          message: 'Permission denied: Managers can only assign tasks to their own team members.',
        });
      }
    }

    const newTask = await Task.create({
      type: type || 'Task',
      title: title.trim(),
      description: description ? description.trim() : '',
      category: category ? category.trim() : (linkedCompany ? 'Client Outreach' : 'General Work'),

      lead: lead && String(lead).match(/^[0-9a-fA-F]{24}$/) ? lead : null,
      linkedCompany: linkedCompany ? linkedCompany.trim() : '',
      linkedContact: linkedContact ? linkedContact.trim() : '',
      phone: phone ? phone.trim() : '',
      email: email ? email.trim() : '',

      dueDate: dueDate || 'Today',
      dueTime: dueTime || '11:00 AM',
      priority: priority || 'Medium',
      status: status || 'Pending',
      assignedRep: targetRepId,
      createdBy: userId,
    });

    const populatedTask = await Task.findById(newTask._id)
      .populate('assignedRep', 'name email role phone avatar status')
      .populate('createdBy', 'name email role')
      .populate('lead', 'name company status');

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      task: populatedTask,
    });
  } catch (error) {
    console.error('Error in createTask:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while creating task.',
    });
  }
};

// UPDATE TASK 
// PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    const userRole = req.user ? req.user.role : 'admin';
    const userId = req.user ? String(req.user._id) : '';

    // Reps can only update their own tasks
    if (userRole === 'sales_person' && task.assignedRep && String(task.assignedRep) !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only update tasks assigned to you.',
      });
    }

    const {
      title,
      description,
      category,
      dueDate,
      dueTime,
      priority,
      status,
      assignedRep,
      linkedCompany,
      linkedContact,
      phone,
      email,
    } = req.body;

    if (title) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (category) task.category = category.trim();
    if (dueDate) task.dueDate = dueDate;
    if (dueTime) task.dueTime = dueTime;
    if (priority) task.priority = priority;
    if (status) {
      task.status = status;
      if (status === 'Completed' && !task.completedAt) {
        task.completedAt = new Date();
      }
    }
    if (assignedRep && userRole !== 'sales_person') {
      task.assignedRep = assignedRep;
    }
    if (linkedCompany !== undefined) task.linkedCompany = linkedCompany.trim();
    if (linkedContact !== undefined) task.linkedContact = linkedContact.trim();
    if (phone !== undefined) task.phone = phone.trim();
    if (email !== undefined) task.email = email.trim();

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignedRep', 'name email role phone avatar status')
      .populate('createdBy', 'name email role')
      .populate('lead', 'name company status');

    res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      task: updatedTask,
    });
  } catch (error) {
    console.error('Error in updateTask:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating task.',
    });
  }
};

// DELETE TASK 
// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    const userRole = req.user ? req.user.role : 'admin';
    const userId = req.user ? String(req.user._id) : '';

    // Reps can only delete tasks they created or were assigned to
    if (
      userRole === 'sales_person' &&
      String(task.assignedRep) !== userId &&
      String(task.createdBy) !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You cannot delete this task.',
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `Task '${task.title}' deleted successfully.`,
    });
  } catch (error) {
    console.error('Error in deleteTask:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while deleting task.',
    });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};

