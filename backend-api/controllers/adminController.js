const Order = require('../models/Order');
const User = require('../models/User');
const Store = require('../models/Store');
const Delivery = require('../models/Delivery');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Get dashboard metrics
 */
const getDashboardMetrics = asyncHandler(async (req, res, next) => {
  // Get basic counts
  const totalOrders = await Order.countDocuments();
  const totalUsers = await User.countDocuments();
 const totalStores = await Store.countDocuments();
  const totalDrivers = await User.countDocuments({ role: 'driver' });
  
  // Get recent orders
  let recentOrders = [];
  try {
    recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .populate('store', 'name');
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    // If populate fails, fetch without populate
    recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5);
  }
  
  // Get revenue data
 const revenueData = await Order.aggregate([
    {
      $match: {
        status: { $in: ['completed', 'delivered'] }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$total' },
        averageOrderValue: { $avg: '$total' }
      }
    }
  ]);
  
  const totalRevenue = revenueData[0] ? revenueData[0].totalRevenue : 0;
  const averageOrderValue = revenueData[0] ? revenueData[0].averageOrderValue : 0;

  res.status(200).json({
    success: true,
    data: {
      totalOrders,
      totalUsers,
      totalStores,
      totalDrivers,
      totalRevenue,
      averageOrderValue,
      recentOrders
    }
  });
});

/**
 * Get recent activity
 */
const getRecentActivity = asyncHandler(async (req, res, next) => {
  const { limit = 10 } = req.query;
  
  // Mock recent activity data - in a real app, you'd have an activity log model
  let recentOrders = [];
  try {
    recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('user', 'name email')
      .populate('store', 'name')
      .select('orderNumber status total createdAt');
  } catch (error) {
    console.error('Error fetching recent orders for activity:', error);
    // If populate fails, fetch without populate
    recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('orderNumber status total createdAt');
  }
  
  // Format as activity items
  const activity = recentOrders.map(order => ({
    id: order._id,
    type: 'order',
    title: `Order #${order.orderNumber}`,
    description: `Order status changed to ${order.status}`,
    user: order.user ? { name: order.user.name, email: order.user.email } : null,
    store: order.store ? { name: order.store.name } : null,
    timestamp: order.createdAt,
    status: order.status
  }));

  res.status(200).json({
    success: true,
    data: activity
  });
});

/**
 * Get revenue trends
 */
const getRevenueTrends = asyncHandler(async (req, res, next) => {
  const { period = 'month' } = req.query;
  
  let dateFilter = {};
  
  switch (period) {
    case 'week':
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 1000) } };
      break;
    case 'month':
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 1000) } };
      break;
    case 'year':
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 1000) } };
      break;
    default:
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 1000) } };
  }

 // Group orders by date period and calculate revenue
 const revenueData = await Order.aggregate([
    {
      $match: {
        ...dateFilter,
        status: { $in: ['completed', 'delivered'] }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: period === 'year' ? '%Y-%m' : '%Y-%m-%d',
            date: '$createdAt'
          }
        },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Format the data for charting
  const formattedData = revenueData.map(item => ({
    period: item._id,
    revenue: item.revenue,
    orders: item.orders
  }));

  res.status(200).json({
    success: true,
    data: formattedData
  });
});

/**
 * Get order trends
 */
