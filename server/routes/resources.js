const express = require('express');
const { body, validationResult, query } = require('express-validator');
const HealthResource = require('../models/HealthResource');
const { authenticateToken, authorizeRole, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/resources
// @desc    Get all health resources with filtering
// @access  Public
router.get('/', [
  optionalAuth,
  query('type').optional().isIn(['hospital', 'clinic', 'pharmacy', 'laboratory', 'equipment', 'medicine', 'expertise', 'transport', 'other']),
  query('category').optional().isIn(['emergency', 'primary_care', 'specialized_care', 'diagnostic', 'preventive', 'mental_health', 'maternal_child', 'elderly_care']),
  query('lat').optional().isFloat(),
  query('lng').optional().isFloat(),
  query('radius').optional().isFloat(),
  query('verified').optional().isBoolean(),
  query('available').optional().isBoolean(),
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
      category,
      lat,
      lng,
      radius = 50,
      verified,
      available,
      page = 1,
      limit = 20,
      search
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (verified !== undefined) query.isVerified = verified === 'true';
    if (available !== undefined) query['availability.isAvailable'] = available === 'true';
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    let resources;
    
    // If coordinates provided, find nearby resources
    if (lat && lng) {
      resources = await HealthResource.findNearby(parseFloat(lat), parseFloat(lng), parseFloat(radius));
    } else {
      resources = await HealthResource.find(query)
        .populate('provider', 'firstName lastName email phone')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));
    }

    // Get total count for pagination
    const total = await HealthResource.countDocuments(query);

    res.json({
      success: true,
      data: {
        resources,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          hasNext: parseInt(page) * parseInt(limit) < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get resources',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/resources/:id
// @desc    Get specific health resource
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const resource = await HealthResource.findById(req.params.id)
      .populate('provider', 'firstName lastName email phone profileImage');

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    res.json({
      success: true,
      data: { resource }
    });

  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get resource',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/resources
// @desc    Create new health resource
// @access  Private (Healthcare providers, health workers, NGO workers)
router.post('/', [
  authenticateToken,
  authorizeRole('healthcare_provider', 'health_worker', 'ngo_worker', 'admin'),
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('type').isIn(['hospital', 'clinic', 'pharmacy', 'laboratory', 'equipment', 'medicine', 'expertise', 'transport', 'other']).withMessage('Invalid resource type'),
  body('category').isIn(['emergency', 'primary_care', 'specialized_care', 'diagnostic', 'preventive', 'mental_health', 'maternal_child', 'elderly_care']).withMessage('Invalid category'),
  body('location').isObject().withMessage('Location must be an object'),
  body('contact').isObject().withMessage('Contact must be an object')
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

    const resourceData = {
      ...req.body,
      provider: req.user._id
    };

    const resource = new HealthResource(resourceData);
    await resource.save();

    // Populate provider info
    await resource.populate('provider', 'firstName lastName email phone');

    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      data: { resource }
    });

  } catch (error) {
    console.error('Create resource error:', error);
    console.error('Resource data received:', req.body);
    console.error('User info:', req.user);
    res.status(500).json({
      success: false,
      message: 'Failed to create resource',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/resources/:id
// @desc    Update health resource
// @access  Private (Resource owner or admin)
router.put('/:id', [
  authenticateToken,
  body('title').optional().trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('type').optional().isIn(['hospital', 'clinic', 'pharmacy', 'laboratory', 'equipment', 'medicine', 'expertise', 'transport', 'other']).withMessage('Invalid resource type'),
  body('category').optional().isIn(['emergency', 'primary_care', 'specialized_care', 'diagnostic', 'preventive', 'mental_health', 'maternal_child', 'elderly_care']).withMessage('Invalid category')
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

    const resource = await HealthResource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Check if user can update this resource
    if (resource.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this resource'
      });
    }

    const updatedResource = await HealthResource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('provider', 'firstName lastName email phone');

    res.json({
      success: true,
      message: 'Resource updated successfully',
      data: { resource: updatedResource }
    });

  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update resource',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   DELETE /api/resources/:id
// @desc    Delete health resource
// @access  Private (Resource owner or admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const resource = await HealthResource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Check if user can delete this resource
    if (resource.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this resource'
      });
    }

    // Soft delete - mark as inactive
    resource.isActive = false;
    resource.status = 'closed';
    await resource.save();

    res.json({
      success: true,
      message: 'Resource deleted successfully'
    });

  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete resource',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/resources/:id/verify
// @desc    Verify health resource (admin only)
// @access  Private (Admin)
router.post('/:id/verify', [
  authenticateToken,
  authorizeRole('admin'),
  body('verified').isBoolean().withMessage('Verified must be a boolean'),
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

    const { verified, notes } = req.body;

    const resource = await HealthResource.findByIdAndUpdate(
      req.params.id,
      { 
        isVerified: verified,
        verificationNotes: notes
      },
      { new: true }
    ).populate('provider', 'firstName lastName email phone');

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    res.json({
      success: true,
      message: `Resource ${verified ? 'verified' : 'unverified'} successfully`,
      data: { resource }
    });

  } catch (error) {
    console.error('Verify resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify resource',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/resources/stats/overview
// @desc    Get resource statistics
// @access  Public
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await HealthResource.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          verified: { $sum: { $cond: ['$isVerified', 1, 0] } },
          byType: {
            $push: {
              type: '$type',
              category: '$category'
            }
          }
        }
      }
    ]);

    // Process type and category breakdowns
    const typeBreakdown = {};
    const categoryBreakdown = {};
    
    if (stats.length > 0) {
      stats[0].byType.forEach(item => {
        typeBreakdown[item.type] = (typeBreakdown[item.type] || 0) + 1;
        categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + 1;
      });
    }

    const result = {
      total: stats.length > 0 ? stats[0].total : 0,
      verified: stats.length > 0 ? stats[0].verified : 0,
      typeBreakdown,
      categoryBreakdown
    };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;








