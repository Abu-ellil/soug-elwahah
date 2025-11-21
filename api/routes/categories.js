const express = require('express');
const {
  getAllCategories,
  getCategoryTree,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStatistics,
  getPopularCategories
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validate');

const router = express.Router();

// Public routes
// Get all categories with filtering and pagination
router.get('/', getAllCategories);

// Get category tree (hierarchical structure) - must be before /:id
router.get('/tree', getCategoryTree);

// Get popular categories - must be before /:id
router.get('/popular', getPopularCategories);

// Get category statistics - admin only, must be before /:id
router.get('/admin/statistics', protect, authorize('admin'), getCategoryStatistics);

// Get category by ID or slug - must be last among GET routes
router.get('/:id', [
  param('id').notEmpty().withMessage('Category ID is required'),
  validate
], getCategory);

// Protected routes (require authentication)
router.use(protect);

// Admin only routes
router.use(authorize('admin'));

// Create new category
router.post('/', [
  body('name').notEmpty().withMessage('اسم الفئة مطلوب')
    .isLength({ max: 50 }).withMessage('اسم الفئة لا يجب أن يتجاوز 50 حرف'),
  body('nameEn').optional()
    .isLength({ max: 50 }).withMessage('اسم الفئة بالإنجليزية لا يجب أن يتجاوز 50 حرف'),
  body('description').optional()
    .isLength({ max: 200 }).withMessage('وصف الفئة لا يجب أن يتجاوز 200 حرف'),
  body('type').isIn(['product', 'service', 'both']).withMessage('نوع الفئة غير صحيح'),
  body('parent').optional().isMongoId().withMessage('معرف الفئة الأب غير صحيح'),
  body('icon').optional().isString().withMessage('أيقونة الفئة يجب أن تكون نص'),
  body('color').optional().isString().withMessage('لون الفئة يجب أن يكون نص'),
  body('sortOrder').optional().isNumeric().withMessage('ترتيب الفئة يجب أن يكون رقم'),
  body('isFeatured').optional().isBoolean().withMessage('حالة الإبراز يجب أن تكون true أو false'),
  validate
], createCategory);

// Update category
router.patch('/:id', [
  param('id').isMongoId().withMessage('معرف الفئة غير صحيح'),
  body('name').optional().notEmpty().withMessage('اسم الفئة مطلوب')
    .isLength({ max: 50 }).withMessage('اسم الفئة لا يجب أن يتجاوز 50 حرف'),
  body('nameEn').optional()
    .isLength({ max: 50 }).withMessage('اسم الفئة بالإنجليزية لا يجب أن يتجاوز 50 حرف'),
  body('description').optional()
    .isLength({ max: 200 }).withMessage('وصف الفئة لا يجب أن يتجاوز 200 حرف'),
  body('type').optional().isIn(['product', 'service', 'both']).withMessage('نوع الفئة غير صحيح'),
  body('parent').optional().isMongoId().withMessage('معرف الفئة الأب غير صحيح'),
  body('icon').optional().isString().withMessage('أيقونة الفئة يجب أن تكون نص'),
  body('color').optional().isString().withMessage('لون الفئة يجب أن يكون نص'),
  body('sortOrder').optional().isNumeric().withMessage('ترتيب الفئة يجب أن يكون رقم'),
  body('isFeatured').optional().isBoolean().withMessage('حالة الإبراز يجب أن تكون true أو false'),
  body('isActive').optional().isBoolean().withMessage('حالة النشاط يجب أن تكون true أو false'),
  validate
], updateCategory);

// Delete category
router.delete('/:id', [
  param('id').isMongoId().withMessage('معرف الفئة غير صحيح'),
  validate
], deleteCategory);

module.exports = router;