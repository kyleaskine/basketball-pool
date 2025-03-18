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
  userToken?: string; // Added for user identification
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

export interface Update {
    _id: string;
    title: string;
    content: string;
    type: 'news' | 'announcement' | 'reminder';
    importance: number;
    activeUntil: string;
    createdAt: string;
    updatedAt: string;
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
  },
  
  // Check if user exists and create if not
  createOrGetUser: async (email: string): Promise<string | null> => {
    try {
      const response: AxiosResponse<{ token: string, isNewUser: boolean }> = 
        await api.post('/auth/check-create', { email });
      
      return response.data.token;
    } catch (error) {
      console.error('Error creating/checking user:', error);
      return null;
    }
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
  
  // Get brackets by email (no authentication required)
  getBracketsByEmail: async (email: string, token: string): Promise<BracketResponse[]> => {
    const response: AxiosResponse<BracketResponse[]> = 
      await api.get(`/brackets/user/${email}?userToken=${token}`);
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

export const updateServices = {
    // Get all active updates
    getUpdates: async (): Promise<Update[]> => {
      const response: AxiosResponse<Update[]> = await api.get('/updates');
      return response.data;
    },
  
    // Create new update (admin only)
    createUpdate: async (updateData: Omit<Update, '_id' | 'createdAt' | 'updatedAt'>): Promise<Update> => {
      const response: AxiosResponse<Update> = await api.post('/updates', updateData);
      return response.data;
    },
  
    // Update an existing update (admin only)
    updateUpdate: async (id: string, updateData: Partial<Update>): Promise<Update> => {
      const response: AxiosResponse<Update> = await api.put(`/updates/${id}`, updateData);
      return response.data;
    },
  
    // Delete an update (admin only)
    deleteUpdate: async (id: string): Promise<{msg: string}> => {
      const response: AxiosResponse<{msg: string}> = await api.delete(`/updates/${id}`);
      return response.data;
    }
  };

  // Admin authentication
export const adminAuthServices = {
    // Check if current user is an admin
    isAdmin: async (): Promise<boolean> => {
      try {
        const response: AxiosResponse<{isAdmin: boolean}> = await api.get('/auth/is-admin');
        return response.data.isAdmin;
      } catch (error) {
        return false;
      }
    },
  
    // Make another user an admin (admin only)
    makeAdmin: async (email: string): Promise<{msg: string}> => {
      const response: AxiosResponse<{msg: string}> = await api.post('/auth/make-admin', { email });
      return response.data;
    }
  };
  
  // Admin update services
  export const adminUpdateServices = {
    // Get all updates (including inactive ones)
    getAllUpdates: async (): Promise<Update[]> => {
      const response: AxiosResponse<Update[]> = await api.get('/updates/all');
      return response.data;
    },
  
    // Get a specific update by ID
    getUpdate: async (id: string): Promise<Update> => {
      const response: AxiosResponse<Update> = await api.get(`/updates/${id}`);
      return response.data;
    },
  
    // Create a new update
    createUpdate: async (updateData: {
      title: string;
      content: string;
      type: 'news' | 'announcement' | 'reminder';
      importance: number;
      activeUntil?: Date;
    }): Promise<Update> => {
      const response: AxiosResponse<Update> = await api.post('/updates', updateData);
      return response.data;
    },
  
    // Update an existing update
    updateUpdate: async (id: string, updateData: Partial<Update>): Promise<Update> => {
      const response: AxiosResponse<Update> = await api.put(`/updates/${id}`, updateData);
      return response.data;
    },
  
    // Delete an update
    deleteUpdate: async (id: string): Promise<{msg: string}> => {
      const response: AxiosResponse<{msg: string}> = await api.delete(`/updates/${id}`);
      return response.data;
    }
  };

export default api;