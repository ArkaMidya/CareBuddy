const express = require('express');
const router = express.Router();
const HealthResource = require('../models/HealthResource');
const { authenticateToken } = require('../middleware/auth');

// Get all resources with filtering and pagination
router.get('/', async (req, res) => {
  try {
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

    let query = { isActive: true };

    // Add filters
    if (type) query.type = type;
    if (category) query.category = category;
    if (verified !== undefined) query.isVerified = verified === 'true';
    if (available !== undefined) query['availability.emergency24x7'] = available === 'true';

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'services.name': { $regex: search, $options: 'i' } }
      ];
    }

    let resources;
    let totalCount;

    // If location is provided, use geospatial query
    if (lat && lng) {
      const maxDistance = radius * 1000; // Convert km to meters
      resources = await HealthResource.findNearby(parseFloat(lat), parseFloat(lng), maxDistance);
      totalCount = resources.length;
    } else {
      // Regular query with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      resources = await HealthResource.find(query)
        .populate('provider', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      totalCount = await HealthResource.countDocuments(query);
    }

    // If no resources found and location is provided, return a helpful message
    if (resources.length === 0 && lat && lng) {
      return res.json({
        success: true,
        message: 'No healthcare resources found in your area. Try expanding your search radius or check nearby cities.',
        data: {
          resources: [],
          pagination: {
            currentPage: parseInt(page),
            totalPages: 0,
            totalCount: 0,
            hasNext: false,
            hasPrev: false
          }
        }
      });
    }

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      data: {
        resources,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resources',
      error: error.message
    });
  }
});

// Get resource by ID
router.get('/:id', async (req, res) => {
  try {
    const resource = await HealthResource.findById(req.params.id)
      .populate('provider', 'firstName lastName email phone');

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
    console.error('Error fetching resource:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resource',
      error: error.message
    });
  }
});

// Create new resource (requires authentication)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const resourceData = {
      ...req.body,
      provider: req.user.id
    };

    const resource = new HealthResource(resourceData);
    await resource.save();

    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      data: { resource }
    });
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create resource',
      error: error.message
    });
  }
});

// Update resource (requires authentication)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const resource = await HealthResource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Check if user is the provider or admin
    if (resource.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this resource'
      });
    }

    const updatedResource = await HealthResource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Resource updated successfully',
      data: { resource: updatedResource }
    });
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update resource',
      error: error.message
    });
  }
});

// Delete resource (requires authentication)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const resource = await HealthResource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Check if user is the provider or admin
    if (resource.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this resource'
      });
    }

    await HealthResource.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete resource',
      error: error.message
    });
  }
});

// Verify resource (admin only)
router.post('/:id/verify', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can verify resources'
      });
    }

    const resource = await HealthResource.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    res.json({
      success: true,
      message: 'Resource verified successfully',
      data: { resource }
    });
  } catch (error) {
    console.error('Error verifying resource:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify resource',
      error: error.message
    });
  }
});

// Get resource statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalResources = await HealthResource.countDocuments({ isActive: true });
    const verifiedResources = await HealthResource.countDocuments({ isActive: true, isVerified: true });
    const emergencyResources = await HealthResource.countDocuments({ 
      isActive: true, 
      'availability.emergency24x7': true 
    });

    const typeStats = await HealthResource.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const categoryStats = await HealthResource.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        totalResources,
        verifiedResources,
        emergencyResources,
        typeStats,
        categoryStats
      }
    });
  } catch (error) {
    console.error('Error fetching resource stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resource statistics',
      error: error.message
    });
  }
});

module.exports = router;








