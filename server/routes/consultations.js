const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/consultations
// @desc    Get consultations
// @access  Private
router.get('/', [
  authenticateToken,
  query('status').optional().isIn(['scheduled', 'in_progress', 'completed', 'cancelled']),
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
    if (status) query.status = status;

    // Filter by user role
    if (req.user.role === 'healthcare_provider') {
      query.provider = req.user._id;
    } else {
      query.patient = req.user._id;
    }

    // Mock data for now - in real implementation, you'd have a Consultation model
    const consultations = [
      {
        id: '1',
        patient: { id: '1', name: 'John Doe', email: 'john@example.com' },
        provider: { id: '2', name: 'Dr. Smith', email: 'smith@example.com' },
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'scheduled',
        type: 'video',
        notes: 'Follow-up consultation'
      }
    ];

    res.json({
      success: true,
      data: {
        consultations,
        pagination: {
          current: parseInt(page),
          total: 1,
          hasNext: false,
          hasPrev: false
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

    // Mock consultation creation
    const consultation = {
      id: Date.now().toString(),
      patient: req.user,
      provider: { id: providerId, name: 'Dr. Provider' },
      scheduledAt: new Date(scheduledAt),
      status: 'scheduled',
      type,
      notes: notes || ''
    };

    res.status(201).json({
      success: true,
      message: 'Consultation booked successfully',
      data: { consultation }
    });

  } catch (error) {
    console.error('Book consultation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book consultation',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;








