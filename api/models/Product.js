const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'عنوان المنتج مطلوب'],
    trim: true,
    maxlength: [100, 'عنوان المنتج لا يجب أن يتجاوز 100 حرف']
  },
  
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  
  description: {
    type: String,
    required: [true, 'وصف المنتج مطلوب'],
    maxlength: [2000, 'وصف المنتج لا يجب أن يتجاوز 2000 حرف']
  },
  
  shortDescription: {
    type: String,
    maxlength: [200, 'الوصف المختصر لا يجب أن يتجاوز 200 حرف']
  },
  
  // Category and Classification
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: [true, 'فئة المنتج مطلوبة']
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
  
  // Seller Information
  seller: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'بائع المنتج مطلوب']
  },
  
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store'
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
  
  // Pricing
  price: {
    type: Number,
    required: [true, 'سعر المنتج مطلوب'],
    min: [0, 'السعر لا يمكن أن يكون سالب']
  },
  
  originalPrice: {
    type: Number,
    min: [0, 'السعر الأصلي لا يمكن أن يكون سالب']
  },
  
  currency: {
    type: String,
    enum: ['EGP', 'USD'],
    default: 'EGP'
  },
  
  priceNegotiable: {
    type: Boolean,
    default: true
  },
  
  // Inventory
  quantity: {
    type: Number,
    required: [true, 'كمية المنتج مطلوبة'],
    min: [0, 'الكمية لا يمكن أن تكون سالبة'],
    default: 1
  },
  
  unit: {
    type: String,
    enum: ['piece', 'kg', 'gram', 'liter', 'meter', 'box', 'pack', 'dozen'],
    default: 'piece'
  },
  
  minOrderQuantity: {
    type: Number,
    default: 1,
    min: [1, 'الحد الأدنى للطلب يجب أن يكون 1 على الأقل']
  },
  
  // Product Images
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
    }
  }],
  
  // Product Condition
  condition: {
    type: String,
    enum: ['new', 'like_new', 'good', 'fair', 'poor'],
    required: [true, 'حالة المنتج مطلوبة'],
    default: 'new'
  },
  
  // Product Type
  type: {
    type: String,
    enum: ['physical', 'digital', 'service'],
    default: 'physical'
  },
  
  // Availability
  isAvailable: {
    type: Boolean,
    default: true
  },
  
  availabilityStatus: {
    type: String,
    enum: ['in_stock', 'out_of_stock', 'limited', 'pre_order'],
    default: 'in_stock'
  },
  
  // Product Status
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'sold', 'expired', 'rejected'],
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
  
  // Delivery Options
  deliveryOptions: {
    pickup: {
      type: Boolean,
      default: true
    },
    delivery: {
      type: Boolean,
      default: false
    },
    shipping: {
      type: Boolean,
      default: false
    }
  },
  
  deliveryFee: {
    type: Number,
    default: 0,
    min: [0, 'رسوم التوصيل لا يمكن أن تكون سالبة']
  },
  
  deliveryTime: {
    type: String,
    maxlength: [100, 'وقت التوصيل لا يجب أن يتجاوز 100 حرف']
  },
  
  // Payment Options
  paymentMethods: [{
    type: String,
    enum: ['cash', 'card', 'mobile_wallet', 'bank_transfer', 'barter']
  }],
  
  acceptsBarter: {
    type: Boolean,
    default: false
  },
  
  barterItems: [{
    type: String,
    trim: true,
    maxlength: [50, 'عنصر المقايضة لا يجب أن يتجاوز 50 حرف']
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
  
  // Expiry
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    }
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
productSchema.index({ slug: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ category: 1 });
productSchema.index({ location: '2dsphere' });
productSchema.index({ status: 1, isActive: 1 });
productSchema.index({ isFeatured: 1, isUrgent: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ expiresAt: 1 });
productSchema.index({ ratingsAverage: -1 });
productSchema.index({ views: -1 });
productSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for reviews
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product'
});

// Virtual for orders
productSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'items.product'
});

