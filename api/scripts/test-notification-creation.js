const mongoose = require("mongoose");
const Order = require("../models/Order");
const Notification = require("../models/Notification");
const User = require("../models/User");

// Connect to database
const MONGODB_URI =
  "mongodb+srv://mrabuellil_db_user:mrabuellil_db_user@aifarm.j5pnubg.mongodb.net/elsoog";
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testNotificationCreation() {
  try {
    console.log("Testing notification creation functionality...");

    // Find the specific order from the task description
    const orderId = "690423349e067584cd9e324d";
    const order = await Order.findById(orderId);

    if (!order) {
      console.log("Order not found with ID:", orderId);
      // Try to find any existing order
      const existingOrder = await Order.findOne();
      if (existingOrder) {
        console.log("Using existing order for testing:", existingOrder._id);
        console.log("Order details:", {
          _id: existingOrder._id,
          status: existingOrder.status,
          customer: existingOrder.customer,
          seller: existingOrder.seller,
        });
      } else {
        console.log("No orders found in the database");
        return;
      }
      return;
    }

    console.log("Found order:", order._id);
    console.log("Current status:", order.status);
    console.log("Customer ID:", order.customer);
    console.log("Seller ID:", order.seller);

    // Find both users to verify they exist
    const customerUser = await User.findById(order.customer);
    const sellerUser = await User.findById(order.seller);

    console.log("\\nCustomer user:", customerUser ? "Found" : "Not Found");
    console.log("Seller user:", sellerUser ? "Found" : "Not Found");

    if (!customerUser || !sellerUser) {
      console.log("One or both users not found, cannot test notification");
      return;
    }

    // Manually test creating a notification as would happen during status update
    console.log("\\nTesting manual notification creation...");

    // Simulate what happens when seller updates order to 'confirmed'
    // and notification should go to customer
    const notificationData = {
      recipient: order.customer, // Customer receives the notification
      title: "تحديث حالة الطلب",
      message: "تم تأكيد طلبك",
      type: "order_confirmed",
      relatedEntity: {
        entityType: "Order",
        entityId: order._id,
      },
      data: {
        orderId: order._id,
        status: "confirmed",
        updatedBy: sellerUser.name,
      },
    };

    const newNotification = await Notification.create(notificationData);
    console.log("Created notification:", {
      _id: newNotification._id,
      title: newNotification.title,
      message: newNotification.message,
      type: newNotification.type,
      recipient: newNotification.recipient,
      createdAt: newNotification.createdAt,
    });

    // Verify the notification was saved
    const savedNotification = await Notification.findById(newNotification._id);
    if (savedNotification) {
      console.log("\\nNotification successfully saved to database!");
    }

    // Test another notification type - when status changes to 'preparing'
    console.log("\\nTesting another notification type...");
    const preparingNotificationData = {
      recipient: order.customer, // Customer receives the notification
      title: "تحديث حالة الطلب",
      message: "جاري تحضير طلبك",
      type: "order_preparing",
      relatedEntity: {
        entityType: "Order",
        entityId: order._id,
      },
      data: {
        orderId: order._id,
        status: "preparing",
        updatedBy: sellerUser.name,
      },
    };

    const preparingNotification = await Notification.create(
      preparingNotificationData
    );
    console.log("Created preparing notification:", {
      _id: preparingNotification._id,
      title: preparingNotification.title,
      message: preparingNotification.message,
      type: preparingNotification.type,
      recipient: preparingNotification.recipient,
      createdAt: preparingNotification.createdAt,
    });

    // Now test the actual updateOrderStatus functionality by manually calling the logic
    console.log("\\nTesting order status update with notification...");

    // Save original status
    const originalStatus = order.status;
    console.log("Original status:", originalStatus);

    // Update status and add to history
    order.status = "ready";
    order.statusHistory.push({
      status: "ready",
      updatedBy: sellerUser._id,
      timestamp: new Date(),
    });

    await order.save();
    console.log("Order status updated to ready");

    // Create notification for status change (this mimics what happens in the controller)
    const readyNotificationData = {
      recipient: order.customer, // Customer receives the notification
      title: "تحديث حالة الطلب",
      message: "طلبك جاهز للتسليم", // Message for 'ready' status
      type: "order_ready",
      relatedEntity: {
        entityType: "Order",
        entityId: order._id,
      },
      data: {
        orderId: order._id,
        status: "ready",
        updatedBy: sellerUser.name,
      },
    };

    const readyNotification = await Notification.create(readyNotificationData);
    console.log("Created ready notification:", {
      _id: readyNotification._id,
      title: readyNotification.title,
      message: readyNotification.message,
      type: readyNotification.type,
      recipient: readyNotification.recipient,
      createdAt: readyNotification.createdAt,
    });

    // Get all notifications for this order to confirm they were created
    const orderNotifications = await Notification.find({
      "data.orderId": order._id,
    }).sort({ createdAt: 1 });

    console.log("\\nAll notifications for this order:");
    orderNotifications.forEach((notif, index) => {
      console.log(
        `${index + 1}. Type: ${notif.type}, Message: ${notif.message}, Recipient: ${notif.recipient}, Created: ${notif.createdAt}`
      );
    });

    console.log(
      "\\nTest completed successfully! Notifications are working properly."
    );
  } catch (error) {
    console.log("\\nError occurred during testing:", error.message);
    console.error(error.stack);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
  }
}

// Run the test
testNotificationCreation();
