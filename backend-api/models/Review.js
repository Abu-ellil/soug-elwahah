const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // Reviewer Information
  reviewer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'المراجع مطلوب']
  },
  
  // Review Target (Product, Service, Store, or User)
  targetType: {
    type: String,
    enum: ['Product', 'Service', 'Store', 'User'],
    required: [true, 'نوع الهدف مطلوب']
  },
  
  targetId: {
    type: mongoose.Schema.ObjectId,
    required: [true, 'معرف الهدف مطلوب'],
    refPath: 'targetType'
  },
  
  // Related Order (if applicable)
  order: {
    type: mongoose.Schema.ObjectId,
    ref: 'Order'
  },
  
  // Rating and Review Content
  rating: {
    type: Number,
    required: [true, 'التقييم مطلوب'],
    min: [1, 'التقييم يجب أن يكون بين 1 و 5'],
    max: [5, 'التقييم يجب أن يكون بين 1 و 5']
  },
  
  title: {
    type: String,
    maxlength: [100, 'عنوان المراجعة لا يمكن أن يتجاوز 100 حرف']
  },
  
  comment: {
    type: String,
    required: [true, 'التعليق مطلوب'],
    maxlength: [1000, 'التعليق لا يمكن أن يتجاوز 1000 حرف']
  },
  
  // Detailed Ratings (for different aspects)
  detailedRatings: {
    quality: {
      type: Number,
      min: [1, 'تقييم الجودة يجب أن يكون بين 1 و 5'],
      max: [5, 'تقييم الجودة يجب أن يكون بين 1 و 5']
    },
    service: {
      type: Number,
      min: [1, 'تقييم الخدمة يجب أن يكون بين 1 و 5'],
      max: [5, 'تقييم الخدمة يجب أن يكون بين 1 و 5']
    },
    delivery: {
      type: Number,
      min: [1, 'تقييم التوصيل يجب أن يكون بين 1 و 5'],
      max: [5, 'تقييم التوصيل يجب أن يكون بين 1 و 5']
    },
    value: {
      type: Number,
      min: [1, 'تقييم القيمة يجب أن يكون بين 1 و 5'],
      max: [5, 'تقييم القيمة يجب أن يكون بين 1 و 5']
    },
    communication: {
      type: Number,
      min: [1, 'تقييم التواصل يجب أن يكون بين 1 و 5'],
      max: [5, 'تقييم التواصل يجب أن يكون بين 1 و 5']
    }
  },
  
  // Review Media
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: String, // Cloudinary public ID
    caption: String
  }],
  
  // Review Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'hidden'],
    default: 'approved'
  },
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  
  verifiedPurchase: {
    type: Boolean,
    default: false
  },
  
  // Interaction Stats
  helpfulVotes: {
    type: Number,
    default: 0,
    min: [0, 'الأصوات المفيدة لا يمكن أن تكون سالبة']
  },
  
  unhelpfulVotes: {
    type: Number,
    default: 0,
    min: [0, 'الأصوات غير المفيدة لا يمكن أن تكون سالبة']
  },
  
  // Users who voted
  votedUsers: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    voteType: {
      type: String,
      enum: ['helpful', 'unhelpful']
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Response from Business Owner
  response: {
    comment: String,
    respondedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  
  // Flags and Reports
  isReported: {
    type: Boolean,
    default: false
  },
  
  reports: [{
    reporter: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'fake', 'offensive', 'other'],
      required: true
    },
    description: String,
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Location (if relevant)
  location: {
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  
  // Review Context
  context: {
    purchaseDate: Date,
    usageDuration: String, // e.g., "1 month", "2 weeks"
    recommendToFriends: {
      type: Boolean,
      default: true
    },
    wouldBuyAgain: {
      type: Boolean,
      default: true
    }
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
  
  // Moderation
  moderatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  
  moderatedAt: Date,
  
  moderationNote: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
reviewSchema.index({ targetType: 1, targetId: 1 });
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ helpfulVotes: -1 });
reviewSchema.index({ verifiedPurchase: 1 });
reviewSchema.index({ 'location.coordinates': '2dsphere' });

// Compound indexes
reviewSchema.index({ targetType: 1, targetId: 1, status: 1 });
reviewSchema.index({ reviewer: 1, targetType: 1, targetId: 1 }, { unique: true }); // One review per user per target

// Virtual for net helpful votes
reviewSchema.virtual('netHelpfulVotes').get(function() {
  return this.helpfulVotes - this.unhelpfulVotes;
});

// Virtual for total votes
reviewSchema.virtual('totalVotes').get(function() {
  return this.helpfulVotes + this.unhelpfulVotes;
});

// Virtual for helpfulness ratio
reviewSchema.virtual('helpfulnessRatio').get(function() {
  const total = this.totalVotes;
  return total > 0 ? (this.helpfulVotes / total) * 100 : 0;
});

// Virtual for has response
reviewSchema.virtual('hasResponse').get(function() {
  return !!(this.response && this.response.comment);
});

// Virtual for is recent
reviewSchema.virtual('isRecent').get(function() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return this.createdAt > thirtyDaysAgo;
});

// Virtual for average detailed rating
reviewSchema.virtual('averageDetailedRating').get(function() {
  const ratings = this.detailedRatings;
  const values = Object.values(ratings).filter(val => val != null);
  
  if (values.length === 0) return this.rating;
  
  const sum = values.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / values.length) * 10) / 10;
});

