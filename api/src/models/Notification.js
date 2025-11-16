const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, refPath: "userType" },
  userType: {
    type: String,
    enum: ["User", "StoreOwner", "Driver"],
    required: true,
  },
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: {
    type: String,
    enum: [
      "order_new",
      "order_accepted",
      "order_confirmed",
      "order_picked_up",
      "order_on_way",
      "order_delivered",
      "order_cancelled",
      "general",
    ],
    required: true,
  },
  data: { type: mongoose.Schema.Types.Mixed, default: {} }, // extra data like orderId
  isRead: { type: Boolean, default: false },
  sentAt: { type: Date, default: Date.now },
  readAt: { type: Date, default: null },
});

notificationSchema.index({ userId: 1, isRead: 1, sentAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
