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

export const feedbackService = {
  // Get all feedback with optional filtering
  async getFeedback(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const response = await api.get(`/feedback?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching feedback:', error);
      throw error;
    }
  },

  // Get specific feedback by ID
  async getFeedbackById(id) {
    try {
      const response = await api.get(`/feedback/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching feedback:', error);
      throw error;
    }
  },

  // Submit new feedback
  async submitFeedback(feedbackData) {
    try {
      const response = await api.post('/feedback', feedbackData);
      return response.data;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  },

  // Respond to feedback
  async respondToFeedback(id, responseData) {
    try {
      const response = await api.put(`/feedback/${id}/respond`, responseData);
      return response.data;
    } catch (error) {
      console.error('Error responding to feedback:', error);
      throw error;
    }
  },

  // Update feedback status
  async updateFeedbackStatus(id, statusData) {
    try {
      const response = await api.put(`/feedback/${id}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error('Error updating feedback status:', error);
      throw error;
    }
  },

  // Get feedback statistics
  async getFeedbackStats() {
    try {
      const response = await api.get('/feedback/stats/overview');
      return response.data;
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
      throw error;
    }
  }
};

export default feedbackService;
