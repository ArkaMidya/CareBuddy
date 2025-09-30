// This route returns a list of report IDs that have open escalations
const express = require('express');
const router = express.Router();
const EmergencyEscalation = require('../models/EmergencyEscalation');

// GET /api/reports/escalated - returns array of report_ids with open escalations
const mongoose = require('mongoose');
router.get('/escalated', async (req, res) => {
  try {
    const escalations = await EmergencyEscalation.find({ status: { $nin: ['Resolved', 'Completed'] }, report_id: { $exists: true, $ne: null } }).select('report_id');
    // Only include valid ObjectId strings
    const escalatedIds = escalations
      .map(e => String(e.report_id))
      .filter(id => mongoose.Types.ObjectId.isValid(id));
    console.log('DEBUG: Escalated report_ids returned:', escalatedIds);
    res.json({ success: true, escalated: escalatedIds });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
