const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'اسم الفئة مطلوب'],
    trim: true,
    maxlength: [50, 'اسم الفئة لا يجب أن يتجاوز 50 حرف']
  },
  
  nameEn: {
    type: String,
    trim: true,
    maxlength: [50, 'اسم الفئة بالإنجليزية لا يجب أن يتجاوز 50 حرف']
  },
  
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  
  description: {
    type: String,
    maxlength: [200, 'وصف الفئة لا يجب أن يتجاوز 200 حرف']
  },
  
  // Category Type
  type: {
    type: String,
    enum: ['product', 'service', 'both'],
    required: [true, 'نوع الفئة مطلوب'],
    default: 'both'
  },
  
  // Category Image/Icon
  image: {
    public_id: String,
    url: {
      type: String,
      default: 'https://res.cloudinary.com/elsoug/image/upload/v1/defaults/default-category.png'
    }
  },
  
  icon: {
    type: String, // Font Awesome icon class or emoji
    default: '📦'
  },
  
  // Hierarchy
  parent: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    default: null
  },
  
  level: {
    type: Number,
    default: 0,
    min: 0,
    max: 3 // Maximum 3 levels deep
  },
  
  // Category Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Display Settings
  color: {
    type: String,
    default: '#3B82F6' // Default blue color
  },
  
  sortOrder: {
    type: Number,
    default: 0
  },
  
  // Statistics
  productsCount: {
    type: Number,
    default: 0
  },
  
  servicesCount: {
    type: Number,
    default: 0
  },
  
  // SEO
  metaTitle: String,
  metaDescription: String,
  keywords: [String],
  
  // Creation and update timestamps
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
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ type: 1 });
categorySchema.index({ isActive: 1, isFeatured: 1 });
categorySchema.index({ sortOrder: 1 });
categorySchema.index({ createdAt: -1 });

// Virtual for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

// Virtual for products
categorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category'
});

// Virtual for services
categorySchema.virtual('services', {
  ref: 'Service',
  localField: '_id',
  foreignField: 'category'
});

// Pre-save middleware to generate slug
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { 
      lower: true, 
      strict: true,
      locale: 'ar'
    });
  }
  this.updatedAt = Date.now();
  next();
});

// Pre-save middleware to set level based on parent
categorySchema.pre('save', async function(next) {
  if (this.isModified('parent') && this.parent) {
    const parent = await this.constructor.findById(this.parent);
    if (parent) {
      this.level = parent.level + 1;
      
      // Prevent circular references
      if (this.level > 3) {
        return next(new Error('لا يمكن إنشاء أكثر من 3 مستويات من الفئات'));
      }
      
      // Check if trying to set parent as itself or its child
      if (parent._id.equals(this._id)) {
        return next(new Error('لا يمكن جعل الفئة والد لنفسها'));
      }
    }
  } else if (!this.parent) {
    this.level = 0;
  }
  next();
});

// Static method to get category tree
categorySchema.statics.getCategoryTree = async function(type = null) {
  const match = { parent: null, isActive: true };
  if (type) {
    match.$or = [{ type: type }, { type: 'both' }];
  }
  
  const categories = await this.find(match)
    .populate({
      path: 'subcategories',
      match: { isActive: true },
      populate: {
        path: 'subcategories',
        match: { isActive: true },
        populate: {
          path: 'subcategories',
          match: { isActive: true }
        }
      }
    })
    .sort({ sortOrder: 1, name: 1 });
    
  return categories;
};

// Static method to get featured categories
categorySchema.statics.getFeatured = function(type = null, limit = 10) {
  const match = { isFeatured: true, isActive: true };
  if (type) {
    match.$or = [{ type: type }, { type: 'both' }];
  }
  
  return this.find(match)
    .sort({ sortOrder: 1, name: 1 })
    .limit(limit);
};

// Static method to search categories
categorySchema.statics.search = function(query, type = null) {
  const searchRegex = new RegExp(query, 'i');
  const match = {
    $or: [
      { name: searchRegex },
      { nameEn: searchRegex },
      { description: searchRegex },
      { keywords: { $in: [searchRegex] } }
    ],
    isActive: true
  };
  
  if (type) {
    match.$and = [{ $or: [{ type: type }, { type: 'both' }] }];
  }
  
  return this.find(match).sort({ sortOrder: 1, name: 1 });
};

// Instance method to get full path
categorySchema.methods.getFullPath = async function() {
  const path = [this.name];
  let current = this;
  
  while (current.parent) {
    current = await this.constructor.findById(current.parent);
    if (current) {
      path.unshift(current.name);
    } else {
      break;
    }
  }
  
  return path.join(' > ');
};

// Instance method to update statistics
categorySchema.methods.updateStatistics = async function() {
  const Product = mongoose.model('Product');
  const Service = mongoose.model('Service');
  
  const [productsCount, servicesCount] = await Promise.all([
    Product.countDocuments({ category: this._id, isActive: true }),
    Service.countDocuments({ category: this._id, isActive: true })
  ]);
  
  this.productsCount = productsCount;
  this.servicesCount = servicesCount;
  
  return this.save({ validateBeforeSave: false });
};

// Instance method to get all descendants
categorySchema.methods.getDescendants = async function() {
  const descendants = [];
  
  const getChildren = async (categoryId) => {
    const children = await this.constructor.find({ parent: categoryId, isActive: true });
    for (const child of children) {
      descendants.push(child);
      await getChildren(child._id);
    }
  };
  
  await getChildren(this._id);
  return descendants;
};

// Static method to get category statistics
categorySchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalCategories: { $sum: 1 },
        activeCategories: {
          $sum: {
            $cond: [{ $eq: ['$isActive', true] }, 1, 0]
          }
        },
        featuredCategories: {
          $sum: {
            $cond: [{ $eq: ['$isFeatured', true] }, 1, 0]
          }
        },
        productCategories: {
          $sum: {
            $cond: [{ $in: ['$type', ['product', 'both']] }, 1, 0]
          }
        },
        serviceCategories: {
          $sum: {
            $cond: [{ $in: ['$type', ['service', 'both']] }, 1, 0]
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalCategories: 0,
    activeCategories: 0,
    featuredCategories: 0,
    productCategories: 0,
    serviceCategories: 0
  };
};

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;