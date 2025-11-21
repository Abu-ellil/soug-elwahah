/**
 * @file modules/stores/controller.js - Store controller
 * @description وحدة التحكم لإدارة المتاجر
 */

const Store = require('../../models/Store');
const Product = require('../../models/Product');
const User = require('../../models/User');
const asyncHandler = require('../../middleware/async');
const ErrorResponse = require('../../utils/errorResponse');

// @desc    Get all stores
// @route   GET /api/stores
// @access  Public
exports.getAllStores = asyncHandler(async (req, res, next) => {
  const stores = await Store.find().populate('owner', 'name email phone');

  res.status(200).json({
    success: true,
    count: stores.length,
    data: stores
  });
});

// @desc    Get single store
// @route   GET /api/stores/:id
// @access  Public
exports.getStoreById = asyncHandler(async (req, res, next) => {
  const store = await Store.findById(req.params.id).populate('owner', 'name email phone');

  if (!store) {
    return next(new ErrorResponse(`Store not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: store
  });
});

// @desc    Create store
// @route   POST /api/stores
// @access  Private/Store Owner
exports.createStore = asyncHandler(async (req, res, next) => {
  // التحقق من أن المستخدم هو مالك متجر
  if (req.user.role !== 'store_owner') {
    return next(new ErrorResponse('Only store owners can create stores', 403));
  }

  // إضافة مالك المتجر من معلومات المستخدم الحالي
  req.body.owner = req.user.id;

  const store = await Store.create(req.body);

  res.status(201).json({
    success: true,
    data: store
  });
});

// @desc    Update store
// @route   PUT /api/stores/:id
// @access  Private/Store Owner
exports.updateStore = asyncHandler(async (req, res, next) => {
  let store = await Store.findById(req.params.id);

  if (!store) {
    return next(new ErrorResponse(`Store not found with id of ${req.params.id}`, 404));
  }

  // التحقق من أن المستخدم هو مالك المتجر
  if (store.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this store', 403));
  }

  store = await Store.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: store
  });
});

// @desc    Delete store
// @route   DELETE /api/stores/:id
// @access  Private/Store Owner
exports.deleteStore = asyncHandler(async (req, res, next) => {
  const store = await Store.findById(req.params.id);

  if (!store) {
    return next(new ErrorResponse(`Store not found with id of ${req.params.id}`, 404));
  }

  // التحقق من أن المستخدم هو مالك المتجر
  if (store.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this store', 403));
  }

  await store.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get stores by owner
// @route   GET /api/stores/owner/:ownerId
// @access  Private
exports.getStoresByOwner = asyncHandler(async (req, res, next) => {
  // التحقق من أن المستخدم يطلب متاجر لنفسه أو هو مسؤول
 if (req.user.id !== req.params.ownerId && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to view these stores', 403));
  }

  const stores = await Store.find({ owner: req.params.ownerId });

  res.status(200).json({
    success: true,
    count: stores.length,
    data: stores
  });
});

// @desc    Add product to store
// @route   POST /api/stores/:id/products
// @access  Private/Store Owner
exports.addProduct = asyncHandler(async (req, res, next) => {
  const store = await Store.findById(req.params.id);

  if (!store) {
    return next(new ErrorResponse(`Store not found with id of ${req.params.id}`, 404));
  }

  // التحقق من أن المستخدم هو مالك المتجر
  if (store.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to add products to this store', 403));
  }

  // إنشاء المنتج
  const productData = { ...req.body, store: store._id };
  const product = await Product.create(productData);

  // إضافة المنتج إلى المتجر
  store.products.push(product._id);
  await store.save();

  res.status(201).json({
    success: true,
    data: product
  });
});

// @desc    Update product in store
// @route   PUT /api/stores/:storeId/products/:productId
// @access  Private/Store Owner
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const store = await Store.findById(req.params.storeId);

  if (!store) {
    return next(new ErrorResponse(`Store not found with id of ${req.params.storeId}`, 404));
  }

  // التحقق من أن المستخدم هو مالك المتجر
  if (store.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update products in this store', 403));
  }

  // تحديث المنتج
  const product = await Product.findByIdAndUpdate(
    req.params.productId,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.productId}`, 404));
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Delete product from store
// @route   DELETE /api/stores/:storeId/products/:productId
// @access  Private/Store Owner
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const store = await Store.findById(req.params.storeId);

  if (!store) {
    return next(new ErrorResponse(`Store not found with id of ${req.params.storeId}`, 404));
  }

  // التحقق من أن المستخدم هو مالك المتجر
  if (store.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete products from this store', 403));
  }

  const product = await Product.findById(req.params.productId);

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.productId}`, 404));
  }

  // حذف المنتج من المتجر
  store.products.pull(product._id);
  await store.save();

  await product.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});