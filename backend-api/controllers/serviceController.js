const Service = require("../models/Service");
const Category = require("../models/Category");
const User = require("../models/User");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");
const ApiFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");

// @desc    Get all services
// @route   GET /api/services
// @access  Public
const getServices = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(
    Service.find({ status: "active" })
      .populate("provider", "name avatar")
      .populate("category", "name nameEn"),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const services = await features.query;
  const total = await Service.countDocuments({
    status: "active",
    ...features.getMatchConditions(),
  });

  res.json(
    ApiResponse.success(
      {
        services,
        pagination: {
          page: parseInt(req.query.page) || 1,
          limit: parseInt(req.query.limit) || 10,
          total,
          pages: Math.ceil(total / (parseInt(req.query.limit) || 10)),
        },
      },
      "قائمة الخدمات"
    )
  );
});

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
const getService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id)
    .populate("provider", "name avatar phone email")
    .populate("category", "name nameEn")
    .populate({
      path: "reviews",
      populate: {
        path: "reviewer",
        select: "name avatar",
      },
    });

  if (!service) {
    return res.status(404).json(ApiResponse.notFound("الخدمة غير موجودة"));
  }

  // Increment views count
  await service.incrementViews();

  res.json(ApiResponse.success(service, "تفاصيل الخدمة"));
});

// @desc    Create new service
// @route   POST /api/services
// @access  Private
const createService = asyncHandler(async (req, res) => {
  // Add provider from authenticated user
  req.body.provider = req.user._id;

  // Validate category exists
  if (req.body.category) {
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res
        .status(400)
        .json(ApiResponse.validationError("الفئة غير موجودة"));
    }
  }

  const service = await Service.create(req.body);

  await service.populate([
    { path: "provider", select: "name avatar" },
    { path: "category", select: "name nameEn" },
  ]);

  res.status(201).json(ApiResponse.success(service, "تم إنشاء الخدمة بنجاح"));
});

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private
const updateService = asyncHandler(async (req, res) => {
  let service = await Service.findById(req.params.id);

  if (!service) {
    return res.status(404).json(ApiResponse.notFound("الخدمة غير موجودة"));
  }

  // Check ownership
  if (
    service.provider.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res
      .status(403)
      .json(ApiResponse.forbidden("غير مصرح لك بتعديل هذه الخدمة"));
  }

  // Validate category if provided
  if (req.body.category) {
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res
        .status(400)
        .json(ApiResponse.validationError("الفئة غير موجودة"));
    }
  }

  // Don't allow changing provider
  delete req.body.provider;

  service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate([
    { path: "provider", select: "name avatar" },
    { path: "category", select: "name nameEn" },
  ]);

  res.json(ApiResponse.success(service, "تم تحديث الخدمة بنجاح"));
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private
const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return res.status(404).json(ApiResponse.notFound("الخدمة غير موجودة"));
  }

  // Check ownership
  if (
    service.provider.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res
      .status(403)
      .json(ApiResponse.forbidden("غير مصرح لك بحذف هذه الخدمة"));
  }

  // Soft delete - change status to deleted
  service.status = "deleted";
  await service.save({ validateBeforeSave: false });

  res.json(ApiResponse.success(null, "تم حذف الخدمة بنجاح"));
});

// @desc    Search services
// @route   GET /api/services/search
// @access  Public
const searchServices = asyncHandler(async (req, res) => {
  const { search, category, minPrice, maxPrice, serviceType, sort } =
    req.query;

  let query = { status: "active" };

  // Text search
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { tags: { $in: [new RegExp(search, "i")] } },
    ];
  }

  // Category filter
  if (category) {
    query.category = category;
  }

  // Price range filter (using base price from pricing)
  if (minPrice || maxPrice) {
    const priceQuery = {};
    if (minPrice) priceQuery.$gte = parseFloat(minPrice);
    if (maxPrice) priceQuery.$lte = parseFloat(maxPrice);
    query["pricing.amount"] = priceQuery;
  }

  // Service type filter
  if (serviceType) {
    query.serviceType = serviceType;
  }

  let sortOptions = {};
  switch (sort) {
    case "price_asc":
      sortOptions = { "pricing.amount": 1 };
      break;
    case "price_desc":
      sortOptions = { "pricing.amount": -1 };
      break;
    case "newest":
      sortOptions = { createdAt: -1 };
      break;
    case "popular":
      sortOptions = { "views": -1 };
      break;
    case "rating":
      sortOptions = { "rating.average": -1 };
      break;
    default:
      sortOptions = { createdAt: -1 };
  }

  const features = new ApiFeatures(
    Service.find(query)
      .populate("provider", "name avatar")
      .populate("category", "name nameEn")
      .sort(sortOptions),
    req.query
  )
    .limitFields()
    .paginate();

  const services = await features.query;
  const total = await Service.countDocuments(query);

  res.json(
    ApiResponse.success(
      {
        services,
        pagination: {
          page: parseInt(req.query.page) || 1,
          limit: parseInt(req.query.limit) || 10,
          total,
          pages: Math.ceil(total / (parseInt(req.query.limit) || 10)),
        },
      },
      "نتائج البحث"
    )
  );
});

