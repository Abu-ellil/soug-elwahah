/**
 * @file modules/auth/controller.js - Authentication controller
 * @description وحدة التحكم للتحقق من الهوية (تسجيل الدخول، تسجيل الخروج، إنشاء حساب)
 */

const User = require('../../models/User');
const asyncHandler = require('../../middleware/async');
const ErrorResponse = require('../../utils/errorResponse');
const logger = require('../../utils/logger');
const sendEmail = require('../../utils/sendEmail');
const crypto = require('crypto');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, role } = req.body;

  // التحقق من أن المستخدم غير مسجل مسبقًا
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorResponse('User already exists with this email', 400));
  }

  // إنشاء المستخدم
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role
  });

  // إنشاء رمز التحقق
  const verificationToken = crypto.randomBytes(20).toString('hex');
  user.verificationToken = verificationToken;
  await user.save();

  // إرسال بريد التحقق (في الإنتاج يجب تفعيل هذا)
  // await sendEmail({
 //   email: user.email,
  //   subject: 'Email Verification',
  //   html: `Please click on the link to verify your email: ${process.env.CLIENT_URL}/verify/${verificationToken}`
  // });

  // إنشاء توكن
  const token = user.getSignedJwtToken();

  // إعداد خصائص الكوكيز
  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 يوم
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified
    },
    message: 'Verification email sent. Please check your inbox.'
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // التحقق من البريد الإلكتروني وكلمة المرور
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // العثور على المستخدم باستخدام البريد الإلكتروني
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

 // التحقق من كلمة المرور
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // التحقق من أن الحساب نشط
  if (!user.isActive) {
    return next(new ErrorResponse('Account is deactivated', 401));
  }

  // التحقق من أن الحساب موثق
  if (!user.isVerified) {
    return next(new ErrorResponse('Please verify your email address', 401));
  }

  // إنشاء توكن
  const token = user.getSignedJwtToken();

  // إعداد خصائص الكوكيز
  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 1000), // 30 يوم
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      isActive: user.isActive
    }
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // 10 ثواني
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      isActive: user.isActive,
      wallet: user.wallet
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // إنشاء رمز استعادة كلمة المرور
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  try {
    const resetUrl = `${process.env.CLIENT_URL}/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click on the following link, or paste this into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`;

    // await sendEmail({
    //   email: user.email,
    //   subject: 'Password reset token',
    //   html: message
    // });

    res.status(200).json({
      success: true,
      data: 'Reset token sent to email'
    });
  } catch (err) {
    logger.error(`Forgot password error: ${err.message}`);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // حساب رمز الاستعادة
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // تعيين كلمة المرور الجديدة
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  const token = user.getSignedJwtToken();

  // إعداد خصائص الكوكيز
  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 1000), // 30 يوم
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    }
  });
});

// @desc    Verify email
// @route   GET /api/auth/verify/:verificationtoken
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  // حساب رمز التحقق
  const verificationToken = crypto
    .createHash('sha256')
    .update(req.params.verificationtoken)
    .digest('hex');

  const user = await User.findOne({
    verificationToken,
  });

  if (!user) {
    return next(new ErrorResponse('Invalid verification token', 400));
  }

  // تفعيل الحساب
  user.isVerified = true;
  user.verificationToken = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Email verified successfully'
  });
});