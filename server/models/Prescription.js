const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  consultation: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultation', required: true },
  prescribedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medications: [{ name: String, dosage: String, frequency: String, duration: String }],
  notes: String,
  issuedAt: { type: Date, default: Date.now }
}, { timestamps: true });

prescriptionSchema.index({ consultation: 1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);


