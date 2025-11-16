const NotificationService = require("./notification.service");
const User = require("../models/User");
const StoreOwner = require("../models/StoreOwner");
const Driver = require("../models/Driver");

// Order Notifications
async function notifyNewOrder(order) {
  try {
    // Notify Store Owner
    const storeOwner = await StoreOwner.findOne({ storeId: order.storeId });
    if (storeOwner?.fcmToken) {
      await NotificationService.sendAndLog(
        storeOwner.fcmToken,
        storeOwner._id,
        "StoreOwner",
        "طلب جديد! 🛎️",
        `طلب جديد برقم ${order.orderNumber} بقيمة ${order.total} جنيه`,
        "order_new",
        { orderId: order._id.toString(), orderNumber: order.orderNumber }
      );
    }

    // Notify Available Drivers
    const availableDrivers = await Driver.find({
      isAvailable: true,
      isActive: true,
      fcmToken: { $ne: null },
    });

    if (availableDrivers.length > 0) {
      const tokens = availableDrivers.map((d) => d.fcmToken);
      await NotificationService.sendToMultipleDevices(
        tokens,
        "طلب جديد متاح! 🚗",
        `طلب توصيل متاح بقيمة ${order.deliveryFee} جنيه`,
        { orderId: order._id.toString(), orderNumber: order.orderNumber }
      );
    }
  } catch (error) {
    console.error("Notify new order error:", error);
  }
}

async function notifyOrderAccepted(order) {
  try {
    // Notify Customer
    const user = await User.findById(order.userId);
    if (user?.fcmToken) {
      await NotificationService.sendAndLog(
        user.fcmToken,
        user._id,
        "User",
        "تم قبول طلبك! ✅",
        `السائق ${
          order.driverId?.name || "جاري التخصيص"
        } قبل طلبك وفي الطريق للمحل`,
        "order_accepted",
        { orderId: order._id.toString() }
      );
    }
  } catch (error) {
    console.error("Notify order accepted error:", error);
  }
}

async function notifyOrderConfirmed(order) {
  try {
    // Notify Customer & Driver
    const user = await User.findById(order.userId);
    const driver = await Driver.findById(order.driverId);

    if (user?.fcmToken) {
      await NotificationService.sendAndLog(
        user.fcmToken,
        user._id,
        "User",
        "المحل أكّد طلبك! 🎉",
        "المحل يحضر طلبك الآن",
        "order_confirmed",
        { orderId: order._id.toString() }
      );
    }

    if (driver?.fcmToken) {
      await NotificationService.sendAndLog(
        driver.fcmToken,
        driver._id,
        "Driver",
        "المحل أكّد الطلب ✅",
        "يمكنك الآن استلام الطلب من المحل",
        "order_confirmed",
        { orderId: order._id.toString() }
      );
    }
  } catch (error) {
    console.error("Notify order confirmed error:", error);
  }
}

async function notifyOrderPickedUp(order) {
  try {
    // Notify Customer
    const user = await User.findById(order.userId);
    if (user?.fcmToken) {
      await NotificationService.sendAndLog(
        user.fcmToken,
        user._id,
        "User",
        "السائق استلم طلبك! 📦",
        `${order.driverId?.name || "السائق"} استلم طلبك وفي الطريق إليك`,
        "order_picked_up",
        { orderId: order._id.toString() }
      );
    }
  } catch (error) {
    console.error("Notify order picked up error:", error);
  }
}

async function notifyOrderOnWay(order) {
  try {
    // Notify Customer
    const user = await User.findById(order.userId);
    if (user?.fcmToken) {
      await NotificationService.sendAndLog(
        user.fcmToken,
        user._id,
        "User",
        "السائق في الطريق! 🚗",
        "طلبك سيصل خلال دقائق",
        "order_on_way",
        { orderId: order._id.toString() }
      );
    }
  } catch (error) {
    console.error("Notify order on way error:", error);
  }
}

async function notifyOrderDelivered(order) {
  try {
    // Notify Customer, Store Owner, Driver
    const user = await User.findById(order.userId);
    const storeOwner = await StoreOwner.findOne({ storeId: order.storeId });

    if (user?.fcmToken) {
      await NotificationService.sendAndLog(
        user.fcmToken,
        user._id,
        "User",
        "تم التوصيل بنجاح! 🎉",
        "نتمنى أن تكون راضياً عن الخدمة",
        "order_delivered",
        { orderId: order._id.toString() }
      );
    }

    if (storeOwner?.fcmToken) {
      await NotificationService.sendAndLog(
        storeOwner.fcmToken,
        storeOwner._id,
        "StoreOwner",
        "تم توصيل الطلب ✅",
        `تم توصيل طلب ${order.orderNumber} بنجاح`,
        "order_delivered",
        { orderId: order._id.toString() }
      );
    }
  } catch (error) {
    console.error("Notify order delivered error:", error);
  }
}

async function notifyOrderCancelled(order) {
  try {
    // Notify Customer and Driver
    const user = await User.findById(order.userId);
    const driver = await Driver.findById(order.driverId);

    if (user?.fcmToken) {
      await NotificationService.sendAndLog(
        user.fcmToken,
        user._id,
        "User",
        "تم إلغاء الطلب! ❌",
        order.cancelReason
          ? `الطلب تم إلغاؤه: ${order.cancelReason}`
          : "تم إلغاء الطلب",
        "order_cancelled",
        { orderId: order._id.toString() }
      );
    }

    if (driver?.fcmToken) {
      await NotificationService.sendAndLog(
        driver.fcmToken,
        driver._id,
        "Driver",
        "تم إلغاء الطلب! ❌",
        `طلب ${order.orderNumber} تم إلغاؤه`,
        "order_cancelled",
        { orderId: order._id.toString() }
      );
    }
  } catch (error) {
    console.error("Notify order cancelled error:", error);
  }
}

module.exports = {
  notifyNewOrder,
  notifyOrderAccepted,
  notifyOrderConfirmed,
  notifyOrderPickedUp,
  notifyOrderOnWay,
  notifyOrderDelivered,
  notifyOrderCancelled,
};
