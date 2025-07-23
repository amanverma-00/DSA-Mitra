const mongoose = require('mongoose');
const { Schema } = mongoose;

const sessionSchema = new Schema ({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  // Session title for display in UI (auto-generated or user-defined)
  title: {
    type: String,
    default: function() {
      return `Session ${this.sessionId.slice(-6)}`;
    }
  },
  context: {
    name: String,
    currentTopic: String,
    difficultyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    lastConcept: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastActiveAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Session statistics
  messageCount: {
    type: Number,
    default: 0
  },
  tokensUsed: {
    type: Number,
    default: 0
  }
});

sessionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  this.lastActiveAt = new Date();
  next();
});

// Method to generate a smart title based on the first user message or topic
sessionSchema.methods.generateTitle = function(firstMessage) {
  if (firstMessage && firstMessage.length > 0) {
    // Extract key words and create a meaningful title
    const words = firstMessage.split(' ').slice(0, 4);
    this.title = words.join(' ') + (firstMessage.split(' ').length > 4 ? '...' : '');
  } else if (this.context.currentTopic) {
    this.title = this.context.currentTopic;
  } else {
    this.title = `Session ${this.sessionId.slice(-6)}`;
  }
};

// Method to update session statistics
sessionSchema.methods.updateStats = function(messageCount = 1, tokens = 0) {
  this.messageCount += messageCount;
  this.tokensUsed += tokens;
  this.lastActiveAt = new Date();
};

module.exports = mongoose.model('Session', sessionSchema);
