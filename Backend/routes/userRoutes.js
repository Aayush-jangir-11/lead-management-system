const express = require('express');
const router = express.Router();

const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
} = require('../controllers/userController');

const { protect } = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');

// All user management routes require valid authentication
router.use(protect);

// ─── /api/users ──────────────────────────────────────────────────────────────
router
  .route('/')
  .post(checkRole('admin'), createUser) // Only Admin can create users
  .get(checkRole('admin', 'sales_manager'), getUsers); // Admin & Sales Manager can view all users

// ─── Change Password ───────────────────────────────────────────────────────
const { changePassword } = require('../controllers/authController');
router.put('/change-password', changePassword);
router.post('/change-password', changePassword);

// ─── /api/users/:id/status ───────────────────────────────────────────────────
router.put('/:id/status', checkRole('admin'), toggleUserStatus); // Only Admin can suspend/activate user

// ─── /api/users/:id ──────────────────────────────────────────────────────────
router
  .route('/:id')
  .get(checkRole('admin', 'sales_manager'), getUserById)
  .put(checkRole('admin'), updateUser) // Only Admin can edit user
  .delete(checkRole('admin'), deleteUser); // Only Admin can delete user

module.exports = router;

