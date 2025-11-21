const Delivery = require('../models/Delivery');
const Order = require('../models/Order');
const User = require('../models/User');
const Notification = require('../models/Notification');
const DeliveryService = require('../services/deliveryService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const ApiResponse = require('../utils/apiResponse');
const ApiFeatures = require('../utils/apiFeatures');

// @desc    Create a new delivery assignment
// @route   POST /api/deliveries
// @access  Private (Store/Seller only)
const createDelivery = asyncHandler(async (req, res) => {
  const { orderId, driverId, deliveryInstructions } = req.body;

  // Validate order exists and belongs to the store
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Check if user is the seller of this order
  if (order.seller.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to create delivery for this order', 403);
 }

  // Check if order is ready for delivery
  if (order.status !== 'ready') {
    throw new AppError('Order must be in "ready" status to assign delivery', 400);
  }

  // Validate driver exists and is available
  const driver = await User.findById(driverId);
  if (!driver) {
    throw new AppError('Driver not found', 404);
  }

  if (!driver.roles.includes('driver')) {
    throw new AppError('Selected user is not a driver', 400);
  }

  if (!driver.profile?.driver?.isAvailable) {
    throw new AppError('Driver is not available for delivery', 400);
  }

  // Create delivery assignment
  const delivery = await Delivery.create({
    order: order._id,
    driver: driver._id,
    store: order.seller,
    customer: order.customer,
    pickupLocation: {
      type: 'Point',
      coordinates: order.deliveryInfo.coordinates || driver.profile?.driver?.currentLocation?.coordinates || [31.2357, 30.0444], // Default to Cairo coordinates if not available
      address: order.deliveryInfo.address ? 
        `${order.deliveryInfo.address.street}, ${order.deliveryInfo.address.city}` : 
        driver.address || 'Default Address'
    },
    destinationLocation: {
      type: 'Point',
      coordinates: order.deliveryInfo.coordinates || [31.2357, 30.0444], // Default to Cairo coordinates
      address: order.deliveryInfo.address ? 
        `${order.deliveryInfo.address.street}, ${order.deliveryInfo.address.city}` : 
        'Default Address'
    },
    deliveryInstructions: deliveryInstructions,
    priority: order.isUrgent ? 'urgent' : 'normal',
    isUrgent: order.isUrgent || false
  });

  // Update order with delivery assignment
 order.deliveryAssignment = {
    deliveryId: delivery._id,
    assignedDriver: driver._id,
    assignedAt: new Date(),
    assignedBy: req.user._id
 };
  await order.save();

  // Update driver's availability and current delivery
  driver.profile.driver.isAvailable = false;
  driver.profile.driver.currentDelivery = {
    deliveryId: delivery._id,
    orderId: order._id,
    startedAt: new Date()
  };
  await driver.save();

  // Create notification for driver
  await Notification.create({
    recipient: driver._id,
    title: 'مهمة توصيل جديدة',
    message: `لديك مهمة توصيل جديدة للطلب ${order.orderNumber}`,
    type: 'delivery_assigned',
    relatedEntity: {
      entityType: 'Delivery',
      entityId: delivery._id,
    },
    data: {
      deliveryId: delivery._id,
      orderId: order._id,
      orderNumber: order.orderNumber,
      customerName: order.customer.name,
      pickupAddress: delivery.pickupLocation.address,
      deliveryAddress: delivery.destinationLocation.address
    },
  });

  // Create notification for customer
 await Notification.create({
    recipient: order.customer,
    title: 'تم تعيين مندوب التوصيل',
    message: `تم تعيين مندوب توصيل لطلبك ${order.orderNumber}`,
    type: 'delivery_assigned',
    relatedEntity: {
      entityType: 'Delivery',
      entityId: delivery._id,
    },
    data: {
      deliveryId: delivery._id,
      orderId: order._id,
      orderNumber: order.orderNumber,
      driverName: driver.name
    },
  });

  // Populate the delivery for response
  const populatedDelivery = await Delivery.findById(delivery._id)
    .populate('order', 'orderNumber status totalAmount')
    .populate('driver', 'name phone profile.driver.vehicleInfo')
    .populate('customer', 'name phone')
    .populate('store', 'name');

  res.status(201).json(
    ApiResponse.success('Delivery assignment created successfully', { delivery: populatedDelivery })
  );
});

// @desc    Get all deliveries (admin only)
// @route   GET /api/deliveries
// @access  Private/Admin
const getAllDeliveries = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};

  // Filter by status
  if (req.query.status) {
    filter.status = req.query.status;
  }

  // Filter by date range
  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {};
    if (req.query.startDate) {
      filter.createdAt.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      filter.createdAt.$lte = new Date(req.query.endDate);
    }
  }

  // Filter by driver
  if (req.query.driverId) {
    filter.driver = req.query.driverId;
  }

 // Filter by store
  if (req.query.storeId) {
    filter.store = req.query.storeId;
  }

  const deliveries = await Delivery.find(filter)
    .populate('order', 'orderNumber status totalAmount')
    .populate('driver', 'name phone profile.driver.vehicleInfo')
    .populate('customer', 'name phone')
    .populate('store', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Delivery.countDocuments(filter);

  res.status(200).json(
    ApiResponse.success('Deliveries retrieved successfully', {
      deliveries,
      total,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    })
  );
});

