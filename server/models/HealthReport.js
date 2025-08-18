const mongoose = require('mongoose');

const healthReportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reporter is required']
  },
  type: {
    type: String,
    enum: ['illness', 'outbreak', 'mental_health_crisis', 'injury', 'environmental_hazard', 'medication_shortage', 'other'],
    required: [true, 'Report type is required']
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: [true, 'Severity level is required']
  },
  title: {
    type: String,
    required: [true, 'Report title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Report description is required'],
    trim: true
  },
  location: {
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    landmark: String
  },
  affectedPopulation: {
    count: Number,
    ageGroups: [{
      type: String,
      enum: ['infant', 'child', 'teen', 'adult', 'elderly']
    }],
    demographics: {
      gender: {
        male: Number,
        female: Number,
        other: Number
      },
      socioeconomicStatus: {
        type: String,
        enum: ['low', 'middle', 'high']
      }
    }
  },
  symptoms: [{
    name: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    },
    duration: String
  }],
  suspectedCause: {
    type: String,
    enum: ['viral', 'bacterial', 'environmental', 'nutritional', 'accident', 'mental_health', 'unknown'],
    default: 'unknown'
  },
  urgency: {
    type: String,
    enum: ['routine', 'urgent', 'emergency'],
    default: 'routine'
  },
  status: {
    type: String,
    enum: ['pending', 'investigating', 'confirmed', 'resolved', 'false_alarm'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  assignedTo: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String,
    assignedAt: {
      type: Date,
      default: Date.now
    }
  }],
  actions: [{
    action: String,
    takenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    takenAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'failed'],
      default: 'pending'
    },
    notes: String
  }],
  evidence: [{
    type: {
      type: String,
      enum: ['image', 'document', 'video', 'audio']
    },
    url: String,
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  relatedReports: [{
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HealthReport'
    },
    relationship: {
      type: String,
      enum: ['duplicate', 'related', 'escalation', 'follow_up']
    }
  }],
  notifications: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push', 'system']
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed'],
      default: 'sent'
    }
  }],
  tags: [String],
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationNotes: String,
  resolvedAt: Date,
  resolutionNotes: String
}, {
  timestamps: true
});

// Indexes for better query performance
healthReportSchema.index({ type: 1, severity: 1 });
healthReportSchema.index({ status: 1, priority: 1 });
healthReportSchema.index({ 'location.coordinates': '2dsphere' });
healthReportSchema.index({ createdAt: -1 });
healthReportSchema.index({ reporter: 1 });

// Virtual for time since creation
healthReportSchema.virtual('timeSinceCreation').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day(s) ago`;
  if (hours > 0) return `${hours} hour(s) ago`;
  return 'Just now';
});

// Virtual for urgency score
healthReportSchema.virtual('urgencyScore').get(function() {
  let score = 0;
  
  // Severity scoring
  switch (this.severity) {
    case 'critical': score += 10; break;
    case 'high': score += 7; break;
    case 'medium': score += 4; break;
    case 'low': score += 1; break;
  }
  
  // Urgency scoring
  switch (this.urgency) {
    case 'emergency': score += 10; break;
    case 'urgent': score += 7; break;
    case 'routine': score += 1; break;
  }
  
  // Affected population scoring
  if (this.affectedPopulation && this.affectedPopulation.count) {
    if (this.affectedPopulation.count > 100) score += 5;
    else if (this.affectedPopulation.count > 50) score += 3;
    else if (this.affectedPopulation.count > 10) score += 1;
  }
  
  return score;
});

// Pre-save middleware to set priority based on urgency and severity
healthReportSchema.pre('save', function(next) {
  if (this.isModified('severity') || this.isModified('urgency')) {
    const severityScore = { critical: 4, high: 3, medium: 2, low: 1 }[this.severity];
    const urgencyScore = { emergency: 3, urgent: 2, routine: 1 }[this.urgency];
    const totalScore = severityScore + urgencyScore;
    
    if (totalScore >= 6) this.priority = 'critical';
    else if (totalScore >= 4) this.priority = 'high';
    else if (totalScore >= 2) this.priority = 'medium';
    else this.priority = 'low';
  }
  next();
});

// Static method to find nearby reports
healthReportSchema.statics.findNearby = function(lat, lng, maxDistance = 10, days = 30) {
  const dateLimit = new Date();
  dateLimit.setDate(dateLimit.getDate() - days);
  
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $maxDistance: maxDistance * 1000 // Convert to meters
      }
    },
    createdAt: { $gte: dateLimit },
    status: { $ne: 'resolved' }
  }).sort({ priority: -1, createdAt: -1 });
};

// Method to escalate report
healthReportSchema.methods.escalate = function(userId, reason) {
  this.priority = 'critical';
  this.actions.push({
    action: 'Report escalated',
    takenBy: userId,
    notes: reason
  });
  return this.save();
};

module.exports = mongoose.model('HealthReport', healthReportSchema);