const getOrderTrends = asyncHandler(async (req, res, next) => {
  const { period = 'month' } = req.query;
  
  let dateFilter = {};
  
  switch (period) {
    case 'week':
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };
      break;
    case 'month':
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 1000) } };
      break;
    case 'year':
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 1000) } };
      break;
    default:
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 1000) } };
  }

  // Group orders by status and date
  const orderData = await Order.aggregate([
    {
      $match: dateFilter
    },
    {
      $group: {
        _id: {
          date: {
            $dateToString: {
              format: period === 'year' ? '%Y-%m' : '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          status: '$status'
        },
        count: { $sum: 1 }
      }
    }
  ]);

  // Format data by date
  const formattedData = {};
  orderData.forEach(item => {
    if (!formattedData[item._id.date]) {
      formattedData[item._id.date] = {
        period: item._id.date,
        orders: 0,
        completed: 0,
        cancelled: 0
      };
    }
    
    formattedData[item._id.date].orders += item.count;
    
    if (item._id.status === 'completed' || item._id.status === 'delivered') {
      formattedData[item._id.date].completed += item.count;
    } else if (item._id.status === 'cancelled') {
      formattedData[item._id.date].cancelled += item.count;
    }
 });

  res.status(200).json({
    success: true,
    data: Object.values(formattedData)
  });
});

/**
 * Get user growth trends
 */
const getUserGrowthTrends = asyncHandler(async (req, res, next) => {
 const { period = 'month' } = req.query;
  
  let dateFilter = {};
  
  switch (period) {
    case 'week':
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 1000) } };
      break;
    case 'month':
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 1000) } };
      break;
    case 'year':
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 1000) } };
      break;
    default:
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 1000) } };
  }

  // Group users by date and calculate growth
  const userData = await User.aggregate([
    {
      $match: dateFilter
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: period === 'year' ? '%Y-%m' : '%Y-%m-%d',
            date: '$createdAt'
          }
        },
        newUsers: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Calculate total users up to each date
 let totalUsers = await User.countDocuments();
 const formattedData = userData.map(item => {
    // Calculate approximate total users at that point in time
    // This is a simplified calculation - in a real app you'd need historical data
    return {
      period: item._id,
      newUsers: item.newUsers,
      totalUsers: totalUsers // This would need historical data for accuracy
    };
  });

  res.status(200).json({
    success: true,
    data: formattedData
  });
});

/**
 * Get performance metrics
 */
const getPerformanceMetrics = asyncHandler(async (req, res, next) => {
  const { timeframe = 'month' } = req.query;
  
  let dateFilter = {};
  let previousDateFilter = {};
  
  const now = new Date();
  const startOfCurrent = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (timeframe) {
    case 'today':
      dateFilter = { 
        createdAt: { 
          $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
        }
      };
      previousDateFilter = { 
        createdAt: { 
          $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
          $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate())
        }
      };
      break;
    case 'week':
      dateFilter = { 
        createdAt: { 
          $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
        }
      };
      previousDateFilter = { 
        createdAt: { 
          $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() - 7),
          $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
        }
      };
      break;
    case 'month':
      dateFilter = { 
        createdAt: { 
          $gte: new Date(now.getFullYear(), now.getMonth(), 1)
        }
      };
      previousDateFilter = { 
        createdAt: { 
          $gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          $lt: new Date(now.getFullYear(), now.getMonth(), 1)
        }
      };
      break;
    case 'year':
      dateFilter = { 
        createdAt: { 
          $gte: new Date(now.getFullYear(), 0, 1)
        }
      };
      previousDateFilter = { 
        createdAt: { 
          $gte: new Date(now.getFullYear() - 1, 0, 1),
          $lt: new Date(now.getFullYear(), 0, 1)
        }
      };
      break;
    default:
      dateFilter = { 
        createdAt: { 
          $gte: new Date(now.getFullYear(), now.getMonth(), 1)
        }
      };
      previousDateFilter = { 
        createdAt: { 
          $gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          $lt: new Date(now.getFullYear(), now.getMonth(), 1)
        }
      };
  }

  // Current period metrics
  const currentRevenue = await Order.aggregate([
    {
      $match: {
        ...dateFilter,
        status: { $in: ['completed', 'delivered'] }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$total' }
      }
    }
  ]);
  
  const currentOrders = await Order.countDocuments({
    ...dateFilter
  });
  
  const currentUsers = await User.countDocuments({
    ...dateFilter
  });

  // Previous period metrics
  const previousRevenue = await Order.aggregate([
    {
      $match: {
        ...previousDateFilter,
        status: { $in: ['completed', 'delivered'] }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$total' }
      }
    }
  ]);
  
  const previousOrders = await Order.countDocuments({
    ...previousDateFilter
 });
  
  const previousUsers = await User.countDocuments({
    ...previousDateFilter
  });

  const currentRevenueValue = currentRevenue[0] ? currentRevenue[0].total : 0;
  const previousRevenueValue = previousRevenue[0] ? previousRevenue[0].total : 0;
  
  const revenueGrowth = previousRevenueValue !== 0 
    ? ((currentRevenueValue - previousRevenueValue) / previousRevenueValue) * 100 
    : currentRevenueValue > 0 ? 100 : 0;
    
  const ordersGrowth = previousOrders !== 0 
    ? ((currentOrders - previousOrders) / previousOrders) * 100 
    : currentOrders > 0 ? 100 : 0;
    
 const usersGrowth = previousUsers !== 0 
    ? ((currentUsers - previousUsers) / previousUsers) * 100 
    : currentUsers > 0 ? 100 : 0;

  res.status(200).json({
    success: true,
    data: {
      revenue: {
        current: currentRevenueValue,
        previous: previousRevenueValue,
        growth: parseFloat(revenueGrowth.toFixed(2))
      },
      orders: {
        current: currentOrders,
        previous: previousOrders,
        growth: parseFloat(ordersGrowth.toFixed(2))
      },
      users: {
        current: currentUsers,
        previous: previousUsers,
        growth: parseFloat(usersGrowth.toFixed(2))
      },
      conversion: {
        rate: 0, // Placeholder - would need more complex calculation
        previous: 0,
        growth: 0
      }
    }
  });
});

