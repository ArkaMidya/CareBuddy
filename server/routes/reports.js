

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const HealthReport = require('../models/HealthReport');
const { authenticateToken, authorizeRole, optionalAuth } = require('../middleware/auth');

// @route   GET /api/reports
// @desc    Get all health reports (with optional filtering)
// @access  Private
router.get('/', optionalAuth, async (req, res) => {
  try {
    const filters = {};
    // Optional filters from query params
    if (req.query.status) filters.status = req.query.status;
    if (req.query.severity) filters.severity = req.query.severity;
    if (req.query.type) filters.type = req.query.type;
    if (req.query.urgency) filters.urgency = req.query.urgency;
    // Add more filters as needed

    const reports = await HealthReport.find(filters)
      .populate('reporter', 'firstName lastName email phone')
      .populate('assignedTo.user', 'firstName lastName email phone')
      .populate('actions.takenBy', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { reports }
    });
  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
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

    // notify all connected users about new report
    try {
      const io = req.app.get('io');
      if (io) io.emit('report:created', report);
    } catch (e) {
      console.error('Failed to emit report:created', e);
    }

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
    if (report.status === 'resolved') {
      return res.status(400).json({
        success: false,
        message: 'Report is already resolved'
      });
    }
    report.status = 'resolved';
    report.resolvedAt = new Date();
    report.resolvedBy = req.user._id;
    await report.save();
    await report.populate('reporter', 'firstName lastName email phone');
    await report.populate('resolvedBy', 'firstName lastName email phone');
    res.json({
      success: true,
      message: 'Report marked as resolved',
      data: { report }
    });
  } catch (error) {
    console.error('Resolve report error:', error);
    let errMsg = 'Failed to resolve report';
    if (error.name === 'CastError') {
      errMsg = 'Invalid report ID';
    } else if (error.name === 'ValidationError') {
      errMsg = 'Validation error: ' + error.message;
    } else if (error.code === 11000) {
      errMsg = 'Duplicate key error';
    } else if (error.message) {
      errMsg = error.message;
    }
    res.status(500).json({
      success: false,
      message: errMsg,
      error: error.message
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








