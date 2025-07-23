const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema ({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date
  },
  learningPreferences: {
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    language: {
      type: String,
      default: 'JavaScript'
    }
  },
  // Learning Statistics for user profile
  stats: {
    totalMessages: {
      type: Number,
      default: 0
    },
    totalTokens: {
      type: Number,
      default: 0
    },
    conceptsLearned: [{
      concept: String,
      learnedAt: {
        type: Date,
        default: Date.now
      }
    }],
    // Derived field - will be calculated from conceptsLearned array
    uniqueConceptsCount: {
      type: Number,
      default: 0
    }
  }
});

// Note: uniqueConceptsCount is maintained as a real field for better performance

// Method to add a new concept learned
userSchema.methods.addConceptLearned = function(concept) {
  if (!this.stats.conceptsLearned.some(c => c.concept === concept)) {
    this.stats.conceptsLearned.push({ concept });
    this.stats.uniqueConceptsCount = this.stats.conceptsLearned.length;
  }
};

// Method to increment message count and tokens
userSchema.methods.updateStats = function(messageCount = 1, tokens = 0) {
  this.stats.totalMessages += messageCount;
  this.stats.totalTokens += tokens;
  this.lastActive = new Date();
};

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
