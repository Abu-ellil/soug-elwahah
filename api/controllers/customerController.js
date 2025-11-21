const User = require('../models/User');
const Store = require('../models/Store');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Favorite = require('../models/Favorite');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get nearby stores
// @route   GET /api/customer/stores/nearby
// @access  Private
const getNearbyStores = asyncHandler(async (req, res) => {
  const { coordinates, radius = 10000, limit = 20, page = 1 } = req.query;
  const skip = (page - 1) * limit;

  if (!coordinates) {
    throw new AppError('Coordinates are required', 400);
  }

  const [longitude, latitude] = coordinates.split(',').map(Number);

  if (!longitude || !latitude) {
    throw new AppError('Valid coordinates (longitude, latitude) are required', 400);
  }

  const stores = await Store.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: parseInt(radius)
      }
    },
    status: 'active',
    isActive: true
  })
  .populate('owner', 'name email phone')
  .sort({ ratingsAverage: -1 })
  .skip(skip)
  .limit(parseInt(limit));

  const total = await Store.countDocuments({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: parseInt(radius)
      }
    },
    status: 'active',
    isActive: true
  });

  res.status(200).json(
    ApiResponse.success('Nearby stores retrieved successfully', {
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

// @desc    Search products
// @route   GET /api/customer/products/search
// @access  Private
const searchProducts = asyncHandler(async (req, res) => {
  const { q, category, minPrice, maxPrice, sortBy = 'relevance', limit = 20, page = 1 } = req.query;
  const skip = (page - 1) * limit;

  let query = { isActive: true, isAvailable: true };

  if (q) {
    query.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { tags: { $in: [new RegExp(q, 'i')] } }
    ];
  }

  if (category) {
    query.category = category;
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
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
    case 'relevance':
    default:
      sort = { createdAt: -1 };
      break;
  }

  const products = await Product.find(query)
    .populate('seller', 'name avatar')
    .populate('category', 'name')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Product.countDocuments(query);

  res.status(200).json(
    ApiResponse.success('Products searched successfully', {
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

// @desc    Create order
// @route   POST /api/customer/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { items, deliveryInfo, payment, notes, isUrgent, isGift, giftMessage, store } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new AppError('Order must contain at least one item', 400);
  }

  // Validate items and calculate totals
 let totalAmount = 0;
  for (const item of items) {
    if (!item.product || !item.quantity || item.quantity <= 0) {
      throw new AppError('Each item must have a product ID and quantity > 0', 400);
    }

    const product = await Product.findById(item.product);
    if (!product || !product.isActive || !product.isAvailable) {
      throw new AppError(`Product with ID ${item.product} not found or unavailable`, 404);
    }

    if (product.stock !== undefined && product.stock < item.quantity) {
      throw new AppError(`Insufficient stock for product ${product.title}`, 400);
    }

    item.price = product.price;
    item.totalPrice = product.price * item.quantity;
    totalAmount += item.totalPrice;
  }

  // Get store if provided, otherwise get from first product
  let storeId;
  if (store) {
    storeId = store;
  } else {
    const firstProduct = await Product.findById(items[0].product);
    const storeRecord = await Store.findOne({ owner: firstProduct.seller });
    if (storeRecord) {
      storeId = storeRecord._id;
    }
  }

  // Create order
  const order = await Order.create({
    customer: req.user._id,
    seller: items[0].seller || (await Product.findById(items[0].product)).seller,
    store: storeId,
    items,
    subtotal: totalAmount,
    deliveryInfo: deliveryInfo || { type: 'pickup' },
    payment: payment || { method: 'cash', status: 'pending' },
    notes: notes || {},
    isUrgent: isUrgent || false,
    isGift: isGift || false,
    giftMessage: giftMessage || '',
    totalAmount
  });

  // Update product stock
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity }
    });
  }

  const populatedOrder = await Order.findById(order._id)
    .populate('customer', 'name email phone')
    .populate('seller', 'name email phone')
    .populate('store', 'name')
    .populate('items.product', 'title description price');

  res.status(201).json(
    ApiResponse.success('Order created successfully', { order: populatedOrder })
  );
});

// @desc    Get customer orders
// @route   GET /api/customer/orders
// @access  Private
const getCustomerOrders = asyncHandler(async (req, res) => {
  const { status, sortBy = 'createdAt', limit = 20, page = 1 } = req.query;
  const skip = (page - 1) * limit;

 let query = { customer: req.user._id };
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
    .populate('seller', 'name email phone')
    .populate('store', 'name')
    .populate('items.product', 'title description')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Order.countDocuments(query);

  res.status(200).json(
    ApiResponse.success('Customer orders retrieved successfully', {
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

// @desc    Get order details
// @route   GET /api/customer/orders/:id
// @access  Private
const getOrderDetails = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('customer', 'name email phone')
    .populate('seller', 'name email phone')
    .populate('store', 'name')
    .populate('items.product', 'title description price images')
    .populate('deliveryAssignment.assignedDriver', 'name phone');

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.customer.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to view this order', 403);
  }

  res.status(200).json(
    ApiResponse.success('Order details retrieved successfully', { order })
  );
});

// @desc    Cancel order
// @route   PUT /api/customer/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
 const { reason } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.customer.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to cancel this order', 403);
  }

  if (!order.canBeCancelled) {
    throw new AppError('Cannot cancel order at this stage', 400);
  }

  order.status = 'cancelled';
  order.cancellation = {
    reason: reason || 'Customer cancelled',
    cancelledBy: req.user._id,
    cancelledAt: new Date()
  };

  await order.save();

  res.status(200).json(
    ApiResponse.success('Order cancelled successfully', { order })
  );
});

