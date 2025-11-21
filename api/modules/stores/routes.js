/**
 * @file modules/stores/routes.js - Store routes
 * @description.routes لإدارة المتاجر
 */

const express = require('express');
const { auth, authorize } = require('../../middleware/auth');
const { 
  getAllStores, 
  getStoreById, 
  createStore, 
  updateStore, 
  deleteStore,
  getStoresByOwner,
  addProduct,
  updateProduct,
  deleteProduct
} = require('./controller');

const router = express.Router();

// @route   GET api/stores
// @desc    Get all stores
// @access  Public
router.get('/', getAllStores);

// @route   GET api/stores/:id
// @desc    Get single store
// @access  Public
router.get('/:id', getStoreById);

// @route   POST api/stores
// @desc    Create store
// @access  Private/Store Owner
router.post('/', auth, authorize('store_owner'), createStore);

// @route   PUT api/stores/:id
// @desc    Update store
// @access  Private/Store Owner
router.put('/:id', auth, updateStore);

// @route   DELETE api/stores/:id
// @desc    Delete store
// @access  Private/Store Owner
router.delete('/:id', auth, deleteStore);

// @route   GET api/stores/owner/:ownerId
// @desc    Get stores by owner
// @access  Private
router.get('/owner/:ownerId', auth, getStoresByOwner);

// @route   POST api/stores/:id/products
// @desc    Add product to store
// @access  Private/Store Owner
router.post('/:id/products', auth, authorize('store_owner'), addProduct);

// @route   PUT api/stores/:storeId/products/:productId
// @desc    Update product in store
// @access  Private/Store Owner
router.put('/:storeId/products/:productId', auth, authorize('store_owner'), updateProduct);

// @route   DELETE api/stores/:storeId/products/:productId
// @desc    Delete product from store
// @access  Private/Store Owner
router.delete('/:storeId/products/:productId', auth, authorize('store_owner'), deleteProduct);

module.exports = router;