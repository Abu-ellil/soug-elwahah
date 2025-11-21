const User = require('../models/User');
const AppError = require('../utils/appError');
const { createSendToken } = require('../utils/jwt');
const { generateOTP, hashOTP, verifyOTP, sendOTP } = require('../utils/otp');
const jwt = require('jsonwebtoken');

/**
 * Register a new user with multi-role support
 */
const registerUser = async (userData) => {
  const { firstName, lastName, email, phone, password, coordinates, role } = userData;

  if (!firstName || !lastName || !phone || !password || !coordinates) {
    throw new AppError('الاسم الأول والأخير ورقم الهاتف وكلمة المرور وإحداثيات الموقع مطلوبة', 400);
  }

  // Validate phone number format
  const phoneRegex = /^(\+20|0)?1[0-9]{9}$/;
  if (!phoneRegex.test(phone)) {
    throw new AppError('رقم الهاتف غير صحيح', 400);
  }

  // Check if phone already exists
  const existingUser = await User.findOne({ phone });
  if (existingUser) {
    throw new AppError('رقم الهاتف مسجل بالفعل', 400);
  }

  // Determine roles based on input
  let roles = ['customer']; // Default role
 if (role === 'store' || role === 'seller') {
    roles.push('store');
 } else if (role === 'driver') {
    roles = ['driver']; // For drivers, set only driver role
  }

  // Create user with complete profile
 const user = await User.create({
    name: `${firstName} ${lastName}`,
    phone,
    email,
    password,
    location: {
      type: 'Point',
      coordinates: coordinates
    },
    roles,
    activeRole: roles[0], // Set first role as active
    // Set driver approval status for driver accounts
    driverApprovalStatus: roles.includes('driver') ? 'pending' : 'approved'
  });

  return user;
};

/**
 * Resend OTP for phone verification
 */
const resendPhoneVerificationOTP = async (phoneNumber) => {
  // Validate phone number format
  const phoneRegex = /^(\+20|0)?1[0-9]{9}$/;
  if (!phoneRegex.test(phoneNumber)) {
    throw new AppError('رقم الهاتف غير صحيح', 400);
  }

  // Find user
  const user = await User.findOne({ phone: phoneNumber }).select('+phoneOTP +phoneOTPExpires +phoneOTPAttempts');

  if (!user) {
    throw new AppError('لم يتم العثور على المستخدم', 404);
  }

  // Check if user has existing OTP that hasn't expired yet
  if (user.phoneOTP && user.phoneOTPExpires > Date.now()) {
    const remainingTime = Math.ceil((user.phoneOTPExpires - Date.now()) / (1000 * 60));
    throw new AppError(`رمز التحقق لا يزال نشطًا. يرجى الانتظار ${remainingTime} دقيقة قبل المحاولة مجددًا`, 429);
  }

  // Generate new OTP
  const otp = generateOTP();
  const hashedOTP = hashOTP(otp);

  // Update user with new OTP
  user.phoneOTP = hashedOTP;
  user.phoneOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  user.phoneOTPAttempts = 0; // Reset attempts when resending
  await user.save({ validateBeforeSave: false });

  // Send OTP via SMS
 try {
    await sendOTP(phoneNumber, otp);
  } catch (error) {
    user.phoneOTP = undefined;
    user.phoneOTPExpires = undefined;
    await user.save({ validateBeforeSave: false });

    throw new AppError('فشل في إرسال رمز التحقق، يرجى المحاولة لاحقاً', 500);
  }

  return {
    phoneNumber,
    expiresIn: '10 دقائق'
  };
};

/**
 * Refresh JWT token
 */
const refreshToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError('Please provide refresh token', 401);
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError('The user belonging to this token no longer exists', 401);
    }

    // Check if refresh token is still valid
    if (user.changedPasswordAfter(decoded.iat)) {
      throw new AppError('User recently changed password. Please log in again', 401);
    }

    return user;
  } catch (error) {
    throw new AppError('Invalid refresh token', 401);
  }
};

/**
 * Login user with multi-role support
 */
const loginUser = async (credentials) => {
  const { email, phone, password } = credentials;

  // Validate that either email or phone and password exist
  if ((!email && !phone) || !password) {
    throw new AppError('يرجى إدخال البريد الإلكتروني أو رقم الهاتف وكلمة المرور', 400);
  }

  // Determine if login is by email or phone
  let query = {};
  if (email) {
    query = { email: email };
  } else if (phone) {
    query = { phone: phone };
  }

  // Check if user exists and password is correct
  const user = await User.findOne(query).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    throw new AppError('البريد الإلكتروني أو رقم الهاتف أو كلمة المرور غير صحيحة', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AppError('تم تعطيل حسابك. يرجى الاتصال بالدعم', 401);
  }

  // Check driver approval status if user has driver role
  if (user.roles.includes('driver') && user.driverApprovalStatus !== 'approved') {
    if (user.driverApprovalStatus === 'pending') {
      throw new AppError('حسابك قيد المراجعة. سيتم إعلامك عند اكتمال المراجعة.', 401);
    } else if (user.driverApprovalStatus === 'rejected') {
      throw new AppError('تم رفض حسابك. يرجى الاتصال بالدعم للحصول على مزيد من المعلومات.', 401);
    }
  }

  return user;
};

