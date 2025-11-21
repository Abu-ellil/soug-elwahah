const mongoose = require('mongoose');
const slugify = require('slugify');

const serviceSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'عنوان الخدمة مطلوب'],
    trim: true,
    maxlength: [100, 'عنوان الخدمة لا يجب أن يتجاوز 100 حرف']
  },
  
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  
  description: {
    type: String,
    required: [true, 'وصف الخدمة مطلوب'],
    maxlength: [2000, 'وصف الخدمة لا يجب أن يتجاوز 2000 حرف']
  },
  
  shortDescription: {
    type: String,
    maxlength: [200, 'الوصف المختصر لا يجب أن يتجاوز 200 حرف']
  },
  
  // Category and Classification
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: [true, 'فئة الخدمة مطلوبة']
  },
  
  subcategory: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category'
  },
  
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'كل علامة لا يجب أن تتجاوز 30 حرف']
  }],
  
  // Service Provider Information
  provider: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'مقدم الخدمة مطلوب']
  },
  
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
    type: String,
    maxlength: [200, 'العنوان لا يجب أن يتجاوز 200 حرف']
  },
  
  serviceArea: {
    radius: {
      type: Number,
      default: 5, // km
      min: [0, 'نطاق الخدمة لا يمكن أن يكون سالب']
    }
  },
  
  // Pricing
  pricing: {
    type: {
      type: String,
      enum: ['fixed', 'hourly', 'daily', 'project', 'negotiable'],
      required: [true, 'نوع التسعير مطلوب'],
      default: 'fixed'
    },
    amount: {
      type: Number,
      required: [true, 'مبلغ الخدمة مطلوب'],
      min: [0, 'المبلغ لا يمكن أن يكون سالب']
    },
    currency: {
      type: String,
      enum: ['EGP', 'USD'],
      default: 'EGP'
    },
    minAmount: {
      type: Number,
      min: [0, 'الحد الأدنى للمبلغ لا يمكن أن يكون سالب']
    },
    maxAmount: {
      type: Number,
      min: [0, 'الحد الأقصى للمبلغ لا يمكن أن يكون سالب']
    }
  },
  
  priceNegotiable: {
    type: Boolean,
    default: true
  },
  
  // Service Images/Portfolio
  images: [{
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    alt: String,
    isMain: {
      type: Boolean,
      default: false
    },
    caption: String
  }],
  
  // Service Details
  duration: {
    estimated: {
      type: String,
      maxlength: [100, 'المدة المقدرة لا يجب أن تتجاوز 100 حرف']
    },
    unit: {
      type: String,
      enum: ['minutes', 'hours', 'days', 'weeks', 'months'],
      default: 'hours'
    },
    value: {
      type: Number,
      min: [0, 'قيمة المدة لا يمكن أن تكون سالبة']
    }
  },
  
  // Service Type
  serviceType: {
    type: String,
    enum: ['on_site', 'remote', 'both'],
    required: [true, 'نوع الخدمة مطلوب'],
    default: 'on_site'
  },
  
  // Availability
  availability: {
    isAvailable: {
      type: Boolean,
      default: true
    },
    schedule: {
      monday: {
        available: { type: Boolean, default: true },
        from: { type: String, default: '09:00' },
        to: { type: String, default: '17:00' }
      },
      tuesday: {
        available: { type: Boolean, default: true },
        from: { type: String, default: '09:00' },
        to: { type: String, default: '17:00' }
      },
      wednesday: {
        available: { type: Boolean, default: true },
        from: { type: String, default: '09:00' },
        to: { type: String, default: '17:00' }
      },
      thursday: {
        available: { type: Boolean, default: true },
        from: { type: String, default: '09:00' },
        to: { type: String, default: '17:00' }
      },
      friday: {
        available: { type: Boolean, default: true },
        from: { type: String, default: '09:00' },
        to: { type: String, default: '17:00' }
      },
      saturday: {
        available: { type: Boolean, default: true },
        from: { type: String, default: '09:00' },
        to: { type: String, default: '17:00' }
      },
      sunday: {
        available: { type: Boolean, default: false },
        from: { type: String, default: '09:00' },
        to: { type: String, default: '17:00' }
      }
    },
    emergencyAvailable: {
      type: Boolean,
      default: false
    },
    emergencyFee: {
      type: Number,
      default: 0,
      min: [0, 'رسوم الطوارئ لا يمكن أن تكون سالبة']
    }
  },
  
  // Requirements
  requirements: [{
    type: String,
    trim: true,
    maxlength: [200, 'كل متطلب لا يجب أن يتجاوز 200 حرف']
  }],
  
  // What's Included
  includes: [{
    type: String,
    trim: true,
    maxlength: [200, 'كل عنصر مشمول لا يجب أن يتجاوز 200 حرف']
  }],
  
  // What's Not Included
  excludes: [{
    type: String,
    trim: true,
    maxlength: [200, 'كل عنصر غير مشمول لا يجب أن يتجاوز 200 حرف']
  }],
  
  // Service Status
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'suspended', 'expired'],
    default: 'active'
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  isUrgent: {
    type: Boolean,
    default: false
  },
  
  // Experience and Qualifications
  experience: {
    years: {
      type: Number,
      min: [0, 'سنوات الخبرة لا يمكن أن تكون سالبة'],
      default: 0
    },
    description: {
      type: String,
      maxlength: [500, 'وصف الخبرة لا يجب أن يتجاوز 500 حرف']
    }
  },
  
  qualifications: [{
    title: {
      type: String,
      required: true,
      maxlength: [100, 'عنوان المؤهل لا يجب أن يتجاوز 100 حرف']
    },
    institution: {
      type: String,
      maxlength: [100, 'اسم المؤسسة لا يجب أن يتجاوز 100 حرف']
    },
    year: {
      type: Number,
      min: [1900, 'السنة يجب أن تكون بعد 1900']
    },
    verified: {
      type: Boolean,
      default: false
    }
  }],
  
  // Certifications
  certifications: [{
    name: {
      type: String,
      required: true,
      maxlength: [100, 'اسم الشهادة لا يجب أن يتجاوز 100 حرف']
    },
    issuer: {
      type: String,
      maxlength: [100, 'جهة الإصدار لا يجب أن تتجاوز 100 حرف']
    },
    issueDate: Date,
    expiryDate: Date,
    verified: {
      type: Boolean,
      default: false
    },
    image: {
      public_id: String,
      url: String
    }
  }],
  
  // Payment Options
  paymentMethods: [{
    type: String,
    enum: ['cash', 'card', 'mobile_wallet', 'bank_transfer', 'installments']
  }],
  
  acceptsInstallments: {
    type: Boolean,
    default: false
  },
  
  installmentOptions: [{
    months: {
      type: Number,
      min: [2, 'الحد الأدنى للأقساط شهرين']
    },
    interestRate: {
      type: Number,
      min: [0, 'معدل الفائدة لا يمكن أن يكون سالب'],
      max: [100, 'معدل الفائدة لا يمكن أن يتجاوز 100%']
    }
  }],
  
  // Statistics
  views: {
    type: Number,
    default: 0
  },
  
  likes: {
    type: Number,
    default: 0
  },
  
  shares: {
    type: Number,
    default: 0
  },
  
  inquiries: {
    type: Number,
    default: 0
  },
  
  bookings: {
    type: Number,
    default: 0
  },
  
  completedJobs: {
    type: Number,
    default: 0
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
  metaTitle: String,
  metaDescription: String,
  keywords: [String],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  lastViewedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
serviceSchema.index({ slug: 1 });
serviceSchema.index({ provider: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ location: '2dsphere' });
serviceSchema.index({ status: 1, isActive: 1 });
serviceSchema.index({ isFeatured: 1, isUrgent: 1 });
serviceSchema.index({ 'pricing.amount': 1 });
serviceSchema.index({ createdAt: -1 });
serviceSchema.index({ ratingsAverage: -1 });
serviceSchema.index({ views: -1 });
serviceSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for reviews
serviceSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'service'
});

