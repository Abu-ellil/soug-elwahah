/**
 * @file modules/orders/routes.js - Order routes
 * @description.routes لإدارة الطلبات
 */

const express = require('express');
const { auth, authorize } = require('../../middleware/auth');
const { 
  getAllOrders, 
  getOrderById, 
  createOrder, 
  updateOrder, 
  deleteOrder,
  getOrdersByCustomer,
  getOrdersByStore,
  getOrdersByDriver,
  updateOrderStatus
} = require('./controller');

const router = express.Router();

// @route   GET api/orders
// @desc    Get all orders
// @access  Private/Admin
router.get('/', auth, authorize('admin'), getAllOrders);

// @route   GET api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', auth, getOrderById);

// @route   POST api/orders
// @desc    Create new order
// @access  Private/Customer
router.post('/', auth, createOrder);

// @route   PUT api/orders/:id
// @desc    Update order
// @access  Private
router.put('/:id', auth, updateOrder);

// @route   DELETE api/orders/:id
// @desc    Delete order
// @access  Private/Admin
router.delete('/:id', auth, authorize('admin'), deleteOrder);

// @route   GET api/orders/customer/:customerId
// @desc    Get orders by customer
// @access  Private
router.get('/customer/:customerId', auth, getOrdersByCustomer);

// @route   GET api/orders/store/:storeId
// @desc    Get orders by store
// @access  Private
router.get('/store/:storeId', auth, getOrdersByStore);

// @route   GET api/orders/driver/:driverId
// @desc    Get orders by driver
// @access  Private
router.get('/driver/:driverId', auth, getOrdersByDriver);

// @route   PUT api/orders/:id/status
// @desc    Update order status
// @access  Private
router.put('/:id/status', auth, updateOrderStatus);

module.exports = router;