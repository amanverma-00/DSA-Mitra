// authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const redisClient = require('../config/redis');

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check blocklist (skip if Redis is not connected)
    try {
      if (redisClient.isReady && await redisClient.get(`bl_${token}`)) {
        return res.status(401).json({ message: "Session expired" });
      }
    } catch (redisError) {
      console.log('Redis check failed, continuing without blocklist check:', redisError.message);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_KEY);

    // Verify user exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "Account not found" });
    }

    req.user = {
      id: user._id,
      userId: user._id, // Keep both for compatibility
      email: user.email,
      role: user.role
    };

    next();
  }
  catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Session expired" });
    }
    res.status(401).json({ message: "Invalid token" });
  }
};

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Permission denied" });
    }
    next();
  };
};

module.exports = { authenticate, authorize };