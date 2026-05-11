const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Resource = require('./models/Resource');

// Load environment variables
dotenv.config();

const seedDB = async () => {
    try {
        console.log('Connecting to MongoDB...');
        const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/resource-management';
        await mongoose.connect(mongoURI);
        console.log('MongoDB Connected');

        // Clean up existing data to avoid conflicts
        await User.deleteMany({});
        await Resource.deleteMany({});
        console.log('Cleared existing collections.');

        // 1. Create Users
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const users = [
            {
                name: 'Super Admin',
                email: 'admin@uni.edu',
                password: hashedPassword,
                role: 'Admin',
                isAdmin: true
            },
            {
                name: 'Bob Builder',
                email: 'maintain@uni.edu',
                password: hashedPassword,
                role: 'Maintenance',
                isAdmin: false
            },
            {
                name: 'Jane Doe',
                email: 'student@uni.edu',
                password: hashedPassword,
                role: 'Student',
                isAdmin: false
            }
        ];

        const seededUsers = await User.insertMany(users);
        console.log('Seeded Users successfully!');
        seededUsers.forEach(u => console.log(`- ${u.name} (${u.email}) [${u.role}]`));

        // 2. Create Resources
        const resources = [
            {
                name: 'Computer Lab 1',
                type: 'Lab',
                building: 'Main Block',
                floor: 2,
                capacity: 30,
                description: 'High-spec PCs for programming sessions.',
                isAvailable: true
            },
            {
                name: 'Seminar Hall A',
                type: 'Auditorium',
                building: 'North Block',
                floor: 0,
                capacity: 150,
                description: 'Large hall with stage and audio system.',
                isAvailable: true
            },
            {
                name: 'Physics Lab',
                type: 'Lab',
                building: 'Science Block',
                floor: 1,
                capacity: 40,
                description: 'Equipped with workbenches and safety gear.',
                isAvailable: true
            }
        ];

        const seededResources = await Resource.insertMany(resources);
        console.log('Seeded Resources successfully!');
        seededResources.forEach(r => console.log(`- ${r.name} at ${r.building}`));

        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seedDB();
