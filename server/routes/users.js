const express = require('express');
const { query, validationResult } = require('express-validator');
const User = require('../models/User');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/users?role=health_worker&specialization=cardiologist
router.get('/', [
  optionalAuth,
  query('role').optional().isString(),
  query('specialization').optional().isString(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { role, specialization, page = 1, limit = 50 } = req.query;
    const q = {};
    if (role) q.role = role;
    if (specialization) q['providerInfo.specialization'] = { $in: [specialization] };

    const total = await User.countDocuments(q);
    const users = await User.find(q)
      .select('-password')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    res.json({ success: true, data: { users, pagination: { current: parseInt(page), total: Math.ceil(total / parseInt(limit)) } } });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ success: false, message: 'Failed to get users' });
  }
});

module.exports = router;


