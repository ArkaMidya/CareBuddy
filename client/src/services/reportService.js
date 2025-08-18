import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: `${API_URL}/reports`,
});

export const reportService = {
  list: (params = {}, token) => api.get('/', { params, headers: token ? { Authorization: `Bearer ${token}` } : {} }),
  create: (data, token) => api.post('/', data, { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
  getById: (id, token) => api.get(`/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
  updateStatus: (id, data, token) => api.put(`/${id}/status`, data, { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
};

export default reportService;










