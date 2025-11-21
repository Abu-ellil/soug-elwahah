const Category = require("../models/Category");
const Product = require("../models/Product");
const Service = require("../models/Service");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const ApiFeatures = require("../utils/apiFeatures");

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getAllCategories = asyncHandler(async (req, res, next) => {
  const features = new ApiFeatures(
    Category.find({ isActive: true }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // Apply additional filters
  if (req.query.type) {
    features.query = features.query.where('type').equals(req.query.type);
  }

  if (req.query.parent) {
    features.query = features.query.where('parent').equals(req.query.parent);
  } else if (req.query.parent === "null") {
    features.query = features.query.where('parent').equals(null);
  }

  if (req.query.search) {
    features.query = features.query.where('name').regex(new RegExp(req.query.search, 'i'));
  }

  const categories = await features.query.populate("parent", "name icon");
  const total = await Category.countDocuments({ isActive: true });

  res.status(200).json(
    ApiResponse.success('تم جلب الفئات بنجاح', {
      categories,
      total,
      page: req.query.page * 1 || 1,
      limit: req.query.limit * 1 || 50
    })
  );
});

// @desc    Get category tree (hierarchical structure)
// @route   GET /api/categories/tree
// @access  Public
const getCategoryTree = asyncHandler(async (req, res, next) => {
  const filter = { isActive: true };

  // Filter by type
  if (req.query.type) {
    filter.type = req.query.type;
  }

  // Get all categories
  const categories = await Category.find(filter).sort({ order: 1, name: 1 });

  // Build tree structure
  const categoryMap = {};
  const rootCategories = [];

  // First pass: create map of all categories
  categories.forEach((category) => {
    categoryMap[category._id] = {
      ...category.toObject(),
      children: [],
    };
  });

  // Second pass: build tree structure
  categories.forEach((category) => {
    if (category.parent) {
      const parent = categoryMap[category.parent];
      if (parent) {
        parent.children.push(categoryMap[category._id]);
      }
    } else {
      rootCategories.push(categoryMap[category._id]);
    }
  });

  res.status(200).json(
    ApiResponse.success('تم جلب شجرة الفئات بنجاح', {
      categories: rootCategories
    })
  );
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
const getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findOne({
    _id: req.params.id,
    isActive: true,
  }).populate("parent", "name icon");

  if (!category) {
    return next(new AppError("الفئة غير موجودة", 404));
  }

  // Get subcategories
  const subcategories = await Category.find({
    parent: category._id,
    isActive: true,
  }).sort({ order: 1, name: 1 });

  // Get statistics
  const productCount = await Product.countDocuments({
    category: category._id,
    isActive: true,
  });

  const serviceCount = await Service.countDocuments({
    category: category._id,
    isActive: true,
  });

  res.status(200).json(
    ApiResponse.success('تم جلب الفئة بنجاح', {
      category: {
        ...category.toObject(),
        subcategories,
        statistics: {
          productCount,
          serviceCount,
          totalItems: productCount + serviceCount,
        },
      }
    })
  );
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res, next) => {
  const { name, description, type, parent, icon, order } = req.body;

  // Check if category with same name exists
  const existingCategory = await Category.findOne({ name, isActive: true });
  if (existingCategory) {
    return next(new AppError("فئة بهذا الاسم موجودة بالفعل", 400));
  }

  // Validate parent category if provided
  if (parent) {
    const parentCategory = await Category.findOne({
      _id: parent,
      isActive: true,
    });
    if (!parentCategory) {
      return next(new AppError("الفئة الأب غير موجودة", 400));
    }
    
    // Ensure parent and child have same type
    if (parentCategory.type !== type) {
      return next(new AppError("نوع الفئة الفرعية يجب أن يطابق نوع الفئة الأب", 400));
    }
  }

  const category = await Category.create({
    name,
    description,
    type,
    parent: parent || null,
    icon,
    order: order || 0,
  });

  await category.populate("parent", "name icon");

  res.status(201).json(
    ApiResponse.success('تم إنشاء الفئة بنجاح', {
      category
    })
  );
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res, next) => {
  const { name, description, parent, icon, order, isActive } = req.body;

  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(new AppError("الفئة غير موجودة", 404));
  }

  // Check if new name conflicts with existing categories
  if (name && name !== category.name) {
    const existingCategory = await Category.findOne({
      name,
      _id: { $ne: req.params.id },
      isActive: true,
    });
    if (existingCategory) {
      return next(new AppError("فئة بهذا الاسم موجودة بالفعل", 400));
    }
  }

  // Validate parent category if provided
  if (parent && parent !== category.parent?.toString()) {
    const parentCategory = await Category.findOne({
      _id: parent,
      isActive: true,
    });
    if (!parentCategory) {
      return next(new AppError("الفئة الأب غير موجودة", 400));
    }

    // Ensure parent and child have same type
    if (parentCategory.type !== category.type) {
      return next(new AppError("نوع الفئة الفرعية يجب أن يطابق نوع الفئة الأب", 400));
    }

    // Prevent circular reference
    if (parent === req.params.id) {
      return next(new AppError("لا يمكن أن تكون الفئة أب لنفسها", 400));
    }

    // Check if the new parent is not a descendant of current category
    const isDescendant = await checkIfDescendant(req.params.id, parent);
    if (isDescendant) {
      return next(new AppError("لا يمكن جعل فئة فرعية كفئة أب", 400));
    }
  }

  // Update category
  const updatedCategory = await Category.findByIdAndUpdate(
    req.params.id,
    {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(parent !== undefined && { parent: parent || null }),
      ...(icon && { icon }),
      ...(order !== undefined && { order }),
      ...(isActive !== undefined && { isActive }),
    },
    { new: true, runValidators: true }
  ).populate("parent", "name icon");

  res.status(200).json(
    ApiResponse.success('تم تحديث الفئة بنجاح', {
      category: updatedCategory
    })
  );
});

// Helper function to check if a category is descendant of another
const checkIfDescendant = async (ancestorId, descendantId) => {
  const descendant = await Category.findById(descendantId);
  if (!descendant || !descendant.parent) return false;
  
  if (descendant.parent.toString() === ancestorId) return true;
  
  return await checkIfDescendant(ancestorId, descendant.parent.toString());
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(new AppError("الفئة غير موجودة", 404));
  }

  // Check if category has active subcategories
  const subcategoriesCount = await Category.countDocuments({
    parent: req.params.id,
    isActive: true,
  });

  if (subcategoriesCount > 0) {
    return next(new AppError("لا يمكن حذف فئة تحتوي على فئات فرعية نشطة", 400));
  }

  // Check if category has associated products or services
  const productCount = await Product.countDocuments({
    category: req.params.id,
    isActive: true,
  });

  const serviceCount = await Service.countDocuments({
    category: req.params.id,
    isActive: true,
  });

  if (productCount > 0 || serviceCount > 0) {
    return next(new AppError("لا يمكن حذف فئة تحتوي على منتجات أو خدمات نشطة", 400));
  }

  // Soft delete
  await Category.findByIdAndUpdate(req.params.id, { isActive: false });

  res.status(200).json(
    ApiResponse.success('تم حذف الفئة بنجاح')
  );
});

