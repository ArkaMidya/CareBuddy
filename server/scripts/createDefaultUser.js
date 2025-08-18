const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../config/database');

const createDefaultUser = async () => {
  try {
    await connectDB();
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@carebody.com' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Create admin user
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@carebody.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true,
      isActive: true,
      phone: '+1234567890',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001'
      }
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@carebody.com');
    console.log('🔑 Password: admin123');

    // Create a test patient user
    const existingPatient = await User.findOne({ email: 'patient@carebody.com' });
    if (!existingPatient) {
      const patientUser = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'patient@carebody.com',
        password: 'patient123',
        role: 'patient',
        isVerified: true,
        isActive: true,
        phone: '+1234567891',
        address: {
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210'
        }
      });

      await patientUser.save();
      console.log('✅ Patient user created successfully');
      console.log('📧 Email: patient@carebody.com');
      console.log('🔑 Password: patient123');
    }

    console.log('\n🎉 Default users created successfully!');
    console.log('You can now sign in with either account.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating default user:', error);
    process.exit(1);
  }
};

createDefaultUser();
