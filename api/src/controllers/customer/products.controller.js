const Product = require("../../models/Product");

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
  getProductDetails,
};
