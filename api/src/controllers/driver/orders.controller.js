const Order = require("../../models/Order");
const Store = require("../../models/Store");
const Driver = require("../../models/Driver");
const NotificationService = require("../../services/notification.service");
const {
  notifyOrderAccepted,
  notifyOrderPickedUp,
  notifyOrderOnWay,
  notifyOrderDelivered,
} = require("../../services/notification.service");

const getAvailableOrders = async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ success: false, message: "يرجى تزويد الإحداثيات" });
    }

    // Convert radius from km to meters for MongoDB query
    const radiusInMeters = parseFloat(radius) * 1000;

    // Find nearby stores
    const nearbyStores = await Store.find({
      coordinates: {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(lng), parseFloat(lat)],
            radiusInMeters / 6378100, // Earth's radius in meters
          ],
        },
      },
      isActive: true,
      isOpen: true,
    });

    const storeIds = nearbyStores.map((store) => store._id);

    // Find orders from nearby stores that are pending and not assigned to any driver
    const orders = await Order.find({
      storeId: { $in: storeIds },
      status: "confirmed", // Only confirmed orders from stores are available for drivers
      driverId: null, // Not assigned to any driver yet
    })
      .populate("storeId", "name address coordinates")
      .populate("userId", "name phone")
      .sort({ createdAt: 1 }); // Earliest confirmed orders first

    res.status(200).json({
      success: true,
      data: { orders },
      message: "تم جلب الطلبات المتاحة بنجاح",
    });
  } catch (error) {
    console.error("Get available orders error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Verify driver exists and is available
    const driver = await Driver.findById(req.userId);
    if (!driver || !driver.isAvailable || !driver.isActive) {
      return res
        .status(400)
        .json({ success: false, message: "أنت غير متاح لقبول الطلبات" });
    }

    // Find order that is confirmed and not assigned to any driver
    const order = await Order.findOne({
      _id: orderId,
      status: "confirmed",
      driverId: null,
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "الطلب غير متاح" });
    }

    // Update order with driver assignment
    order.driverId = req.userId;
    order.driverAssignedAt = new Date();
    order.status = "accepted";
    order.timeline.push({
      status: "accepted",
      label: "تم قبول الطلب من السائق",
      time: new Date(),
    });
    await order.save();

    // Update driver's active status
    await Driver.findByIdAndUpdate(req.userId, {
      $inc: { totalOrders: 1 },
    });

    // Populate order for response
    const populatedOrder = await Order.findById(order._id)
      .populate("storeId", "name address coordinates")
      .populate("userId", "name phone")
      .populate("driverId", "name phone");

    // Notify customer
    await notifyOrderAccepted(populatedOrder);

    res.status(200).json({
      success: true,
      data: { order: populatedOrder },
      message: "تم قبول الطلب بنجاح",
    });
  } catch (error) {
    console.error("Accept order error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const getActiveOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      driverId: req.userId,
      status: { $in: ["accepted", "picked_up", "on_way"] },
    })
      .populate("storeId", "name address coordinates")
      .populate("userId", "name phone address")
      .populate("driverId", "name phone");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "لا يوجد لديك طلبات نشطة" });
    }

    res.status(200).json({
      success: true,
      data: { order },
      message: "تم جلب الطلب النشط بنجاح",
    });
  } catch (error) {
    console.error("Get active order error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["picked_up", "on_way", "delivered"];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "حالة الطلب غير صحيحة" });
    }

    // Find order assigned to this driver
    const order = await Order.findOne({
      _id: orderId,
      driverId: req.userId,
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "الطلب غير موجود أو غير مخصص لك" });
    }

    // Check if status transition is valid
    if (status === "picked_up" && order.status !== "accepted") {
      return res
        .status(400)
        .json({
          success: false,
          message: "لا يمكن استلام الطلب في هذه المرحلة",
        });
    } else if (status === "on_way" && order.status !== "picked_up") {
      return res
        .status(400)
        .json({
          success: false,
          message: "لا يمكن بدء التوصيل في هذه المرحلة",
        });
    } else if (status === "delivered" && order.status !== "on_way") {
      return res
        .status(400)
        .json({
          success: false,
          message: "لا يمكن تسليم الطلب في هذه المرحلة",
        });
    }

    // Update order status
    order.status = status;

    // Update specific timestamps based on status
    if (status === "picked_up") {
      order.pickedUpAt = new Date();
    } else if (status === "delivered") {
      order.deliveredAt = new Date();
    }

    order.timeline.push({
      status,
      label: getStatusLabel(status),
      time: new Date(),
    });
    await order.save();

    // Populate order for response
    const populatedOrder = await Order.findById(order._id)
      .populate("storeId", "name address coordinates")
      .populate("userId", "name phone")
      .populate("driverId", "name phone");

    // Notify customer based on status
    if (status === "picked_up") {
      await notifyOrderPickedUp(populatedOrder);
    } else if (status === "on_way") {
      await notifyOrderOnWay(populatedOrder);
    } else if (status === "delivered") {
      await notifyOrderDelivered(populatedOrder);

      // Update driver earnings
      await Driver.findByIdAndUpdate(req.userId, {
        $inc: { totalEarnings: order.total },
      });
    }

    res.status(200).json({
      success: true,
      data: { order: populatedOrder },
      message: "تم تحديث حالة الطلب بنجاح",
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      driverId: req.userId,
    })
      .populate("storeId", "name address coordinates")
      .populate("userId", "name phone address")
      .populate("driverId", "name phone");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "الطلب غير موجود أو غير مخصص لك" });
    }

    res.status(200).json({
      success: true,
      data: { order },
      message: "تم جلب تفاصيل الطلب بنجاح",
    });
  } catch (error) {
    console.error("Get order details error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const getOrderHistory = async (req, res) => {
  try {
    const { period = "month", page = 1, limit = 20 } = req.query;

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

    const orders = await Order.find({
      driverId: req.userId,
      status: "delivered",
      deliveredAt: { $gte: startDate },
    })
      .populate("storeId", "name")
      .populate("userId", "name")
      .sort({ deliveredAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments({
      driverId: req.userId,
      status: "delivered",
      deliveredAt: { $gte: startDate },
    });

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: "تم جلب سجل الطلبات بنجاح",
    });
  } catch (error) {
    console.error("Get order history error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Helper function to get status label
function getStatusLabel(status) {
  switch (status) {
    case "picked_up":
      return "تم استلام الطلب من المحل";
    case "on_way":
      return "في الطريق للعميل";
    case "delivered":
      return "تم التسليم للعميل";
    default:
      return status;
  }
}

module.exports = {
  getAvailableOrders,
  acceptOrder,
  getActiveOrder,
  updateOrderStatus,
  getOrderDetails,
  getOrderHistory,
};
