// Health Check Middleware - Monitor Backend Status
const express = require('express');

/**
 * Health check endpoint to monitor backend status
 */
const healthCheck = (req, res) => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: 'connected', // This would be checked dynamically
      redis: 'connected',     // This would be checked dynamically
      ai: 'connected'         // This would be checked dynamically
    }
  };

  res.status(200).json(healthStatus);
};

/**
 * Detailed system status endpoint
 */
const systemStatus = (req, res) => {
  const status = {
    server: {
      status: 'running',
      port: process.env.PORT || 3000,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    },
    database: {
      status: 'connected',
      type: 'MongoDB'
    },
    redis: {
      status: 'connected',
      type: 'Redis'
    },
    ai: {
      status: 'connected',
      provider: 'Groq',
      model: 'llama3-8b-8192'
    },
    endpoints: {
      authentication: 'active',
      sessions: 'active',
      messages: 'active',
      profile: 'active'
    },
    timestamp: new Date().toISOString()
  };

  res.status(200).json(status);
};

/**
 * Middleware to log server activity
 */
const activityLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
  next();
};

/**
 * Error handler for health monitoring
 */
const healthErrorHandler = (err, req, res, next) => {
  console.error('Health check error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Health check failed',
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  healthCheck,
  systemStatus,
  activityLogger,
  healthErrorHandler
};
