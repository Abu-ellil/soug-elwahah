const Product = require("../../models/Product");
const Store = require("../../models/Store");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getMyProducts = async (req, res) => {
  try {
    const { categoryId, search, page = 1, limit = 20 } = req.query;

    // Verify store exists and belongs to owner
    const store = await Store.findOne({ ownerId: req.userId });
    if (!store) {
      return res
        .status(404)
        .json({ success: false, message: "المحل غير موجود" });
    }

    let filter = {
      storeId: store._id,
    };

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: "تم جلب المنتجات بنجاح",
    });
  } catch (error) {
    console.error("Get my products error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const addProduct = async (req, res) => {
  try {
    const { name, price, categoryId, description, isAvailable } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "الصورة مطلوبة" });
    }

    // Verify store exists and belongs to owner
    const store = await Store.findOne({ ownerId: req.userId });
    if (!store) {
      return res
        .status(404)
        .json({ success: false, message: "المحل غير موجود" });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "products",
    });

    // Create product
    const product = new Product({
      storeId: store._id,
      name,
      price: parseFloat(price),
      image: result.secure_url,
      categoryId,
      description,
      isAvailable: isAvailable === "true" || isAvailable === true,
      isActive: true,
    });

    await product.save();

    res.status(201).json({
      success: true,
      data: { product },
      message: "تم إضافة المنتج بنجاح",
    });
  } catch (error) {
    console.error("Add product error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, price, categoryId, description, isAvailable } = req.body;

    // Verify product exists and belongs to store
    const product = await Product.findOne({
      _id: productId,
      storeId: req.storeId,
    });
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "المنتج غير موجود" });
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        ...(name && { name }),
        ...(price && { price: parseFloat(price) }),
        ...(categoryId && { categoryId }),
        ...(description && { description }),
        ...(isAvailable !== undefined && {
          isAvailable: isAvailable === "true" || isAvailable === true,
        }),
        updatedAt: Date.now(),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: { product: updatedProduct },
      message: "تم تحديث المنتج بنجاح",
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const updateProductImage = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "الصورة مطلوبة" });
    }

    // Verify product exists and belongs to store
    const product = await Product.findOne({
      _id: productId,
      storeId: req.storeId,
    });
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "المنتج غير موجود" });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "products",
    });

    // Update product image
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        image: result.secure_url,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: { product: updatedProduct },
      message: "تم تحديث صورة المنتج بنجاح",
    });
  } catch (error) {
    console.error("Update product image error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const toggleAvailability = async (req, res) => {
  try {
    const { productId } = req.params;

    // Verify product exists and belongs to store
    const product = await Product.findOne({
      _id: productId,
      storeId: req.storeId,
    });
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "المنتج غير موجود" });
    }

    // Toggle availability
    product.isAvailable = !product.isAvailable;
    await product.save();

    res.status(200).json({
      success: true,
      data: { product },
      message: product.isAvailable
        ? "تم تفعيل المنتج"
        : "تم إلغاء تفعيل المنتج",
    });
  } catch (error) {
    console.error("Toggle product availability error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Verify product exists and belongs to store
    const product = await Product.findOne({
      _id: productId,
      storeId: req.storeId,
    });
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "المنتج غير موجود" });
    }

    await Product.findByIdAndDelete(productId);

    res.status(200).json({
      success: true,
      message: "تم حذف المنتج بنجاح",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

module.exports = {
  getMyProducts,
  addProduct,
  updateProduct,
  updateProductImage,
  toggleAvailability,
  deleteProduct,
};
