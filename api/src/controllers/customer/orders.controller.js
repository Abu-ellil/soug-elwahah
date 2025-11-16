const Order = require("../../models/Order");
const Store = require("../../models/Store");
const Product = require("../../models/Product");
const User = require("../../models/User");
const NotificationService = require("../../services/notification.service");
const { notifyNewOrder } = require("../../services/notification.service");

const createOrder = async (req, res) => {
  try {
    const { storeId, items, address, paymentMethod, notes } = req.body;

    // Validate store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res
        .status(404)
        .json({ success: false, message: "المحل غير موجود" });
    }

    // Validate products and calculate total
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isAvailable) {
        return res
          .status(404)
          .json({
            success: false,
            message: `المنتج ${item.productId} غير متوفر`,
          });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image,
      });
    }

    // Calculate delivery fee and total
    const deliveryFee = store.deliveryFee;
    const total = subtotal + deliveryFee;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    // Create order
    const order = new Order({
      orderNumber,
      userId: req.userId,
      storeId,
      items: orderItems,
      subtotal,
      deliveryFee,
      total,
      address,
      paymentMethod,
      notes,
      timeline: [
        {
          status: "pending",
          label: "في الانتظار",
          time: new Date(),
        },
      ],
    });

    await order.save();

    // Populate order for response
    const populatedOrder = await Order.findById(order._id)
      .populate("items.productId", "name price image")
      .populate("storeId", "name phone address")
      .populate("userId", "name phone");

    // Notify store owner and available drivers
    await notifyNewOrder(populatedOrder);

    res.status(201).json({
      success: true,
      data: { order: populatedOrder },
      message: "تم إنشاء الطلب بنجاح",
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let filter = { userId: req.userId };
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate("storeId", "name image")
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
    console.error("Get orders error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("storeId", "name phone address image deliveryTime deliveryFee")
      .populate("items.productId", "name price image")
      .populate("userId", "name phone")
      .populate("driverId", "name phone");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "الطلب غير موجود" });
    }

    if (order.userId.toString() !== req.userId.toString()) {
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

const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { cancelReason } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "الطلب غير موجود" });
    }

    if (order.userId.toString() !== req.userId.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "غير مصرح لك بإلغاء هذا الطلب" });
    }

    if (order.status !== "pending" && order.status !== "accepted") {
      return res
        .status(400)
        .json({
          success: false,
          message: "لا يمكن إلغاء الطلب في هذه المرحلة",
        });
    }

    // Update order status
    order.status = "cancelled";
    order.cancelReason = cancelReason;
    order.timeline.push({
      status: "cancelled",
      label: "تم الإلغاء",
      time: new Date(),
    });
    await order.save();

    // Populate order for response
    const populatedOrder = await Order.findById(order._id)
      .populate("storeId", "name")
      .populate("items.productId", "name image")
      .populate("userId", "name phone");

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

const reorder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const originalOrder = await Order.findById(orderId);
    if (!originalOrder) {
      return res
        .status(404)
        .json({ success: false, message: "الطلب الأصلي غير موجود" });
    }

    if (originalOrder.userId.toString() !== req.userId.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "غير مصرح لك بإعادة هذا الطلب" });
    }

    // Create new order with same items
    const orderNumber = `ORD-${Date.now()}`;

    const newOrder = new Order({
      orderNumber,
      userId: req.userId,
      storeId: originalOrder.storeId,
      items: originalOrder.items,
      subtotal: originalOrder.subtotal,
      deliveryFee: originalOrder.deliveryFee,
      total: originalOrder.total,
      address: originalOrder.address,
      paymentMethod: originalOrder.paymentMethod,
      notes: originalOrder.notes,
      timeline: [
        {
          status: "pending",
          label: "في الانتظار",
          time: new Date(),
        },
      ],
    });

    await newOrder.save();

    // Populate order for response
    const populatedOrder = await Order.findById(newOrder._id)
      .populate("storeId", "name phone address")
      .populate("items.productId", "name price image")
      .populate("userId", "name phone");

    // Notify store owner and available drivers
    await notifyNewOrder(populatedOrder);

    res.status(201).json({
      success: true,
      data: { newOrder: populatedOrder },
      message: "تم إنشاء الطلب الجديد بنجاح",
    });
  } catch (error) {
    console.error("Reorder error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderDetails,
  cancelOrder,
  reorder,
};