// @desc    Get services by category
// @route   GET /api/services/category/:categoryId
// @access  Public
const getServicesByCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.categoryId);

  if (!category) {
    return res.status(404).json(ApiResponse.notFound("الفئة غير موجودة"));
  }

  const features = new ApiFeatures(
    Service.find({
      category: req.params.categoryId,
      status: "active",
    })
      .populate("provider", "name avatar")
      .populate("category", "name nameEn"),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const services = await features.query;
  const total = await Service.countDocuments({
    category: req.params.categoryId,
    status: "active",
  });

  res.json(
    ApiResponse.success(
      {
        category,
        services,
        pagination: {
          page: parseInt(req.query.page) || 1,
          limit: parseInt(req.query.limit) || 10,
          total,
          pages: Math.ceil(total / (parseInt(req.query.limit) || 10)),
        },
      },
      `خدمات فئة ${category.name}`
    )
  );
});

// @desc    Get featured services
// @route   GET /api/services/featured
// @access  Public
const getFeaturedServices = asyncHandler(async (req, res) => {
  const services = await Service.find({
    status: "active",
    isFeatured: true,
  })
    .populate("provider", "name avatar")
    .populate("category", "name nameEn")
    .sort({ createdAt: -1 })
    .limit(parseInt(req.query.limit) || 10);

  res.json(ApiResponse.success(services, "الخدمات المميزة"));
});

// @desc    Get similar services
// @route   GET /api/services/:id/similar
// @access  Public
const getSimilarServices = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return res.status(404).json(ApiResponse.notFound("الخدمة غير موجودة"));
  }

  const similarServices = await Service.find({
    _id: { $ne: req.params.id },
    category: service.category,
    status: "active",
    "pricing.amount": {
      $gte: service.pricing.amount * 0.8,
      $lte: service.pricing.amount * 1.2,
    },
  })
    .populate("provider", "name avatar")
    .populate("category", "name nameEn")
    .limit(parseInt(req.query.limit) || 6)
    .sort({ "views": -1 });

  res.json(ApiResponse.success(similarServices, "خدمات مشابهة"));
});

// @desc    Toggle service availability
// @route   PATCH /api/services/:id/availability
// @access  Private
const toggleServiceAvailability = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return res.status(404).json(ApiResponse.notFound("الخدمة غير موجودة"));
  }

  // Check ownership
  if (
    service.provider.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res
      .status(403)
      .json(ApiResponse.forbidden("غير مصرح لك بتعديل هذه الخدمة"));
  }

  service.isAvailable = !service.isAvailable;
  await service.save({ validateBeforeSave: false });

  res.json(
    ApiResponse.success(
      { isAvailable: service.isAvailable },
      `تم ${service.isAvailable ? "تفعيل" : "إلغاء"} توفر الخدمة`
    )
  );
});

// @desc    Get service statistics (Admin/Owner only)
// @route   GET /api/services/statistics
// @access  Private
const getServiceStatistics = asyncHandler(async (req, res) => {
  let matchCondition = {};

  // If not admin, only show user's services
  if (req.user.role !== "admin") {
    matchCondition.provider = req.user._id;
  }

  const totalServices = await Service.countDocuments(matchCondition);
  const activeServices = await Service.countDocuments({
    ...matchCondition,
    status: "active",
  });
  const completedServices = await Service.countDocuments({
    ...matchCondition,
    status: "completed",
  });

  const servicesByCategory = await Service.aggregate([
    { $match: matchCondition },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    { $unwind: "$categoryInfo" },
    {
      $group: {
        _id: "$category",
        categoryName: { $first: "$categoryInfo.name" },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  const servicesByType = await Service.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: "$serviceType",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  const recentServices = await Service.find(matchCondition)
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("provider", "name avatar")
    .populate("category", "name nameEn")
    .select("title images pricing status createdAt");

  res.json(
    ApiResponse.success(
      {
        totalServices,
        activeServices,
        completedServices,
        draftServices: totalServices - activeServices - completedServices,
        servicesByCategory,
        servicesByType,
        recentServices,
      },
      "إحصائيات الخدمات"
    )
  );
});

module.exports = {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  searchServices,
  getServicesByCategory,
  getFeaturedServices,
  getSimilarServices,
  toggleServiceAvailability,
  getServiceStatistics,
};
