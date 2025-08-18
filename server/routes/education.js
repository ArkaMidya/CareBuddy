const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/education
// @desc    Get educational content
// @access  Public
router.get('/', [
  optionalAuth,
  query('category').optional().isIn(['nutrition', 'exercise', 'hygiene', 'reproductive_health', 'mental_wellness', 'disease_prevention']),
  query('language').optional().isLength({ min: 2, max: 5 }),
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

    const { category, language = 'en', page = 1, limit = 20 } = req.query;

    // Mock educational content
    const content = [
      {
        id: '1',
        title: 'Healthy Eating Habits',
        category: 'nutrition',
        language: 'en',
        content: 'Learn about balanced nutrition and healthy eating habits...',
        type: 'article',
        duration: '10 min read',
        difficulty: 'beginner',
        tags: ['nutrition', 'health', 'wellness'],
        image: '/images/nutrition.jpg',
        author: 'Dr. Nutrition Expert',
        publishedAt: new Date('2024-01-15'),
        views: 1250,
        rating: 4.5
      },
      {
        id: '2',
        title: 'Mental Health Awareness',
        category: 'mental_wellness',
        language: 'en',
        content: 'Understanding mental health and ways to maintain emotional well-being...',
        type: 'video',
        duration: '15 min',
        difficulty: 'intermediate',
        tags: ['mental_health', 'wellness', 'awareness'],
        image: '/images/mental-health.jpg',
        author: 'Dr. Psychology Expert',
        publishedAt: new Date('2024-01-10'),
        views: 890,
        rating: 4.8
      }
    ];

    // Filter by category if provided
    const filteredContent = category 
      ? content.filter(item => item.category === category)
      : content;

    res.json({
      success: true,
      data: {
        content: filteredContent,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(filteredContent.length / parseInt(limit)),
          hasNext: parseInt(page) * parseInt(limit) < filteredContent.length,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get education content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get educational content',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/education/:id
// @desc    Get specific educational content
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Mock content detail
    const content = {
      id,
      title: 'Complete Guide to Healthy Living',
      category: 'wellness',
      language: 'en',
      content: `
        <h1>Complete Guide to Healthy Living</h1>
        <p>This comprehensive guide covers all aspects of maintaining a healthy lifestyle...</p>
        
        <h2>Nutrition</h2>
        <p>Proper nutrition is the foundation of good health...</p>
        
        <h2>Exercise</h2>
        <p>Regular physical activity is essential for maintaining health...</p>
        
        <h2>Mental Wellness</h2>
        <p>Mental health is just as important as physical health...</p>
      `,
      type: 'interactive',
      duration: '30 min',
      difficulty: 'beginner',
      tags: ['health', 'wellness', 'lifestyle'],
      image: '/images/healthy-living.jpg',
      author: 'CareBody Health Team',
      publishedAt: new Date('2024-01-01'),
      views: 2500,
      rating: 4.7,
      sections: [
        { title: 'Introduction', duration: '5 min' },
        { title: 'Nutrition Basics', duration: '10 min' },
        { title: 'Exercise Guidelines', duration: '10 min' },
        { title: 'Mental Health Tips', duration: '5 min' }
      ]
    };

    res.json({
      success: true,
      data: { content }
    });

  } catch (error) {
    console.error('Get education content detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get educational content',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/education/categories
// @desc    Get educational categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      {
        id: 'nutrition',
        name: 'Nutrition',
        description: 'Learn about healthy eating habits and balanced nutrition',
        icon: 'restaurant',
        contentCount: 15
      },
      {
        id: 'exercise',
        name: 'Exercise & Fitness',
        description: 'Physical activity guidelines and workout routines',
        icon: 'fitness_center',
        contentCount: 12
      },
      {
        id: 'hygiene',
        name: 'Personal Hygiene',
        description: 'Hygiene practices for better health',
        icon: 'clean_hands',
        contentCount: 8
      },
      {
        id: 'reproductive_health',
        name: 'Reproductive Health',
        description: 'Sexual and reproductive health education',
        icon: 'favorite',
        contentCount: 10
      },
      {
        id: 'mental_wellness',
        name: 'Mental Wellness',
        description: 'Mental health awareness and emotional well-being',
        icon: 'psychology',
        contentCount: 18
      },
      {
        id: 'disease_prevention',
        name: 'Disease Prevention',
        description: 'Preventive measures and health screenings',
        icon: 'health_and_safety',
        contentCount: 14
      }
    ];

    res.json({
      success: true,
      data: { categories }
    });

  } catch (error) {
    console.error('Get education categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get categories',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/education/:id/progress
// @desc    Track learning progress
// @access  Private
router.post('/:id/progress', [
  authenticateToken,
  body('progress').isFloat({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100'),
  body('completed').optional().isBoolean().withMessage('Completed must be a boolean')
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
    const { progress, completed } = req.body;

    // Mock progress tracking
    const progressData = {
      userId: req.user._id,
      contentId: id,
      progress: parseFloat(progress),
      completed: completed || false,
      lastAccessed: new Date()
    };

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: { progress: progressData }
    });

  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update progress',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;








