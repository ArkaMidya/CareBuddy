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

export const reportsService = {
  // Get all reports with optional filtering
  async getReports(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });
      
      const response = await api.get(`/reports?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  },

  // Get a specific report by ID
  async getReport(id) {
    try {
      const response = await api.get(`/reports/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching report:', error);
      throw error;
    }
  },

  // Create a new health report
  async createReport(reportData) {
    try {
      const response = await api.post('/reports', reportData);
      return response.data;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  },

  // Update report status
  async updateReportStatus(id, statusData) {
    try {
      const response = await api.put(`/reports/${id}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error('Error updating report status:', error);
      throw error;
    }
  },

  // Update report details
  async updateReport(id, reportData) {
    try {
      const response = await api.put(`/reports/${id}`, reportData);
      return response.data;
    } catch (error) {
      console.error('Error updating report:', error);
      throw error;
    }
  },

  // Delete a report
  async deleteReport(id) {
    try {
      const response = await api.delete(`/reports/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  },

  // Resolve a report
  async resolveReport(id, resolutionData) {
    try {
      const response = await api.put(`/reports/${id}/resolve`, resolutionData);
      return response.data;
    } catch (error) {
      console.error('Error resolving report:', error);
      throw error;
    }
  },

  // Undo resolution of a report
  async undoResolution(id) {
    try {
      const response = await api.put(`/reports/${id}/undo-resolution`);
      return response.data;
    } catch (error) {
      console.error('Error undoing resolution:', error);
      throw error;
    }
  }
};

export default reportsService;
