const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Recipient Information
  recipient: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'المستقبل مطلوب']
  },
  
  // Sender Information (optional, for user-to-user notifications)
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  
  // Notification Content
  title: {
    type: String,
    required: [true, 'عنوان الإشعار مطلوب'],
    maxlength: [100, 'عنوان الإشعار لا يمكن أن يتجاوز 100 حرف']
  },
  
  message: {
    type: String,
    required: [true, 'رسالة الإشعار مطلوبة'],
    maxlength: [500, 'رسالة الإشعار لا يمكن أن تتجاوز 500 حرف']
  },
  
  // Notification Type
  type: {
    type: String,
    enum: [
      // Order related
      'order_created',
      'order_confirmed',
      'order_cancelled',
      'order_delivered',
      'order_completed',
      'payment_received',
      'payment_failed',
      
      // Product/Service related
      'product_liked',
      'product_shared',
      'product_inquiry',
      'service_booked',
      'service_completed',
      'new_review',
      'review_response',
      
      // User related
      'new_follower',
      'profile_viewed',
      'message_received',
      'friend_request',
      
      // Store related
      'store_followed',
      'new_product_added',
      'store_promotion',
      
      // System related
      'system_update',
      'maintenance',
      'security_alert',
      'account_verified',
      'password_changed',
      
      // Marketing
      'promotion',
      'discount_offer',
      'seasonal_offer',
      'recommendation',
      
      // Community
      'community_event',
      'weather_alert',
      'emergency_alert'
    ],
    required: [true, 'نوع الإشعار مطلوب']
  },
  
  // Related Entity Information
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['User', 'Product', 'Service', 'Store', 'Order', 'Review', 'Message']
    },
    entityId: {
      type: mongoose.Schema.ObjectId,
      refPath: 'relatedEntity.entityType'
    }
  },
  
  // Notification Data (additional context)
  data: {
    // For orders
    orderNumber: String,
    orderAmount: Number,
    
    // For products/services
    productTitle: String,
    serviceTitle: String,
    price: Number,
    currency: String,
    
    // For reviews
    rating: Number,
    
    // For messages
    messagePreview: String,
    
    // For promotions
    discountPercentage: Number,
    validUntil: Date,
    promoCode: String,
    
    // For system notifications
    version: String,
    maintenanceStart: Date,
    maintenanceEnd: Date,
    
    // Custom data
    customData: mongoose.Schema.Types.Mixed
  },
  
  // Notification Status
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
    default: 'pending'
  },
  
  // Read Status
  isRead: {
    type: Boolean,
    default: false
  },
  
  readAt: Date,
  
  // Delivery Information
  deliveryChannels: [{
    channel: {
      type: String,
      enum: ['push', 'email', 'sms', 'in_app'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed'],
      default: 'pending'
    },
    sentAt: Date,
    deliveredAt: Date,
    failureReason: String,
    externalId: String // ID from external service (FCM, email service, etc.)
  }],
  
  // Push Notification Specific
  pushNotification: {
    fcmToken: String,
    fcmMessageId: String,
    sound: {
      type: String,
      default: 'default'
    },
    badge: Number,
    icon: String,
    image: String,
    clickAction: String,
    tag: String, // For grouping notifications
    priority: {
      type: String,
      enum: ['low', 'normal', 'high'],
      default: 'normal'
    }
  },
  
  // Email Notification Specific
  emailNotification: {
    emailAddress: String,
    emailTemplate: String,
    emailSubject: String,
    emailProvider: String, // 'sendgrid', 'mailgun', etc.
    emailId: String // ID from email service
  },
  
  // SMS Notification Specific
  smsNotification: {
    phoneNumber: String,
    smsProvider: String, // 'twilio', etc.
    smsId: String // ID from SMS service
  },
  
  // Scheduling
  scheduledFor: Date,
  isScheduled: {
    type: Boolean,
    default: false
  },
  
  // Grouping and Batching
  groupId: String, // For grouping related notifications
  batchId: String, // For batch processing
  
  // Priority and Importance
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  importance: {
    type: String,
    enum: ['min', 'low', 'default', 'high', 'max'],
    default: 'default'
  },
  
  // Action Buttons (for rich notifications)
  actions: [{
    actionId: String,
    title: String,
    icon: String,
    action: String, // URL or deep link
    requiresAuth: {
      type: Boolean,
      default: false
    }
  }],
  
  // Expiry
  expiresAt: Date,
  
  // Retry Information
  retryCount: {
    type: Number,
    default: 0,
    max: [5, 'عدد المحاولات لا يمكن أن يتجاوز 5']
  },
  
  maxRetries: {
    type: Number,
    default: 3
  },
  
  nextRetryAt: Date,
  
  // Tracking
  clickCount: {
    type: Number,
    default: 0
  },
  
  clickedAt: [Date],
  
  // User Preferences
  respectUserPreferences: {
    type: Boolean,
    default: true
  },
  
  // Localization
  language: {
    type: String,
    enum: ['ar', 'en'],
    default: 'ar'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  sentAt: Date,
  deliveredAt: Date,
  failedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ scheduledFor: 1 }, { sparse: true });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
