const User = require('../models/User');
const Order = require('../models/Order');
const Delivery = require('../models/Delivery');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get nearby orders for drivers
// @route   GET /api/driver/orders/nearby
// @access  Private (Driver only)
const getNearbyOrders = asyncHandler(async (req, res) => {
  const { coordinates, radius = 1000, limit = 20, page = 1 } = req.query;
  const skip = (page - 1) * limit;

 if (!coordinates) {
    throw new AppError('Coordinates are required', 400);
  }

  const [longitude, latitude] = coordinates.split(',').map(Number);

  if (!longitude || !latitude) {
    throw new AppError('Valid coordinates (longitude, latitude) are required', 40);
  }

  // Check if user is a driver
  if (!req.user.roles.includes('driver')) {
    throw new AppError('Only drivers can access nearby orders', 403);
  }

  const orders = await Order.find({
    status: { $in: ['pending', 'confirmed', 'preparing'] },
    'deliveryInfo.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: parseInt(radius)
      }
    }
  })
  .populate('customer', 'name phone avatar')
  .populate('store', 'name')
  .populate('items.product', 'title description')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(parseInt(limit));

  const total = await Order.countDocuments({
    status: { $in: ['pending', 'confirmed', 'preparing'] },
    'deliveryInfo.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: parseInt(radius)
      }
    }
  });

  res.status(200).json(
    ApiResponse.success('Nearby orders retrieved successfully', {
      orders,
      total,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    })
  );
});

// @desc    Bid on an order
// @route   POST /api/driver/orders/:orderId/bid
// @access  Private (Driver only)
const bidOnOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { bidPrice, estimatedDeliveryTime } = req.body;

  if (!bidPrice || bidPrice <= 0) {
    throw new AppError('Bid price is required and must be positive', 400);
  }

  // Check if user is a driver
  if (!req.user.roles.includes('driver')) {
    throw new AppError('Only drivers can bid on orders', 403);
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

 if (!['pending', 'confirmed'].includes(order.status)) {
    throw new AppError('Cannot bid on this order status', 400);
  }

  // Check if driver has already bid
  const existingBid = order.bids?.find(bid => bid.driver.toString() === req.user._id.toString());
  if (existingBid) {
    throw new AppError('You have already bid on this order', 400);
  }

  // Add bid to order
  if (!order.bids) {
    order.bids = [];
  }

  order.bids.push({
    driver: req.user._id,
    price: bidPrice,
    estimatedDeliveryTime: estimatedDeliveryTime,
    createdAt: new Date()
  });

  await order.save();

  // Create notification for customer
  await Notification.create({
    recipient: order.customer,
    title: 'New Bid on Your Order',
    message: `Driver ${req.user.name} has placed a bid of ${bidPrice} EGP on your order`,
    type: 'order_bid',
    relatedEntity: {
      entityType: 'Order',
      entityId: order._id
    },
    data: {
      orderId: order._id,
      driverId: req.user._id,
      bidPrice: bidPrice
    }
  });

  res.status(200).json(
    ApiResponse.success('Bid placed successfully', { order })
  );
});

// @desc    Update bid price
// @route   PUT /api/driver/orders/:orderId/bid
// @access  Private (Driver only)
const updateBid = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { bidPrice, estimatedDeliveryTime } = req.body;

  if (!bidPrice || bidPrice <= 0) {
    throw new AppError('Bid price is required and must be positive', 400);
  }

  // Check if user is a driver
 if (!req.user.roles.includes('driver')) {
    throw new AppError('Only drivers can update bids', 403);
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Find existing bid
  const bidIndex = order.bids?.findIndex(bid => 
    bid.driver.toString() === req.user._id.toString()
  );

  if (bidIndex === -1) {
    throw new AppError('You have not bid on this order', 400);
  }

  // Update bid
  order.bids[bidIndex].price = bidPrice;
  order.bids[bidIndex].estimatedDeliveryTime = estimatedDeliveryTime;
  order.bids[bidIndex].updatedAt = new Date();

  await order.save();

  res.status(200).json(
    ApiResponse.success('Bid updated successfully', { order })
  );
});

