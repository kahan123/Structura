const mongoose = require('mongoose');

const resourceSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String, // e.g., 'Classroom', 'Lab', 'Auditorium'
        required: true
    },
    building: {
        type: String,
        required: true
    },
    floor: {
        type: Number,
        required: true
    },
    capacity: {
        type: Number,
        default: 30
    },
    facilities: [{
        type: String // e.g., 'Projector', 'AC', 'Whiteboard'
    }],
    description: {
        type: String
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;
