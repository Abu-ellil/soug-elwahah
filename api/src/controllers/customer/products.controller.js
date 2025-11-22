const Product = require("../../models/Product");
const Store = require("../../models/Store");

const getAllProducts = async (req, res) => {
  try {
    const { categoryId, search, page = 1, limit = 20 } = req.query;

    // Validate pagination parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: "معلمات التصفح غير صحيحة"
      });
    }

    // Get approved stores
    const approvedStores = await Store.find({ verificationStatus: 'approved' }).select('_id');
    const storeIds = approvedStores.map(store => store._id);

    let filter = {
      storeId: { $in: storeIds },
      isAvailable: true,
      isActive: true,
    };

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const products = await Product.find(filter)
      .populate("storeId", "name phone address isOpen deliveryTime deliveryFee")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
      message: "تم جلب المنتجات بنجاح",
    });
  } catch (error) {
    console.error("Get all products error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId).populate(
      "storeId",
      "name phone address"
    );

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "المنتج غير موجود" });
    }

    if (!product.isAvailable || !product.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "المنتج غير متوفر" });
    }

    res.status(200).json({
      success: true,
      data: { product },
      message: "تم جلب تفاصيل المنتج بنجاح",
    });
  } catch (error) {
    console.error("Get product details error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

module.exports = {
  getAllProducts,
  getProductDetails,
};
