// Script to convert all HealthResource documents to GeoJSON format for location.coordinates
// Run with: node scripts/convertHealthResourceGeoJSON.js

const mongoose = require('mongoose');
const HealthResource = require('../models/HealthResource');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/carebuddy';

async function convertAll() {
  await mongoose.connect(MONGO_URI);
  const resources = await HealthResource.find({
    'location.coordinates.latitude': { $exists: true },
    'location.coordinates.longitude': { $exists: true }
  });
  let updated = 0;
  for (const res of resources) {
    const lat = res.location.coordinates.latitude;
    const lng = res.location.coordinates.longitude;
    if (typeof lat === 'number' && typeof lng === 'number') {
      res.location = {
        type: 'Point',
        coordinates: [lng, lat]
      };
      await res.save();
      updated++;
    }
  }
  console.log(`Converted ${updated} HealthResource documents to GeoJSON format.`);
  await mongoose.disconnect();
}

convertAll().catch(err => {
  console.error(err);
  process.exit(1);
});
