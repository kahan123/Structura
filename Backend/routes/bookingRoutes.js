const express = require('express');
const router = express.Router();
const { createBooking, getResourceBookings, getUserBookings, cancelBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
router.post('/', protect, createBooking);
router.get('/resource/:resourceId', protect, getResourceBookings);
router.get('/mybookings/:userId', protect, getUserBookings);

router.patch('/:id/cancel', protect, cancelBooking);

module.exports = router;
