// Script to list all patient users and their status
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/carebuddy';

async function main() {
  await mongoose.connect(MONGO_URI);
  const patients = await User.find({ role: 'patient' });
  if (!patients.length) {
    console.log('No patient users found.');
  } else {
    patients.forEach(u => {
      console.log(`Patient: ${u.email} | Active: ${u.isActive} | Verified: ${u.isVerified}`);
    });
  }
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
