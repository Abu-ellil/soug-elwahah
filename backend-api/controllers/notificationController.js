const Notification = require('../models/Notification');
const User = require('../models/User');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const ApiFeatures = require('../utils/apiFeatures');

/**
 * Get user notifications
 */
const getUserNotifications = asyncHandler(async (req, res, next) => {
  const features = new ApiFeatures(
    Notification.find({ recipient: req.user._id }),
    req.query
  )
    .filter()
    .sort('-createdAt')
    .limitFields()
    .paginate();

  const notifications = await features.query
    .populate('sender', 'name avatar businessName')
    .populate('relatedProduct', 'name images price')
    .populate('relatedService', 'name images price')
    .populate('relatedOrder', 'orderNumber status');

  const total = await Notification.countDocuments({ recipient: req.user._id });
  const unreadCount = await Notification.countDocuments({ 
    recipient: req.user._id, 
    isRead: false 
  });

  res.status(200).json(
    ApiResponse.success('تم جلب الإشعارات بنجاح', {
      notifications,
      total,
      unreadCount,
      page: req.query.page * 1 || 1,
      limit: req.query.limit * 1 || 10
    })
  );
});

/**
 * Get unread notifications count
 */
const getUnreadCount = asyncHandler(async (req, res, next) => {
  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false
  });

  res.status(200).json(
    ApiResponse.success('تم جلب عدد الإشعارات غير المقروءة بنجاح', { unreadCount })
  );
});

/**
 * Mark notification as read
 */
const markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    return next(new AppError('لم يتم العثور على الإشعار', 404));
  }

  res.status(200).json(
    ApiResponse.success('تم تحديد الإشعار كمقروء بنجاح', { notification })
  );
});

/**
 * Mark all notifications as read
 */
const markAllAsRead = asyncHandler(async (req, res, next) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.status(200).json(
    ApiResponse.success('تم تحديد جميع الإشعارات كمقروءة بنجاح')
  );
});

/**
 * Delete notification
 */
const deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user._id
  });

  if (!notification) {
    return next(new AppError('لم يتم العثور على الإشعار', 404));
  }

  res.status(200).json(
    ApiResponse.success('تم حذف الإشعار بنجاح')
  );
});

/**
 * Delete all notifications
 */
const deleteAllNotifications = asyncHandler(async (req, res, next) => {
  await Notification.deleteMany({ recipient: req.user._id });

  res.status(200).json(
    ApiResponse.success('تم حذف جميع الإشعارات بنجاح')
  );
});

/**
 * Create notification (Internal use)
 */
const createNotification = async (notificationData) => {
  try {
    const notification = await Notification.create(notificationData);
    
    // Populate notification for real-time sending
    await notification.populate([
      { path: 'sender', select: 'name avatar businessName' },
      { path: 'recipient', select: 'name fcmToken settings' },
      { path: 'relatedProduct', select: 'name images' },
      { path: 'relatedService', select: 'name images' },
      { path: 'relatedOrder', select: 'orderNumber status' }
    ]);

    // Send push notification if user has FCM token and notifications enabled
    if (notification.recipient.fcmToken && 
        notification.recipient.settings?.notifications?.push !== false) {
      await sendPushNotification(notification);
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Send push notification using FCM
 */
const sendPushNotification = async (notification) => {
  try {
    // This would integrate with Firebase Cloud Messaging
    // For now, it's a placeholder implementation
    console.log('Sending push notification:', {
      to: notification.recipient.fcmToken,
      title: notification.title,
      body: notification.message,
      data: {
        type: notification.type,
        notificationId: notification._id.toString(),
        relatedId: notification.relatedProduct || notification.relatedService || notification.relatedOrder
      }
    });

    // TODO: Implement actual FCM integration
    // const admin = require('firebase-admin');
    // await admin.messaging().send({
    //   token: notification.recipient.fcmToken,
    //   notification: {
    //     title: notification.title,
    //     body: notification.message
    //   },
    //   data: {
    //     type: notification.type,
    //     notificationId: notification._id.toString()
    //   }
    // });

  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

/**
 * Update FCM token
 */
const updateFCMToken = asyncHandler(async (req, res, next) => {
  const { fcmToken } = req.body;

  if (!fcmToken) {
    return next(new AppError('رمز FCM مطلوب', 400));
  }

  await User.findByIdAndUpdate(req.user._id, { fcmToken });

  res.status(200).json(
    ApiResponse.success('تم تحديث رمز الإشعارات بنجاح')
  );
});

/**
 * Update notification preferences
 */
const updateNotificationPreferences = asyncHandler(async (req, res, next) => {
  const { push, email, sms, orderUpdates, newMessages, promotions } = req.body;

  const preferences = {
    'settings.notifications.push': push,
    'settings.notifications.email': email,
    'settings.notifications.sms': sms,
    'settings.notifications.orderUpdates': orderUpdates,
    'settings.notifications.newMessages': newMessages,
    'settings.notifications.promotions': promotions
  };

  // Remove undefined values
  Object.keys(preferences).forEach(key => {
    if (preferences[key] === undefined) {
      delete preferences[key];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: preferences },
    { new: true }
  );

  res.status(200).json(
    ApiResponse.success('تم تحديث إعدادات الإشعارات بنجاح', {
      preferences: user.settings.notifications
    })
  );
});

/**
 * Get notification preferences
 */
const getNotificationPreferences = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('settings.notifications');

  res.status(200).json(
    ApiResponse.success('تم جلب إعدادات الإشعارات بنجاح', {
      preferences: user.settings?.notifications || {}
    })
  );
});

/**
 * Send bulk notifications (Admin only)
 */
const sendBulkNotification = asyncHandler(async (req, res, next) => {
  const { title, message, type, recipients, filters } = req.body;

  if (!title || !message || !type) {
    return next(new AppError('العنوان والرسالة والنوع مطلوبان', 400));
  }

  let targetUsers = [];

  if (recipients && recipients.length > 0) {
    // Send to specific users
    targetUsers = await User.find({ _id: { $in: recipients } });
  } else if (filters) {
    // Send based on filters
    let query = {};
    if (filters.role) query.role = filters.role;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    
    targetUsers = await User.find(query);
  } else {
    // Send to all active users
    targetUsers = await User.find({ isActive: true });
  }

  // Create notifications for all target users
  const notifications = targetUsers.map(user => ({
    recipient: user._id,
    sender: req.user._id,
    title,
    message,
    type,
    isRead: false
  }));

  await Notification.insertMany(notifications);

  res.status(200).json(
    ApiResponse.success('تم إرسال الإشعارات بنجاح', {
      sentTo: targetUsers.length,
      recipients: targetUsers.map(u => ({ id: u._id, name: u.name }))
    })
  );
});

/**
 * Get notification statistics (Admin only)
 */
const getNotificationStats = asyncHandler(async (req, res, next) => {
  const stats = await Notification.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        read: { $sum: { $cond: ['$isRead', 1, 0] } },
        unread: { $sum: { $cond: ['$isRead', 0, 1] } }
      }
    }
  ]);

  const typeStats = await Notification.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    }
  ]);

  const dailyStats = await Notification.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.status(200).json(
    ApiResponse.success('تم جلب إحصائيات الإشعارات بنجاح', {
      overview: stats[0] || { total: 0, read: 0, unread: 0 },
      byType: typeStats,
      daily: dailyStats
    })
  );
});

module.exports = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  createNotification,
  sendPushNotification,
  updateFCMToken,
  updateNotificationPreferences,
  getNotificationPreferences,
  sendBulkNotification,
  getNotificationStats
};