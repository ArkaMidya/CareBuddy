// Script to print the current MongoDB connection string and database name for debugging
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/carebuddy';

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to:', mongoose.connection.client.s.url);
  console.log('Database name:', mongoose.connection.name);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
