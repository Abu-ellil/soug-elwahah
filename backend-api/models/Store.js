const mongoose = require('mongoose');
const slugify = require('slugify');

const storeSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'اسم المتجر مطلوب'],
    trim: true,
    maxlength: [100, 'اسم المتجر لا يجب أن يتجاوز 100 حرف']
  },
  
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  
  description: {
    type: String,
    required: [true, 'وصف المتجر مطلوب'],
    maxlength: [1000, 'وصف المتجر لا يجب أن يتجاوز 1000 حرف']
  },
  
  shortDescription: {
    type: String,
    maxlength: [200, 'الوصف المختصر لا يجب أن يتجاوز 200 حرف']
  },
  
  // Store Owner
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'مالك المتجر مطلوب']
  },
  
  // Store Category
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: [true, 'فئة المتجر مطلوبة']
  },
  
  subcategories: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Category'
  }],
  
  // Location
  
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
  
  address: {
    street: {
      type: String,
      required: [true, 'عنوان الشارع مطلوب'],
      maxlength: [200, 'عنوان الشارع لا يجب أن يتجاوز 200 حرف']
    },
    landmark: {
      type: String,
      maxlength: [100, 'العلامة المميزة لا يجب أن تتجاوز 100 حرف']
    },
    buildingNumber: String,
    floor: String,
    apartment: String
  },
  
  // Contact Information
  contact: {
    phone: {
      type: String,
      required: [true, 'رقم الهاتف مطلوب'],
      match: [/^(\+20|0)?1[0-9]{9}$/, 'رقم الهاتف غير صحيح']
    },
    whatsapp: {
      type: String,
      match: [/^(\+20|0)?1[0-9]{9}$/, 'رقم الواتساب غير صحيح']
    },
    email: {
      type: String,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'البريد الإلكتروني غير صحيح']
    },
    website: {
      type: String,
      match: [/^https?:\/\/.+/, 'رابط الموقع غير صحيح']
    },
    facebook: String,
    instagram: String
  },
  
  // Store Images
  images: {
    logo: {
      public_id: String,
      url: {
        type: String,
        default: 'https://res.cloudinary.com/elsoug/image/upload/v1/defaults/default-store-logo.png'
      }
    },
    cover: {
      public_id: String,
      url: {
        type: String,
        default: 'https://res.cloudinary.com/elsoug/image/upload/v1/defaults/default-store-cover.jpg'
      }
    },
    gallery: [{
      public_id: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      },
      alt: String,
      caption: String
    }]
  },
  
  // Business Hours
  businessHours: {
    monday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '09:00' },
      closeTime: { type: String, default: '22:00' }
    },
    tuesday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '09:00' },
      closeTime: { type: String, default: '22:00' }
    },
    wednesday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '09:00' },
      closeTime: { type: String, default: '22:00' }
    },
    thursday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '09:00' },
      closeTime: { type: String, default: '22:00' }
    },
    friday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '09:00' },
      closeTime: { type: String, default: '22:00' }
    },
    saturday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '09:00' },
      closeTime: { type: String, default: '22:00' }
    },
    sunday: {
      isOpen: { type: Boolean, default: false },
      openTime: { type: String, default: '09:00' },
      closeTime: { type: String, default: '22:00' }
    }
  },
  
  // Store Type
  storeType: {
    type: String,
    enum: ['physical', 'online', 'both'],
    default: 'physical'
  },
  
  // Business Information
  businessInfo: {
    establishedYear: {
      type: Number,
      min: [1900, 'سنة التأسيس يجب أن تكون بعد 1900'],
      max: [new Date().getFullYear(), 'سنة التأسيس لا يمكن أن تكون في المستقبل']
    },
    employeesCount: {
      type: Number,
      min: [1, 'عدد الموظفين يجب أن يكون 1 على الأقل'],
      default: 1
    },
    businessLicense: {
      number: String,
      issueDate: Date,
      expiryDate: Date,
      verified: {
        type: Boolean,
        default: false
      }
    },
    taxNumber: String
  },
  
  // Services Offered
  services: [{
    name: {
      type: String,
      required: true,
      maxlength: [100, 'اسم الخدمة لا يجب أن يتجاوز 100 حرف']
    },
    description: {
      type: String,
      maxlength: [300, 'وصف الخدمة لا يجب أن يتجاوز 300 حرف']
    },
    price: {
      type: Number,
      min: [0, 'سعر الخدمة لا يمكن أن يكون سالب']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Delivery Options
  deliveryOptions: {
    hasDelivery: {
      type: Boolean,
      default: false
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: [0, 'رسوم التوصيل لا يمكن أن تكون سالبة']
    },
    freeDeliveryMinimum: {
      type: Number,
      min: [0, 'الحد الأدنى للتوصيل المجاني لا يمكن أن يكون سالب']
    },
    deliveryRadius: {
      type: Number,
      default: 5, // km
      min: [0, 'نطاق التوصيل لا يمكن أن يكون سالب']
    },
    estimatedDeliveryTime: {
      type: String,
      maxlength: [50, 'وقت التوصيل المقدر لا يجب أن يتجاوز 50 حرف']
    }
  },
  
  // Payment Methods
  paymentMethods: [{
    type: String,
    enum: ['cash', 'card', 'mobile_wallet', 'bank_transfer', 'installments']
  }],
  
  // Store Status
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive', 'suspended', 'closed'],
    default: 'pending'
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Store Features
  features: [{
    type: String,
    enum: [
      'parking_available',
      'wheelchair_accessible',
      'air_conditioned',
      'wifi_available',
      'credit_cards_accepted',
      'home_delivery',
      'online_ordering',
      'loyalty_program',
      'gift_cards',
      'returns_accepted'
    ]
  }],
  
  // Statistics
  stats: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    follows: {
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
    ordersCount: {
      type: Number,
      default: 0
    },
    totalSales: {
      type: Number,
      default: 0
    }
  },
  
  // Ratings and Reviews
  ratingsAverage: {
    type: Number,
    default: 0,
    min: [0, 'التقييم لا يمكن أن يكون أقل من 0'],
    max: [5, 'التقييم لا يمكن أن يكون أكثر من 5'],
    set: val => Math.round(val * 10) / 10
  },
  
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  
  // SEO
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  
  // Special Offers
  currentOffers: [{
    title: {
      type: String,
      required: true,
      maxlength: [100, 'عنوان العرض لا يجب أن يتجاوز 100 حرف']
    },
    description: {
      type: String,
      maxlength: [300, 'وصف العرض لا يجب أن يتجاوز 300 حرف']
    },
    discountPercentage: {
      type: Number,
      min: [0, 'نسبة الخصم لا يمكن أن تكون سالبة'],
      max: [100, 'نسبة الخصم لا يمكن أن تتجاوز 100%']
    },
    validFrom: {
      type: Date,
      default: Date.now
    },
    validUntil: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  lastActiveAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
storeSchema.index({ slug: 1 });
storeSchema.index({ owner: 1 });
storeSchema.index({ category: 1 });
storeSchema.index({ location: '2dsphere' });
storeSchema.index({ status: 1, isActive: 1 });
storeSchema.index({ isFeatured: 1, isVerified: 1 });
storeSchema.index({ ratingsAverage: -1 });
storeSchema.index({ createdAt: -1 });
storeSchema.index({ name: 'text', description: 'text' });

// Virtual for products
storeSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'store'
});

// Virtual for reviews
storeSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'store'
});

// Virtual for orders
storeSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'store'
});

