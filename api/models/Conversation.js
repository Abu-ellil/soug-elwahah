const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  
  type: {
    type: String,
    enum: ['direct', 'group'],
    default: 'direct'
  },
  
  name: {
    type: String,
    trim: true,
    maxlength: [100, 'اسم المحادثة لا يجب أن يتجاوز 100 حرف']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'وصف المحادثة لا يجب أن يتجاوز 500 حرف']
  },
  
  avatar: {
    type: String,
    default: null
  },
  
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  
  lastActivity: {
    type: Date,
    default: Date.now
  },
  
  // For group conversations
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Message counts for each participant
  messageCounts: [{
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    unreadCount: {
      type: Number,
      default: 0
    },
    lastReadAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Conversation settings
  settings: {
    muteNotifications: {
      type: Boolean,
      default: false
    },
    archived: {
      type: Boolean,
      default: false
    }
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastActivity: -1 });
conversationSchema.index({ isActive: 1 });
conversationSchema.index({ type: 1 });

// Virtual for messages
conversationSchema.virtual('messages', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'conversation'
});

// Pre-save middleware to update timestamps
conversationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to add participant
conversationSchema.methods.addParticipant = function(userId) {
  if (!this.participants.includes(userId)) {
    this.participants.push(userId);
    this.messageCounts.push({
      participant: userId,
      unreadCount: 0,
      lastReadAt: new Date()
    });
  }
  return this.save();
};

// Instance method to remove participant
conversationSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(p => !p.equals(userId));
  this.messageCounts = this.messageCounts.filter(mc => !mc.participant.equals(userId));
  return this.save();
};

// Instance method to update unread count
conversationSchema.methods.updateUnreadCount = function(userId, increment = true) {
  const messageCount = this.messageCounts.find(mc => mc.participant.equals(userId));
  if (messageCount) {
    if (increment) {
      messageCount.unreadCount += 1;
    } else {
      messageCount.unreadCount = 0;
      messageCount.lastReadAt = new Date();
    }
  }
  return this.save();
};

// Instance method to mark as read
conversationSchema.methods.markAsRead = function(userId) {
  return this.updateUnreadCount(userId, false);
};

// Static method to find conversation between users
conversationSchema.statics.findBetweenUsers = function(user1Id, user2Id) {
  return this.findOne({
    type: 'direct',
    participants: { $all: [user1Id, user2Id], $size: 2 },
    isActive: true
  });
};

// Static method to find user conversations
conversationSchema.statics.findUserConversations = function(userId, options = {}) {
  const { page = 1, limit = 20, archived = false } = options;
  const skip = (page - 1) * limit;
  
  return this.find({
    participants: userId,
    isActive: true,
    'settings.archived': archived
  })
  .populate('participants', 'name avatar isActive')
  .populate('lastMessage', 'content messageType createdAt sender')
  .sort({ lastActivity: -1 })
  .skip(skip)
  .limit(limit);
};

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;