/**
 * @file specificAuthController.js - Specific Authentication Controller for Tawseela Backend
 * @description وحدة التحكم للتحقق من الهوية الخاصة بأنواع المستخدمين المختلفة
 */

const Customer = require("../../models/Customer");
const Driver = require("../../models/Driver");
const StoreOwner = require("../../models/StoreOwner");
const Admin = require("../../models/Admin"); // Assuming you have an Admin model
const asyncHandler = require("../../middleware/async");
const ErrorResponse = require("../../utils/errorResponse");
const sendEmail = require("../../utils/sendEmail");
const crypto = require("crypto");

// Helper function to select the appropriate model based on user type
const getUserModel = (userType) => {
  if (!userType) return null;
  switch (userType.toLowerCase()) {
    case "customer":
      return Customer;
    case "driver":
      return Driver;
    case "storeowner":
      return StoreOwner;
    case "admin":
      return Admin;
    default:
      return null;
  }
};

// Helper function to get the appropriate request field mapping based on user type
const getFieldMapping = (userType, reqBody) => {
  switch (userType.toLowerCase()) {
    case "customer":
      return {
        name: reqBody.name,
        email: reqBody.email,
        password: reqBody.password,
        phone: reqBody.phone,
        // Add other customer-specific fields as needed
      };
    case "driver":
      return {
        name: reqBody.name,
        email: reqBody.email,
        password: reqBody.password,
        phone: reqBody.phone,
        vehicle: reqBody.vehicle ? {
          vehicleType: reqBody.vehicle.type, // Transform 'type' to 'vehicleType'
          make: reqBody.vehicle.make,
          model: reqBody.vehicle.model,
          year: reqBody.vehicle.year,
          color: reqBody.vehicle.color,
          plateNumber: reqBody.vehicle.plateNumber
        } : undefined,
        // Add other driver-specific fields as needed
      };
    case "storeowner":
      return {
        name: reqBody.name,
        email: reqBody.email,
        password: reqBody.password,
        phone: reqBody.phone,
        businessName: reqBody.businessName,
        businessType: reqBody.businessType,
        // Add other store owner-specific fields as needed
      };
    case "admin":
      return {
        name: reqBody.name,
        email: reqBody.email,
        password: reqBody.password,
        phone: reqBody.phone,
        // Add other admin-specific fields as needed
      };
    default:
      return {};
  }
};

// Helper function to get the appropriate response data based on user type
const getResponseData = (userType, user) => {
  switch (userType.toLowerCase()) {
    case "customer":
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        wallet: user.wallet,
        location: user.location,
        defaultAddress: user.defaultAddress,
      };
    case "driver":
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        isOnline: user.isOnline,
        wallet: user.wallet,
        vehicle: user.vehicle,
        rating: user.rating,
        totalDeliveries: user.totalDeliveries,
      };
    case "storeowner":
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        businessName: user.businessName,
        businessType: user.businessType,
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus,
        wallet: user.wallet,
        location: user.location,
        commissionRate: user.commissionRate,
        stores: user.stores,
      };
    case "admin":
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
      };
    default:
      return {};
  }
};

// @desc    Register user based on type
// @route   POST /api/auth/:userType/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  // Determine user type from the request path since routes are defined as /driver/register, /customer/register, etc.
  const path = req.route.path; // e.g., '/register'
  const originalUrl = req.originalUrl; // e.g., '/api/auth/driver/register'
  const userType = originalUrl.split("/")[3]; // Extract user type from URL path

  const UserModel = getUserModel(userType);

  if (!UserModel) {
    return next(new ErrorResponse(`Invalid user type: ${userType}`, 400));
  }

  // Get field mapping based on user type
  const fields = getFieldMapping(userType, req.body);

  // Create the user
  const user = await UserModel.create(fields);

  // Generate token
  const token = user.getSignedJwtToken();

  // Cookie options
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  // Remove secure option in development
  if (process.env.NODE_ENV === "development") {
    delete options.secure;
  }

  // Send response with cookie
  res
    .status(200)
    .cookie("token", token, options)
    .json({
      success: true,
      token,
      data: getResponseData(userType, user),
    });
});

