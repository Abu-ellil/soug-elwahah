const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Address Schema
const addressSchema = new mongoose.Schema({
  label: {
    type: String,
    required: [true, 'تسمية العنوان مطلوبة'],
    enum: ['home', 'work', 'other'],
    default: 'home'
  },
  
  customLabel: {
    type: String,
    trim: true,
    maxlength: [30, 'التسمية المخصصة لا يجب أن تتجاوز 30 حرف']
  },
  
  street: {
    type: String,
    required: [true, 'اسم الشارع مطلوب'],
    trim: true,
    maxlength: [100, 'اسم الشارع لا يجب أن يتجاوز 100 حرف']
  },
  
  building: {
    type: String,
    trim: true,
    maxlength: [50, 'رقم المبنى لا يجب أن يتجاوز 50 حرف']
  },
  
  floor: {
    type: String,
    trim: true,
    maxlength: [20, 'رقم الطابق لا يجب أن يتجاوز 20 حرف']
  },
  
  apartment: {
    type: String,
    trim: true,
    maxlength: [20, 'رقم الشقة لا يجب أن يتجاوز 20 حرف']
  },
  
  city: {
    type: String,
    required: [true, 'المدينة مطلوبة'],
    trim: true,
    maxlength: [50, 'اسم المدينة لا يجب أن يتجاوز 50 حرف']
  },
  
  district: {
    type: String,
    trim: true,
    maxlength: [50, 'اسم الحي لا يجب أن يتجاوز 50 حرف']
  },
  
  governorate: {
    type: String,
    required: [true, 'المحافظة مطلوبة'],
    trim: true
  },
  
  postalCode: {
    type: String,
    trim: true,
    match: [/^\d{5}$/, 'الرمز البريدي غير صحيح']
  },
  
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    }
  },
  
  isDefault: {
    type: Boolean,
    default: false
  },
  
  additionalInfo: {
    type: String,
    maxlength: [200, 'المعلومات الإضافية لا يجب أن تتجاوز 200 حرف']
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  _id: true
});

const userSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'الاسم مطلوب'],
    trim: true,
    maxlength: [50, 'الاسم لا يجب أن يتجاوز 50 حرف']
  },
  
  phone: {
    type: String,
    required: [true, 'رقم الهاتف مطلوب'],
    unique: true,
    match: [/^(\+20|0)?1[0-9]{9}$/, 'رقم الهاتف غير صحيح']
  },
  
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'البريد الإلكتروني غير صحيح']
  },
  
  // Profile Information
  avatar: {
    public_id: String,
    url: {
      type: String,
      default: 'https://res.cloudinary.com/elsoug/image/upload/v1/defaults/default-avatar.png'
    }
  },
  
  bio: {
    type: String,
    maxlength: [200, 'الوصف لا يجب أن يتجاوز 200 حرف']
  },
  
  // Multiple Addresses
  addresses: [addressSchema],
  
  // Legacy address field (kept for backward compatibility)
  address: {
    type: String,
    maxlength: [100, 'العنوان لا يجب أن يتجاوز 100 حرف']
  },
  
  // Legacy location field (kept for backward compatibility)
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  
  // Authentication
  password: {
    type: String,
    select: false
  },
  
  passwordChangedAt: Date,
  
  // OTP for phone verification
  phoneOTP: {
    type: String,
    select: false
  },
  
  phoneOTPExpires: {
    type: Date,
    select: false
  },
  
  phoneOTPAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  
  // Refresh token for JWT
  refreshToken: {
    type: String,
    select: false
  },
  
  refreshTokenExpires: {
    type: Date,
    select: false
  },
  
  // Account Status
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
 // Driver approval status
  driverApprovalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
  driverApprovalDate: {
    type: Date
  },
  
 driverApprovalNotes: {
    type: String,
    maxlength: [500, 'ملاحظات الموافقة لا يجب أن تتجاوز 500 حرف']
  },
  
  // Roles and permissions
  roles: [{
    type: String,
    enum: ['customer', 'driver', 'store', 'admin', 'superadmin'],
    required: true
 }],
  
  activeRole: {
    type: String,
    enum: ['customer', 'driver', 'store', 'admin', 'superadmin'],
    default: 'customer'
  },
  
  permissions: [String],
  
  // Multi-app profile information
  profile: {
    customer: {
      orders: [String], // Order IDs for customer
      preferences: Map,
      notifications: [String]
    },
    driver: {
      vehicleInfo: {
        type: String,
        licensePlate: String,
        capacity: Number
      },
      currentLocation: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: [Number] // [longitude, latitude]
      },
      isAvailable: { type: Boolean, default: false },
      orders: [String], // Order IDs for driver
      ratings: [Number],
      totalDeliveries: { type: Number, default: 0 },
      currentDelivery: {
        deliveryId: {
          type: mongoose.Schema.ObjectId,
          ref: 'Delivery'
        },
        orderId: {
          type: mongoose.Schema.ObjectId,
          ref: 'Order'
        },
        startedAt: Date
      },
      deliveryStats: {
        completedDeliveries: { type: Number, default: 0 },
        cancelledDeliveries: { type: Number, default: 0 },
        onTimeRate: { type: Number, default: 0 }, // Percentage
        avgDeliveryTime: { type: Number } // In minutes
      }
    },
    store: {
      businessName: String,
      businessType: String,
      products: [String],
      services: [String],
      workingHours: {
        startTime: String,
        endTime: String
      },
      location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: [Number]
      }
    }
  },
  
  // Application-specific settings
  appSettings: {
    customer: {
      notifications: { push: Boolean, email: Boolean, sms: Boolean },
      privacy: { showLocation: Boolean, showPhone: Boolean }
    },
    driver: {
      notifications: { push: Boolean, email: Boolean, sms: Boolean },
      autoAcceptOrders: Boolean,
      maxOrdersPerDay: Number
    },
    store: {
      notifications: { push: Boolean, email: Boolean, sms: Boolean },
      autoAcceptOrders: Boolean,
      orderProcessingTime: Number
    }
  },
  
  // Session management
  activeSessions: [{
    sessionId: String,
    appId: String,
    deviceInfo: String,
    createdAt: Date,
    expiresAt: Date
  }],
  
  // Security
  lastLoginAt: Date,
  lastLoginFrom: String,
  loginAttempts: { type: Number, default: 0 },
  lockedUntil: Date,
  
  // Track when password or roles were last changed (for token invalidation)
  passwordChangedAt: Date,
  rolesChangedAt: Date,
  
  // Legacy role field for backward compatibility (will be deprecated)
  role: {
    type: String,
    enum: ['user', 'seller', 'admin'],
    default: 'user'
  },
  
  // Business Information (for sellers)
  businessName: {
    type: String,
    trim: true,
    maxlength: [100, 'اسم النشاط التجاري لا يجب أن يتجاوز 100 حرف']
  },
  
  businessType: {
    type: String,
    enum: ['individual', 'shop', 'service_provider', 'farmer'],
    default: 'individual'
  },
  
  // Statistics
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  
  reviewsCount: {
    type: Number,
    default: 0
  },
  
  productsCount: {
    type: Number,
    default: 0
  },
  
  servicesCount: {
    type: Number,
    default: 0
  },
  
  // Settings
  settings: {
    notifications: {
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      email: { type: Boolean, default: false }
    },
    privacy: {
      showPhone: { type: Boolean, default: true },
      showLocation: { type: Boolean, default: true }
    },
    language: {
      type: String,
      enum: ['ar', 'en'],
      default: 'ar'
    }
  },
  
  // FCM Token for push notifications
  fcmToken: String,
  
  // Last activity
  lastActive: {
    type: Date,
    default: Date.now
  },
  
  // Account creation and updates
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ phone: 1 });
userSchema.index({ location: '2dsphere' });
userSchema.index({ 'addresses.location': '2dsphere' });
userSchema.index({ isActive: 1, isVerified: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for user's products
userSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'seller'
});

// Virtual for user's services
userSchema.virtual('services', {
  ref: 'Service',
  localField: '_id',
  foreignField: 'provider'
});

// Virtual for user's reviews
userSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'reviewee'
});

// Pre-save middleware to ensure only one default address
userSchema.pre('save', function(next) {
  if (this.addresses && this.addresses.length > 0) {
    const defaultAddresses = this.addresses.filter(addr => addr.isDefault);
    if (defaultAddresses.length > 1) {
      // Keep only the first default address
      this.addresses.forEach((addr, index) => {
        if (index > 0 && addr.isDefault) {
          addr.isDefault = false;
        }
      });
    } else if (defaultAddresses.length === 0 && this.addresses.length > 0) {
      // Set the first address as default if no default exists
      this.addresses[0].isDefault = true;
    }
  }
  next();
});