// @desc    Get driver orders
// @route   GET /api/driver/orders
// @access  Private (Driver only)
const getDriverOrders = asyncHandler(async (req, res) => {
  const { status, sortBy = 'createdAt', limit = 20, page = 1 } = req.query;
  const skip = (page - 1) * limit;

 // Check if user is a driver
 if (!req.user.roles.includes('driver')) {
    throw new AppError('Only drivers can access their orders', 403);
  }

  let query = { 'deliveryAssignment.assignedDriver': req.user._id };
  if (status) {
    query.status = status;
 }

  let sort = {};
  switch (sortBy) {
    case 'newest':
      sort = { createdAt: -1 };
      break;
    case 'oldest':
      sort = { createdAt: 1 };
      break;
    case 'amount-high':
      sort = { totalAmount: -1 };
      break;
    case 'amount-low':
      sort = { totalAmount: 1 };
      break;
    default:
      sort = { createdAt: -1 };
      break;
  }

  const orders = await Order.find(query)
    .populate('customer', 'name phone')
    .populate('store', 'name')
    .populate('items.product', 'title description')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Order.countDocuments(query);

  res.status(200).json(
    ApiResponse.success('Driver orders retrieved successfully', {
      orders,
      total,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    })
  );
});

// @desc    Update order status
// @route   PUT /api/driver/orders/:orderId/status
// @access  Private (Driver only)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const validStatuses = ['out_for_delivery', 'delivered', 'cancelled'];

  if (!status || !validStatuses.includes(status)) {
    throw new AppError('Invalid status. Valid statuses: ' + validStatuses.join(', '), 40);
  }

  // Check if user is a driver
  if (!req.user.roles.includes('driver')) {
    throw new AppError('Only drivers can update order status', 403);
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

 // Check if driver is assigned to this order
  if (order.deliveryAssignment?.assignedDriver.toString() !== req.user._id.toString()) {
    throw new AppError('You are not assigned to this order', 403);
  }

  // Validate status transitions
  const validTransitions = {
    'confirmed': ['out_for_delivery'],
    'preparing': ['out_for_delivery'],
    'ready': ['out_for_delivery'],
    'out_for_delivery': ['delivered', 'cancelled'],
    'delivered': [],
    'cancelled': []
  };

  if (!validTransitions[order.status]?.includes(status)) {
    throw new AppError(`Cannot change status from ${order.status} to ${status}`, 400);
  }

  order.status = status;
 order.statusHistory.push({
    status: status,
    updatedBy: req.user._id,
    timestamp: new Date(),
    note: `Updated by driver`
  });

  if (status === 'delivered') {
    order.deliveredAt = new Date();
  }

  await order.save();

  // Create notification for customer
  const statusMessages = {
    'out_for_delivery': 'Your order is out for delivery',
    'delivered': 'Your order has been delivered',
    'cancelled': 'Your order has been cancelled'
  };

  await Notification.create({
    recipient: order.customer,
    title: 'Order Status Update',
    message: statusMessages[status],
    type: 'order_status',
    relatedEntity: {
      entityType: 'Order',
      entityId: order._id
    },
    data: {
      orderId: order._id,
      status: status,
      updatedBy: req.user.name
    }
  });

  res.status(200).json(
    ApiResponse.success('Order status updated successfully', { order })
  );
});

// @desc    Get driver profile
// @route   GET /api/driver/profile
// @access  Private (Driver only)
const getDriverProfile = asyncHandler(async (req, res) => {
  // Check if user is a driver
  if (!req.user.roles.includes('driver')) {
    throw new AppError('Only drivers can access driver profile', 403);
  }

  const driver = await User.findById(req.user._id)
    .populate('profile.driver.currentDelivery', 'orderId deliveryId');

  res.status(200).json(
    ApiResponse.success('Driver profile retrieved successfully', { driver })
  );
});

