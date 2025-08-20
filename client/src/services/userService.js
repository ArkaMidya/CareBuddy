import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const userService = {
  // Fetch all doctors
  async listDoctors(token) {
    return axios.get(`${API_URL}/users?role=healthcare_provider`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  },
};

export default userService;
