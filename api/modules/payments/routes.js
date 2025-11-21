/**
 * @file modules/payments/routes.js - Payment routes
 * @description.routes لإدارة المدفوعات
 */

const express = require('express');
const { auth } = require('../../middleware/auth');
const { 
  processPayment,
  getPaymentById,
  getPaymentsByUser,
  getPaymentsByOrder,
  refundPayment
} = require('./controller');

const router = express.Router();

// @route   POST api/payments/process
// @desc    Process payment
// @access  Private
router.post('/process', auth, processPayment);

// @route   GET api/payments/:id
// @desc    Get payment by ID
// @access  Private
router.get('/:id', auth, getPaymentById);

// @route   GET api/payments/user/:userId
// @desc    Get payments by user
// @access  Private
router.get('/user/:userId', auth, getPaymentsByUser);

// @route   GET api/payments/order/:orderId
// @desc    Get payments by order
// @access  Private
router.get('/order/:orderId', auth, getPaymentsByOrder);

// @route   PUT api/payments/:id/refund
// @desc    Refund payment
// @access  Private/Admin
router.put('/:id/refund', auth, refundPayment);

module.exports = router;