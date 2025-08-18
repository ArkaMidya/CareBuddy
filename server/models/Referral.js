const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  // Basic referral info
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
  
  // Referral type and specialty
  type: {
    type: String,
    enum: ['specialist', 'diagnostic', 'treatment', 'follow_up', 'emergency', 'preventive'],
    required: true
  },
  
  specialty: {
    type: String,
    required: true,
    trim: true
  },
  
  // Priority and urgency
  priority: {
    type: String,
    enum: ['routine', 'urgent', 'emergency'],
    default: 'routine'
  },
  
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // Referral timeline
  requestedDate: {
    type: Date,
    default: Date.now
  },
  
  preferredDate: Date,
  
  deadline: Date,
  
  // People involved
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  referringProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  referredToProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  referredToFacility: {
    name: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    },
    phone: String,
    email: String
  },
  
  // Associated health records
  healthReport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthReport'
  },
  
  consultation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation'
  },
  
  // Clinical information
  clinicalReason: {
    type: String,
    required: true,
    trim: true
  },
  
  symptoms: [{
    name: String,
    severity: String,
    duration: String
  }],
  
  diagnosis: {
    primary: String,
    secondary: [String]
  },
  
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String
  }],
  
  testResults: [{
    testName: String,
    result: String,
    date: Date,
    fileUrl: String
  }],
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'expired'],
    default: 'pending'
  },
  
  // Acceptance and scheduling
  acceptedAt: Date,
  
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  appointmentDate: Date,
  
  appointmentTime: String,
  
  // Follow-up and outcomes
  followUpRequired: {
    type: Boolean,
    default: true
  },
  
  followUpDate: Date,
  
  outcome: {
    type: String,
    enum: ['improved', 'stable', 'worsened', 'resolved', 'ongoing'],
    default: 'ongoing'
  },
  
  outcomeNotes: String,
  
  // Communication
  notes: [{
    content: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Insurance and billing
  insuranceInfo: {
    provider: String,
    policyNumber: String,
    groupNumber: String
  },
  
  preAuthorizationRequired: {
    type: Boolean,
    default: false
  },
  
  preAuthorizationStatus: {
    type: String,
    enum: ['not_required', 'pending', 'approved', 'denied'],
    default: 'not_required'
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
referralSchema.index({ patient: 1, status: 1 });
referralSchema.index({ referringProvider: 1, status: 1 });
referralSchema.index({ referredToProvider: 1, status: 1 });
referralSchema.index({ type: 1, priority: 1 });
referralSchema.index({ deadline: 1, status: 1 });

// Virtual for referral age
referralSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const created = this.createdAt;
  const diffTime = Math.abs(now - created);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for days until deadline
referralSchema.virtual('daysUntilDeadline').get(function() {
  if (!this.deadline) return null;
  const now = new Date();
  const deadline = this.deadline;
  const diffTime = deadline - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to check if referral is overdue
referralSchema.methods.isOverdue = function() {
  if (!this.deadline) return false;
  return new Date() > this.deadline && this.status === 'pending';
};

// Method to escalate priority
referralSchema.methods.escalate = function() {
  if (this.priority === 'routine') {
    this.priority = 'urgent';
  } else if (this.priority === 'urgent') {
    this.priority = 'emergency';
  }
  
  if (this.urgency === 'low') {
    this.urgency = 'medium';
  } else if (this.urgency === 'medium') {
    this.urgency = 'high';
  } else if (this.urgency === 'high') {
    this.urgency = 'critical';
  }
  
  return this;
};

// Pre-save middleware
referralSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Auto-escalate if overdue
  if (this.isOverdue() && this.status === 'pending') {
    this.escalate();
  }
  
  next();
});

module.exports = mongoose.model('Referral', referralSchema);
