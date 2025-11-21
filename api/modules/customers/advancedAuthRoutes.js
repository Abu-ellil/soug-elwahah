/**
 * @file advancedAuthRoutes.js - Advanced Authentication Routes
 * @description المسارات المتقدمة للمصادقة للعملاء
 */

const express = require('express');
const { body } = require('express-validator');
const {
  advancedLogin,
  socialLogin,
  advancedRegister,
  toggleWishlist,
  getWishlist,
  addReview,
  getReviews,
  toggleFavoriteStore,
  getFavoriteStores
} = require('./advancedAuthController');
const { auth } = require('../../middleware/auth');

const router = express.Router();

// @route   POST api/customers/auth/login
// @desc    تسجيل دخول متقدم (بريد إلكتروني أو رقم هاتف)
// @access  Public
router.post('/auth/login', [
  body('password', 'كلمة المرور مطلوبة').not().isEmpty(),
  body('authProvider', 'نوع المصادقة مطلوب').isIn(['email', 'phone'])
], advancedLogin);

// @route   POST api/customers/auth/social
// @desc    تسجيل دخول بالمصادقة الاجتماعية
// @access  Public
router.post('/auth/social', [
  body('provider', 'مقدم الخدمة مطلوب').isIn(['google', 'facebook', 'apple']),
  body('socialId', 'رقم التعريف مطلوب').not().isEmpty()
], socialLogin);

// @route   POST api/customers/auth/register
// @desc    تسجيل حساب جديد متقدم
// @access  Public
router.post('/auth/register', [
  body('name', 'الاسم مطلوب').not().isEmpty(),
  body('authProvider', 'نوع المصادقة مطلوب').isIn(['email', 'phone', 'google', 'facebook', 'apple'])
], advancedRegister);

// @route   PUT api/customers/wishlist/:productId
// @desc    إضافة/إزالة من قائمة الأمنيات
// @access  Private
router.put('/wishlist/:productId', auth, toggleWishlist);

// @route   GET api/customers/wishlist
// @desc    الحصول على قائمة الأمنيات
// @access  Private
router.get('/wishlist', auth, getWishlist);

// @route   POST api/customers/reviews
// @desc    إضافة أو تحديث تقييم
// @access  Private
router.post('/reviews', auth, [
  body('product', 'المنتج مطلوب').not().isEmpty(),
  body('store', 'المتجر مطلوب').not().isEmpty(),
  body('rating', 'التقييم مطلوب').isInt({ min: 1, max: 5 })
], addReview);

// @route   GET api/customers/reviews
// @desc    الحصول على تقييمات العميل
// @access  Private
router.get('/reviews', auth, getReviews);

// @route   PUT api/customers/favorite-stores/:storeId
// @desc    متابعة/إلغاء متابعة متجر
// @access  Private
router.put('/favorite-stores/:storeId', auth, toggleFavoriteStore);

// @route   GET api/customers/favorite-stores
// @desc    الحصول على المتاجر المفضلة
// @access  Private
router.get('/favorite-stores', auth, getFavoriteStores);

module.exports = router;