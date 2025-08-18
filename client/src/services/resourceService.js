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

export const resourceService = {
  // Get all resources with optional filtering
  async getResources(filters = {}) {
    try {
      const response = await api.get('/resources', { params: filters });
      // Extract resources array from the response
      // The API returns { success: true, data: { resources: [...], pagination: {...} } }
      if (response.data && response.data.data && Array.isArray(response.data.data.resources)) {
        return response.data.data.resources;
      } else if (response.data && Array.isArray(response.data.resources)) {
        return response.data.resources;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('Unexpected API response format:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      throw error;
    }
  },

  // Get specific resource by ID
  async getResourceById(id) {
    try {
      const response = await api.get(`/resources/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching resource:', error);
      throw error;
    }
  },

  // Create new resource
  async createResource(resourceData) {
    try {
      console.log('Creating resource with data:', resourceData);
      
      // Check if token exists before making the request
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        throw new Error('You must be logged in to create resources');
      }
      
      console.log('Authentication token found:', token ? 'Yes' : 'No');
      console.log('Resource data being sent:', JSON.stringify(resourceData, null, 2));
      
      const response = await api.post('/resources', resourceData);
      console.log('API Response:', response.data);
      
      // Extract the created resource from the response
      // The API returns { success: true, message: 'Resource created successfully', data: { resource: {...} } }
      if (response.data && response.data.data && response.data.data.resource) {
        return response.data.data.resource;
      } else if (response.data && response.data.resource) {
        return response.data.resource;
      } else {
        return response.data;
      }
    } catch (error) {
      console.error('Error creating resource:', error);
      // Provide more detailed error information
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Server response error:', error.response.data);
        console.error('Status code:', error.response.status);
        
        // Return the error message from the server if available
        if (error.response.data && error.response.data.message) {
          throw new Error(`Server error (${error.response.status}): ${error.response.data.message}`);
        } else if (error.response.data && error.response.data.errors) {
          // Format validation errors
          const validationErrors = error.response.data.errors
            .map(err => err.msg || err.message)
            .join(', ');
          throw new Error(`Validation errors: ${validationErrors}`);
        } else {
          throw new Error(`Server error (${error.response.status}): ${error.response.statusText || 'Please check server logs for details'}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        throw new Error('No response from server. Please check your connection and server status.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Request setup error:', error.message);
        throw new Error(`Error: ${error.message}`);
      }
    }
  },

  // Update existing resource
  async updateResource(id, resourceData) {
    try {
      const response = await api.put(`/resources/${id}`, resourceData);
      return response.data;
    } catch (error) {
      console.error('Error updating resource:', error);
      throw error;
    }
  },

  // Delete resource
  async deleteResource(id) {
    try {
      const response = await api.delete(`/resources/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting resource:', error);
      throw error;
    }
  },
};

export default resourceService;