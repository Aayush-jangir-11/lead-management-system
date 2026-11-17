const express = require('express');
const router = express.Router();

const {
  getStages,
  createStage,
  reorderStages,
  updateStage,
  deleteStage,
  saveDealStageSections,
  updateStageFormFields,
  updateStageReminder,
} = require('../controllers/pipelineStageController');

const { protect } = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');

// All pipeline stage endpoints require authentication
router.use(protect);

// ─── Stage Collection Routes ──────────────────────────────────────────────────
router
  .route('/')
  .get(getStages)
  .post(checkRole('admin', 'sales_manager'), createStage);

// ─── Reorder Sequence Route ───────────────────────────────────────────────────
router.put('/reorder', checkRole('admin', 'sales_manager'), reorderStages);

// ─── Stage Form Fields Template Route (Design Stage Form Fields) ──────────────
router.put('/:id/form-fields', checkRole('admin', 'sales_manager', 'sales_person'), updateStageFormFields);

// ─── Stage Follow-up Reminder Route ──────────────────────────────────────────
router.put('/:id/reminder', checkRole('admin', 'sales_manager', 'sales_person'), updateStageReminder);

// ─── Deal Dynamic Stage Information Sections Route ────────────────────────────
router.put('/deals/:dealId/stage-sections', saveDealStageSections);

// ─── Individual Stage Routes ──────────────────────────────────────────────────
router
  .route('/:id')
  .put(checkRole('admin', 'sales_manager'), updateStage)
  .delete(checkRole('admin', 'sales_manager'), deleteStage);

module.exports = router;