// Virtual for bookings
serviceSchema.virtual('serviceBookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'service'
});

// Virtual for main image
serviceSchema.virtual('mainImage').get(function() {
  const mainImg = this.images.find(img => img.isMain);
  return mainImg || this.images[0] || null;
});

// Virtual for price display
serviceSchema.virtual('priceDisplay').get(function() {
  const { type, amount, minAmount, maxAmount, currency } = this.pricing;
  const currencySymbol = currency === 'EGP' ? 'ج.م' : '$';
  
  switch (type) {
    case 'fixed':
      return `${amount} ${currencySymbol}`;
    case 'hourly':
      return `${amount} ${currencySymbol}/ساعة`;
    case 'daily':
      return `${amount} ${currencySymbol}/يوم`;
    case 'project':
      return `${amount} ${currencySymbol}/مشروع`;
    case 'negotiable':
      if (minAmount && maxAmount) {
        return `${minAmount} - ${maxAmount} ${currencySymbol}`;
      }
      return 'قابل للتفاوض';
    default:
      return `${amount} ${currencySymbol}`;
  }
});

// Virtual for is available now
serviceSchema.virtual('isAvailableNow').get(function() {
  if (!this.availability.isAvailable) return false;
  
  const now = new Date();
  const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
  const currentTime = now.toTimeString().slice(0, 5);
  
  const daySchedule = this.availability.schedule[dayName];
  if (!daySchedule.available) return false;
  
  return currentTime >= daySchedule.from && currentTime <= daySchedule.to;
});

