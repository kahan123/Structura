const express = require('express');
const router = express.Router();
const { getMessages, markAsRead, getConversations, getAdmins } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/conversations/:userId', protect, getConversations);
router.get('/admins', protect, getAdmins);
router.get('/:senderId/:receiverId', protect, getMessages);
router.patch('/read/:senderId/:receiverId', protect, markAsRead);

module.exports = router;