notificationSchema.index({ groupId: 1 }, { sparse: true });
notificationSchema.index({ batchId: 1 }, { sparse: true });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ nextRetryAt: 1 }, { sparse: true });

// Compound indexes
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1, createdAt: -1 });
notificationSchema.index({ status: 1, scheduledFor: 1 });

// Virtual for is delivered
notificationSchema.virtual('isDelivered').get(function() {
  return ['delivered', 'read'].includes(this.status);
});

// Virtual for is failed
notificationSchema.virtual('isFailed').get(function() {
  return this.status === 'failed';
});

// Virtual for can retry
notificationSchema.virtual('canRetry').get(function() {
  return this.status === 'failed' && this.retryCount < this.maxRetries;
});

// Virtual for is expired
notificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Virtual for successful delivery channels
notificationSchema.virtual('successfulChannels').get(function() {
  return this.deliveryChannels.filter(channel => 
    ['sent', 'delivered'].includes(channel.status)
  );
});

// Virtual for failed delivery channels
notificationSchema.virtual('failedChannels').get(function() {
  return this.deliveryChannels.filter(channel => 
    channel.status === 'failed'
  );
});

// Pre-save middleware
notificationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set expiry if not provided (default 30 days)
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  
  // Update status based on delivery channels
  if (this.deliveryChannels.length > 0) {
    const allFailed = this.deliveryChannels.every(channel => channel.status === 'failed');
    const anyDelivered = this.deliveryChannels.some(channel => 
      ['sent', 'delivered'].includes(channel.status)
    );
    
    if (allFailed) {
      this.status = 'failed';
      this.failedAt = new Date();
    } else if (anyDelivered) {
      this.status = 'delivered';
      this.deliveredAt = new Date();
    }
  }
  
  next();
});

// Static method to create notification
notificationSchema.statics.createNotification = async function(notificationData) {
  const notification = new this(notificationData);
  
  // Auto-populate delivery channels based on user preferences
  if (notificationData.recipient) {
    const User = mongoose.model('User');
    const user = await User.findById(notificationData.recipient);
    
    if (user && user.notificationSettings) {
      const channels = [];
      
      // Add push notification if enabled and FCM token exists
      if (user.notificationSettings.push && user.fcmToken) {
        channels.push({
          channel: 'push',
          status: 'pending'
        });
        notification.pushNotification.fcmToken = user.fcmToken;
      }
      
      // Add email notification if enabled
      if (user.notificationSettings.email && user.email) {
        channels.push({
          channel: 'email',
          status: 'pending'
        });
        notification.emailNotification.emailAddress = user.email;
      }
      
      // Add SMS notification if enabled
      if (user.notificationSettings.sms && user.phone) {
        channels.push({
          channel: 'sms',
          status: 'pending'
        });
        notification.smsNotification.phoneNumber = user.phone;
      }
      
      // Always add in-app notification
      channels.push({
        channel: 'in_app',
        status: 'sent'
      });
      
      notification.deliveryChannels = channels;
    }
  }
  
  return notification.save();
};

// Static method to get user notifications
notificationSchema.statics.getUserNotifications = function(userId, options = {}) {
  const {
    type = null,
    isRead = null,
    limit = 20,
    page = 1,
    priority = null
  } = options;
  
  const skip = (page - 1) * limit;
  const query = { recipient: userId };
  
  if (type) query.type = type;
  if (isRead !== null) query.isRead = isRead;
  if (priority) query.priority = priority;
  
  return this.find(query)
    .populate('sender', 'name avatar')
    .populate('relatedEntity.entityId')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId, type = null) {
  const query = { 
    recipient: userId, 
    isRead: false,
    status: { $ne: 'failed' }
  };
  
  if (type) query.type = type;
  
  return this.countDocuments(query);
};

