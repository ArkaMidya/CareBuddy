const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheduledAt: { type: Date },
  scheduledEnd: { type: Date },
  type: { type: String, enum: ['video','audio','chat'], default: 'video' },
  providerRole: { type: String, enum: ['doctor', 'health_worker'], required: true },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['requested','scheduled','in_progress','completed','cancelled','denied'], default: 'requested' }
}, { timestamps: true });

module.exports = mongoose.model('Consultation', consultationSchema);


