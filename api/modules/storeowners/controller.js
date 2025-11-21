/**
 * @file storeOwnerController.js - Store Owner Controller for Tawseela Backend
 * @description وحدة التحكم الخاصة بتسجيل وتسجيل دخول ملاك المتاجر
 */

const StoreOwner = require('../../models/StoreOwner');
const asyncHandler = require('../../middleware/async');
const ErrorResponse = require('../../utils/errorResponse');
const sendEmail = require('../../utils/sendEmail');
const crypto = require('crypto');

// @desc    Register store owner
// @route   POST /api/store-owners/register
// @access  Public
exports.registerStoreOwner = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, businessName, businessType } = req.body;

  // إنشاء مالك المتجر
  const storeOwner = await StoreOwner.create({
    name,
    email,
    password,
    phone,
    businessName,
    businessType
  });

  // إنشاء التوكن
  const token = storeOwner.getSignedJwtToken();

  // إعداد خيارات الكوكيز
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' // إذا كان في الإنتاج، قم بتعيين secure إلى true
 };

  // إذا كان في وضع التطوير، قم بإزالة secure
  if (process.env.NODE_ENV === 'development') {
    delete options.secure;
  }

  // إرسال الاستجابة مع الكوكيز
  res
    .status(200)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      data: {
        id: storeOwner._id,
        name: storeOwner.name,
        email: storeOwner.email,
        phone: storeOwner.phone,
        businessName: storeOwner.businessName,
        businessType: storeOwner.businessType,
        isVerified: storeOwner.isVerified,
        verificationStatus: storeOwner.verificationStatus,
        wallet: storeOwner.wallet
      }
    });
});

// @desc    Login store owner
// @route   POST /api/store-owners/login
// @access  Public
exports.loginStoreOwner = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // التحقق من البريد الإلكتروني وكلمة المرور
  if (!email || !password) {
    return next(new ErrorResponse('الرجاء إدخال البريد الإلكتروني وكلمة المرور', 400));
  }

  // العثور على مالك المتجر
  const storeOwner = await StoreOwner.findOne({ email }).select('+password');

  if (!storeOwner) {
    return next(new ErrorResponse('بيانات الاعتماد غير صحيحة', 401));
  }

  // التحقق من كلمة المرور
  const isMatch = await storeOwner.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('بيانات ال crédit غير صحيحة', 401));
  }

  // إنشاء التوكن
  const token = storeOwner.getSignedJwtToken();

  // إعداد خيارات الكوكيز
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  // إذا كان في وضع التطوير، قم بإزالة secure
  if (process.env.NODE_ENV === 'development') {
    delete options.secure;
  }

  // حذف الحقل المحدد من مالك المتجر قبل الإرسال
  storeOwner.password = undefined;

  // إرسال الاستجابة
  res
    .status(200)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      data: {
        id: storeOwner._id,
        name: storeOwner.name,
        email: storeOwner.email,
        phone: storeOwner.phone,
        businessName: storeOwner.businessName,
        businessType: storeOwner.businessType,
        isVerified: storeOwner.isVerified,
        verificationStatus: storeOwner.verificationStatus,
        wallet: storeOwner.wallet
      }
    });
});

// @desc    Get current logged in store owner
// @route   GET /api/store-owners/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const storeOwner = await StoreOwner.findById(req.storeOwner.id);

  res.status(200).json({
    success: true,
    data: {
      id: storeOwner._id,
      name: storeOwner.name,
      email: storeOwner.email,
      phone: storeOwner.phone,
      businessName: storeOwner.businessName,
      businessType: storeOwner.businessType,
      isVerified: storeOwner.isVerified,
      verificationStatus: storeOwner.verificationStatus,
      wallet: storeOwner.wallet,
      location: storeOwner.location,
      commissionRate: storeOwner.commissionRate,
      stores: storeOwner.stores
    }
  });
});

