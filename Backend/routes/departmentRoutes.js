const express = require('express');
const router = express.Router();

const {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/departmentController');

const { protect } = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');

router.use(protect);

router
  .route('/')
  .get(getDepartments)
  .post(checkRole('admin'), createDepartment);

router
  .route('/:id')
  .get(getDepartmentById)
  .put(checkRole('admin'), updateDepartment)
  .delete(checkRole('admin'), deleteDepartment);

module.exports = router;