// @desc    Get deliveries for authenticated user based on role
// @route   GET /api/deliveries/my-deliveries
// @access  Private
const getMyDeliveries = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let filter = {};

  // Determine filter based on user role
  if (req.user.activeRole === 'driver') {
    filter.driver = req.user._id;
  } else if (req.user.activeRole === 'store') {
    filter.store = req.user._id;
 } else if (req.user.activeRole === 'customer') {
    filter.customer = req.user._id;
  } else {
    // Admin can see all
    filter = {};
  }

  // Additional filters
  if (req.query.status) {
    filter.status = req.query.status;
  }

 if (req.query.date) {
    const date = new Date(req.query.date);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    filter.createdAt = { $gte: date, $lt: nextDay };
  }

  const deliveries = await Delivery.find(filter)
    .populate('order', 'orderNumber status totalAmount')
    .populate('driver', 'name phone profile.driver.vehicleInfo')
    .populate('customer', 'name phone')
    .populate('store', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Delivery.countDocuments(filter);

  res.status(200).json(
    ApiResponse.success('My deliveries retrieved successfully', {
      deliveries,
      total,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    })
  );
});

// @desc    Get single delivery
// @route   GET /api/deliveries/:id
// @access  Private
const getDelivery = asyncHandler(async (req, res) => {
  const delivery = await Delivery.findById(req.params.id)
    .populate('order', 'orderNumber status totalAmount deliveryInfo')
    .populate('driver', 'name phone profile.driver.vehicleInfo profile.driver.currentLocation')
    .populate('customer', 'name phone')
    .populate('store', 'name');

  if (!delivery) {
    throw new AppError('Delivery not found', 404);
  }

  // Check authorization
  const isDriver = delivery.driver._id.toString() === req.user._id.toString();
  const isStore = delivery.store._id.toString() === req.user._id.toString();
  const isCustomer = delivery.customer._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isDriver && !isStore && !isCustomer && !isAdmin) {
    throw new AppError('Not authorized to view this delivery', 403);
  }

  res.status(200).json(
    ApiResponse.success('Delivery retrieved successfully', { delivery })
  );
});

