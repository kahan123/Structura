const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get chat history between two users
// @route   GET /api/messages/:userId
// @access  Private (Admin or the user themselves)
const getMessages = async (req, res) => {
    try {
        const { senderId, receiverId } = req.params;

        const messages = await Message.find({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId }
            ]
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages', error: error.message });
    }
};

// @desc    Mark messages as read
// @route   PATCH /api/messages/read/:senderId
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const { senderId, receiverId } = req.params;

        await Message.updateMany(
            { sender: senderId, receiver: receiverId, isRead: false },
            { $set: { isRead: true, readAt: Date.now() } }
        );

        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error marking messages as read', error: error.message });
    }
};

// @desc    Get list of users with whom the current user has a conversation
// @route   GET /api/messages/conversations/:userId
// @access  Private
const getConversations = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(`[getConversations] Fetching for userId: ${userId}`);

        const messages = await Message.find({
            $or: [{ sender: userId }, { receiver: userId }]
        }).sort({ createdAt: -1 });
        console.log(`[getConversations] Found ${messages.length} messages`);

        const conversationMap = new Map();

        for (const msg of messages) {
            const otherUser = msg.sender.toString() === userId ? msg.receiver.toString() : msg.sender.toString();
            if (!conversationMap.has(otherUser)) {
                conversationMap.set(otherUser, msg);
            }
        }

        const outsideUserIds = Array.from(conversationMap.keys());
        console.log(`[getConversations] Conversation partners found:`, outsideUserIds);

        const users = await User.find({ _id: { $in: outsideUserIds } }).select('name email role');
        console.log(`[getConversations] User details fetched for ${users.length} partners`);

        const result = users.map(user => ({
            user,
            lastMessage: conversationMap.get(user._id.toString())
        }));

        res.json(result);
    } catch (error) {
        console.error(`[getConversations] ERROR:`, error);
        res.status(500).json({ message: 'Error fetching conversations', error: error.message });
    }
};

// @desc    Get all admin users (for normal users to start a chat)
// @route   GET /api/messages/admins
// @access  Private (any logged-in user)
const getAdmins = async (req, res) => {
    try {
        const admins = await User.find({ role: 'Admin' }).select('name email role');
        res.json(admins);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching admins', error: error.message });
    }
};

module.exports = { getMessages, markAsRead, getConversations, getAdmins };