// Pre-save middleware
reviewSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set verified purchase if order exists
  if (this.order && !this.verifiedPurchase) {
    this.verifiedPurchase = true;
  }
  
  next();
});

// Static method to get reviews for a target
reviewSchema.statics.getForTarget = function(targetType, targetId, options = {}) {
  const {
    status = 'approved',
    sort = '-createdAt',
    limit = 20,
    page = 1,
    minRating = null,
    maxRating = null,
    verifiedOnly = false
  } = options;
  
  const skip = (page - 1) * limit;
  const query = { targetType, targetId, status };
  
  if (minRating) query.rating = { $gte: minRating };
  if (maxRating) query.rating = { ...query.rating, $lte: maxRating };
  if (verifiedOnly) query.verifiedPurchase = true;
  
  return this.find(query)
    .populate('reviewer', 'name avatar isVerified')
    .populate('response.respondedBy', 'name avatar')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// Static method to get review statistics
reviewSchema.statics.getStatistics = async function(targetType, targetId) {
  const stats = await this.aggregate([
    {
      $match: {
        targetType,
        targetId: new mongoose.Types.ObjectId(targetId),
        status: 'approved'
      }
    },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratingDistribution: {
          $push: '$rating'
        },
        verifiedReviews: {
          $sum: { $cond: ['$verifiedPurchase', 1, 0] }
        },
        totalHelpfulVotes: { $sum: '$helpfulVotes' },
        averageDetailedRatings: {
          $push: {
            quality: '$detailedRatings.quality',
            service: '$detailedRatings.service',
            delivery: '$detailedRatings.delivery',
            value: '$detailedRatings.value',
            communication: '$detailedRatings.communication'
          }
        }
      }
    },
    {
      $project: {
        totalReviews: 1,
        averageRating: { $round: ['$averageRating', 1] },
        verifiedReviews: 1,
        totalHelpfulVotes: 1,
        ratingDistribution: {
          5: {
            $size: {
              $filter: {
                input: '$ratingDistribution',
                cond: { $eq: ['$$this', 5] }
              }
            }
          },
          4: {
            $size: {
              $filter: {
                input: '$ratingDistribution',
                cond: { $eq: ['$$this', 4] }
              }
            }
          },
          3: {
            $size: {
              $filter: {
                input: '$ratingDistribution',
                cond: { $eq: ['$$this', 3] }
              }
            }
          },
          2: {
            $size: {
              $filter: {
                input: '$ratingDistribution',
                cond: { $eq: ['$$this', 2] }
              }
            }
          },
          1: {
            $size: {
              $filter: {
                input: '$ratingDistribution',
                cond: { $eq: ['$$this', 1] }
              }
            }
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalReviews: 0,
    averageRating: 0,
    verifiedReviews: 0,
    totalHelpfulVotes: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  };
};

// Static method to get top reviews
reviewSchema.statics.getTopReviews = function(targetType, targetId, limit = 5) {
  return this.find({
    targetType,
    targetId,
    status: 'approved'
  })
  .populate('reviewer', 'name avatar isVerified')
  .sort({ helpfulVotes: -1, createdAt: -1 })
  .limit(limit);
};

// Instance method to vote helpful
reviewSchema.methods.voteHelpful = function(userId) {
  // Check if user already voted
  const existingVote = this.votedUsers.find(vote => 
    vote.user.toString() === userId.toString()
  );
  
  if (existingVote) {
    if (existingVote.voteType === 'helpful') {
      throw new Error('لقد قمت بالتصويت بالفعل');
    } else {
      // Change from unhelpful to helpful
      this.unhelpfulVotes -= 1;
      this.helpfulVotes += 1;
      existingVote.voteType = 'helpful';
      existingVote.votedAt = new Date();
    }
  } else {
    // New helpful vote
    this.helpfulVotes += 1;
    this.votedUsers.push({
      user: userId,
      voteType: 'helpful'
    });
  }
  
  return this.save();
};

// Instance method to vote unhelpful
reviewSchema.methods.voteUnhelpful = function(userId) {
  // Check if user already voted
  const existingVote = this.votedUsers.find(vote => 
    vote.user.toString() === userId.toString()
  );
  
  if (existingVote) {
    if (existingVote.voteType === 'unhelpful') {
      throw new Error('لقد قمت بالتصويت بالفعل');
    } else {
      // Change from helpful to unhelpful
      this.helpfulVotes -= 1;
      this.unhelpfulVotes += 1;
      existingVote.voteType = 'unhelpful';
      existingVote.votedAt = new Date();
    }
  } else {
    // New unhelpful vote
    this.unhelpfulVotes += 1;
    this.votedUsers.push({
      user: userId,
      voteType: 'unhelpful'
    });
  }
  
  return this.save();
};

// Instance method to add response
reviewSchema.methods.addResponse = function(comment, respondedBy) {
  this.response = {
    comment,
    respondedBy,
    respondedAt: new Date()
  };
  
  return this.save();
};

// Instance method to report review
reviewSchema.methods.reportReview = function(reporter, reason, description = '') {
  // Check if user already reported
  const existingReport = this.reports.find(report => 
    report.reporter.toString() === reporter.toString()
  );
  
  if (existingReport) {
    throw new Error('لقد قمت بالإبلاغ عن هذه المراجعة بالفعل');
  }
  
  this.reports.push({
    reporter,
    reason,
    description
  });
  
  this.isReported = true;
  
  return this.save();
};

// Instance method to moderate review
reviewSchema.methods.moderate = function(status, moderatedBy, note = '') {
  this.status = status;
  this.moderatedBy = moderatedBy;
  this.moderatedAt = new Date();
  this.moderationNote = note;
  
  return this.save();
};

// Static method to get reviews by user
reviewSchema.statics.getByUser = function(userId, options = {}) {
  const {
    targetType = null,
    status = 'approved',
    sort = '-createdAt',
    limit = 20,
    page = 1
  } = options;
  
  const skip = (page - 1) * limit;
  const query = { reviewer: userId, status };
  
  if (targetType) query.targetType = targetType;
  
  return this.find(query)
    .populate('targetId')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// Static method to get pending reviews for moderation
reviewSchema.statics.getPendingReviews = function(limit = 50, page = 1) {
  const skip = (page - 1) * limit;
  
  return this.find({ status: 'pending' })
    .populate('reviewer', 'name avatar')
    .populate('targetId')
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get reported reviews
reviewSchema.statics.getReportedReviews = function(limit = 50, page = 1) {
  const skip = (page - 1) * limit;
  
  return this.find({ isReported: true })
    .populate('reviewer', 'name avatar')
    .populate('targetId')
    .populate('reports.reporter', 'name avatar')
    .sort({ 'reports.reportedAt': -1 })
    .skip(skip)
    .limit(limit);
};

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;