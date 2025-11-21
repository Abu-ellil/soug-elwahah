/**
 * @file modules/users/routes.js - User routes
 * @description.routes لإدارة المستخدمين
 */

const express = require('express');
const { auth, authorize } = require('../../middleware/auth');
const { 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser,
  updateLocation
} = require('./controller');

const router = express.Router();

// @route   GET api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', auth, authorize('admin'), getAllUsers);

// @route   GET api/users/:id
// @desc    Get single user
// @access  Private
router.get('/:id', auth, getUserById);

// @route   PUT api/users/:id
// @desc    Update user
// @access  Private
router.put('/:id', auth, updateUser);

// @route   DELETE api/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/:id', auth, authorize('admin'), deleteUser);

// @route   PUT api/users/:id/location
// @desc    Update user location
// @access  Private
router.put('/:id/location', auth, updateLocation);

module.exports = router;