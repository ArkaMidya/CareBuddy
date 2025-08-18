const User = require('../models/User');
const connectDB = require('../config/database');

const verifyUser = async () => {
  try {
    await connectDB();
    
    console.log('🔍 Verifying user account...\n');
    
    // Find the user by email
    const user = await User.findOne({ email: 'anantjha08@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`Found user: ${user.firstName} ${user.lastName}`);
    console.log(`Current verification status: ${user.isVerified}`);
    
    // Verify the user
    user.isVerified = true;
    await user.save();
    
    console.log('✅ User verified successfully!');
    console.log(`New verification status: ${user.isVerified}`);
    
    console.log('\n🎉 You can now log in with:');
    console.log(`Email: ${user.email}`);
    console.log('Password: (the password you used during registration)');
    
  } catch (error) {
    console.error('❌ Error verifying user:', error);
  } finally {
    process.exit(0);
  }
};

verifyUser();
