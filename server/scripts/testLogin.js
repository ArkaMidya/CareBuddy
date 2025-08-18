const User = require('../models/User');
const connectDB = require('../config/database');

const testLogin = async () => {
  try {
    await connectDB();
    
    console.log('🔍 Checking database users...\n');
    
    // Get all users
    const users = await User.find({}).select('+password');
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    console.log(`📊 Found ${users.length} user(s) in database:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Verified: ${user.isVerified}`);
      console.log(`   Password hash: ${user.password.substring(0, 20)}...`);
      console.log('');
    });
    
    // Test login with admin user
    console.log('🧪 Testing login with admin user...');
    const adminUser = await User.findOne({ email: 'admin@carebody.com' }).select('+password');
    
    if (adminUser) {
      const isPasswordValid = await adminUser.comparePassword('admin123');
      console.log(`Admin password test: ${isPasswordValid ? '✅ Valid' : '❌ Invalid'}`);
    } else {
      console.log('❌ Admin user not found');
    }
    
    // Test login with patient user
    console.log('\n🧪 Testing login with patient user...');
    const patientUser = await User.findOne({ email: 'patient@carebody.com' }).select('+password');
    
    if (patientUser) {
      const isPasswordValid = await patientUser.comparePassword('patient123');
      console.log(`Patient password test: ${isPasswordValid ? '✅ Valid' : '❌ Invalid'}`);
    } else {
      console.log('❌ Patient user not found');
    }
    
    console.log('\n✅ Database check completed');
    
  } catch (error) {
    console.error('❌ Error testing login:', error);
  } finally {
    process.exit(0);
  }
};

testLogin();
