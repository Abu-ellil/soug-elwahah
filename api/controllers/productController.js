const Product = require("../models/Product");
const Category = require("../models/Category");
const User = require("../models/User");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");
const ApiFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(
    Product.find({ status: "active" })
      .populate("seller", "name avatar")
      .populate("category", "name nameEn"),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const products = await features.query;
  const total = await Product.countDocuments({
    status: "active",
    ...features.getMatchConditions(),
  });

  res.json(
    ApiResponse.success(
      {
        products,
        pagination: {
          page: parseInt(req.query.page) || 1,
          limit: parseInt(req.query.limit) || 10,
          total,
          pages: Math.ceil(total / (parseInt(req.query.limit) || 10)),
        },
      },
      "قائمة المنتجات"
    )
  );
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("seller", "name avatar phone email")
    .populate("category", "name nameEn")
    .populate({
      path: "reviews",
      populate: {
        path: "reviewer",
        select: "name avatar",
      },
    });

  if (!product) {
    return res.status(404).json(ApiResponse.notFound("المنتج غير موجود"));
  }

  // Increment views count
  await product.incrementViews();

  res.json(ApiResponse.success(product, "تفاصيل المنتج"));
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private
const createProduct = asyncHandler(async (req, res) => {
  // Add seller from authenticated user
  req.body.seller = req.user._id;

  // Validate category exists
  if (req.body.category) {
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res
        .status(400)
        .json(ApiResponse.validationError("الفئة غير موجودة"));
    }
  }

  const product = await Product.create(req.body);

  await product.populate([
    { path: "seller", select: "name avatar" },
    { path: "category", select: "name nameEn" },
  ]);

  res.status(201).json(ApiResponse.success(product, "تم إنشاء المنتج بنجاح"));
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json(ApiResponse.notFound("المنتج غير موجود"));
  }

  // Check ownership
  if (
    product.seller.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res
      .status(403)
      .json(ApiResponse.forbidden("غير مصرح لك بتعديل هذا المنتج"));
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

  // Don't allow changing seller
  delete req.body.seller;

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate([
    { path: "seller", select: "name avatar" },
    { path: "category", select: "name nameEn" },
  ]);

  res.json(ApiResponse.success(product, "تم تحديث المنتج بنجاح"));
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json(ApiResponse.notFound("المنتج غير موجود"));
  }

  // Check ownership
  if (
    product.seller.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res
      .status(403)
      .json(ApiResponse.forbidden("غير مصرح لك بحذف هذا المنتج"));
  }

  // Soft delete - change status to deleted
  product.status = "deleted";
  await product.save({ validateBeforeSave: false });

  res.json(ApiResponse.success(null, "تم حذف المنتج بنجاح"));
});

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
const searchProducts = asyncHandler(async (req, res) => {
  const { search, category, minPrice, maxPrice, condition, sort } =
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

  // Price range filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  // Condition filter
  if (condition) {
    query.condition = condition;
  }

  let sortOptions = {};
  switch (sort) {
    case "price_asc":
      sortOptions = { price: 1 };
      break;
    case "price_desc":
      sortOptions = { price: -1 };
      break;
    case "newest":
      sortOptions = { createdAt: -1 };
      break;
    case "popular":
      sortOptions = { "statistics.viewsCount": -1 };
      break;
    default:
      sortOptions = { createdAt: -1 };
  }

  const features = new ApiFeatures(
    Product.find(query)
      .populate("seller", "name avatar")
      .populate("category", "name nameEn")
      .sort(sortOptions),
    req.query
  )
    .limitFields()
    .paginate();

  const products = await features.query;
  const total = await Product.countDocuments(query);

  res.json(
    ApiResponse.success(
      {
        products,
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

// @desc    Get products by category
// @route   GET /api/products/category/:categoryId
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.categoryId);

  if (!category) {
    return res.status(404).json(ApiResponse.notFound("الفئة غير موجودة"));
  }

  const features = new ApiFeatures(
    Product.find({
      category: req.params.categoryId,
      status: "active",
    })
      .populate("seller", "name avatar")
      .populate("category", "name nameEn"),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const products = await features.query;
  const total = await Product.countDocuments({
    category: req.params.categoryId,
    status: "active",
  });

  res.json(
    ApiResponse.success(
      {
        category,
        products,
        pagination: {
          page: parseInt(req.query.page) || 1,
          limit: parseInt(req.query.limit) || 10,
          total,
          pages: Math.ceil(total / (parseInt(req.query.limit) || 10)),
        },
      },
      `منتجات فئة ${category.name}`
    )
  );
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({
    status: "active",
    isFeatured: true,
  })
    .populate("seller", "name avatar")
    .populate("category", "name nameEn")
    .sort({ createdAt: -1 })
    .limit(parseInt(req.query.limit) || 10);

  res.json(ApiResponse.success(products, "المنتجات المميزة"));
});

// @desc    Get similar products
// @route   GET /api/products/:id/similar
// @access  Public
const getSimilarProducts = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json(ApiResponse.notFound("المنتج غير موجود"));
  }

  const similarProducts = await Product.find({
    _id: { $ne: req.params.id },
    category: product.category,
    status: "active",
    price: {
      $gte: product.price * 0.8,
      $lte: product.price * 1.2,
    },
  })
    .populate("seller", "name avatar")
    .populate("category", "name nameEn")
    .limit(parseInt(req.query.limit) || 6)
    .sort({ "statistics.viewsCount": -1 });

  res.json(ApiResponse.success(similarProducts, "منتجات مشابهة"));
});

// @desc    Toggle product availability
// @route   PATCH /api/products/:id/availability
// @access  Private
const toggleProductAvailability = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json(ApiResponse.notFound("المنتج غير موجود"));
  }

  // Check ownership
  if (
    product.seller.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res
      .status(403)
      .json(ApiResponse.forbidden("غير مصرح لك بتعديل هذا المنتج"));
  }

  product.isAvailable = !product.isAvailable;
  await product.save({ validateBeforeSave: false });

  res.json(
    ApiResponse.success(
      { isAvailable: product.isAvailable },
      `تم ${product.isAvailable ? "تفعيل" : "إلغاء"} توفر المنتج`
    )
  );
});

// @desc    Get product statistics (Admin/Owner only)
// @route   GET /api/products/statistics
// @access  Private
const getProductStatistics = asyncHandler(async (req, res) => {
  let matchCondition = {};

  // If not admin, only show user's products
  if (req.user.role !== "admin") {
    matchCondition.seller = req.user._id;
  }

  const totalProducts = await Product.countDocuments(matchCondition);
  const activeProducts = await Product.countDocuments({
    ...matchCondition,
    status: "active",
  });
  const soldProducts = await Product.countDocuments({
    ...matchCondition,
    status: "sold",
  });

  const productsByCategory = await Product.aggregate([
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

  const recentProducts = await Product.find(matchCondition)
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("seller", "name avatar")
    .populate("category", "name nameEn")
    .select("title images price status createdAt");

  res.json(
    ApiResponse.success(
      {
        totalProducts,
        activeProducts,
        soldProducts,
        draftProducts: totalProducts - activeProducts - soldProducts,
        productsByCategory,
        recentProducts,
      },
      "إحصائيات المنتجات"
    )
  );
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductsByCategory,
  getFeaturedProducts,
  getSimilarProducts,
  toggleProductAvailability,
  getProductStatistics,
};
