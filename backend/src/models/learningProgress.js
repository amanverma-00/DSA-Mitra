const mongoose = require('mongoose');
const { Schema } = mongoose;

const learningProgressSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  concept: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: [
      'arrays', 'strings', 'linked-lists', 'stacks', 'queues', 
      'trees', 'graphs', 'sorting', 'searching', 'dynamic-programming',
      'recursion', 'backtracking', 'greedy', 'divide-conquer', 'hashing',
      'heap', 'trie', 'bit-manipulation', 'math', 'two-pointers',
      'sliding-window', 'binary-search', 'dfs', 'bfs', 'topological-sort'
    ],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  masteryLevel: {
    type: String,
    enum: ['introduced', 'practicing', 'comfortable', 'mastered'],
    default: 'introduced'
  },
  firstEncountered: {
    type: Date,
    default: Date.now
  },
  lastPracticed: {
    type: Date,
    default: Date.now
  },
  practiceCount: {
    type: Number,
    default: 1
  },
  // Track which sessions this concept was discussed in
  sessions: [{
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session'
    },
    discussedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Track problems solved related to this concept
  problemsSolved: [{
    problemTitle: String,
    difficulty: String,
    solvedAt: {
      type: Date,
      default: Date.now
    }
  }]
});

// Compound index for efficient queries
learningProgressSchema.index({ userId: 1, concept: 1 }, { unique: true });
learningProgressSchema.index({ userId: 1, category: 1 });
learningProgressSchema.index({ userId: 1, masteryLevel: 1 });

// Method to update mastery level based on practice count
learningProgressSchema.methods.updateMastery = function() {
  if (this.practiceCount >= 10) {
    this.masteryLevel = 'mastered';
  } else if (this.practiceCount >= 5) {
    this.masteryLevel = 'comfortable';
  } else if (this.practiceCount >= 2) {
    this.masteryLevel = 'practicing';
  }
  this.lastPracticed = new Date();
};

// Static method to get user's learning statistics
learningProgressSchema.statics.getUserStats = async function(userId) {
  try {
    const progressEntries = await this.find({ userId });

    const stats = {
      totalConcepts: progressEntries.length,
      masteredConcepts: progressEntries.filter(p => p.masteryLevel === 'mastered').length,
      categoriesLearned: [...new Set(progressEntries.map(p => p.category))],
      totalPracticeCount: progressEntries.reduce((sum, p) => sum + p.practiceCount, 0)
    };

    return stats;
  } catch (error) {
    console.error('Error in getUserStats:', error);
    return {
      totalConcepts: 0,
      masteredConcepts: 0,
      categoriesLearned: [],
      totalPracticeCount: 0
    };
  }
};

module.exports = mongoose.model('LearningProgress', learningProgressSchema);
