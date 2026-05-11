const Booking = require('../models/Booking');
const Resource = require('../models/Resource');
const User = require('../models/User');
const MaintenanceTask = require('../models/MaintenanceTask');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
// @desc    Get all bookings (Admin)
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .populate('user', 'name email role')
            .populate('resource', 'name building floor') // Ensure resource details are populated
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update booking status (Approve/Reject)
// @route   PATCH /api/admin/bookings/:id/status
// @access  Private/Admin
const updateBookingStatus = async (req, res) => {
    try {
        const { status, remarks } = req.body; // remarks optional for rejection
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        booking.status = status;
        // logic to extend booking model with remarks if needed, ignoring for now or just saving status
        // booking.remarks = remarks; 

        // Populate resource and user to get details for notification
        await booking.populate(['resource', 'user']);

        if (status === 'Approved') {
            const maintenanceEndTime = new Date(booking.endTime.getTime() + 30 * 60000); // 30 mins
            const newTask = new MaintenanceTask({
                resource: booking.resource._id,
                maintenanceType: 'Cleaning/Reset',
                status: 'Scheduled',
                scheduledDate: booking.endTime,
                startTime: booking.endTime,
                endTime: maintenanceEndTime,
                blocksBookings: true,
                notes: `Auto-scheduled 30m maintenance window after booking ${booking._id}`
            });
            await newTask.save();
        } else if (status === 'Rejected' || status === 'Cancelled') {
            await MaintenanceTask.deleteMany({
                resource: booking.resource._id,
                startTime: booking.endTime,
                notes: `Auto-scheduled 30m maintenance window after booking ${booking._id}`
            });
        }

        const updatedBooking = await booking.save();

        // Emit status update to user
        const io = req.app.get('io');
        if (io) {
            const targetUserId = booking.user._id || booking.user;
            const userRoom = `user_${targetUserId.toString()}`;
            console.log(`[AdminController:updateBookingStatus] Target User ID: ${targetUserId} | Room: ${userRoom} | Status: ${booking.status}`);

            // Log room existence (check if user is actually in room)
            const roomSize = io.sockets.adapter.rooms.get(userRoom)?.size || 0;
            console.log(`[AdminController] --------------------------------------------------`);
            console.log(`[AdminController] Target Room: ${userRoom}`);
            console.log(`[AdminController] Booking User ID: ${booking.user.toString()}`);
            console.log(`[AdminController] Room Size (Clients Connected): ${roomSize}`);
            console.log(`[AdminController] Emitting 'booking_status_update' with status: ${booking.status}`);
            console.log(`[AdminController] --------------------------------------------------`);

            io.to(userRoom).emit('booking_status_update', {
                status: booking.status,
                resourceName: booking.resource.name,
                message: `Your booking for ${booking.resource.name} has been ${booking.status.toLowerCase()}.`,
                time: new Date()
            });
            console.log(`[AdminController] Event 'booking_status_update' emitted.`);

            // Return debug info in response
            return res.json({
                ...updatedBooking.toObject(),
                debug: {
                    socketEmitted: true,
                    targetRoom: userRoom,
                    roomSize: roomSize,
                    userId: booking.user.toString()
                }
            });
        }

        res.json(updatedBooking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password'); // Exclude password
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user role
// @route   PATCH /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        console.log(`[AdminController:updateUserRole] ID: ${req.params.id}, New Role: ${role}`);
        const user = await User.findById(req.params.id);

        if (user) {
            console.log(`[AdminController:updateUserRole] Found User: ${user.email}, Old Role: ${user.role}`);
            user.role = role || user.role;

            if (role === 'Admin') user.isAdmin = true;
            else if (role === 'Student' || role === 'Faculty' || role === 'Employee' || role === 'Maintenance') user.isAdmin = false;

            console.log(`[AdminController:updateUserRole] Saving user with Role: ${user.role}, IsAdmin: ${user.isAdmin}`);
            const updatedUser = await user.save();
            console.log(`[AdminController:updateUserRole] Save successful for ${updatedUser.email}`);

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                isAdmin: updatedUser.isAdmin
            });
        } else {
            console.log(`[AdminController:updateUserRole] User not found: ${req.params.id}`);
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("CRITICAL ERROR in updateUserRole:", error);
        res.status(500).json({
            message: 'Server Error',
            details: error.message,
            stack: error.stack
        });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        // Parallel fetching for performance
        const [
            totalResources,
            totalBookings,
            pendingBookings,
            resourcesInMaintenance
        ] = await Promise.all([
            Resource.countDocuments(),
            Booking.countDocuments({ status: 'Approved', endTime: { $gte: new Date() } }), // Active bookings
            Booking.countDocuments({ status: 'Pending' }),
            Resource.countDocuments({ isAvailable: false }) // Assuming unavailable = maintenance/issue
        ]);

        // Fetch recent activity (Last 5 bookings)
        const recentActivity = await Booking.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name')
            .populate('resource', 'name');

        const activityLog = recentActivity.map(booking => ({
            id: booking._id,
            user: booking.user?.name || 'Unknown User',
            action: `submitted a booking request for`, // Simplify for now, can be dynamic based on status
            target: booking.resource?.name || 'Unknown Resource',
            time: booking.createdAt,
            status: booking.status
        }));

        res.json({
            stats: {
                totalResources,
                activeBookings: totalBookings,
                pendingApprovals: pendingBookings,
                maintenanceAlerts: resourcesInMaintenance
            },
            recentActivity: activityLog
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};



// @desc Test socket notification for a specific user
// @route POST /api/admin/test-socket/:userId
const testSocketNotification = async (req, res) => {
    try {
        const { userId } = req.params;
        const io = req.app.get('io');

        if (!io) return res.status(500).json({ message: 'Socket.io not initialized' });

        const userRoom = `user_${userId}`;
        const roomSize = io.sockets.adapter.rooms.get(userRoom)?.size || 0;

        io.to(userRoom).emit('booking_status_update', {
            status: 'Test',
            resourceName: 'Test Resource',
            message: 'This is a test notification from Admin.',
            time: new Date()
        });

        res.json({
            message: `Test sent to room ${userRoom}`,
            roomSize: roomSize,
            connected: roomSize > 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getDashboardStats,
    getAllBookings,
    updateBookingStatus,
    getAllUsers,
    updateUserRole,
    testSocketNotification
};
