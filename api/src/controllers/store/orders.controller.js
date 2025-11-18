const Order = require("../../models/Order");
const Store = require("../../models/Store");
const NotificationService = require("../../services/notification.service");
const webSocketService = require("../../services/websocket.service");
const {
  notifyOrderConfirmed,
  notifyOrderCancelled,
} = require("../../services/notification.service");

const getStoreOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    // Verify store exists and belongs to owner
    const store = await Store.findOne({ ownerId: req.userId });
    if (!store) {
      return res
        .status(404)
        .json({ success: false, message: "المحل غير موجود" });
    }

    let filter = { storeId: store._id };
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate("userId", "name phone")
      .populate("items.productId", "name image")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

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
      message: "تم جلب الطلبات بنجاح",
    });
  } catch (error) {
    console.error("Get store orders error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Verify store exists and belongs to owner
    const store = await Store.findOne({ ownerId: req.userId });
    if (!store) {
      return res
        .status(404)
        .json({ success: false, message: "المحل غير موجود" });
    }

    const order = await Order.findById(orderId)
      .populate("userId", "name phone")
      .populate("driverId", "name phone")
      .populate("items.productId", "name price image");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "الطلب غير موجود" });
    }

    if (order.storeId.toString() !== store._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "غير مصرح لك بالوصول إلى هذا الطلب" });
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

const confirmOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Verify store exists and belongs to owner
    const store = await Store.findOne({ ownerId: req.userId });
    if (!store) {
      return res
        .status(404)
        .json({ success: false, message: "المحل غير موجود" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "الطلب غير موجود" });
    }

    if (order.storeId.toString() !== store._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "غير مصرح لك بالوصول إلى هذا الطلب" });
    }

    if (order.status !== "pending") {
      return res
        .status(400)
        .json({
          success: false,
          message: "لا يمكن تأكيد هذا الطلب في هذه المرحلة",
        });
    }

    // Update order status
    order.status = "confirmed";
    order.timeline.push({
      status: "confirmed",
      label: "تم التأكيد من المحل",
      time: new Date(),
    });
    await order.save();

    // Populate order for response
    const populatedOrder = await Order.findById(order._id)
      .populate("storeId", "name")
      .populate("items.productId", "name image")
      .populate("userId", "name phone")
      .populate("driverId", "name phone");

    // Notify customer and driver
    await notifyOrderConfirmed(populatedOrder);

    // Broadcast order update via WebSocket
    webSocketService.broadcastOrderUpdate(order._id, populatedOrder, [
      populatedOrder.userId._id,  // Customer
      populatedOrder.driverId  // Driver if assigned
    ]);

    res.status(200).json({
      success: true,
      data: { order: populatedOrder },
      message: "تم تأكيد الطلب بنجاح",
    });
  } catch (error) {
    console.error("Confirm order error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { cancelReason } = req.body;

    // Verify store exists and belongs to owner
    const store = await Store.findOne({ ownerId: req.userId });
    if (!store) {
      return res
        .status(404)
        .json({ success: false, message: "المحل غير موجود" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "الطلب غير موجود" });
    }

    if (order.storeId.toString() !== store._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "غير مصرح لك بالوصول إلى هذا الطلب" });
    }

    if (order.status !== "pending" && order.status !== "confirmed") {
      return res
        .status(400)
        .json({
          success: false,
          message: "لا يمكن إلغاء هذا الطلب في هذه المرحلة",
        });
    }

    // Update order status
    order.status = "cancelled";
    order.cancelReason = cancelReason;
    order.timeline.push({
      status: "cancelled",
      label: "تم الإلغاء من المحل",
      time: new Date(),
    });
    await order.save();

    // Populate order for response
    const populatedOrder = await Order.findById(order._id)
      .populate("storeId", "name")
      .populate("items.productId", "name image")
      .populate("userId", "name phone")
      .populate("driverId", "name phone");

    // Notify customer and driver
    await notifyOrderCancelled(populatedOrder);

    // Broadcast order update via WebSocket
    webSocketService.broadcastOrderUpdate(order._id, populatedOrder, [
      populatedOrder.userId._id,  // Customer
      populatedOrder.driverId  // Driver if assigned
    ]);

    res.status(200).json({
      success: true,
      data: { order: populatedOrder },
      message: "تم إلغاء الطلب بنجاح",
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

module.exports = {
  getStoreOrders,
  getOrderDetails,
  confirmOrder,
  cancelOrder,
};
