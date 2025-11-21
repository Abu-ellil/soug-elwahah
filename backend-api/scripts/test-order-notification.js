const mongoose = require("mongoose");
const Order = require("../models/Order");
const Notification = require("../models/Notification");
const User = require("../models/User");

// Connect to database using the same URI as the application
const MONGODB_URI =
  "mongodb+srv://mrabuellil_db_user:mrabuellil_db_user@aifarm.j5pnubg.mongodb.net/elsoog";
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testOrderNotification() {
  try {
    console.log("Testing order notification functionality...");

    // Find the specific order from the task description
    const orderId = "690423349e067584cd9e324d";
    const order = await Order.findById(orderId);

    if (!order) {
      console.log("Order not found with ID:", orderId);

      // Let's find any existing order to test with
      const existingOrder = await Order.findOne();
      if (existingOrder) {
        console.log("Using existing order for testing:", existingOrder._id);
        console.log("Order details:", {
          _id: existingOrder._id,
          status: existingOrder.status,
          customer: existingOrder.customer,
          seller: existingOrder.seller,
        });

        // Test changing status to trigger notification
        const originalStatus = existingOrder.status;
        console.log("\\nOriginal status:", originalStatus);

        // Change status to confirmed to trigger notification
        existingOrder.status = "confirmed";
        existingOrder.statusHistory.push({
          status: "confirmed",
          timestamp: new Date(),
          note: "Test status change",
        });

        await existingOrder.save();
        console.log("Updated order status to confirmed");

        // Find the notification that should have been created
        const notification = await Notification.findOne({
          "data.orderId": existingOrder._id,
          type: "order_confirmed",
        }).sort({ createdAt: -1 });

        if (notification) {
          console.log("\\nNotification found:", {
            _id: notification._id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            recipient: notification.recipient,
            createdAt: notification.createdAt,
          });
        } else {
          console.log("\\nNo notification found for order confirmation");
        }

        // Test another status change
        existingOrder.status = "preparing";
        existingOrder.statusHistory.push({
          status: "preparing",
          timestamp: new Date(),
          note: "Test status change",
        });

        await existingOrder.save();
        console.log("\\nUpdated order status to preparing");

        // Find the preparing notification
        const preparingNotification = await Notification.findOne({
          "data.orderId": existingOrder._id,
          type: "order_preparing",
        }).sort({ createdAt: -1 });

        if (preparingNotification) {
          console.log("\\nPreparing notification found:", {
            _id: preparingNotification._id,
            title: preparingNotification.title,
            message: preparingNotification.message,
            type: preparingNotification.type,
            recipient: preparingNotification.recipient,
            createdAt: preparingNotification.createdAt,
          });
        } else {
          console.log("\\nNo preparing notification found");
        }
      } else {
        console.log("No orders found in the database");
      }
    } else {
      console.log("Found order:", order._id);
      console.log("Current status:", order.status);

      // Change status to confirmed to trigger notification
      const originalStatus = order.status;
      order.status = "confirmed";
      order.statusHistory.push({
        status: "confirmed",
        timestamp: new Date(),
        note: "Test status change",
      });

      await order.save();
      console.log("\\nUpdated order status to confirmed");

      // Find the notification that should have been created
      const notification = await Notification.findOne({
        "data.orderId": order._id,
        type: "order_confirmed",
      }).sort({ createdAt: -1 });

      if (notification) {
        console.log("\\nNotification found:", {
          _id: notification._id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          recipient: notification.recipient,
          createdAt: notification.createdAt,
        });
      } else {
        console.log("\\nNo notification found for order confirmation");
      }

      // Test another status change
      order.status = "preparing";
      order.statusHistory.push({
        status: "preparing",
        timestamp: new Date(),
        note: "Test status change",
      });

      await order.save();
      console.log("\\nUpdated order status to preparing");

      // Find the preparing notification
      const preparingNotification = await Notification.findOne({
        "data.orderId": order._id,
        type: "order_preparing",
      }).sort({ createdAt: -1 });

      if (preparingNotification) {
        console.log("\\nPreparing notification found:", {
          _id: preparingNotification._id,
          title: preparingNotification.title,
          message: preparingNotification.message,
          type: preparingNotification.type,
          recipient: preparingNotification.recipient,
          createdAt: preparingNotification.createdAt,
        });
      } else {
        console.log("\\nNo preparing notification found");
      }
    }

    console.log("\\nTest completed successfully!");
  } catch (error) {
    console.log("\\nError occurred during testing:", error.message);
    console.error(error.stack);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
  }
}

// Run the test
testOrderNotification();
