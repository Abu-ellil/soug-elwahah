/**
 * @file Customer.js - Customer model for Tawseela Backend
 * @description نموذج العميل مع الحقول المخصصة للعملاء
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// تعريف مخطط العميل
const customerSchema = new mongoose.Schema({
  // طرق المصادقة
  email: {
    type: String,
    unique: true,
    lowercase: true,
    sparse: true, // يسمح بقيم null متعددة
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'الرجاء إدخال بريد إلكتروني صحيح']
  },
  password: {
    type: String,
    minlength: 6,
    select: false // لا يتم جلبها بشكل افتراضي
  },
  phone: {
    type: String,
    unique: true,
    sparse: true // يسمح بقيم null متعددة
  },
  name: {
    type: String,
    required: [true, 'الاسم مطلوب'],
    trim: true
  },
  
  // دعم وسائل التواصل الاجتماعي
  socialAuth: {
    google: {
      id: { type: String, sparse: true },
      email: { type: String, sparse: true }
    },
    facebook: {
      id: { type: String, sparse: true },
      email: { type: String, sparse: true }
    },
    apple: {
      id: { type: String, sparse: true },
      email: { type: String, sparse: true }
    }
  },
  
  // نوع المصادقة المستخدم
  authProvider: {
    type: String,
    enum: ['email', 'phone', 'google', 'facebook', 'apple'],
    default: 'email'
  },
  
  // الحقول المخصصة للعملاء
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    },
    address: {
      type: String,
      required: false
    }
  },
  wallet: {
    type: Number,
    default: 0,
    min: 0
  },
  defaultAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String, // رابط الصورة
    default: null
  },
  preferences: {
    favoriteStores: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store'
    }],
    preferredPaymentMethod: {
      type: String,
      enum: ['wallet', 'cash', 'card'],
      default: 'cash'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    }
  },
  
  // قائمة الأمنيات
  wishlist: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // التقييمات والمراجعات
  reviews: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 500
    },
    images: [String], // روابط صور التقييم
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    helpfulVotes: {
      type: Number,
      default: 0
    }
  }],
  
  // إحصائيات المستخدم
  stats: {
    totalOrders: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    loyaltyPoints: {
      type: Number,
      default: 0
    },
    lastActiveAt: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true // إضافة createdAt و updatedAt تلقائيًا
});

// تشفير كلمة المرور قبل الحفظ
customerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// طريقة لمقارنة كلمة المرور
customerSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// تحويل الحقل virtual للحصول على الاسم الكامل
customerSchema.virtual('fullName').get(function() {
  return this.name;
});

// فهارس مساعدة للبحث
customerSchema.index({ email: 1 });
customerSchema.index({ phone: 1 });
customerSchema.index({ 'socialAuth.google.id': 1 });
customerSchema.index({ 'socialAuth.facebook.id': 1 });
customerSchema.index({ 'socialAuth.apple.id': 1 });

// أساليب مساعدة للمصادقة
customerSchema.methods.hasPassword = function() {
  return !!this.password;
};

customerSchema.methods.verifySocialAuth = function(provider, socialId, socialEmail) {
  if (!this.socialAuth[provider]) {
    return false;
  }
  
  const providerData = this.socialAuth[provider];
  return providerData.id === socialId || 
         (socialEmail && providerData.email === socialEmail);
};

// أساليب قائمة الأمنيات
customerSchema.methods.addToWishlist = function(productId) {
  const existingItem = this.wishlist.find(item => 
    item.product.toString() === productId.toString()
  );
  
  if (!existingItem) {
    this.wishlist.push({ product: productId });
  }
  
  return this.save();
};

customerSchema.methods.removeFromWishlist = function(productId) {
  this.wishlist = this.wishlist.filter(item => 
    item.product.toString() !== productId.toString()
  );
  
  return this.save();
};

customerSchema.methods.isInWishlist = function(productId) {
  return this.wishlist.some(item => 
    item.product.toString() === productId.toString()
  );
};

// أساليب التقييمات
customerSchema.methods.addReview = function(reviewData) {
  const existingReview = this.reviews.find(review => 
    review.product.toString() === reviewData.product.toString()
  );
  
  if (existingReview) {
    // تحديث التقييم الموجود
    Object.assign(existingReview, reviewData);
    existingReview.updatedAt = new Date();
  } else {
    // إضافة تقييم جديد
    this.reviews.push(reviewData);
  }
  
  return this.save();
};

customerSchema.methods.updateLastActive = function() {
  this.stats.lastActiveAt = new Date();
  return this.save();
};

// تحديث الإحصائيات
customerSchema.methods.updateStats = function(orderData) {
  this.stats.totalOrders += 1;
  this.stats.totalSpent += orderData.total || 0;
  this.stats.loyaltyPoints += Math.floor((orderData.total || 0) / 10); // نقطة لكل 10 ريال
  this.stats.lastActiveAt = new Date();
  
  return this.save();
};

module.exports = mongoose.model('Customer', customerSchema);