/**
 * Send OTP for phone verification
 */
const sendPhoneVerificationOTP = async (phoneNumber) => {
  // Validate phone number format
  const phoneRegex = /^(\+20|0)?1[0-9]{9}$/;
  if (!phoneRegex.test(phoneNumber)) {
    throw new AppError('رقم الهاتف غير صحيح', 400);
  }

  // Check if user exists
  let user = await User.findOne({ phone: phoneNumber }).select('+phoneOTP +phoneOTPExpires +phoneOTPAttempts');

  // Check OTP attempts limit
  if (user && user.phoneOTPAttempts >= 5 && user.phoneOTPExpires > Date.now()) {
    const remainingTime = Math.ceil((user.phoneOTPExpires - Date.now()) / (1000 * 60));
    throw new AppError(`تم تجاوز عدد المحاولات المسموح. حاول مرة أخرى بعد ${remainingTime} دقيقة`, 429);
  }

  // Generate OTP
  const otp = generateOTP();
  const hashedOTP = hashOTP(otp);

  if (user) {
    // Update existing user
    user.phoneOTP = hashedOTP;
    user.phoneOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    user.phoneOTPAttempts = user.phoneOTPAttempts >= 5 ? 1 : user.phoneOTPAttempts + 1;
    await user.save({ validateBeforeSave: false });
  } else {
    // Create new user with OTP
    user = await User.create({
      phone: phoneNumber,
      phoneOTP: hashedOTP,
      phoneOTPExpires: Date.now() + 10 * 60 * 1000,
      phoneOTPAttempts: 1,
      name: '' // Will be set during profile completion
    });
  }

  // Send OTP via SMS
  try {
    await sendOTP(phoneNumber, otp);
  } catch (error) {
    user.phoneOTP = undefined;
    user.phoneOTPExpires = undefined;
    await user.save({ validateBeforeSave: false });

    throw new AppError('فشل في إرسال رمز التحقق، يرجى المحاولة لاحقاً', 500);
  }

  return {
    phoneNumber,
    expiresIn: '10 دقائق'
  };
};

/**
 * Verify OTP and authenticate user
 */
const verifyPhoneOTP = async (phoneNumber, otp) => {
  // Find user with phone number
  const user = await User.findOne({ phone: phoneNumber })
    .select('+phoneOTP +phoneOTPExpires +phoneOTPAttempts');

  if (!user) {
    throw new AppError('لم يتم العثور على المستخدم', 404);
  }

  // Check if OTP exists and not expired
  if (!user.phoneOTP || user.phoneOTPExpires < Date.now()) {
    throw new AppError('رمز التحقق منتهي الصلاحية', 400);
  }

  // Verify OTP
  const isValidOTP = verifyOTP(otp, user.phoneOTP);
  if (!isValidOTP) {
    throw new AppError('رمز التحقق غير صحيح', 400);
  }

  // Clear OTP fields and mark phone as verified
  user.phoneOTP = undefined;
  user.phoneOTPExpires = undefined;
  user.phoneOTPAttempts = 0;
  user.isPhoneVerified = true;
  user.isVerified = true;
  await user.save({ validateBeforeSave: false });

  return user;
};

/**
 * Complete user profile after OTP verification
 */
const completeUserProfile = async (userId, profileData) => {
  const { name, address, businessName, businessType, role } = profileData;

  if (!name) {
    throw new AppError('الاسم مطلوب', 400);
  }

  // Determine roles based on business information
  let roles = ['customer']; // Default role
  if (businessName) {
    roles.push('store');
  }
  if (role === 'driver') {
    roles = ['driver']; // For drivers, set only driver role
  }

  // Update user profile
  const user = await User.findByIdAndUpdate(
    userId,
    {
      name,
      address,
      businessName,
      businessType,
      roles,
      activeRole: roles[0], // Set first role as active
      role: businessName ? 'seller' : 'user', // Legacy role for backward compatibility
      // Set driver approval status for driver accounts
      driverApprovalStatus: roles.includes('driver') ? 'pending' : 'approved'
    },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  return user;
};

/**
 * Switch user's active role
 */
const switchUserRole = async (userId, targetRole) => {
  if (!targetRole) {
    throw new AppError('الدور المطلوب مفقود', 400);
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  // Check if user has the requested role
  if (!user.roles.includes(targetRole)) {
    throw new AppError('لا يمكنك التبديل إلى هذا الدور', 403);
  }

  // Update active role
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { activeRole: targetRole },
    { new: true, runValidators: true }
  );

  return updatedUser;
};

/**
 * Get user permissions for active role
 */
const getUserPermissions = (user) => {
  const permissions = user.permissions || [];

  return {
    activeRole: user.activeRole,
    permissions
  };
};

module.exports = {
  registerUser,
  loginUser,
  sendPhoneVerificationOTP,
  verifyPhoneOTP,
 completeUserProfile,
  switchUserRole,
  getUserPermissions,
  resendPhoneVerificationOTP,
  refreshToken
};
