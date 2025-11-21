/**
 * @file models/Zone.js - Zone model
 * @description نموذج المنطقة يتضمن الحقول المطلوبة وفقًا لمتطلبات النظام
 */

const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'اسم المنطقة مطلوب'],
    trim: true,
    unique: true,
    maxlength: [100, 'لا يمكن أن يتجاوز اسم المنطقة 100 حرف']
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Polygon']
    },
    coordinates: {
      type: [[[Number]]], // [[[longitude, latitude]]]
      index: '2dsphere'
    }
  },
  center: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  active: {
    type: Boolean,
    default: true
  },
  deliveryFee: {
    type: Number,
    default: 15 // رسوم التوصيل الافتراضية للمنطقة
  },
  estimatedDeliveryTime: {
    type: Number, // بالدقائق
    default: 30
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Zone', zoneSchema);