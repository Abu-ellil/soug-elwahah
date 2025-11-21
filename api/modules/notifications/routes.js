/**
 * @file modules/notifications/routes.js - Notification routes
 * @description.routes لإدارة الإشعارات
 */

const express = require('express');
const { auth } = require('../../middleware/auth');
const { 
  getAllNotifications, 
  getNotificationById, 
  createNotification, 
  updateNotification,
  deleteNotification,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead
} = require('./controller');

const router = express.Router();

// @route   GET api/notifications
// @desc    Get all notifications for user
// @access  Private
router.get('/', auth, getAllNotifications);

// @route   GET api/notifications/:id
// @desc    Get single notification
// @access  Private
router.get('/:id', auth, getNotificationById);

// @route   POST api/notifications
// @desc    Create notification
// @access  Private/Admin
router.post('/', auth, createNotification);

// @route   PUT api/notifications/:id
// @desc    Update notification
// @access  Private
router.put('/:id', auth, updateNotification);

// @route   DELETE api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', auth, deleteNotification);

// @route   GET api/notifications/unread
// @desc    Get unread notifications for user
// @access  Private
router.get('/unread', auth, getUnreadNotifications);

// @route   PUT api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', auth, markAsRead);

// @route   PUT api/notifications/read/all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read/all', auth, markAllAsRead);

module.exports = router;