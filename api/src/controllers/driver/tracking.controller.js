const Driver = require("../../models/Driver");
const Order = require("../../models/Order");
const TrackingService = require("../../services/tracking.service");
const webSocketService = require("../../services/websocket.service");

const updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (lat === undefined || lng === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "الإحداثيات مطلوبة" });
    }

    // Update driver location
    const driver = await TrackingService.updateDriverLocation(
      req.userId,
      parseFloat(lat),
      parseFloat(lng)
    );

    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: "السائق غير موجود" });
    }

    // Broadcast location update via WebSocket
    webSocketService.broadcastDriverLocation(req.userId, {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: "تم تحديث الموقع بنجاح",
    });
  } catch (error) {
    console.error("Update driver location error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const getOrderRouteInfo = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Verify order belongs to driver
    const order = await Order.findOne({
      _id: orderId,
      driverId: req.userId,
    })
      .populate("storeId", "coordinates")
      .populate("userId", "name");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "الطلب غير موجود أو غير مخصص لك" });
    }

    // Get driver current location
    const driver = await TrackingService.getDriverLocation(req.userId);
    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: "الموقع الحالي للسائق غير متوفر" });
    }

    // Calculate distances
    const storeLocation = order.storeId.coordinates;
    const customerLocation = order.address.coordinates;
    const driverLocation = driver.coordinates;

    const distanceToStore = TrackingService.calculateDistance(
      driverLocation.lat,
      driverLocation.lng,
      storeLocation.lat,
      storeLocation.lng
    );

    const distanceToCustomer = TrackingService.calculateDistance(
      driverLocation.lat,
      driverLocation.lng,
      customerLocation.lat,
      customerLocation.lng
    );

    const totalDistance = distanceToStore + distanceToCustomer;

    res.status(200).json({
      success: true,
      data: {
        storeLocation,
        customerLocation,
        myLocation: driverLocation,
        distanceToStore,
        distanceToCustomer,
        totalDistance,
      },
      message: "تم جلب معلومات المسار بنجاح",
    });
  } catch (error) {
    console.error("Get order route info error:", error);
    res.status(50).json({ success: false, message: "خطأ في الخادم" });
  }
};

module.exports = {
  updateLocation,
  getOrderRouteInfo,
};
