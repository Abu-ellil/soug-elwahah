/**
 * @file models/Notification.js - Notification model
 * @description نموذج الإشعار يتضمن الحقول المطلوبة وفقًا لمتطلبات النظام
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['order_status', 'payment', 'delivery', 'system', 'promotional'],
    required: true
  },
  title: {
    type: String,
    required: [true, 'عنوان الإشعار مطلوب'],
    trim: true
 },
  message: {
    type: String,
    required: [true, 'محتوى الإشعار مطلوب'],
    trim: true
 },
  read: {
    type: Boolean,
    default: false
  },
  data: {
    type: mongoose.Schema.Types.Mixed // لتخزين بيانات إضافية متعلقة بالإشعار
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);