// @desc    Get category statistics
// @route   GET /api/categories/:id/statistics
// @access  Public
const getCategoryStatistics = asyncHandler(async (req, res, next) => {
  const category = await Category.findOne({
    _id: req.params.id,
    isActive: true,
  });

  if (!category) {
    return next(new AppError("الفئة غير موجودة", 404));
  }

  // Get subcategories count
  const subcategoriesCount = await Category.countDocuments({
    parent: req.params.id,
    isActive: true,
  });

  // Get products count
  const productCount = await Product.countDocuments({
    category: req.params.id,
    isActive: true,
  });

  // Get services count
  const serviceCount = await Service.countDocuments({
    category: req.params.id,
    isActive: true,
  });

  const statistics = {
    subcategoriesCount,
    productCount,
    serviceCount,
    totalItems: productCount + serviceCount,
  };

  res.status(200).json(
    ApiResponse.success('تم جلب إحصائيات الفئة بنجاح', {
      category: {
        _id: category._id,
        name: category.name,
        type: category.type,
      },
      statistics
    })
  );
});



// @desc    Get popular categories
// @route   GET /api/categories/popular
// @access  Public
const getPopularCategories = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const type = req.query.type;

  const matchStage = { isActive: true };
  if (type) {
    matchStage.type = type;
  }

  // Aggregate to get categories with item counts
  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'category',
        as: 'products',
        pipeline: [{ $match: { isActive: true } }]
      }
    },
    {
      $lookup: {
        from: 'services',
        localField: '_id',
        foreignField: 'category',
        as: 'services',
        pipeline: [{ $match: { isActive: true } }]
      }
    },
    {
      $addFields: {
        itemsCount: { $add: [{ $size: '$products' }, { $size: '$services' }] }
      }
    },
    {
      $project: {
        name: 1,
        description: 1,
        type: 1,
        icon: 1,
        parent: 1,
        itemsCount: 1
      }
    },
    { $sort: { itemsCount: -1 } },
    { $limit: limit }
  ];

  const categories = await Category.aggregate(pipeline);

  // Populate parent information
  await Category.populate(categories, { path: 'parent', select: 'name icon' });

  res.status(200).json(
    ApiResponse.success('تم جلب الفئات الشائعة بنجاح', {
      categories,
      count: categories.length
    })
  );
});

module.exports = {
  getAllCategories,
  getCategoryTree,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStatistics,
  getPopularCategories,
};
