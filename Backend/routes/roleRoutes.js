const express = require('express');
const router = express.Router();
const {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} = require('../controllers/roleController');

const { protect } = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');

// All role routes require valid authentication
router.use(protect);

// ─── /api/roles ──────────────────────────────────────────────────────────────
router
  .route('/')
  .get(getRoles) // View roles (Admin & Managers)
  .post(checkRole('admin'), createRole); // Only Admin can create new custom roles

// ─── /api/roles/:id ──────────────────────────────────────────────────────────
router
  .route('/:id')
  .get(getRoleById)
  .put(checkRole('admin'), updateRole) // Only Admin can edit permissions
  .delete(checkRole('admin'), deleteRole); // Only Admin can delete custom roles

module.exports = router;

