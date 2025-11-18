const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'StoreOwner', required: true },
  image: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  description: { type: String, default: '' },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  isOpen: { type: Boolean, default: false }, // Default to false until approved
  deliveryTime: { type: String, default: '20-30 دقيقة' },
  deliveryFee: { type: Number, default: 10 },
  coordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  pendingCoordinates: {
    type: { type: String, enum: ['Point'] },
    coordinates: { type: [Number] } // [longitude, latitude]
  },
  villageId: { type: String, required: true },
  workingHours: {
    from: { type: String, default: '08:00' },
    to: { type: String, default: '23:00' }
  },
  documents: [{ type: String }], // Array of document URLs
  isActive: { type: Boolean, default: false }, // Default to false until approved
  verificationStatus: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
  rejectionReason: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index للبحث الجغرافي
storeSchema.index({ coordinates: '2dsphere' }); // Ensure 2dsphere index is applied

module.exports = mongoose.model('Store', storeSchema);
