const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema ({
    sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    tokensUsed: Number,
    modelVersion: String,
    isDSAConcept: Boolean,
    conceptTags: [String]
  }
});

messageSchema.index({ sessionId: 1, timestamp: 1 });
module.exports = mongoose.model('Message', messageSchema);