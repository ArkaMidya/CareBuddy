const mongoose = require('mongoose');

const healthResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Resource title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Resource description is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['hospital', 'clinic', 'pharmacy', 'laboratory', 'equipment', 'medicine', 'expertise', 'transport', 'other'],
    required: [true, 'Resource type is required']
  },
  category: {
    type: String,
    enum: ['emergency', 'primary_care', 'specialized_care', 'diagnostic', 'preventive', 'mental_health', 'maternal_child', 'elderly_care'],
    required: [true, 'Resource category is required']
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Resource provider is required']
  },
  organization: {
    name: String,
    type: {
      type: String,
      enum: ['government', 'private', 'ngo', 'charity', 'community']
    },
    registrationNumber: String
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
    accessibility: {
      wheelchair: { type: Boolean, default: false },
      publicTransport: { type: Boolean, default: false },
      parking: { type: Boolean, default: false }
    }
  },
  contact: {
    phone: [String],
    email: [String],
    website: String,
    emergencyContact: String
  },
  availability: {
    isAvailable: {
      type: Boolean,
      default: true
    },
    schedule: {
      monday: { start: String, end: String, available: Boolean },
      tuesday: { start: String, end: String, available: Boolean },
      wednesday: { start: String, end: String, available: Boolean },
      thursday: { start: String, end: String, available: Boolean },
      friday: { start: String, end: String, available: Boolean },
      saturday: { start: String, end: String, available: Boolean },
      sunday: { start: String, end: String, available: Boolean }
    },
    emergency24x7: {
      type: Boolean,
      default: false
    }
  },
  services: [{
    name: String,
    description: String,
    cost: {
      amount: Number,
      currency: {
        type: String,
        default: 'USD'
      },
      isFree: {
        type: Boolean,
        default: false
      }
    },
    languages: [String],
    specializations: [String]
  }],
  capacity: {
    maxPatients: Number,
    currentPatients: Number,
    waitingTime: Number // in minutes
  },
  quality: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    certifications: [String],
    accreditations: [String]
  },
  images: [{
    url: String,
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  documents: [{
    name: String,
    url: String,
    type: String
  }],
  tags: [String],
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'closed'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
healthResourceSchema.index({ type: 1, category: 1 });
healthResourceSchema.index({ 'location.coordinates': '2dsphere' });
healthResourceSchema.index({ isActive: 1, isVerified: 1 });
healthResourceSchema.index({ tags: 1 });

// Virtual for availability status
healthResourceSchema.virtual('isCurrentlyAvailable').get(function() {
  if (!this.availability.isAvailable) return false;
  
  const now = new Date();
  const dayOfWeek = now.toLocaleLowerCase().slice(0, 3);
  const currentTime = now.toTimeString().slice(0, 5);
  
  const todaySchedule = this.availability.schedule[dayOfWeek];
  if (!todaySchedule || !todaySchedule.available) return false;
  
  return currentTime >= todaySchedule.start && currentTime <= todaySchedule.end;
});

// Method to get distance from a point
healthResourceSchema.methods.getDistanceFrom = function(lat, lng) {
  if (!this.location.coordinates.latitude || !this.location.coordinates.longitude) {
    return null;
  }
  
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat - this.location.coordinates.latitude) * Math.PI / 180;
  const dLng = (lng - this.location.coordinates.longitude) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.location.coordinates.latitude * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Static method to find nearby resources
healthResourceSchema.statics.findNearby = function(lat, lng, maxDistance = 50) {
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
    isActive: true,
    isVerified: true
  });
};

module.exports = mongoose.model('HealthResource', healthResourceSchema);








