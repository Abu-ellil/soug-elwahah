const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Delivery = require('../models/Delivery');

let io;

const initializeSocket = (server) => {
  // Initialize Socket.IO with CORS settings
 io = socketIo(server, {
    cors: {
      origin: [
        'http://localhost:8081',
        'http://localhost:3000', 
        'http://localhost:3001',
        'http://localhost:19006', // Expo dev server
        'https://your-frontend-domain.vercel.app'
      ],
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user in database
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Handle socket connections
  io.on('connection', (socket) => {
    console.log(`User ${socket.user.name} connected with ID: ${socket.id}`);
    
    // Join rooms based on user roles
    if (socket.user.roles.includes('driver')) {
      socket.join(`driver_${socket.user._id}`);
      console.log(`Driver ${socket.user.name} joined driver room`);
    }
    
    if (socket.user.roles.includes('customer')) {
      socket.join(`customer_${socket.user._id}`);
      console.log(`Customer ${socket.user.name} joined customer room`);
    }
    
    if (socket.user.roles.includes('store')) {
      socket.join(`store_${socket.user._id}`);
      console.log(`Store ${socket.user.name} joined store room`);
    }
    
    // Handle delivery location updates from drivers
    socket.on('driver_location_update', async (data) => {
      try {
        const { deliveryId, location } = data;
        
        // Verify this driver is assigned to this delivery
        const delivery = await Delivery.findById(deliveryId);
        if (!delivery) {
          socket.emit('error', { message: 'Delivery not found' });
          return;
        }
        
        if (delivery.driver.toString() !== socket.user._id.toString()) {
          socket.emit('error', { message: 'Not authorized to update this delivery' });
          return;
        }
        
        // Update delivery location
        await delivery.updateCurrentLocation(location);
        
        // Broadcast location update to relevant parties
        io.to(`customer_${delivery.customer}`).emit('delivery_location_update', {
          deliveryId: delivery._id,
          location: delivery.currentLocation,
          estimatedArrival: delivery.estimatedDeliveryTime
        });
        
        io.to(`store_${delivery.store}`).emit('delivery_location_update', {
          deliveryId: delivery._id,
          location: delivery.currentLocation,
          estimatedArrival: delivery.estimatedDeliveryTime
        });
        
        // Update driver's location in their profile as well
        const driver = await User.findById(socket.user._id);
        if (driver && driver.profile && driver.profile.driver) {
          driver.profile.driver.currentLocation = {
            type: 'Point',
            coordinates: [location.longitude, location.latitude]
          };
          await driver.save();
        }
        
        console.log(`Location updated for delivery ${deliveryId} by driver ${socket.user.name}`);
      } catch (error) {
        console.error('Error updating driver location:', error);
        socket.emit('error', { message: 'Failed to update location' });
      }
    });
    
    // Handle delivery status updates
    socket.on('delivery_status_update', async (data) => {
      try {
        const { deliveryId, status, location, note } = data;
        
        // Verify this driver is assigned to this delivery
        const delivery = await Delivery.findById(deliveryId);
        if (!delivery) {
          socket.emit('error', { message: 'Delivery not found' });
          return;
        }
        
        if (delivery.driver.toString() !== socket.user._id.toString()) {
          socket.emit('error', { message: 'Not authorized to update this delivery' });
          return;
        }
        
        // Update delivery status
        await delivery.updateStatus(status, location, note, socket.user._id);
        
        // Update order status accordingly
        if (['picked_up', 'in_transit', 'delivered', 'failed_delivery'].includes(status)) {
          const order = await Delivery.findById(deliveryId).populate('order');
          if (order && order.order) {
            order.order.status = status === 'delivered' ? 'delivered' : 
                                status === 'failed_delivery' ? 'failed_delivery' : 
                                status === 'picked_up' ? 'out_for_delivery' : order.order.status;
            await order.order.save();
          }
        }
        
        // Broadcast status update to relevant parties
        io.to(`customer_${delivery.customer}`).emit('delivery_status_update', {
          deliveryId: delivery._id,
          status: delivery.status,
          location: delivery.currentLocation,
          message: `Delivery status updated to ${status}`
        });
        
        io.to(`store_${delivery.store}`).emit('delivery_status_update', {
          deliveryId: delivery._id,
          status: delivery.status,
          location: delivery.currentLocation,
          message: `Delivery status updated to ${status}`
        });
        
        // If delivery is completed, make driver available again
        if (['delivered', 'failed_delivery', 'cancelled'].includes(status)) {
          const driver = await User.findById(delivery.driver);
          if (driver) {
            driver.profile.driver.isAvailable = true;
            driver.profile.driver.currentDelivery = undefined;
            await driver.save();
          }
        }
        
        console.log(`Status updated for delivery ${deliveryId} by driver ${socket.user.name}`);
      } catch (error) {
        console.error('Error updating delivery status:', error);
        socket.emit('error', { message: 'Failed to update delivery status' });
      }
    });
    
    // Handle new delivery assignment notifications
    socket.on('new_delivery_assigned', async (data) => {
      try {
        const { deliveryId } = data;
        const delivery = await Delivery.findById(deliveryId).populate('customer store');
        
        if (!delivery) {
          socket.emit('error', { message: 'Delivery not found' });
          return;
        }
        
        // Only the assigned driver should receive this notification
        if (delivery.driver.toString() !== socket.user._id.toString()) {
          return;
        }
        
        // Send notification to driver
        socket.emit('new_delivery_assigned', {
          deliveryId: delivery._id,
          orderNumber: delivery.order.orderNumber,
          pickupLocation: delivery.pickupLocation,
          destinationLocation: delivery.destinationLocation,
          customerName: delivery.customer.name,
          customerPhone: delivery.customer.phone
        });
        
        console.log(`New delivery assigned notification sent to driver ${socket.user.name}`);
      } catch (error) {
        console.error('Error sending delivery assignment notification:', error);
      }
    });
    
    // Handle ETA updates
    socket.on('eta_update', async (data) => {
      try {
        const { deliveryId, estimatedArrivalTime } = data;
        
        const delivery = await Delivery.findById(deliveryId);
        if (!delivery) {
          socket.emit('error', { message: 'Delivery not found' });
          return;
        }
        
        if (delivery.driver.toString() !== socket.user._id.toString()) {
          socket.emit('error', { message: 'Not authorized to update ETA for this delivery' });
          return;
        }
        
        // Update ETA in delivery record
        delivery.estimatedDeliveryTime = estimatedArrivalTime;
        await delivery.save();
        
        // Broadcast ETA update to relevant parties
        io.to(`customer_${delivery.customer}`).emit('eta_update', {
          deliveryId: delivery._id,
          estimatedArrivalTime: delivery.estimatedDeliveryTime,
          message: `Estimated arrival time updated`
        });
        
        io.to(`store_${delivery.store}`).emit('eta_update', {
          deliveryId: delivery._id,
          estimatedArrivalTime: delivery.estimatedDeliveryTime,
          message: `Estimated arrival time updated`
        });
        
        console.log(`ETA updated for delivery ${deliveryId} by driver ${socket.user.name}`);
      } catch (error) {
        console.error('Error updating ETA:', error);
        socket.emit('error', { message: 'Failed to update ETA' });
      }
    });
    
    // Handle driver availability updates
    socket.on('driver_availability_update', async (data) => {
      try {
        const { isAvailable } = data;
        
        if (!socket.user.roles.includes('driver')) {
          socket.emit('error', { message: 'Only drivers can update availability' });
          return;
        }
        
        const driver = await User.findById(socket.user._id);
        if (driver) {
          driver.profile.driver.isAvailable = isAvailable;
          await driver.save();
          
          console.log(`Driver ${socket.user.name} availability updated to ${isAvailable}`);
        }
      } catch (error) {
        console.error('Error updating driver availability:', error);
        socket.emit('error', { message: 'Failed to update availability' });
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.name} disconnected with ID: ${socket.id}`);
    });
    
    // Handle connection error
    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  });
  
  return io;
};

// Function to emit delivery updates to specific users
const emitDeliveryUpdate = (eventType, userId, payload, role) => {
  if (!io) {
    console.error('Socket.IO not initialized');
    return;
  }
  
  const room = `${role}_${userId}`;
  io.to(room).emit(eventType, payload);
};

// Function to emit updates to all relevant parties for a delivery
const emitDeliveryUpdateToAll = async (deliveryId, eventType, payload) => {
  if (!io) {
    console.error('Socket.IO not initialized');
    return;
  }
  
  try {
    const delivery = await Delivery.findById(deliveryId).populate('driver customer store');
    if (!delivery) {
      console.error('Delivery not found for emitting update');
      return;
    }
    
    // Emit to customer
    io.to(`customer_${delivery.customer._id}`).emit(eventType, { ...payload, deliveryId });
    
    // Emit to store
    io.to(`store_${delivery.store._id}`).emit(eventType, { ...payload, deliveryId });
    
    // Emit to driver
    io.to(`driver_${delivery.driver._id}`).emit(eventType, { ...payload, deliveryId });
  } catch (error) {
    console.error('Error emitting delivery update to all parties:', error);
  }
};

module.exports = {
  initializeSocket,
 emitDeliveryUpdate,
  emitDeliveryUpdateToAll
};