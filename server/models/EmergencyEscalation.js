const mongoose = require('mongoose');

const EmergencyEscalationSchema = new mongoose.Schema({
  case_id: { type: String, required: true, unique: true },
  report_id: { type: mongoose.Schema.Types.ObjectId, ref: 'HealthReport' },
  reporter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  emergency_type: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  assigned_to: { type: String }, // hospital/ambulance/team name or id
  status: { type: String, enum: ['Reported', 'Acknowledged', 'En route', 'Resolved', 'Completed'], default: 'Reported' },
  feedback: {
    time_to_response: Number,
    quality_of_care: String,
    comments: String
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

EmergencyEscalationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('EmergencyEscalation', EmergencyEscalationSchema);
