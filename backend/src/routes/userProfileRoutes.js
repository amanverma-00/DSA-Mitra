const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');

// Import models
const User = require('../models/user');
const Session = require('../models/session');
const Message = require('../models/message');
const LearningProgress = require('../models/learningProgress');

// GET /api/profile - Get user profile with all statistics
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user basic info
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get active sessions count
    const activeSessions = await Session.countDocuments({ 
      userId, 
      isActive: true 
    });

    // Get recent sessions (last 10)
    const recentSessions = await Session.find({ userId })
      .sort({ lastActiveAt: -1 })
      .limit(10)
      .select('sessionId title createdAt lastActiveAt messageCount tokensUsed');

    // Get learning progress statistics
    const learningStats = await LearningProgress.getUserStats(userId);

    // Calculate total messages and tokens from user stats
    const totalMessages = user.stats.totalMessages;
    const totalTokens = user.stats.totalTokens;
    const conceptsLearned = user.stats.conceptsLearned.length;

    // Format response to match frontend expectations
    const profileData = {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastActive: user.lastActive,
        learningPreferences: user.learningPreferences,
        stats: {
          totalMessages,
          totalTokens,
          uniqueConcepts: conceptsLearned
        },
        activeSessions,
        sessions: recentSessions.map(session => ({
          id: session.sessionId,
          title: session.title,
          created: session.createdAt,
          lastActive: session.lastActiveAt,
          messageCount: session.messageCount,
          tokensUsed: session.tokensUsed
        }))
      }
    };

    res.json(profileData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/profile - Update user profile
router.put('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, learningPreferences } = req.body;

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (learningPreferences) updateData.learningPreferences = learningPreferences;

    const user = await User.findByIdAndUpdate(
      userId, 
      updateData, 
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error updating user profile:', error);
    if (error.code === 11000) {
      res.status(400).json({ error: 'Username or email already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// GET /api/profile/sessions - Get user's sessions with pagination
router.get('/sessions', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sessions = await Session.find({ userId })
      .sort({ lastActiveAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('sessionId title createdAt lastActiveAt messageCount tokensUsed isActive');

    const totalSessions = await Session.countDocuments({ userId });

    res.json({
      sessions: sessions.map(session => ({
        id: session.sessionId,
        title: session.title,
        created: session.createdAt,
        lastActive: session.lastActiveAt,
        messageCount: session.messageCount,
        tokensUsed: session.tokensUsed,
        isActive: session.isActive
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalSessions / limit),
        totalSessions,
        hasNext: page < Math.ceil(totalSessions / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/profile/learning-progress - Get detailed learning progress
router.get('/learning-progress', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const progress = await LearningProgress.find({ userId })
      .sort({ lastPracticed: -1 });

    const learningStats = await LearningProgress.getUserStats(userId);

    // Get user stats for consistency
    const user = await User.findById(userId);

    // Format stats to match frontend expectations
    const stats = {
      totalMessages: user.stats.totalMessages,
      totalTokens: user.stats.totalTokens,
      uniqueConcepts: user.stats.conceptsLearned.length,
      totalConcepts: learningStats.totalConcepts,
      masteredConcepts: learningStats.masteredConcepts,
      categoriesLearned: learningStats.categoriesLearned,
      totalPracticeCount: learningStats.totalPracticeCount
    };

    res.json({
      progress,
      stats
    });
  } catch (error) {
    console.error('Error fetching learning progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/profile/export - Export user data
router.post('/export', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all user data
    const user = await User.findById(userId).select('-password');
    const sessions = await Session.find({ userId });
    const messages = await Message.find({ userId });
    const learningProgress = await LearningProgress.find({ userId });

    const exportData = {
      user,
      sessions,
      messages,
      learningProgress,
      exportedAt: new Date()
    };

    res.json(exportData);
  } catch (error) {
    console.error('Error exporting user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Note: Session deletion is handled by /api/delete-chat endpoint in main app

module.exports = router;
