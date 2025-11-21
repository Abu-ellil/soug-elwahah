/**
 * @file customerController.js - Customer Controller for Tawseela Backend
 * @description وحدة التحكم الخاصة بتسجيل وتسجيل دخول العملاء
 */

const Customer = require('../../models/Customer');
const asyncHandler = require('../../middleware/async');
const ErrorResponse = require('../../utils/errorResponse');
const sendEmail = require('../../utils/sendEmail');
const crypto = require('crypto');

// @desc    Register customer
// @route   POST /api/customers/register
// @access  Public
exports.registerCustomer = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  // إنشاء العميل
  const customer = await Customer.create({
    name,
    email,
    password,
    phone
  });

  // إنشاء التوكن
  const token = customer.getSignedJwtToken();

  // إعداد خيارات الكوكيز
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
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
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        isVerified: customer.isVerified,
        wallet: customer.wallet
      }
    });
});

// @desc    Login customer
// @route   POST /api/customers/login
// @access  Public
exports.loginCustomer = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // التحقق من البريد الإلكتروني وكلمة المرور
  if (!email || !password) {
    return next(new ErrorResponse('الرجاء إدخال البريد الإلكتروني وكلمة المرور', 40));
  }

 // العثور على العميل
  const customer = await Customer.findOne({ email }).select('+password');

  if (!customer) {
    return next(new ErrorResponse('بيانات الاعتماد غير صحيحة', 401));
  }

  // التحقق من كلمة المرور
  const isMatch = await customer.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('بيانات الاعتماد غير صحيحة', 401));
  }

  // إنشاء التوكن
  const token = customer.getSignedJwtToken();

  // إعداد خيارات الكوكيز
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  // إذا كان في وضع التطوير، قم بإزالة secure
  if (process.env.NODE_ENV === 'development') {
    delete options.secure;
  }

  // حذف الحقل المحدد من العميل قبل الإرسال
  customer.password = undefined;

  // إرسال الاستجابة
  res
    .status(200)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      data: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        isVerified: customer.isVerified,
        wallet: customer.wallet
      }
    });
});

// @desc    Get current logged in customer
// @route   GET /api/customers/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const customer = await Customer.findById(req.customer.id);

  res.status(200).json({
    success: true,
    data: {
      id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      isVerified: customer.isVerified,
      wallet: customer.wallet,
      location: customer.location,
      defaultAddress: customer.defaultAddress
    }
  });
});

// @desc    Update customer details
// @route   PUT /api/customers/me
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone
  };

  // تجاهل الحقول الفارغة
  Object.keys(fieldsToUpdate).forEach(key => {
    if (fieldsToUpdate[key] === undefined) {
      delete fieldsToUpdate[key];
    }
  });

  const customer = await Customer.findByIdAndUpdate(req.customer.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: customer
  });
});

// @desc    Update customer password
// @route   PUT /api/customers/me/password
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const customer = await Customer.findById(req.customer.id).select('+password');

  // التحقق من كلمة المرور الحالية
  if (!(await customer.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('كلمة المرور غير صحيحة', 401));
  }

  customer.password = req.body.newPassword;
  await customer.save();

  const token = customer.getSignedJwtToken();

  // إعداد خيارات الكوكيز
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
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

// @desc    Forgot password
// @route   POST /api/customers/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const customer = await Customer.findOne({ email: req.body.email });

  if (!customer) {
    return next(new ErrorResponse('لا يوجد عميل بهذا البريد الإلكتروني', 404));
  }

  // توليد رمز إعادة تعيين كلمة المرور
  const resetToken = customer.getResetPasswordToken();
  await customer.save({ validateBeforeSave: false });

  // إنشاء رابط إعادة التعيين
  const resetUrl = `${req.protocol}://${req.get('host')}/api/customers/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: customer.email,
      subject: 'Password reset token',
      message
    });

    res.status(20).json({ success: true, data: 'Token sent to email' });
  } catch (err) {
    console.log(err);
    customer.resetPasswordToken = undefined;
    customer.resetPasswordExpire = undefined;

    await customer.save({ validateBeforeSave: false });

    return next(new ErrorResponse('حدث خطأ أثناء إرسال البريد الإلكتروني', 500));
  }
});

// @desc    Reset password
// @route   PUT /api/customers/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // تشفير التوكن
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  // العثور على العميل باستخدام التوكن وتحقق من انتهاء الصلاحية
  const customer = await Customer.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!customer) {
    return next(new ErrorResponse('التوكن غير صحيح أو منتهي الصلاحية', 400));
  }

  // تعيين كلمة المرور الجديدة
 customer.password = req.body.password;

  // تعيين الحقول إلى undefined
  customer.resetPasswordToken = undefined;
 customer.resetPasswordExpire = undefined;

  await customer.save();

  const token = customer.getSignedJwtToken();

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

// @desc    Logout customer
// @route   GET /api/customers/logout
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