// @desc    Update delivery status
// @route   PUT /api/deliveries/:id/status
// @access  Private (Driver only)
const updateDeliveryStatus = asyncHandler(async (req, res) => {
  const { status, location, note } = req.body;

  const delivery = await Delivery.findById(req.params.id);
  if (!delivery) {
    throw new AppError('Delivery not found', 404);
  }

  // Check if user is the assigned driver
  if (delivery.driver.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to update this delivery status', 403);
  }

  // Validate status transition
 const validTransitions = {
    pending_assignment: ['driver_assigned'],
    driver_assigned: ['picked_up'],
    picked_up: ['in_transit'],
    in_transit: ['arrived_at_destination'],
    arrived_at_destination: ['delivered', 'failed_delivery'],
    delivered: [],
    failed_delivery: [],
    cancelled: []
  };

  if (!validTransitions[delivery.status].includes(status)) {
    throw new AppError(`Cannot change status from ${delivery.status} to ${status}`, 400);
  }

  // Update status and location
  await delivery.updateStatus(status, location, note, req.user._id);

  // Update order status accordingly
  const order = await Order.findById(delivery.order);
  if (order) {
    if (status === 'picked_up') {
      order.status = 'out_for_delivery';
      await order.save();
    } else if (status === 'delivered') {
      order.status = 'delivered';
      await order.save();
    } else if (status === 'failed_delivery') {
      order.status = 'failed_delivery';
      await order.save();
    }
  }

  // Update driver availability based on status
  const driver = await User.findById(delivery.driver);
  if (driver) {
    if (status === 'delivered' || status === 'failed_delivery' || status === 'cancelled') {
      driver.profile.driver.isAvailable = true;
      driver.profile.driver.currentDelivery = undefined;
      await driver.save();
    }
  }

  // Create notification based on status change
  let notificationType = 'delivery_status_update';
  let notificationMessage = `تحديث حالة التوصيل إلى ${status}`;
  let notificationRecipients = [delivery.store, delivery.customer];

  switch (status) {
    case 'picked_up':
      notificationMessage = `تم استلام الطلب من المتجر`;
      break;
    case 'in_transit':
      notificationMessage = `الطلب في طريقه إليك`;
      break;
    case 'arrived_at_destination':
      notificationMessage = `تم وصول المندوب إلى وجهة التسليم`;
      break;
    case 'delivered':
      notificationMessage = `تم تسليم الطلب بنجاح`;
      // Update driver delivery stats
      if (driver) {
        driver.profile.driver.deliveryStats.completedDeliveries += 1;
        await driver.save();
      }
      break;
    case 'failed_delivery':
      notificationMessage = `فشل في تسليم الطلب`;
      // Update driver delivery stats
      if (driver) {
        driver.profile.driver.deliveryStats.cancelledDeliveries += 1;
        await driver.save();
      }
      break;
  }

  // Create notifications for relevant parties
 for (const recipientId of notificationRecipients) {
    await Notification.create({
      recipient: recipientId,
      title: 'تحديث حالة التوصيل',
      message: notificationMessage,
      type: notificationType,
      relatedEntity: {
        entityType: 'Delivery',
        entityId: delivery._id,
      },
      data: {
        deliveryId: delivery._id,
        status: status,
        updatedBy: req.user.name,
      },
    });
  }

  // Populate the updated delivery for response
  const updatedDelivery = await Delivery.findById(delivery._id)
    .populate('order', 'orderNumber status totalAmount')
    .populate('driver', 'name phone profile.driver.vehicleInfo')
    .populate('customer', 'name phone')
    .populate('store', 'name');

  res.status(200).json(
    ApiResponse.success('Delivery status updated successfully', { delivery: updatedDelivery })
  );
});

// @desc    Update delivery location (real-time tracking)
// @route   PUT /api/deliveries/:id/location
// @access  Private (Driver only)
const updateDeliveryLocation = asyncHandler(async (req, res) => {
  const { coordinates, address } = req.body;

  const delivery = await Delivery.findById(req.params.id);
  if (!delivery) {
    throw new AppError('Delivery not found', 404);
  }

  // Check if user is the assigned driver
  if (delivery.driver.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to update this delivery location', 403);
  }

  // Update current location
  await delivery.updateCurrentLocation({
    latitude: coordinates[1],
    longitude: coordinates[0]
  });

  // Update driver's location as well
  const driver = await User.findById(delivery.driver);
  if (driver) {
    driver.profile.driver.currentLocation = {
      type: 'Point',
      coordinates: coordinates
    };
    await driver.save();
  }

  // Create notification for customer about location update
  await Notification.create({
    recipient: delivery.customer,
    title: 'تحديث موقع التوصيل',
    message: 'المندوب في طريقه إليك الآن',
    type: 'delivery_location_update',
    relatedEntity: {
      entityType: 'Delivery',
      entityId: delivery._id,
    },
    data: {
      deliveryId: delivery._id,
      coordinates: coordinates,
    },
  });

  res.status(200).json(
    ApiResponse.success('Delivery location updated successfully', { delivery })
  );
});

