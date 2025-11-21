/**
 * @file modules/payments/controller.js - Payment controller
 * @description وحدة التحكم لإدارة المدفوعات
 */

const Transaction = require('../../models/Transaction');
const Order = require('../../models/Order');
const User = require('../../models/User');
const asyncHandler = require('../../middleware/async');
const ErrorResponse = require('../../utils/errorResponse');

// @desc    Process payment
// @route   POST /api/payments/process
// @access  Private
exports.processPayment = asyncHandler(async (req, res, next) => {
  const { orderId, method, amount } = req.body;

  // التحقق من وجود الطلب
  const order = await Order.findById(orderId);
  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${orderId}`, 404));
  }

  // التحقق من أن المستخدم هو صاحب الطلب
  if (order.customer.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to pay for this order', 403));
  }

 // التحقق من أن الحالة تسمح بالدفع
  if (order.status !== 'pending') {
    return next(new ErrorResponse('Cannot process payment for this order status', 400));
  }

  // التحقق من المبلغ
  if (amount !== order.totalAmount) {
    return next(new ErrorResponse('Payment amount does not match order total', 400));
  }

  // محاكاة الدفع (Paymob/Fawry)
  // في الإنتاج، سيتم استدعاء واجهة الدفع الحقيقية
  let paymentResult;
  if (method === 'paymob' || method === 'fawry' || method === 'wallet' || method === 'cash') {
    // محاكاة نجاح الدفع
    paymentResult = {
      success: true,
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      reference: `ref_${Date.now()}`,
      method: method
    };
  } else {
    return next(new ErrorResponse('Invalid payment method', 400));
  }

  if (paymentResult.success) {
    // خصم من المحفظة إذا تم استخدامها
    if (method === 'wallet') {
      const user = await User.findById(req.user.id);
      if (user.wallet < amount) {
        return next(new ErrorResponse('Insufficient wallet balance', 400));
      }
      user.wallet -= amount;
      await user.save();
    }

    // إنشاء معاملة
    const transaction = await Transaction.create({
      user: req.user.id,
      order: orderId,
      type: 'payment',
      amount: amount,
      method: method,
      status: 'completed',
      transactionId: paymentResult.transactionId,
      reference: paymentResult.reference
    });

    // تحديث حالة الطلب
    order.payment.status = 'completed';
    order.status = 'confirmed';
    await order.save();

    res.status(200).json({
      success: true,
      data: {
        transaction,
        order: order,
        message: 'Payment processed successfully'
      }
    });
  } else {
    // في حالة فشل الدفع، نحتاج إلى معالجة الخطأ
    const transaction = await Transaction.create({
      user: req.user.id,
      order: orderId,
      type: 'payment',
      amount: amount,
      method: method,
      status: 'failed',
      transactionId: paymentResult.transactionId || null,
      reference: paymentResult.reference || null
    });

    res.status(400).json({
      success: false,
      data: {
        transaction,
        message: 'Payment failed'
      }
    });
  }
});

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
exports.getPaymentById = asyncHandler(async (req, res, next) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('order', 'status totalAmount');

  if (!transaction) {
    return next(new ErrorResponse(`Payment not found with id of ${req.params.id}`, 404));
  }

  // التحقق من أن المستخدم مخول برؤية هذه المعاملة
 if (req.user.role !== 'admin' && transaction.user._id.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to view this payment', 403));
  }

  res.status(200).json({
    success: true,
    data: transaction
 });
});

// @desc    Get payments by user
// @route   GET /api/payments/user/:userId
// @access  Private
exports.getPaymentsByUser = asyncHandler(async (req, res, next) => {
 // التحقق من أن المستخدم يطلب معاملاته لنفسه أو هو مسؤول
  if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to view these payments', 403));
  }

  const transactions = await Transaction.find({ user: req.params.userId })
    .populate('order', 'status totalAmount')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: transactions.length,
    data: transactions
 });
});

// @desc    Get payments by order
// @route   GET /api/payments/order/:orderId
// @access  Private
exports.getPaymentsByOrder = asyncHandler(async (req, res, next) => {
 const order = await Order.findById(req.params.orderId);
  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.orderId}`, 404));
  }

 // التحقق من أن المستخدم مخول برؤية معاملات هذا الطلب
  if (req.user.role !== 'admin' && 
      order.customer.toString() !== req.user.id && 
      order.store.owner.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to view payments for this order', 403));
  }

  const transactions = await Transaction.find({ order: req.params.orderId })
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: transactions.length,
    data: transactions
 });
});

// @desc    Refund payment
// @route   PUT /api/payments/:id/refund
// @access  Private/Admin
exports.refundPayment = asyncHandler(async (req, res, next) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    return next(new ErrorResponse(`Payment not found with id of ${req.params.id}`, 404));
  }

  // التحقق من أن المستخدم مسؤول
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Only admins can process refunds', 403));
  }

  // التحقق من حالة المعاملة
  if (transaction.status !== 'completed') {
    return next(new ErrorResponse('Cannot refund a payment that is not completed', 400));
  }

  // محاكاة استرداد المبلغ
  // في الإنتاج، سيتم استدعاء واجهة استرداد المبلغ الحقيقية
  const refundResult = {
    success: true,
    refundId: `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    message: 'Refund processed successfully'
  };

  if (refundResult.success) {
    // تحديث حالة المعاملة
    transaction.status = 'refunded';
    await transaction.save();

    // إضافة المبلغ إلى محفظة المستخدم إذا تم الدفع باستخدام المحفظة
    if (transaction.method === 'wallet') {
      const user = await User.findById(transaction.user);
      user.wallet += transaction.amount;
      await user.save();
    }

    // تحديث حالة الطلب
    const order = await Order.findById(transaction.order);
    if (order) {
      order.status = 'cancelled';
      order.payment.status = 'refunded';
      await order.save();
    }

    res.status(20).json({
      success: true,
      data: {
        transaction,
        message: refundResult.message
      }
    });
  } else {
    res.status(400).json({
      success: false,
      data: {
        message: 'Refund failed'
      }
    });
  }
});