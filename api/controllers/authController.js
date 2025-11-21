const User = require('../models/User');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const { createSendToken } = require('../utils/jwt');
const jwt = require('jsonwebtoken');
const authService = require('../services/authService');

/**
 * Register new user with complete profile
 */
const register = asyncHandler(async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body);
    // Create and send token
    createSendToken(user, 201, res, 'تم التسجيل بنجاح');
  } catch (error) {
    return next(error);
  }
});

/**
 * Send OTP for phone verification (Registration/Login)
 */
const sendPhoneOTP = asyncHandler(async (req, res, next) => {
  try {
    const result = await authService.sendPhoneVerificationOTP(req.body.phoneNumber);
    
    res.status(200).json(
      ApiResponse.success('تم إرسال رمز التحقق بنجاح', result)
    );
  } catch (error) {
    return next(error);
  }
});

/**
 * Resend OTP
 */
const resendOTP = asyncHandler(async (req, res, next) => {
  try {
    const result = await authService.resendPhoneVerificationOTP(req.body.phoneNumber);
    
    res.status(200).json(
      ApiResponse.success('تم إعادة إرسال رمز التحقق بنجاح', result)
    );
  } catch (error) {
    return next(error);
  }
});

/**
 * Verify OTP and login/register user
 */
const verifyPhoneOTP = asyncHandler(async (req, res, next) => {
  try {
    const user = await authService.verifyPhoneOTP(req.body.phoneNumber, req.body.otp);
    
    // Check if profile is complete
    const isProfileComplete = !!user.name;

    // Create and send token
    createSendToken(user, 200, res, isProfileComplete ? 'تم تسجيل الدخول بنجاح' : 'تم التحقق من الهاتف، يرجى إكمال الملف الشخصي');
  } catch (error) {
    return next(error);
  }
});

/**
 * Refresh JWT token
 */
const refreshToken = asyncHandler(async (req, res, next) => {
  const token = req.body.refreshToken || req.cookies.refreshToken;

  if (!token) {
    return next(new AppError('Please provide refresh token', 401));
  }

  try {
    const user = await authService.refreshToken(token);
    // Create new tokens
    createSendToken(user, 200, res, 'Token refreshed successfully');
  } catch (error) {
    return next(error);
  }
});

/**
 * Complete user profile after OTP verification
 */
const completeProfile = asyncHandler(async (req, res, next) => {
  try {
    const user = await authService.completeUserProfile(req.user._id, req.body);
    
    res.status(200).json(
      ApiResponse.success('تم إكمال الملف الشخصي بنجاح', { user })
    );
  } catch (error) {
    return next(error);
  }
});

/**
 * Switch user's active role
 */
const switchActiveRole = asyncHandler(async (req, res, next) => {
  try {
    const user = await authService.switchUserRole(req.user._id, req.body.targetRole);
    
    res.status(200).json(
      ApiResponse.success('تم تغيير الدور بنجاح', { user })
    );
  } catch (error) {
    return next(error);
  }
});

/**
 * Get user permissions for active role
 */
const getUserPermissions = asyncHandler(async (req, res, next) => {
 try {
    const permissions = authService.getUserPermissions(req.user);
    
    res.status(200).json(
      ApiResponse.success('تم جلب الصلاحيات بنجاح', permissions)
    );
  } catch (error) {
    return next(error);
  }
});

/**
 * Get current user profile
 */
const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id)
    .populate('products')
    .populate('services');

  res.status(200).json(
    ApiResponse.success('تم جلب بيانات المستخدم بنجاح', { user })
  );
});

/**
 * Update user profile
 */
const updateProfile = asyncHandler(async (req, res, next) => {
  // Fields that can be updated
  const allowedFields = ['name', 'email', 'bio', 'address', 'businessName', 'businessType', 'settings'];
  const updates = {};

  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  // Update role based on business info
  if (updates.businessName) {
    updates.role = 'seller';
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  );

  res.status(200).json(
    ApiResponse.success('تم تحديث الملف الشخصي بنجاح', { user })
  );
});

/**
 * Update user location
 */
