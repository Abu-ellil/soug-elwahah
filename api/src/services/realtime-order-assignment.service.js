const Order = require("../models/Order");
const Driver = require("../models/Driver");
const Store = require("../models/Store");
const webSocketService = require("./websocket.service");

class RealTimeOrderAssignmentService {
  constructor() {
    this.activeDrivers = new Map(); // Track active drivers and their locations
    this.orderAssignmentTimeout = 30000; // 5 minutes timeout for order assignment
  }

  // Initialize the service with WebSocket
  init(io) {
    this.io = io;
  }

  // Find nearby available drivers for a new order
  async findNearbyAvailableDrivers(order, radiusKm = 10) {
    try {
      const store = await Store.findById(order.storeId);
      if (!store || !store.coordinates) {
        console.error("Store or coordinates not found for order:", order._id);
        return [];
      }

      // Find nearby available drivers
      const nearbyDrivers = await Driver.find({
        isAvailable: true,
        isActive: true,
        coordinates: {
          $geoWithin: {
            $centerSphere: [
              [store.coordinates.lng, store.coordinates.lat],
              radiusKm / 6378.1 // Convert km to radians
            ]
          }
        }
      }).select("_id name coordinates vehicleType");

      return nearbyDrivers;
    } catch (error) {
      console.error("Error finding nearby drivers:", error);
      return [];
    }
  }

  // Broadcast new order to nearby available drivers
  async broadcastOrderToDrivers(order, driverIds = []) {
    if (!this.io) {
      console.error("WebSocket server not initialized");
      return;
    }

    // If no specific drivers provided, find nearby available drivers
    if (!driverIds.length) {
      const nearbyDrivers = await this.findNearbyAvailableDrivers(order);
      driverIds = nearbyDrivers.map(driver => driver._id.toString());
    }

    // Add order to available drivers room
    driverIds.forEach(driverId => {
      this.io.to(`driver_${driverId}`).emit('newOrderAvailable', {
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          storeId: order.storeId,
          storeName: order.storeId?.name || 'Unknown Store',
          total: order.total,
          address: order.address,
          createdAt: order.createdAt,
        },
        timestamp: new Date().toISOString()
      });

      // Also emit to the available drivers room
      this.io.to('available_drivers').emit('newOrderAvailable', {
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          storeId: order.storeId,
          storeName: order.storeId?.name || 'Unknown Store',
          total: order.total,
          address: order.address,
          createdAt: order.createdAt,
        },
        timestamp: new Date().toISOString()
      });
    });

    console.log(`Broadcasted order ${order._id} to ${driverIds.length} drivers`);
  }

  // Handle driver order acceptance
  async handleOrderAcceptance(driverId, orderId) {
    try {
      // Find the order that is still unassigned
      const order = await Order.findOne({
        _id: orderId,
        status: "confirmed", // Only confirmed orders can be accepted
        driverId: null // Not assigned to any driver yet
      });

      if (!order) {
        return { success: false, message: "Order not available" };
      }

      // Check if driver is available
      const driver = await Driver.findById(driverId);
      if (!driver || !driver.isAvailable || !driver.isActive) {
        return { success: false, message: "Driver not available" };
      }

      // Assign the order to the driver
      order.driverId = driverId;
      order.driverAssignedAt = new Date();
      order.status = "accepted";
      order.timeline.push({
        status: "accepted",
        label: "تم قبول الطلب من السائق",
        time: new Date(),
      });

      await order.save();

      // Update driver's stats
      await Driver.findByIdAndUpdate(driverId, {
        $inc: { totalOrders: 1 },
      });

      // Broadcast order assignment to all relevant parties
      webSocketService.broadcastOrderUpdate(order._id, order, [
        order.userId.toString(),  // Customer
        order.storeId.toString()  // Store
      ]);

      // Notify customer via WebSocket and push notification
      this.io.to(`user_${order.userId}`).emit('orderAccepted', {
        orderId: order._id,
        driverId: driverId,
        driverName: driver.name,
        message: `السائق ${driver.name} قبل طلبك وفي الطريق للمحل`,
        timestamp: new Date().toISOString()
      });

      return { success: true, order };
    } catch (error) {
      console.error("Error handling order acceptance:", error);
      return { success: false, message: "Error processing order acceptance" };
    }
  }

  // Track active drivers
  addActiveDriver(driverId, socketId) {
    this.activeDrivers.set(driverId, {
      socketId,
      lastSeen: new Date(),
      status: 'available'
    });
  }

  // Remove active driver
  removeActiveDriver(driverId) {
    this.activeDrivers.delete(driverId);
  }

  // Update driver status
  updateDriverStatus(driverId, status) {
    const driver = this.activeDrivers.get(driverId);
    if (driver) {
      driver.status = status;
      driver.lastSeen = new Date();
    }
  }

  // Get active driver status
  getDriverStatus(driverId) {
    return this.activeDrivers.get(driverId) || null;
  }

  // Get all active drivers
  getAllActiveDrivers() {
    return Array.from(this.activeDrivers.entries()).map(([id, data]) => ({
      driverId: id,
      ...data
    }));
  }
}

module.exports = new RealTimeOrderAssignmentService();