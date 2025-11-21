const Store = require('../models/Store');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const ApiResponse = require('../utils/apiResponse');

// @desc    Create store
// @route   POST /api/store
// @access  Private (Store owner only)
const createStore = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    shortDescription,
    category,
    subcategories,
    address,
    location,
    contact,
    businessHours,
    deliveryOptions,
    paymentMethods,
    features,
    seo
  } = req.body;

  // Check if user already has a store
 const existingStore = await Store.findOne({ owner: req.user._id });
  if (existingStore) {
    throw new AppError('You already have a store', 400);
  }

  // Check if store name is unique
 const nameExists = await Store.findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') }
  });
  if (nameExists) {
    throw new AppError('Store name already exists', 400);
  }

  const store = await Store.create({
    name,
    description,
    shortDescription,
    category,
    subcategories,
    owner: req.user._id,
    address,
    location,
    contact,
    businessHours,
    deliveryOptions,
    paymentMethods,
    features,
    seo
  });

  // Update user roles
  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { roles: 'store' },
    activeRole: 'store',
    'profile.store.businessName': name,
    'profile.store.businessType': 'shop'
  });

  const populatedStore = await Store.findById(store._id)
    .populate('owner', 'name email phone');

  res.status(201).json(
    ApiResponse.success('Store created successfully', { store: populatedStore })
  );
});

// @desc    Get store by ID
// @route   GET /api/store/:id
// @access  Public
const getStore = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id)
    .populate('owner', 'name email phone')
    .populate('category', 'name')
    .populate('subcategories', 'name');

  if (!store) {
    throw new AppError('Store not found', 404);
  }

  // Increment views
  store.stats.views += 1;
  await store.save();

  res.status(200).json(
    ApiResponse.success('Store retrieved successfully', { store })
  );
});

// @desc    Update store
// @route   PUT /api/store/:id
// @access  Private (Store owner only)
const updateStore = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id);

  if (!store) {
    throw new AppError('Store not found', 404);
  }

  // Check ownership
 if (store.owner.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to update this store', 403);
 }

  const updates = req.body;

  // Check if name is being updated and if it's unique
  if (updates.name && updates.name !== store.name) {
    const nameExists = await Store.findOne({
      name: { $regex: new RegExp(`^${updates.name}$`, 'i') },
      _id: { $ne: store._id }
    });
    if (nameExists) {
      throw new AppError('Store name already exists', 400);
    }
  }

  const updatedStore = await Store.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
 ).populate('owner', 'name email phone');

  res.status(200).json(
    ApiResponse.success('Store updated successfully', { store: updatedStore })
  );
});

// @desc    Get my store
// @route   GET /api/store/my
// @access  Private (Store owner only)
const getMyStore = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ owner: req.user._id })
    .populate('owner', 'name email phone')
    .populate('category', 'name')
    .populate('subcategories', 'name');

  if (!store) {
    throw new AppError('Store not found', 404);
  }

  res.status(200).json(
    ApiResponse.success('My store retrieved successfully', { store })
  );
});

// @desc    Update business hours
// @route   PUT /api/store/:storeId/business-hours
// @access  Private (Store owner only)
const updateBusinessHours = asyncHandler(async (req, res) => {
  const { businessHours } = req.body;

 const store = await Store.findById(req.params.storeId);

  if (!store) {
    throw new AppError('Store not found', 404);
  }

  // Check ownership
  if (store.owner.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to update business hours', 403);
 }

  store.businessHours = businessHours;
  await store.save();

  res.status(200).json(
    ApiResponse.success('Business hours updated successfully', { 
      businessHours: store.businessHours 
    })
  );
});

// @desc    Update delivery zones
// @route   PUT /api/store/:storeId/delivery-zones
// @access  Private (Store owner only)
const updateDeliveryZones = asyncHandler(async (req, res) => {
  const { deliveryZones } = req.body;

  const store = await Store.findById(req.params.storeId);

  if (!store) {
    throw new AppError('Store not found', 404);
  }

 // Check ownership
 if (store.owner.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to update delivery zones', 403);
 }

  store.deliveryOptions.deliveryRadius = deliveryZones?.radius || store.deliveryOptions.deliveryRadius;
  store.deliveryOptions.deliveryFee = deliveryZones?.fee || store.deliveryOptions.deliveryFee;
  store.deliveryOptions.freeDeliveryMinimum = deliveryZones?.freeDeliveryMinimum || store.deliveryOptions.freeDeliveryMinimum;

  await store.save();

  res.status(20).json(
    ApiResponse.success('Delivery zones updated successfully', { 
      deliveryOptions: store.deliveryOptions 
    })
  );
});

