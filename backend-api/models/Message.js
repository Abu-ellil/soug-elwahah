const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Conversation Information
  conversationId: {
    type: String,
    required: [true, 'معرف المحادثة مطلوب'],
    index: true
  },
  
  // Sender and Receiver
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'المرسل مطلوب']
  },
  
  receiver: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'المستقبل مطلوب']
  },
  
  // Message Content
  messageType: {
    type: String,
    enum: ['text', 'image', 'audio', 'video', 'document', 'location', 'product', 'service', 'order', 'system'],
    default: 'text'
  },
  
  content: {
    text: {
      type: String,
      maxlength: [2000, 'النص لا يمكن أن يتجاوز 2000 حرف']
    },
    
    // For media messages
    media: {
      url: String,
      publicId: String, // Cloudinary public ID
      filename: String,
      size: Number, // File size in bytes
      duration: Number, // For audio/video in seconds
      thumbnail: String, // Thumbnail for videos
      mimeType: String
    },
    
    // For location messages
    location: {
      latitude: {
        type: Number,
        min: [-90, 'خط العرض يجب أن يكون بين -90 و 90'],
        max: [90, 'خط العرض يجب أن يكون بين -90 و 90']
      },
      longitude: {
        type: Number,
        min: [-180, 'خط الطول يجب أن يكون بين -180 و 180'],
        max: [180, 'خط الطول يجب أن يكون بين -180 و 180']
      },
      address: String,
      placeName: String
    },
    
    // For product/service sharing
    sharedItem: {
      itemType: {
        type: String,
        enum: ['Product', 'Service', 'Store']
      },
      itemId: {
        type: mongoose.Schema.ObjectId,
        refPath: 'content.sharedItem.itemType'
      },
      title: String,
      image: String,
      price: Number,
      currency: String
    },
    
    // For order-related messages
    orderInfo: {
      orderId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Order'
      },
      orderNumber: String,
      status: String,
      amount: Number
    }
  },
  
  // Message Status
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  
  // Read Status
  readBy: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Delivery Status
  deliveredAt: Date,
  readAt: Date,
  
  // Message Context
  context: {
    // Reply to another message
    replyTo: {
      type: mongoose.Schema.ObjectId,
      ref: 'Message'
    },
    
    // Forward information
    forwardedFrom: {
      originalSender: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      },
      forwardedAt: Date,
      forwardCount: {
        type: Number,
        default: 0
      }
    },
    
    // Related to product/service inquiry
    relatedTo: {
      itemType: {
        type: String,
        enum: ['Product', 'Service', 'Store', 'Order']
      },
      itemId: {
        type: mongoose.Schema.ObjectId,
        refPath: 'context.relatedTo.itemType'
      }
    }
  },
  
  // Message Flags
  isEdited: {
    type: Boolean,
    default: false
  },
  
  editHistory: [{
    previousContent: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  isDeleted: {
    type: Boolean,
    default: false
  },
  
  deletedBy: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    deletedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // System message info
  systemMessage: {
    type: {
      type: String,
      enum: [
        'user_joined',
        'user_left',
        'order_created',
        'order_updated',
        'payment_received',
        'delivery_started',
        'delivery_completed',
        'review_added'
      ]
    },
    data: mongoose.Schema.Types.Mixed
  },
  
  // Reactions
  reactions: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String,
      required: true
    },
    reactedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Message Priority
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Scheduled Messages
  scheduledFor: Date,
  isScheduled: {
    type: Boolean,
    default: false
  },
  
  // Message Encryption (for future use)
  isEncrypted: {
    type: Boolean,
    default: false
  },
  
  encryptionKey: String,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Message expiry (for temporary messages)
  expiresAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, createdAt: -1 });
messageSchema.index({ status: 1 });
messageSchema.index({ 'content.location.coordinates': '2dsphere' });
messageSchema.index({ scheduledFor: 1 }, { sparse: true });
messageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound indexes
messageSchema.index({ conversationId: 1, status: 1 });
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

// Virtual for is read
messageSchema.virtual('isRead').get(function() {
  return this.status === 'read';
});

// Virtual for is delivered
messageSchema.virtual('isDelivered').get(function() {
  return ['delivered', 'read'].includes(this.status);
});

// Virtual for conversation participants
messageSchema.virtual('participants').get(function() {
  return [this.sender, this.receiver];
});

// Virtual for has media
messageSchema.virtual('hasMedia').get(function() {
  return ['image', 'audio', 'video', 'document'].includes(this.messageType);
});

// Virtual for is system message
messageSchema.virtual('isSystemMessage').get(function() {
  return this.messageType === 'system';
});

// Virtual for reaction count
messageSchema.virtual('reactionCount').get(function() {
  return this.reactions.length;
});

// Pre-save middleware
messageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Generate conversation ID if not provided
  if (!this.conversationId) {
    const participants = [this.sender.toString(), this.receiver.toString()].sort();
    this.conversationId = participants.join('_');
  }
  
  // Set delivered status for new messages
  if (this.isNew && this.status === 'sent') {
    this.status = 'delivered';
    this.deliveredAt = new Date();
  }
  
  next();
});

