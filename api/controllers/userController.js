const User = require('../models/User');
const Product = require('../models/Product');
const Service = require('../models/Service');
const Order = require('../models/Order');
const Review = require('../models/Review');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const ApiFeatures = require('../utils/apiFeatures');

/**
 * Get all users (Admin only)
 */
const getAllUsers = asyncHandler(async (req, res, next) => {
  const features = new ApiFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await features.query;
  const total = await User.countDocuments();

  res.status(200).json(
    ApiResponse.success('تم جلب المستخدمين بنجاح', {
      users,
      total,
      page: req.query.page * 1 || 1,
      limit: req.query.limit * 1 || 10
    })
  );
});

/**
 * Get user by ID
 */
const getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .populate({
      path: 'products',
      select: 'name price images category isActive'
    })
    .populate({
      path: 'services',
      select: 'name price images category isActive'
    });

  if (!user) {
    return next(new AppError('لم يتم العثور على المستخدم', 404));
  }

  res.status(200).json(
    ApiResponse.success('تم جلب بيانات المستخدم بنجاح', { user })
  );
});

/**
 * Update user by ID (Admin only)
 */
const updateUser = asyncHandler(async (req, res, next) => {
  const allowedFields = ['name', 'email', 'role', 'isActive', 'isVerified', 'businessName', 'businessType'];
  const updates = {};

  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new AppError('لم يتم العثور على المستخدم', 404));
  }

  res.status(200).json(
    ApiResponse.success('تم تحديث بيانات المستخدم بنجاح', { user })
  );
});

/**
 * Delete user (Admin only)
 */
const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('لم يتم العثور على المستخدم', 404));
  }

  // Soft delete - deactivate user instead of removing
  await User.findByIdAndUpdate(req.params.id, { 
    active: false,
    isActive: false 
  });

  res.status(200).json(
    ApiResponse.success('تم حذف المستخدم بنجاح')
  );
});

/**
 * Get user's products
 */
