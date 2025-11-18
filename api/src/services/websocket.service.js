class WebSocketService {
  constructor() {
    this.io = null;
  }

  // Initialize the service with the Socket.IO instance
  init(io) {
    this.io = io;
  }

  // Broadcast order status update to relevant parties
  broadcastOrderUpdate(orderId, orderData, userIds = []) {
    if (!this.io) return;

    // Broadcast to all users interested in this order
    this.io.to(`order_${orderId}`).emit('orderUpdate', {
      orderId,
      order: orderData,
      timestamp: new Date().toISOString()
    });

    // Broadcast to specific users if provided
    userIds.forEach(userId => {
      this.io.to(`user_${userId}`).emit('orderUpdate', {
        orderId,
        order: orderData,
        timestamp: new Date().toISOString()
      });
    });

    // Also emit to role-specific rooms
    this.io.to(`customer_${orderData.userId}`).emit('orderUpdate', {
      orderId,
      order: orderData,
      timestamp: new Date().toISOString()
    });

    if (orderData.driverId) {
      this.io.to(`driver_${orderData.driverId}`).emit('orderUpdate', {
        orderId,
        order: orderData,
        timestamp: new Date().toISOString()
      });
    }

    if (orderData.storeId) {
      // Find store owner and emit to them
      this.io.to(`store_${orderData.storeId}`).emit('orderUpdate', {
        orderId,
        order: orderData,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Broadcast new order to available drivers
  broadcastNewOrder(order, driverIds = []) {
    if (!this.io) return;

    // Broadcast to specific drivers if provided
    driverIds.forEach(driverId => {
      this.io.to(`driver_${driverId}`).emit('newOrder', {
        order,
        timestamp: new Date().toISOString()
      });
    });

    // Broadcast to all available drivers room
    this.io.to('available_drivers').emit('newOrder', {
      order,
      timestamp: new Date().toISOString()
    });
  }

  // Broadcast driver location update
  broadcastDriverLocation(driverId, locationData) {
    if (!this.io) return;

    // Emit to driver's room
    this.io.to(`driver_${driverId}`).emit('locationUpdate', {
      driverId,
      location: locationData,
      timestamp: new Date().toISOString()
    });

    // Emit to any orders assigned to this driver
    // This would need to be implemented with order tracking
    this.io.to(`driver_orders_${driverId}`).emit('driverLocationUpdate', {
      driverId,
      location: locationData,
      timestamp: new Date().toISOString()
    });
  }

  // Broadcast notification to user
  broadcastNotification(userId, notificationData) {
    if (!this.io) return;

    this.io.to(`user_${userId}`).emit('notification', {
      ...notificationData,
      timestamp: new Date().toISOString()
    });
  }

  // Join specific rooms
  joinRoom(socketId, roomName) {
    if (!this.io) return;
    const socket = this.io.sockets.sockets.get(socketId);
    if (socket) {
      socket.join(roomName);
    }
  }

  // Leave specific rooms
  leaveRoom(socketId, roomName) {
    if (!this.io) return;
    const socket = this.io.sockets.sockets.get(socketId);
    if (socket) {
      socket.leave(roomName);
    }
  }

  // Get connected user count
  getUserCount() {
    if (!this.io) return 0;
    return this.io.engine.clientsCount;
  }

  // Get users in a specific room
  getUsersInRoom(roomName) {
    if (!this.io) return [];
    const room = this.io.sockets.adapter.rooms.get(roomName);
    return room ? Array.from(room) : [];
  }
}

module.exports = new WebSocketService();