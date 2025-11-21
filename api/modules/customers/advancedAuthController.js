/**
 * @file advancedAuthController.js - Advanced Authentication Controller
 * @description وحدة التحكم المتقدمة للمصادقة للعملاء مع دعم طرق متعددة
 */

const Customer = require('../../models/Customer');
const asyncHandler = require('../../middleware/async');
const ErrorResponse = require('../../utils/errorResponse');
const logger = require('../../utils/logger');

// @desc    تسجيل دخول متقدم (بريد إلكتروني أو رقم هاتف)
// @route   POST /api/customers/auth/login
// @access  Public
exports.advancedLogin = asyncHandler(async (req, res, next) => {
  const { email, phone, password, authProvider = 'email' } = req.body;

  // التحقق من البيانات المطلوبة
  if (!password) {
    return next(new ErrorResponse('كلمة المرور مطلوبة', 400));
  }

  let customer;
  
  // البحث حسب نوع المصادقة
  if (email && authProvider === 'email') {
    customer = await Customer.findOne({ email }).select('+password');
  } else if (phone && authProvider === 'phone') {
    customer = await Customer.findOne({ phone }).select('+password');
  } else {
    return next(new ErrorResponse('يرجى تقديم بريد إلكتروني أو رقم هاتف صالح', 400));
  }

  // التحقق من وجود المستخدم
  if (!customer) {
    return next(new ErrorResponse('بيانات الاعتماد غير صحيحة', 401));
  }

  // التحقق من كلمة المرور (إذا كان لديه كلمة مرور)
  if (customer.hasPassword()) {
    const isMatch = await customer.matchPassword(password);
    if (!isMatch) {
      return next(new ErrorResponse('بيانات الاعتماد غير صحيحة', 401));
    }
  }

  // التحقق من حالة الحساب
  if (!customer.isActive) {
    return next(new ErrorResponse('الحساب معطل', 401));
  }

  // تحديث آخر نشاط
  await customer.updateLastActive();

  // إنشاء التوكن
  const token = customer.getSignedJwtToken();

  // إعداد خيارات الكوكيز
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res.status(200).json({
    success: true,
    token,
    data: {
      id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      avatar: customer.avatar,
      isVerified: customer.isVerified,
      wallet: customer.wallet,
      authProvider: customer.authProvider,
      stats: customer.stats
    }
  });
});

// @desc    تسجيل دخول بالمصادقة الاجتماعية
// @route   POST /api/customers/auth/social
// @access  Public
exports.socialLogin = asyncHandler(async (req, res, next) => {
  const { provider, socialId, email, name, avatar } = req.body;

  if (!provider || !socialId) {
    return next(new ErrorResponse('مقدم الخدمة ورقم التعريف مطلوبان', 400));
  }

  const validProviders = ['google', 'facebook', 'apple'];
  if (!validProviders.includes(provider)) {
    return next(new ErrorResponse('مقدم خدمة غير مدعوم', 400));
  }

  let customer;

  // البحث عن المستخدم الموجود
  customer = await Customer.findOne({
    [`socialAuth.${provider}.id`]: socialId
  });

  if (!customer && email) {
    // البحث بالبريد الإلكتروني إذا لم يوجد بالمصادقة الاجتماعية
    customer = await Customer.findOne({ email });
    if (customer) {
      // ربط الحساب بالمصادقة الاجتماعية
      customer.socialAuth[provider] = { id: socialId, email };
      customer.authProvider = provider;
      await customer.save();
    }
  }

  if (!customer) {
    // إنشاء حساب جديد
    customer = await Customer.create({
      name: name || 'مستخدم جديد',
      email: email || null,
      authProvider: provider,
      avatar: avatar || null,
      socialAuth: {
        [provider]: { id: socialId, email }
      },
      isVerified: true // الحسابات الاجتماعية تعتبر موثقة
    });
  }

  // تحديث آخر نشاط
  await customer.updateLastActive();

  // إنشاء التوكن
  const token = customer.getSignedJwtToken();

  res.status(200).json({
    success: true,
    token,
    data: {
      id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      avatar: customer.avatar,
      isVerified: customer.isVerified,
      wallet: customer.wallet,
      authProvider: customer.authProvider,
      stats: customer.stats,
      isNewUser: customer.createdAt.getTime() > Date.now() - 60000 // أقل من دقيقة
    }
  });
});

