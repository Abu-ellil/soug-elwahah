const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Order Identification
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  
  // Customer Information
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'العميل مطلوب']
  },
  
  // Seller/Store Information
  seller: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'البائع مطلوب']
  },
  
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store'
  },
  
  // Order Items
  items: [{
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'الكمية يجب أن تكون 1 على الأقل']
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'السعر لا يمكن أن يكون سالب']
    },
    totalPrice: {
      type: Number,
      default: 0,
      min: [0, 'إجمالي السعر لا يمكن أن يكون سالب']
    },
    // Product details at time of order (for historical reference)
    productSnapshot: {
      title: String,
      description: String,
      image: String,
      unit: String
    }
  }],
  
  // Order Amounts
  subtotal: {
    type: Number,
    default: 0,
    min: [0, 'المجموع الفرعي لا يمكن أن يكون سالب']
  },
  
  deliveryFee: {
    type: Number,
    default: 0,
    min: [0, 'رسوم التوصيل لا يمكن أن تكون سالبة']
  },
  
  serviceFee: {
    type: Number,
    default: 0,
    min: [0, 'رسوم الخدمة لا يمكن أن تكون سالبة']
  },
  
  discount: {
    amount: {
      type: Number,
      default: 0,
      min: [0, 'مبلغ الخصم لا يمكن أن يكون سالب']
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'fixed'
    },
    code: String, // Coupon code if applicable
    reason: String // Reason for discount
  },
  
  totalAmount: {
    type: Number,
    default: 0,
    min: [0, 'إجمالي المبلغ لا يمكن أن يكون سالب']
  },
  
  currency: {
    type: String,
    enum: ['EGP', 'USD'],
    default: 'EGP'
  },
  
  // Delivery Information
  deliveryInfo: {
    type: {
      type: String,
      enum: ['pickup', 'delivery', 'shipping'],
      required: true,
      default: 'pickup'
    },
    address: {
      street: String,
      landmark: String,
      buildingNumber: String,
      floor: String,
      apartment: String,
      notes: String
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    },
    recipientName: String,
    recipientPhone: String,
    preferredTime: {
      date: Date,
      timeSlot: String // e.g., "morning", "afternoon", "evening"
    },
    estimatedDeliveryTime: Date,
    actualDeliveryTime: Date,
    deliveryInstructions: String
  },
  
  // Payment Information
  payment: {
    method: {
      type: String,
      enum: ['cash', 'card', 'mobile_wallet', 'bank_transfer', 'barter'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'partial_refund'],
      default: 'pending'
    },
    transactionId: String,
    paidAmount: {
      type: Number,
      default: 0,
      min: [0, 'المبلغ المدفوع لا يمكن أن يكون سالب']
    },
    paidAt: Date,
    paymentDetails: {
      // For barter
      barterItems: [String],
      // For installments
      installments: [{
        amount: Number,
        dueDate: Date,
        paidDate: Date,
        status: {
          type: String,
          enum: ['pending', 'paid', 'overdue'],
          default: 'pending'
        }
      }]
    }
  },
  
  // Order Status
  status: {
    type: String,
    enum: [
      'pending',      // Order placed, waiting for seller confirmation
      'confirmed',    // Seller confirmed the order
      'preparing',    // Order is being prepared
      'ready',        // Order is ready for pickup/delivery
      'out_for_delivery', // Order is out for delivery
      'delivered',    // Order has been delivered
      'completed',    // Order completed successfully
      'cancelled',    // Order cancelled
      'refunded',     // Order refunded
      'disputed'      // Order is in dispute
    ],
    default: 'pending'
  },
  
  // Status History
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  }],
  
  // Communication
  notes: {
    customer: String, // Customer notes
    seller: String,   // Seller notes
    admin: String     // Admin notes
  },
  
  // Special Flags
  isUrgent: {
    type: Boolean,
    default: false
  },
  
  isGift: {
    type: Boolean,
    default: false
  },
  
  giftMessage: String,
  
  // Ratings and Reviews
  customerRating: {
    rating: {
      type: Number,
      min: [1, 'التقييم يجب أن يكون بين 1 و 5'],
      max: [5, 'التقييم يجب أن يكون بين 1 و 5']
    },
    review: String,
    ratedAt: Date
  },
  
  sellerRating: {
    rating: {
      type: Number,
      min: [1, 'التقييم يجب أن يكون بين 1 و 5'],
      max: [5, 'التقييم يجب أن يكون بين 1 و 5']
    },
    review: String,
    ratedAt: Date
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
  
  confirmedAt: Date,
  deliveredAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  
  // Cancellation/Refund Information
  cancellation: {
    reason: String,
    cancelledBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    refundAmount: {
      type: Number,
      min: [0, 'مبلغ الاسترداد لا يمكن أن يكون سالب']
    },
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: 'pending'
    }
  },
  
  // Delivery Assignment
  deliveryAssignment: {
    deliveryId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Delivery'
    },
    assignedDriver: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    assignedAt: Date,
    assignedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ customer: 1 });
orderSchema.index({ seller: 1 });
orderSchema.index({ store: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'deliveryInfo.coordinates': '2dsphere' });

// Virtual for total items count
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for is completed
orderSchema.virtual('isCompleted').get(function() {
  return ['completed', 'delivered'].includes(this.status);
});

// Virtual for is active
orderSchema.virtual('isActive').get(function() {
  return !['completed', 'cancelled', 'refunded'].includes(this.status);
});

