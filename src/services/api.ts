import axios, { AxiosInstance, AxiosResponse } from "axios";
import { BracketData } from "../types";

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
  entryNumber?: number; // Added for multiple entries tracking
  totalEntries?: number; // Added to show total entries for a participant
  userToken?: string; // For user identification
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
  type: "news" | "announcement" | "reminder";
  importance: number;
  activeUntil: string;
  createdAt: string;
  updatedAt: string;
}

// Create axios instance
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers["x-auth-token"] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth Services
export const authServices = {
  // Request magic link
  requestMagicLink: async (email: string): Promise<MagicLinkResponse> => {
    const response: AxiosResponse<MagicLinkResponse> = await api.post(
      "/auth/login",
      { email }
    );
    return response.data;
  },

  // Verify magic link token
  verifyToken: async (token: string, email: string): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.get(
      `/auth/verify?token=${token}&email=${encodeURIComponent(email)}`
    );
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<UserResponse> => {
    const response: AxiosResponse<UserResponse> = await api.get("/auth/me");
    return response.data;
  },

  // Check if current user is an admin
  isAdmin: async (): Promise<{ isAdmin: boolean }> => {
    try {
      const response: AxiosResponse<{ isAdmin: boolean }> = await api.get(
        "/auth/is-admin"
      );
      return response.data;
    } catch (error) {
      console.error("Error checking admin status:", error);
      return { isAdmin: false };
    }
  },

  // Create or get user for bracket submission
  createOrGetUser: async (
    email: string
  ): Promise<{
    token: string | null;
    jwtToken?: string;
    isNewUser?: boolean;
  }> => {
    try {
      const response: AxiosResponse<{
        token: string;
        jwtToken: string;
        isNewUser: boolean;
      }> = await api.post("/auth/check-create", { email });

      return response.data;
    } catch (error) {
      console.error("Error creating/checking user:", error);
      return { token: null };
    }
  },

  // Refresh JWT token
  refreshToken: async (): Promise<string | null> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const response: AxiosResponse<{ token: string }> = await api.post(
        "/auth/refresh",
        {}
      );

      return response.data.token;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  },

  // Check if user is logged in
  isLoggedIn: (): boolean => {
    return !!localStorage.getItem("token");
  },

  // Log out user
  logout: (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    // Don't remove userToken_email as it may be needed for anonymous bracket access
  },
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
  createBracket: async (
    bracketData: BracketSubmissionData
  ): Promise<BracketResponse> => {
    const response: AxiosResponse<BracketResponse> = await api.post(
      "/brackets",
      bracketData
    );
    return response.data;
  },

  // Get all brackets for the authenticated user
  getUserBrackets: async (): Promise<BracketResponse[]> => {
    const response: AxiosResponse<BracketResponse[]> = await api.get(
      "/brackets"
    );
    return response.data;
  },

  // Get brackets by email (no authentication required)
  getBracketsByEmail: async (
    email: string,
    token: string
  ): Promise<BracketResponse[]> => {
    const response: AxiosResponse<BracketResponse[]> = await api.get(
      `/brackets/user/${email}?userToken=${token}`
    );
    return response.data;
  },

  // Get a bracket by ID (with edit token)
  getBracket: async (
    id: string,
    editToken: string | null = null
  ): Promise<BracketResponse> => {
    const url = editToken
      ? `/brackets/${id}?editToken=${editToken}`
      : `/brackets/${id}`;
    const response: AxiosResponse<BracketResponse> = await api.get(url);
    return response.data;
  },

  // Update a bracket
  updateBracket: async (
    id: string,
    bracketData: BracketUpdateData
  ): Promise<BracketResponse> => {
    const response: AxiosResponse<BracketResponse> = await api.put(
      `/brackets/${id}`,
      bracketData
    );
    return response.data;
  },

  // Delete a bracket
  deleteBracket: async (id: string): Promise<{ msg: string }> => {
    const response: AxiosResponse<{ msg: string }> = await api.delete(
      `/brackets/${id}`
    );
    return response.data;
  },
};

export const updateServices = {
  // Get all active updates
  getUpdates: async (): Promise<Update[]> => {
    const response: AxiosResponse<Update[]> = await api.get("/updates");
    return response.data;
  },

  // Create new update (admin only)
  createUpdate: async (
    updateData: Omit<Update, "_id" | "createdAt" | "updatedAt">
  ): Promise<Update> => {
    const response: AxiosResponse<Update> = await api.post(
      "/updates",
      updateData
    );
    return response.data;
  },

  // Update an existing update (admin only)
  updateUpdate: async (
    id: string,
    updateData: Partial<Update>
  ): Promise<Update> => {
    const response: AxiosResponse<Update> = await api.put(
      `/updates/${id}`,
      updateData
    );
    return response.data;
  },

  // Delete an update (admin only)
  deleteUpdate: async (id: string): Promise<{ msg: string }> => {
    const response: AxiosResponse<{ msg: string }> = await api.delete(
      `/updates/${id}`
    );
    return response.data;
  },
};

// Admin authentication
export const adminAuthServices = {
  // Check if current user is an admin
  isAdmin: async (): Promise<boolean> => {
    try {
      const response: AxiosResponse<{ isAdmin: boolean }> = await api.get(
        "/auth/is-admin"
      );
      return response.data.isAdmin;
    } catch (error) {
      return false;
    }
  },

  // Make another user an admin (admin only)
  makeAdmin: async (email: string): Promise<{ msg: string }> => {
    const response: AxiosResponse<{ msg: string }> = await api.post(
      "/auth/make-admin",
      { email }
    );
    return response.data;
  },
};

