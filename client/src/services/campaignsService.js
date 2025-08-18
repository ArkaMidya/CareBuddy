import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '';

const list = (params = {}, token) => {
  // Remove empty/undefined/null params so server validators don't reject empty query strings
  const filteredParams = Object.fromEntries(
    Object.entries(params || {}).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );

  return axios.get(`${API_BASE}/api/campaigns`, {
    params: filteredParams,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};

const get = (id, token) => {
  return axios.get(`${API_BASE}/api/campaigns/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};

const register = (id, body = {}, token) => {
  return axios.post(`${API_BASE}/api/campaigns/${id}/register`, body, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};

const create = (payload, token) => {
  return axios.post(`${API_BASE}/api/campaigns`, payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};

const cancel = (id, token) => {
  return axios.patch(`${API_BASE}/api/campaigns/${id}/cancel`, {}, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};

const remove = (id, token) => {
  return axios.delete(`${API_BASE}/api/campaigns/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};

const campaignsService = { list, get, register, create, cancel, remove };

export default campaignsService;


