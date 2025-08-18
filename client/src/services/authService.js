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

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Login user
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response;
  },

  // Register new user
  register: async (userData) => {
    // Sanitize optional fields so we don't send empty strings that break server-side enums
    const deepClean = (value) => {
      if (value === '' || value === null) return undefined;
      if (Array.isArray(value)) {
        const cleanedArray = value
          .map(deepClean)
          .filter((v) => v !== undefined);
        return cleanedArray.length ? cleanedArray : undefined;
      }
      if (typeof value === 'object' && value !== null) {
        const cleanedObject = Object.entries(value).reduce((acc, [key, val]) => {
          const cleanedVal = deepClean(val);
          if (cleanedVal !== undefined) acc[key] = cleanedVal;
          return acc;
        }, {});
        return Object.keys(cleanedObject).length ? cleanedObject : undefined;
      }
      return value;
    };

    const payload = {
      ...userData,
      // Ensure optional primitives are undefined when empty
      gender: userData.gender || undefined,
      dateOfBirth: userData.dateOfBirth || undefined,
      phone: userData.phone || undefined,
      // Remove address object since we're sending individual fields
    };

    const response = await api.post('/auth/register', deepClean(payload) || {});
    return response;
  },

  // Get current user profile
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data.data.user;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response;
  },

  // Logout user
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response;
  },

  // Verify email
  verifyEmail: async (token) => {
    const response = await api.get(`/auth/verify-email/${token}`);
    return response;
  },
};

export default authService;