// @desc    Update store owner details
// @route   PUT /api/store-owners/me
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    businessName: req.body.businessName,
    businessType: req.body.businessType,
    location: req.body.location,
    commissionRate: req.body.commissionRate
  };

  // تجاهل الحقول الفارغة
  Object.keys(fieldsToUpdate).forEach(key => {
    if (fieldsToUpdate[key] === undefined) {
      delete fieldsToUpdate[key];
    }
  });

  const storeOwner = await StoreOwner.findByIdAndUpdate(req.storeOwner.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: storeOwner
  });
});

// @desc    Update store owner password
// @route   PUT /api/store-owners/me/password
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const storeOwner = await StoreOwner.findById(req.storeOwner.id).select('+password');

  // التحقق من كلمة المرور الحالية
  if (!(await storeOwner.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('كلمة المرور غير صحيحة', 401));
  }

  storeOwner.password = req.body.newPassword;
  await storeOwner.save();

  const token = storeOwner.getSignedJwtToken();

  // إعداد خيارات الكوكيز
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  // إذا كان في وضع التطوير، قم بإزالة secure
  if (process.env.NODE_ENV === 'development') {
    delete options.secure;
  }

  res
    .status(200)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
});

// @desc    Upload store owner documents for verification
// @route   PUT /api/store-owners/me/documents
// @access  Private
exports.uploadDocuments = asyncHandler(async (req, res, next) => {
  const { businessLicense, taxNumber } = req.body;

  const storeOwner = await StoreOwner.findByIdAndUpdate(
    req.storeOwner.id,
    {
      $set: {
        businessLicense,
        taxNumber,
        verificationStatus: 'pending'
      }
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: {
      verificationStatus: storeOwner.verificationStatus,
      businessLicense: storeOwner.businessLicense,
      taxNumber: storeOwner.taxNumber
    }
  });
});

// @desc    Forgot password
// @route   POST /api/store-owners/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const storeOwner = await StoreOwner.findOne({ email: req.body.email });

  if (!storeOwner) {
    return next(new ErrorResponse('لا يوجد مالك متجر بهذا البريد الإلكتروني', 404));
  }

  // توليد رمز إعادة تعيين كلمة المرور
  const resetToken = storeOwner.getResetPasswordToken();
  await storeOwner.save({ validateBeforeSave: false });

  // إنشاء رابط إعادة التعيين
  const resetUrl = `${req.protocol}://${req.get('host')}/api/store-owners/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: storeOwner.email,
      subject: 'Password reset token',
      message
    });

    res.status(20).json({ success: true, data: 'Token sent to email' });
  } catch (err) {
    console.log(err);
    storeOwner.resetPasswordToken = undefined;
    storeOwner.resetPasswordExpire = undefined;

    await storeOwner.save({ validateBeforeSave: false });

    return next(new ErrorResponse('حدث خطأ أثناء إرسال البريد الإلكتروني', 500));
  }
});

// @desc    Reset password
// @route   PUT /api/store-owners/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // تشفير التوكن
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  // العثور على مالك المتجر باستخدام التوكن وتحقق من انتهاء الصلاحية
  const storeOwner = await StoreOwner.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!storeOwner) {
    return next(new ErrorResponse('التوكن غير صحيح أو منتهي الصلاحية', 400));
  }

  // تعيين كلمة المرور الجديدة
 storeOwner.password = req.body.password;

  // تعيين الحقول إلى undefined
 storeOwner.resetPasswordToken = undefined;
  storeOwner.resetPasswordExpire = undefined;

  await storeOwner.save();

  const token = storeOwner.getSignedJwtToken();

  // إعداد خيارات الكوكيز
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  // إذا كان في وضع التطوير، قم بإزالة secure
  if (process.env.NODE_ENV === 'development') {
    delete options.secure;
  }

  res
    .status(200)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
});

// @desc    Logout store owner
// @route   GET /api/store-owners/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // ينتهي بعد 10 ثوانٍ
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});
