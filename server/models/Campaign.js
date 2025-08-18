const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, trim: true },
  type: {
    type: String,
    enum: ['immunization', 'health_checkup', 'mental_health', 'blood_donation', 'wellness', 'awareness'],
    required: true
  },
  status: { type: String, enum: ['upcoming', 'active', 'completed', 'cancelled'], default: 'upcoming' },
  startDate: { type: Date },
  endDate: { type: Date },
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  organizerInfo: {
    name: String,
    contact: String,
    email: String
  },
  targetAudience: String,
  capacity: { type: Number, default: 0 },
  registered: { type: Number, default: 0 },
  image: String,
  tags: [String],
  services: [String],
  requirements: [String]
}, { timestamps: true });

// Registrations embedded in campaign for simplicity
campaignSchema.add({
  registrations: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    preferredDate: Date,
    preferredTime: String,
    notes: String,
    registeredAt: Date
  }],
  registrationDeadline: Date,
  campaignDate: Date
});

campaignSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model('Campaign', campaignSchema);


