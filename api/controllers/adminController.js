const User = require('../models/User');
const Store = require('../models/Store');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, status, search, sortBy = 'createdAt', limit = 20, page = 1 } = req.query;
  const skip = (page - 1) * limit;

  let query = {};

  if (role) {
    query.roles = { $in: [role] };
  }

  if (status) {
    if (status === 'active') {
      query.isActive = true;
      query.isVerified = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    } else if (status === 'pending') {
      query.isVerified = false;
    }
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  let sort = {};
  switch (sortBy) {
    case 'name':
      sort = { name: 1 };
      break;
    case 'email':
      sort = { email: 1 };
      break;
    case 'newest':
      sort = { createdAt: -1 };
      break;
    case 'oldest':
      sort = { createdAt: 1 };
      break;
    case 'last-active':
      sort = { lastActive: -1 };
      break;
    default:
      sort = { createdAt: -1 };
      break;
  }

  const users = await User.find(query)
    .select('-password -refreshToken')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);

  res.status(200).json(
    ApiResponse.success('Users retrieved successfully', {
      users,
      total,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    })
  );
});

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -refreshToken')
    .populate('profile.store', 'name status')
    .populate('profile.driver', 'vehicleInfo isAvailable');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json(
    ApiResponse.success('User retrieved successfully', { user })
  );
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin only)
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  const validRoles = ['customer', 'driver', 'store', 'admin', 'superadmin'];
  if (!validRoles.includes(role)) {
    throw new AppError('Invalid role. Valid roles: ' + validRoles.join(', '), 400);
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Update roles array
  if (!user.roles.includes(role)) {
    user.roles.push(role);
  }

  // Update active role
  user.activeRole = role;

  // Update legacy role for backward compatibility
  if (role === 'store') {
    user.role = 'seller';
  } else if (role === 'admin' || role === 'superadmin') {
    user.role = 'admin';
  } else {
    user.role = 'user';
  }

  await user.save();

  res.status(200).json(
    ApiResponse.success('User role updated successfully', { user })
  );
});

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const validStatuses = ['active', 'inactive', 'suspended', 'banned'];
  if (!validStatuses.includes(status)) {
    throw new AppError('Invalid status. Valid statuses: ' + validStatuses.join(', '), 400);
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  switch (status) {
    case 'active':
      user.isActive = true;
      user.isVerified = true;
      user.status = 'active';
      break;
    case 'inactive':
      user.isActive = false;
      user.status = 'inactive';
      break;
    case 'suspended':
      user.isActive = false;
      user.status = 'suspended';
      break;
    case 'banned':
      user.isActive = false;
      user.isVerified = false;
      user.status = 'banned';
      break;
  }

  await user.save();

  // Create notification for user
  await Notification.create({
    recipient: user._id,
    title: 'Account Status Update',
    message: `Your account status has been updated to ${status}`,
    type: 'account_status',
    data: {
      oldStatus: user.status,
      newStatus: status
    }
  });

  res.status(200).json(
    ApiResponse.success('User status updated successfully', { user })
  );
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Soft delete - mark as inactive
  user.isActive = false;
  user.isDeleted = true;
  user.deletedAt = new Date();
  await user.save();

  res.status(200).json(
    ApiResponse.success('User deactivated successfully')
  );
});

// @desc    Get all stores
// @route   GET /api/admin/stores
// @access  Private (Admin only)
const getAllStores = asyncHandler(async (req, res) => {
  const { status, search, sortBy = 'createdAt', limit = 20, page = 1 } = req.query;
  const skip = (page - 1) * limit;

  let query = {};

  if (status) {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  let sort = {};
  switch (sortBy) {
    case 'name':
      sort = { name: 1 };
      break;
    case 'rating':
      sort = { ratingsAverage: -1 };
      break;
    case 'newest':
      sort = { createdAt: -1 };
      break;
    case 'oldest':
      sort = { createdAt: 1 };
      break;
    default:
      sort = { createdAt: -1 };
      break;
  }

  const stores = await Store.find(query)
    .populate('owner', 'name email phone')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Store.countDocuments(query);

  res.status(200).json(
    ApiResponse.success('Stores retrieved successfully', {
      stores,
      total,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    })
  );
});

// @desc    Get store by ID
// @route   GET /api/admin/stores/:id
// @access  Private (Admin only)
const getStoreById = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id)
    .populate('owner', 'name email phone')
    .populate('category', 'name')
    .populate('subcategories', 'name');

  if (!store) {
    throw new AppError('Store not found', 404);
  }

  res.status(200).json(
    ApiResponse.success('Store retrieved successfully', { store })
  );
});