// @desc    Login user based on type
// @route   POST /api/auth/:userType/login
// @access Public
exports.login = asyncHandler(async (req, res, next) => {
  // Determine user type from the request path since routes are defined as /driver/login, /customer/login, etc.
  const originalUrl = req.originalUrl; // e.g., '/api/auth/driver/login'
  const userType = originalUrl.split("/")[3]; // Extract user type from URL path

  const UserModel = getUserModel(userType);

  if (!UserModel) {
    return next(new ErrorResponse(`Invalid user type: ${userType}`, 400));
  }

  const { email, phone, password } = req.body;

  // Check for email/phone and password
  if ((!email && !phone) || !password) {
    return next(new ErrorResponse("Please provide email/phone and password", 400));
  }

  // Find the user by email or phone
  let query = {};
  if (email) {
    query.email = email.toLowerCase();
  } else if (phone) {
    query.phone = phone;
  }

  const user = await UserModel.findOne(query).select("+password");

  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // Check password
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // Generate token
  const token = user.getSignedJwtToken();

  // Cookie options
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  // Remove secure option in development
  if (process.env.NODE_ENV === "development") {
    delete options.secure;
  }

  // Remove password from output before sending
  user.password = undefined;

  // Send response
  res
    .status(200)
    .cookie("token", token, options)
    .json({
      success: true,
      token,
      data: getResponseData(userType, user),
    });
});

// @desc    Get current logged in user based on type
// @route   GET /api/auth/:userType/me
// @access Private
exports.getMe = asyncHandler(async (req, res, next) => {
  // Determine user type from the request path since routes are defined as /driver/me, /customer/me, etc.
  const originalUrl = req.originalUrl; // e.g., '/api/auth/driver/me'
  const userType = originalUrl.split("/")[3]; // Extract user type from URL path

  const UserModel = getUserModel(userType);

  if (!UserModel) {
    return next(new ErrorResponse(`Invalid user type: ${userType}`, 400));
  }

  // req.user, req.driver, req.customer, req.storeOwner are set by different auth middlewares
  // We'll need to access the user from the appropriate request property based on user type
  let user;
  switch (userType.toLowerCase()) {
    case "customer":
      user = await UserModel.findById(req.customer.id);
      break;
    case "driver":
      user = await UserModel.findById(req.driver.id);
      break;
    case "storeowner":
      user = await UserModel.findById(req.storeOwner.id);
      break;
    case "admin":
      user = await UserModel.findById(req.admin.id);
      break;
    default:
      return next(new ErrorResponse(`Invalid user type: ${userType}`, 400));
  }

  res.status(200).json({
    success: true,
    data: getResponseData(userType, user),
  });
});

