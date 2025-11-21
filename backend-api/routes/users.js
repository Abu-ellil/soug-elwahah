const express = require('express');
const userController = require('../controllers/userController');
const { protect, authorize, requirePermission } = require('../middleware/auth');
const { protectWithMultiRole, authorizeForApp } = require('../middleware/multiRoleAuth');

const router = express.Router();

// Public routes
router.get('/search', userController.searchUsers);

// Protected routes - only authenticated users
router.use(protect);

// Get user routes
router.get('/', authorize('admin'), userController.getAllUsers);
router.get('/me', userController.getProfileByRole); // Get own profile based on active role
router.get('/:id', userController.getUserById);
router.get('/:id/products', userController.getUserProducts);
router.get('/:id/services', userController.getUserServices);
router.get('/:id/orders', userController.getUserOrders);
router.get('/:id/reviews', userController.getUserReviews);
router.get('/:id/statistics', userController.getUserStatistics);

// Update user routes
router.patch('/me', userController.updateProfileByRole); // Update own profile based on active role
router.patch('/:id', authorize('admin'), userController.updateUser);

// Admin only routes
router.delete('/:id', authorize('admin'), userController.deleteUser);
router.patch('/:id/toggle-block', authorize('admin'), userController.toggleUserBlock);
router.get('/:id/nearby', authorize('admin'), userController.getNearbyUsers);

module.exports = router;