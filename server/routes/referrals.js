const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Referral = require('../models/Referral');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/referrals
// @desc    Get referrals with filtering and pagination
// @access  Private (Health workers, admins, patients)
router.get('/', [
  authenticateToken,
  // allow patients to view referrals as well
  authorizeRole('health_worker', 'doctor', 'ngo', 'admin', 'patient'),
  query('type').optional().isIn(['specialist', 'diagnostic', 'treatment', 'follow_up', 'emergency', 'preventive']),
  query('status').optional().isIn(['pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'expired']),
  query('priority').optional().isIn(['routine', 'urgent', 'emergency']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    console.log('DEBUG: GET /api/referrals called by', req.user ? `${req.user._id} (${req.user.role})` : 'anonymous', 'query=', req.query);
    console.log('DEBUG: Authorization header present?', !!req.headers.authorization);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      type,
      status,
      priority,
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = {};
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    // Filter by user role
    if (req.user.role === 'admin') {
      // Admin can see all referrals
    } else if (['doctor', 'health_worker'].includes(req.user.role)) {
      // Healthcare providers can see referrals they made or are assigned to
      query.$or = [
        { referringProvider: req.user._id },
        { referredToProvider: req.user._id }
      ];
    } else if (req.user.role === 'patient') {
      // Patients can see referrals where they are the patient
      query.patient = req.user._id;
    }

    const referrals = await Referral.find(query)
      .populate('patient', 'firstName lastName email phone')
      .populate('referringProvider', 'firstName lastName email phone')
      .populate('referredToProvider', 'firstName lastName email phone')
      .populate('acceptedBy', 'firstName lastName email phone')
      .sort({ priority: -1, urgency: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Get total count for pagination
    const total = await Referral.countDocuments(query);

    res.json({
      success: true,
      data: {
        referrals,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          hasNext: parseInt(page) * parseInt(limit) < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get referrals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referrals',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/referrals
// @desc    Create new referral
// @access  Private (Healthcare providers, admins)
router.post('/', [
  authenticateToken,
  authorizeRole('doctor', 'health_worker', 'admin'),
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('type').isIn(['specialist', 'diagnostic', 'treatment', 'follow_up', 'emergency', 'preventive']).withMessage('Invalid referral type'),
  body('specialty').trim().notEmpty().withMessage('Specialty is required'),
  body('priority').optional().isIn(['routine', 'urgent', 'emergency']),
  body('urgency').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('patient').isMongoId().withMessage('Valid patient ID is required'),
  body('referredToProvider').optional().isMongoId().withMessage('Invalid provider ID'),
  body('clinicalReason').trim().notEmpty().withMessage('Clinical reason is required'),
  body('deadline').optional().isISO8601().toDate().withMessage('Invalid deadline date'),
  body('healthReport').optional().isMongoId().withMessage('Invalid health report ID'),
  body('consultation').optional().isMongoId().withMessage('Invalid consultation ID')
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

    const referralData = {
      ...req.body,
      referringProvider: req.user._id
    };

    const referral = new Referral(referralData);
    await referral.save();

    // Populate for response
    await referral.populate('patient', 'firstName lastName email phone');
    await referral.populate('referringProvider', 'firstName lastName email phone');
    await referral.populate('referredToProvider', 'firstName lastName email phone');

    res.status(201).json({
      success: true,
      message: 'Referral created successfully',
      data: { referral }
    });

  } catch (error) {
    console.error('Create referral error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create referral',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/referrals/:id
// @desc    Get specific referral
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const referral = await Referral.findById(req.params.id)
      .populate('patient', 'firstName lastName email phone')
      .populate('referringProvider', 'firstName lastName email phone')
      .populate('referredToProvider', 'firstName lastName email phone')
      .populate('acceptedBy', 'firstName lastName email phone');

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found'
      });
    }

    // Check access permissions
    if (req.user.role !== 'admin' && 
        referral.referringProvider._id.toString() !== req.user._id.toString() &&
        referral.referredToProvider?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this referral'
      });
    }

    res.json({
      success: true,
      data: { referral }
    });

  } catch (error) {
    console.error('Get referral error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referral',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/referrals/:id/accept
// @desc    Accept a referral
// @access  Private (Healthcare providers, admins)
router.put('/:id/accept', [
  authenticateToken,
  authorizeRole('doctor', 'health_worker', 'admin'),
  body('appointmentDate').optional().isISO8601().toDate().withMessage('Invalid appointment date'),
  body('appointmentTime').optional().trim().notEmpty().withMessage('Appointment time is required if date is provided')
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

    const { appointmentDate, appointmentTime } = req.body;

    const referral = await Referral.findById(req.params.id);
    
    if (!referral) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found'
      });
    }

    // Check if user can accept this referral
    if (req.user.role !== 'admin' && 
        referral.referredToProvider?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this referral'
      });
    }

    referral.status = 'accepted';
    referral.acceptedAt = new Date();
    referral.acceptedBy = req.user._id;
    
    if (appointmentDate) {
      referral.appointmentDate = appointmentDate;
      referral.appointmentTime = appointmentTime;
    }

    await referral.save();

    // Populate for response
    await referral.populate('patient', 'firstName lastName email phone');
    await referral.populate('referringProvider', 'firstName lastName email phone');
    await referral.populate('referredToProvider', 'firstName lastName email phone');
    await referral.populate('acceptedBy', 'firstName lastName email phone');

    res.json({
      success: true,
      message: 'Referral accepted successfully',
      data: { referral }
    });

  } catch (error) {
    console.error('Accept referral error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept referral',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/referrals/:id/update-status
// @desc    Update referral status
// @access  Private (Healthcare providers, admins)
router.put('/:id/update-status', [
  authenticateToken,
  authorizeRole('doctor', 'health_worker', 'admin'),
  body('status').isIn(['pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'expired']).withMessage('Invalid status'),
  body('outcome').optional().isIn(['improved', 'stable', 'worsened', 'resolved', 'ongoing']),
  body('outcomeNotes').optional().trim().notEmpty()
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

    const { status, outcome, outcomeNotes } = req.body;

    const referral = await Referral.findById(req.params.id);
    
    if (!referral) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found'
      });
    }

    referral.status = status;
    if (outcome) referral.outcome = outcome;
    if (outcomeNotes) referral.outcomeNotes = outcomeNotes;

    await referral.save();

    // Populate for response
    await referral.populate('patient', 'firstName lastName email phone');
    await referral.populate('referringProvider', 'firstName lastName email phone');
    await referral.populate('referredToProvider', 'firstName lastName email phone');

    res.json({
      success: true,
      message: 'Referral status updated successfully',
      data: { referral }
    });

  } catch (error) {
    console.error('Update referral status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update referral status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/referrals/:id/notes
// @desc    Add note to referral
// @access  Private (Healthcare providers, admins)
router.post('/:id/notes', [
  authenticateToken,
  authorizeRole('doctor', 'health_worker', 'admin'),
  body('content').trim().isLength({ min: 5, max: 500 }).withMessage('Note content must be between 5 and 500 characters')
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

    const { content } = req.body;

    const referral = await Referral.findById(req.params.id);
    
    if (!referral) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found'
      });
    }

    referral.notes.push({
      content,
      addedBy: req.user._id
    });

    await referral.save();

    // Populate for response
    await referral.populate('patient', 'firstName lastName email phone');
    await referral.populate('notes.addedBy', 'firstName lastName email phone');

    res.json({
      success: true,
      message: 'Note added successfully',
      data: { referral }
    });

  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add note',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/referrals/stats/overview
// @desc    Get referral statistics
// @access  Private (Healthcare providers, admins)
router.get('/stats/overview', [
  authenticateToken,
  authorizeRole('doctor', 'health_worker', 'admin')
], async (req, res) => {
  try {
    const stats = await Referral.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          byType: {
            $push: {
              type: '$type',
              status: '$status',
              priority: '$priority',
              urgency: '$urgency'
            }
          }
        }
      }
    ]);

    // Process breakdowns
    const typeBreakdown = {};
    const statusBreakdown = {};
    const priorityBreakdown = {};
    const urgencyBreakdown = {};
    
    if (stats.length > 0) {
      stats[0].byType.forEach(item => {
        // Type breakdown
        typeBreakdown[item.type] = (typeBreakdown[item.type] || 0) + 1;
        
        // Status breakdown
        statusBreakdown[item.status] = (statusBreakdown[item.status] || 0) + 1;
        
        // Priority breakdown
        priorityBreakdown[item.priority] = (priorityBreakdown[item.priority] || 0) + 1;
        
        // Urgency breakdown
        urgencyBreakdown[item.urgency] = (urgencyBreakdown[item.urgency] || 0) + 1;
      });
    }

    const result = {
      total: stats.length > 0 ? stats[0].total : 0,
      typeBreakdown,
      statusBreakdown,
      priorityBreakdown,
      urgencyBreakdown
    };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get referral stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referral statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
