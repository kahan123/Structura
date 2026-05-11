const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const connectDB = require('./config/database');
const socketInit = require('./socket/index');

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5000',
    'https://structura-resource-management.vercel.app'
];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        const isAllowed = allowedOrigins.indexOf(origin) !== -1 || 
                          origin.endsWith('.vercel.app') || 
                          origin.startsWith('http://localhost:');
        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());

// Init Socket.io
const io = socketInit(server);

// Make io accessible in routes
app.set('io', io);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/maintenance', require('./routes/maintenanceRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