// Virtual for main image
productSchema.virtual('mainImage').get(function() {
  const mainImg = this.images.find(img => img.isMain);
  return mainImg || this.images[0] || null;
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual for is on sale
productSchema.virtual('isOnSale').get(function() {
  return this.originalPrice && this.originalPrice > this.price;
});

// Virtual for is expired
productSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Pre-save middleware to generate slug
productSchema.pre('save', function(next) {
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
productSchema.pre('save', function(next) {
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

// Pre-save middleware to update availability status based on quantity
productSchema.pre('save', function(next) {
  if (this.isModified('quantity')) {
    if (this.quantity === 0) {
      this.availabilityStatus = 'out_of_stock';
      this.isAvailable = false;
    } else if (this.quantity <= 5) {
      this.availabilityStatus = 'limited';
      this.isAvailable = true;
    } else {
      this.availabilityStatus = 'in_stock';
      this.isAvailable = true;
    }
  }
  next();
});

// Static method to find nearby products
productSchema.statics.findNearby = function(coordinates, maxDistance = 10000, limit = 20) {
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
    isAvailable: true
  }).limit(limit);
};

// Static method to search products
productSchema.statics.search = function(query, filters = {}) {
  const searchQuery = {
    $text: { $search: query },
    status: 'active',
    isActive: true,
    ...filters
  };
  
  return this.find(searchQuery, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } });
};

// Static method to get featured products
productSchema.statics.getFeatured = function(limit = 10) {
  const query = {
    isFeatured: true,
    status: 'active',
    isActive: true,
    isAvailable: true
  };
  
  return this.find(query)
    .populate('seller', 'name avatar')
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get urgent products
productSchema.statics.getUrgent = function(limit = 10) {
  const query = {
    isUrgent: true,
    status: 'active',
    isActive: true,
    isAvailable: true
  };
  
  return this.find(query)
    .populate('seller', 'name avatar')
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Instance method to increment views
productSchema.methods.incrementViews = function() {
  this.views += 1;
  this.lastViewedAt = new Date();
  return this.save({ validateBeforeSave: false });
};

// Instance method to increment likes
productSchema.methods.incrementLikes = function() {
  this.likes += 1;
  return this.save({ validateBeforeSave: false });
};

// Instance method to increment shares
productSchema.methods.incrementShares = function() {
  this.shares += 1;
  return this.save({ validateBeforeSave: false });
};

// Instance method to increment inquiries
productSchema.methods.incrementInquiries = function() {
  this.inquiries += 1;
  return this.save({ validateBeforeSave: false });
};

// Instance method to check if product is available for order
productSchema.methods.isAvailableForOrder = function(requestedQuantity = 1) {
  return this.isActive && 
         this.isAvailable && 
         this.status === 'active' && 
         this.quantity >= requestedQuantity &&
         (!this.expiresAt || this.expiresAt > new Date());
};

// Instance method to reduce quantity after order
productSchema.methods.reduceQuantity = function(quantity) {
  if (this.quantity >= quantity) {
    this.quantity -= quantity;
    return this.save({ validateBeforeSave: false });
  }
  throw new Error('الكمية المطلوبة غير متوفرة');
};

// Static method to get products by seller
productSchema.statics.getBySeller = function(sellerId, status = 'active') {
  return this.find({ seller: sellerId, status })
    .populate('category', 'name')
    .sort({ createdAt: -1 });
};

// Static method to get products by category
productSchema.statics.getByCategory = function(categoryId, limit = 20, page = 1) {
  const skip = (page - 1) * limit;
  
  return this.find({
    category: categoryId,
    status: 'active',
    isActive: true,
    isAvailable: true
  })
  .populate('seller', 'name avatar')
  .sort({ isFeatured: -1, createdAt: -1 })
  .skip(skip)
  .limit(limit);
};

// Static method to get product statistics
productSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        activeProducts: {
          $sum: {
            $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
          }
        },
        featuredProducts: {
          $sum: {
            $cond: [{ $eq: ['$isFeatured', true] }, 1, 0]
          }
        },
        urgentProducts: {
          $sum: {
            $cond: [{ $eq: ['$isUrgent', true] }, 1, 0]
          }
        },
        averagePrice: { $avg: '$price' },
        totalViews: { $sum: '$views' },
        totalLikes: { $sum: '$likes' }
      }
    }
  ]);
  
  return stats[0] || {
    totalProducts: 0,
    activeProducts: 0,
    featuredProducts: 0,
    urgentProducts: 0,
    averagePrice: 0,
    totalViews: 0,
    totalLikes: 0
  };
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;