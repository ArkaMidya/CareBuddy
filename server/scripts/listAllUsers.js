// Script to list all users and their roles for debugging
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/carebuddy';

async function main() {
  await mongoose.connect(MONGO_URI);
  const users = await User.find({});
  if (!users.length) {
    console.log('No users found.');
  } else {
    users.forEach(u => {
      console.log(`User: ${u.email} | Role: ${u.role} | Active: ${u.isActive} | Verified: ${u.isVerified}`);
    });
  }
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
