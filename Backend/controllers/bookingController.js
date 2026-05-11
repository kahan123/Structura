const Booking = require('../models/Booking');
const Resource = require('../models/Resource');
const SystemSetting = require('../models/SystemSetting');
const MaintenanceTask = require('../models/MaintenanceTask');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
    try {
        const { resourceId, startTime, endTime, purpose } = req.body;
        
        // 1. Authenticate user using req.user populated by middleware
        const userId = req.user ? req.user._id : req.body.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Not authorized, no user found' });
        }

        const start = new Date(startTime);
        const end = new Date(endTime);

        if (start >= end) {
            return res.status(400).json({ message: 'End time must be after start time' });
        }

        // 2. Load and validate system settings
        const settings = await SystemSetting.findOne();
        if (settings) {
            // If maintenanceMode is true, only Admins are allowed to make bookings
            if (settings.maintenanceMode && !(req.user && req.user.isAdmin)) {
                return res.status(503).json({ message: 'The booking portal is temporarily closed due to system-wide maintenance.' });
            }
            // If new bookings are globally disabled
            if (!settings.allowNewBookings) {
                return res.status(403).json({ message: 'New booking requests are temporarily disabled by the system administrator.' });
            }
            // If booking duration exceeds limit
            const durationHours = (end - start) / (1000 * 60 * 60);
            if (durationHours > settings.maxBookingDuration) {
                return res.status(400).json({ message: `Booking duration exceeds maximum allowed limit of ${settings.maxBookingDuration} hours.` });
            }
        }

        // 3. Check if resource exists and is available
        const resource = await Resource.findById(resourceId);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }
        if (!resource.isAvailable) {
            return res.status(400).json({ message: 'This resource is currently marked offline or out of order.' });
        }

        // 4. Check for overlap with other active user bookings
        const existingBooking = await Booking.findOne({
            resource: resourceId,
            status: { $nin: ['Rejected', 'Cancelled'] },
            $or: [
                { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
            ]
        });

        if (existingBooking) {
            return res.status(409).json({ message: 'Resource is already booked for this time slot' });
        }

        // 5. Check for overlap with scheduled or active maintenance tasks
        const conflictingMaintenance = await MaintenanceTask.findOne({
            resource: resourceId,
            status: { $in: ['Scheduled', 'Pending', 'In Progress'] },
            blocksBookings: true,
            $or: [
                { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
            ]
        });

        if (conflictingMaintenance) {
            return res.status(409).json({ 
                message: `This slot is reserved for scheduled maintenance (${conflictingMaintenance.maintenanceType}).` 
            });
        }

        const booking = new Booking({
            resource: resourceId,
            user: userId,
            startTime,
            endTime,
            purpose
        });

        const createdBooking = await booking.save();

        // Emit Socket.io event to Admin Room
        const io = req.app.get('io');
        if (io) {
            console.log(`[BookingController] Resource Lookup: ID=${resourceId}, Found=${resource.name}`);

            io.to('admin').emit('new_booking', {
                message: `New booking request from user`,
                bookingId: createdBooking._id,
                resourceId: createdBooking.resource,
                resourceName: resource.name,
                time: new Date()
            });
            const adminRoomSize = io.sockets.adapter.rooms.get('admin')?.size || 0;
            console.log(`Emitted new_booking event to admin. Admin Room Size: ${adminRoomSize}`);
        }

        res.status(201).json(createdBooking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get bookings for a specific resource
// @route   GET /api/bookings/resource/:resourceId
// @access  Private
const getResourceBookings = async (req, res) => {
    try {
        const [bookings, maintenanceTasks] = await Promise.all([
            Booking.find({
                resource: req.params.resourceId,
                status: { $nin: ['Rejected', 'Cancelled'] }
            }).populate('user', 'name email'),
            MaintenanceTask.find({
                resource: req.params.resourceId,
                status: { $in: ['Scheduled', 'Pending', 'In Progress'] },
                blocksBookings: true
            })
        ]);

        // Transform maintenance tasks into booking-compatible items
        const maintenanceAsBookings = maintenanceTasks.map(task => ({
            _id: task._id,
            resource: task.resource,
            startTime: task.startTime || task.scheduledDate,
            endTime: task.endTime || new Date(new Date(task.startTime || task.scheduledDate).getTime() + 2 * 60 * 60 * 1000),
            status: 'Maintenance',
            purpose: `Scheduled Maintenance: ${task.maintenanceType}`,
            user: { name: 'Maintenance Staff' }
        }));

        // Merge both arrays
        const combined = [...bookings, ...maintenanceAsBookings];

        res.json(combined);
    } catch (error) {
        console.error("Error fetching resource bookings & maintenance:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get bookings for the logged-in user
// @route   GET /api/bookings/mybookings/:userId
// @access  Private
const getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.params.userId })
            .populate('resource', 'name building floor')
            .sort({ startTime: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Cancel a booking
// @route   PATCH /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if booking is already cancelled
        if (booking.status === 'Cancelled') {
            return res.status(400).json({ message: 'Booking is already cancelled' });
        }

        // Check if booking is in the past (optional, but good practice)
        // if (new Date(booking.endTime) < new Date()) {
        //     return res.status(400).json({ message: 'Cannot cancel past bookings' });
        // }

        booking.status = 'Cancelled';
        await booking.save();

        // Remove any auto-scheduled maintenance task tied to this booking
        await MaintenanceTask.deleteMany({
            resource: booking.resource,
            startTime: booking.endTime,
            notes: `Auto-scheduled 30m maintenance window after booking ${booking._id}`
        });

        res.json({ message: 'Booking cancelled successfully', booking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createBooking,
    getResourceBookings,
    getUserBookings,
    cancelBooking
};
