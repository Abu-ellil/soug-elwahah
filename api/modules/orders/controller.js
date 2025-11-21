/**
 * @file modules/orders/controller.js - Order controller
 * @description وحدة التحكم لإدارة الطلبات
 */

const Order = require('../../models/Order');
const Product = require('../../models/Product');
const User = require('../../models/User');
const Store = require('../../models/Store');
const asyncHandler = require('../../middleware/async');
const ErrorResponse = require('../../utils/errorResponse');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find()
    .populate('customer', 'name email phone')
    .populate('store', 'name owner')
    .populate('driver', 'name email phone');

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('customer', 'name email phone')
    .populate('store', 'name owner')
    .populate('driver', 'name email phone')
    .populate('items.product', 'name price');

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  // التحقق من أن المستخدم مخول برؤية هذا الطلب
  if (req.user.role !== 'admin' && 
      order.customer.toString() !== req.user.id && 
      order.store.owner.toString() !== req.user.id && 
      (order.driver && order.driver._id.toString() !== req.user.id)) {
    return next(new ErrorResponse('Not authorized to view this order', 403));
  }

  res.status(200).json({
    success: true,
    data: order
 });
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private/Customer
exports.createOrder = asyncHandler(async (req, res, next) => {
  const { store, items, deliveryLocation, paymentMethod } = req.body;

 // التحقق من أن المستخدم عميل
  if (req.user.role !== 'customer') {
    return next(new ErrorResponse('Only customers can create orders', 403));
  }

 // التحقق من وجود المتجر
  const storeDoc = await Store.findById(store);
  if (!storeDoc) {
    return next(new ErrorResponse(`Store not found with id of ${store}`, 404));
  }

  // التحقق من توفر المنتجات
  const orderItems = [];
  let totalAmount = 0;

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      return next(new ErrorResponse(`Product not found with id of ${item.product}`, 404));
    }

    // التحقق من توفر الكمية في المخزون
    if (product.stock < item.quantity) {
      return next(new ErrorResponse(`Insufficient stock for product: ${product.name}`, 400));
    }

    // تقليل الكمية من المخزون
    product.stock -= item.quantity;
    await product.save();

    orderItems.push({
      product: product._id,
      quantity: item.quantity,
      price: product.price
    });

    totalAmount += product.price * item.quantity;
  }

  // حساب رسوم التوصيل (يمكن تعديلها حسب المسافة أو المنطقة)
  const deliveryFee = 15; // قيمة تجريبية، يمكن حسابها ديناميكيًا لاحقًا
  totalAmount += deliveryFee;

  // إنشاء الطلب
  const orderData = {
    customer: req.user.id,
    store,
    items: orderItems,
    deliveryLocation,
    payment: {
      method: paymentMethod,
      status: 'pending',
      amount: totalAmount
    },
    deliveryFee,
    totalAmount
  };

  const order = await Order.create(orderData);

  // إرسال إشعار إلى المتجر
 // سيتم تنفيذ هذا في Socket.io لاحقًا

  res.status(201).json({
    success: true,
    data: order
  });
});

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private
exports.updateOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  // التحقق من أن المستخدم مخول بتحديث هذا الطلب
  if (req.user.role !== 'admin' && 
      order.customer.toString() !== req.user.id && 
      order.store.owner.toString() !== req.user.id && 
      (order.driver && order.driver._id.toString() !== req.user.id)) {
    return next(new ErrorResponse('Not authorized to update this order', 403));
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  )
  .populate('customer', 'name email phone')
  .populate('store', 'name owner')
  .populate('driver', 'name email phone');

  res.status(20).json({
    success: true,
    data: updatedOrder
  });
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
exports.deleteOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  await order.remove();

  res.status(20).json({
    success: true,
    data: {}
  });
});

// @desc    Get orders by customer
// @route   GET /api/orders/customer/:customerId
// @access  Private
exports.getOrdersByCustomer = asyncHandler(async (req, res, next) => {
  // التحقق من أن المستخدم يطلب طلبات لنفسه أو هو مسؤول
  if (req.user.id !== req.params.customerId && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to view these orders', 403));
  }

  const orders = await Order.find({ customer: req.params.customerId })
    .populate('store', 'name')
    .populate('driver', 'name email phone');

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// @desc    Get orders by store
// @route   GET /api/orders/store/:storeId
// @access  Private
exports.getOrdersByStore = asyncHandler(async (req, res, next) => {
  const store = await Store.findById(req.params.storeId);
  
  if (!store) {
    return next(new ErrorResponse(`Store not found with id of ${req.params.storeId}`, 404));
  }

  // التحقق من أن المستخدم هو مالك المتجر أو مسؤول
  if (store.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to view these orders', 403));
  }

  const orders = await Order.find({ store: req.params.storeId })
    .populate('customer', 'name email phone')
    .populate('driver', 'name email phone');

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// @desc    Get orders by driver
// @route   GET /api/orders/driver/:driverId
// @access  Private
exports.getOrdersByDriver = asyncHandler(async (req, res, next) => {
  // التحقق من أن المستخدم يطلب طلبات لنفسه أو هو مسؤول
  if (req.user.id !== req.params.driverId && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to view these orders', 403));
  }

  const orders = await Order.find({ driver: req.params.driverId })
    .populate('customer', 'name email phone')
    .populate('store', 'name');

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
 });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  // التحقق من صحة الحالة
  const validStatuses = ['pending', 'confirmed', 'preparing', 'on_way', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return next(new ErrorResponse(`Invalid status. Valid statuses are: ${validStatuses.join(', ')}`, 400));
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  // التحقق من أن المستخدم مخول بتحديث حالة هذا الطلب
  if (req.user.role !== 'admin' && 
      order.customer.toString() !== req.user.id && 
      order.store.owner.toString() !== req.user.id && 
      (order.driver && order.driver._id.toString() !== req.user.id)) {
    return next(new ErrorResponse('Not authorized to update this order status', 403));
  }

  // في حالة التسليم، نحتاج للتحقق من بعض الشروط
  if (status === 'delivered') {
    // يمكن إضافة منطق إضافي هنا
    order.payment.status = 'completed';
  } else if (status === 'cancelled') {
    // في حالة الإلغاء، قد نحتاج لاسترجاع المنتجات إلى المخزون
    if (order.status !== 'delivered' && order.status !== 'cancelled') {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }
    order.payment.status = 'cancelled';
  }

  order.status = status;
  order.updatedAt = Date.now();

  await order.save();

  // إرسال إشعار عن تغيير الحالة
  // سيتم تنفيذ هذا في Socket.io لاحقًا

  res.status(200).json({
    success: true,
    data: order
 });
});