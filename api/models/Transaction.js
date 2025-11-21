/**
 * @file models/Transaction.js - Transaction model
 * @description نموذج المعاملة يتضمن الحقول المطلوبة وفقًا لمتطلبات النظام
 */

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  type: {
    type: String,
    enum: ['payment', 'refund', 'wallet_add', 'wallet_withdraw'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'لا يمكن أن يكون المبلغ أقل من 0']
  },
  method: {
    type: String,
    enum: ['cash', 'wallet', 'paymob', 'fawry'],
    required: function() {
      return this.type === 'payment' || this.type === 'refund';
    }
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    default: null
  },
  reference: {
    type: String,
    default: null
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed // لتخزين استجابة بوابة الدفع
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);