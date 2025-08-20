const express = require('express');
const { body, validationResult, query } = require('express-validator');
const HealthReport = require('../models/HealthReport');
const { authenticateToken, authorizeRole, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/reports
// @desc    Get health reports with filtering
// @access  Private (Health workers, providers, admins)
router.get('/', [
  authenticateToken,
  query('type').optional().isIn(['illness', 'outbreak', 'mental_health_crisis', 'injury', 'environmental_hazard', 'medication_shortage', 'other']),
  query('status').optional().isIn(['pending', 'investigating', 'confirmed', 'resolved', 'false_alarm']),
  query('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  query('lat').optional().isFloat(),
  query('lng').optional().isFloat(),
  query('radius').optional().isFloat(),
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

    const {
      type,
      status,
      priority,
      lat,
      lng,
      radius = 10,
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = {};
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (priority) query.priority = priority;

   // If patient, only allow their own reports
   if (req.user.role === 'patient') {
     query.reporter = req.user._id;
   } else if (!['health_worker', 'doctor', 'ngo', 'admin'].includes(req.user.role)) {
     return res.status(403).json({ success: false, message: 'Not authorized to view reports' });
   }

    let reports;
    
    // If coordinates provided, find nearby reports
    if (lat && lng) {
      reports = await HealthReport.findNearby(parseFloat(lat), parseFloat(lng), parseFloat(radius));
    } else {
      reports = await HealthReport.find(query)
        .populate('reporter', 'firstName lastName email phone')
        .populate('assignedTo.user', 'firstName lastName email phone')
        .sort({ priority: -1, createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));
    }

    // Get total count for pagination
    const total = await HealthReport.countDocuments(query);

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          hasNext: parseInt(page) * parseInt(limit) < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reports',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/reports
// @desc    Create new health report
// @access  Private
router.post('/', [
  authenticateToken,
  body('type').isIn(['illness', 'outbreak', 'mental_health_crisis', 'injury', 'environmental_hazard', 'medication_shortage', 'other']).withMessage('Invalid report type'),
  body('severity').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity level'),
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('location').isObject().withMessage('Location must be an object'),
  body('urgency').optional().isIn(['routine', 'urgent', 'emergency']).withMessage('Invalid urgency level')
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

    const reportData = {
      ...req.body,
      reporter: req.user._id
    };

    const report = new HealthReport(reportData);
    await report.save();

    // Populate reporter info
    await report.populate('reporter', 'firstName lastName email phone');

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: { report }
    });

  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/reports/:id
// @desc    Get specific health report
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const report = await HealthReport.findById(req.params.id)
      .populate('reporter', 'firstName lastName email phone')
      .populate('assignedTo.user', 'firstName lastName email phone')
      .populate('actions.takenBy', 'firstName lastName email phone');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: { report }
    });

  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/reports/:id/status
// @desc    Update report status
// @access  Private (Health workers, providers, admins)
router.put('/:id/status', [
  authenticateToken,
  authorizeRole('health_worker', 'doctor', 'ngo', 'admin'),
  body('status').isIn(['pending', 'investigating', 'confirmed', 'resolved', 'false_alarm']).withMessage('Invalid status'),
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

    const { status, notes } = req.body;

    const report = await HealthReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Add action
    report.actions.push({
      action: `Status changed to ${status}`,
      takenBy: req.user._id,
      notes: notes || `Status updated to ${status}`
    });

    // Update status
    report.status = status;
    
    // Set resolved date if status is resolved
    if (status === 'resolved') {
      report.resolvedAt = new Date();
    }

    await report.save();

    // Populate for response
    await report.populate('reporter', 'firstName lastName email phone');
    await report.populate('actions.takenBy', 'firstName lastName email phone');

    res.json({
      success: true,
      message: 'Report status updated successfully',
      data: { report }
    });

  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update report status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/reports/:id/assign
// @desc    Assign report to health worker/provider
// @access  Private (Health workers, providers, admins)
router.post('/:id/assign', [
  authenticateToken,
  authorizeRole('health_worker', 'doctor', 'ngo', 'admin'),
  body('userId').isMongoId().withMessage('Valid user ID is required'),
  body('role').trim().notEmpty().withMessage('Role is required')
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

    const { userId, role } = req.body;

    const report = await HealthReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if already assigned
    const alreadyAssigned = report.assignedTo.find(assignment => 
      assignment.user.toString() === userId
    );

    if (alreadyAssigned) {
      return res.status(400).json({
        success: false,
        message: 'User already assigned to this report'
      });
    }

    // Add assignment
    report.assignedTo.push({
      user: userId,
      role,
      assignedAt: new Date()
    });

    // Add action
    report.actions.push({
      action: 'Report assigned',
      takenBy: req.user._id,
      notes: `Assigned to user ${userId} as ${role}`
    });

    await report.save();

    // Populate for response
    await report.populate('reporter', 'firstName lastName email phone');
    await report.populate('assignedTo.user', 'firstName lastName email phone');

    res.json({
      success: true,
      message: 'Report assigned successfully',
      data: { report }
    });

  } catch (error) {
    console.error('Assign report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/reports/:id/escalate
// @desc    Escalate report priority
// @access  Private (Health workers, providers, admins)
router.post('/:id/escalate', [
  authenticateToken,
  authorizeRole('health_worker', 'doctor', 'ngo', 'admin'),
  body('reason').trim().notEmpty().withMessage('Escalation reason is required')
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

    const { reason } = req.body;

    const report = await HealthReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    await report.escalate(req.user._id, reason);

    // Populate for response
    await report.populate('reporter', 'firstName lastName email phone');
    await report.populate('actions.takenBy', 'firstName lastName email phone');

    res.json({
      success: true,
      message: 'Report escalated successfully',
      data: { report }
    });

  } catch (error) {
    console.error('Escalate report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to escalate report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   DELETE /api/reports/:id
// @desc    Delete a health report
// @access  Private (Report owner, admins)
router.delete('/:id', [
  authenticateToken
], async (req, res) => {
  try {
    const report = await HealthReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if user can delete this report (owner or admin)
    if (report.reporter.toString() !== req.user._id.toString() && 
        !['admin', 'doctor', 'health_worker'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this report'
      });
    }

    await HealthReport.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });

  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/reports/:id/resolve
// @desc    Mark a report as resolved
// @access  Private (Health workers, providers, admins)
router.put('/:id/resolve', [
  authenticateToken,
  authorizeRole('doctor', 'health_worker', 'admin')
], async (req, res) => {
  try {
    const report = await HealthReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.status = 'resolved';
    report.resolvedAt = new Date();
    report.resolvedBy = req.user._id;
    
    await report.save();

    // Populate for response
    await report.populate('reporter', 'firstName lastName email phone');
    await report.populate('resolvedBy', 'firstName lastName email phone');

    res.json({
      success: true,
      message: 'Report marked as resolved',
      data: { report }
    });

  } catch (error) {
    console.error('Resolve report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/reports/:id/undo-resolution
// @desc    Undo resolution of a report
// @access  Private (Health workers, providers, admins)
router.put('/:id/undo-resolution', [
  authenticateToken,
  authorizeRole('doctor', 'health_worker', 'admin')
], async (req, res) => {
  try {
    const report = await HealthReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.status = 'pending';
    report.resolvedAt = undefined;
    report.resolvedBy = undefined;
    
    await report.save();

    // Populate for response
    await report.populate('reporter', 'firstName lastName email phone');

    res.json({
      success: true,
      message: 'Report resolution undone',
      data: { report }
    });

  } catch (error) {
    console.error('Undo resolution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to undo resolution',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/reports/stats/overview
// @desc    Get report statistics
// @access  Private (Health workers, providers, admins)
router.get('/stats/overview', [
  authenticateToken,
  authorizeRole('doctor', 'health_worker', 'ngo', 'admin')
], async (req, res) => {
  try {
    const stats = await HealthReport.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          byStatus: {
            $push: {
              status: '$status',
              priority: '$priority',
              type: '$type'
            }
          }
        }
      }
    ]);

    // Process breakdowns
    const statusBreakdown = {};
    const priorityBreakdown = {};
    const typeBreakdown = {};
    
    if (stats.length > 0) {
      stats[0].byStatus.forEach(item => {
        statusBreakdown[item.status] = (statusBreakdown[item.status] || 0) + 1;
        priorityBreakdown[item.priority] = (priorityBreakdown[item.priority] || 0) + 1;
        typeBreakdown[item.type] = (typeBreakdown[item.type] || 0) + 1;
      });
    }

    const result = {
      total: stats.length > 0 ? stats[0].total : 0,
      statusBreakdown,
      priorityBreakdown,
      typeBreakdown
    };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get report stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;