// @desc    Update user details based on type
// @route   PUT /api/auth/:userType/me
// @access Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  // Determine user type from the request path since routes are defined as /driver/me, /customer/me, etc.
  const originalUrl = req.originalUrl; // e.g., '/api/auth/driver/me'
  const userType = originalUrl.split("/")[3]; // Extract user type from URL path

  const UserModel = getUserModel(userType);

  if (!UserModel) {
    return next(new ErrorResponse(`Invalid user type: ${userType}`, 400));
  }

  const fieldsToUpdate = getFieldMapping(userType, req.body);

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach((key) => {
    if (fieldsToUpdate[key] === undefined) {
      delete fieldsToUpdate[key];
    }
  });

  let user;
  switch (userType.toLowerCase()) {
    case "customer":
      user = await UserModel.findByIdAndUpdate(
        req.customer.id,
        fieldsToUpdate,
        {
          new: true,
          runValidators: true,
        }
      );
      break;
    case "driver":
      user = await UserModel.findByIdAndUpdate(req.driver.id, fieldsToUpdate, {
        new: true,
        runValidators: true,
      });
      break;
    case "storeowner":
      user = await UserModel.findByIdAndUpdate(
        req.storeOwner.id,
        fieldsToUpdate,
        {
          new: true,
          runValidators: true,
        }
      );
      break;
    case "admin":
      user = await UserModel.findByIdAndUpdate(req.admin.id, fieldsToUpdate, {
        new: true,
        runValidators: true,
      });
      break;
    default:
      return next(new ErrorResponse(`Invalid user type: ${userType}`, 40));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update user password based on type
// @route   PUT /api/auth/:userType/me/password
// @access Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  // Determine user type from the request path since routes are defined as /driver/me/password, /customer/me/password, etc.
  const originalUrl = req.originalUrl; // e.g., '/api/auth/driver/me/password'
  const userType = originalUrl.split("/")[3]; // Extract user type from URL path

  const UserModel = getUserModel(userType);

  if (!UserModel) {
    return next(new ErrorResponse(`Invalid user type: ${userType}`, 400));
  }

  let user;
  switch (userType.toLowerCase()) {
    case "customer":
      user = await UserModel.findById(req.customer.id).select("+password");
      break;
    case "driver":
      user = await UserModel.findById(req.driver.id).select("+password");
      break;
    case "storeowner":
      user = await UserModel.findById(req.storeOwner.id).select("+password");
      break;
    case "admin":
      user = await UserModel.findById(req.admin.id).select("+password");
      break;
    default:
      return next(new ErrorResponse(`Invalid user type: ${userType}`, 400));
  }

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("Password is incorrect", 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  const token = user.getSignedJwtToken();

  // Cookie options
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  // Remove secure option in development
  if (process.env.NODE_ENV === "development") {
    delete options.secure;
  }

  res.status(200).cookie("token", token, options).json({
    success: true,
    token,
  });
});

// @desc    Forgot password based on type
// @route   POST /api/auth/:userType/forgotpassword
// @access Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // Determine user type from the request path since routes are defined as /driver/forgotpassword, /customer/forgotpassword, etc.
  const originalUrl = req.originalUrl; // e.g., '/api/auth/driver/forgotpassword'
  const userType = originalUrl.split("/")[3]; // Extract user type from URL path

  const UserModel = getUserModel(userType);

  if (!UserModel) {
    return next(new ErrorResponse(`Invalid user type: ${userType}`, 400));
  }

  const { email, phone } = req.body;
  
  // Find user by email or phone
  let query = {};
  if (email) {
    query.email = email.toLowerCase();
  } else if (phone) {
    query.phone = phone;
  } else {
    return next(new ErrorResponse("Please provide email or phone", 400));
  }

  const user = await UserModel.findOne(query);

  if (!user) {
    return next(new ErrorResponse(`No ${userType} found with this email/phone`, 404));
  }

  // Get reset password token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/auth/${userType}/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message,
    });

    res.status(200).json({ success: true, data: "Token sent to email" });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

// @desc    Reset password based on type
// @route   PUT /api/auth/:userType/resetpassword/:resettoken
// @access Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Determine user type from the request path since routes are defined as /driver/resetpassword, /customer/resetpassword, etc.
  const originalUrl = req.originalUrl; // e.g., '/api/auth/driver/resetpassword/sometoken'
  const userType = originalUrl.split("/")[3]; // Extract user type from URL path

  const UserModel = getUserModel(userType);

  if (!UserModel) {
    return next(new ErrorResponse(`Invalid user type: ${userType}`, 400));
  }

  // Get reset token from params and hash it
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  // Find user with hashed token and check if it's not expired
  const user = await UserModel.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse("Invalid or expired token", 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  const token = user.getSignedJwtToken();

  // Cookie options
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  // Remove secure option in development
  if (process.env.NODE_ENV === "development") {
    delete options.secure;
  }

  res.status(200).cookie("token", token, options).json({
    success: true,
    token,
  });
});

// @desc    Logout user based on type
// @route   GET /api/auth/:userType/logout
// @access Private
exports.logout = asyncHandler(async (req, res, next) => {
  // Determine user type from the request path since routes are defined as /driver/logout, /customer/logout, etc.
  // (Although we don't need the user type for logout, we extract it to be consistent with other functions)
  const originalUrl = req.originalUrl; // e.g., '/api/auth/driver/logout'
  const userType = originalUrl.split("/")[3]; // Extract user type from URL path

  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000), // expires after 10 seconds
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});
