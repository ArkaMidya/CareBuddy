// Script to fix patient field in all referrals for a given patient email
// Usage: node fixPatientReferrals.js <patientEmail>

const mongoose = require('mongoose');
const User = require('../models/User');
const Referral = require('../models/Referral');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/carebuddy';

async function main() {
  await mongoose.connect(MONGO_URI);

  const patients = await User.find({ role: 'patient' });
  if (!patients.length) {
    console.error('No patients found in the database.');
    process.exit(1);
  }

  let totalUpdated = 0;
  for (const patient of patients) {
    const result = await Referral.updateMany(
      { patient: { $ne: patient._id }, email: patient.email }, // match referrals by email if present
      { $set: { patient: patient._id } }
    );
    console.log(`Updated ${result.modifiedCount} referrals for patient ${patient.email} (${patient._id})`);
    totalUpdated += result.modifiedCount;
  }
  console.log(`Total referrals updated: ${totalUpdated}`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
