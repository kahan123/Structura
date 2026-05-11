const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Booking = require('./models/Booking');
const Resource = require('./models/Resource');

// Load env vars
dotenv.config();

const checkData = async () => {
    try {
        console.log('Connecting to MongoDB...');
        if (!process.env.MONGO_URI) {
            console.log('MONGO_URI not found in env, trying default local');
            process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/resource-project';
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const bookingCount = await Booking.countDocuments();
        console.log(`Total Bookings: ${bookingCount}`);

        if (bookingCount > 0) {
            const bookings = await Booking.find().populate('resource');
            bookings.forEach(b => {
                const resName = b.resource ? b.resource.name : 'Unknown Resource';
                console.log(`- ${resName}: ${b.startTime} to ${b.endTime} (Status: ${b.status})`);
            });
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkData();
