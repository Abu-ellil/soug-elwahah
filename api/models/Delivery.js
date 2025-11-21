const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  // Reference to the order being delivered
  order: {
    type: mongoose.Schema.ObjectId,
    ref: 'Order',
    required: [true, 'Delivery must be associated with an order']
  },
  
  // Driver assigned to this delivery
  driver: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Delivery must be assigned to a driver']
  },
  
  // Store/seller that initiated the delivery
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Delivery must be associated with a store']
  },
  
  // Customer receiving the delivery
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Delivery must be associated with a customer']
  },
  
  // Delivery status
  status: {
    type: String,
    enum: [
      'pending_assignment',  // Waiting for driver assignment
      'driver_assigned',     // Driver assigned but not yet picked up
      'picked_up',          // Driver has picked up the order
      'in_transit',         // Driver is on the way to customer
      'arrived_at_destination', // Driver arrived at customer location
      'delivered',          // Order successfully delivered
      'failed_delivery',    // Delivery failed (returned, refused, etc.)
      'cancelled'           // Delivery cancelled
    ],
    default: 'pending_assignment',
    required: true
  },
  
 // Pickup location (store location)
  pickupLocation: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere',
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  
  // Delivery destination (customer location)
  destinationLocation: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere',
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  
  // Current location of the driver during delivery
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: [Number], // [longitude, latitude]
    lastUpdated: Date
  },
  
 // Estimated time of arrival
  estimatedDeliveryTime: Date,
  
  // Actual delivery times
  pickupTime: Date,
 deliveryTime: Date,
  cancellationTime: Date,
  
  // Delivery tracking information
  trackingHistory: [{
    status: {
      type: String,
      required: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: [Number] // [longitude, latitude]
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
  
  // Delivery vehicle information
 vehicle: {
    type: String,
    required: function() {
      return this.status !== 'pending_assignment';
    }
  },
  
  // Delivery cost
  deliveryCost: {
    amount: {
      type: Number,
      default: 0,
      min: 0
    },
    currency: {
      type: String,
      enum: ['EGP', 'USD'],
      default: 'EGP'
    }
  },
  
  // Special delivery instructions
 deliveryInstructions: String,
  
  // Delivery proof (photos, signatures, etc.)
  deliveryProof: {
    photos: [String],
    signature: String,
    recipientName: String,
    receivedAt: Date
  },
  
  // Delivery ratings
  customerRating: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    ratedAt: Date
  },
  
 driverRating: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    ratedAt: Date
  },
  
 // Cancellation information
  cancellation: {
    reason: String,
    cancelledBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    cancelledAt: Date
  },
  
  // Delivery metadata
  priority: {
    type: String,
    enum: ['normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  isUrgent: {
    type: Boolean,
    default: false
  },
  
  deliveryDistance: {
    // Distance in meters
    value: Number,
    unit: {
      type: String,
      default: 'meters'
    }
  },
  
  deliveryDuration: {
    // Estimated duration in minutes
    value: Number,
    unit: {
      type: String,
      default: 'minutes'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
deliverySchema.index({ order: 1 });
deliverySchema.index({ driver: 1 });
deliverySchema.index({ status: 1 });
deliverySchema.index({ createdAt: -1 });
deliverySchema.index({ 'currentLocation.coordinates': '2dsphere' });
deliverySchema.index({ 'pickupLocation.coordinates': '2dsphere' });
deliverySchema.index({ 'destinationLocation.coordinates': '2dsphere' });

// Virtual for delivery duration in human-readable format
deliverySchema.virtual('deliveryDurationFormatted').get(function() {
  if (this.deliveryDuration && this.deliveryDuration.value) {
    if (this.deliveryDuration.value < 60) {
      return `${this.deliveryDuration.value} min`;
    } else {
      const hours = Math.floor(this.deliveryDuration.value / 60);
      const minutes = this.deliveryDuration.value % 60;
      return `${hours}h ${minutes}m`;
    }
  }
 return 'N/A';
});

// Virtual for delivery distance in human-readable format
deliverySchema.virtual('deliveryDistanceFormatted').get(function() {
  if (this.deliveryDistance && this.deliveryDistance.value) {
    if (this.deliveryDistance.value >= 1000) {
      return `${(this.deliveryDistance.value / 1000).toFixed(1)} km`;
    } else {
      return `${this.deliveryDistance.value} m`;
    }
  }
 return 'N/A';
});

// Virtual for total delivery time
deliverySchema.virtual('totalDeliveryTime').get(function() {
  if (this.pickupTime && this.deliveryTime) {
    return Math.round((this.deliveryTime - this.pickupTime) / (1000 * 60)); // in minutes
 }
  return null;
});

// Instance method to update delivery status
deliverySchema.methods.updateStatus = async function(newStatus, location = null, note = '', updatedBy = null) {
  // Add to tracking history
  this.trackingHistory.push({
    status: newStatus,
    location: location,
    note: note,
    updatedBy: updatedBy,
    timestamp: new Date()
  });
  
  // Update current status
  this.status = newStatus;
  
  // Update timestamps based on status
  switch(newStatus) {
    case 'picked_up':
      this.pickupTime = new Date();
      break;
    case 'delivered':
      this.deliveryTime = new Date();
      break;
    case 'cancelled':
      this.cancellationTime = new Date();
      break;
  }
  
  // Update current location if provided
  if (location) {
    this.currentLocation = {
      type: 'Point',
      coordinates: [location.longitude, location.latitude],
      lastUpdated: new Date()
    };
  }
  
  return await this.save();
};

// Instance method to update current location
deliverySchema.methods.updateCurrentLocation = function(location) {
  if (location && location.latitude && location.longitude) {
    this.currentLocation = {
      type: 'Point',
      coordinates: [location.longitude, location.latitude],
      lastUpdated: new Date()
    };
    return this.save();
  }
 throw new Error('Valid location with latitude and longitude is required');
};

// Static method to get deliveries by driver
deliverySchema.statics.getByDriver = function(driverId, status = null, limit = 20, page = 1) {
  const skip = (page - 1) * limit;
 const query = { driver: driverId };
  
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('order', 'orderNumber status totalAmount')
    .populate('customer', 'name phone')
    .populate('store', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get deliveries by store
deliverySchema.statics.getByStore = function(storeId, status = null, limit = 20, page = 1) {
  const skip = (page - 1) * limit;
  const query = { store: storeId };
  
  if (status) {
    query.status = status;
 }
  
  return this.find(query)
    .populate('order', 'orderNumber status totalAmount')
    .populate('driver', 'name phone')
    .populate('customer', 'name phone')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get deliveries by customer
deliverySchema.statics.getByCustomer = function(customerId, status = null, limit = 20, page = 1) {
  const skip = (page - 1) * limit;
 const query = { customer: customerId };
  
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('order', 'orderNumber status totalAmount')
    .populate('driver', 'name phone')
    .populate('store', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

const Delivery = mongoose.model('Delivery', deliverySchema);

module.exports = Delivery;