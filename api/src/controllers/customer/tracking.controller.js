const Order = require("../../models/Order");
const Driver = require("../../models/Driver");
const TrackingService = require("../../services/tracking.service");

const getTrackingDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("driverId", "name phone coordinates lastLocationUpdate")
      .populate("storeId", "name address coordinates")
      .populate("userId", "name");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "الطلب غير موجود" });
    }

    // Check if user is authorized to track this order
    if (order.userId.toString() !== req.userId.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "غير مصرح لك بتتبع هذا الطلب" });
    }

    // Get tracking information
    const trackingInfo = await TrackingService.getOrderTracking(orderId);

    if (!trackingInfo) {
      return res
        .status(404)
        .json({ success: false, message: "لا توجد معلومات تتبع لهذا الطلب" });
    }

    // Calculate ETA if driver is assigned
    let eta = null;
    if (trackingInfo.driver && trackingInfo.driver.currentLocation) {
      eta = TrackingService.calculateETA(
        trackingInfo.driver.currentLocation,
        trackingInfo.customer.location || trackingInfo.store.location
      );
    }

    res.status(200).json({
      success: true,
      data: {
        ...trackingInfo,
        eta,
      },
      message: "تم جلب معلومات التتبع بنجاح",
    });
  } catch (error) {
    console.error("Get tracking details error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const getDriverLocation = async (req, res) => {
  try {
    const { driverId } = req.params;

    const driver = await Driver.findById(driverId).select(
      "name coordinates lastLocationUpdate"
    );

    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: "السائق غير موجود" });
    }

    // Check if user can access this driver's location (during active delivery)
    const activeOrder = await Order.findOne({
      driverId,
      userId: req.userId,
      status: { $in: ["picked_up", "on_way"] },
    });

    if (!activeOrder) {
      return res
        .status(403)
        .json({
          success: false,
          message: "غير مصرح لك بالوصول إلى موقع السائق",
        });
    }

    res.status(200).json({
      success: true,
      data: {
        driverId: driver._id,
        name: driver.name,
        currentLocation: driver.coordinates,
        lastUpdate: driver.lastLocationUpdate,
      },
      message: "تم جلب موقع السائق بنجاح",
    });
  } catch (error) {
    console.error("Get driver location error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

module.exports = {
  getTrackingDetails,
  getDriverLocation,
};
