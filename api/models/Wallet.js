const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['credit', 'debit', 'refund', 'commission', 'delivery_fee', 'order_payment'],
    required: true
  },
  
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  
  description: {
    type: String,
    required: true
  },
  
  reference: {
    type: mongoose.Schema.ObjectId,
    refPath: 'referenceModel'
  },
  
 referenceModel: {
    type: String,
    enum: ['Order', 'Payment', 'Delivery', 'Commission']
  },
  
  balanceAfter: {
    type: Number,
    required: true
  },
  
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'reversed'],
    default: 'completed'
  },
  
  metadata: {
    orderId: String,
    paymentId: String,
    notes: String
  }
}, {
  timestamps: true
});

const walletSchema = new mongoose.Schema({
  // User reference
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Wallet balance
  balance: {
    type: Number,
    default: 0,
    min: [0, 'Balance cannot be negative']
  },
  
  // Currency
  currency: {
    type: String,
    enum: ['EGP', 'USD'],
    default: 'EGP'
  },
  
  // Wallet status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Transaction history
  transactions: [walletTransactionSchema],
  
  // Wallet settings
  settings: {
    autoTopUp: {
      type: Boolean,
      default: false
    },
    minBalance: {
      type: Number,
      default: 0
    },
    maxBalance: {
      type: Number,
      default: 1000000 // 1 million EGP default max
    }
  },
  
  // Security
  isFrozen: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  lastTransactionAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
walletSchema.index({ user: 1 });
walletSchema.index({ balance: 1 });
walletSchema.index({ isActive: 1 });
walletSchema.index({ createdAt: -1 });
walletSchema.index({ 'transactions.createdAt': -1 });

// Pre-save middleware to update timestamps
walletSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to create or get user wallet
walletSchema.statics.getOrCreate = async function(userId) {
  let wallet = await this.findOne({ user: userId });
  
  if (!wallet) {
    wallet = await this.create({ user: userId });
  }
  
 return wallet;
};

// Instance method to add funds to wallet
walletSchema.methods.addFunds = async function(amount, description, reference = null, referenceModel = null) {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }
  
  // Check if wallet is frozen
  if (this.isFrozen) {
    throw new Error('Wallet is frozen');
  }
  
  // Check max balance limit
  if (this.balance + amount > this.settings.maxBalance) {
    throw new Error(`Exceeds maximum balance limit of ${this.settings.maxBalance}`);
  }
  
  const newBalance = this.balance + amount;
  const transaction = {
    type: 'credit',
    amount: amount,
    description: description,
    reference: reference,
    referenceModel: referenceModel,
    balanceAfter: newBalance,
    status: 'completed'
  };
  
  this.balance = newBalance;
  this.transactions.push(transaction);
  this.lastTransactionAt = new Date();
  
  await this.save();
  return transaction;
};

// Instance method to deduct funds from wallet
walletSchema.methods.deductFunds = async function(amount, description, reference = null, referenceModel = null) {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }
  
  if (this.balance < amount) {
    throw new Error('Insufficient balance');
  }
  
  // Check if wallet is frozen
  if (this.isFrozen) {
    throw new Error('Wallet is frozen');
  }
  
  const newBalance = this.balance - amount;
 const transaction = {
    type: 'debit',
    amount: amount,
    description: description,
    reference: reference,
    referenceModel: referenceModel,
    balanceAfter: newBalance,
    status: 'completed'
  };
  
  this.balance = newBalance;
  this.transactions.push(transaction);
  this.lastTransactionAt = new Date();
  
  await this.save();
  return transaction;
};

// Instance method to get recent transactions
walletSchema.methods.getRecentTransactions = function(limit = 10) {
  return this.transactions
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
};

// Instance method to get transaction history
walletSchema.methods.getTransactionHistory = function(filters = {}) {
  let transactions = this.transactions;
  
  if (filters.type) {
    transactions = transactions.filter(t => t.type === filters.type);
  }
  
  if (filters.status) {
    transactions = transactions.filter(t => t.status === filters.status);
  }
  
  if (filters.startDate) {
    transactions = transactions.filter(t => new Date(t.createdAt) >= new Date(filters.startDate));
  }
  
  if (filters.endDate) {
    transactions = transactions.filter(t => new Date(t.createdAt) <= new Date(filters.endDate));
  }
  
  return transactions.sort((a, b) => b.createdAt - a.createdAt);
};

// Instance method to freeze wallet
walletSchema.methods.freeze = async function(reason = '') {
  this.isFrozen = true;
  await this.save();
  
  // Add freeze transaction
  const freezeTransaction = {
    type: 'debit',
    amount: 0,
    description: `Wallet frozen: ${reason}`,
    balanceAfter: this.balance,
    status: 'completed'
  };
  
 this.transactions.push(freezeTransaction);
  await this.save();
  
  return this;
};

// Instance method to unfreeze wallet
walletSchema.methods.unfreeze = async function() {
  this.isFrozen = false;
  await this.save();
  
  // Add unfreeze transaction
  const unfreezeTransaction = {
    type: 'credit',
    amount: 0,
    description: 'Wallet unfrozen',
    balanceAfter: this.balance,
    status: 'completed'
  };
  
  this.transactions.push(unfreezeTransaction);
  await this.save();
  
  return this;
};

// Instance method to get wallet statistics
walletSchema.methods.getStatistics = function() {
  const transactions = this.transactions;
  
  const totalCredits = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalDebits = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);
    
 const totalRefunds = transactions
    .filter(t => t.type === 'refund')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const recentTransactions = this.getRecentTransactions(5);
  
  return {
    totalCredits,
    totalDebits,
    totalRefunds,
    netBalance: totalCredits - totalDebits,
    transactionCount: transactions.length,
    recentTransactions
  };
};

// Instance method to validate wallet operation
walletSchema.methods.validateOperation = function(amount, operationType = 'debit') {
  const errors = [];
  
 if (this.isFrozen) {
    errors.push('Wallet is frozen');
  }
  
 if (operationType === 'debit' && this.balance < amount) {
    errors.push('Insufficient balance');
  }
  
  if (amount <= 0) {
    errors.push('Amount must be positive');
  }
  
  if (operationType === 'credit' && this.balance + amount > this.settings.maxBalance) {
    errors.push(`Exceeds maximum balance limit of ${this.settings.maxBalance}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Static method to get wallet statistics for admin
walletSchema.statics.getSystemStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalWallets: { $sum: 1 },
        totalBalance: { $sum: '$balance' },
        activeWallets: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        frozenWallets: {
          $sum: { $cond: [{ $eq: ['$isFrozen', true] }, 1, 0] }
        },
        averageBalance: { $avg: '$balance' },
        maxBalance: { $max: '$balance' },
        minBalance: { $min: '$balance' }
      }
    }
  ]);
  
  return stats[0] || {
    totalWallets: 0,
    totalBalance: 0,
    activeWallets: 0,
    frozenWallets: 0,
    averageBalance: 0,
    maxBalance: 0,
    minBalance: 0
  };
};

// Static method to get top wallets by balance
walletSchema.statics.getTopWallets = async function(limit = 10) {
  return this.find({ isActive: true })
    .populate('user', 'name email phone')
    .sort({ balance: -1 })
    .limit(limit);
};

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