// @desc    Get store products
// @route   GET /api/store/:storeId/products
// @access  Public
const getStoreProducts = asyncHandler(async (req, res) => {
  const { status, category, sortBy = 'createdAt', limit = 20, page = 1 } = req.query;
  const skip = (page - 1) * limit;

 const store = await Store.findById(req.params.storeId);
  if (!store) {
    throw new AppError('Store not found', 404);
  }

  let query = { 
    seller: store.owner,
    isActive: true 
  };

  if (status) {
    query.status = status;
 }

  if (category) {
    query.category = category;
 }

  let sort = {};
  switch (sortBy) {
    case 'price-low':
      sort = { price: 1 };
      break;
    case 'price-high':
      sort = { price: -1 };
      break;
    case 'rating':
      sort = { 'rating.average': -1 };
      break;
    case 'newest':
      sort = { createdAt: -1 };
      break;
    default:
      sort = { createdAt: -1 };
      break;
  }

  const products = await Product.find(query)
    .populate('seller', 'name')
    .populate('category', 'name')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Product.countDocuments(query);

  res.status(200).json(
    ApiResponse.success('Store products retrieved successfully', {
      products,
      total,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    })
  );
});

// @desc    Add product to store
// @route   POST /api/store/:storeId/products
// @access  Private (Store owner only)
const addProduct = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.storeId);

  if (!store) {
    throw new AppError('Store not found', 404);
  }

  // Check ownership
  if (store.owner.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to add products to this store', 403);
  }

  const productData = {
    ...req.body,
    seller: req.user._id
  };

  const product = await Product.create(productData);

  // Update store product count
 store.stats.productsCount += 1;
  await store.save();

  const populatedProduct = await Product.findById(product._id)
    .populate('seller', 'name')
    .populate('category', 'name');

  res.status(201).json(
    ApiResponse.success('Product added successfully', { product: populatedProduct })
  );
});

// @desc    Update product
// @route   PUT /api/store/:storeId/products/:productId
// @access  Private (Store owner only)
const updateProduct = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.storeId);

  if (!store) {
    throw new AppError('Store not found', 404);
  }

  // Check ownership
  if (store.owner.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to update products in this store', 403);
  }

  const product = await Product.findOne({
    _id: req.params.productId,
    seller: req.user._id
  });

  if (!product) {
    throw new AppError('Product not found or not owned by you', 404);
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.productId,
    req.body,
    { new: true, runValidators: true }
 ).populate('seller', 'name')
   .populate('category', 'name');

  res.status(200).json(
    ApiResponse.success('Product updated successfully', { product: updatedProduct })
  );
});

// @desc    Delete product
// @route   DELETE /api/store/:storeId/products/:productId
// @access  Private (Store owner only)
const deleteProduct = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.storeId);

  if (!store) {
    throw new AppError('Store not found', 404);
  }

  // Check ownership
  if (store.owner.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to delete products from this store', 403);
  }

  const product = await Product.findOne({
    _id: req.params.productId,
    seller: req.user._id
  });

  if (!product) {
    throw new AppError('Product not found or not owned by you', 404);
  }

  await Product.findByIdAndDelete(req.params.productId);

  // Update store product count
 store.stats.productsCount = Math.max(0, store.stats.productsCount - 1);
  await store.save();

  res.status(200).json(
    ApiResponse.success('Product deleted successfully')
  );
});

// @desc    Update product stock
// @route   PUT /api/store/:storeId/products/:productId/stock
// @access  Private (Store owner only)
const updateProductStock = asyncHandler(async (req, res) => {
  const { stock } = req.body;

  const store = await Store.findById(req.params.storeId);

  if (!store) {
    throw new AppError('Store not found', 404);
  }

 // Check ownership
 if (store.owner.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to update product stock', 403);
 }

  const product = await Product.findOne({
    _id: req.params.productId,
    seller: req.user._id
  });

  if (!product) {
    throw new AppError('Product not found or not owned by you', 404);
  }

  product.stock = stock;
  await product.save();

  res.status(200).json(
    ApiResponse.success('Product stock updated successfully', { product })
  );
});

