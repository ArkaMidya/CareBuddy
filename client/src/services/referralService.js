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

export const referralService = {
  // Get all referrals with optional filtering
  async getReferrals(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const response = await api.get(`/referrals?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching referrals:', error);
      throw error;
    }
  },

  // Get specific referral by ID
  async getReferralById(id) {
    try {
      const response = await api.get(`/referrals/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching referral:', error);
      throw error;
    }
  },

  // Create new referral
  async createReferral(referralData) {
    try {
      const response = await api.post('/referrals', referralData);
      return response.data;
    } catch (error) {
      console.error('Error creating referral:', error);
      throw error;
    }
  },

  // Accept a referral
  async acceptReferral(id, acceptanceData) {
    try {
      const response = await api.put(`/referrals/${id}/accept`, acceptanceData);
      return response.data;
    } catch (error) {
      console.error('Error accepting referral:', error);
      throw error;
    }
  },

  // Update referral status
  async updateReferralStatus(id, statusData) {
    try {
      const response = await api.put(`/referrals/${id}/update-status`, statusData);
      return response.data;
    } catch (error) {
      console.error('Error updating referral status:', error);
      throw error;
    }
  },

  // Add note to referral
  async addReferralNote(id, noteData) {
    try {
      const response = await api.post(`/referrals/${id}/notes`, noteData);
      return response.data;
    } catch (error) {
      console.error('Error adding referral note:', error);
      throw error;
    }
  },

  // Get referral statistics
  async getReferralStats() {
    try {
      const response = await api.get('/referrals/stats/overview');
      return response.data;
    } catch (error) {
      console.error('Error fetching referral stats:', error);
      throw error;
    }
  }
};

export default referralService;
