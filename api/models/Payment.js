const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Payment Identification
  paymentId: {
    type: String,
    unique: true,
    required: true
  },
  
  // Order reference
  order: {
    type: mongoose.Schema.ObjectId,
    ref: 'Order',
    required: true
  },
  
  // Customer reference
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Store reference
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store'
  },
  
 // Payment amount and currency
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  
  currency: {
    type: String,
    enum: ['EGP', 'USD'],
    default: 'EGP'
  },
  
  // Payment method
  method: {
    type: String,
    enum: ['cash', 'card', 'mobile_wallet', 'bank_transfer', 'wallet', 'stripe', 'paypal'],
    required: true
  },
  
  // Payment status
  status: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  
  // Transaction details
  transactionId: {
    type: String,
    unique: true
  },
  
  referenceNumber: {
    type: String
  },
  
 // Payment gateway response
  gatewayResponse: {
    status: String,
    message: String,
    transactionId: String,
    receiptUrl: String
 },
  
  // Refund information
  refund: {
    isRefunded: {
      type: Boolean,
      default: false
    },
    refundAmount: {
      type: Number,
      min: [0, 'Refund amount cannot be negative']
    },
    refundReason: String,
    refundDate: Date,
    refundTransactionId: String
 },
  
  // Payment metadata
  metadata: {
    orderId: String,
    customerName: String,
    customerPhone: String,
    items: [{
      productId: mongoose.Schema.ObjectId,
      productName: String,
      quantity: Number,
      price: Number
    }]
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
  
  paidAt: Date,
 refundedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ order: 1 });
paymentSchema.index({ customer: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ createdAt: -1 });

// Pre-save middleware to generate payment ID
paymentSchema.pre('save', async function(next) {
 if (this.isNew && (!this.paymentId || this.paymentId.startsWith('PAY-'))) {
    try {
      const count = await this.constructor.countDocuments();
      this.paymentId = `PAY-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;
    } catch (error) {
      this.paymentId = `PAY-${Date.now()}-0001`;
    }
  }
  
  if (this.isModified('status') && this.status === 'paid') {
    this.paidAt = new Date();
  }
  
  if (this.isModified('refund.isRefunded') && this.refund.isRefunded) {
    this.refundedAt = new Date();
  }
  
  this.updatedAt = Date.now();
  next();
});

// Static method to get payments by customer
paymentSchema.statics.getByCustomer = function(customerId, status = null, limit = 20, page = 1) {
 const skip = (page - 1) * limit;
 const query = { customer: customerId };
  
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('order', 'orderNumber totalAmount status')
    .populate('store', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get payments by order
paymentSchema.statics.getByOrder = function(orderId) {
  return this.find({ order: orderId })
    .populate('customer', 'name phone')
    .sort({ createdAt: -1 });
};

// Instance method to process payment
paymentSchema.methods.processPayment = async function(paymentData) {
  this.status = 'processing';
  this.transactionId = paymentData.transactionId;
  this.gatewayResponse = paymentData.gatewayResponse;
  
  return this.save();
};

// Instance method to mark as paid
paymentSchema.methods.markAsPaid = function() {
  this.status = 'paid';
  this.paidAt = new Date();
  return this.save();
};

// Instance method to mark as failed
paymentSchema.methods.markAsFailed = function(errorMessage) {
  this.status = 'failed';
  this.gatewayResponse = {
    status: 'failed',
    message: errorMessage
  };
  return this.save();
};

// Instance method to process refund
paymentSchema.methods.processRefund = function(refundAmount, reason) {
  this.refund = {
    isRefunded: true,
    refundAmount: refundAmount,
    refundReason: reason,
    refundDate: new Date(),
    refundTransactionId: `REF-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  };
  this.status = 'refunded';
  this.refundedAt = new Date();
  
  return this.save();
};

// Static method to get payment statistics
paymentSchema.statics.getStatistics = async function(filters = {}) {
  const matchStage = { ...filters };
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        successfulPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] }
        },
        failedPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        refundedPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, 1, 0] }
        },
        averagePaymentAmount: { $avg: '$amount' }
      }
    }
  ]);
  
  return stats[0] || {
    totalPayments: 0,
    totalAmount: 0,
    successfulPayments: 0,
    failedPayments: 0,
    refundedPayments: 0,
    averagePaymentAmount: 0
  };
};

// Static method to get daily revenue
paymentSchema.statics.getDailyRevenue = async function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: 'paid'
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        totalRevenue: { $sum: '$amount' },
        paymentCount: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
};

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