// @desc    Update driver profile
// @route   PUT /api/driver/profile
// @access  Private (Driver only)
const updateDriverProfile = asyncHandler(async (req, res) => {
  const { vehicleInfo, licensePlate, capacity } = req.body;

  // Check if user is a driver
  if (!req.user.roles.includes('driver')) {
    throw new AppError('Only drivers can update driver profile', 403);
  }

  const updates = {};
  
  if (vehicleInfo) updates['profile.driver.vehicleInfo'] = vehicleInfo;
 if (licensePlate) updates['profile.driver.vehicleInfo.licensePlate'] = licensePlate;
  if (capacity) updates['profile.driver.vehicleInfo.capacity'] = capacity;

  const driver = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  );

  res.status(200).json(
    ApiResponse.success('Driver profile updated successfully', { driver })
  );
});

// @desc    Update driver availability
// @route   PUT /api/driver/availability
// @access  Private (Driver only)
const updateAvailability = asyncHandler(async (req, res) => {
  const { isAvailable } = req.body;

  if (typeof isAvailable !== 'boolean') {
    throw new AppError('isAvailable must be a boolean', 400);
  }

  // Check if user is a driver
  if (!req.user.roles.includes('driver')) {
    throw new AppError('Only drivers can update availability', 403);
  }

  const driver = await User.findByIdAndUpdate(
    req.user._id,
    { 'profile.driver.isAvailable': isAvailable },
    { new: true, runValidators: true }
  );

  res.status(200).json(
    ApiResponse.success('Availability updated successfully', { 
      isAvailable: driver.profile.driver.isAvailable 
    })
  );
});

// @desc    Get driver earnings
// @route   GET /api/driver/earnings
// @access  Private (Driver only)
const getEarnings = asyncHandler(async (req, res) => {
 // Check if user is a driver
 if (!req.user.roles.includes('driver')) {
    throw new AppError('Only drivers can access earnings', 403);
  }

  const { period = 'month', startDate, endDate } = req.query;

  let dateFilter = {};
  
  if (startDate || endDate) {
    dateFilter = {
      deliveredAt: {}
    };
    if (startDate) dateFilter.deliveredAt.$gte = new Date(startDate);
    if (endDate) dateFilter.deliveredAt.$lte = new Date(endDate);
  } else {
    // Default to current period
    const now = new Date();
    switch (period.toLowerCase()) {
      case 'day':
        dateFilter.deliveredAt.$gte = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        dateFilter.deliveredAt.$lt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        dateFilter.deliveredAt.$gte = startOfWeek;
        dateFilter.deliveredAt.$lt = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 1000);
        break;
      case 'month':
        dateFilter.deliveredAt.$gte = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter.deliveredAt.$lt = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
    }
  }

 const orders = await Order.find({
    ...dateFilter,
    'deliveryAssignment.assignedDriver': req.user._id,
    status: 'delivered'
  });

  const totalEarnings = orders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0);
  const totalOrders = orders.length;

  res.status(200).json(
    ApiResponse.success('Earnings retrieved successfully', {
      totalEarnings,
      totalOrders,
      period: dateFilter.deliveredAt,
      orders: orders.map(order => ({
        orderId: order._id,
        orderNumber: order.orderNumber,
        deliveryFee: order.deliveryFee,
        deliveredAt: order.deliveredAt,
        customer: order.customer
      }))
    })
  );
});

