const socketIo = require('socket.io');
const Message = require('../models/Message');
const User = require('../models/User');

const socketInit = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected', socket.id);

        // Join Admin Room
        socket.on('join_admin', () => {
            socket.join('admin');
            console.log(`Socket ${socket.id} joined Admin Room`);
        });

        // Join specific User Room
        socket.on('join_user', (userId) => {
            if (!userId) return;
            const roomName = `user_${String(userId)}`;
            socket.join(roomName);
            console.log(`[SocketServer] Socket ${socket.id} joined Room: ${roomName}`);
        });

        // Chat: Send Massage
        socket.on('send_message', async (data) => {
            const { senderId, receiverId, text } = data;

            try {
                // Save to DB
                const newMessage = new Message({
                    sender: senderId,
                    receiver: receiverId,
                    text: text
                });
                await newMessage.save();

                // Fetch sender name/role for live notification
                const senderUser = await User.findById(senderId).select('name role');

                const messageData = {
                    _id: newMessage._id,
                    sender: senderId,
                    senderName: senderUser ? senderUser.name : 'Someone',
                    senderRole: senderUser ? senderUser.role : 'User',
                    receiver: receiverId,
                    text: text,
                    createdAt: newMessage.createdAt,
                    isRead: false
                };

                // Emit to receiver
                io.to(`user_${receiverId}`).emit('receive_message', messageData);
                // Emit confirmation to sender
                socket.emit('message_sent', messageData);

            } catch (err) {
                console.error("Error saving message:", err);
            }
        });

        // Chat: Typing Indicator
        socket.on('typing', (data) => {
            const { senderId, receiverId } = data;
            io.to(`user_${receiverId}`).emit('typing_status', { senderId, isTyping: true });
        });

        socket.on('stop_typing', (data) => {
            const { senderId, receiverId } = data;
            io.to(`user_${receiverId}`).emit('typing_status', { senderId, isTyping: false });
        });

        // Chat: Mark Read
        socket.on('mark_read', async (data) => {
            const { senderId, receiverId } = data;
            try {
                await Message.updateMany(
                    { sender: senderId, receiver: receiverId, isRead: false },
                    { $set: { isRead: true, readAt: Date.now() } }
                );
                // Notify sender that messages were read
                io.to(`user_${senderId}`).emit('messages_read', { readerId: receiverId });
            } catch (err) {
                console.error("Error marking read:", err);
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected', socket.id);
        });
    });

    return io;
};

module.exports = socketInit;
