const express = require('express');
const router = express.Router();
const EmergencyEscalation = require('../models/EmergencyEscalation');

// Create new emergency escalation
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    // Prevent duplicate escalation for the same report/case (if report_id or unique key is provided)
    let existing;
    console.log('DEBUG: Incoming escalation report_id:', data.report_id, 'case_id:', data.case_id);
    if (data.report_id) {
      existing = await EmergencyEscalation.findOne({ report_id: data.report_id, status: { $nin: ['Resolved', 'Completed'] } });
      console.log('DEBUG: Existing open escalation for report_id', data.report_id, '=', !!existing);
    } else if (data.case_id) {
      existing = await EmergencyEscalation.findOne({ case_id: data.case_id, status: { $nin: ['Resolved', 'Completed'] } });
      console.log('DEBUG: Existing open escalation for case_id', data.case_id, '=', !!existing);
    }
    if (existing) {
      console.log('DEBUG: Duplicate escalation blocked for report_id:', data.report_id);
      return res.status(409).json({ error: 'This case has already been escalated and is still open.' });
    }
    // Generate unique case_id (e.g., E + timestamp)
    data.case_id = 'E' + Date.now();

    // Auto-assign to nearest hospital/ambulance
    const HealthResource = require('../models/HealthResource');
    let assignedFacility = null;
    console.log('EMERGENCY ESCALATION: incoming location =', data.location);
    if (data.location && data.location.coordinates) {
      // Find nearest hospital or ambulance within 50km
      const nearby = await HealthResource.find({
        type: { $in: ['hospital', 'transport'] },
        isActive: true,
        isVerified: true,
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: data.location.coordinates
            },
            $maxDistance: 50000
          }
        }
      }).limit(1);
      console.log('EMERGENCY ESCALATION: nearby facilities found =', nearby.length, nearby.map(f => ({title: f.title, coordinates: f.location})));
      if (nearby.length > 0) {
        assignedFacility = nearby[0].title || nearby[0].organization?.name || 'Facility';
        data.assigned_to = assignedFacility;
      }
    }

    // Escalation levels logic
    // If not acknowledged in 10 minutes, escalate to next level (stub)
    // This would require a background job/cron in production
    data.status = 'Reported';

    // Multi-channel notification logic
    // Email, SMS, Push notification stubs
    const User = require('../models/User');
    const sendEmail = require('../utils/sendEmail');
    async function sendNotification({ message, email, phone, pushToken }) {
      // Email
      if (email) {
        await sendEmail({
          to: email,
          subject: 'Emergency Escalation Update',
          text: message,
          html: `<p>${message}</p>`
        });
      }
      // SMS stub
      if (phone) console.log('SMS:', phone, message);
      // Push stub
      if (pushToken) console.log('PUSH:', pushToken, message);
    }
    // Notify assigned facility (if contact info available)
    if (assignedFacility) {
      // Find facility contact (stub: could be extended)
      // sendNotification({ message: `🚨 Emergency case: ${data.emergency_type} reported. Please respond immediately.`, email: facilityEmail, phone: facilityPhone });
      console.log('NOTIFY FACILITY:', assignedFacility);
    }
    // Notify patient/reporter
    if (data.reporter_id) {
      const reporter = await User.findById(data.reporter_id);
      if (reporter) {
        sendNotification({
          message: `Your emergency report has been escalated and assigned to: ${assignedFacility || 'Not assigned yet'}`,
          email: reporter.email,
          phone: reporter.phone,
          pushToken: reporter.pushToken // if available
        });
      }
    }

    const emergency = new EmergencyEscalation(data);
    await emergency.save();
    // Emit socket.io event for new escalation
    const io = req.app.get('io');
    if (io) io.emit('emergency:new', emergency);
    res.status(201).json(emergency);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List/filter emergencies
router.get('/', async (req, res) => {
  try {
    const emergencies = await EmergencyEscalation.find().sort({ created_at: -1 });
    res.json(emergencies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update status, assign responder, mark as completed
router.patch('/:id', async (req, res) => {
  try {
    const update = req.body;
    update.updated_at = new Date();
    const emergency = await EmergencyEscalation.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!emergency) return res.status(404).json({ error: 'Not found' });
    // Emit socket.io event for escalation update (all + reporter)
    const io = req.app.get('io');
    if (io) {
      io.emit('emergency:update', emergency);
      if (emergency.reporter_id) {
        io.to(String(emergency.reporter_id)).emit('emergency:myupdate', emergency);
      }
    }
    res.json(emergency);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