// Static method to get conversation messages
messageSchema.statics.getConversation = function(conversationId, options = {}) {
  const {
    limit = 50,
    page = 1,
    before = null, // Get messages before this date
    after = null   // Get messages after this date
  } = options;
  
  const skip = (page - 1) * limit;
  const query = { 
    conversationId,
    isDeleted: false
  };
  
  if (before) query.createdAt = { $lt: before };
  if (after) query.createdAt = { ...query.createdAt, $gt: after };
  
  return this.find(query)
    .populate('sender', 'name avatar')
    .populate('receiver', 'name avatar')
    .populate('context.replyTo', 'content.text sender')
    .populate('content.sharedItem.itemId')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get user conversations
messageSchema.statics.getUserConversations = function(userId, limit = 20, page = 1) {
  const skip = (page - 1) * limit;
  
  return this.aggregate([
    {
      $match: {
        $or: [
          { sender: new mongoose.Types.ObjectId(userId) },
          { receiver: new mongoose.Types.ObjectId(userId) }
        ],
        isDeleted: false
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: '$conversationId',
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ['$sender', new mongoose.Types.ObjectId(userId)] },
                  { $ne: ['$status', 'read'] }
                ]
              },
              1,
              0
            ]
          }
        },
        totalMessages: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'lastMessage.sender',
        foreignField: '_id',
        as: 'senderInfo'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'lastMessage.receiver',
        foreignField: '_id',
        as: 'receiverInfo'
      }
    },
    {
      $sort: { 'lastMessage.createdAt': -1 }
    },
    {
      $skip: skip
    },
    {
      $limit: limit
    }
  ]);
};

// Static method to mark messages as read
messageSchema.statics.markAsRead = function(conversationId, userId) {
  return this.updateMany(
    {
      conversationId,
      receiver: userId,
      status: { $ne: 'read' }
    },
    {
      $set: {
        status: 'read',
        readAt: new Date()
      },
      $push: {
        readBy: {
          user: userId,
          readAt: new Date()
        }
      }
    }
  );
};

// Static method to get unread count
messageSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    receiver: userId,
    status: { $ne: 'read' },
    isDeleted: false
  });
};

// Static method to search messages
messageSchema.statics.searchMessages = function(userId, searchTerm, options = {}) {
  const {
    conversationId = null,
    messageType = null,
    limit = 20,
    page = 1
  } = options;
  
  const skip = (page - 1) * limit;
  const query = {
    $or: [
      { sender: userId },
      { receiver: userId }
    ],
    'content.text': { $regex: searchTerm, $options: 'i' },
    isDeleted: false
  };
  
  if (conversationId) query.conversationId = conversationId;
  if (messageType) query.messageType = messageType;
  
  return this.find(query)
    .populate('sender', 'name avatar')
    .populate('receiver', 'name avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Instance method to mark as read
messageSchema.methods.markAsRead = function(userId) {
  if (this.receiver.toString() === userId.toString() && this.status !== 'read') {
    this.status = 'read';
    this.readAt = new Date();
    
    // Add to readBy array if not already there
    const alreadyRead = this.readBy.some(read => 
      read.user.toString() === userId.toString()
    );
    
    if (!alreadyRead) {
      this.readBy.push({
        user: userId,
        readAt: new Date()
      });
    }
    
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Instance method to add reaction
messageSchema.methods.addReaction = function(userId, emoji) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(reaction => 
    reaction.user.toString() !== userId.toString()
  );
  
  // Add new reaction
  this.reactions.push({
    user: userId,
    emoji,
    reactedAt: new Date()
  });
  
  return this.save();
};

// Instance method to remove reaction
messageSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(reaction => 
    reaction.user.toString() !== userId.toString()
  );
  
  return this.save();
};

// Instance method to edit message
messageSchema.methods.editMessage = function(newContent) {
  if (this.messageType !== 'text') {
    throw new Error('يمكن تعديل الرسائل النصية فقط');
  }
  
  // Save previous content to history
  this.editHistory.push({
    previousContent: this.content.text,
    editedAt: new Date()
  });
  
  this.content.text = newContent;
  this.isEdited = true;
  
  return this.save();
};

// Instance method to delete message
messageSchema.methods.deleteMessage = function(userId, deleteForEveryone = false) {
  if (deleteForEveryone) {
    // Delete for everyone (only sender can do this within 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (this.sender.toString() !== userId.toString() || this.createdAt < oneDayAgo) {
      throw new Error('لا يمكن حذف هذه الرسالة للجميع');
    }
    
    this.isDeleted = true;
    this.content = { text: 'تم حذف هذه الرسالة' };
  } else {
    // Delete for this user only
    const existingDelete = this.deletedBy.find(del => 
      del.user.toString() === userId.toString()
    );
    
    if (!existingDelete) {
      this.deletedBy.push({
        user: userId,
        deletedAt: new Date()
      });
    }
  }
  
  return this.save();
};

// Instance method to forward message
messageSchema.methods.forwardTo = function(senderId, receiverId) {
  const forwardedMessage = new this.constructor({
    sender: senderId,
    receiver: receiverId,
    messageType: this.messageType,
    content: { ...this.content },
    context: {
      forwardedFrom: {
        originalSender: this.context.forwardedFrom?.originalSender || this.sender,
        forwardedAt: new Date(),
        forwardCount: (this.context.forwardedFrom?.forwardCount || 0) + 1
      }
    }
  });
  
  return forwardedMessage.save();
};

// Static method to get message statistics
messageSchema.statics.getStatistics = async function(filters = {}) {
  const matchStage = { ...filters, isDeleted: false };
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalMessages: { $sum: 1 },
        textMessages: {
          $sum: { $cond: [{ $eq: ['$messageType', 'text'] }, 1, 0] }
        },
        mediaMessages: {
          $sum: { $cond: [{ $in: ['$messageType', ['image', 'audio', 'video', 'document']] }, 1, 0] }
        },
        readMessages: {
          $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] }
        },
        unreadMessages: {
          $sum: { $cond: [{ $ne: ['$status', 'read'] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalMessages: 0,
    textMessages: 0,
    mediaMessages: 0,
    readMessages: 0,
    unreadMessages: 0
  };
};

// Static method to clean up expired messages
messageSchema.statics.cleanupExpiredMessages = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;