const express = require('express');
const router = express.Router();
const { getTasks, getMyTasks, createTask, updateTaskStatus } = require('../controllers/maintenanceController');
const { protect, staff } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, staff, getTasks)
    .post(protect, staff, createTask);

router.get('/my-tasks', protect, staff, getMyTasks);
router.patch('/:id/status', protect, staff, updateTaskStatus);

module.exports = router;
