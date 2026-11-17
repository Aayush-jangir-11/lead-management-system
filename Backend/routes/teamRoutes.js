const express = require('express');
const router = express.Router();

const {
  getTeams,
  getMyTeam,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
} = require('../controllers/teamController');

const { protect } = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');

router.use(protect);

// Manager fetches their specific team
router.get('/my-team', checkRole('sales_manager', 'admin'), getMyTeam);

router
  .route('/')
  .get(getTeams)
  .post(checkRole('admin'), createTeam);

router
  .route('/:id')
  .get(getTeamById)
  .put(checkRole('admin'), updateTeam)
  .delete(checkRole('admin'), deleteTeam);

module.exports = router;

