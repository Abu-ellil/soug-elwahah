/**
 * @file modules/users/controller.js - User controller
 * @description وحدة التحكم لإدارة المستخدمين
 */

const User = require('../../models/User');
const asyncHandler = require('../../middleware/async');
const ErrorResponse = require('../../utils/errorResponse');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().select('-password');

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
exports.getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).select('-password');

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

 await user.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Update user location
// @route   PUT /api/users/:id/location
// @access  Private
exports.updateLocation = asyncHandler(async (req, res, next) => {
  const { coordinates, address } = req.body;

  // التحقق من صحة الإحداثيات
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
    return next(new ErrorResponse('Please provide valid coordinates [longitude, latitude]', 400));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      location: {
        type: 'Point',
        coordinates: coordinates, // [longitude, latitude]
        address: address
      }
    },
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

 res.status(200).json({
    success: true,
    data: user
  });
});