const express = require('express');
const router = express.Router();
const { login, changePassword } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// POST /api/auth/login
router.post('/login', login);

// PUT & POST /api/auth/change-password (Authenticated User)
router.put('/change-password', protect, changePassword);
router.post('/change-password', protect, changePassword);

module.exports = router;

