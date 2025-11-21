/**
 * @file StoreOwner.js - Store Owner model for Tawseela Backend
 * @description نموذج مالك المتجر مع الحقول المخصصة لملاك المتاجر
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// تعريف مخطط مالك المتجر
const storeOwnerSchema = new mongoose.Schema({
  // الحقول المشتركة
 email: {
    type: String,
    required: [true, 'البريد الإلكتروني مطلوب'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'الرجاء إدخال بريد إلكتروني صحيح']
  },
  password: {
    type: String,
    required: [true, 'كلمة المرور مطلوبة'],
    minlength: 6,
    select: false // لا يتم جلبها بشكل افتراضي
  },
  phone: {
    type: String,
    required: [true, 'رقم الهاتف مطلوب'],
    unique: true
 },
  name: {
    type: String,
    required: [true, 'الاسم مطلوب'],
    trim: true
 },
  
  // الحقول المخصصة لملاك المتاجر
  businessName: {
    type: String,
    required: [true, 'اسم العمل مطلوب'],
    trim: true
  },
  businessLicense: {
    type: String, // رابط الصورة لرخصة العمل
    required: false
  },
  taxNumber: {
    type: String,
    required: false
 },
  businessType: {
    type: String,
    required: false,
    enum: ['grocery', 'restaurant', 'pharmacy', 'electronics', 'clothing', 'other']
  },
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
      required: true
    }
  },
  wallet: {
    type: Number,
    default: 0,
    min: 0
  },
  commissionRate: {
    type: Number,
    default: 0.1, // 10% افتراضي
    min: 0,
    max: 1
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
  stores: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  }],
  
  // معلومات الدفع
  paymentInfo: {
    bankAccount: {
      accountNumber: String,
      bankName: String,
      accountName: String,
      iban: String
    },
    paymentMethod: {
      type: String,
      enum: ['bank', 'wallet', 'cash'],
      default: 'bank'
    }
 },
  
  // ساعات العمل
  workingHours: {
    sunday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: false }
    },
    monday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true }
    },
    tuesday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true }
    },
    wednesday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true }
    },
    thursday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true }
    },
    friday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true }
    },
    saturday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: false }
    }
  },
  
  // التقييمات
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  
  // مراجعة الأدمن
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // مرجع إلى نموذج المستخدم الإداري
    required: false
  },
  verifiedAt: {
    type: Date,
    required: false
  },
  rejectionReason: {
    type: String,
    required: false
 }
}, {
  timestamps: true // إضافة createdAt و updatedAt تلقائيًا
});

// تشفير كلمة المرور قبل الحفظ
storeOwnerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
 }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// طريقة لمقارنة كلمة المرور
storeOwnerSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// طريقة لحساب التقييم المتوسط
storeOwnerSchema.methods.calculateAverageRating = function() {
  if (this.reviews && this.reviews.length > 0) {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / this.reviews.length) * 10) / 10; // تقريب إلى رقم عشري واحد
  }
  return 0;
};

// تحديث التقييم عند حفظ مالك المتجر
storeOwnerSchema.pre('save', function(next) {
  if (this.reviews && this.reviews.length > 0) {
    this.rating = this.calculateAverageRating();
    this.totalRatings = this.reviews.length;
  }
 next();
});

module.exports = mongoose.model('StoreOwner', storeOwnerSchema);
