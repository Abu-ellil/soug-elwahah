const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true }, // hashed
  avatar: { type: String, default: null },
  isActive: { type: Boolean, default: true },
  fcmToken: { type: String, default: null }, // للـ notifications
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
