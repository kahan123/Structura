const mongoose = require('mongoose');
const User = require('./models/User');

const checkUsers = async () => {
    try {
        console.log('Connecting to MongoDB...');
        const mongoURI = 'mongodb://127.0.0.1:27017/resource-project';
        await mongoose.connect(mongoURI);
        console.log('MongoDB Connected');

        const users = await User.find();
        console.log(`Total Users in DB: ${users.length}`);
        users.forEach(u => {
            console.log(`- Name: ${u.name} | Email: ${u.email} | Role: ${u.role} | ID: ${u._id}`);
        });

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUsers();
