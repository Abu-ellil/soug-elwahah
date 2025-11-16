const mongoose = require("mongoose");

const storeOwnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
  isActive: { type: Boolean, default: true },
  fcmToken: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("StoreOwner", storeOwnerSchema);