// Admin update services
export const adminUpdateServices = {
  // Get all updates (including inactive ones)
  getAllUpdates: async (): Promise<Update[]> => {
    const response: AxiosResponse<Update[]> = await api.get("/updates/all");
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
    type: "news" | "announcement" | "reminder";
    importance: number;
    activeUntil?: Date;
  }): Promise<Update> => {
    const response: AxiosResponse<Update> = await api.post(
      "/updates",
      updateData
    );
    return response.data;
  },

  // Update an existing update
  updateUpdate: async (
    id: string,
    updateData: Partial<Update>
  ): Promise<Update> => {
    const response: AxiosResponse<Update> = await api.put(
      `/updates/${id}`,
      updateData
    );
    return response.data;
  },

  // Delete an update
  deleteUpdate: async (id: string): Promise<{ msg: string }> => {
    const response: AxiosResponse<{ msg: string }> = await api.delete(
      `/updates/${id}`
    );
    return response.data;
  },
};

// Types for the API responses
export interface UpdateLog {
  _id: string;
  runDate: string;
  status: string;
  trackedGames: TrackedGame[];
  logs: string[];
  completedGames: number;
  totalTrackedGames: number;
  updatedCount?: number;
  allGamesComplete: boolean;
  errorDetails?: ErrorDetail[];
  errors?: ErrorDetail[]; // For backward compatibility
}

export interface TrackedGame {
  gameId: string;
  matchupId: number;
  homeTeam: string;
  awayTeam: string;
  region: string;
  round: string;
  completed: boolean;
  score: {
    homeScore: number;
    awayScore: number;
  };
  updatedInDb: boolean;
}

export interface ErrorDetail {
  message: string;
  stack?: string;
  gameId?: string;
}

export interface TodayStats {
  success: boolean;
  hasGames: boolean;
  allComplete: boolean;
  totalGames: number;
  completedGames: number;
  pendingGames: number;
  lastUpdateTime: string;
  dayDate: string;
  completed: TrackedGame[];
  pending: TrackedGame[];
}

export interface SchedulerStatus {
  enabled: boolean;
  nextRunTime: string | null;
  autoDisabled: boolean;
  disabledReason: string | null;
}

// API service for NCAA updates
export const ncaaUpdateServices = {
  // Get today's games
  getTodayGames: async (showYesterday: boolean = false): Promise<TodayStats> => {
    const response = await api.get('/admin/tournament-today', {
      params: { yesterday: showYesterday }
    });
    return response.data;
  },

  // Get update logs
  getLogs: async (limit: number = 20): Promise<UpdateLog[]> => {
    const response = await api.get('/admin/tournament-logs', {
      params: { limit }
    });
    return response.data;
  },

  // Trigger an update
  triggerUpdate: async (forceYesterday: boolean = false): Promise<any> => {
    const response = await api.post('/admin/update-tournament', {}, {
      params: { forceYesterday }
    });
    return response.data;
  },

  // Mark yesterday as complete
  markYesterdayComplete: async (): Promise<any> => {
    const response = await api.post('/admin/mark-yesterday-complete', {});
    return response.data;
  },

  // Get scheduler status
  getSchedulerStatus: async (): Promise<SchedulerStatus> => {
    const response = await api.get('/admin/scheduler-status');
    return response.data;
  },

  // Toggle scheduler on/off
  toggleScheduler: async (enabled: boolean): Promise<SchedulerStatus> => {
    const response = await api.post('/admin/toggle-scheduler', { enabled });
    return response.data;
  }
};

// Tournament possibilities analysis types
export interface AnalysisTeam {
  name: string;
  seed: number;
}

export interface BracketContender {
  id: string;
  participantName: string;
  entryNumber: number;
  currentScore: number;
  winPercentage?: number;
  maxScore?: number;
  minScore?: number;
  placePercentages?: {
    1: number;
    2: number;
    3: number;
    podium: number;
  };
}

export interface OutcomeCount {
  key: string;
  count: number;
  percentage: number;
}

export interface ChampionshipPick {
  team: string;
  count: number;
  percentage: number;
}

export interface TournamentAnalysis {
  timestamp: string;
  totalBrackets: number;
  totalPossibleOutcomes: number;
  roundName: string;
  currentRound: number;
  topContenders: BracketContender[];
  podiumContenders: BracketContender[];
  highestCeilings: BracketContender[];
  mostVolatile: BracketContender[];
  cinderellaTeams: AnalysisTeam[];
  championshipPicks: ChampionshipPick[];
  bracketOutcomes: {
    sweet16: OutcomeCount[];
    finalFour: OutcomeCount[];
    championship: OutcomeCount[];
  };
}

// Tournament possibilities service
export const tournamentPossibilitiesServices = {
  // Get tournament possibilities analysis
  getAnalysis: async (): Promise<TournamentAnalysis> => {
    const response: AxiosResponse<TournamentAnalysis> = await api.get('/tournament/possibilities');
    return response.data;
  },
  
  // Admin: Generate fresh tournament possibilities analysis
  generateFreshAnalysis: async (): Promise<{
    success: boolean;
    message: string;
    timestamp: string;
    analysisData: TournamentAnalysis;
  }> => {
    const response: AxiosResponse<{
      success: boolean;
      message: string;
      timestamp: string;
      analysisData: TournamentAnalysis;
    }> = await api.post('/tournament/possibilities/generate');
    return response.data;
  }
};

export default api;