// Pre-save middleware to generate slug
serviceSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { 
      lower: true, 
      strict: true,
      locale: 'ar'
    }) + '-' + this._id.toString().slice(-6);
  }
  this.updatedAt = Date.now();
  next();
});

// Pre-save middleware to ensure only one main image
serviceSchema.pre('save', function(next) {
  if (this.isModified('images')) {
    let hasMain = false;
    this.images.forEach((img, index) => {
      if (img.isMain && !hasMain) {
        hasMain = true;
      } else if (img.isMain && hasMain) {
        img.isMain = false;
      }
    });
    
    // If no main image is set, make the first one main
    if (!hasMain && this.images.length > 0) {
      this.images[0].isMain = true;
    }
  }
  next();
});

// Static method to find nearby services
serviceSchema.statics.findNearby = function(coordinates, maxDistance = 10000, limit = 20) {
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
    isActive: true,
    'availability.isAvailable': true
  }).limit(limit);
};

// Static method to search services
serviceSchema.statics.search = function(query, filters = {}) {
  const searchQuery = {
    $text: { $search: query },
    status: 'active',
    isActive: true,
    ...filters
  };
  
  return this.find(searchQuery, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } });
};

// Static method to get featured services
serviceSchema.statics.getFeatured = function(limit = 10) {
  const query = {
    isFeatured: true,
    status: 'active',
    isActive: true,
    'availability.isAvailable': true
  };
  
  return this.find(query)
    .populate('provider', 'name avatar')
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get services by category
serviceSchema.statics.getByCategory = function(categoryId, limit = 20, page = 1) {
  const skip = (page - 1) * limit;
  
  return this.find({
    category: categoryId,
    status: 'active',
    isActive: true,
    'availability.isAvailable': true
  })
  .populate('provider', 'name avatar')
  .sort({ isFeatured: -1, ratingsAverage: -1, createdAt: -1 })
  .skip(skip)
  .limit(limit);
};

// Instance method to increment views
serviceSchema.methods.incrementViews = function() {
  this.views += 1;
  this.lastViewedAt = new Date();
  return this.save({ validateBeforeSave: false });
};

// Instance method to increment likes
serviceSchema.methods.incrementLikes = function() {
  this.likes += 1;
  return this.save({ validateBeforeSave: false });
};

// Instance method to increment bookings
serviceSchema.methods.incrementBookings = function() {
  this.bookings += 1;
  return this.save({ validateBeforeSave: false });
};

// Instance method to increment completed jobs
serviceSchema.methods.incrementCompletedJobs = function() {
  this.completedJobs += 1;
  return this.save({ validateBeforeSave: false });
};

// Instance method to check availability for specific date/time
serviceSchema.methods.isAvailableAt = function(date) {
  if (!this.availability.isAvailable) return false;
  
  const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
  const requestedTime = date.toTimeString().slice(0, 5);
  
  const daySchedule = this.availability.schedule[dayName];
  if (!daySchedule.available) return false;
  
  return requestedTime >= daySchedule.from && requestedTime <= daySchedule.to;
};

// Static method to get services by provider
serviceSchema.statics.getByProvider = function(providerId, status = 'active') {
  return this.find({ provider: providerId, status })
    .populate('category', 'name')
    .sort({ createdAt: -1 });
};

// Static method to get service statistics
serviceSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalServices: { $sum: 1 },
        activeServices: {
          $sum: {
            $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
          }
        },
        featuredServices: {
          $sum: {
            $cond: [{ $eq: ['$isFeatured', true] }, 1, 0]
          }
        },
        averagePrice: { $avg: '$pricing.amount' },
        totalViews: { $sum: '$views' },
        totalBookings: { $sum: '$bookings' },
        totalCompletedJobs: { $sum: '$completedJobs' }
      }
    }
  ]);
  
  return stats[0] || {
    totalServices: 0,
    activeServices: 0,
    featuredServices: 0,
    averagePrice: 0,
    totalViews: 0,
    totalBookings: 0,
    totalCompletedJobs: 0
  };
};

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;