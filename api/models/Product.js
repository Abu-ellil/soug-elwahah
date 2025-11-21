/**
 * @file models/Product.js - Product model
 * @description نموذج المنتج يتضمن الحقول المطلوبة وفقًا لمتطلبات النظام
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'اسم المنتج مطلوب'],
    trim: true,
    maxlength: [100, 'لا يمكن أن يتجاوز اسم المنتج 100 حرف']
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'سعر المنتج مطلوب'],
    min: [0, 'لا يمكن أن يكون السعر أقل من 0']
  },
  category: {
    type: String,
    required: false,
    trim: true
 },
  stock: {
    type: Number,
    required: [true, 'كمية المخزون مطلوبة'],
    min: [0, 'لا يمكن أن يكون المخزون أقل من 0'],
    default: 0
  },
  image: {
    type: String,
    default: null
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);