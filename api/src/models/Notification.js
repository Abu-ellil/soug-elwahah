const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'StoreOwner', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'info', enum: ['info', 'success', 'warning', 'error'] },
  read: { type: Boolean, default: false },
  data: { type: mongoose.Schema.Types.Mixed }, // Additional data related to the notification
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', notificationSchema);