const getUserProducts = asyncHandler(async (req, res, next) => {
  const features = new ApiFeatures(
    Product.find({ seller: req.params.id }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const products = await features.query
    .populate('category', 'name')
    .populate('seller', 'name businessName');

  const total = await Product.countDocuments({ seller: req.params.id });

  res.status(200).json(
    ApiResponse.success('تم جلب منتجات المستخدم بنجاح', {
      products,
      total,
      page: req.query.page * 1 || 1,
      limit: req.query.limit * 1 || 10
    })
  );
});

/**
 * Get user's services
 */
const getUserServices = asyncHandler(async (req, res, next) => {
  const features = new ApiFeatures(
    Service.find({ provider: req.params.id }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const services = await features.query
    .populate('category', 'name')
    .populate('provider', 'name businessName');

  const total = await Service.countDocuments({ provider: req.params.id });

  res.status(200).json(
    ApiResponse.success('تم جلب خدمات المستخدم بنجاح', {
      services,
      total,
      page: req.query.page * 1 || 1,
      limit: req.query.limit * 1 || 10
    })
  );
});

/**
 * Get user's orders
 */
const getUserOrders = asyncHandler(async (req, res, next) => {
  const features = new ApiFeatures(
    Order.find({ buyer: req.params.id }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const orders = await features.query
    .populate('items.product', 'name price images')
    .populate('items.service', 'name price images')
    .populate('seller', 'name businessName');

  const total = await Order.countDocuments({ buyer: req.params.id });

  res.status(200).json(
    ApiResponse.success('تم جلب طلبات المستخدم بنجاح', {
      orders,
      total,
      page: req.query.page * 1 || 1,
      limit: req.query.limit * 1 || 10
    })
  );
});

/**
 * Get user's reviews
 */
const getUserReviews = asyncHandler(async (req, res, next) => {
  const features = new ApiFeatures(
    Review.find({ user: req.params.id }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const reviews = await features.query
    .populate('product', 'name images')
    .populate('service', 'name images')
    .populate('seller', 'name businessName');

  const total = await Review.countDocuments({ user: req.params.id });

  res.status(200).json(
    ApiResponse.success('تم جلب تقييمات المستخدم بنجاح', {
      reviews,
      total,
      page: req.query.page * 1 || 1,
      limit: req.query.limit * 1 || 10
    })
  );
});

/**
 * Search users
 */
const searchUsers = asyncHandler(async (req, res, next) => {
  const { q, role, isActive } = req.query;

  let query = {};

  if (q) {
    query.$or = [
      { name: { $regex: q, $options: 'i' } },
      { businessName: { $regex: q, $options: 'i' } },
      { phone: { $regex: q, $options: 'i' } }
    ];
  }

  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const features = new ApiFeatures(User.find(query), req.query)
    .sort()
    .limitFields()
    .paginate();

  const users = await features.query;
  const total = await User.countDocuments(query);

  res.status(200).json(
    ApiResponse.success('تم البحث في المستخدمين بنجاح', {
      users,
      total,
      page: req.query.page * 1 || 1,
      limit: req.query.limit * 1 || 10
    })
  );
});

/**
 * Get nearby users
 */
const getNearbyUsers = asyncHandler(async (req, res, next) => {
  const { longitude, latitude, distance = 10 } = req.query;

  if (!longitude || !latitude) {
    return next(new AppError('خط الطول وخط العرض مطلوبان', 400));
  }

  const users = await User.findNearby(
    [parseFloat(longitude), parseFloat(latitude)],
    parseFloat(distance)
  );

  res.status(200).json(
    ApiResponse.success('تم جلب المستخدمين القريبين بنجاح', { users })
  );
});

/**
 * Block/Unblock user (Admin only)
 */
const toggleUserBlock = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('لم يتم العثور على المستخدم', 404));
  }

  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });

  const action = user.isActive ? 'إلغاء حظر' : 'حظر';
  
  res.status(200).json(
    ApiResponse.success(`تم ${action} المستخدم بنجاح`, { 
      user: {
        _id: user._id,
        name: user.name,
        isActive: user.isActive
      }
    })
  );
});

/**
 * Get user statistics
 */
const getUserStatistics = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;

  const [
    productsCount,
    servicesCount,
    ordersCount,
    reviewsCount,
    avgRating
  ] = await Promise.all([
    Product.countDocuments({ seller: userId, isActive: true }),
    Service.countDocuments({ provider: userId, isActive: true }),
    Order.countDocuments({ buyer: userId }),
    Review.countDocuments({ user: userId }),
    Review.aggregate([
      { $match: { seller: userId } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ])
  ]);

  const statistics = {
    productsCount,
    servicesCount,
    ordersCount,
    reviewsCount,
    avgRating: avgRating[0]?.avgRating || 0
  };

  res.status(200).json(
    ApiResponse.success('تم جلب إحصائيات المستخدم بنجاح', { statistics })
  );
});

/**
 * Update user profile based on active role
 */
const updateProfileByRole = asyncHandler(async (req, res, next) => {
  const { activeRole } = req.user;
  const updates = req.body;
  
  // Prepare update object based on active role
  let updateObject = {};
  
  switch(activeRole) {
    case 'customer':
      // Allow updates to customer-specific profile fields
      updateObject = {
        'profile.customer': {
          ...req.user.profile?.customer,
          ...updates.customer
        }
      };
      break;
    case 'driver':
      // Allow updates to driver-specific profile fields
      updateObject = {
        'profile.driver': {
          ...req.user.profile?.driver,
          ...updates.driver
        }
      };
      break;
    case 'store':
      // Allow updates to store-specific profile fields
      updateObject = {
        'profile.store': {
          ...req.user.profile?.store,
          ...updates.store
        }
      };
      break;
    default:
      // For admin or other roles, allow general updates
      updateObject = updates;
  }
  
  // Add general profile updates
  const allowedFields = ['name', 'email', 'bio', 'avatar', 'address', 'settings'];
  allowedFields.forEach(field => {
    if (updates[field]) {
      updateObject[field] = updates[field];
    }
 });
  
  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateObject,
    { new: true, runValidators: true }
 );
  
  if (!user) {
    return next(new AppError('المستخدم غير موجود', 404));
  }
  
  res.status(200).json(
    ApiResponse.success('تم تحديث الملف الشخصي بنجاح', { user })
  );
});

/**
 * Get user profile based on active role
 */
const getProfileByRole = asyncHandler(async (req, res, next) => {
  const { activeRole } = req.user;
  const userId = req.params.id || req.user._id;
  
  const user = await User.findById(userId).select('-password');
  
  if (!user) {
    return next(new AppError('المستخدم غير موجود', 404));
  }
  
  let profileData = {};
  
  switch(activeRole) {
    case 'customer':
      profileData = {
        ...user.toObject(),
        profile: user.profile?.customer
      };
      break;
    case 'driver':
      profileData = {
        ...user.toObject(),
        profile: user.profile?.driver
      };
      break;
    case 'store':
      profileData = {
        ...user.toObject(),
        profile: user.profile?.store
      };
      break;
    default:
      profileData = user;
  }
  
  res.status(200).json(
    ApiResponse.success('تم جلب الملف الشخصي بنجاح', {
      user: profileData,
      activeRole
    })
  );
});

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserProducts,
  getUserServices,
  getUserOrders,
  getUserReviews,
  searchUsers,
  getNearbyUsers,
  toggleUserBlock,
  getUserStatistics,
  updateProfileByRole,
  getProfileByRole
};