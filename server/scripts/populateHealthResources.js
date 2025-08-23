const mongoose = require('mongoose');
const HealthResource = require('../models/HealthResource');
const User = require('../models/User');

// Sample health resources data with real coordinates
const sampleResources = [
  {
    title: 'Apollo Hospitals',
    description: 'Multi-specialty hospital providing comprehensive healthcare services including emergency care, cardiology, neurology, and more.',
    type: 'hospital',
    category: 'emergency',
    location: {
      address: {
        street: '154/11, Bannerghatta Road',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        postalCode: '560076'
      },
      coordinates: {
        latitude: 12.9716,
        longitude: 77.5946
      }
    },
    contact: {
      phone: ['+91-80-71791090'],
      email: ['info@apollohospitals.com'],
      website: 'https://www.apollohospitals.com'
    },
    availability: {
      emergency24x7: true,
      operatingHours: '24/7',
      daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    services: [
      { name: 'Emergency Care', description: '24/7 emergency services' },
      { name: 'Cardiology', description: 'Heart care and treatment' },
      { name: 'Neurology', description: 'Brain and nervous system care' },
      { name: 'Orthopedics', description: 'Bone and joint treatment' },
      { name: 'Pediatrics', description: 'Children healthcare' }
    ],
    capacity: {
      maxPatients: 500,
      availableBeds: 450
    },
    quality: {
      rating: 4.5,
      totalReviews: 1250
    },
    isVerified: true,
    isActive: true
  },
  {
    title: 'Fortis Hospital',
    description: 'Leading healthcare provider offering world-class medical services and patient care.',
    type: 'hospital',
    category: 'emergency',
    location: {
      address: {
        street: '154/9, Bannerghatta Road',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        postalCode: '560076'
      },
      coordinates: {
        latitude: 12.9721,
        longitude: 77.5932
      }
    },
    contact: {
      phone: ['+91-80-66214444'],
      email: ['info@fortishealthcare.com'],
      website: 'https://www.fortishealthcare.com'
    },
    availability: {
      emergency24x7: true,
      operatingHours: '24/7',
      daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    services: [
      { name: 'Emergency Care', description: '24/7 emergency services' },
      { name: 'Oncology', description: 'Cancer treatment' },
      { name: 'Transplant', description: 'Organ transplantation' },
      { name: 'Cardiology', description: 'Heart care' },
      { name: 'Neurology', description: 'Brain and spine care' }
    ],
    capacity: {
      maxPatients: 400,
      availableBeds: 380
    },
    quality: {
      rating: 4.3,
      totalReviews: 890
    },
    isVerified: true,
    isActive: true
  },
  {
    title: 'Manipal Hospital',
    description: 'Comprehensive healthcare facility providing advanced medical treatments and patient-centered care.',
    type: 'hospital',
    category: 'primary_care',
    location: {
      address: {
        street: '98, HAL Airport Road',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        postalCode: '560017'
      },
      coordinates: {
        latitude: 12.9716,
        longitude: 77.5946
      }
    },
    contact: {
      phone: ['+91-80-25024444'],
      email: ['info@manipalhospitals.com'],
      website: 'https://www.manipalhospitals.com'
    },
    availability: {
      emergency24x7: true,
      operatingHours: '24/7',
      daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    services: [
      { name: 'Primary Care', description: 'General healthcare services' },
      { name: 'Emergency Care', description: '24/7 emergency services' },
      { name: 'Diagnostics', description: 'Laboratory and imaging services' },
      { name: 'Surgery', description: 'General and specialized surgery' },
      { name: 'Maternity', description: 'Pregnancy and childbirth care' }
    ],
    capacity: {
      maxPatients: 300,
      availableBeds: 280
    },
    quality: {
      rating: 4.4,
      totalReviews: 756
    },
    isVerified: true,
    isActive: true
  },
  {
    title: 'Narayana Health',
    description: 'Affordable healthcare provider offering quality medical services to all sections of society.',
    type: 'hospital',
    category: 'specialized_care',
    location: {
      address: {
        street: '258/A, Bommasandra Industrial Area',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        postalCode: '560099'
      },
      coordinates: {
        latitude: 12.9716,
        longitude: 77.5946
      }
    },
    contact: {
      phone: ['+91-80-27835000'],
      email: ['info@narayanahealth.org'],
      website: 'https://www.narayanahealth.org'
    },
    availability: {
      emergency24x7: true,
      operatingHours: '24/7',
      daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    services: [
      { name: 'Cardiac Care', description: 'Heart disease treatment' },
      { name: 'Cancer Care', description: 'Oncology services' },
      { name: 'Neurosurgery', description: 'Brain and spine surgery' },
      { name: 'Pediatric Care', description: 'Children healthcare' },
      { name: 'Emergency Care', description: '24/7 emergency services' }
    ],
    capacity: {
      maxPatients: 600,
      availableBeds: 550
    },
    quality: {
      rating: 4.2,
      totalReviews: 1120
    },
    isVerified: true,
    isActive: true
  },
  {
    title: 'Columbia Asia Hospital',
    description: 'International standard healthcare facility providing personalized patient care.',
    type: 'hospital',
    category: 'emergency',
    location: {
      address: {
        street: '26/4, Brigade Gateway',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        postalCode: '560055'
      },
      coordinates: {
        latitude: 12.9716,
        longitude: 77.5946
      }
    },
    contact: {
      phone: ['+91-80-61601000'],
      email: ['info@columbiaasia.com'],
      website: 'https://www.columbiaasia.com'
    },
    availability: {
      emergency24x7: true,
      operatingHours: '24/7',
      daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    services: [
      { name: 'Emergency Care', description: '24/7 emergency services' },
      { name: 'Internal Medicine', description: 'Adult healthcare' },
      { name: 'Surgery', description: 'General and specialized surgery' },
      { name: 'Diagnostics', description: 'Laboratory services' },
      { name: 'Pharmacy', description: 'Medication services' }
    ],
    capacity: {
      maxPatients: 200,
      availableBeds: 180
    },
    quality: {
      rating: 4.1,
      totalReviews: 445
    },
    isVerified: true,
    isActive: true
  },
  {
    title: 'Sparsh Hospital',
    description: 'Specialized orthopedic and spine care hospital with advanced surgical facilities.',
    type: 'hospital',
    category: 'specialized_care',
    location: {
      address: {
        street: '29/P1, 29th Cross, 11th Main',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        postalCode: '560078'
      },
      coordinates: {
        latitude: 12.9716,
        longitude: 77.5946
      }
    },
    contact: {
      phone: ['+91-80-22221111'],
      email: ['info@sparshhospital.com'],
      website: 'https://www.sparshhospital.com'
    },
    availability: {
      emergency24x7: true,
      operatingHours: '24/7',
      daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    services: [
      { name: 'Orthopedics', description: 'Bone and joint care' },
      { name: 'Spine Surgery', description: 'Spine treatment' },
      { name: 'Sports Medicine', description: 'Sports injury treatment' },
      { name: 'Rehabilitation', description: 'Physical therapy' },
      { name: 'Emergency Care', description: '24/7 emergency services' }
    ],
    capacity: {
      maxPatients: 150,
      availableBeds: 140
    },
    quality: {
      rating: 4.6,
      totalReviews: 678
    },
    isVerified: true,
    isActive: true
  },
  {
    title: 'Cloudnine Hospital',
    description: 'Specialized women and children hospital providing comprehensive maternity and pediatric care.',
    type: 'hospital',
    category: 'maternal_child',
    location: {
      address: {
        street: '1533, 9th Main, 3rd Block',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        postalCode: '560034'
      },
      coordinates: {
        latitude: 12.9716,
        longitude: 77.5946
      }
    },
    contact: {
      phone: ['+91-80-67676767'],
      email: ['info@cloudninecare.com'],
      website: 'https://www.cloudninecare.com'
    },
    availability: {
      emergency24x7: true,
      operatingHours: '24/7',
      daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    services: [
      { name: 'Maternity Care', description: 'Pregnancy and childbirth' },
      { name: 'Pediatric Care', description: 'Children healthcare' },
      { name: 'Neonatology', description: 'Newborn care' },
      { name: 'Gynecology', description: 'Women health' },
      { name: 'Fertility', description: 'IVF and fertility treatment' }
    ],
    capacity: {
      maxPatients: 100,
      availableBeds: 90
    },
    quality: {
      rating: 4.7,
      totalReviews: 892
    },
    isVerified: true,
    isActive: true
  },
  {
    title: 'Medanta Clinic',
    description: 'Primary care clinic offering general healthcare services and preventive medicine.',
    type: 'clinic',
    category: 'primary_care',
    location: {
      address: {
        street: '45, Koramangala 6th Block',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        postalCode: '560034'
      },
      coordinates: {
        latitude: 12.9716,
        longitude: 77.5946
      }
    },
    contact: {
      phone: ['+91-80-25556666'],
      email: ['info@medantaclinic.com'],
      website: 'https://www.medantaclinic.com'
    },
    availability: {
      emergency24x7: false,
      operatingHours: '8:00 AM - 8:00 PM',
      daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    },
    services: [
      { name: 'General Medicine', description: 'Primary healthcare' },
      { name: 'Vaccinations', description: 'Immunization services' },
      { name: 'Health Checkups', description: 'Preventive health screening' },
      { name: 'Minor Procedures', description: 'Basic medical procedures' },
      { name: 'Consultations', description: 'Doctor consultations' }
    ],
    capacity: {
      maxPatients: 50,
      availableBeds: 0
    },
    quality: {
      rating: 4.3,
      totalReviews: 234
    },
    isVerified: true,
    isActive: true
  },
  {
    title: 'HealthFirst Pharmacy',
    description: 'Full-service pharmacy providing medications, health products, and consultation services.',
    type: 'pharmacy',
    category: 'preventive',
    location: {
      address: {
        street: '78, Indiranagar Main Road',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        postalCode: '560038'
      },
      coordinates: {
        latitude: 12.9716,
        longitude: 77.5946
      }
    },
    contact: {
      phone: ['+91-80-25256666'],
      email: ['info@healthfirstpharmacy.com'],
      website: 'https://www.healthfirstpharmacy.com'
    },
    availability: {
      emergency24x7: false,
      operatingHours: '7:00 AM - 11:00 PM',
      daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    services: [
      { name: 'Medications', description: 'Prescription and OTC drugs' },
      { name: 'Health Products', description: 'Vitamins and supplements' },
      { name: 'Consultation', description: 'Pharmacist consultation' },
      { name: 'Home Delivery', description: 'Medicine delivery service' },
      { name: 'Health Monitoring', description: 'Blood pressure, sugar testing' }
    ],
    capacity: {
      maxPatients: 0,
      availableBeds: 0
    },
    quality: {
      rating: 4.0,
      totalReviews: 156
    },
    isVerified: true,
    isActive: true
  },
  {
    title: 'Diagnostic Center',
    description: 'Advanced diagnostic facility offering comprehensive laboratory and imaging services.',
    type: 'laboratory',
    category: 'diagnostic',
    location: {
      address: {
        street: '123, Jayanagar 4th Block',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        postalCode: '560011'
      },
      coordinates: {
        latitude: 12.9716,
        longitude: 77.5946
      }
    },
    contact: {
      phone: ['+91-80-26656666'],
      email: ['info@diagnosticcenter.com'],
      website: 'https://www.diagnosticcenter.com'
    },
    availability: {
      emergency24x7: false,
      operatingHours: '6:00 AM - 10:00 PM',
      daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    services: [
      { name: 'Blood Tests', description: 'Complete blood count and biochemistry' },
      { name: 'Imaging', description: 'X-ray, CT scan, MRI' },
      { name: 'Cardiac Tests', description: 'ECG, Echo, Stress test' },
      { name: 'Pathology', description: 'Tissue and cell analysis' },
      { name: 'Home Collection', description: 'Sample collection at home' }
    ],
    capacity: {
      maxPatients: 200,
      availableBeds: 0
    },
    quality: {
      rating: 4.4,
      totalReviews: 445
    },
    isVerified: true,
    isActive: true
  }
];

async function populateHealthResources() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/carebuddy', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing resources
    await HealthResource.deleteMany({});
    console.log('Cleared existing health resources');

    // Get a default user for provider field
    const defaultUser = await User.findOne({});
    if (!defaultUser) {
      console.log('No users found in database. Creating a default user...');
      const newUser = new User({
        firstName: 'System',
        lastName: 'Admin',
        email: 'admin@carebuddy.com',
        password: 'admin123456',
        role: 'admin',
        phone: '9876543210'
      });
      await newUser.save();
      console.log('Created default user');
    }

    const provider = await User.findOne({});

    // Add provider to each resource
    const resourcesWithProvider = sampleResources.map(resource => ({
      ...resource,
      provider: provider._id
    }));

    // Insert sample resources
    const result = await HealthResource.insertMany(resourcesWithProvider);
    console.log(`Successfully inserted ${result.length} health resources`);

    // Display inserted resources
    console.log('\nInserted Health Resources:');
    result.forEach((resource, index) => {
      console.log(`${index + 1}. ${resource.title} - ${resource.type} (${resource.category})`);
      console.log(`   Location: ${resource.location.address.street}, ${resource.location.address.city}`);
      console.log(`   Coordinates: ${resource.location.coordinates.latitude}, ${resource.location.coordinates.longitude}`);
      console.log('');
    });

    console.log('Database population completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error populating database:', error);
    process.exit(1);
  }
}

// Run the script
populateHealthResources();
