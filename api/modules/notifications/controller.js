/**
 * @file modules/notifications/controller.js - Notification controller
 * @description وحدة التحكم لإدارة الإشعارات
 */

const Notification = require('../../models/Notification');
const User = require('../../models/User');
const asyncHandler = require('../../middleware/async');
const ErrorResponse = require('../../utils/errorResponse');

// @desc    Get all notifications for user
// @route   GET /api/notifications
// @access  Private
exports.getAllNotifications = asyncHandler(async (req, res, next) => {
  const notifications = await Notification.find({ user: req.user.id })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: notifications.length,
    data: notifications
  });
});

// @desc    Get single notification
// @route   GET /api/notifications/:id
// @access  Private
exports.getNotificationById = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404));
  }

  // التحقق من أن المستخدم مخول برؤية هذا الإشعار
  if (notification.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to view this notification', 403));
  }

  res.status(200).json({
    success: true,
    data: notification
  });
});

// @desc    Create notification
// @route   POST /api/notifications
// @access  Private/Admin
exports.createNotification = asyncHandler(async (req, res, next) => {
  const { user, type, message } = req.body;

  // التحقق من أن المستخدم هو مسؤول
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Only admins can create notifications', 403));
  }

 const notification = await Notification.create({
    user,
    type,
    message
  });

  // إرسال الإشعار عبر Socket.io (سيتم تنفيذه في ملف socket)
  // io.to(user).emit('newNotification', notification);

  res.status(201).json({
    success: true,
    data: notification
  });
});

// @desc    Update notification
// @route   PUT /api/notifications/:id
// @access  Private
exports.updateNotification = asyncHandler(async (req, res, next) => {
 const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404));
  }

  // التحقق من أن المستخدم مخول بتحديث هذا الإشعار
  if (notification.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this notification', 403));
  }

  const updatedNotification = await Notification.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: updatedNotification
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404));
  }

  // التحقق من أن المستخدم مخول بحذف هذا الإشعار
  if (notification.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this notification', 403));
  }

  await notification.remove();

  res.status(20).json({
    success: true,
    data: {}
  });
});

// @desc    Get unread notifications for user
// @route   GET /api/notifications/unread
// @access  Private
exports.getUnreadNotifications = asyncHandler(async (req, res, next) => {
  const notifications = await Notification.find({ 
    user: req.user.id, 
    read: false 
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: notifications.length,
    data: notifications
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404));
  }

  // التحقق من أن المستخدم مخول بوضع علامة على هذا الإشعار
  if (notification.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this notification', 403));
  }

  notification.read = true;
  await notification.save();

  res.status(200).json({
    success: true,
    data: notification
 });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read/all
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
  await Notification.updateMany(
    { user: req.user.id, read: false },
    { read: true }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
});