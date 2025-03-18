import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests if available
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Auth Services
export const authServices = {
  // Request magic link
  requestMagicLink: async (email) => {
    const response = await api.post('/auth/login', { email });
    return response.data;
  },

  // Verify magic link token
  verifyToken: async (token, email) => {
    const response = await api.get(`/auth/verify?token=${token}&email=${email}`);
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Bracket Services
export const bracketServices = {
  // Create a new bracket
  createBracket: async (bracketData) => {
    const response = await api.post('/brackets', bracketData);
    return response.data;
  },

  // Get all brackets for the authenticated user
  getUserBrackets: async () => {
    const response = await api.get('/brackets');
    return response.data;
  },

  // Get a bracket by ID (with edit token)
  getBracket: async (id, editToken = null) => {
    const url = editToken ? `/brackets/${id}?editToken=${editToken}` : `/brackets/${id}`;
    const response = await api.get(url);
    return response.data;
  },

  // Update a bracket
  updateBracket: async (id, bracketData) => {
    const response = await api.put(`/brackets/${id}`, bracketData);
    return response.data;
  },

  // Delete a bracket
  deleteBracket: async (id) => {
    const response = await api.delete(`/brackets/${id}`);
    return response.data;
  }
};

export default api;