/**
 * @file socket/index.js - Socket.io setup
 * @description إعداد Socket.io للتعقب في الوقت الفعلي والإشعارات
 */

const Customer = require('../models/Customer');
const Driver = require('../models/Driver');
const StoreOwner = require('../models/StoreOwner');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

let io;

module.exports = (socketIoInstance) => {
  io = socketIoInstance;

  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.id}`);

    // انضمام العميل إلى غرفة بناءً على معرفه
    socket.on('join_customer_room', async (customerId) => {
      try {
        socket.join(`customer_${customerId}`);
        logger.info(`Customer ${customerId} joined room customer_${customerId}`);
      } catch (error) {
        logger.error(`Error joining customer room: ${error.message}`);
      }
    });

    // انضمام السائق إلى غرفة بناءً على معرفه
    socket.on('join_driver_room', async (driverId) => {
      try {
        socket.join(`driver_${driverId}`);
        logger.info(`Driver ${driverId} joined room driver_${driverId}`);
      } catch (error) {
        logger.error(`Error joining driver room: ${error.message}`);
      }
    });

    // انضمام مالك المتجر إلى غرفة بناءً على معرفه
    socket.on('join_store_owner_room', async (storeOwnerId) => {
      try {
        socket.join(`store_owner_${storeOwnerId}`);
        logger.info(`Store owner ${storeOwnerId} joined room store_owner_${storeOwnerId}`);
      } catch (error) {
        logger.error(`Error joining store owner room: ${error.message}`);
      }
    });

    // انضمام إلى غرفة الطلب
    socket.on('join_order_room', async (orderId) => {
      try {
        socket.join(`order_${orderId}`);
        logger.info(`Socket joined order room ${orderId}`);
      } catch (error) {
        logger.error(`Error joining order room: ${error.message}`);
      }
    });

    // تحديث موقع السائق في الوقت الفعلي
    socket.on('driver_location_update', async (data) => {
      try {
        const { driverId, location, orderId } = data;

        // التحقق من أن السائق موجود
        const driver = await Driver.findById(driverId);
        if (!driver) {
          logger.error(`Driver ${driverId} not found`);
          return;
        }

        // تحديث موقع السائق في قاعدة البيانات
        driver.location = {
          type: 'Point',
          coordinates: [location.longitude, location.latitude]
        };
        await driver.save();

        // إرسال التحديث إلى غرفة الطلب إذا كان محددًا
        if (orderId) {
          io.to(`order_${orderId}`).emit('driver_location_update', {
            driverId,
            location,
            orderId,
            timestamp: new Date()
          });

          // إرسال التحديث إلى غرفة العميل
          const order = await Order.findById(orderId).populate('customer');
          if (order && order.customer) {
            io.to(`customer_${order.customer._id}`).emit('driver_location_update', {
              driverId,
              location,
              orderId,
              timestamp: new Date()
            });
          }
        }

        // إرسال التحديث إلى غرفة السائق
        io.to(`driver_${driverId}`).emit('location_confirmed', {
          driverId,
          location,
          timestamp: new Date()
        });

        logger.info(`Driver ${driverId} location updated: ${location.latitude}, ${location.longitude}`);
      } catch (error) {
        logger.error(`Error updating driver location: ${error.message}`);
      }
    });

    // تحديث حالة الطلب
    socket.on('order_status_update', async (data) => {
      try {
        const { orderId, status, driverId } = data;

        // التحقق من أن الطلب موجود
        const order = await Order.findById(orderId);
        if (!order) {
          logger.error(`Order ${orderId} not found`);
          return;
        }

        // تحديث حالة الطلب في قاعدة البيانات
        order.status = status;
        if (driverId) {
          order.driver = driverId;
        }
        await order.save();

        // إرسال التحديث إلى غرفة الطلب
        io.to(`order_${orderId}`).emit('order_status_update', {
          orderId,
          status,
          driverId,
          timestamp: new Date()
        });

        // إرسال التحديث إلى غرفة العميل
        if (order.customer) {
          io.to(`customer_${order.customer}`).emit('order_status_update', {
            orderId,
            status,
            driverId,
            timestamp: new Date()
          });
        }

        // إرسال التحديث إلى غرفة مالك المتجر
        if (order.store && order.store.owner) {
          io.to(`store_owner_${order.store.owner}`).emit('order_status_update', {
            orderId,
            status,
            driverId,
            timestamp: new Date()
          });
        }

        // إرسال التحديث إلى غرفة السائق إذا تم تعيينه
        if (driverId) {
          io.to(`driver_${driverId}`).emit('order_status_update', {
            orderId,
            status,
            driverId,
            timestamp: new Date()
          });
        }

        logger.info(`Order ${orderId} status updated to: ${status}`);
      } catch (error) {
        logger.error(`Error updating order status: ${error.message}`);
      }
    });

    // إنشاء إشعار جديد
    socket.on('create_notification', async (data) => {
      try {
        const { userId, type, title, message, orderId, userType } = data;

        // إنشاء الإشعار في قاعدة البيانات
        const notification = await Notification.create({
          user: userId,
          type,
          title,
          message,
          data: { orderId }
        });

        // إرسال الإشعار إلى المستخدم بناءً على نوعه
        let roomName = '';
        switch(userType) {
          case 'customer':
            roomName = `customer_${userId}`;
            break;
          case 'driver':
            roomName = `driver_${userId}`;
            break;
          case 'store_owner':
            roomName = `store_owner_${userId}`;
            break;
          default:
            roomName = `customer_${userId}`; // افتراضي
        }

        io.to(roomName).emit('new_notification', {
          notification,
          timestamp: new Date()
        });

        logger.info(`Notification created for ${userType} ${userId}: ${message}`);
      } catch (error) {
        logger.error(`Error creating notification: ${error.message}`);
      }
    });

    // فصل المستخدم
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.id}`);
    });
  });

  // بدء مهام مجدولة باستخدام Socket.io
  startCronJobs();
};

// دالة لبدء المهام المجدولة
function startCronJobs() {
  const cron = require('node-cron');
  const Order = require('../models/Order');

  // مهمة مجدولة للتحقق من الطلبات المعلقة
  cron.schedule('*/5 * * * *', async () => { // كل 5 دقائق
    try {
      // التحقق من الطلبات التي تجاوزت الوقت المقدر للتسليم
      const orders = await Order.find({
        status: { $in: ['on_way'] },
        estimatedDeliveryTime: { $lt: new Date() },
        notifiedLate: { $ne: true }
      });

      for (const order of orders) {
        // إرسال إشعار للعميل بأن التسليم متأخر
        io.to(`customer_${order.customer}`).emit('delivery_delayed', {
          orderId: order._id,
          message: 'Delivery is taking longer than expected',
          timestamp: new Date()
        });

        // تمييز الطلب بأنه تمت إخطاره بتأخير التسليم
        order.notifiedLate = true;
        await order.save();
      }
    } catch (error) {
      logger.error(`Cron job error: ${error.message}`);
    }
  });

  logger.info('Cron jobs started');
}
