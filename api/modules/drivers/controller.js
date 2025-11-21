/**
 * @file driverController.js - Driver Controller for Tawseela Backend
 * @description وحدة التحكم الخاصة بتسجيل وتسجيل دخول السائقين
 */

const Driver = require('../../models/Driver');
const asyncHandler = require('../../middleware/async');
const ErrorResponse = require('../../utils/errorResponse');
const sendEmail = require('../../utils/sendEmail');
const crypto = require('crypto');

// @desc    Register driver
// @route   POST /api/drivers/register
// @access  Public
exports.registerDriver = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, vehicle } = req.body;

  // إنشاء السائق
  const driver = await Driver.create({
    name,
    email,
    password,
    phone,
    vehicle
  });

  // إنشاء التوكن
  const token = driver.getSignedJwtToken();

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
        id: driver._id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        isVerified: driver.isVerified,
        isOnline: driver.isOnline,
        wallet: driver.wallet,
        vehicle: driver.vehicle
      }
    });
});

// @desc    Login driver
// @route   POST /api/drivers/login
// @access  Public
exports.loginDriver = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // التحقق من البريد الإلكتروني وكلمة المرور
  if (!email || !password) {
    return next(new ErrorResponse('الرجاء إدخال البريد الإلكتروني وكلمة المرور', 400));
  }

  // العثور على السائق
  const driver = await Driver.findOne({ email }).select('+password');

  if (!driver) {
    return next(new ErrorResponse('بيانات الاعتماد غير صحيحة', 401));
  }

  // التحقق من كلمة المرور
  const isMatch = await driver.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('بيانات الاعتماد غير صحيحة', 401));
  }

  // إنشاء التوكن
  const token = driver.getSignedJwtToken();

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

  // حذف الحقل المحدد من السائق قبل الإرسال
  driver.password = undefined;

  // إرسال الاستجابة
  res
    .status(200)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      data: {
        id: driver._id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        isVerified: driver.isVerified,
        isOnline: driver.isOnline,
        wallet: driver.wallet,
        vehicle: driver.vehicle
      }
    });
});

// @desc    Get current logged in driver
// @route   GET /api/drivers/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const driver = await Driver.findById(req.driver.id);

  res.status(200).json({
    success: true,
    data: {
      id: driver._id,
      name: driver.name,
      email: driver.email,
      phone: driver.phone,
      isVerified: driver.isVerified,
      isOnline: driver.isOnline,
      wallet: driver.wallet,
      location: driver.location,
      vehicle: driver.vehicle,
      rating: driver.rating,
      totalDeliveries: driver.totalDeliveries
    }
  });
});

// @desc    Update driver details
// @route   PUT /api/drivers/me
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    vehicle: req.body.vehicle,
    location: req.body.location
  };

  // تجاهل الحقول الفارغة
  Object.keys(fieldsToUpdate).forEach(key => {
    if (fieldsToUpdate[key] === undefined) {
      delete fieldsToUpdate[key];
    }
  });

  const driver = await Driver.findByIdAndUpdate(req.driver.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: driver
  });
});

// @desc    Update driver password
// @route   PUT /api/drivers/me/password
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const driver = await Driver.findById(req.driver.id).select('+password');

  // التحقق من كلمة المرور الحالية
  if (!(await driver.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('كلمة المرور غير صحيحة', 401));
  }

  driver.password = req.body.newPassword;
  await driver.save();

  const token = driver.getSignedJwtToken();

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

// @desc    Upload driver documents for verification
// @route   PUT /api/drivers/me/documents
// @access  Private
exports.uploadDocuments = asyncHandler(async (req, res, next) => {
  const { nationalId, license, photo } = req.body;

  const driver = await Driver.findByIdAndUpdate(
    req.driver.id,
    {
      $set: {
        'documents.nationalId': nationalId,
        'documents.license': license,
        'documents.photo': photo,
        'documents.status': 'pending'
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
      documents: driver.documents
    }
 });
});

// @desc    Update driver online status
// @route   PUT /api/drivers/me/online
// @access  Private
exports.updateOnlineStatus = asyncHandler(async (req, res, next) => {
 const { isOnline } = req.body;

  const driver = await Driver.findByIdAndUpdate(
    req.driver.id,
    { isOnline },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: {
      isOnline: driver.isOnline
    }
  });
});

// @desc    Forgot password
// @route   POST /api/drivers/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const driver = await Driver.findOne({ email: req.body.email });

  if (!driver) {
    return next(new ErrorResponse('لا يوجد سائق بهذا البريد الإلكتروني', 404));
  }

  // توليد رمز إعادة تعيين كلمة المرور
 const resetToken = driver.getResetPasswordToken();
  await driver.save({ validateBeforeSave: false });

  // إنشاء رابط إعادة التعيين
  const resetUrl = `${req.protocol}://${req.get('host')}/api/drivers/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: driver.email,
      subject: 'Password reset token',
      message
    });

    res.status(20).json({ success: true, data: 'Token sent to email' });
  } catch (err) {
    console.log(err);
    driver.resetPasswordToken = undefined;
    driver.resetPasswordExpire = undefined;

    await driver.save({ validateBeforeSave: false });

    return next(new ErrorResponse('حدث خطأ أثناء إرسال البريد الإلكتروني', 500));
  }
});

// @desc    Reset password
// @route   PUT /api/drivers/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // تشفير التوكن
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  // العثور على السائق باستخدام التوكن وتحقق من انتهاء الصلاحية
  const driver = await Driver.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!driver) {
    return next(new ErrorResponse('التوكن غير صحيح أو منتهي الصلاحية', 400));
  }

  // تعيين كلمة المرور الجديدة
 driver.password = req.body.password;

  // تعيين الحقول إلى undefined
 driver.resetPasswordToken = undefined;
  driver.resetPasswordExpire = undefined;

 await driver.save();

  const token = driver.getSignedJwtToken();

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

// @desc    Logout driver
// @route   GET /api/drivers/logout
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
