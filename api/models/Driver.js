/**
 * @file Driver.js - Driver model for Tawseela Backend
 * @description نموذج السائق مع الحقول المخصصة للسائقين ونظام التحقق
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// تعريف مخطط السائق
const driverSchema = new mongoose.Schema({
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
  
  // الحقول المخصصة للسائقين
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
  totalDeliveries: {
    type: Number,
    default: 0
  },
  vehicle: {
    type: {
      vehicleType: {
        type: String,
        enum: ['car', 'motorcycle', 'bicycle', 'truck'],
        required: true
      },
      make: String,
      model: String,
      year: Number,
      color: String,
      plateNumber: String
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String, // رابط الصورة
    default: null
  },
  
  // وثائق التحقق
  documents: {
    nationalId: {
      front: {
        type: String, // رابط الصورة
        required: false
      },
      back: {
        type: String, // رابط الصورة
        required: false
      },
      number: {
        type: String,
        required: false
      }
    },
    license: {
      front: {
        type: String, // رابط الصورة
        required: false
      },
      back: {
        type: String, // رابط الصورة
        required: false
      },
      number: {
        type: String,
        required: false
      },
      expiryDate: {
        type: Date,
        required: false
      }
    },
    photo: {
      type: String, // رابط الصورة الشخصية
      required: false
    },
    status: {
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
 },
  
  // معلومات التسليم
  deliveryZones: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zone'
  }],
  maxDeliveryDistance: {
    type: Number, // بالكيلومترات
    default: 10
  },
  
  // التقييمات من العملاء
  reviews: [{
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
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
      required: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
 }]
}, {
  timestamps: true // إضافة createdAt و updatedAt تلقائيًا
});

// تشفير كلمة المرور قبل الحفظ
driverSchema.pre('save', async function(next) {
 if (!this.isModified('password')) {
    next();
  }
 const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// طريقة لمقارنة كلمة المرور
driverSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// إنشاء JWT
driverSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// إنشاء رمز استعادة كلمة المرور
driverSchema.methods.getResetPasswordToken = function() {
  // توليد الرمز
  const resetToken = crypto.randomBytes(20).toString('hex');

  // تشفير الرمز وحفظه في قاعدة البيانات
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // تعيين وقت انتهاء الصلاحية (10 دقائق)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// طريقة لحساب التقييم المتوسط
driverSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / this.reviews.length) * 10) / 10; // تقريب إلى رقم عشري واحد
};

// تحديث التقييم عند حفظ السائق
driverSchema.pre('save', function(next) {
  if (this.reviews.length > 0) {
    this.rating = this.calculateAverageRating();
    this.totalRatings = this.reviews.length;
  }
  next();
});

// إنشاء JWT
driverSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

module.exports = mongoose.model('Driver', driverSchema);
