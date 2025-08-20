const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();
const Consultation = require('../models/Consultation');
const User = require('../models/User');

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

    // Build query based on user role
    const query = {};
    if (status) {
      query.status = status;
    } else {
      // Default: exclude 'completed' and 'denied' statuses from the main view
      query.status = { $nin: ['completed', 'denied'] };
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

    res.json({
      success: true,
      data: {
        consultations,
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
  body('scheduledAt').isISO8601().withMessage('Valid date is required'),
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

    const { providerId, scheduledAt, type, notes } = req.body;

    // Create consultation request
    const consultation = new Consultation({
      patient: req.user._id,
      provider: providerId,
      scheduledAt: new Date(scheduledAt),
      type,
      notes: notes || '',
      status: 'requested',
      // Fetch the provider's role to save it with the consultation
      providerRole: (await User.findById(providerId))?.role // Assuming providerId will always have a role
    });
    await consultation.save();

    // notify provider via socket
    try {
      const io = req.app.get('io');
      const payload = await consultation.populate('patient', 'firstName lastName email');
      if (io) {
        console.log('Emitting consultation:requested to provider', providerId);
        io.to(String(providerId)).emit('consultation:requested', payload);
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

    // notify patient
    try {
      const io = req.app.get('io');
      if (io) io.to(String(consultation.patient._id)).emit('consultation:responded', consultation);
    } catch (e) {}

    return res.json({ success: true, message: `Consultation ${action}ed`, data: { consultation } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;