// Virtual for followers
storeSchema.virtual('followers', {
  ref: 'User',
  localField: '_id',
  foreignField: 'followedStores'
});

// Virtual for is open now
storeSchema.virtual('isOpenNow').get(function() {
  const now = new Date();
  const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
  const currentTime = now.toTimeString().slice(0, 5);
  
  const daySchedule = this.businessHours[dayName];
  if (!daySchedule.isOpen) return false;
  
  return currentTime >= daySchedule.openTime && currentTime <= daySchedule.closeTime;
});

// Virtual for active offers
storeSchema.virtual('activeOffers').get(function() {
  const now = new Date();
  return this.currentOffers.filter(offer => 
    offer.isActive && 
    offer.validFrom <= now && 
    offer.validUntil >= now
  );
});

// Pre-save middleware to generate slug
storeSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { 
      lower: true, 
      strict: true,
      locale: 'ar'
    }) + '-' + this._id.toString().slice(-6);
  }
  this.updatedAt = Date.now();
  next();
});

// Pre-save middleware to update last active
storeSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.lastActiveAt = Date.now();
  }
  next();
});

// Static method to find nearby stores
storeSchema.statics.findNearby = function(coordinates, maxDistance = 10000, limit = 20) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance
      }
    },
    status: 'active',
    isActive: true
  }).limit(limit);
};

