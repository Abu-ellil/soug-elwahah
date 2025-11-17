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
  isOpen: { type: Boolean, default: true },
  deliveryTime: { type: String, default: '20-30 دقيقة' },
  deliveryFee: { type: Number, default: 10 },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  pendingCoordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  villageId: { type: String, required: true },
  workingHours: {
    from: { type: String, default: '08:00' },
    to: { type: String, default: '23:00' }
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index للبحث الجغرافي
storeSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('Store', storeSchema);