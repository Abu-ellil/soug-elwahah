const Store = require("../models/Store");
const User = require("../models/User");
const Product = require("../models/Product");
const Service = require("../models/Service");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const ApiResponse = require("../utils/apiResponse");
const ApiFeatures = require("../utils/apiFeatures");

// @desc    Get all stores
// @route   GET /api/stores
// @access  Public
const getAllStores = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = { isActive: true };

  // Filter by category
  if (req.query.category) {
    filter.categories = { $in: [req.query.category] };
  }

  // Filter by verification status
  if (req.query.verified !== undefined) {
    filter.isVerified = req.query.verified === "true";
  }

  // Search by name or description
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { description: { $regex: req.query.search, $options: "i" } },
    ];
  }

  // Sort options
  let sortBy = { createdAt: -1 };
  if (req.query.sort) {
    switch (req.query.sort) {
      case "name":
        sortBy = { name: 1 };
        break;
      case "rating":
        sortBy = { "rating.average": -1 };
        break;
      case "followers":
        sortBy = { followersCount: -1 };
        break;
      case "products":
        sortBy = { productsCount: -1 };
        break;
      case "services":
        sortBy = { servicesCount: -1 };
        break;
    }
  }

  const stores = await Store.find(filter)
    .populate("owner", "name profilePicture")
    .sort(sortBy)
    .skip(skip)
    .limit(limit);

  const total = await Store.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: stores.length,
    total,
    pagination: {
      page,
      pages: Math.ceil(total / limit),
      limit,
    },
    data: stores,
  });
});

// @desc    Get single store
// @route   GET /api/stores/:id
// @access  Public
const getStore = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id).populate(
    "owner",
    "name email phone profilePicture joinedAt"
  );

  if (!store) {
    throw new AppError("Store not found", 404);
  }

  // Increment views
  store.views += 1;
  await store.save();

  res.status(200).json({
    success: true,
    data: store,
  });
});

// @desc    Create store
// @route   POST /api/stores
// @access  Private
const createStore = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    categories,
    address,
    phone,
    email,
    website,
    socialMedia,
    businessHours,
    deliveryOptions,
    paymentMethods,
  } = req.body;

  // Check if user already has a store
  const existingStore = await Store.findOne({ owner: req.user._id });
  if (existingStore) {
    throw new AppError("You already have a store", 400);
  }

  // Check if store name is unique
  const nameExists = await Store.findOne({
    name: { $regex: new RegExp(`^${name}$`, "i") },
  });

  if (nameExists) {
    throw new AppError("Store name already exists", 400);
  }

  const store = await Store.create({
    name,
    description,
    categories,
    owner: req.user._id,
    address: address || req.user.address,
    phone: phone || req.user.phone,
    email: email || req.user.email,
    website,
    socialMedia,
    businessHours,
    deliveryOptions,
    paymentMethods,
  });

  // Update user role to seller if not already
  if (req.user.role === "user") {
    await User.findByIdAndUpdate(req.user._id, { role: "seller" });
  }

  await store.populate("owner", "name profilePicture");

  res.status(201).json({
    success: true,
    data: store,
  });
});

// @desc    Update store
// @route   PUT /api/stores/:id
// @access  Private
const updateStore = asyncHandler(async (req, res) => {
  let store = await Store.findById(req.params.id);

  if (!store) {
    throw new AppError("Store not found", 404);
  }

  // Check ownership
  if (
    store.owner.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new AppError("Not authorized to update this store", 403);
  }

  // If updating name, check uniqueness
  if (req.body.name && req.body.name !== store.name) {
    const nameExists = await Store.findOne({
      name: { $regex: new RegExp(`^${req.body.name}$`, "i") },
      _id: { $ne: store._id },
    });

    if (nameExists) {
      throw new AppError("Store name already exists", 400);
    }
  }

  store = await Store.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate("owner", "name profilePicture");

  res.status(200).json({
    success: true,
    data: store,
  });
});

// @desc    Delete store
// @route   DELETE /api/stores/:id
// @access  Private
const deleteStore = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id);

  if (!store) {
    throw new AppError("Store not found", 404);
  }

  // Check ownership
  if (
    store.owner.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new AppError("Not authorized to delete this store", 403);
  }

  // Soft delete
  store.isActive = false;
  store.deletedAt = new Date();
  await store.save();

  res.status(200).json({
    success: true,
    message: "Store deleted successfully",
  });
});