// Static method to search stores
storeSchema.statics.search = function(query, filters = {}) {
  const searchQuery = {
    $text: { $search: query },
    status: 'active',
    isActive: true,
    ...filters
  };
  
  return this.find(searchQuery, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } });
};

// Static method to get featured stores
storeSchema.statics.getFeatured = function(limit = 10) {
  const query = {
    isFeatured: true,
    status: 'active',
    isActive: true
  };
  
  return this.find(query)
    .populate('owner', 'name avatar')
    .populate('category', 'name')
    .sort({ ratingsAverage: -1, createdAt: -1 })
    .limit(limit);
};

// Static method to get stores by category
storeSchema.statics.getByCategory = function(categoryId, limit = 20, page = 1) {
  const skip = (page - 1) * limit;
  
  return this.find({
    $or: [
      { category: categoryId },
      { subcategories: categoryId }
    ],
    status: 'active',
    isActive: true
  })
  .populate('owner', 'name avatar')
  .sort({ isFeatured: -1, ratingsAverage: -1, createdAt: -1 })
  .skip(skip)
  .limit(limit);
};

// Instance method to increment views
storeSchema.methods.incrementViews = function() {
  this.stats.views += 1;
  this.lastActiveAt = new Date();
  return this.save({ validateBeforeSave: false });
};

// Instance method to increment likes
storeSchema.methods.incrementLikes = function() {
  this.stats.likes += 1;
  return this.save({ validateBeforeSave: false });
};

// Instance method to increment follows
storeSchema.methods.incrementFollows = function() {
  this.stats.follows += 1;
  return this.save({ validateBeforeSave: false });
};

// Instance method to decrement follows
storeSchema.methods.decrementFollows = function() {
  this.stats.follows = Math.max(0, this.stats.follows - 1);
  return this.save({ validateBeforeSave: false });
};

// Instance method to update statistics
storeSchema.methods.updateStatistics = async function() {
  const Product = mongoose.model('Product');
  const Order = mongoose.model('Order');
  
  const [productsCount, ordersStats] = await Promise.all([
    Product.countDocuments({ store: this._id, isActive: true }),
    Order.aggregate([
      { $match: { store: this._id, status: 'completed' } },
      {
        $group: {
          _id: null,
          ordersCount: { $sum: 1 },
          totalSales: { $sum: '$totalAmount' }
        }
      }
    ])
  ]);
  
  this.stats.productsCount = productsCount;
  this.stats.ordersCount = ordersStats[0]?.ordersCount || 0;
  this.stats.totalSales = ordersStats[0]?.totalSales || 0;
  this.stats.servicesCount = this.services.filter(s => s.isActive).length;
  
  return this.save({ validateBeforeSave: false });
};

// Instance method to check if open at specific time
storeSchema.methods.isOpenAt = function(date) {
  const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
  const requestedTime = date.toTimeString().slice(0, 5);
  
  const daySchedule = this.businessHours[dayName];
  if (!daySchedule.isOpen) return false;
  
  return requestedTime >= daySchedule.openTime && requestedTime <= daySchedule.closeTime;
};

// Instance method to add offer
storeSchema.methods.addOffer = function(offerData) {
  this.currentOffers.push(offerData);
  return this.save();
};

// Instance method to remove expired offers
storeSchema.methods.removeExpiredOffers = function() {
  const now = new Date();
  this.currentOffers = this.currentOffers.filter(offer => 
    offer.validUntil >= now
  );
  return this.save({ validateBeforeSave: false });
};

// Static method to get store statistics
storeSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalStores: { $sum: 1 },
        activeStores: {
          $sum: {
            $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
          }
        },
        verifiedStores: {
          $sum: {
            $cond: [{ $eq: ['$isVerified', true] }, 1, 0]
          }
        },
        featuredStores: {
          $sum: {
            $cond: [{ $eq: ['$isFeatured', true] }, 1, 0]
          }
        },
        totalViews: { $sum: '$stats.views' },
        totalFollows: { $sum: '$stats.follows' },
        averageRating: { $avg: '$ratingsAverage' }
      }
    }
  ]);
  
  return stats[0] || {
    totalStores: 0,
    activeStores: 0,
    verifiedStores: 0,
    featuredStores: 0,
    totalViews: 0,
    totalFollows: 0,
    averageRating: 0
  };
};

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;