/**
 * Get system health
 */
const getSystemHealth = asyncHandler(async (req, res, next) => {
  // Simulate system health metrics
  // In a real app, you'd check actual system metrics
  
  res.status(200).json({
    success: true,
    data: {
      apiResponseTime: 120, // milliseconds
      databaseConnections: 1, // placeholder
      activeUsers: 0, // placeholder - would need real-time tracking
      errorRate: 0.1, // percentage
      uptime: 99.9 // percentage
    }
  });
});

/**
 * Get user statistics
 */
const getUserStats = asyncHandler(async (req, res, next) => {
  const total = await User.countDocuments();
  
  // Get users from this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const newThisMonth = await User.countDocuments({
    createdAt: { $gte: startOfMonth }
  });
  
  // Get active users (placeholder - would need actual activity tracking)
  const active = total; // placeholder
  
  // Calculate growth percentage
  const lastMonthStart = new Date();
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
  lastMonthStart.setDate(1);
  lastMonthStart.setHours(0, 0, 0, 0);
  
  const lastMonthNew = await User.countDocuments({
    createdAt: { 
      $gte: lastMonthStart,
      $lt: startOfMonth
    }
  });
  
  const growth = lastMonthNew !== 0 
    ? ((newThisMonth - lastMonthNew) / lastMonthNew) * 100 
    : newThisMonth > 0 ? 100 : 0;

  // Get users by role
  const usersByRole = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const byRole = {};
  usersByRole.forEach(role => {
    byRole[role._id] = role.count;
  });

  res.status(200).json({
    success: true,
    data: {
      total,
      active,
      newThisMonth,
      growth: parseFloat(growth.toFixed(2)),
      byRole
    }
  });
});

/**
 * Get order statistics
 */
const getOrderStats = asyncHandler(async (req, res, next) => {
  const total = await Order.countDocuments();
  const pending = await Order.countDocuments({ status: { $in: ['pending', 'confirmed'] } });
  const completed = await Order.countDocuments({ status: { $in: ['completed', 'delivered'] } });
  
  // Calculate revenue
  const revenueData = await Order.aggregate([
    {
      $match: {
        status: { $in: ['completed', 'delivered'] }
      }
    },
    {
      $group: {
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