// @desc    Get store orders
// @route   GET /api/store/:storeId/orders
// @access  Private (Store owner only)
const getStoreOrders = asyncHandler(async (req, res) => {
  const { status, sortBy = 'createdAt', limit = 20, page = 1 } = req.query;
  const skip = (page - 1) * limit;

  const store = await Store.findById(req.params.storeId);

  if (!store) {
    throw new AppError('Store not found', 404);
  }

  // Check ownership
  if (store.owner.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to view store orders', 403);
 }

  let query = { store: req.params.storeId };
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
    .populate('items.product', 'title')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Order.countDocuments(query);

  res.status(200).json(
    ApiResponse.success('Store orders retrieved successfully', {
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
// @route   PUT /api/store/:storeId/orders/:orderId/status
// @access  Private (Store owner only)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const validStatuses = ['confirmed', 'preparing', 'ready', 'cancelled'];

  if (!status || !validStatuses.includes(status)) {
    throw new AppError('Invalid status. Valid statuses: ' + validStatuses.join(', '), 400);
  }

  const store = await Store.findById(req.params.storeId);

  if (!store) {
    throw new AppError('Store not found', 404);
  }

  // Check ownership
  if (store.owner.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to update order status', 403);
  }

  const order = await Order.findById(req.params.orderId);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Check if order belongs to this store
  if (order.store.toString() !== req.params.storeId) {
    throw new AppError('Order does not belong to this store', 403);
  }

  // Validate status transitions
  const validTransitions = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['preparing', 'cancelled'],
    'preparing': ['ready', 'cancelled'],
    'ready': ['out_for_delivery'],
    'out_for_delivery': ['delivered'],
    'delivered': ['completed'],
    'cancelled': [],
    'completed': []
  };

  if (!validTransitions[order.status]?.includes(status)) {
    throw new AppError(`Cannot change status from ${order.status} to ${status}`, 400);
  }

  order.status = status;
 order.statusHistory.push({
    status: status,
    updatedBy: req.user._id,
    timestamp: new Date(),
    note: `Updated by store owner`
  });

  if (status === 'cancelled') {
    order.cancellation = {
      reason: 'Cancelled by store',
      cancelledBy: req.user._id,
      cancelledAt: new Date()
    };
  }

  await order.save();

  // Create notification for customer
  const statusMessages = {
    'confirmed': 'Your order has been confirmed',
    'preparing': 'Your order is being prepared',
    'ready': 'Your order is ready for delivery',
    'cancelled': 'Your order has been cancelled by the store'
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

// @desc    Get store analytics
// @route   GET /api/store/:storeId/analytics
// @access  Private (Store owner only)
const getStoreAnalytics = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.storeId);

  if (!store) {
    throw new AppError('Store not found', 404);
  }

  // Check ownership
  if (store.owner.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to view store analytics', 403);
  }

  const { period = 'month', startDate, endDate } = req.query;

  let dateFilter = {};
  
  if (startDate || endDate) {
    dateFilter = {
      createdAt: {}
    };
    if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
    if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
  } else {
    const now = new Date();
    switch (period.toLowerCase()) {
      case 'day':
        dateFilter.createdAt.$gte = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        dateFilter.createdAt.$lt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        dateFilter.createdAt.$gte = startOfWeek;
        dateFilter.createdAt.$lt = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        dateFilter.createdAt.$gte = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter.createdAt.$lt = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
    }
  }

  const orders = await Order.find({
    ...dateFilter,
    store: req.params.storeId
 });

  const completedOrders = orders.filter(order => order.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

  const products = await Product.find({ seller: store.owner });

  res.status(200).json(
    ApiResponse.success('Store analytics retrieved successfully', {
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      totalRevenue,
      avgOrderValue,
      totalProducts: products.length,
      views: store.stats.views,
      followers: store.stats.follows,
      rating: store.ratingsAverage,
      period: dateFilter.createdAt
    })
  );
});

// @desc    Get store reviews
// @route   GET /api/store/:storeId/reviews
// @access  Public
const getStoreReviews = asyncHandler(async (req, res) => {
  const { limit = 20, page = 1 } = req.query;
  const skip = (page - 1) * limit;

  const store = await Store.findById(req.params.storeId);
  if (!store) {
    throw new AppError('Store not found', 404);
  }

  const reviews = await Review.find({
    reviewee: req.params.storeId,
    entityType: 'store'
  })
  .populate('reviewer', 'name avatar')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(parseInt(limit));

  const total = await Review.countDocuments({
    reviewee: req.params.storeId,
    entityType: 'store'–––
  });

  // Get average rating
 const avgRating = await Review.aggregate([
    { $match: { reviewee: req.params.storeId, entityType: 'store' } },
    { $group: { _id: null, average: { $avg: '$rating' } } }
  ]);

  res.status(200).json(
    ApiResponse.success('Store reviews retrieved successfully', {
      reviews,
      total,
      averageRating: avgRating[0]?.average || 0,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    })
  );
});

// @desc    Get nearby customers
// @route   GET /api/store/:storeId/customers/nearby
// @access  Private (Store owner only)
const getNearbyCustomers = asyncHandler(async (req, res) => {
  const { coordinates, radius = 1000, limit = 20, page = 1 } = req.query;
  const skip = (page - 1) * limit;

 if (!coordinates) {
    throw new AppError('Coordinates are required', 40);
  }

 const [longitude, latitude] = coordinates.split(',').map(Number);

  if (!longitude || !latitude) {
    throw new AppError('Valid coordinates (longitude, latitude) are required', 40);
  }

  const store = await Store.findById(req.params.storeId);
  if (!store) {
    throw new AppError('Store not found', 404);
  }

  // Check ownership
  if (store.owner.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to view nearby customers', 403);
  }

  const customers = await User.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: parseInt(radius)
      }
    },
    roles: { $in: ['customer'] },
    isActive: true
  })
  .select('name email phone location avatar')
  .sort({ lastActive: -1 })
  .skip(skip)
  .limit(parseInt(limit));

  const total = await User.countDocuments({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: parseInt(radius)
      }
    },
    roles: { $in: ['customer'] },
    isActive: true
  });

  res.status(200).json(
    ApiResponse.success('Nearby customers retrieved successfully', {
      customers,
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
  createStore,
  getStore,
  updateStore,
  getMyStore,
  updateBusinessHours,
  updateDeliveryZones,
  getStoreProducts,
  addProduct,
  updateProduct,
 deleteProduct,
  updateProductStock,
  getStoreOrders,
  updateOrderStatus,
  getStoreAnalytics,
  getStoreReviews,
  getNearbyCustomers
};
