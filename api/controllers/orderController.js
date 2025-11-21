const Order = require("../models/Order");
const Product = require("../models/Product");
const Service = require("../models/Service");
const User = require("../models/User");
const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const ApiResponse = require("../utils/apiResponse");
const ApiFeatures = require("../utils/apiFeatures");

// @desc    Get all orders (admin only)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};

  // Filter by status
  if (req.query.status) {
    filter.status = req.query.status;
  }

  // Date range filter
  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {};
    if (req.query.startDate) {
      filter.createdAt.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      filter.createdAt.$lte = new Date(req.query.endDate);
    }
  }

  const orders = await Order.find(filter)
    .populate("customer", "name email phone avatar")
    .populate("seller", "name email phone avatar")
    .populate("store", "name images")
    .populate("items.product", "title description images price unit")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    pagination: {
      page,
      pages: Math.ceil(total / limit),
      limit,
    },
    data: orders,
  });
});

// @desc    Get user orders (buyer or seller)
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {
    $or: [{ customer: req.user._id }, { seller: req.user._id }],
  };

  // Filter by role (as customer or seller)
  if (req.query.role === "customer") {
    filter.$or = [{ customer: req.user._id }];
  } else if (req.query.role === "seller") {
    filter.$or = [{ seller: req.user._id }];
  }

  // Filter by status
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const orders = await Order.find(filter)
    .populate("customer", "name email phone avatar")
    .populate("seller", "name email phone avatar")
    .populate("store", "name images")
    .populate("items.product", "title description images price unit")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    pagination: {
      page,
      pages: Math.ceil(total / limit),
      limit,
    },
    data: orders,
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("customer", "name email phone avatar")
    .populate("seller", "name email phone avatar")
    .populate("store", "name images")
    .populate("items.product", "title description images price unit");

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  // Check if user is authorized to view this order
  if (
    order.customer._id.toString() !== req.user._id.toString() &&
    order.seller._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new AppError("Not authorized to view this order", 403);
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const {
    items, // Array of items in the order
    deliveryInfo,
    payment,
    notes,
    isUrgent,
    isGift,
    giftMessage,
    store: storeId
  } = req.body;

  // Validate that items exist
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new AppError("Order must contain at least one item", 400);
  }

  // Validate each item in the order
  for (const item of items) {
    if (!item.product || !item.quantity || item.quantity <= 0) {
      throw new AppError("Each item must have a product ID and quantity > 0", 400);
    }
    
    const product = await Product.findById(item.product);
    if (!product) {
      throw new AppError(`Product with ID ${item.product} not found`, 404);
    }
    
    if (product.seller.toString() === req.user._id.toString()) {
      throw new AppError("You cannot order your own products", 400);
    }
    
    // Check stock availability if product has stock tracking
    if (product.stock !== undefined && product.stock < item.quantity) {
      throw new AppError(`Insufficient stock for product ${product.title}`, 400);
    }
  }

  // Get seller from the first product (assuming all products in order are from the same seller)
  const firstProduct = await Product.findById(items[0].product);
  const seller = firstProduct.seller;

  // Generate order number
  const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
  const orderNumber = `ORD-${Date.now()}-${randomString}`;

  // Create order data based on the Order schema
  const orderData = {
    orderNumber,
    customer: req.user._id, // Using customer instead of buyer
    seller: seller,
    items: items.map(item => ({
      product: item.product,
      quantity: item.quantity,
      price: item.price || 0, // Price will be set from product if not provided
      // totalPrice will be calculated by pre-save middleware
      productSnapshot: item.productSnapshot || {} // Historical reference
    })),
    deliveryInfo: deliveryInfo || {
      type: 'pickup' // Default to pickup
    },
    payment: payment || {
      method: 'cash',
      status: 'pending'
    },
    notes: notes || {},
    isUrgent: isUrgent || false,
    isGift: isGift || false,
    giftMessage: giftMessage || ''
  };

  // Add store if provided
  if (storeId) {
    orderData.store = storeId;
  }

  // Create the order
  const newOrder = await Order.create(orderData);

  // Populate the created order for response
  const order = await Order.findById(newOrder._id)
    .populate("customer", "name email phone avatar")
    .populate("seller", "name email phone avatar")
    .populate("store", "name images")
    .populate("items.product", "title description images price unit");

  // Create notification for seller
  await Notification.create({
    recipient: seller,
    title: "طلب جديد",
    message: `لديك طلب جديد من ${req.user.name}`,
    type: "order",
    relatedEntity: {
      entityType: "Order",
      entityId: order._id,
    },
    data: {
      orderId: order._id,
      customerName: req.user.name,
    },
  });

  res.status(201).json({
    success: true,
    data: order,
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access Private
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  // Check authorization
  const isSeller = order.seller.toString() === req.user._id.toString();
  const isCustomer = order.customer.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isSeller && !isCustomer && !isAdmin) {
    throw new AppError("Not authorized to update this order", 403);
  }

  // Validate status transitions
  const validTransitions = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["preparing", "cancelled"],
    preparing: ["ready", "cancelled"],
    ready: ["out_for_delivery", "cancelled"],
    out_for_delivery: ["delivered"],
    delivered: ["completed"],
    completed: [],
    cancelled: [],
    disputed: ["resolved"],
    refunded: []
  };

  if (!validTransitions[order.status].includes(status)) {
    throw new AppError(
      `Cannot change status from ${order.status} to ${status}`,
      400
    );
  }

  // Check who can change to what status
  if (status === "cancelled") {
    // Both customer and seller can cancel, but with restrictions
    if (order.status === "delivered" || order.status === "completed") {
      throw new AppError("Cannot cancel delivered or completed orders", 400);
    }
  } else if (["confirmed", "preparing", "ready", "out_for_delivery"].includes(status)) {
    // Only seller can update to these statuses
    if (!isSeller && !isAdmin) {
      throw new AppError("Only seller can update to this status", 403);
    }
  } else if (status === "delivered") {
    // Only customer can confirm delivery
    if (!isCustomer && !isAdmin) {
      throw new AppError("Only customer can confirm delivery", 403);
    }
  }

  order.status = status;
  order.statusHistory.push({
    status,
    updatedBy: req.user._id,
    timestamp: new Date(),
  });

  // Update payment status for completed orders
  if (status === "completed" && order.payment.method === "cash") {
    order.payment.status = "paid";
    order.payment.paidAt = new Date();
  }

  await order.save();

  // Create notification for the other party
  const notificationRecipient = isSeller ? order.customer : order.seller;
  const statusMessages = {
    confirmed: "تم تأكيد طلبك",
    preparing: "جاري تحضير طلبك",
    ready: "طلبك جاهز للتسليم",
    out_for_delivery: "طلبك في طريقه إليك",
    delivered: "تم تسليم الطلب",
    completed: "تم إكمال الطلب",
    cancelled: "تم إلغاء الطلب",
  };

  // Determine notification type based on status
  // Map order statuses to valid notification types
  const notificationTypeMap = {
    confirmed: 'order_confirmed',
    preparing: 'order_confirmed',  // Map to order_confirmed since there's no order_preparing
    ready: 'order_confirmed',      // Map to order_confirmed since there's no order_ready
    'out_for_delivery': 'order_delivered', // Map to order_delivered since there's no order_out_for_delivery
    delivered: 'order_delivered',
    completed: 'order_completed',
    cancelled: 'order_cancelled',
  };
  
  const notificationType = notificationTypeMap[status] || 'order_confirmed';
  
  // Adjust message if needed for mapped types
  let message = statusMessages[status];
  if (status === 'preparing' || status === 'ready') {
    message = status === 'preparing' ? "جاري تحضير طلبك" : "طلبك جاهز للتسليم";
  }
  
  await Notification.create({
    recipient: notificationRecipient,
    title: "تحديث حالة الطلب",
    message: message,
    type: notificationType,
    relatedEntity: {
      entityType: "Order",
      entityId: order._id,
    },
    data: {
      orderId: order._id,
      status,
      updatedBy: req.user.name,
    },
  });

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Update payment status
// @route   PUT /api/orders/:id/payment
// @access  Private
const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus, transactionId } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  // Check authorization (seller, customer, or admin)
  if (
    order.seller.toString() !== req.user._id.toString() &&
    order.customer.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new AppError("Not authorized to update payment status", 403);
  }

  order.payment.status = paymentStatus;
  if (transactionId) {
    order.payment.transactionId = transactionId;
  }
  order.payment.paidAt = paymentStatus === "paid" ? new Date() : null;

  await order.save();

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Add order review/rating
// @route   POST /api/orders/:id/review
// @access  Private
const addOrderReview = asyncHandler(async (req, res) => {
  const { rating, review } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  // Only customer can review and only for completed orders
  if (order.customer.toString() !== req.user._id.toString()) {
    throw new AppError("Only customer can review the order", 403);
  }

  if (order.status !== "completed") {
    throw new AppError("Can only review completed orders", 400);
  }

  if (order.customerRating && order.customerRating.rating) {
    throw new AppError("Order already reviewed by customer", 400);
  }

  order.customerRating = {
    rating: rating,
    review: review,
    ratedAt: new Date(),
  };

  await order.save();

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private
const getOrderStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const isAdmin = req.user.role === "admin";

  let matchStage = {};

  if (!isAdmin) {
    matchStage = {
      $or: [{ customer: userId }, { seller: userId }],
    };
  }

  const stats = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
        },
        completedOrders: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
        },
        averageOrderValue: { $avg: "$totalAmount" },
      },
    },
  ]);

  // Get orders by status
  const ordersByStatus = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // Recent orders
  const recentOrders = await Order.find(matchStage)
    .populate("customer", "name")
    .populate("seller", "name")
    .populate("items.product", "title")
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      summary: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        averageOrderValue: 0,
      },
      ordersByStatus,
      recentOrders,
    },
  });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  // Check authorization - only customer, seller, or admin can cancel
  const isCustomer = order.customer.toString() === req.user._id.toString();
  const isSeller = order.seller.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isCustomer && !isSeller && !isAdmin) {
    throw new AppError("Not authorized to cancel this order", 403);
  }

  // Check if order can be cancelled (before delivery process starts)
  if (!order.canBeCancelled) {
    throw new AppError("Cannot cancel order at this stage. Delivery process may have started.", 400);
  }

  // Use the model method to cancel the order
  await order.cancelOrder(reason, req.user._id);

  // Create notification for the other party
  const notificationRecipient = isCustomer ? order.seller : order.customer;
  
  await Notification.create({
    recipient: notificationRecipient,
    title: "إلغاء الطلب",
    message: `تم إلغاء الطلب ${order.orderNumber} من قبل ${isCustomer ? 'العميل' : 'البائع'}`,
    type: "order_cancelled",
    relatedEntity: {
      entityType: "Order",
      entityId: order._id,
    },
    data: {
      orderId: order._id,
      status: "cancelled",
      updatedBy: req.user.name,
    },
  });

  res.status(200).json({
    success: true,
    data: order,
  });
});

module.exports = {
  getAllOrders,
  getMyOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  updatePaymentStatus,
  addOrderReview,
  getOrderStats,
  cancelOrder,
};