// @desc    Update store status
// @route   PUT /api/admin/stores/:id/status
// @access  Private (Admin only)
const updateStoreStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const validStatuses = ['active', 'inactive', 'suspended', 'closed'];
  if (!validStatuses.includes(status)) {
    throw new AppError('Invalid status. Valid statuses: ' + validStatuses.join(', '), 400);
  }

  const store = await Store.findById(req.params.id);
  if (!store) {
    throw new AppError('Store not found', 404);
  }

  store.status = status;
  store.isActive = status === 'active';
  await store.save();

  // Create notification for store owner
  await Notification.create({
    recipient: store.owner,
    title: 'Store Status Update',
    message: `Your store status has been updated to ${status}`,
    type: 'store_status',
    data: {
      storeId: store._id,
      oldStatus: store.status,
      newStatus: status
    }
  });

  res.status(200).json(
    ApiResponse.success('Store status updated successfully', { store })
  );
});

// @desc    Update store commission rate
// @route   PUT /api/admin/stores/:id/commission
// @access  Private (Admin only)
const updateCommissionRate = asyncHandler(async (req, res) => {
  const { commissionRate } = req.body;

  if (typeof commissionRate !== 'number' || commissionRate < 0 || commissionRate > 100) {
    throw new AppError('Commission rate must be a number between 0 and 100', 400);
  }

  const store = await Store.findById(req.params.id);
  if (!store) {
    throw new AppError('Store not found', 404);
  }

  store.commissionRate = commissionRate;
  await store.save();

  res.status(200).json(
    ApiResponse.success('Commission rate updated successfully', { store })
  );
});

// @desc    Delete store
// @route   DELETE /api/admin/stores/:id
// @access  Private (Admin only)
const deleteStore = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id);
  if (!store) {
    throw new AppError('Store not found', 404);
  }

  // Soft delete
  store.isActive = false;
  store.status = 'deleted';
  store.deletedAt = new Date();
  await store.save();

  res.status(200).json(
    ApiResponse.success('Store deleted successfully')
  );
});

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private (Admin only)
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, customer, store, dateRange, sortBy = 'createdAt', limit = 20, page = 1 } = req.query;
  const skip = (page - 1) * limit;

  let query = {};

  if (status) {
    query.status = status;
  }

  if (customer) {
    query.customer = customer;
  }

  if (store) {
    query.store = store;
  }

  if (dateRange) {
    const [startDate, endDate] = dateRange.split(',');
    if (startDate) query.createdAt = { $gte: new Date(startDate) };
    if (endDate) query.createdAt = { ...query.createdAt, $lte: new Date(endDate) };
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
    .populate('customer', 'name email phone')
    .populate('seller', 'name email phone')
    .populate('store', 'name')
    .populate('items.product', 'title')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Order.countDocuments(query);

  res.status(200).json(
    ApiResponse.success('Orders retrieved successfully', {
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

// @desc    Get order by ID
// @route   GET /api/admin/orders/:id
// @access  Private (Admin only)
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('customer', 'name email phone')
    .populate('seller', 'name email phone')
    .populate('store', 'name')
    .populate('items.product', 'title description price')
    .populate('deliveryAssignment.assignedDriver', 'name phone');

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  res.status(200).json(
    ApiResponse.success('Order retrieved successfully', { order })
  );
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private (Admin only)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'completed', 'cancelled', 'refunded'];

  if (!validStatuses.includes(status)) {
    throw new AppError('Invalid status. Valid statuses: ' + validStatuses.join(', '), 400);
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Validate status transitions
  const validTransitions = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['preparing', 'cancelled'],
    'preparing': ['ready', 'cancelled'],
    'ready': ['out_for_delivery'],
    'out_for_delivery': ['delivered'],
    'delivered': ['completed'],
    'completed': [],
    'cancelled': [],
    'refunded': []
  };

  if (!validTransitions[order.status]?.includes(status)) {
    throw new AppError(`Cannot change status from ${order.status} to ${status}`, 400);
  }

  order.status = status;
  order.statusHistory.push({
    status: status,
    updatedBy: req.user._id,
    timestamp: new Date(),
    note: `Updated by admin`
  });

  if (status === 'cancelled') {
    order.cancellation = {
      reason: 'Cancelled by admin',
      cancelledBy: req.user._id,
      cancelledAt: new Date()
    };
  }

  await order.save();

  // Create notifications for involved parties
  const statusMessages = {
    'confirmed': 'Your order has been confirmed by admin',
    'preparing': 'Your order is being prepared',
    'ready': 'Your order is ready for delivery',
    'out_for_delivery': 'Your order is out for delivery',
    'delivered': 'Your order has been delivered',
    'completed': 'Your order has been completed',
    'cancelled': 'Your order has been cancelled by admin',
    'refunded': 'Your order has been refunded'
  };

  // Notify customer
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
      updatedBy: 'admin'
    }
  });

  // Notify store owner
  await Notification.create({
    recipient: order.seller,
    title: 'Order Status Update',
    message: `Order ${order.orderNumber} status updated to ${status}`,
    type: 'order_status',
    relatedEntity: {
      entityType: 'Order',
      entityId: order._id
    },
    data: {
      orderId: order._id,
      status: status,
      updatedBy: 'admin'
    }
  });

  res.status(200).json(
        _id: null,
        totalRevenue: { $sum: '$total' }
      }
    }
  ]);
  
  const revenue = revenueData[0] ? revenueData[0].totalRevenue : 0;
  
  // Calculate revenue growth
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const currentMonthRevenue = await Order.aggregate([
    {
      $match: {
        status: { $in: ['completed', 'delivered'] },
        createdAt: { $gte: startOfMonth }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$total' }
      }
    }
  ]);
  
  const lastMonthStart = new Date();
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
  lastMonthStart.setDate(1);
  lastMonthStart.setHours(0, 0, 0, 0);
  
  const lastMonthEnd = new Date();
  lastMonthEnd.setDate(0); // Last day of last month
  lastMonthEnd.setHours(23, 59, 59, 999);
  
  const lastMonthRevenue = await Order.aggregate([
    {
      $match: {
        status: { $in: ['completed', 'delivered'] },
        createdAt: { 
          $gte: lastMonthStart,
          $lt: lastMonthEnd
        }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$total' }
      }
    }
  ]);
  
  const currentMonthValue = currentMonthRevenue[0] ? currentMonthRevenue[0].total : 0;
  const lastMonthValue = lastMonthRevenue[0] ? lastMonthRevenue[0].total : 0;
  
  const revenueGrowth = lastMonthValue !== 0 
    ? ((currentMonthValue - lastMonthValue) / lastMonthValue) * 100 
    : currentMonthValue > 0 ? 100 : 0;

  // Get orders by status
  const ordersByStatus = await Order.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
 ]);
  
  const ordersByStatusObj = {};
  ordersByStatus.forEach(status => {
    ordersByStatusObj[status._id] = status.count;
  });

  res.status(200).json({
    success: true,
    data: {
      total,
      pending,
      completed,
      revenue,
      revenueGrowth: parseFloat(revenueGrowth.toFixed(2)),
      ordersByStatus: ordersByStatusObj
    }
  });
});

