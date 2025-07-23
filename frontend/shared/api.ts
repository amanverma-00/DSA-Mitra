/**
 * DSA Chatbot API Types and Service
 * Shared code between client and server
 */

// Base API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// User Types
export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'assistant';
  createdAt: string;
  lastActive?: string;
  learningPreferences: {
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    language: string;
  };
  stats: {
    totalMessages: number;
    totalTokens: number;
    uniqueConcepts: number;
  };
  activeSessions: number;
  sessions: SessionSummary[];
}

export interface SessionSummary {
  id: string;
  title: string;
  created: string;
  lastActive: string;
  messageCount?: number;
  tokensUsed?: number;
  isActive?: boolean;
}

export interface Session {
  id: string;
  title: string;
  context: {
    name?: string;
    currentTopic?: string;
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
    lastConcept?: string;
  };
  createdAt: string;
  lastActiveAt: string;
  isActive: boolean;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: string;
  metadata?: {
    tokensUsed?: number;
    modelVersion?: string;
    isDSAConcept?: boolean;
    conceptTags?: string[];
  };
}

export interface LearningProgress {
  concept: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  masteryLevel: 'introduced' | 'practicing' | 'comfortable' | 'mastered';
  firstEncountered: string;
  lastPracticed: string;
  practiceCount: number;
  sessions: Array<{
    sessionId: string;
    discussedAt: string;
  }>;
}

export interface LearningStats {
  totalConcepts: number;
  masteredConcepts: number;
  categoriesLearned: string[];
  totalPracticeCount: number;
}

// API Response Types
export interface AuthResponse {
  user: User;
  message: string;
}

export interface ProfileResponse {
  user: User;
}

export interface SessionResponse {
  session: Session;
  messages: Message[];
}

export interface SessionsResponse {
  sessions: SessionSummary[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalSessions: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface MessageResponse {
  userMessage: Message;
  assistantMessage: Message;
}

export interface LearningProgressResponse {
  progress: LearningProgress[];
  stats: LearningStats;
}

export interface ExportResponse {
  user: User;
  sessions: Session[];
  messages: Message[];
  learningProgress: LearningProgress[];
  exportedAt: string;
}

// API Error Type
export interface ApiError {
  error: string;
  details?: string;
}

// API Service Class
export class DSAApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;



    const config: RequestInit = {
      credentials: 'include', // Important for cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));

        // Handle authentication errors specifically
        if (response.status === 401) {
          throw new Error('Authentication required');
        }

        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Only log non-authentication errors to avoid console spam
      if (error instanceof Error && !error.message.includes('Authentication required')) {
        console.error(`API Error (${endpoint}):`, error);
      }
      throw error;
    }
  }

  // Authentication Methods
  async register(userData: {
    username: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/user/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/user/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    return this.request('/user/logout', {
      method: 'POST',
    });
  }

  async deleteProfile(): Promise<{ message: string }> {
    return this.request('/user/deleteProfile', {
      method: 'DELETE',
    });
  }

  // Profile Methods
  async getProfile(): Promise<ProfileResponse> {
    return this.request<ProfileResponse>('/user/getProfile');
  }

  async getEnhancedProfile(): Promise<ProfileResponse> {
    return this.request<ProfileResponse>('/api/profile');
  }

  async updateProfile(updates: {
    username?: string;
    email?: string;
    learningPreferences?: {
      difficulty?: 'beginner' | 'intermediate' | 'advanced';
      language?: string;
    };
  }): Promise<{ user: User }> {
    return this.request('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Session Methods
  async createSession(sessionData: {
    name?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
  }): Promise<{ sessionId: string; title: string; createdAt: string }> {
    return this.request('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async getSession(sessionId: string): Promise<SessionResponse> {
    return this.request<SessionResponse>(`/api/sessions/${sessionId}`);
  }

  async getSessions(page: number = 1, limit: number = 10): Promise<SessionsResponse> {
    return this.request<SessionsResponse>(`/api/profile/sessions?page=${page}&limit=${limit}`);
  }

  async deleteSession(sessionId: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/api/delete-chat`, {
      method: 'POST',
      body: JSON.stringify({
        sessionId: sessionId
      }),
    });
  }

  // Message Methods
  async sendMessage(sessionId: string, content: string): Promise<MessageResponse> {
    return this.request<MessageResponse>(`/api/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        content,
        role: 'user',
      }),
    });
  }

  // Learning Progress Methods
  async getLearningProgress(): Promise<LearningProgressResponse> {
    return this.request<LearningProgressResponse>('/api/profile/learning-progress');
  }

  // Data Export
  async exportData(): Promise<ExportResponse> {
    return this.request<ExportResponse>('/api/profile/export', {
      method: 'POST',
    });
  }
}

// Create a singleton instance
export const apiService = new DSAApiService();