// @desc    Get delivery statistics
// @route   GET /api/deliveries/stats
// @access  Private
const getDeliveryStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userRole = req.user.activeRole;

  let matchStage = {};

  // Filter based on user role
  if (userRole === 'driver') {
    matchStage.driver = userId;
 } else if (userRole === 'store') {
    matchStage.store = userId;
  } else if (userRole === 'customer') {
    matchStage.customer = userId;
  } else if (userRole !== 'admin') {
    throw new AppError('Not authorized to view delivery statistics', 403);
  }

  const stats = await Delivery.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalDeliveries: { $sum: 1 },
        pendingDeliveries: {
          $sum: { $cond: [{ $eq: ['$status', 'pending_assignment'] }, 1, 0] }
        },
        activeDeliveries: {
          $sum: { 
            $cond: [
              { $in: ['$status', ['driver_assigned', 'picked_up', 'in_transit', 'arrived_at_destination']] }, 
              1, 0
            ] 
          }
        },
        completedDeliveries: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
        },
        failedDeliveries: {
          $sum: { $cond: [{ $eq: ['$status', 'failed_delivery'] }, 1, 0] }
        },
        cancelledDeliveries: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        },
        totalEarnings: { $sum: '$deliveryCost.amount' },
        avgDeliveryTime: { $avg: '$totalDeliveryTime' }
      }
    }
  ]);

  // Get deliveries by status
  const deliveriesByStatus = await Delivery.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json(
    ApiResponse.success('Delivery statistics retrieved successfully', {
      summary: stats[0] || {
        totalDeliveries: 0,
        pendingDeliveries: 0,
        activeDeliveries: 0,
        completedDeliveries: 0,
        failedDeliveries: 0,
        cancelledDeliveries: 0,
        totalEarnings: 0,
        avgDeliveryTime: 0
      },
      deliveriesByStatus
    })
  );
});

// @desc    Cancel delivery
// @route   PUT /api/deliveries/:id/cancel
// @access  Private (Store or Admin only)
const cancelDelivery = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const delivery = await Delivery.findById(req.params.id);
  if (!delivery) {
    throw new AppError('Delivery not found', 404);
  }

  // Check authorization - only store, admin, or customer can cancel
  const isStore = delivery.store.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  const isCustomer = delivery.customer.toString() === req.user._id.toString();

  if (!isStore && !isAdmin && !isCustomer) {
    throw new AppError('Not authorized to cancel this delivery', 403);
  }

  // Can only cancel pending assignments or driver assigned but not picked up
  if (['picked_up', 'in_transit', 'arrived_at_destination'].includes(delivery.status)) {
    throw new AppError('Cannot cancel delivery that is already in progress', 400);
  }

  // Update delivery status to cancelled
  await delivery.updateStatus('cancelled', null, reason, req.user._id);

  // Update order status back to ready
  const order = await Order.findById(delivery.order);
  if (order) {
    order.status = 'ready';
    order.deliveryAssignment = undefined;
    await order.save();
  }

  // Make driver available again
  const driver = await User.findById(delivery.driver);
  if (driver) {
    driver.profile.driver.isAvailable = true;
    driver.profile.driver.currentDelivery = undefined;
    await driver.save();
  }

  // Create notification for driver
  await Notification.create({
    recipient: delivery.driver,
    title: 'تم إلغاء مهمة التوصيل',
    message: `تم إلغاء مهمة التوصيل للطلب ${order.orderNumber} - ${reason}`,
    type: 'delivery_cancelled',
    relatedEntity: {
      entityType: 'Delivery',
      entityId: delivery._id,
    },
    data: {
      deliveryId: delivery._id,
      orderId: delivery.order,
      reason: reason,
    },
  });

  // Create notification for customer
  await Notification.create({
    recipient: delivery.customer,
    title: 'تم إلغاء التوصيل',
    message: `تم إلغاء التوصيل للطلب ${order.orderNumber} - ${reason}`,
    type: 'delivery_cancelled',
    relatedEntity: {
      entityType: 'Delivery',
      entityId: delivery._id,
    },
    data: {
      deliveryId: delivery._id,
      orderId: delivery.order,
      reason: reason,
    },
  });

  // Populate the cancelled delivery for response
  const cancelledDelivery = await Delivery.findById(delivery._id)
    .populate('order', 'orderNumber status totalAmount')
    .populate('driver', 'name phone profile.driver.vehicleInfo')
    .populate('customer', 'name phone')
    .populate('store', 'name');

  res.status(200).json(
    ApiResponse.success('Delivery cancelled successfully', { delivery: cancelledDelivery })
  );
});

