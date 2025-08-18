const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema({
  // Basic follow-up info
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
  
  // Follow-up type
  type: {
    type: String,
    enum: ['post_treatment', 'medication_review', 'symptom_monitoring', 'preventive_care', 'rehabilitation', 'mental_health'],
    required: true
  },
  
  // Associated entities
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  healthcareProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  healthReport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthReport'
  },
  
  referral: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Referral'
  },
  
  consultation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation'
  },
  
  // Scheduling
  scheduledDate: {
    type: Date,
    required: true
  },
  
  scheduledTime: String,
  
  duration: {
    type: Number, // in minutes
    default: 30
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled'],
    default: 'scheduled'
  },
  
  // Reminders
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push', 'phone'],
      required: true
    },
    scheduledFor: {
      type: Date,
      required: true
    },
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: Date,
    response: String
  }],
  
  // Clinical assessment
  symptoms: [{
    name: String,
    severity: {
      type: String,
      enum: ['none', 'mild', 'moderate', 'severe']
    },
    frequency: String,
    notes: String
  }],
  
  vitalSigns: {
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: Number,
    temperature: Number,
    weight: Number,
    height: Number,
    oxygenSaturation: Number
  },
  
  // Treatment response
  treatmentResponse: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'worsened'],
    default: 'good'
  },
  
  sideEffects: [{
    medication: String,
    effect: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    },
    action: String
  }],
  
  // Medication adherence
  medicationAdherence: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  
  missedDoses: Number,
  
  // Lifestyle factors
  lifestyleFactors: {
    exercise: {
      frequency: String,
      duration: String,
      type: String
    },
    diet: {
      adherence: String,
      restrictions: [String],
      supplements: [String]
    },
    sleep: {
      hours: Number,
      quality: String
    },
    stress: {
      level: {
        type: String,
        enum: ['low', 'moderate', 'high']
      },
      management: [String]
    }
  },
  
  // Outcomes and next steps
  outcome: {
    type: String,
    enum: ['improved', 'stable', 'worsened', 'resolved', 'requires_escalation'],
    default: 'stable'
  },
  
  outcomeNotes: String,
  
  nextSteps: [{
    action: String,
    responsible: {
      type: String,
      enum: ['patient', 'provider', 'caregiver', 'specialist']
    },
    deadline: Date,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }],
  
  // Next follow-up
  nextFollowUpRequired: {
    type: Boolean,
    default: true
  },
  
  nextFollowUpDate: Date,
  
  nextFollowUpType: {
    type: String,
    enum: ['in_person', 'telehealth', 'phone', 'email']
  },
  
  // Notes and documentation
  notes: [{
    content: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    isPrivate: {
      type: Boolean,
      default: false
    }
  }],
  
  // Quality metrics
  qualityMetrics: {
    patientSatisfaction: {
      type: Number,
      min: 1,
      max: 5
    },
    waitTime: Number, // in minutes
    communicationQuality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor']
    },
    careCoordination: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor']
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
  
  completedAt: Date
}, {
  timestamps: true
});

// Indexes for efficient querying
followUpSchema.index({ patient: 1, scheduledDate: 1 });
followUpSchema.index({ healthcareProvider: 1, status: 1 });
followUpSchema.index({ scheduledDate: 1, status: 1 });
followUpSchema.index({ type: 1, outcome: 1 });

// Virtual for days until follow-up
followUpSchema.virtual('daysUntilFollowUp').get(function() {
  const now = new Date();
  const scheduled = this.scheduledDate;
  const diffTime = scheduled - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for overdue status
followUpSchema.virtual('isOverdue').get(function() {
  if (this.status !== 'scheduled' && this.status !== 'confirmed') return false;
  return new Date() > this.scheduledDate;
});

// Method to check if follow-up is due soon (within 7 days)
followUpSchema.methods.isDueSoon = function() {
  const daysUntil = this.daysUntilFollowUp;
  return daysUntil >= 0 && daysUntil <= 7;
};

// Method to reschedule follow-up
followUpSchema.methods.reschedule = function(newDate, newTime = null) {
  this.scheduledDate = newDate;
  if (newTime) this.scheduledTime = newTime;
  this.status = 'rescheduled';
  return this;
};

// Pre-save middleware
followUpSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Set completedAt when status changes to completed
  if (this.isModified('status') && this.status === 'completed') {
    this.completedAt = new Date();
  }
  
  next();
});

module.exports = mongoose.model('FollowUp', followUpSchema);