// Static method to mark as read
notificationSchema.statics.markAsRead = function(userId, notificationIds = null) {
  const query = { 
    recipient: userId, 
    isRead: false 
  };
  
  if (notificationIds) {
    query._id = { $in: notificationIds };
  }
  
  return this.updateMany(query, {
    $set: {
      isRead: true,
      readAt: new Date(),
      status: 'read'
    }
  });
};

// Static method to get pending notifications for sending
notificationSchema.statics.getPendingNotifications = function(limit = 100) {
  return this.find({
    status: 'pending',
    $or: [
      { scheduledFor: { $lte: new Date() } },
      { scheduledFor: { $exists: false } }
    ],
    expiresAt: { $gt: new Date() }
  })
  .populate('recipient', 'fcmToken email phone notificationSettings')
  .limit(limit);
};

// Static method to get failed notifications for retry
notificationSchema.statics.getFailedNotificationsForRetry = function(limit = 50) {
  return this.find({
    status: 'failed',
    retryCount: { $lt: '$maxRetries' },
    $or: [
      { nextRetryAt: { $lte: new Date() } },
      { nextRetryAt: { $exists: false } }
    ],
    expiresAt: { $gt: new Date() }
  })
  .populate('recipient', 'fcmToken email phone notificationSettings')
  .limit(limit);
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  this.status = 'read';
  
  return this.save();
};

// Instance method to mark as clicked
notificationSchema.methods.markAsClicked = function() {
  this.clickCount += 1;
  this.clickedAt.push(new Date());
  
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    this.status = 'read';
  }
  
  return this.save();
};

// Instance method to update delivery status
notificationSchema.methods.updateDeliveryStatus = function(channel, status, externalId = null, failureReason = null) {
  const deliveryChannel = this.deliveryChannels.find(dc => dc.channel === channel);
  
  if (deliveryChannel) {
    deliveryChannel.status = status;
    
    if (status === 'sent') {
      deliveryChannel.sentAt = new Date();
      this.sentAt = new Date();
    } else if (status === 'delivered') {
      deliveryChannel.deliveredAt = new Date();
    } else if (status === 'failed') {
      deliveryChannel.failureReason = failureReason;
    }
    
    if (externalId) {
      deliveryChannel.externalId = externalId;
    }
  }
  
  return this.save();
};

// Instance method to schedule retry
notificationSchema.methods.scheduleRetry = function(delayMinutes = null) {
  if (this.retryCount >= this.maxRetries) {
    throw new Error('تم تجاوز الحد الأقصى لعدد المحاولات');
  }
  
  this.retryCount += 1;
  
  // Calculate retry delay (exponential backoff)
  const baseDelay = delayMinutes || Math.pow(2, this.retryCount) * 5; // 5, 10, 20, 40 minutes
  this.nextRetryAt = new Date(Date.now() + baseDelay * 60 * 1000);
  
  // Reset delivery channels to pending
  this.deliveryChannels.forEach(channel => {
    if (channel.status === 'failed') {
      channel.status = 'pending';
      channel.failureReason = undefined;
    }
  });
  
  this.status = 'pending';
  
  return this.save();
};

// Static method to get notification statistics
notificationSchema.statics.getStatistics = async function(filters = {}) {
  const matchStage = { ...filters };
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalNotifications: { $sum: 1 },
        sentNotifications: {
          $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] }
        },
        deliveredNotifications: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
        },
        readNotifications: {
          $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] }
        },
        failedNotifications: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        totalClicks: { $sum: '$clickCount' },
        averageClicksPerNotification: { $avg: '$clickCount' }
      }
    }
  ]);
  
  return stats[0] || {
    totalNotifications: 0,
    sentNotifications: 0,
    deliveredNotifications: 0,
    readNotifications: 0,
    failedNotifications: 0,
    totalClicks: 0,
    averageClicksPerNotification: 0
  };
};

// Static method to clean up old notifications
notificationSchema.statics.cleanupOldNotifications = function(daysOld = 90) {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
  
  return this.deleteMany({
    createdAt: { $lt: cutoffDate },
    isRead: true
  });
};

// Static method to get notification trends
notificationSchema.statics.getNotificationTrends = async function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
          type: '$type'
        },
        count: { $sum: 1 },
        readCount: {
          $sum: { $cond: ['$isRead', 1, 0] }
        },
        clickCount: { $sum: '$clickCount' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;