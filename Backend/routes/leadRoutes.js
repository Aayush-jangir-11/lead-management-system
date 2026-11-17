const express = require('express');
const router = express.Router();
const {
  createLead,
  bulkCreateLeads,
  getLeads,
  getLeadById,
  updateLead,
  addTimelineNote,
  deleteLead,
} = require('../controllers/leadController');

const { protect } = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');

// All lead routes require authentication
router.use(protect);

// ─── /api/leads ──────────────────────────────────────────────────────────────
router
  .route('/')
  .post(createLead)
  .get(getLeads);

// ─── /api/leads/bulk ─────────────────────────────────────────────────────────
router.post('/bulk', bulkCreateLeads);

// ─── /api/leads/:id ──────────────────────────────────────────────────────────
router
  .route('/:id')
  .get(getLeadById)
  .put(updateLead)
  .delete(checkRole('admin', 'sales_manager'), deleteLead);

// ─── /api/leads/:id/timeline ─────────────────────────────────────────────────
router.post('/:id/timeline', addTimelineNote);

module.exports = router;

