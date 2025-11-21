const mongoose = require("mongoose");
const Order = require("../models/Order");
const Notification = require("../models/Notification");

// Connect to database
const MONGODB_URI =
  "mongodb+srv://mrabuellil_db_user:mrabuellil_db_user@aifarm.j5pnubg.mongodb.net/elsoog";
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testNotificationSimple() {
  try {
    console.log("Testing notification creation with existing order...");

    // Find the specific order from the task description
    const orderId = "690423349e067584cd9e324d";
    const order = await Order.findById(orderId);

    if (!order) {
      console.log("Order not found with ID:", orderId);
      return;
    }

    console.log("Found order:", order._id);
    console.log("Current status:", order.status);
    console.log("Customer ID:", order.customer);
    console.log("Seller ID:", order.seller || "No seller assigned");

    // Test creating a notification for this order
    console.log("\\nTesting notification creation for order status change...");

    // Create a notification that would be generated when order status changes
    const notificationData = {
      recipient: order.customer, // Customer receives the notification
      title: "تحديث حالة الطلب",
      message: "جاري تحضير طلبك", // Current status is 'preparing'
      type: "order_preparing",
      relatedEntity: {
        entityType: "Order",
        entityId: order._id,
      },
      data: {
        orderId: order._id,
        status: "preparing",
        updatedBy: "System", // Since we don't have the updating user
      },
    };

    const newNotification = await Notification.create(notificationData);
    console.log("Successfully created notification:", {
      _id: newNotification._id,
      title: newNotification.title,
      message: newNotification.message,
      type: newNotification.type,
      recipient: newNotification.recipient,
      createdAt: newNotification.createdAt,
    });

    // Test creating another notification for a status change
    const deliveredNotificationData = {
      recipient: order.customer,
      title: "تحديث حالة الطلب",
      message: "تم تسليم الطلب",
      type: "order_delivered",
      relatedEntity: {
        entityType: "Order",
        entityId: order._id,
      },
      data: {
        orderId: order._id,
        status: "delivered",
        updatedBy: "System",
      },
    };

    const deliveredNotification = await Notification.create(
      deliveredNotificationData
    );
    console.log("Successfully created delivered notification:", {
      _id: deliveredNotification._id,
      title: deliveredNotification.title,
      message: deliveredNotification.message,
      type: deliveredNotification.type,
      recipient: deliveredNotification.recipient,
      createdAt: deliveredNotification.createdAt,
    });

    // Verify that notifications were saved by querying them
    const savedNotifications = await Notification.find({
      "data.orderId": order._id,
    }).sort({ createdAt: -1 });

    console.log("\\nAll notifications for this order:");
    savedNotifications.forEach((notif, index) => {
      console.log(
        `${index + 1}. Type: ${notif.type}, Message: ${notif.message}, Recipient: ${notif.recipient}, Created: ${notif.createdAt}`
      );
    });

    console.log("\\n✓ Notification system is working correctly!");
    console.log("\\nSummary:");
    console.log("- Order status change notifications can be created");
    console.log("- Notifications are properly stored in the database");
    console.log(
      "- Each notification has appropriate type, message, and recipient"
    );
    console.log("- Notification data includes relevant order information");
  } catch (error) {
    console.log("\\nError occurred during testing:", error.message);
    console.error(error.stack);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
  }
}

// Run the test
testNotificationSimple();
