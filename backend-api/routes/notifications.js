const express = require('express');
const {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  updateFCMToken,
  updateNotificationPreferences,
  getNotificationPreferences,
  sendBulkNotification,
  getNotificationStats
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get user notifications with pagination and filtering
router.get('/', getUserNotifications);

// Get unread notifications count
router.get('/unread-count', getUnreadCount);

// Get notification preferences
router.get('/preferences', getNotificationPreferences);

// Update notification preferences
router.patch('/preferences', [
  body('push').optional().isBoolean().withMessage('Push notifications setting must be boolean'),
  body('email').optional().isBoolean().withMessage('Email notifications setting must be boolean'),
  body('sms').optional().isBoolean().withMessage('SMS notifications setting must be boolean'),
  body('orderUpdates').optional().isBoolean().withMessage('Order updates setting must be boolean'),
  body('newMessages').optional().isBoolean().withMessage('New messages setting must be boolean'),
  body('promotions').optional().isBoolean().withMessage('Promotions setting must be boolean'),
  validate
], updateNotificationPreferences);

// Update FCM token for push notifications
router.patch('/fcm-token', [
  body('fcmToken').notEmpty().withMessage('FCM token is required'),
  validate
], updateFCMToken);

// Mark all notifications as read
router.patch('/mark-all-read', markAllAsRead);

// Delete all notifications
router.delete('/all', deleteAllNotifications);

// Mark specific notification as read
router.patch('/:id/read', markAsRead);

// Delete specific notification
router.delete('/:id', deleteNotification);

// Admin only routes
router.use(authorize('admin'));

// Send bulk notification to users
router.post('/bulk', [
  body('title').notEmpty().withMessage('Notification title is required'),
  body('message').notEmpty().withMessage('Notification message is required'),
  body('type').isIn(['order', 'message', 'promotion', 'system', 'product', 'service'])
    .withMessage('Invalid notification type'),
  body('recipients').optional().isArray().withMessage('Recipients must be an array'),
  body('filters').optional().isObject().withMessage('Filters must be an object'),
  validate
], sendBulkNotification);

// Get notification statistics
router.get('/stats', getNotificationStats);

module.exports = router;