// @desc    Follow/Unfollow store
// @route   PUT /api/stores/:id/follow
// @access  Private
const toggleFollowStore = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id);

  if (!store) {
    throw new AppError("Store not found", 404);
  }

  // Check if user is trying to follow their own store
  if (store.owner.toString() === req.user._id.toString()) {
    throw new AppError("You cannot follow your own store", 400);
  }

  const user = await User.findById(req.user._id);
  const isFollowing = user.followingStores.includes(store._id);

  if (isFollowing) {
    // Unfollow
    user.followingStores = user.followingStores.filter(
      (storeId) => storeId.toString() !== store._id.toString()
    );
    store.followers = store.followers.filter(
      (userId) => userId.toString() !== req.user._id.toString()
    );
    store.followersCount = Math.max(0, store.followersCount - 1);
  } else {
    // Follow
    user.followingStores.push(store._id);
    store.followers.push(req.user._id);
    store.followersCount += 1;
  }

  await Promise.all([user.save(), store.save()]);

  res.status(200).json({
    success: true,
    message: isFollowing ? "Store unfollowed" : "Store followed",
    isFollowing: !isFollowing,
  });
});

// @desc    Get store products
// @route   GET /api/stores/:id/products
// @access  Public
const getStoreProducts = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id);

  if (!store) {
    throw new AppError("Store not found", 404);
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {
    seller: store.owner,
    isActive: true,
  };

  // Filter by category
  if (req.query.category) {
    filter.category = req.query.category;
  }

  // Filter by availability
  if (req.query.available !== undefined) {
    filter.isAvailable = req.query.available === "true";
  }

  const products = await Product.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    pagination: {
      page,
      pages: Math.ceil(total / limit),
      limit,
    },
    data: products,
  });
});

// @desc    Get store services
// @route   GET /api/stores/:id/services
// @access  Public
const getStoreServices = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id);

  if (!store) {
    throw new AppError("Store not found", 404);
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {
    provider: store.owner,
    isActive: true,
  };

  // Filter by category
  if (req.query.category) {
    filter.category = req.query.category;
  }

  // Filter by availability
  if (req.query.available !== undefined) {
    filter.isAvailable = req.query.available === "true";
  }

  const services = await Service.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Service.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: services.length,
    total,
    pagination: {
      page,
      pages: Math.ceil(total / limit),
      limit,
    },
    data: services,
  });
});

// @desc    Get store statistics
// @route   GET /api/stores/:id/stats
// @access  Private
const getStoreStats = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id);

  if (!store) {
    throw new AppError("Store not found", 404);
  }

  // Check authorization
  if (
    store.owner.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new AppError("Not authorized to view store statistics", 403);
  }

  const stats = await Store.aggregate([
    { $match: { _id: store._id } },
    {
      $lookup: {
        from: "products",
        localField: "owner",
        foreignField: "seller",
        as: "products",
      },
    },
    {
      $lookup: {
        from: "services",
        localField: "owner",
        foreignField: "provider",
        as: "services",
      },
    },
    {
      $lookup: {
        from: "orders",
        localField: "owner",
        foreignField: "seller",
        as: "orders",
      },
    },
    {
      $project: {
        name: 1,
        views: 1,
        followersCount: 1,
        totalProducts: { $size: "$products" },
        activeProducts: {
          $size: {
            $filter: {
              input: "$products",
              cond: { $eq: ["$$this.isActive", true] },
            },
          },
        },
        totalServices: { $size: "$services" },
        activeServices: {
          $size: {
            $filter: {
              input: "$services",
              cond: { $eq: ["$$this.isActive", true] },
            },
          },
        },
        totalOrders: { $size: "$orders" },
        completedOrders: {
          $size: {
            $filter: {
              input: "$orders",
              cond: { $eq: ["$$this.status", "completed"] },
            },
          },
        },
        totalRevenue: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: "$orders",
                  cond: { $eq: ["$$this.status", "completed"] },
                },
              },
              as: "order",
              in: "$$order.totalAmount",
            },
          },
        },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: stats[0] || {},
  });
});

// @desc    Search stores
// @route   GET /api/stores/search
// @access  Public
const searchStores = asyncHandler(async (req, res) => {
  const {
    q,
    category,
    verified,
    sort,
    page = 1,
    limit = 10,
  } = req.query;

  const filter = { isActive: true };

  // Text search
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { categories: { $in: [new RegExp(q, "i")] } },
    ];
  }

  // Filter by category
  if (category) {
    filter.categories = { $in: [category] };
  }

  // Filter by verification
  if (verified !== undefined) {
    filter.isVerified = verified === "true";
  }

  // Sort options
  let sortBy = { createdAt: -1 };
  if (sort) {
    switch (sort) {
      case "name":
        sortBy = { name: 1 };
        break;
      case "rating":
        sortBy = { "rating.average": -1 };
        break;
      case "followers":
        sortBy = { followersCount: -1 };
        break;
      case "views":
        sortBy = { views: -1 };
        break;
    }
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const stores = await Store.find(filter)
    .populate("owner", "name profilePicture")
    .sort(sortBy)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Store.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: stores.length,
    total,
    pagination: {
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      limit: parseInt(limit),
    },
    data: stores,
  });
});

module.exports = {
  getAllStores,
  getStore,
  createStore,
  updateStore,
  deleteStore,
  toggleFollowStore,
  getStoreProducts,
  getStoreServices,
  getStoreStats,
  searchStores,
};
