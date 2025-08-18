import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: `${API_URL}/consultations`,
});

const withAuth = (token) => token ? { Authorization: `Bearer ${token}` } : {};

export const consultationService = {
  list: (params = {}, token) => api.get('/', { params, headers: withAuth(token) }),
  book: (data, token) => api.post('/', data, { headers: withAuth(token) }),
};

export default consultationService;