// @desc    تسجيل حساب جديد متقدم
// @route   POST /api/customers/auth/register
// @access  Public
exports.advancedRegister = asyncHandler(async (req, res, next) => {
  const { name, email, phone, password, authProvider = 'email' } = req.body;

  // التحقق من البيانات المطلوبة
  if (!name) {
    return next(new ErrorResponse('الاسم مطلوب', 400));
  }

  if (authProvider === 'email' && !email) {
    return next(new ErrorResponse('البريد الإلكتروني مطلوب للمصادقة بالبريد', 400));
  }

  if (authProvider === 'phone' && !phone) {
    return next(new ErrorResponse('رقم الهاتف مطلوب للمصادقة بالهاتف', 400));
  }

  // التحقق من عدم وجود حساب مسبق
  if (email) {
    const existingEmail = await Customer.findOne({ email });
    if (existingEmail) {
      return next(new ErrorResponse('يوجد حساب بهذا البريد الإلكتروني', 400));
    }
  }

  if (phone) {
    const existingPhone = await Customer.findOne({ phone });
    if (existingPhone) {
      return next(new ErrorResponse('يوجد حساب بهذا الرقم', 400));
    }
  }

  // إنشاء الحساب
  const customerData = {
    name,
    authProvider,
    isVerified: authProvider === 'email' ? false : true
  };

  if (email) customerData.email = email;
  if (phone) customerData.phone = phone;
  if (password) customerData.password = password;

  const customer = await Customer.create(customerData);

  // إنشاء التوكن
  const token = customer.getSignedJwtToken();

  res.status(201).json({
    success: true,
    token,
    data: {
      id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      isVerified: customer.isVerified,
      authProvider: customer.authProvider
    },
    message: authProvider === 'email' ? 'تم إنشاء الحساب. يرجى التحقق من بريدك الإلكتروني' : 'تم إنشاء الحساب بنجاح'
  });
});

// @desc    إضافة/إزالة من قائمة الأمنيات
// @route   PUT /api/customers/wishlist/:productId
// @access  Private
exports.toggleWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  
  const customer = await Customer.findById(req.customer.id);
  
  if (!customer) {
    return next(new ErrorResponse('العميل غير موجود', 404));
  }

  const isInWishlist = customer.isInWishlist(productId);
  
  let result;
  if (isInWishlist) {
    await customer.removeFromWishlist(productId);
    result = 'removed';
  } else {
    await customer.addToWishlist(productId);
    result = 'added';
  }

  res.status(200).json({
    success: true,
    message: result === 'added' ? 'تم إضافة المنتج إلى قائمة الأمنيات' : 'تم إزالة المنتج من قائمة الأمنيات',
    data: {
      wishlist: customer.wishlist,
      isInWishlist: !isInWishlist
    }
  });
});

// @desc    الحصول على قائمة الأمنيات
// @route   GET /api/customers/wishlist
// @access  Private
exports.getWishlist = asyncHandler(async (req, res, next) => {
  const customer = await Customer.findById(req.customer.id)
    .populate('wishlist.product');

  if (!customer) {
    return next(new ErrorResponse('العميل غير موجود', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      wishlist: customer.wishlist,
      count: customer.wishlist.length
    }
  });
});

// @desc    إضافة أو تحديث تقييم
// @route   POST /api/customers/reviews
// @access  Private
exports.addReview = asyncHandler(async (req, res, next) => {
  const { product, store, rating, comment, images } = req.body;

  // التحقق من البيانات المطلوبة
  if (!product || !store || !rating) {
    return next(new ErrorResponse('المنتج والمتجر والتقييم مطلوبة', 400));
  }

  if (rating < 1 || rating > 5) {
    return next(new ErrorResponse('التقييم يجب أن يكون بين 1 و 5', 400));
  }

  const customer = await Customer.findById(req.customer.id);
  
  if (!customer) {
    return next(new ErrorResponse('العميل غير موجود', 404));
  }

  // إضافة أو تحديث التقييم
  await customer.addReview({
    product,
    store,
    rating,
    comment,
    images: images || []
  });

  res.status(200).json({
    success: true,
    message: 'تم حفظ التقييم بنجاح',
    data: {
      reviews: customer.reviews
    }
  });
});

// @desc    الحصول على تقييمات العميل
// @route   GET /api/customers/reviews
// @access  Private
exports.getReviews = asyncHandler(async (req, res, next) => {
  const customer = await Customer.findById(req.customer.id)
    .populate('reviews.product', 'name image price')
    .populate('reviews.store', 'name logo');

  if (!customer) {
    return next(new ErrorResponse('العميل غير موجود', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      reviews: customer.reviews,
      count: customer.reviews.length
    }
  });
});

// @desc    متابعة/إلغاء متابعة متجر
// @route   PUT /api/customers/favorite-stores/:storeId
// @access  Private
exports.toggleFavoriteStore = asyncHandler(async (req, res, next) => {
  const { storeId } = req.params;
  
  const customer = await Customer.findById(req.customer.id);
  
  if (!customer) {
    return next(new ErrorResponse('العميل غير موجود', 404));
  }

  const isFavorite = customer.preferences.favoriteStores.includes(storeId);
  
  if (isFavorite) {
    customer.preferences.favoriteStores.pull(storeId);
  } else {
    customer.preferences.favoriteStores.push(storeId);
  }
  
  await customer.save();

  res.status(200).json({
    success: true,
    message: isFavorite ? 'تم إلغاء متابعة المتجر' : 'تم متابعة المتجر',
    data: {
      favoriteStores: customer.preferences.favoriteStores,
      isFavorite: !isFavorite
    }
  });
});

// @desc    الحصول على المتاجر المفضلة
// @route   GET /api/customers/favorite-stores
// @access  Private
exports.getFavoriteStores = asyncHandler(async (req, res, next) => {
  const customer = await Customer.findById(req.customer.id)
    .populate('preferences.favoriteStores');

  if (!customer) {
    return next(new ErrorResponse('العميل غير موجود', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      favoriteStores: customer.preferences.favoriteStores,
      count: customer.preferences.favoriteStores.length
    }
  });
});