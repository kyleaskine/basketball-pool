import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { BracketData } from '../types';

// Define response types
export interface BracketResponse {
  _id: string;
  userEmail: string;
  participantName: string;
  contact: string;
  editToken: string;
  createdAt: string;
  isLocked: boolean;
  picks: BracketData;
  score: number;
}

export interface AuthResponse {
  token: string;
}

export interface MagicLinkResponse {
  message: string;
  success: boolean;
  magicLink?: string; // Only included in development
  token?: string; // Only included in development
}

export interface UserResponse {
  _id: string;
  email: string;
  lastLoginAt: string;
  createdAt: string;
}

// Create axios instance
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests if available
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Auth Services
export const authServices = {
  // Request magic link
  requestMagicLink: async (email: string): Promise<MagicLinkResponse> => {
    const response: AxiosResponse<MagicLinkResponse> = await api.post('/auth/login', { email });
    return response.data;
  },

  // Verify magic link token
  verifyToken: async (token: string, email: string): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.get(`/auth/verify?token=${token}&email=${email}`);
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<UserResponse> => {
    const response: AxiosResponse<UserResponse> = await api.get('/auth/me');
    return response.data;
  }
};

// Bracket Services
export interface BracketSubmissionData {
  userEmail: string;
  participantName: string;
  contact: string;
  picks: BracketData;
}

export interface BracketUpdateData {
  userEmail?: string;
  participantName?: string;
  contact?: string;
  picks?: BracketData;
  editToken: string;
}

export const bracketServices = {
  // Create a new bracket
  createBracket: async (bracketData: BracketSubmissionData): Promise<BracketResponse> => {
    const response: AxiosResponse<BracketResponse> = await api.post('/brackets', bracketData);
    return response.data;
  },

  // Get all brackets for the authenticated user
  getUserBrackets: async (): Promise<BracketResponse[]> => {
    const response: AxiosResponse<BracketResponse[]> = await api.get('/brackets');
    return response.data;
  },

  // Get a bracket by ID (with edit token)
  getBracket: async (id: string, editToken: string | null = null): Promise<BracketResponse> => {
    const url = editToken ? `/brackets/${id}?editToken=${editToken}` : `/brackets/${id}`;
    const response: AxiosResponse<BracketResponse> = await api.get(url);
    return response.data;
  },

  // Update a bracket
  updateBracket: async (id: string, bracketData: BracketUpdateData): Promise<BracketResponse> => {
    const response: AxiosResponse<BracketResponse> = await api.put(`/brackets/${id}`, bracketData);
    return response.data;
  },

  // Delete a bracket
  deleteBracket: async (id: string): Promise<{msg: string}> => {
    const response: AxiosResponse<{msg: string}> = await api.delete(`/brackets/${id}`);
    return response.data;
  }
};

export default api;