// Virtual for can be cancelled
orderSchema.virtual('canBeCancelled').get(function() {
  return ['pending', 'confirmed'].includes(this.status);
});

// Virtual for can be rated
orderSchema.virtual('canBeRated').get(function() {
  return this.status === 'completed' && !this.customerRating.rating;
});

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
 if (this.isNew && (!this.orderNumber || this.orderNumber.startsWith('ORD-') || this.orderNumber === 'ORD-')) {
    try {
      const count = await this.constructor.countDocuments();
      this.orderNumber = `ORD-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;
    } catch (error) {
      // If there's an error generating the order number, use a fallback
      this.orderNumber = `ORD-${Date.now()}-0001`;
    }
  }
 this.updatedAt = Date.now();
  next();
});

// Pre-save middleware to calculate totals
orderSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isModified('deliveryFee') || this.isModified('serviceFee') || this.isModified('discount')) {
    // Calculate subtotal
    if (this.items && Array.isArray(this.items)) {
      this.subtotal = this.items.reduce((total, item) => {
        if (item.price && item.quantity) {
          item.totalPrice = item.price * item.quantity;
        } else {
          item.totalPrice = 0;
        }
        return total + item.totalPrice;
      }, 0);
    } else {
      this.subtotal = 0;
    }
    
    // Calculate total amount
    let total = this.subtotal;
    if (this.deliveryFee) {
      total += this.deliveryFee;
    } else {
      this.deliveryFee = 0;
    }
    
    if (this.serviceFee) {
      total += this.serviceFee;
    } else {
      this.serviceFee = 0;
    }
    
    // Apply discount
    if (this.discount && this.discount.amount > 0) {
      if (this.discount.type === 'percentage') {
        total -= (total * this.discount.amount / 100);
      } else {
        total -= this.discount.amount;
      }
    }
    
    this.totalAmount = Math.max(0, total);
  }
  next();
});

// Pre-save middleware to update status history
orderSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date()
    });
    
    // Set specific timestamps
    switch (this.status) {
      case 'confirmed':
        this.confirmedAt = new Date();
        break;
      case 'delivered':
        this.deliveredAt = new Date();
        break;
      case 'completed':
        this.completedAt = new Date();
        break;
      case 'cancelled':
        this.cancelledAt = new Date();
        break;
    }
  }
  next();
});

// Static method to get orders by customer
orderSchema.statics.getByCustomer = function(customerId, status = null, limit = 20, page = 1) {
  const skip = (page - 1) * limit;
  const query = { customer: customerId };
  
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('seller', 'name avatar')
    .populate('store', 'name images.logo')
    .populate('items.product', 'title images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get orders by seller
orderSchema.statics.getBySeller = function(sellerId, status = null, limit = 20, page = 1) {
  const skip = (page - 1) * limit;
  const query = { seller: sellerId };
  
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('customer', 'name avatar phone')
    .populate('items.product', 'title images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get orders by store
orderSchema.statics.getByStore = function(storeId, status = null, limit = 20, page = 1) {
  const skip = (page - 1) * limit;
  const query = { store: storeId };
  
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('customer', 'name avatar phone')
    .populate('items.product', 'title images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Instance method to update status
orderSchema.methods.updateStatus = function(newStatus, note = '', updatedBy = null) {
  this.status = newStatus;
  
  if (note || updatedBy) {
    this.statusHistory.push({
      status: newStatus,
      timestamp: new Date(),
      note,
      updatedBy
    });
  }
  
  return this.save();
};

// Instance method to add customer rating
orderSchema.methods.addCustomerRating = function(rating, review = '') {
  if (this.status !== 'completed') {
    throw new Error('لا يمكن تقييم الطلب إلا بعد اكتماله');
  }
  
  this.customerRating = {
    rating,
    review,
    ratedAt: new Date()
  };
  
  return this.save();
};

// Instance method to add seller rating
orderSchema.methods.addSellerRating = function(rating, review = '') {
  if (this.status !== 'completed') {
    throw new Error('لا يمكن تقييم العميل إلا بعد اكتمال الطلب');
  }
  
  this.sellerRating = {
    rating,
    review,
    ratedAt: new Date()
  };
  
  return this.save();
};

// Instance method to cancel order
orderSchema.methods.cancelOrder = function(reason, cancelledBy, refundAmount = 0) {
  if (!this.canBeCancelled) {
    throw new Error('لا يمكن إلغاء هذا الطلب في الحالة الحالية');
  }
  
  this.status = 'cancelled';
  this.cancellation = {
    reason,
    cancelledBy,
    refundAmount,
    refundStatus: refundAmount > 0 ? 'pending' : 'processed'
  };
  
  return this.save();
};

// Instance method to calculate delivery time
orderSchema.methods.calculateEstimatedDeliveryTime = function() {
  const now = new Date();
  const estimatedTime = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // 2 hours default
  
  this.deliveryInfo.estimatedDeliveryTime = estimatedTime;
  return this.save({ validateBeforeSave: false });
};

// Static method to get order statistics
orderSchema.statics.getStatistics = async function(filters = {}) {
  const matchStage = { ...filters };
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        averageOrderValue: { $avg: '$totalAmount' },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        confirmedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
        },
        completedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0
  };
};

// Static method to get daily sales
orderSchema.statics.getDailySales = async function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: { $in: ['completed', 'delivered'] }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        totalSales: { $sum: '$totalAmount' },
        ordersCount: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;