/**
 * @file models/Store.js - Store model
 * @description نموذج المتجر يتضمن الحقول المطلوبة وفقًا لمتطلبات النظام
 */

const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'اسم المتجر مطلوب'],
    trim: true,
    maxlength: [100, 'لا يمكن أن يتجاوز اسم المتجر 100 حرف']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'رقم هاتف المتجر مطلوب'],
    trim: true
  },
  email: {
    type: String,
    required: false,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'يرجى تقديم بريد إلكتروني صالح'
    ]
  },
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    },
    address: {
      type: String,
      required: [true, 'عنوان المتجر مطلوب']
    }
  },
  workingHours: {
    opening: String, // مثال: "08:00"
    closing: String // مثال: "22:00"
  },
  zone: {
    type: String,
    required: [true, 'المنطقة مطلوبة'],
    trim: true
  },
  logo: {
    type: String,
    default: null
  },
  coverImage: {
    type: String,
    default: null
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
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Store', storeSchema);