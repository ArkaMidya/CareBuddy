const express = require('express');
const { query, validationResult } = require('express-validator');
const User = require('../models/User');
const { optionalAuth } = require('../middleware/auth');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

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

// @route   PATCH /api/users/:id
// @desc    Update user profile (e.g., specialization for doctors)
// @access  Private (Admin or Self)
router.patch('/:id', [
  authenticateToken,
  authorizeRole('admin', 'doctor', 'health_worker'), // Only admin or the user themselves can update
], async (req, res) => {
  try {
    const { id } = req.params;
    const { specialization, ...otherUpdates } = req.body;

    // Ensure only authorized users can update other users' profiles
    if (req.user.role !== 'admin' && String(req.user._id) !== id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this user' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update specific fields. For specialization, it's inside providerInfo
    if (specialization !== undefined) {
      if (!user.providerInfo) {
        user.providerInfo = {};
      }
      user.providerInfo.specialization = Array.isArray(specialization) ? specialization : [specialization];
    }

    // Apply other direct updates (e.g., phone, address, etc. if allowed by schema)
    Object.keys(otherUpdates).forEach(key => {
      // Prevent direct role changes via this endpoint by non-admins
      if (key === 'role' && req.user.role !== 'admin') {
        delete otherUpdates[key];
      }
      if (user[key] !== undefined) {
        user[key] = otherUpdates[key];
      }
    });
    
    await user.save();

    res.json({ success: true, message: 'User profile updated successfully', data: { user: user.getPublicProfile() } });

  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ success: false, message: 'Failed to update user profile' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user (admin only)
// @access  Private (admin)
router.delete('/:id', [
  authenticateToken,
  authorizeRole('admin')
], async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await User.findByIdAndDelete(id);

    // Optionally: remove or reassign related data (consultations, referrals, etc.) if needed.

    return res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
});

module.exports = router;


