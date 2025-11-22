const Driver = require("../models/Driver");
const Order = require("../models/Order");

class TrackingService {
  // Update driver location
  async updateDriverLocation(driverId, lat, lng) {
    try {
      const driver = await Driver.findByIdAndUpdate(
        driverId,
        {
          coordinates: { lat, lng },
          lastLocationUpdate: new Date(),
        },
        { new: true }
      );

      return driver;
    } catch (error) {
      console.error("Update Location Error:", error);
      return null;
    }
  }

  // Get driver current location
  async getDriverLocation(driverId) {
    try {
      const driver = await Driver.findById(driverId).select(
        "coordinates lastLocationUpdate name"
      );
      return driver;
    } catch (error) {
      console.error("Get Location Error:", error);
      return null;
    }
  }

  // Get active order with driver location
  async getOrderTracking(orderId) {
    try {
      const order = await Order.findById(orderId)
        .populate("driverId", "name phone coordinates lastLocationUpdate")
        .populate("storeId", "name address coordinates");

      if (!order) return null;

      return {
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          customerAddress: order.address,
        },
        driver: order.driverId
          ? {
              id: order.driverId._id,
              name: order.driverId.name,
              phone: order.driverId.phone,
              currentLocation: order.driverId.coordinates,
              lastUpdate: order.driverId.lastLocationUpdate,
            }
          : null,
        store: {
          id: order.storeId._id,
          name: order.storeId.name,
          address: order.storeId.address,
          location: order.storeId.coordinates,
        },
        customer: {
          address: order.address.details,
          location: order.address.coordinates,
        },
      };
    } catch (error) {
      console.error("Get Order Tracking Error:", error);
      return null;
    }
  }

  // Calculate ETA (Estimated Time of Arrival)
  calculateETA(driverLocation, destinationLocation, avgSpeed = 30) {
    // avgSpeed in km/h (default 30 km/h for cities/villages)
    const distance = this.calculateDistance(
      driverLocation.lat,
      driverLocation.lng,
      destinationLocation.lat,
      destinationLocation.lng
    );

    const timeInHours = distance / avgSpeed;
    const timeInMinutes = Math.ceil(timeInHours * 60);

    return {
      distance: distance.toFixed(2), // km
      estimatedTime: timeInMinutes, // minutes
    };
  }

  // Haversine formula for distance
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }
}

module.exports = new TrackingService();
