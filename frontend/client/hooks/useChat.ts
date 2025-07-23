import { useState, useEffect, useCallback } from 'react';
import { apiService, Session, Message, SessionSummary } from '../../shared/api';

export const useChat = () => {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Load user sessions
  const loadSessions = useCallback(async (page: number = 1, limit: number = 10) => {
    setIsLoading(true);
    try {
      const response = await apiService.getSessions(page, limit);
      setSessions(response.sessions);
      return response;
    } catch (error) {
      console.error('Failed to load sessions:', error);
      // Reset sessions to empty array on error
      setSessions([]);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new session
  const createSession = async (sessionData?: {
    name?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
  }) => {
    setIsLoading(true);
    try {
      const response = await apiService.createSession(sessionData || {});
      
      // Add the new session to the list
      const newSession: SessionSummary = {
        id: response.sessionId,
        title: response.title,
        created: response.createdAt,
        lastActive: response.createdAt,
        messageCount: 0,
        tokensUsed: 0,
        isActive: true,
      };
      
      setSessions(prev => [newSession, ...prev]);
      return response;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Load a specific session with its messages
  const loadSession = async (sessionId: string) => {
    setIsLoading(true);
    try {
      const response = await apiService.getSession(sessionId);
      setCurrentSession(response.session);
      setMessages(response.messages);
      return response;
    } catch (error) {
      console.error('Failed to load session:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Send a message in the current session
  const sendMessage = async (sessionId: string, content: string) => {
    if (!content.trim()) return;

    setIsSending(true);
    try {
      const response = await apiService.sendMessage(sessionId, content);
      
      // Add both user and assistant messages to the current messages
      setMessages(prev => [
        ...prev,
        response.userMessage,
        response.assistantMessage,
      ]);

      // Update the session in the sessions list
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? {
              ...session,
              lastActive: new Date().toISOString(),
              messageCount: (session.messageCount || 0) + 2,
              tokensUsed: (session.tokensUsed || 0) + (response.assistantMessage.metadata?.tokensUsed || 0),
            }
          : session
      ));

      return response;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  // Clear current session
  const clearCurrentSession = () => {
    setCurrentSession(null);
    setMessages([]);
  };

  const deleteSession = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    try {
      await apiService.deleteSession(sessionId);

      // If the deleted session is the current session, clear it
      if (currentSession?.id === sessionId) {
        clearCurrentSession();
      }

      // Refresh sessions list
      await loadSessions(1, 10);

      return true;
    } catch (error) {
      console.error('Failed to delete session:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, loadSessions]);

  return {
    sessions,
    currentSession,
    messages,
    isLoading,
    isSending,
    loadSessions,
    createSession,
    loadSession,
    sendMessage,
    clearCurrentSession,
    deleteSession,
  };
};

// Hook for managing learning progress
export const useLearningProgress = () => {
  const [progress, setProgress] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const loadLearningProgress = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getLearningProgress();
      setProgress(response.progress);
      setStats(response.stats);
      return response;
    } catch (error) {
      console.error('Failed to load learning progress:', error);
      // Reset progress and stats to empty on error
      setProgress([]);
      setStats({});
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    progress,
    stats,
    isLoading,
    loadLearningProgress,
  };
};