// @desc    Get driver analytics
// @route   GET /api/driver/analytics
// @access  Private (Driver only)
const getAnalytics = asyncHandler(async (req, res) => {
  // Check if user is a driver
  if (!req.user.roles.includes('driver')) {
    throw new AppError('Only drivers can access analytics', 403);
  }

  const { period = 'month', startDate, endDate } = req.query;

  let dateFilter = {};
  
  if (startDate || endDate) {
    dateFilter = {
      deliveredAt: {}
    };
    if (startDate) dateFilter.deliveredAt.$gte = new Date(startDate);
    if (endDate) dateFilter.deliveredAt.$lte = new Date(endDate);
  } else {
    const now = new Date();
    switch (period.toLowerCase()) {
      case 'day':
        dateFilter.deliveredAt.$gte = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        dateFilter.deliveredAt.$lt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        dateFilter.deliveredAt.$gte = startOfWeek;
        dateFilter.deliveredAt.$lt = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        dateFilter.deliveredAt.$gte = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter.deliveredAt.$lt = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
    }
  }

  const orders = await Order.find({
    ...dateFilter,
    'deliveryAssignment.assignedDriver': req.user._id
  });

  const deliveredOrders = orders.filter(order => order.status === 'delivered');
  const cancelledOrders = orders.filter(order => order.status === 'cancelled');
  const totalEarnings = deliveredOrders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0);
  const avgDeliveryTime = deliveredOrders.length > 0 
    ? deliveredOrders.reduce((sum, order) => sum + (order.deliveryTime || 0), 0) / deliveredOrders.length
    : 0;

  res.status(200).json(
    ApiResponse.success('Analytics retrieved successfully', {
      totalOrders: orders.length,
      deliveredOrders: deliveredOrders.length,
      cancelledOrders: cancelledOrders.length,
      totalEarnings,
      avgDeliveryTime,
      completionRate: orders.length > 0 ? (deliveredOrders.length / orders.length) * 100 : 0,
      period: dateFilter.deliveredAt
    })
  );
});

// @desc    Accept an order bid
// @route   POST /api/driver/orders/:orderId/accept
// @access  Private (Driver only)
const acceptOrderBid = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  // Check if user is a driver
 if (!req.user.roles.includes('driver')) {
    throw new AppError('Only drivers can accept orders', 403);
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Check if there's a winning bid for this driver
 const winningBid = order.bids?.find(bid => 
    bid.driver.toString() === req.user._id.toString()
  );

  if (!winningBid) {
    throw new AppError('You do not have a bid on this order', 400);
  }

  // Assign driver to order
 order.deliveryAssignment = {
    assignedDriver: req.user._id,
    assignedAt: new Date(),
    assignedBy: 'driver'
  };

  order.status = 'out_for_delivery';

  await order.save();

  // Create delivery record
  const delivery = await Delivery.create({
    order: order._id,
    driver: req.user._id,
    customer: order.customer,
    store: order.store,
    deliveryCost: {
      amount: winningBid.price,
      currency: 'EGP'
    },
    status: 'assigned',
    estimatedDeliveryTime: winningBid.estimatedDeliveryTime
  });

  // Create notification for customer
 await Notification.create({
    recipient: order.customer,
    title: 'Order Assigned to Driver',
    message: `Your order has been assigned to driver ${req.user.name}`,
    type: 'order_assigned',
    relatedEntity: {
      entityType: 'Order',
      entityId: order._id
    },
    data: {
      orderId: order._id,
      driverId: req.user._id
    }
  });

  res.status(200).json(
    ApiResponse.success('Order accepted successfully', { 
      order,
      delivery
    })
  );
});

// @desc    Get bid history
// @route   GET /api/driver/bids
// @access  Private (Driver only)
const getBidHistory = asyncHandler(async (req, res) => {
  // Check if user is a driver
  if (!req.user.roles.includes('driver')) {
    throw new AppError('Only drivers can access bid history', 403);
  }

  const { limit = 20, page = 1 } = req.query;
  const skip = (page - 1) * limit;

 const orders = await Order.find({
    'bids.driver': req.user._id
 })
  .populate('customer', 'name phone')
  .populate('store', 'name')
  .populate('items.product', 'title')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(parseInt(limit));

  const total = await Order.countDocuments({
    'bids.driver': req.user._id
  });

  res.status(200).json(
    ApiResponse.success('Bid history retrieved successfully', {
      bids: orders.map(order => ({
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          status: order.status
        },
        bid: order.bids.find(bid => bid.driver.toString() === req.user._id.toString()),
        customer: order.customer,
        store: order.store
      })),
      total,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    })
  );
});

module.exports = {
  getNearbyOrders,
  bidOnOrder,
  updateBid,
  getDriverOrders,
  updateOrderStatus,
  getDriverProfile,
  updateDriverProfile,
  updateAvailability,
  getEarnings,
  getAnalytics,
  acceptOrderBid,
  getBidHistory
};
