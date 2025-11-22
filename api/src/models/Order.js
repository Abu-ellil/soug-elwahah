const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true }, // ORD-123456
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true, min: 1 },
      image: { type: String },
    },
  ],
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: [
      "pending",
      "accepted",
      "confirmed",
      "picked_up",
      "on_way",
      "delivered",
      "cancelled",
    ],
    default: "pending",
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    default: null,
  },
  driverAssignedAt: { type: Date, default: null },
  pickedUpAt: { type: Date, default: null },
  deliveredAt: { type: Date, default: null },
  address: {
    details: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "vodafone_cash", "visa"],
    required: true,
  },
  notes: { type: String, default: "" },
  timeline: [
    {
      status: { type: String, required: true },
      time: { type: Date, default: Date.now },
      label: { type: String },
    },
  ],
  cancelReason: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index للاستعلامات السريعة
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ storeId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
