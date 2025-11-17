const mongoose = require('mongoose');

const loginLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Will work for all user types (User, StoreOwner, Driver, SuperAdmin)
    required: false
  },
  identifier: {
    type: String, // email or phone
    required: true,
    index: true
  },
  role: {
    type: String,
    required: true,
    enum: ['customer', 'store', 'driver', 'admin', 'super_admin']
  },
  success: {
    type: Boolean,
    required: true
  },
  ipAddress: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  errorMessage: {
    type: String,
    required: false
  }
});

module.exports = mongoose.model('LoginLog', loginLogSchema);