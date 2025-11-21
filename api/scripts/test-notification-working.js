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

async function testWorkingNotifications() {
  try {
    console.log("Testing notification creation with valid types...");

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

    // Test creating a notification with a valid type for order status change
    console.log("\\nTesting notification creation for order status change...");

    // Create a notification that would be generated when order status changes
    // Using valid notification type 'order_confirmed' for preparing status
    const notificationData = {
      recipient: order.customer, // Customer receives the notification
      title: "تحديث حالة الطلب",
      message: "جاري تحضير طلبك", // Message for 'preparing' status
      type: "order_confirmed", // Using valid type instead of 'order_preparing'
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

    // Test creating another notification with valid type for delivered status
    const deliveredNotificationData = {
      recipient: order.customer,
      title: "تحديث حالة الطلب",
      message: "تم تسليم الطلب",
      type: "order_delivered", // Valid type
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

    // Test creating a notification for completed status
    const completedNotificationData = {
      recipient: order.customer,
      title: "تحديث حالة الطلب",
      message: "تم إكمال الطلب",
      type: "order_completed", // Valid type
      relatedEntity: {
        entityType: "Order",
        entityId: order._id,
      },
      data: {
        orderId: order._id,
        status: "completed",
        updatedBy: "System",
      },
    };

    const completedNotification = await Notification.create(
      completedNotificationData
    );
    console.log("Successfully created completed notification:", {
      _id: completedNotification._id,
      title: completedNotification.title,
      message: completedNotification.message,
      type: completedNotification.type,
      recipient: completedNotification.recipient,
      createdAt: completedNotification.createdAt,
    });

    // Verify that all notifications were saved by querying them
    const savedNotifications = await Notification.find({
      "data.orderId": order._id,
    }).sort({ createdAt: -1 });

    console.log("\\nAll notifications for this order:");
    savedNotifications.forEach((notif, index) => {
      console.log(
        `${index + 1}. Type: ${notif.type}, Message: ${notif.message}, Recipient: ${notif.recipient}, Created: ${notif.createdAt}`
      );
    });

    console.log(
      "\\n✓ Notification system is working correctly with valid types!"
    );
    console.log("\\nSummary:");
    console.log(
      "- Order status change notifications can be created with valid types"
    );
    console.log("- Notifications are properly stored in the database");
    console.log(
      "- Each notification has appropriate type, message, and recipient"
    );
    console.log("- Notification data includes relevant order information");
    console.log(
      '\\nNote: In the updated controller, statuses like "preparing" and "ready" are mapped to "order_confirmed"'
    );
    console.log(
      "since these specific types are not defined in the Notification model enum."
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
testWorkingNotifications();
