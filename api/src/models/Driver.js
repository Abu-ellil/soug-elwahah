const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  avatar: { type: String, default: null },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  vehicleType: {
    type: String,
    enum: ["motorcycle", "car", "tuktuk"],
    required: true,
  },
  vehicleNumber: { type: String, required: true },
  isAvailable: { type: Boolean, default: false },
  isActive: { type: Boolean, default: false }, // admin activation
  coordinates: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
  },
  lastLocationUpdate: { type: Date, default: Date.now },
  documents: {
    nationalId: { type: String, default: null },
    drivingLicense: { type: String, default: null },
    isVerified: { type: Boolean, default: false },
  },
  fcmToken: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index للبحث الجغرافي
driverSchema.index({ coordinates: "2dsphere" });
driverSchema.index({ isAvailable: 1, isActive: 1 });

module.exports = mongoose.model("Driver", driverSchema);
