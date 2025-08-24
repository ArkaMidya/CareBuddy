const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();
const Consultation = require('../models/Consultation');
const User = require('../models/User');
const Prescription = require('../models/Prescription');

// @route   GET /api/consultations
// @desc    Get consultations
// @access  Private
router.get('/', [
  authenticateToken,
  query('status').optional().isIn(['requested', 'scheduled', 'in_progress', 'completed', 'cancelled', 'denied']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { status, page = 1, limit = 20 } = req.query;

    // Auto-complete any scheduled consultations whose end time has passed
    try {
      await Consultation.updateMany({ status: 'scheduled', scheduledEnd: { $lt: new Date() } }, { $set: { status: 'completed' } });
    } catch (e) {
      console.error('Auto-complete update failed:', e);
    }

    // Build query based on user role
    const query = {};
    if (status) {
      query.status = status;
    }

    // Filter by user role (doctors and health workers see provider-side)
    if (req.user.role === 'doctor') {
      query.provider = req.user._id;
      query.providerRole = 'doctor'; // Add a filter for the provider's role
    } else if (req.user.role === 'health_worker') {
      query.provider = req.user._id;
      query.providerRole = 'health_worker'; // Add a filter for the provider's role
    } else {
      query.patient = req.user._id;
      // No providerRole needed for patients
    }

    // Query DB for consultations
    const total = await Consultation.countDocuments(query);
    const consultations = await Consultation.find(query)
      .populate('patient', 'firstName lastName email providerInfo')
      .populate('provider', 'firstName lastName email providerInfo')
      .sort({ scheduledAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Attach any prescription for each consultation
    const consultationsWithPrescriptions = await Promise.all(consultations.map(async (c) => {
      const pres = await Prescription.findOne({ consultation: c._id });
      const obj = c.toObject ? c.toObject() : c;
      obj.prescription = pres || null;
      return obj;
    }));

    res.json({
      success: true,
      data: {
        consultations: consultationsWithPrescriptions,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          hasNext: parseInt(page) * parseInt(limit) < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get consultations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get consultations',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/consultations
// @desc    Book consultation
// @access  Private
router.post('/', [
  authenticateToken,
  body('providerId').isMongoId().withMessage('Valid provider ID is required'),
  body('scheduledAt').isISO8601().withMessage('Valid start date is required'),
  body('scheduledEnd').isISO8601().withMessage('Valid end date is required'),
  body('type').isIn(['video', 'audio', 'chat']).withMessage('Invalid consultation type'),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { providerId, scheduledAt, scheduledEnd, type, notes } = req.body;

    // Ensure scheduledEnd is after scheduledAt
    const start = new Date(scheduledAt);
    const end = new Date(scheduledEnd);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return res.status(400).json({ success: false, message: 'End time must be after start time' });
    }

    // Create consultation request
    const consultation = new Consultation({
      patient: req.user._id,
      provider: providerId,
      scheduledAt: new Date(scheduledAt),
      scheduledEnd: scheduledEnd ? new Date(scheduledEnd) : undefined,
      type,
      notes: notes || '',
      status: 'requested',
      // Fetch the provider's role to save it with the consultation
      providerRole: (await User.findById(providerId))?.role // Assuming providerId will always have a role
    });
    await consultation.save();

    // notify provider via socket (include patient info and friendly message)
    try {
      const io = req.app.get('io');
      const populated = await consultation.populate('patient', 'firstName lastName email');
      const patient = populated.patient || {};
      const patientName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || patient.email || 'A patient';
      const message = `${patientName} requested a consultation`;
      if (io) {
        console.log('Emitting consultation:requested to provider', providerId);
        io.to(String(providerId)).emit('consultation:requested', { consultation: populated, patient, message });
      }
    } catch (e) {
      console.error('Socket emit error:', e);
    }

    res.status(201).json({ success: true, message: 'Consultation request sent', data: { consultation } });

  } catch (error) {
    console.error('Book consultation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book consultation',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Provider respond endpoint
router.post('/:id/respond', [
  authenticateToken,
  authorizeRole('health_worker', 'doctor', 'ngo', 'admin', 'patient'),
  body('action').isIn(['accept','deny','completed']).withMessage('Invalid action')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { id } = req.params;
    const { action } = req.body;

    const consultation = await Consultation.findById(id).populate('patient', 'firstName lastName email');
    if (!consultation) return res.status(404).json({ success: false, message: 'Consultation not found' });
    // Allow provider or patient to respond/dismiss their own consultation
    if (String(consultation.provider) !== String(req.user._id) && String(consultation.patient._id) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (action === 'accept') consultation.status = 'scheduled';
    if (action === 'deny') consultation.status = 'denied';
    if (action === 'completed') consultation.status = 'completed'; // Handle 'completed' action
    await consultation.save();

    // populate provider info for message
    const providerInfo = await User.findById(req.user._id).select('firstName lastName email');
    const providerName = providerInfo ? `${providerInfo.firstName || ''} ${providerInfo.lastName || ''}`.trim() || providerInfo.email : 'Provider';

    // notify patient with action and provider name
    try {
      const io = req.app.get('io');
      const payload = await consultation.populate('patient', 'firstName lastName email');
      const message = action === 'accept' ? `${providerName} accepted your consultation` : action === 'deny' ? `${providerName} denied your consultation` : `${providerName} updated your consultation`;
      if (io) io.to(String(consultation.patient._id)).emit('consultation:responded', { consultation: payload, action, provider: providerInfo, message });
    } catch (e) {
      console.error('Socket emit error:', e);
    }

    return res.json({ success: true, message: `Consultation ${action}ed`, data: { consultation } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create prescription for a consultation (doctor only)
router.post('/:id/prescriptions', [
  authenticateToken,
  authorizeRole('doctor','health_worker'),
  body('medications').isArray({ min: 1 }).withMessage('Medications array is required'),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { id } = req.params;
    const consultation = await Consultation.findById(id);
    if (!consultation) return res.status(404).json({ success: false, message: 'Consultation not found' });
    if (String(consultation.provider) !== String(req.user._id)) return res.status(403).json({ success: false, message: 'Not authorized to prescribe for this consultation' });

    // Upsert prescription
    let prescription = await Prescription.findOne({ consultation: id });
    if (prescription) {
      prescription.medications = req.body.medications;
      prescription.notes = req.body.notes || '';
      await prescription.save();
    } else {
      prescription = new Prescription({
        consultation: id,
        prescribedBy: req.user._id,
        patient: consultation.patient,
        medications: req.body.medications,
        notes: req.body.notes || ''
      });
      await prescription.save();
    }

    // notify patient
    try {
      const io = req.app.get('io');
      const providerInfo = await User.findById(req.user._id).select('firstName lastName email');
      const message = `${providerInfo ? (providerInfo.firstName || providerInfo.email) : 'Provider'} issued an e-prescription`;
      if (io) io.to(String(consultation.patient)).emit('prescription:created', { prescription, message });
    } catch (e) { console.error('Socket emit error:', e); }

    return res.status(201).json({ success: true, message: 'Prescription saved', data: { prescription } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get prescription for a consultation (patient or provider)
router.get('/:id/prescriptions', [authenticateToken], async (req, res) => {
  try {
    const { id } = req.params;
    const prescription = await Prescription.findOne({ consultation: id });
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });
    const consultation = await Consultation.findById(id);
    if (!consultation) return res.status(404).json({ success: false, message: 'Consultation not found' });
    if (String(consultation.patient) !== String(req.user._id) && String(consultation.provider) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    return res.json({ success: true, data: { prescription } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;