const updateLocation = asyncHandler(async (req, res, next) => {
  const { coordinates, address } = req.body;

  if (!coordinates || coordinates.length !== 2) {
    return next(new AppError('إحداثيات الموقع مطلوبة (خط الطول، خط العرض)', 400));
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      location: {
        type: 'Point',
        coordinates: coordinates
      },
      address: address || user.address
    },
    { new: true, runValidators: true }
  );

  res.status(200).json(
    ApiResponse.success('تم تحديث الموقع بنجاح', { 
      location: user.location,
      address: user.address 
    })
  );
});

/**
 * Change user role (admin only)
 */
const changeUserRole = asyncHandler(async (req, res, next) => {
  const { userId, role } = req.body;

  if (!userId || !role) {
    return next(new AppError('معرف المستخدم والدور مطلوبان', 400));
  }

  const validRoles = ['user', 'seller', 'admin'];
  if (!validRoles.includes(role)) {
    return next(new AppError('الدور المحدد غير صحيح', 400));
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new AppError('لم يتم العثور على المستخدم', 404));
  }

  res.status(200).json(
    ApiResponse.success('تم تغيير دور المستخدم بنجاح', { user })
  );
});

/**
 * Deactivate user account
 */
const deactivateAccount = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { 
    active: false,
    isActive: false 
  });

  res.status(200).json(
    ApiResponse.success('تم إلغاء تفعيل الحساب بنجاح')
  );
});

/**
 * Logout user
 */
const logout = asyncHandler(async (req, res, next) => {
  // Clear cookies
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.cookie('refreshToken', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json(
    ApiResponse.success('تم تسجيل الخروج بنجاح')
  );
});

/**
 * Get user statistics (admin only)
 */
const getUserStats = asyncHandler(async (req, res, next) => {
  const stats = await User.getStatistics();
  
  res.status(200).json(
    ApiResponse.success('تم جلب إحصائيات المستخدمين بنجاح', { stats })
  );
});

/**
 * Approve a driver account
 */
const approveDriver = asyncHandler(async (req, res, next) => {
 const { id: userId } = req.params;
  const { notes } = req.body;

  const user = await User.findByIdAndUpdate(
    userId,
    {
      driverApprovalStatus: 'approved',
      driverApprovalDate: new Date(),
      driverApprovalNotes: notes || null
    },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new AppError('المستخدم غير موجود', 404));
  }

 if (!user.roles.includes('driver')) {
    return next(new AppError('هذا المستخدم ليس سائقاً', 400));
  }

  res.status(200).json(
    ApiResponse.success('تمت الموافقة على حساب السائق بنجاح', { user })
  );
});

/**
 * Reject a driver account
 */
const rejectDriver = asyncHandler(async (req, res, next) => {
  const { id: userId } = req.params;
  const { notes } = req.body;

  const user = await User.findByIdAndUpdate(
    userId,
    {
      driverApprovalStatus: 'rejected',
      driverApprovalDate: new Date(),
      driverApprovalNotes: notes || null
    },
    { new: true, runValidators: true }
 );

  if (!user) {
    return next(new AppError('المستخدم غير موجود', 404));
  }

 if (!user.roles.includes('driver')) {
    return next(new AppError('هذا المستخدم ليس سائقاً', 400));
  }

  res.status(20).json(
    ApiResponse.success('تم رفض حساب السائق بنجاح', { user })
  );
});

/**
 * Get pending driver accounts for approval
 */
const getPendingDrivers = asyncHandler(async (req, res, next) => {
  const drivers = await User.find({
    roles: { $in: ['driver'] },
    driverApprovalStatus: 'pending'
  }).sort({ createdAt: -1 });

  res.status(200).json(
    ApiResponse.success('تم جلب السائقين المعلقين بنجاح', { drivers, count: drivers.length })
  );
});
// Login with email/password or phone/password
const login = asyncHandler(async (req, res, next) => {
  try {
    const user = await authService.loginUser(req.body);
    // Create and send token
    createSendToken(user, 200, res, 'تم تسجيل الدخول بنجاح');
  } catch (error) {
    return next(error);
  }
});

module.exports = {
  register,
  login,
  sendPhoneOTP,
  verifyPhoneOTP,
  resendOTP,
  refreshToken,
  completeProfile,
  getMe,
  updateProfile,
  updateLocation,
  changeUserRole,
  deactivateAccount,
  logout,
  getUserStats,
  switchActiveRole,
  getUserPermissions,
  approveDriver,
  rejectDriver,
  getPendingDrivers
};
