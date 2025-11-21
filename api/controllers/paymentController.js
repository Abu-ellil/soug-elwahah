const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const ApiResponse = require('../utils/apiResponse');

// @desc    Create payment intent (for Stripe)
// @route   POST /api/payment/intent
// @access  Private
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { amount, currency = 'EGP', orderId } = req.body;

  // Validate required fields
  if (!amount || amount <= 0) {
    throw new AppError('Amount is required and must be positive', 400);
  }

  if (!orderId) {
    throw new AppError('Order ID is required', 400);
  }

  // Verify order exists and belongs to user
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

 if (order.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to create payment for this order', 403);
  }

  if (order.totalAmount !== amount) {
    throw new AppError('Amount mismatch with order total', 400);
  }

  // In a real implementation, you would integrate with Stripe here
  // For now, we'll return a mock payment intent
  const paymentIntent = {
    id: `pi_${Math.random().toString(36).substring(2, 15)}`,
    amount: amount,
    currency: currency,
    client_secret: `pi_${Math.random().toString(36).substring(2, 15)}_secret_${Math.random().toString(36).substring(2, 15)}`,
    status: 'requires_payment_method'
  };

  res.status(200).json(
    ApiResponse.success('Payment intent created successfully', paymentIntent)
  );
});

// @desc    Process payment
// @route   POST /api/payment
// @access  Private
const processPayment = asyncHandler(async (req, res) => {
  const { orderId, method, amount, paymentData } = req.body;

  // Validate required fields
  if (!orderId || !method || !amount) {
    throw new AppError('Order ID, method, and amount are required', 400);
  }

  // Verify order exists and belongs to user
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to process payment for this order', 403);
  }

  if (order.totalAmount !== amount) {
    throw new AppError('Amount mismatch with order total', 400);
  }

  // Check if payment already exists for this order
  const existingPayment = await Payment.findOne({ order: orderId });
  if (existingPayment && existingPayment.status !== 'failed') {
    throw new AppError('Payment already exists for this order', 400);
  }

  // Handle different payment methods
  let paymentStatus = 'processing';
  let transactionId = null;
 let gatewayResponse = null;

  if (method === 'wallet') {
    // Process wallet payment
    const wallet = await Wallet.getOrCreate(req.user._id);
    
    if (wallet.balance < amount) {
      throw new AppError('Insufficient wallet balance', 400);
    }

    // Deduct from wallet
    await wallet.deductFunds(
      amount,
      `Order payment for ${order.orderNumber}`,
      order._id,
      'Order'
    );

    paymentStatus = 'paid';
    transactionId = `WALLET-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  } else if (method === 'cash') {
    // Cash payment - mark as paid immediately
    paymentStatus = 'paid';
    transactionId = `CASH-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  } else {
    // For other methods (card, mobile wallet, etc.), you would integrate with payment gateway
    // For now, simulate processing
    transactionId = `TRX-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    gatewayResponse = paymentData || { status: 'pending', message: 'Payment processing' };
  }

  // Create payment record
  const payment = await Payment.create({
    order: orderId,
    customer: req.user._id,
    store: order.store,
    amount: amount,
    currency: order.currency || 'EGP',
    method: method,
    status: paymentStatus,
    transactionId: transactionId,
    referenceNumber: order.orderNumber,
    gatewayResponse: gatewayResponse,
    metadata: {
      orderId: order.orderNumber,
      customerName: req.user.name,
      customerPhone: req.user.phone,
      items: order.items.map(item => ({
        productId: item.product,
        productName: item.productSnapshot?.title || 'Unknown Product',
        quantity: item.quantity,
        price: item.price
      }))
    }
  });

  // Update order payment status if payment is successful
 if (paymentStatus === 'paid') {
    order.payment = {
      ...order.payment,
      status: 'paid',
      paidAmount: amount,
      paidAt: new Date(),
      transactionId: transactionId
    };
    await order.save();

    // Create notification for store owner
    await Notification.create({
      recipient: order.seller,
      title: 'Payment Received',
      message: `Payment of ${amount} ${order.currency} received for order ${order.orderNumber}`,
      type: 'payment_received',
      relatedEntity: {
        entityType: 'Order',
        entityId: order._id
      },
      data: {
        orderId: order._id,
        paymentId: payment._id,
        amount: amount
      }
    });
  }

  res.status(200).json(
    ApiResponse.success('Payment processed successfully', { payment })
  );
});

// @desc    Get user payment methods
// @route   GET /api/payment/methods
// @access  Private
const getPaymentMethods = asyncHandler(async (req, res) => {
  // In a real implementation, you would fetch saved payment methods from payment gateway
  // For now, return available payment methods based on user preferences and system settings
  
  const user = await User.findById(req.user._id);
  const wallet = await Wallet.getOrCreate(req.user._id);

  const availableMethods = [
    {
      method: 'wallet',
      name: 'Digital Wallet',
      available: true,
      balance: wallet.balance,
      currency: wallet.currency
    },
    {
      method: 'cash',
      name: 'Cash on Delivery',
      available: true
    },
    {
      method: 'card',
      name: 'Credit/Debit Card',
      available: true
    },
    {
      method: 'mobile_wallet',
      name: 'Mobile Wallet',
      available: true
    }
  ];

  res.status(200).json(
    ApiResponse.success('Payment methods retrieved successfully', availableMethods)
  );
});

// @desc    Add payment method
// @route   POST /api/payment/methods
// @access  Private
const addPaymentMethod = asyncHandler(async (req, res) => {
  const { method, token, metadata } = req.body;

  // In a real implementation, you would save the payment method to payment gateway
  // For now, return success with mock data
  
  const newMethod = {
    id: `pm_${Math.random().toString(36).substring(2, 15)}`,
    method: method,
    isDefault: false,
    addedAt: new Date(),
    metadata: metadata || {}
  };

  res.status(200).json(
    ApiResponse.success('Payment method added successfully', newMethod)
  );
});

// @desc    Get wallet balance
// @route   GET /api/payment/wallet
// @access  Private
const getWallet = asyncHandler(async (req, res) => {
  const wallet = await Wallet.getOrCreate(req.user._id);

  res.status(200).json(
    ApiResponse.success('Wallet retrieved successfully', {
      balance: wallet.balance,
      currency: wallet.currency,
      isActive: wallet.isActive,
      isFrozen: wallet.isFrozen,
      transactions: wallet.getRecentTransactions(10)
    })
  );
});

// @desc    Add funds to wallet
// @route   POST /api/payment/wallet/add-funds
// @access  Private
const addFundsToWallet = asyncHandler(async (req, res) => {
  const { amount, paymentMethod, paymentToken } = req.body;

  if (!amount || amount <= 0) {
    throw new AppError('Amount is required and must be positive', 400);
  }

  const wallet = await Wallet.getOrCreate(req.user._id);

  // In a real implementation, you would process the payment through the selected method
  // For now, simulate adding funds
  
  const transaction = await wallet.addFunds(
    amount,
    'Funds added to wallet',
    null,
    null
  );

  res.status(200).json(
    ApiResponse.success('Funds added to wallet successfully', {
      wallet: {
        balance: wallet.balance,
        currency: wallet.currency
      },
      transaction
    })
  );
});

// @desc    Process refund
// @route   POST /api/payment/refund
// @access  Private (Admin/Store owner)
const processRefund = asyncHandler(async (req, res) => {
  const { paymentId, amount, reason } = req.body;

  if (!paymentId || !amount || !reason) {
    throw new AppError('Payment ID, amount, and reason are required', 40);
  }

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  // Check authorization - admin or store owner
  const isAuthorized = req.user.role === 'admin' || 
    (payment.store && payment.store.toString() === req.user._id.toString());
  
  if (!isAuthorized) {
    throw new AppError('Not authorized to process refund', 403);
  }

  if (payment.status !== 'paid') {
    throw new AppError('Cannot refund a payment that is not paid', 400);
  }

  if (amount > payment.amount) {
    throw new AppError('Refund amount cannot exceed payment amount', 400);
  }

  // Process refund
  const refundResult = await payment.processRefund(amount, reason);

  // If original payment was from wallet, add funds back to customer's wallet
  if (payment.method === 'wallet') {
    const customerWallet = await Wallet.getOrCreate(payment.customer);
    await customerWallet.addFunds(
      amount,
      `Refund for payment ${payment.paymentId}`,
      payment._id,
      'Payment'
    );
  }

  // Create notification for customer
 await Notification.create({
    recipient: payment.customer,
    title: 'Payment Refunded',
    message: `Refund of ${amount} ${payment.currency} processed for payment ${payment.paymentId}`,
    type: 'payment_refunded',
    relatedEntity: {
      entityType: 'Payment',
      entityId: payment._id
    },
    data: {
      paymentId: payment._id,
      refundAmount: amount,
      reason: reason
    }
  });

  res.status(200).json(
    ApiResponse.success('Refund processed successfully', { payment: refundResult })
  );
});

// @desc    Get transaction history
// @route   GET /api/payment/transactions
// @access  Private
const getTransactionHistory = asyncHandler(async (req, res) => {
  const { status, startDate, endDate, limit = 20, page = 1 } = req.query;
  const skip = (page - 1) * limit;

  const filter = { customer: req.user._id };

  if (status) {
    filter.status = status;
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const payments = await Payment.find(filter)
    .populate('order', 'orderNumber totalAmount status')
    .populate('store', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Payment.countDocuments(filter);

  res.status(200).json(
    ApiResponse.success('Transaction history retrieved successfully', {
      transactions: payments,
      total,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    })
  );
});

// @desc    Get payment by ID
// @route   GET /api/payment/:id
// @access  Private
const getPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('order', 'orderNumber totalAmount status')
    .populate('customer', 'name email phone')
    .populate('store', 'name');

  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  // Check authorization
  if (payment.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to view this payment', 403);
  }

  res.status(200).json(
    ApiResponse.success('Payment retrieved successfully', { payment })
  );
});

// @desc    Get payment statistics
// @route   GET /api/payment/stats
// @access  Private (Admin only)
const getPaymentStats = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    throw new AppError('Admin access required', 403);
  }

  const { startDate, endDate } = req.query;
  const filter = {};

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const stats = await Payment.getStatistics(filter);
 const dailyRevenue = await Payment.getDailyRevenue(30);

  res.status(200).json(
    ApiResponse.success('Payment statistics retrieved successfully', {
      summary: stats,
      dailyRevenue
    })
  );
});

module.exports = {
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
};
