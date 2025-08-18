const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { authenticateToken, authorizeRole, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const Campaign = require('../models/Campaign');

// @route   GET /api/campaigns
// @desc    Get health campaigns
// @access  Public
router.get('/', [
  optionalAuth,
  query('type').optional().isIn(['immunization', 'health_checkup', 'mental_health', 'blood_donation', 'wellness', 'awareness']),
  query('status').optional().isIn(['upcoming', 'active', 'completed', 'cancelled']),
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

    const { type, status, page = 1, limit = 20 } = req.query;

    // Build filter for DB query
    const pageNum = parseInt(page, 10) || 1;
    const pageSize = Math.min(parseInt(limit, 10) || 20, 100);

    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    // Query DB for campaigns
    const total = await Campaign.countDocuments(filter);
    const campaignsFromDb = await Campaign.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .lean();

    res.json({
      success: true,
      data: {
        campaigns: campaignsFromDb,
        pagination: {
          current: pageNum,
          total: Math.ceil(total / pageSize),
          hasNext: pageNum * pageSize < total,
          hasPrev: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get campaigns',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/campaigns/:id
// @desc    Get specific campaign details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Mock campaign detail
    const campaign = {
      id,
      title: 'Comprehensive Health Checkup Drive',
      type: 'health_checkup',
      status: 'active',
      description: 'Free comprehensive health checkup including blood pressure, diabetes screening, and general consultation',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-03-15'),
      location: {
        address: 'Community Health Center',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        coordinates: { latitude: 40.7128, longitude: -74.0060 }
      },
      organizer: {
        name: 'City Health Department',
        contact: '+1-555-0123',
        email: 'health@city.gov'
      },
      targetAudience: 'Adults 40+',
      capacity: 500,
      registered: 320,
      image: '/images/health-checkup.jpg',
      tags: ['health-checkup', 'screening', 'preventive-care'],
      schedule: [
        { date: '2024-01-15', time: '09:00-17:00', slots: 50 },
        { date: '2024-01-16', time: '09:00-17:00', slots: 50 },
        { date: '2024-01-17', time: '09:00-17:00', slots: 50 }
      ],
      services: [
        'Blood pressure measurement',
        'Blood glucose test',
        'BMI calculation',
        'General consultation',
        'Health education'
      ],
      requirements: [
        'Valid ID proof',
        'Fasting for 8 hours (for glucose test)',
        'Pre-registration recommended'
      ]
    };

    res.json({
      success: true,
      data: { campaign }
    });

  } catch (error) {
    console.error('Get campaign detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get campaign details',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/campaigns/:id/register
// @desc    Register for a campaign
// @access  Private
router.post('/:id/register', [
  authenticateToken,
  // treat empty strings as missing
  body('preferredDate').optional({ checkFalsy: true }).isISO8601().withMessage('Valid date is required'),
  body('preferredTime').optional({ checkFalsy: true }).isString().withMessage('Preferred time must be a string'),
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

    const { id } = req.params;
    const { preferredDate, preferredTime, notes } = req.body;

    // Persist registration to campaign document
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    if (campaign.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot register for a cancelled campaign' });
    }

    // enforce registration deadline
    if (campaign.registrationDeadline && new Date() > new Date(campaign.registrationDeadline)) {
      return res.status(400).json({ success: false, message: 'Registration deadline has passed' });
    }

    // enforce campaign date (cannot register after campaign starts)
    if (campaign.campaignDate && new Date() > new Date(campaign.campaignDate)) {
      return res.status(400).json({ success: false, message: 'Campaign already started or completed' });
    }

    // prevent duplicate registrations
    const already = (campaign.registrations || []).some(r => String(r.user) === String(req.user._id));
    if (already) {
      return res.status(400).json({ success: false, message: 'User already registered for this campaign' });
    }

    const registration = {
      user: req.user._id,
      preferredDate: preferredDate ? new Date(preferredDate) : null,
      preferredTime: preferredTime || '',
      notes: notes || '',
      registeredAt: new Date()
    };

    campaign.registrations = campaign.registrations || [];
    campaign.registrations.push(registration);
    campaign.registered = (campaign.registered || 0) + 1;
    await campaign.save();

    res.status(201).json({
      success: true,
      message: 'Successfully registered for campaign',
      data: { registration }
    });

  } catch (error) {
    console.error('Register for campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register for campaign',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PATCH /api/campaigns/:id/cancel
// @desc    Cancel a campaign (only organizer or admin/ngo/health_worker)
// @access  Private
router.patch('/:id/cancel', [
  authenticateToken
], async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findById(id);
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });

    // allow organizer or admin/ngo/health_worker
    const allowedRoles = ['admin', 'ngo_worker', 'health_worker', 'healthcare_provider'];
    const isOrganizer = String(campaign.organizer) === String(req.user._id);
    if (!(isOrganizer || allowedRoles.includes(req.user.role))) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this campaign' });
    }

    campaign.status = 'cancelled';
    await campaign.save();

    res.json({ success: true, message: 'Campaign cancelled', data: { campaign } });
  } catch (err) {
    console.error('Cancel campaign error:', err);
    res.status(500).json({ success: false, message: 'Failed to cancel campaign' });
  }
});

// @route   POST /api/campaigns
// @desc    Create new campaign (Admin/Organizer only)
// @access  Private
router.post('/', [
  authenticateToken,
  authorizeRole('admin', 'healthcare_provider', 'ngo_worker', 'health_worker'),
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('type').isIn(['immunization', 'health_checkup', 'mental_health', 'blood_donation', 'wellness', 'awareness']).withMessage('Invalid campaign type'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('registrationDeadline').isISO8601().withMessage('Valid registration deadline is required'),
  body('campaignDate').isISO8601().withMessage('Valid campaign date is required'),
  body('location').isObject().withMessage('Location must be an object'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be a positive integer')
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
      title, description, type, location, capacity = 0,
      registrationDeadline, campaignDate, tags = [], services = [], requirements = []
    } = req.body;

    const campaignDoc = new Campaign({
      title,
      description,
      type,
      location,
      capacity,
      tags,
      services,
      requirements,
      registrationDeadline: new Date(registrationDeadline),
      campaignDate: new Date(campaignDate),
      organizer: req.user._id,
      organizerInfo: {
        name: req.user.firstName && req.user.lastName ? `${req.user.firstName} ${req.user.lastName}` : req.user.email,
        contact: req.user.phone || '',
        email: req.user.email
      },
      status: 'upcoming',
      registered: 0,
    });

    await campaignDoc.save();

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: { campaign: campaignDoc }
    });

  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create campaign',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/campaigns/stats/overview
// @desc    Get campaign statistics
// @access  Public
router.get('/stats/overview', async (req, res) => {
  try {
    // Mock statistics
    const stats = {
      total: 25,
      active: 8,
      upcoming: 12,
      completed: 5,
      totalParticipants: 2500,
      byType: {
        immunization: 8,
        health_checkup: 6,
        mental_health: 4,
        blood_donation: 3,
        wellness: 2,
        awareness: 2
      }
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get campaign stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;






