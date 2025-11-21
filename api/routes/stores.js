const express = require('express');

// Import only the functions that exist in storeController
const {
  getStore,
  createStore,
  updateStore,
  getStoreProducts
} = require('../controllers/storeController');

// Create placeholder functions for missing controller functions
const getAllStores = (req, res, next) => {
  res.status(501).json({
    success: false,
    message: 'Function not implemented yet'
  });
};

const deleteStore = (req, res, next) => {
  res.status(501).json({
    success: false,
    message: 'Function not implemented yet'
  });
};

const toggleFollowStore = (req, res, next) => {
 res.status(501).json({
    success: false,
    message: 'Function not implemented yet'
  });
};

const getStoreServices = (req, res, next) => {
  res.status(501).json({
    success: false,
    message: 'Function not implemented yet'
  });
};

const getStoreStats = (req, res, next) => {
 res.status(501).json({
    success: false,
    message: 'Function not implemented yet'
  });
};

const searchStores = (req, res, next) => {
  res.status(501).json({
    success: false,
    message: 'Function not implemented yet'
  });
};

const router = express.Router();

// Middleware to protect routes and allow only authenticated users
const { protect } = require('../middleware/auth');

// @route    GET /api/v1/stores
// @desc     Get all stores
// @access   Public
router.get('/', getAllStores);

// @route    GET /api/v1/stores/my-store 
// @desc     Get logged in user's store
// @access   Private
router.get('/my-store', protect, async (req, res, next) => {
  try {
    const Store = require('../models/Store');
    const store = await Store.findOne({ owner: req.user._id });
    
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: store
    });
  } catch (error) {
    next(error);
 }
});

// @route    PUT /api/v1/stores/my-store
// @desc     Update logged in user's store
// @access   Private
router.put('/my-store', protect, async (req, res, next) => {
  try {
    const Store = require('../models/Store');
    let store = await Store.findOne({ owner: req.user._id });
    
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }
    
    // Update store with the request body
    store = await Store.findOneAndUpdate(
      { owner: req.user._id },
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate("owner", "name profilePicture");
    
    res.status(200).json({
      success: true,
      data: store
    });
  } catch (error) {
    next(error);
  }
});

// @route    GET /api/v1/stores/:id
// @desc     Get store by ID
// @access   Public
router.get('/:id', getStore);

// @route    POST /api/v1/stores
// @desc     Create store
// @access   Private
router.post('/', protect, createStore);

// @route    PUT /api/v1/stores/:id
// @desc     Update store
// @access   Private
router.put('/:id', protect, updateStore);

// @route    DELETE /api/v1/stores/:id
// @desc     Delete store
// @access   Private
router.delete('/:id', protect, deleteStore);

// @route    PUT /api/v1/stores/:id/follow
// @desc     Follow/unfollow store
// @access   Private
router.put('/:id/follow', protect, toggleFollowStore);

// @route    GET /api/v1/stores/:id/products
// @desc     Get store products
// @access   Public
router.get('/:id/products', getStoreProducts);

// @route    GET /api/v1/stores/:id/services
// @desc     Get store services
// @access   Public
router.get('/:id/services', getStoreServices);

// @route    GET /api/v1/stores/:id/stats
// @desc     Get store statistics
// @access   Private
router.get('/:id/stats', protect, getStoreStats);

// @route    GET /api/v1/stores/search
// @desc     Search stores
// @access   Public
router.get('/search', searchStores);

module.exports = router;
