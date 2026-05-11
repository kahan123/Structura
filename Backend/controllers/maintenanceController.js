const MaintenanceTask = require('../models/MaintenanceTask');
const Booking = require('../models/Booking');
const Resource = require('../models/Resource');

// @desc    Get all maintenance tasks
// @route   GET /api/maintenance
// @access  Private
const getTasks = async (req, res) => {
    try {
        const tasks = await MaintenanceTask.find().populate('resource', 'name building floor');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get maintenance tasks assigned to a user
// @route   GET /api/maintenance/my-tasks
// @access  Private
const getMyTasks = async (req, res) => {
    try {
        const { userId } = req.query;
        const filter = userId ? { assignedTo: userId } : {};
        const tasks = await MaintenanceTask.find(filter).populate('resource', 'name building floor');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new maintenance task (Admin)
// @route   POST /api/maintenance
// @access  Private/Admin
const createTask = async (req, res) => {
    try {
        const { resource, maintenanceType, scheduledDate, startTime, endTime, blocksBookings, notes, assignedTo } = req.body;
        
        // Setup dates with fallback
        const finalScheduledDate = scheduledDate || new Date();
        const finalStartTime = startTime || finalScheduledDate;
        const finalEndTime = endTime || new Date(new Date(finalStartTime).getTime() + 2 * 60 * 60 * 1000); // Default to 2h window

        const task = new MaintenanceTask({
            resource,
            maintenanceType,
            scheduledDate: finalScheduledDate,
            startTime: finalStartTime,
            endTime: finalEndTime,
            blocksBookings: blocksBookings !== undefined ? blocksBookings : true,
            notes,
            assignedTo,
            status: 'Scheduled'
        });

        const createdTask = await task.save();

        // Populate resource info
        const resourceDetails = await Resource.findById(resource);

        // If the task blocks bookings, cancel overlapping approved or pending bookings
        if (task.blocksBookings && ['Scheduled', 'Pending', 'In Progress'].includes(task.status)) {
            const overlappingBookings = await Booking.find({
                resource: resource,
                status: { $in: ['Approved', 'Pending'] },
                startTime: { $lt: finalEndTime },
                endTime: { $gt: finalStartTime }
            });

            const io = req.app.get('io');

            for (let booking of overlappingBookings) {
                booking.status = 'Cancelled';
                await booking.save();

                // Dispatch Socket.io notification if socket is connected
                if (io) {
                    const userRoom = `user_${booking.user.toString()}`;
                    console.log(`[MaintenanceController] Cancelling booking ID ${booking._id} | Notifying user room ${userRoom}`);
                    io.to(userRoom).emit('booking_status_update', {
                        status: 'Cancelled',
                        resourceName: resourceDetails ? resourceDetails.name : 'Resource',
                        message: `Your booking for ${resourceDetails ? resourceDetails.name : 'Resource'} on ${new Date(booking.startTime).toLocaleDateString()} was cancelled due to scheduled maintenance (${maintenanceType}).`,
                        time: new Date()
                    });
                }
            }
        }

        res.status(201).json(createdTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update task status
// @route   PATCH /api/maintenance/:id/status
// @access  Private
const updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const task = await MaintenanceTask.findById(req.params.id);

        if (task) {
            task.status = status;
            const updatedTask = await task.save();
            res.json(updatedTask);
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTasks,
    getMyTasks,
    createTask,
    updateTaskStatus
};
