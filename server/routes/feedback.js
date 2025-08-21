const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Feedback = require('../models/Feedback');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/feedback
// @desc    Get feedback with filtering and pagination
// @access  Private (Healthcare providers, admins, patients)
router.get('/', [
  authenticateToken,
  // allow patients to view feedback as well
  authorizeRole('health_worker', 'doctor', 'admin', 'patient'),
  query('type').optional().isIn(['care_quality', 'wait_time', 'communication', 'facility', 'medication', 'follow_up', 'general']),
  query('status').optional().isIn(['pending', 'reviewed', 'addressed', 'resolved', 'closed']),
  query('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    console.log('DEBUG: GET /api/feedback called by', req.user ? `${req.user._id} (${req.user.role})` : 'anonymous', 'query=', req.query);
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

    // If user is a healthcare provider (doctor/health_worker), only show feedback for them
    // Admins and patients can see all feedback
    if (['doctor', 'health_worker'].includes(req.user.role)) {
      query.healthcareProvider = req.user._id;
    }

    const feedback = await Feedback.find(query)
      .populate('patient', 'firstName lastName email')
      .populate('healthcareProvider', 'firstName lastName email')
      .populate('response.respondedBy', 'firstName lastName email')
      .sort({ priority: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Get total count for pagination
    const total = await Feedback.countDocuments(query);

    res.json({
      success: true,
      data: {
        feedback,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          hasNext: parseInt(page) * parseInt(limit) < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/feedback
// @desc    Submit new feedback
// @access  Private
router.post('/', [
  authenticateToken,
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('type').isIn(['care_quality', 'wait_time', 'communication', 'facility', 'medication', 'follow_up', 'general']).withMessage('Invalid feedback type'),
  body('rating.overall').isInt({ min: 1, max: 5 }).withMessage('Overall rating must be between 1 and 5'),
  body('rating.careQuality').optional().isInt({ min: 1, max: 5 }),
  body('rating.communication').optional().isInt({ min: 1, max: 5 }),
  body('rating.waitTime').optional().isInt({ min: 1, max: 5 }),
  body('rating.facility').optional().isInt({ min: 1, max: 5 }),
  body('healthcareProvider').optional().isMongoId().withMessage('Invalid healthcare provider ID'),
  body('healthReport').optional().isMongoId().withMessage('Invalid health report ID'),
  body('consultation').optional().isMongoId().withMessage('Invalid consultation ID'),
  body('isAnonymous').optional().isBoolean()
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

    const feedbackData = {
      ...req.body,
      patient: req.user._id
    };

    const feedback = new Feedback(feedbackData);
    await feedback.save();

    // Populate for response
    await feedback.populate('patient', 'firstName lastName email');
    await feedback.populate('healthcareProvider', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: { feedback }
    });

  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/feedback/:id
// @desc    Get specific feedback
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('patient', 'firstName lastName email')
      .populate('healthcareProvider', 'firstName lastName email')
      .populate('response.respondedBy', 'firstName lastName email');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Check access permissions
    if (req.user.role !== 'admin' && 
        feedback.patient._id.toString() !== req.user._id.toString() &&
        feedback.healthcareProvider?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this feedback'
      });
    }

    res.json({
      success: true,
      data: { feedback }
    });

  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/feedback/:id/respond
// @desc    Respond to feedback
// @access  Private (Healthcare providers, admins)
router.put('/:id/respond', [
  authenticateToken,
  authorizeRole('doctor', 'health_worker', 'admin'),
  body('content').trim().isLength({ min: 10, max: 1000 }).withMessage('Response must be between 10 and 1000 characters')
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

    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Check if user can respond to this feedback
    if (req.user.role !== 'admin' && 
        feedback.healthcareProvider?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this feedback'
      });
    }

    feedback.response = {
      content,
      respondedBy: req.user._id,
      respondedAt: new Date()
    };

    feedback.status = 'addressed';
    await feedback.save();

    // Populate for response
    await feedback.populate('patient', 'firstName lastName email');
    await feedback.populate('healthcareProvider', 'firstName lastName email');
    await feedback.populate('response.respondedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Response added successfully',
      data: { feedback }
    });

  } catch (error) {
    console.error('Respond to feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to respond to feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/feedback/:id/status
// @desc    Update feedback status
// @access  Private (Healthcare providers, admins)
router.put('/:id/status', [
  authenticateToken,
  authorizeRole('doctor', 'health_worker', 'admin'),
  body('status').isIn(['pending', 'reviewed', 'addressed', 'resolved', 'closed']).withMessage('Invalid status'),
  body('followUpRequired').optional().isBoolean(),
  body('followUpDate').optional().isISO8601().toDate()
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

    const { status, followUpRequired, followUpDate } = req.body;

    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    feedback.status = status;
    if (followUpRequired !== undefined) feedback.followUpRequired = followUpRequired;
    if (followUpDate) feedback.followUpDate = followUpDate;

    await feedback.save();

    // Populate for response
    await feedback.populate('patient', 'firstName lastName email');
    await feedback.populate('healthcareProvider', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Feedback status updated successfully',
      data: { feedback }
    });

  } catch (error) {
    console.error('Update feedback status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update feedback status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/feedback/stats/overview
// @desc    Get feedback statistics
// @access  Private (Healthcare providers, admins)
router.get('/stats/overview', [
  authenticateToken,
  authorizeRole('doctor', 'health_worker', 'admin')
], async (req, res) => {
  try {
    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          averageRating: { $avg: '$rating.overall' },
          byType: {
            $push: {
              type: '$type',
              rating: '$rating.overall',
              status: '$status',
              priority: '$priority'
            }
          }
        }
      }
    ]);

    // Process breakdowns
    const typeBreakdown = {};
    const statusBreakdown = {};
    const priorityBreakdown = {};
    const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    if (stats.length > 0) {
      stats[0].byType.forEach(item => {
        // Type breakdown
        typeBreakdown[item.type] = (typeBreakdown[item.type] || 0) + 1;
        
        // Status breakdown
        statusBreakdown[item.status] = (statusBreakdown[item.status] || 0) + 1;
        
        // Priority breakdown
        priorityBreakdown[item.priority] = (priorityBreakdown[item.priority] || 0) + 1;
        
        // Rating breakdown
        if (item.rating) {
          ratingBreakdown[item.rating] = (ratingBreakdown[item.rating] || 0) + 1;
        }
      });
    }

    const result = {
      total: stats.length > 0 ? stats[0].total : 0,
      averageRating: stats.length > 0 ? Math.round(stats[0].averageRating * 100) / 100 : 0,
      typeBreakdown,
      statusBreakdown,
      priorityBreakdown,
      ratingBreakdown
    };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get feedback stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get feedback statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;








