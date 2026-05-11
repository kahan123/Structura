const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllBookings, updateBookingStatus, getAllUsers, updateUserRole, testSocketNotification } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');
router.get('/stats', protect, admin, getDashboardStats);
router.get('/bookings', protect, admin, getAllBookings);
router.patch('/bookings/:id/status', protect, admin, updateBookingStatus);
router.get('/users', protect, admin, getAllUsers);
router.patch('/users/:id/role', protect, admin, updateUserRole);
router.post('/test-socket/:userId', protect, admin, testSocketNotification);

module.exports = router;
