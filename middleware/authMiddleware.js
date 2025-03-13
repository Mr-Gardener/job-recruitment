const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) return res.status(401).json({ message: 'No token provided' });

        const token = authHeader.split(' ')[1]; // Get token after "Bearer"
        if (!token) return res.status(401).json({ message: 'Invalid token format' });

        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Invalid token' });

            // Fetch the user to check if they still exist or are active
            const user = await User.findById(decoded.user.id);
            if (!user) return res.status(404).json({ message: 'User not found' });

            req.user = { id: user._id, role: user.role }; // Attach user data to request
            next();
        });
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { authMiddleware };