// @desc    Add to favorites
// @route   POST /api/customer/favorites
// @access  Private
const addToFavorites = asyncHandler(async (req, res) => {
 const { productId, storeId } = req.body;

  if (!productId && !storeId) {
    throw new AppError('Either product ID or store ID is required', 400);
  }

  let favorite = await Favorite.findOne({
    user: req.user._id,
    product: productId,
    store: storeId
  });

  if (favorite) {
    throw new AppError('Item already in favorites', 400);
  }

  favorite = await Favorite.create({
    user: req.user._id,
    product: productId,
    store: storeId
  });

  res.status(200).json(
    ApiResponse.success('Added to favorites successfully', { favorite })
  );
});

// @desc    Remove from favorites
// @route   DELETE /api/customer/favorites
// @access  Private
const removeFromFavorites = asyncHandler(async (req, res) => {
  const { productId, storeId } = req.query;

  if (!productId && !storeId) {
    throw new AppError('Either product ID or store ID is required', 400);
  }

  const deleted = await Favorite.findOneAndDelete({
    user: req.user._id,
    product: productId,
    store: storeId
  });

  if (!deleted) {
    throw new AppError('Favorite not found', 404);
  }

  res.status(200).json(
    ApiResponse.success('Removed from favorites successfully')
  );
});

// @desc    Get favorites
// @route   GET /api/customer/favorites
// @access  Private
const getFavorites = asyncHandler(async (req, res) => {
 const { type, limit = 20, page = 1 } = req.query;
  const skip = (page - 1) * limit;

  let query = { user: req.user._id };
  if (type) {
    if (type === 'product') query.product = { $exists: true };
    if (type === 'store') query.store = { $exists: true };
  }

  const favorites = await Favorite.find(query)
    .populate('product', 'title description price images rating')
    .populate('store', 'name images.logo description ratingsAverage')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Favorite.countDocuments(query);

  res.status(200).json(
    ApiResponse.success('Favorites retrieved successfully', {
      favorites,
      total,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    })
  );
});

// @desc    Add review
// @route   POST /api/customer/reviews
// @access  Private
const addReview = asyncHandler(async (req, res) => {
 const { reviewee, rating, review, entityType = 'store' } = req.body;

  if (!reviewee || !rating || rating < 1 || rating > 5) {
    throw new AppError('Reviewee, rating (1-5) are required', 400);
  }

  // Check if user already reviewed this entity
  const existingReview = await Review.findOne({
    reviewer: req.user._id,
    reviewee: reviewee,
    entityType: entityType
  });

  if (existingReview) {
    throw new AppError('You have already reviewed this item', 400);
  }

  const reviewDoc = await Review.create({
    reviewer: req.user._id,
    reviewee: reviewee,
    entityType: entityType,
    rating: rating,
    review: review || ''
  });

  // Update ratings for the reviewed entity
  if (entityType === 'store') {
    const store = await Store.findById(reviewee);
    if (store) {
      const reviews = await Review.find({ reviewee: reviewee, entityType: 'store' });
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      store.ratingsAverage = avgRating;
      store.ratingsQuantity = reviews.length;
      await store.save();
    }
  }

  res.status(201).json(
    ApiResponse.success('Review added successfully', { review: reviewDoc })
  );
});

// @desc    Get store reviews
// @route   GET /api/customer/reviews/store/:storeId
// @access  Private
const getStoreReviews = asyncHandler(async (req, res) => {
 const { limit = 20, page = 1 } = req.query;
  const skip = (page - 1) * limit;

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
    entityType: 'store'
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

// @desc    Get driver reviews
// @route   GET /api/customer/reviews/driver/:driverId
// @access  Private
const getDriverReviews = asyncHandler(async (req, res) => {
  const { limit = 20, page = 1 } = req.query;
  const skip = (page - 1) * limit;

  const reviews = await Review.find({
    reviewee: req.params.driverId,
    entityType: 'driver'
  })
  .populate('reviewer', 'name avatar')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(parseInt(limit));

  const total = await Review.countDocuments({
    reviewee: req.params.driverId,
    entityType: 'driver'
  });

  // Get average rating
  const avgRating = await Review.aggregate([
    { $match: { reviewee: req.params.driverId, entityType: 'driver' } },
    { $group: { _id: null, average: { $avg: '$rating' } } }
  ]);

  res.status(200).json(
    ApiResponse.success('Driver reviews retrieved successfully', {
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

// @desc    Get customer order history
// @route   GET /api/customer/orders/history
// @access  Private
const getOrderHistory = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const orders = await Order.find({
    customer: req.user._id,
    status: { $in: ['completed', 'delivered', 'cancelled'] }
 })
  .populate('seller', 'name')
  .populate('store', 'name')
  .populate('items.product', 'title images')
  .sort({ createdAt: -1 })
  .limit(parseInt(limit));

  res.status(200).json(
    ApiResponse.success('Order history retrieved successfully', { orders })
  );
});

module.exports = {
 getNearbyStores,
  searchProducts,
  createOrder,
  getCustomerOrders,
  getOrderDetails,
  cancelOrder,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  addReview,
  getStoreReviews,
  getDriverReviews,
  getOrderHistory
};
