const mongoose = require("mongoose");
const Order = require("../models/Order");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { updateOrderStatus } = require("../controllers/orderController");

// Mock request and response objects for testing
const createMockRequest = (user, params, body) => ({
  user: user,
  params: params,
  body: body,
  query: {},
});

const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

// Connect to database
const MONGODB_URI =
  "mongodb+srv://mrabuellil_db_user:mrabuellil_db_user@aifarm.j5pnubg.mongodb.net/elsoog";
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testOrderNotificationFull() {
  try {
    console.log("Testing order notification functionality with controller...");

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

    // Find the seller user to use as the authenticating user
    const sellerUser = await User.findById(order.seller);
    if (!sellerUser) {
      console.log("Seller user not found");
      return;
    }

    console.log("Seller user found:", sellerUser._id);

    // Test updating order status to 'confirmed' using the controller
    // This should trigger the notification
    console.log("\\nTesting controller-based status update to confirmed...");

    const mockReq = createMockRequest(
      { _id: sellerUser._id, role: "user" }, // Seller is updating the status
      { id: order._id.toString() },
      { status: "confirmed" }
    );

    const mockRes = createMockResponse();

    try {
      await updateOrderStatus(mockReq, mockRes);
      console.log("Controller status update completed");
    } catch (error) {
      console.log("Error during controller update:", error.message);
    }

    // Check if notification was created for the customer
    const notificationForConfirmed = await Notification.findOne({
      "data.orderId": order._id.toString(),
      type: "order_confirmed",
      recipient: order.customer, // Notification should go to customer
    }).sort({ createdAt: -1 });

    if (notificationForConfirmed) {
      console.log("\\nNotification found for confirmed status:", {
        _id: notificationForConfirmed._id,
        title: notificationForConfirmed.title,
        message: notificationForConfirmed.message,
        type: notificationForConfirmed.type,
        recipient: notificationForConfirmed.recipient,
        createdAt: notificationForConfirmed.createdAt,
      });
    } else {
      console.log("\\nNo notification found for confirmed status");

      // Let's check all notifications for this order to see what happened
      const allNotifications = await Notification.find({
        "data.orderId": order._id.toString(),
      });
      console.log(
        "\\nAll notifications for this order:",
        allNotifications.length
      );
      allNotifications.forEach((notif, index) => {
        console.log(
          `${index + 1}. Type: ${notif.type}, Message: ${notif.message}, Recipient: ${notif.recipient}, Created: ${notif.createdAt}`
        );
      });
    }

    // Now test another status update to 'preparing'
    console.log("\\nTesting controller-based status update to preparing...");

    const mockReq2 = createMockRequest(
      { _id: sellerUser._id, role: "user" }, // Seller is updating the status
      { id: order._id.toString() },
      { status: "preparing" }
    );

    const mockRes2 = createMockResponse();

    try {
      await updateOrderStatus(mockReq2, mockRes2);
      console.log("Controller status update to preparing completed");
    } catch (error) {
      console.log(
        "Error during controller update to preparing:",
        error.message
      );
    }

    // Check if notification was created for preparing status
    const notificationForPreparing = await Notification.findOne({
      "data.orderId": order._id.toString(),
      type: "order_preparing",
      recipient: order.customer, // Notification should go to customer
    }).sort({ createdAt: -1 });

    if (notificationForPreparing) {
      console.log("\\nNotification found for preparing status:", {
        _id: notificationForPreparing._id,
        title: notificationForPreparing.title,
        message: notificationForPreparing.message,
        type: notificationForPreparing.type,
        recipient: notificationForPreparing.recipient,
        createdAt: notificationForPreparing.createdAt,
      });
    } else {
      console.log("\\nNo notification found for preparing status");

      // Check all notifications again
      const allNotifications = await Notification.find({
        "data.orderId": order._id.toString(),
      }).sort({ createdAt: -1 });
      console.log(
        "\\nAll notifications for this order after preparing:",
        allNotifications.length
      );
      allNotifications.forEach((notif, index) => {
        console.log(
          `${index + 1}. Type: ${notif.type}, Message: ${notif.message}, Recipient: ${notif.recipient}, Created: ${notif.createdAt}`
        );
      });
    }

    console.log("\\nTest completed!");
  } catch (error) {
    console.log("\\nError occurred during testing:", error.message);
    console.error(error.stack);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
  }
}

// Run the test
testOrderNotificationFull();
