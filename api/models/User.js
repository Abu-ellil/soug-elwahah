/**
 * @file models/User.js - User model
 * @description نموذج المستخدم يتضمن الحقول المطلوبة وفقًا لمتطلبات النظام
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'الاسم مطلوب'],
    trim: true,
    maxlength: [50, 'لا يمكن أن يتجاوز الاسم 50 حرفًا']
  },
  email: {
    type: String,
    required: [true, 'البريد الإلكتروني مطلوب'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'يرجى تقديم بريد إلكتروني صالح'
    ]
  },
  password: {
    type: String,
    required: [true, 'كلمة المرور مطلوبة'],
    minlength: [6, 'لا يمكن أن تقل كلمة المرور عن 6 أحرف'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'رقم الهاتف مطلوب'],
    unique: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['customer', 'driver', 'store_owner', 'admin'],
    default: 'customer',
    required: true
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
    address: String
  },
  wallet: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  driverDocuments: {
    nationalId: {
      type: String,
      default: null
    },
    license: {
      type: String,
      default: null
    },
    photo: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  },
  verificationToken: String,
 resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// تشفير كلمة المرور باستخدام bcrypt قبل حفظ المستخدم
userSchema.pre('save', async function(next) {
  // الخروج إذا لم يتم تعديل كلمة المرور
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// دالة مقارنة كلمة المرور
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// إنشاء JWT
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// إنشاء رمز استعادة كلمة المرور
userSchema.methods.getResetPasswordToken = function() {
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

module.exports = mongoose.model('User', userSchema);