const mongoose = require('mongoose');
const Feedback = require('../models/Feedback');
const Referral = require('../models/Referral');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carebody', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createSampleData = async () => {
  try {
    console.log('Creating sample data...');

    // Get some users for sample data
    const users = await User.find().limit(5);
    if (users.length === 0) {
      console.log('No users found. Please create users first.');
      return;
    }

    const patient = users[0];
    const provider = users.find(u => u.role === 'healthcare_provider') || users[1];

    // Create sample feedback
    const sampleFeedback = [
      {
        title: 'Excellent Care Experience',
        description: 'The doctor was very professional and took time to explain everything clearly. The facility was clean and staff was friendly.',
        type: 'care_quality',
        rating: {
          overall: 5,
          careQuality: 5,
          communication: 5,
          waitTime: 4,
          facility: 5
        },
        patient: patient._id,
        healthcareProvider: provider._id,
        status: 'resolved',
        priority: 'medium'
      },
      {
        title: 'Long Wait Time',
        description: 'Had to wait for over 2 hours for my appointment. The staff apologized but it was still inconvenient.',
        type: 'wait_time',
        rating: {
          overall: 3,
          careQuality: 4,
          communication: 4,
          waitTime: 2,
          facility: 4
        },
        patient: patient._id,
        healthcareProvider: provider._id,
        status: 'addressed',
        priority: 'medium'
      },
      {
        title: 'Great Communication',
        description: 'The nurse explained my treatment plan very clearly and answered all my questions patiently.',
        type: 'communication',
        rating: {
          overall: 5,
          careQuality: 5,
          communication: 5,
          waitTime: 4,
          facility: 4
        },
        patient: patient._id,
        healthcareProvider: provider._id,
        status: 'pending',
        priority: 'low'
      }
    ];

    // Create sample referrals
    const sampleReferrals = [
      {
        title: 'Cardiology Consultation',
        description: 'Patient needs specialist consultation for chest pain and irregular heartbeat.',
        type: 'specialist',
        specialty: 'Cardiology',
        priority: 'urgent',
        urgency: 'high',
        patient: patient._id,
        referringProvider: provider._id,
        clinicalReason: 'Patient presenting with chest pain and irregular heartbeat. ECG shows some abnormalities.',
        status: 'accepted',
        requestedDate: new Date(),
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      },
      {
        title: 'MRI Scan Referral',
        description: 'Patient needs MRI scan for persistent back pain.',
        type: 'diagnostic',
        specialty: 'Radiology',
        priority: 'routine',
        urgency: 'medium',
        patient: patient._id,
        referringProvider: provider._id,
        clinicalReason: 'Patient has been experiencing persistent lower back pain for 3 months. X-ray shows no obvious fracture.',
        status: 'pending',
        requestedDate: new Date(),
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
      },
      {
        title: 'Physical Therapy',
        description: 'Patient needs physical therapy for post-surgery rehabilitation.',
        type: 'treatment',
        specialty: 'Physical Therapy',
        priority: 'routine',
        urgency: 'medium',
        patient: patient._id,
        referringProvider: provider._id,
        clinicalReason: 'Patient underwent knee surgery 2 weeks ago and needs physical therapy for rehabilitation.',
        status: 'in_progress',
        requestedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000) // 21 days from now
      }
    ];

    // Clear existing sample data
    await Feedback.deleteMany({});
    await Referral.deleteMany({});

    // Insert sample data
    const createdFeedback = await Feedback.insertMany(sampleFeedback);
    const createdReferrals = await Referral.insertMany(sampleReferrals);

    console.log(`Created ${createdFeedback.length} sample feedback entries`);
    console.log(`Created ${createdReferrals.length} sample referral entries`);
    console.log('Sample data created successfully!');

  } catch (error) {
    console.error('Error creating sample data:', error);
  } finally {
    mongoose.connection.close();
  }
};

createSampleData();