// Pre-save middleware to update timestamps
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Pre-save middleware to hash password if it exists
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Pre-save middleware to manage roles and permissions
userSchema.pre('save', function(next) {
 // Ensure user has at least one role
 if (!this.roles || this.roles.length === 0) {
    // For backward compatibility, set role based on existing role field
    if (this.role) {
      if (this.role === 'seller') {
        this.roles = ['store'];
      } else if (this.role === 'admin') {
        this.roles = ['admin'];
      } else {
        this.roles = ['customer'];
      }
    } else {
      this.roles = ['customer'];
    }
 }
  
  // Set active role if not set, prioritizing admin role if available
 if (!this.activeRole) {
    // If user has admin role, set active role to admin
    if (this.roles.includes('admin')) {
      this.activeRole = 'admin';
    } else if (this.roles.includes('superadmin')) {
      this.activeRole = 'superadmin';
    } else {
      this.activeRole = this.roles[0];
    }
  }
  
  // Set permissions based on roles (simplified - in real implementation this would be more complex)
  if (this.roles.includes('admin') || this.roles.includes('superadmin')) {
    this.permissions = ['admin:all'];
  } else {
    this.permissions = [];
    if (this.roles.includes('customer')) {
      this.permissions.push('profile:read', 'profile:update', 'order:create', 'order:read');
    }
    if (this.roles.includes('driver')) {
      this.permissions.push('profile:read', 'profile:update', 'order:read', 'order:accept');
    }
    if (this.roles.includes('store')) {
      this.permissions.push('store:read', 'store:update', 'product:create', 'product:read');
    }
 }
  
  // Update rolesChangedAt if roles have changed
  if (this.isModified('roles')) {
    this.rolesChangedAt = Date.now();
  }
  
  next();
});

// Instance method to add address
userSchema.methods.addAddress = function(addressData) {
  if (addressData.isDefault) {
    this.addresses.forEach(addr => addr.isDefault = false);
  }
  this.addresses.push(addressData);
  return this.save();
};

// Instance method to update address
userSchema.methods.updateAddress = function(addressId, addressData) {
  const address = this.addresses.id(addressId);
  if (!address) throw new Error('العنوان غير موجود');
  
  if (addressData.isDefault) {
    this.addresses.forEach(addr => {
      if (addr._id.toString() !== addressId) {
        addr.isDefault = false;
      }
    });
  }
  
  Object.assign(address, addressData);
  return this.save();
};

// Instance method to delete address
userSchema.methods.deleteAddress = function(addressId) {
  const address = this.addresses.id(addressId);
  if (!address) throw new Error('العنوان غير موجود');
  
  const wasDefault = address.isDefault;
  address.remove();
  
  // If deleted address was default, set first address as default
  if (wasDefault && this.addresses.length > 0) {
    this.addresses[0].isDefault = true;
  }
  
  return this.save();
};

// Instance method to get default address
userSchema.methods.getDefaultAddress = function() {
  return this.addresses.find(addr => addr.isDefault);
};

// Instance method to check password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to check if password changed after JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Instance method to check if roles changed after JWT was issued
userSchema.methods.changedRolesAfter = function(JWTTimestamp) {
  if (this.rolesChangedAt) {
    const changedTimestamp = parseInt(
      this.rolesChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Instance method to create password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Instance method to update last active
userSchema.methods.updateLastActive = function() {
  this.lastActive = Date.now();
  return this.save({ validateBeforeSave: false });
};

// Static method to find users near a location
userSchema.statics.findNearby = function(coordinates, maxDistance = 10000) {
  return this.find({
    $or: [
      {
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: coordinates
            },
            $maxDistance: maxDistance
          }
        }
      },
      {
        'addresses.location': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: coordinates
            },
            $maxDistance: maxDistance
          }
        }
      }
    ],
    isActive: true,
    isVerified: true
  });
};

// Static method to get user statistics
userSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: {
            $cond: [{ $eq: ['$isActive', true] }, 1, 0]
          }
        },
        verifiedUsers: {
          $sum: {
            $cond: [{ $eq: ['$isVerified', true] }, 1, 0]
          }
        },
        sellers: {
          $sum: {
            $cond: [{ $eq: ['$role', 'seller'] }, 1, 0]
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalUsers: 0,
    activeUsers: 0,
    verifiedUsers: 0,
    sellers: 0
  };
};

// Remove sensitive data from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.fcmToken;
  delete userObject.__v;
  return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;