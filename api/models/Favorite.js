const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  }
}, {
  timestamps: true
});

// Ensure that either product or store is provided, but not both
favoriteSchema.pre('validate', function(next) {
  if (!this.product && !this.store) {
    next(new Error('Either product or store must be provided'));
  } else if (this.product && this.store) {
    next(new Error('Cannot favorite both product and store at the same time'));
  } else {
    next();
  }
});

// Create compound index to prevent duplicate favorites
favoriteSchema.index({ user: 1, product: 1 }, { unique: true, partialFilterExpression: { product: { $exists: true } } });
favoriteSchema.index({ user: 1, store: 1 }, { unique: true, partialFilterExpression: { store: { $exists: true } } });

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;