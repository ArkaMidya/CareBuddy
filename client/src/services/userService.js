import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const userService = {
  // Fetch all doctors
  async listDoctors(token, specialization) {
    const params = { role: 'doctor' };
    if (specialization) {
      params.specialization = specialization;
    }
    return axios.get(`${API_URL}/users`, {
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  },
  async listUsers(token, params = {}) {
    return axios.get(`${API_URL}/users`, {
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  },
  async deleteUser(userId, token) {
    return axios.delete(`${API_URL}/users/${userId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  },
  async updateUser(userId, data, token) {
    return axios.patch(`${API_URL}/users/${userId}`, data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  },
};

export default userService;
