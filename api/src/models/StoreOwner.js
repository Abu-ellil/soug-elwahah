const mongoose = require("mongoose");

const storeOwnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true }, // hashed
  stores: [{ type: mongoose.Schema.Types.ObjectId, ref: "Store" }], // Array of store IDs
  isActive: { type: Boolean, default: true }, // Default to false until approved
  verificationStatus: { type: String, default: 'approved' ['pending', 'approved', 'rejected'] },
  rejectionReason: { type: String, default: null },
  fcmToken: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
// Create indexes for better query performance

module.exports = mongoose.model("StoreOwner", storeOwnerSchema);
