const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Fetch user, excluding the password field
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            next();
        } catch (error) {
            console.error('Token verification failed:', error);
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Not authorized, token expired' });
            }
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role) {
        const userRole = req.user.role.toLowerCase();
        if (['admin', 'super admin', 'superadmin', 'super-admin'].includes(userRole)) {
            return next();
        }
    }
    res.status(403).json({ message: 'Not authorized as an Admin' });
};

const staff = (req, res, next) => {
    if (req.user && req.user.role) {
        const userRole = req.user.role.toLowerCase();
        if (
            ['admin', 'super admin', 'superadmin', 'super-admin', 'maintenance', 'staff', 'employee'].includes(userRole)
        ) {
            return next();
        }
    }
    res.status(403).json({ message: 'Not authorized as Maintenance Staff' });
};

module.exports = { protect, admin, staff };