/**
 * Get store statistics
 */
const getStoreStats = asyncHandler(async (req, res, next) => {
  const total = await Store.countDocuments();
  const active = await Store.countDocuments({ status: 'active' });
  const pending = await Store.countDocuments({ status: 'pending' });
  const verified = await Store.countDocuments({ status: 'verified' });
  
  // Get top performing stores by revenue
  let topPerforming = [];
  try {
    topPerforming = await Order.aggregate([
      {
        $match: {
          status: { $in: ['completed', 'delivered'] }
        }
      },
      {
        $group: {
          _id: '$store',
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'stores',
          localField: '_id',
          foreignField: '_id',
          as: 'storeInfo'
        }
      },
      {
        $unwind: '$storeInfo'
      },
      {
        $project: {
          _id: '$storeInfo._id',
          name: '$storeInfo.name',
          revenue: 1,
          orders: 1
        }
      },
      {
        $sort: { revenue: -1 }
      },
      {
        $limit: 5
      }
    ]);
  } catch (error) {
    console.error('Error calculating top performing stores:', error);
    // Return empty array if aggregation fails
    topPerforming = [];
  }

  res.status(200).json({
    success: true,
    data: {
      total,
      active,
      pending,
      verified,
      topPerforming
    }
  });
});

/**
 * Get driver statistics
 */
const getDriverStats = asyncHandler(async (req, res, next) => {
  const total = await User.countDocuments({ role: 'driver' });
  const active = await User.countDocuments({ role: 'driver', status: 'active' });
  const pending = await User.countDocuments({ role: 'driver', status: 'pending' });
  const approved = await User.countDocuments({ role: 'driver', status: 'approved' });
  
  // Calculate average rating for drivers
  // Since drivers are users, we'll look at delivery ratings for users with driver role
  let averageRating = 0;
  let totalDeliveries = 0;
  
  try {
    const driverRatings = await Delivery.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'driver',
          foreignField: '_id',
          as: 'driverInfo'
        }
      },
      {
        $unwind: '$driverInfo'
      },
      {
        $match: {
          'driverInfo.role': 'driver',
          'driverRating.rating': { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$driver',
          avgRating: { $avg: '$driverRating.rating' },
          deliveryCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$avgRating' },
          totalDeliveries: { $sum: '$deliveryCount' }
        }
      }
    ]);
    
    if (driverRatings && driverRatings.length > 0) {
      averageRating = driverRatings[0].averageRating || 0;
      totalDeliveries = driverRatings[0].totalDeliveries || 0;
    }
  } catch (error) {
    // If there's an error with the aggregation, use fallback values
    console.error('Error calculating driver ratings:', error);
  }

  res.status(200).json({
    success: true,
    data: {
      total,
      active,
      pending,
      approved,
      averageRating: parseFloat(averageRating.toFixed(2)),
      totalDeliveries
    }
  });
});

module.exports = {
  getDashboardMetrics,
  getRecentActivity,
  getRevenueTrends,
  getOrderTrends,
  getUserGrowthTrends,
  getPerformanceMetrics,
  getSystemHealth,
  getUserStats,
  getOrderStats,
  getStoreStats,
  getDriverStats
};