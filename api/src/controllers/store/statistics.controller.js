const Order = require("../../models/Order");
const Store = require("../../models/Store");
const Product = require("../../models/Product");

const getStoreStatistics = async (req, res) => {
  try {
    const { period = "today" } = req.query;

    // Verify store exists and belongs to owner
    const store = await Store.findOne({ ownerId: req.userId });
    if (!store) {
      return res
        .status(404)
        .json({ success: false, message: "المحل غير موجود" });
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        startDate.setHours(0, 0, 0, 0);
    }

    // Get orders for the period
    const orders = await Order.find({
      storeId: store._id,
      createdAt: { $gte: startDate },
    });

    // Calculate statistics
    const totalOrders = orders.length;
    const completedOrders = orders.filter(
      (order) => order.status === "delivered"
    ).length;
    const cancelledOrders = orders.filter(
      (order) => order.status === "cancelled"
    ).length;
    const pendingOrders = orders.filter(
      (order) => order.status === "pending"
    ).length;

    const revenue = orders
      .filter((order) => order.status === "delivered")
      .reduce((sum, order) => sum + order.total, 0);

    const avgOrderValue = totalOrders > 0 ? revenue / totalOrders : 0;

    // Get total products count
    const totalProducts = await Product.countDocuments({ storeId: store._id });

    // Get top selling products
    const productQuantities = {};
    orders.forEach((order) => {
      if (order.status === "delivered") {
        order.items.forEach((item) => {
          if (productQuantities[item.productId.toString()]) {
            productQuantities[item.productId.toString()] += item.quantity;
          } else {
            productQuantities[item.productId.toString()] = item.quantity;
          }
        });
      }
    });

    // Get top 5 products
    const topProducts = await Product.find({
      _id: { $in: Object.keys(productQuantities) },
    }).select("name image");

    const topProductsWithQuantities = topProducts
      .map((product) => ({
        ...product.toObject(),
        quantitySold: productQuantities[product._id.toString()],
      }))
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        pendingOrders,
        revenue,
        avgOrderValue,
        completedOrders,
        cancelledOrders,
        topProducts: topProductsWithQuantities,
      },
      message: "تم جلب الإحصائيات بنجاح",
    });
  } catch (error) {
    console.error("Get store statistics error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

module.exports = {
  getStoreStatistics,
};
