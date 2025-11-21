const Delivery = require('../models/Delivery');
const Order = require('../models/Order');
const User = require('../models/User');
const { emitDeliveryUpdateToAll } = require('../config/socket');

class DeliveryService {
  /**
   * Find the best available driver for a delivery based on multiple criteria
   */
 static async findBestDriver(orderId) {
    try {
      // Get order details
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Get all available drivers
      const availableDrivers = await User.find({
        'roles': 'driver',
        'profile.driver.isAvailable': true,
        'isActive': true,
        'isVerified': true
      });

      if (availableDrivers.length === 0) {
        throw new Error('No available drivers');
      }

      // Calculate scores for each driver
      const driverScores = await Promise.all(
        availableDrivers.map(async (driver) => {
          let score = 0;
          const driverLocation = driver.profile?.driver?.currentLocation?.coordinates;

          // If driver has location, calculate distance factor
          if (driverLocation && order.deliveryInfo?.coordinates) {
            const distance = this.calculateDistance(
              driverLocation[1], // lat
              driverLocation[0], // lng
              order.deliveryInfo.coordinates[1], // lat
              order.deliveryInfo.coordinates[0]  // lng
            );
            
            // Distance score: closer drivers get higher score (max 50 points)
            score += Math.max(0, 50 - (distance / 1000)); // distance in meters
          }

          // Rating score: higher rated drivers get higher score (max 30 points)
          if (driver.profile?.driver?.ratings?.length > 0) {
            const avgRating = driver.profile.driver.ratings.reduce((a, b) => a + b, 0) / 
                              driver.profile.driver.ratings.length;
            score += avgRating * 6; // 5 * 6 = 30 max
          }

          // Availability score: drivers with fewer active deliveries get higher score (max 20 points)
          const activeDeliveries = driver.profile?.driver?.currentDelivery ? 1 : 0;
          score += Math.max(0, 20 - (activeDeliveries * 5));

          return {
            driver,
            score
          };
        })
      );

      // Sort drivers by score (highest first)
      driverScores.sort((a, b) => b.score - a.score);

      return driverScores[0]?.driver || null;
    } catch (error) {
      console.error('Error finding best driver:', error);
      throw error;
    }
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  /**
   * Create a delivery assignment
   */
 static async createDeliveryAssignment(orderId, driverId = null, options = {}) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // If no driver specified, find the best available driver
      let selectedDriver;
      if (!driverId) {
        selectedDriver = await this.findBestDriver(orderId);
        if (!selectedDriver) {
          throw new Error('No suitable driver available');
        }
        driverId = selectedDriver._id;
      } else {
        selectedDriver = await User.findById(driverId);
        if (!selectedDriver || !selectedDriver.roles.includes('driver')) {
          throw new Error('Invalid driver specified');
        }
      }

      // Check if driver is available
      if (!selectedDriver.profile.driver.isAvailable) {
        throw new Error('Driver is not available');
      }

      // Check if order is ready for delivery
      if (order.status !== 'ready') {
        throw new Error('Order must be in "ready" status to assign delivery');
      }

      // Create delivery assignment
      const delivery = await Delivery.create({
        order: order._id,
        driver: driverId,
        store: order.seller,
        customer: order.customer,
        pickupLocation: {
          type: 'Point',
          coordinates: order.deliveryInfo.coordinates || [31.2357, 30.0444], // Default to Cairo coordinates
          address: this.formatAddress(order.deliveryInfo.address)
        },
        destinationLocation: {
          type: 'Point',
          coordinates: order.deliveryInfo.coordinates || [31.2357, 30.0444], // Default to Cairo coordinates
          address: this.formatAddress(order.deliveryInfo.address)
        },
        deliveryInstructions: order.notes?.seller || '',
        priority: order.isUrgent ? 'urgent' : 'normal',
        isUrgent: order.isUrgent || false
      });

      // Update order with delivery assignment
      order.deliveryAssignment = {
        deliveryId: delivery._id,
        assignedDriver: driverId,
        assignedAt: new Date(),
        assignedBy: options.assignedBy || null
      };
      await order.save();

      // Update driver's availability and current delivery
      selectedDriver.profile.driver.isAvailable = false;
      selectedDriver.profile.driver.currentDelivery = {
        deliveryId: delivery._id,
        orderId: order._id,
        startedAt: new Date()
      };
      await selectedDriver.save();

      // Update order status to reflect delivery assignment
      order.status = 'pending_assignment'; // This will be updated to driver_assigned once driver accepts
      await order.save();

      // Emit real-time update to all relevant parties
      await emitDeliveryUpdateToAll(delivery._id, 'new_delivery_assigned', {
        message: 'New delivery has been assigned',
        delivery: delivery.toObject()
      });

      return delivery;
    } catch (error) {
      console.error('Error creating delivery assignment:', error);
      throw error;
    }
  }

  /**
   * Format address for consistent display
   */
  static formatAddress(address) {
    if (!address) return 'Address not specified';
    
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.governorate) parts.push(address.governorate);
    
    return parts.join(', ') || 'Address not specified';
  }

  /**
   * Calculate estimated delivery time
   */
  static async calculateEstimatedDeliveryTime(deliveryId) {
    try {
      const delivery = await Delivery.findById(deliveryId);
      if (!delivery) {
        throw new Error('Delivery not found');
      }

      // If we have both pickup and destination coordinates, calculate route time
      if (delivery.pickupLocation.coordinates && delivery.destinationLocation.coordinates) {
        // Calculate distance between pickup and destination
        const distance = this.calculateDistance(
          delivery.pickupLocation.coordinates[1], // lat
          delivery.pickupLocation.coordinates[0], // lng
          delivery.destinationLocation.coordinates[1], // lat
          delivery.destinationLocation.coordinates[0] // lng
        );

        // Estimate time based on distance (average 20 km/h in city)
        const estimatedMinutes = Math.round((distance / 1000) / 20 * 60);
        
        // Add buffer time for pickup and delivery processes (10 mins each)
        const totalEstimatedMinutes = estimatedMinutes + 20;
        
        const estimatedDeliveryTime = new Date();
        estimatedDeliveryTime.setMinutes(estimatedDeliveryTime.getMinutes() + totalEstimatedMinutes);
        
        return {
          estimatedTime: estimatedDeliveryTime,
          estimatedMinutes: totalEstimatedMinutes,
          distanceInKm: Math.round(distance / 1000)
        };
      }

      // If no coordinates, return default estimate
      const defaultEstimatedTime = new Date();
      defaultEstimatedTime.setMinutes(defaultEstimatedTime.getMinutes() + 45); // Default 45 mins
      
      return {
        estimatedTime: defaultEstimatedTime,
        estimatedMinutes: 45,
        distanceInKm: null
      };
    } catch (error) {
      console.error('Error calculating estimated delivery time:', error);
      throw error;
    }
  }

  /**
   * Get delivery analytics for a specific driver
   */
  static async getDriverAnalytics(driverId) {
    try {
      const driver = await User.findById(driverId);
      if (!driver || !driver.roles.includes('driver')) {
        throw new Error('Invalid driver');
      }

      const analytics = await Delivery.aggregate([
        { $match: { driver: driverId } },
        {
          $group: {
            _id: null,
            totalDeliveries: { $sum: 1 },
            completedDeliveries: {
              $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
            },
            cancelledDeliveries: {
              $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
            },
            failedDeliveries: {
              $sum: { $cond: [{ $eq: ['$status', 'failed_delivery'] }, 1, 0] }
            },
            totalEarnings: { $sum: '$deliveryCost.amount' },
            avgRating: { $avg: '$customerRating.rating' },
            avgDeliveryTime: { $avg: '$totalDeliveryTime' }
          }
        }
      ]);

      return analytics[0] || {
        totalDeliveries: 0,
        completedDeliveries: 0,
        cancelledDeliveries: 0,
        failedDeliveries: 0,
        totalEarnings: 0,
        avgRating: 0,
        avgDeliveryTime: 0
      };
    } catch (error) {
      console.error('Error getting driver analytics:', error);
      throw error;
    }
  }

  /**
   * Get delivery analytics for a specific store
   */
  static async getStoreAnalytics(storeId) {
    try {
      const analytics = await Delivery.aggregate([
        { $match: { store: storeId } },
        {
          $group: {
            _id: null,
            totalDeliveries: { $sum: 1 },
            completedDeliveries: {
              $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
            },
            onTimeDeliveries: {
              $sum: { 
                $cond: [
                  { $lte: ['$deliveryTime', '$estimatedDeliveryTime'] }, 
                  1, 
                  0
                ] 
              }
            },
            avgDeliveryTime: { $avg: '$totalDeliveryTime' },
            totalDeliveryCost: { $sum: '$deliveryCost.amount' }
          }
        }
      ]);

      const result = analytics[0] || {
        totalDeliveries: 0,
        completedDeliveries: 0,
        onTimeDeliveries: 0,
        avgDeliveryTime: 0,
        totalDeliveryCost: 0
      };

      // Calculate on-time rate
      result.onTimeRate = result.totalDeliveries > 0 
        ? (result.onTimeDeliveries / result.totalDeliveries) * 100 
        : 0;

      return result;
    } catch (error) {
      console.error('Error getting store analytics:', error);
      throw error;
    }
  }

  /**
   * Auto-assign drivers to orders that are ready but not assigned
   */
  static async autoAssignDeliveries() {
    try {
      // Find orders that are ready but not assigned to delivery
      const readyOrders = await Order.find({
        status: 'ready',
        'deliveryAssignment.deliveryId': { $exists: false }
      });

      const results = [];

      for (const order of readyOrders) {
        try {
          const delivery = await this.createDeliveryAssignment(
            order._id,
            null, // Let system find best driver
            { autoAssigned: true }
          );
          
          results.push({
            orderId: order._id,
            deliveryId: delivery._id,
            status: 'assigned',
            message: 'Auto-assigned successfully'
          });
        } catch (error) {
          results.push({
            orderId: order._id,
            status: 'failed',
            message: error.message
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error in auto-assign deliveries:', error);
      throw error;
    }
  }

  /**
   * Handle delivery status change and update related systems
   */
  static async handleDeliveryStatusChange(deliveryId, newStatus, updatedBy = null) {
    try {
      const delivery = await Delivery.findById(deliveryId);
      if (!delivery) {
        throw new Error('Delivery not found');
      }

      // Update delivery status
      await delivery.updateStatus(newStatus, null, '', updatedBy);

      // Update related order status based on delivery status
      const order = await Order.findById(delivery.order);
      if (order) {
        switch(newStatus) {
          case 'picked_up':
            order.status = 'out_for_delivery';
            break;
          case 'delivered':
            order.status = 'delivered';
            break;
          case 'failed_delivery':
            order.status = 'failed_delivery';
            break;
          case 'cancelled':
            order.status = 'cancelled';
            // Remove delivery assignment
            order.deliveryAssignment = undefined;
            break;
        }
        await order.save();
      }

      // Update driver availability if delivery is completed
      if (['delivered', 'failed_delivery', 'cancelled'].includes(newStatus)) {
        const driver = await User.findById(delivery.driver);
        if (driver) {
          driver.profile.driver.isAvailable = true;
          driver.profile.driver.currentDelivery = undefined;
          
          // Update driver's delivery statistics
          if (newStatus === 'delivered') {
            driver.profile.driver.deliveryStats.completedDeliveries += 1;
          } else if (newStatus === 'failed_delivery') {
            driver.profile.driver.deliveryStats.cancelledDeliveries += 1;
          }
          
          await driver.save();
        }
      }

      // Emit real-time update to all relevant parties
      await emitDeliveryUpdateToAll(deliveryId, 'delivery_status_update', {
        status: newStatus,
        message: `Delivery status updated to ${newStatus}`
      });

      return delivery;
    } catch (error) {
      console.error('Error handling delivery status change:', error);
      throw error;
    }
  }
}

module.exports = DeliveryService;