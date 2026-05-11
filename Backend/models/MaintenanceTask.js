const mongoose = require('mongoose');

const maintenanceTaskSchema = mongoose.Schema({
    resource: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource',
        required: true
    },
    maintenanceType: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Pending', 'In Progress', 'Completed', 'Rejected'],
        default: 'Pending'
    },
    scheduledDate: {
        type: Date,
        required: true
    },
    startTime: {
        type: Date,
        default: function() { return this.scheduledDate || Date.now(); }
    },
    endTime: {
        type: Date,
        default: function() { 
            if (this.scheduledDate) {
                return new Date(new Date(this.scheduledDate).getTime() + 2 * 60 * 60 * 1000);
            }
            return new Date(Date.now() + 2 * 60 * 60 * 1000);
        }
    },
    blocksBookings: {
        type: Boolean,
        default: true
    },
    notes: {
        type: String
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const MaintenanceTask = mongoose.model('MaintenanceTask', maintenanceTaskSchema);

module.exports = MaintenanceTask;
