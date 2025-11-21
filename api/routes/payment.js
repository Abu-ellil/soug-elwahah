const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createPaymentIntent,
  processPayment,
  getPaymentMethods,
  addPaymentMethod,
  getWallet,
  addFundsToWallet,
  processRefund,
  getTransactionHistory,
  getPayment,
  getPaymentStats
} = require('../controllers/paymentController');

const router = express.Router();

// Payment intents
router.route('/intent')
  .post(protect, createPaymentIntent);

// Process payments
router.route('/')
  .post(protect, processPayment);

// Payment methods
router.route('/methods')
  .get(protect, getPaymentMethods)
  .post(protect, addPaymentMethod);

// Wallet operations
router.route('/wallet')
  .get(protect, getWallet);

router.route('/wallet/add-funds')
  .post(protect, addFundsToWallet);

// Refunds
router.route('/refund')
  .post(protect, authorize('admin', 'store'), processRefund);

// Transaction history
router.route('/transactions')
  .get(protect, getTransactionHistory);

// Single payment
router.route('/:id')
  .get(protect, getPayment);

// Payment statistics (admin only)
router.route('/stats')
  .get(protect, authorize('admin'), getPaymentStats);

module.exports = router;
