const Order = require("../../models/Order");
const Driver = require("../../models/Driver");

const getEarningsSummary = async (req, res) => {
  try {
    const { period = "month" } = req.query;

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
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setHours(0, 0, 0, 0);
    }

    // Get delivered orders for the driver in the specified period
    const orders = await Order.find({
      driverId: req.userId,
      status: "delivered",
      deliveredAt: { $gte: startDate },
    });

    // Calculate earnings
    const totalEarnings = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalEarnings / totalOrders : 0;

    const highestOrder =
      orders.length > 0 ? Math.max(...orders.map((order) => order.total)) : 0;

    const lowestOrder =
      orders.length > 0 ? Math.min(...orders.map((order) => order.total)) : 0;

    // Calculate daily breakdown
    const dailyBreakdown = {};
    orders.forEach((order) => {
      const date = order.deliveredAt.toISOString().split("T")[0]; // YYYY-MM-DD
      if (dailyBreakdown[date]) {
        dailyBreakdown[date].total += order.total;
        dailyBreakdown[date].count++;
      } else {
        dailyBreakdown[date] = {
          date,
          total: order.total,
          count: 1,
        };
      }
    });

    const dailyBreakdownArray = Object.values(dailyBreakdown).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    res.status(200).json({
      success: true,
      data: {
        totalEarnings,
        totalOrders,
        avgOrderValue,
        highestOrder,
        lowestOrder,
        dailyBreakdown: dailyBreakdownArray,
      },
      message: "تم جلب ملخص الأرباح بنجاح",
    });
  } catch (error) {
    console.error("Get earnings summary error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const getStatistics = async (req, res) => {
  try {
    const driver = await Driver.findById(req.userId);

    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: "السائق غير موجود" });
    }

    // Calculate acceptance rate
    const totalAssignedOrders = await Order.countDocuments({
      driverId: req.userId,
    });

    const acceptedOrders = await Order.countDocuments({
      driverId: req.userId,
      status: { $in: ["picked_up", "on_way", "delivered"] },
    });

    const acceptanceRate =
      totalAssignedOrders > 0
        ? (acceptedOrders / totalAssignedOrders) * 100
        : 0;

    // Calculate completion rate
    const completedOrders = await Order.countDocuments({
      driverId: req.userId,
      status: "delivered",
    });

    const completionRate =
      totalAssignedOrders > 0
        ? (completedOrders / totalAssignedOrders) * 100
        : 0;

    res.status(200).json({
      success: true,
      data: {
        totalOrders: driver.totalOrders,
        totalEarnings: driver.totalEarnings,
        rating: driver.rating,
        totalReviews: driver.totalReviews,
        acceptanceRate: parseFloat(acceptanceRate.toFixed(2)),
        completionRate: parseFloat(completionRate.toFixed(2)),
      },
      message: "تم جلب الإحصائيات بنجاح",
    });
  } catch (error) {
    console.error("Get driver statistics error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

module.exports = {
  getEarningsSummary,
  getStatistics,
};
