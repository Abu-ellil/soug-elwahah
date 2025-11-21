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

async function queryNotifications() {
  try {
    console.log("Querying notifications for the specific order...");

    // Find the specific order from the task description
    const orderId = "690423349e067584cd9e324d";
    const order = await Order.findById(orderId);

    if (!order) {
      console.log("Order not found with ID:", orderId);
      return;
    }

    console.log("Found order:", order._id);

    // Query notifications in different ways to find the ones we created
    console.log("\\n1. Querying by string order ID in data.orderId field:");
    const notifications1 = await Notification.find({
      "data.orderId": orderId, // String match
    });
    console.log(
      `Found ${notifications1.length} notifications with string orderId`
    );

    console.log("\\n2. Querying by ObjectId order ID in data.orderId field:");
    const notifications2 = await Notification.find({
      "data.orderId": order._id, // ObjectId match
    });
    console.log(`Found ${notifications2.length} notifications with ObjectId`);

    console.log("\\n3. Querying by relatedEntity.entityId:");
    const notifications3 = await Notification.find({
      "relatedEntity.entityId": order._id,
    });
    console.log(
      `Found ${notifications3.length} notifications with relatedEntity.entityId`
    );

    console.log("\\n4. Querying all recent notifications for customer:");
    const notifications4 = await Notification.find({
      recipient: order.customer,
    })
      .sort({ createdAt: -1 })
      .limit(10);
    console.log(
      `Found ${notifications4.length} recent notifications for customer`
    );

    // Show details of any found notifications
    if (notifications4.length > 0) {
      console.log("\\nRecent notifications details:");
      notifications4.forEach((notif, index) => {
        console.log(
          `${index + 1}. Type: ${notif.type}, Status: ${notif.data?.status}, Message: "${notif.message}", Created: ${notif.createdAt}`
        );
        console.log(
          `   Data.orderId: ${notif.data?.orderId}, RelatedEntity: ${notif.relatedEntity?.entityId}`
        );
      });
    }

    // Check if there are any notifications with our test data
    console.log("\\n5. Querying notifications created by System Test:");
    const testNotifications = await Notification.find({
      "data.updatedBy": "System Test",
    });
    console.log(`Found ${testNotifications.length} test notifications`);

    if (testNotifications.length > 0) {
      console.log("\\nTest notifications:");
      testNotifications.forEach((notif, index) => {
        console.log(
          `${index + 1}. Type: ${notif.type}, Status: ${notif.data?.status}, Message: "${notif.message}", Created: ${notif.createdAt}`
        );
        console.log(
          `   Data.orderId: ${notif.data?.orderId}, Recipient: ${notif.recipient}`
        );
      });
    }
  } catch (error) {
    console.log("\\nError occurred during query:", error.message);
    console.error(error.stack);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
  }
}

// Run the query
queryNotifications();
