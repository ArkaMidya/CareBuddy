const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  // Basic feedback info
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  
  // Feedback type and category
  type: {
    type: String,
    enum: ['care_quality', 'wait_time', 'communication', 'facility', 'medication', 'follow_up', 'general'],
    required: true
  },
  
  // Rating system
  rating: {
    overall: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    careQuality: {
      type: Number,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    waitTime: {
      type: Number,
      min: 1,
      max: 5
    },
    facility: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  
  // Associated entities
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  healthcareProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  healthReport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthReport'
  },
  
  consultation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation'
  },
  
  // Status and processing
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'addressed', 'resolved', 'closed'],
    default: 'pending'
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // Response and follow-up
  response: {
    content: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  
  followUpRequired: {
    type: Boolean,
    default: false
  },
  
  followUpDate: Date,
  
  // Tags for categorization
  tags: [{
    type: String,
    trim: true
  }],
  
  // Anonymity
  isAnonymous: {
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
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
feedbackSchema.index({ patient: 1, createdAt: -1 });
feedbackSchema.index({ healthcareProvider: 1, status: 1 });
feedbackSchema.index({ type: 1, status: 1 });
feedbackSchema.index({ priority: 1, status: 1 });

// Virtual for average rating
feedbackSchema.virtual('averageRating').get(function() {
  const ratings = [
    this.rating.overall,
    this.rating.careQuality,
    this.rating.communication,
    this.rating.waitTime,
    this.rating.facility
  ].filter(r => r !== undefined);
  
  return ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
});

// Method to calculate priority based on rating and type
feedbackSchema.methods.calculatePriority = function() {
  const avgRating = this.averageRating;
  
  if (avgRating <= 2) {
    this.priority = 'high';
  } else if (avgRating <= 3) {
    this.priority = 'medium';
  } else {
    this.priority = 'low';
  }
  
  // Critical priority for certain types
  if (['medication', 'care_quality'].includes(this.type) && avgRating <= 2) {
    this.priority = 'critical';
  }
  
  return this.priority;
};

// Pre-save middleware
feedbackSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate priority if not set
  if (!this.priority || this.isModified('rating')) {
    this.calculatePriority();
  }
  
  next();
});

module.exports = mongoose.model('Feedback', feedbackSchema);