// @desc    Get active deliveries for a driver
// @route   GET /api/deliveries/active
// @access  Private (Driver only)
const getActiveDeliveries = asyncHandler(async (req, res) => {
  if (req.user.activeRole !== 'driver') {
    throw new AppError('Only drivers can access active deliveries', 403);
  }

  const activeDeliveries = await Delivery.find({
    driver: req.user._id,
    status: { $in: ['driver_assigned', 'picked_up', 'in_transit', 'arrived_at_destination'] }
  })
    .populate('order', 'orderNumber status totalAmount')
    .populate('customer', 'name phone')
    .populate('store', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json(
    ApiResponse.success('Active deliveries retrieved successfully', { deliveries: activeDeliveries })
  );
});

// @desc    Auto-assign delivery to the best available driver
// @route   POST /api/deliveries/:id/auto-assign
// @access  Private (Store/Seller only)
const autoAssignDelivery = asyncHandler(async (req, res) => {
  const { id: deliveryId } = req.params;

  // Find the delivery
  const delivery = await Delivery.findById(deliveryId);
  if (!delivery) {
    throw new AppError('Delivery not found', 404);
  }

  // Check if user is the store that owns this delivery
  if (delivery.store.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to auto-assign this delivery', 403);
  }

  // Check if delivery is in a state that allows assignment
  if (delivery.status !== 'pending_assignment') {
    throw new AppError('Delivery must be in pending_assignment status for auto-assignment', 40);
  }

  try {
    // Find the best available driver
    const bestDriver = await DeliveryService.findBestDriver(delivery.order);
    if (!bestDriver) {
      throw new AppError('No suitable driver available for this delivery', 400);
    }

    // Update the delivery with the assigned driver
    delivery.driver = bestDriver._id;
    delivery.status = 'driver_assigned';
    await delivery.save();

    // Update the driver's status
    bestDriver.profile.driver.isAvailable = false;
    bestDriver.profile.driver.currentDelivery = {
      deliveryId: delivery._id,
      orderId: delivery.order,
      startedAt: new Date()
    };
    await bestDriver.save();

    // Create notification for the driver
    await Notification.create({
      recipient: bestDriver._id,
      title: 'مهمة توصيل جديدة',
      message: `لديك مهمة توصيل جديدة للطلب ${delivery.order.orderNumber}`,
      type: 'delivery_assigned',
      relatedEntity: {
        entityType: 'Delivery',
        entityId: delivery._id,
      },
      data: {
        deliveryId: delivery._id,
        orderId: delivery.order,
        orderNumber: delivery.order.orderNumber,
        customerName: delivery.customer.name,
        pickupAddress: delivery.pickupLocation.address,
        deliveryAddress: delivery.destinationLocation.address
      },
    });

    // Create notification for customer
    await Notification.create({
      recipient: delivery.customer,
      title: 'تم تعيين مندوب التوصيل',
      message: `تم تعيين مندوب توصيل لطلبك ${delivery.order.orderNumber}`,
      type: 'delivery_assigned',
      relatedEntity: {
        entityType: 'Delivery',
        entityId: delivery._id,
      },
      data: {
        deliveryId: delivery._id,
        orderId: delivery.order,
        orderNumber: delivery.order.orderNumber,
        driverName: bestDriver.name
      },
    });

    // Populate the updated delivery for response
    const updatedDelivery = await Delivery.findById(delivery._id)
      .populate('order', 'orderNumber status totalAmount')
      .populate('driver', 'name phone profile.driver.vehicleInfo')
      .populate('customer', 'name phone')
      .populate('store', 'name');

    res.status(200).json(
      ApiResponse.success('Delivery auto-assigned successfully', { delivery: updatedDelivery })
    );
 } catch (error) {
    throw new AppError(error.message, 400);
  }
});

// @desc    Calculate estimated delivery time
// @route   GET /api/deliveries/:id/eta
// @access  Private
const calculateETA = asyncHandler(async (req, res) => {
  const { id: deliveryId } = req.params;

  // Find the delivery
  const delivery = await Delivery.findById(deliveryId);
  if (!delivery) {
    throw new AppError('Delivery not found', 404);
  }

 // Check authorization
 const isDriver = delivery.driver.toString() === req.user._id.toString();
  const isStore = delivery.store.toString() === req.user._id.toString();
  const isCustomer = delivery.customer.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isDriver && !isStore && !isCustomer && !isAdmin) {
    throw new AppError('Not authorized to view this delivery ETA', 403);
 }

  try {
    // Calculate estimated delivery time
    const etaInfo = await DeliveryService.calculateEstimatedDeliveryTime(deliveryId);

    res.status(200).json(
      ApiResponse.success('ETA calculated successfully', { eta: etaInfo })
    );
  } catch (error) {
    throw new AppError(error.message, 500);
  }
});

module.exports = {
  createDelivery,
 getAllDeliveries,
  getMyDeliveries,
  getDelivery,
  updateDeliveryStatus,
  updateDeliveryLocation,
  getDeliveryStats,
  cancelDelivery,
 getActiveDeliveries,
  autoAssignDelivery,
  calculateETA
};