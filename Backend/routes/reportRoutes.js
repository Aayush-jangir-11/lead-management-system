const express = require('express');
const router = express.Router();
const {
  getSummaryKPIs,
  getFunnelData,
  getSourceAnalysis,
  getRevenueTrends,
  getRepLeaderboard,
  getFullReport,
  getDepartmentComparison,
  getMyPerformance,
} = require('../controllers/reportController');

const { protect } = require('../middlewares/authMiddleware');

// All reports routes require authentication and respect the user's role scope
router.use(protect);

// ─── /api/reports ─────────────────────────────────────────────────────────────
router.get('/kpis', getSummaryKPIs);
router.get('/funnel', getFunnelData);
router.get('/sources', getSourceAnalysis);
router.get('/revenue-trend', getRevenueTrends);
router.get('/leaderboard', getRepLeaderboard);
router.get('/departments', getDepartmentComparison);
router.get('/personal', getMyPerformance);
router.get('/my-performance', getMyPerformance);
router.get('/full', getFullReport);

module.exports = router;

