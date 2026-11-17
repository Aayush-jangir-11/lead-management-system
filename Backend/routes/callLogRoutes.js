const express = require('express');
const router = express.Router();

const {
  createCallLog,
  getCallLogs,
  getCallLogsByLead,
  getCallLogById,
  getCallLogStats,
  updateCallLog,
  deleteCallLog,
} = require('../controllers/callLogController');

const { protect } = require('../middlewares/authMiddleware');

// All call log endpoints require authentication
router.use(protect);

router
  .route('/')
  .get(getCallLogs)
  .post(createCallLog);

router.get('/stats', getCallLogStats);
router.get('/lead/:leadId', getCallLogsByLead);

router
  .route('/:id')
  .get(getCallLogById)
  .put(updateCallLog)
  .delete(deleteCallLog);

module.exports = router;

