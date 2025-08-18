const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

async function main() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/carebody';
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected to', mongoose.connection.host);

    const users = await User.find().limit(50).lean();
    console.log(`Found ${users.length} users`);
    console.log(JSON.stringify(users, null, 2));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error listing users:', err.message || err);
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(1);
  }
}

main();


