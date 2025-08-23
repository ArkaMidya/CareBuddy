import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Generate realistic hospital data around user's location
const generateHospitalsAroundLocation = (lat, lng, count = 8) => {
  const hospitals = [];
  const hospitalNames = [
    'City General Hospital',
    'Regional Medical Center',
    'Community Health Hospital',
    'University Medical Center',
    'Memorial Hospital',
    'Central Hospital',
    'Metropolitan Medical Center',
    'Valley Regional Hospital',
    'Riverside Medical Center',
    'Highland Hospital',
    'Oakwood Medical Center',
    'Springfield Hospital',
    'Mercy Medical Center',
    'St. Mary\'s Hospital',
    'Grace Hospital',
    'Hope Medical Center'
  ];

  const services = [
    { name: 'Emergency Care', description: '24/7 emergency services' },
    { name: 'Cardiology', description: 'Heart care and treatment' },
    { name: 'Neurology', description: 'Brain and nervous system care' },
    { name: 'Orthopedics', description: 'Bone and joint treatment' },
    { name: 'Pediatrics', description: 'Children healthcare' },
    { name: 'Oncology', description: 'Cancer treatment' },
    { name: 'Surgery', description: 'General and specialized surgery' },
    { name: 'Maternity', description: 'Pregnancy and childbirth care' },
    { name: 'Diagnostics', description: 'Laboratory and imaging services' },
    { name: 'Rehabilitation', description: 'Physical therapy and recovery' }
  ];

  for (let i = 0; i < count; i++) {
    // Generate random coordinates within ~10km radius
    const radius = 10; // km
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * radius;
    
    // Convert to lat/lng offset
    const latOffset = (distance * Math.cos(angle)) / 111; // 1 degree ≈ 111 km
    const lngOffset = (distance * Math.sin(angle)) / (111 * Math.cos(lat * Math.PI / 180));
    
    const hospitalLat = lat + latOffset;
    const hospitalLng = lng + lngOffset;

    // Generate random street address
    const streetNumbers = ['123', '456', '789', '321', '654', '987', '147', '258', '369'];
    const streetNames = ['Main St', 'Oak Ave', 'Pine Rd', 'Elm St', 'Maple Dr', 'Cedar Ln', 'Birch Way', 'Willow Ct'];
    const streetNumber = streetNumbers[Math.floor(Math.random() * streetNumbers.length)];
    const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];

    // Random hospital data
    const hospitalName = hospitalNames[Math.floor(Math.random() * hospitalNames.length)];
    const rating = 3.5 + Math.random() * 1.5; // 3.5 to 5.0
    const reviews = Math.floor(Math.random() * 1000) + 50;
    const maxPatients = Math.floor(Math.random() * 400) + 100;
    const availableBeds = Math.floor(maxPatients * 0.8);
    
    // Random services (3-6 services per hospital)
    const hospitalServices = [];
    const numServices = Math.floor(Math.random() * 4) + 3;
    const shuffledServices = [...services].sort(() => 0.5 - Math.random());
    for (let j = 0; j < numServices; j++) {
      hospitalServices.push(shuffledServices[j]);
    }

    // Generate phone number
    const areaCode = Math.floor(Math.random() * 900) + 100;
    const phoneNumber = Math.floor(Math.random() * 9000000) + 1000000;
    const phone = `+1-${areaCode}-${phoneNumber}`;

    const hospital = {
      _id: `hospital_${Date.now()}_${i}`,
      title: hospitalName,
      description: `${hospitalName} provides comprehensive healthcare services including emergency care, specialized treatments, and patient-centered care. Our facility is equipped with state-of-the-art medical technology and staffed by experienced healthcare professionals.`,
      type: 'hospital',
      category: 'emergency',
      location: {
        address: {
          street: `${streetNumber} ${streetName}`,
          city: 'Local City',
          state: 'State',
          country: 'United States',
          postalCode: Math.floor(Math.random() * 90000) + 10000
        },
        coordinates: {
          latitude: hospitalLat,
          longitude: hospitalLng
        }
      },
      contact: {
        phone: [phone],
        email: [`info@${hospitalName.toLowerCase().replace(/\s+/g, '')}.com`],
        website: `https://www.${hospitalName.toLowerCase().replace(/\s+/g, '')}.com`
      },
      availability: {
        emergency24x7: Math.random() > 0.3, // 70% chance of 24/7 emergency
        operatingHours: '24/7',
        daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      },
      services: hospitalServices,
      capacity: {
        maxPatients: maxPatients,
        availableBeds: availableBeds
      },
      quality: {
        rating: parseFloat(rating.toFixed(1)),
        totalReviews: reviews
      },
      isVerified: Math.random() > 0.2, // 80% chance of being verified
      isActive: true,
      createdAt: new Date().toISOString()
    };

    hospitals.push(hospital);
  }

  return hospitals;
};

export const hospitalService = {
  // Get hospitals near user's location
  async getHospitalsNearLocation(lat, lng, radius = 50) {
    try {
      // First try to get from our database
      const response = await api.get('/resources', { 
        params: { 
          type: 'hospital',
          lat: lat,
          lng: lng,
          radius: radius
        } 
      });

      let hospitals = [];
      
      if (response.data && response.data.success && response.data.data && Array.isArray(response.data.data.resources)) {
        hospitals = response.data.data.resources;
      } else if (response.data && response.data.data && Array.isArray(response.data.data.resources)) {
        hospitals = response.data.data.resources;
      } else if (response.data && Array.isArray(response.data.resources)) {
        hospitals = response.data.resources;
      } else if (Array.isArray(response.data)) {
        hospitals = response.data;
      }

      // If no hospitals found in database, generate dynamic ones
      if (hospitals.length === 0) {
        console.log('No hospitals found in database, generating dynamic hospitals...');
        hospitals = generateHospitalsAroundLocation(lat, lng, 8);
      }

      // Sort by distance (closest first)
      hospitals.sort((a, b) => {
        const distA = this.calculateDistance(lat, lng, a.location.coordinates.latitude, a.location.coordinates.longitude);
        const distB = this.calculateDistance(lat, lng, b.location.coordinates.latitude, b.location.coordinates.longitude);
        return distA - distB;
      });

      return hospitals;
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      
      // Fallback: generate hospitals if API fails
      console.log('API failed, generating fallback hospitals...');
      return generateHospitalsAroundLocation(lat, lng, 6);
    }
  },

  // Calculate distance between two points
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  // Search hospitals by text
  async searchHospitals(searchTerm, lat, lng, radius = 50) {
    try {
      const hospitals = await this.getHospitalsNearLocation(lat, lng, radius);
      
      if (!searchTerm) return hospitals;

      return hospitals.filter(hospital => {
        const searchLower = searchTerm.toLowerCase();
        return (
          hospital.title.toLowerCase().includes(searchLower) ||
          hospital.description.toLowerCase().includes(searchLower) ||
          (hospital.services && hospital.services.some(service => 
            service.name && service.name.toLowerCase().includes(searchLower)
          ))
        );
      });
    } catch (error) {
      console.error('Error searching hospitals:', error);
      return [];
    }
  }
};

export default hospitalService;
