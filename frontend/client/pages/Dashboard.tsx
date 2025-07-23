import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "../hooks/useAuth";
import { useChat, useLearningProgress } from "../hooks/useChat";
import { apiService } from "../../shared/api";
import { toast } from "@/components/ui/use-toast";
import {
  MessageSquare,
  Zap,
  Brain,
  Settings,
  Download,
  LogOut,
  Clock,
  Calendar,
  Loader2
} from "lucide-react";

// Custom animated counter component
const AnimatedCounter = ({
  value,
  duration = 2000,
  isPercentage = false,
  suffix = "",
}: {
  value: number;
  duration?: number;
  isPercentage?: boolean;
  suffix?: string;
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      const easeOutQuad = 1 - (1 - progress) * (1 - progress);
      setCount(Math.floor(easeOutQuad * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return (
    <span>
      {count}
      {isPercentage ? "%" : ""}
      {suffix}
    </span>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, isLoading: authLoading } = useAuth();
  const { sessions, loadSessions, createSession, sendMessage, loadSession, deleteSession } = useChat();
  const { progress, stats, loadLearningProgress } = useLearningProgress();

  const [message, setMessage] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard"); // dashboard, new-chat, search, cheatsheets
  const [searchQuery, setSearchQuery] = useState("");
  const [editFormData, setEditFormData] = useState({
    username: "",
    email: "",
    difficulty: "intermediate",
    language: "JavaScript",
  });

  // All state variables must be declared before any conditional returns
  const [messages, setMessages] = useState<any[]>([]);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [popularTopics, setPopularTopics] = useState<string[]>([]);
  const [dsaCheatsheets, setDsaCheatsheets] = useState<any[]>([]);

  // Update form data when user data is available
  useEffect(() => {
    if (user) {
      setEditFormData({
        username: user.username || "",
        email: user.email || "",
        difficulty: user.learningPreferences?.difficulty || "intermediate",
        language: user.learningPreferences?.language || "JavaScript",
      });
    }
  }, [user]);

  // Load data when component mounts
  useEffect(() => {
    const loadDashboardData = async () => {
      // Don't load data if user is not authenticated or still loading
      if (!user || authLoading) {
        return;
      }

      // Add a delay to ensure authentication is fully established
      await new Promise(resolve => setTimeout(resolve, 500));

      setIsLoadingData(true);

      // Set a timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        console.warn('Dashboard loading timeout - forcing completion');
        setIsLoadingData(false);
      }, 10000); // 10 second timeout

      try {
        // Load sessions and learning progress with error handling for each
        let sessionsData = null;
        let progressData = null;

        try {
          sessionsData = await loadSessions(1, 10);
        } catch (error) {
          console.error('Failed to load sessions:', error);
          // Don't throw, just continue with other data
        }

        try {
          progressData = await loadLearningProgress();
        } catch (error) {
          console.error('Failed to load learning progress:', error);
          // Don't throw, just continue with other data
        }

        // Update chat history with real sessions data
        if (sessionsData && sessionsData.sessions) {
          setChatHistory(sessionsData.sessions.map((session: any, index: number) => ({
            id: session.id || session.sessionId || `session-${index}`,
            title: session.title || `Session ${(session.id || session.sessionId || `${index}`).slice(-6)}`,
            timestamp: new Date(session.lastActive || session.createdAt || Date.now()).toLocaleDateString()
          })));
        } else {
          // Set empty array if no sessions data
          setChatHistory([]);
        }

        // Update popular topics from learning progress
        if (progressData && progressData.progress) {
          const topics = progressData.progress.map((p: any) => p.concept).slice(0, 6);
          setPopularTopics(topics.length > 0 ? topics : []);
        } else {
          // Set empty array if no progress data
          setPopularTopics([]);
        }

        // Clear messages array - no mock messages
        setMessages([]);

        // Update form data with user info (with safe defaults)
        if (user && user.learningPreferences) {
          setEditFormData({
            username: user.username || '',
            email: user.email || '',
            difficulty: user.learningPreferences.difficulty || 'intermediate',
            language: user.learningPreferences.language || 'JavaScript',
          });
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        // Only show toast for unexpected errors, not authentication errors
        if (!error.message.includes('Authentication required') && !error.message.includes('401')) {
          toast({
            title: "Error",
            description: "Failed to load dashboard data. Please refresh the page.",
            variant: "destructive",
          });
        }
      } finally {
        clearTimeout(timeout);
        setIsLoadingData(false);
      }
    };

    loadDashboardData();
  }, [user, authLoading, navigate]);

  // Redirect to signin if not authenticated (after loading is complete)
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('User not authenticated, redirecting to signin');
      navigate('/signin');
    }
  }, [user, authLoading, navigate]);

  // Add an additional check to verify authentication before making API calls
  useEffect(() => {
    const verifyAuth = async () => {
      if (user && !authLoading) {
        try {
          // Try to make a simple authenticated request to verify the session is valid
          await apiService.getProfile();
          console.log('Authentication verified successfully');
        } catch (error) {
          console.error('Authentication verification failed:', error);
          if (error.message.includes('401') || error.message.includes('Authentication required')) {
            console.log('Session expired, redirecting to signin');
            navigate('/signin');
          }
        }
      }
    };

    verifyAuth();
  }, [user, authLoading, navigate]);

  // Initialize dark mode on component mount
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Handler functions
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate('/signin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      await apiService.updateProfile({
        username: editFormData.username,
        email: editFormData.email,
        learningPreferences: {
          difficulty: editFormData.difficulty as 'beginner' | 'intermediate' | 'advanced',
          language: editFormData.language,
        },
      });

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setShowEditProfile(false);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update profile.",
        variant: "destructive",
      });
    }
  };

  const handleExportData = async () => {
    try {
      const exportData = await apiService.exportData();

      // Create and download the file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dsa-chatbot-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data Exported",
        description: "Your data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export data.",
        variant: "destructive",
      });
    }
  };

  // Real messages and chat history will come from the backend (moved to top)

  // Use real user data instead of mock data with safe defaults
  const userProfile = {
    user: user ? {
      ...user,
      username: user.username || "User",
      email: user.email || "user@example.com",
      learningPreferences: {
        difficulty: user.learningPreferences?.difficulty || "intermediate" as const,
        language: user.learningPreferences?.language || "JavaScript",
      },
      stats: {
        totalMessages: stats?.totalMessages || user.stats?.totalMessages || 0,
        totalTokens: stats?.totalTokens || user.stats?.totalTokens || 0,
        uniqueConcepts: stats?.uniqueConcepts || user.stats?.uniqueConcepts || 0,
      },
      activeSessions: user.activeSessions || 0,
      sessions: user.sessions || [],
    } : {
      _id: "",
      username: "User",
      email: "user@example.com",
      role: "user" as const,
      createdAt: new Date().toISOString(),
      learningPreferences: {
        difficulty: "intermediate" as const,
        language: "JavaScript",
      },
      stats: {
        totalMessages: 0,
        totalTokens: 0,
        uniqueConcepts: 0,
      },
      activeSessions: 0,
      sessions: [],
    },
  };

  // Show loading state while authentication is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show loading if user is not available yet (will redirect via useEffect)
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  // Show loading while dashboard data is being loaded
  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Popular topics and DSA cheat sheets (moved to top)

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Send message triggered:', { message: message.trim(), currentSession: currentSession?.id });

    if (!message.trim()) {
      console.log('❌ Empty message, returning');
      return;
    }

    // Check if we have an active session
    if (!currentSession) {
      console.log('❌ No active session');
      toast({
        title: "No Active Session",
        description: "Please create a new session first to start chatting.",
        variant: "destructive",
      });
      return;
    }

    console.log('✅ Proceeding with message send to session:', currentSession.id);

    const userMessage = {
      id: Date.now(),
      role: "user" as const,
      content: message,
      timestamp: new Date(),
    };

    // Add user message to UI immediately
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");

    try {
      // Send message to backend
      const response = await sendMessage(currentSession.id, message);

      // Add AI response to UI
      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant" as const,
        content: response.assistantMessage.content,
        timestamp: new Date(response.assistantMessage.timestamp),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Update session in chat history and learning progress
      await Promise.all([
        loadSessions(1, 10),
        loadLearningProgress()
      ]);

    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });

      // Remove the user message from UI since it failed
      setMessages((prev) => prev.filter(msg => msg.id !== userMessage.id));
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    // Toggle dark mode class on the html element
    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Create a new chat session
  const createNewSession = async () => {
    try {
      const sessionData = {
        name: 'New DSA Chat Session',
        difficulty: user?.learningPreferences?.difficulty || 'intermediate'
      };

      const newSession = await createSession(sessionData);
      // Convert sessionId to id for consistency
      const sessionWithId = {
        ...newSession,
        id: newSession.sessionId
      };
      setCurrentSession(sessionWithId);
      setMessages([]); // Clear messages for new session
      setCurrentView("new-chat");

      toast({
        title: "New Session Created",
        description: "You can now start chatting about DSA topics!",
        variant: "default",
      });

      // Refresh sessions list and learning progress
      await Promise.all([
        loadSessions(1, 10),
        loadLearningProgress()
      ]);

    } catch (error) {
      console.error('Failed to create session:', error);
      toast({
        title: "Error",
        description: "Failed to create new session. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Load messages for a specific session
  const loadSessionMessages = async (sessionId: string) => {
    try {
      console.log('🔄 Loading session messages for:', sessionId);
      const sessionData = await loadSession(sessionId);
      console.log('✅ Session data loaded:', sessionData);

      // Ensure session has id property
      const sessionWithId = {
        ...sessionData.session,
        id: sessionData.session.id || sessionId
      };

      console.log('📝 Setting current session:', sessionWithId);
      console.log('💬 Setting messages:', sessionData.messages);

      setCurrentSession(sessionWithId);
      setMessages(sessionData.messages || []);
      setCurrentView("new-chat");

      toast({
        title: "Session Loaded",
        description: `Loaded ${sessionData.messages?.length || 0} messages from session.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Failed to load session:', error);
      toast({
        title: "Error",
        description: "Failed to load session. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleNewChat = async () => {
    await createNewSession();
  };

  const handleSearchChat = () => {
    setCurrentView("search");
  };

  const handleCheatsheets = () => {
    setCurrentView("cheatsheets");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
  };

  const handleEditProfile = () => {
    setShowEditProfile(true);
    setShowProfile(false);
  };

  const handleSaveProfile = async () => {
    await handleProfileUpdate();
  };

  const handleDeleteAccount = () => {
    setShowDeleteAccount(true);
    setShowProfile(false);
  };

  const confirmDeleteAccount = () => {
    // In a real app, you would send a delete request to your backend
    console.log("Deleting account...");
    setShowDeleteAccount(false);
    // Redirect to landing page or login
  };

  const handleDeleteChat = async (chatId: string, chatTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${chatTitle}"? This action cannot be undone.`)) {
      try {
        await deleteSession(chatId);
        toast({
          title: "Chat Deleted",
          description: `"${chatTitle}" has been deleted successfully.`,
          variant: "default",
        });

        // Refresh the chat history
        await loadSessions(1, 10);

        // Refresh learning progress as well
        await loadLearningProgress();

      } catch (error) {
        console.error('Failed to delete chat:', error);
        toast({
          title: "Error",
          description: "Failed to delete chat. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const filteredChats = chatHistory.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // New Chat View - Full Screen Chat
  if (currentView === "new-chat") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handleBackToDashboard}>
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Dashboard
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-tech-500 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-foreground">
                    DS
                  </span>
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-primary to-tech-500 bg-clip-text text-transparent">
                  DSA ChatBot
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              </div>
              {/* Profile Button */}
              <Dialog open={showProfile} onOpenChange={setShowProfile}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                          {userProfile.user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-xl font-bold">
                          {userProfile.user.username}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {userProfile.user.email}
                        </div>
                      </div>
                    </DialogTitle>
                    <DialogDescription>
                      Member since {formatDate(userProfile.user.createdAt)}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    {/* User Stats */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Learning Statistics
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-primary">
                              {userProfile.user.stats.totalMessages}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Total Messages
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-500">
                              {userProfile.user.stats.totalTokens.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Tokens Used
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-purple-500">
                              {userProfile.user.stats.uniqueConcepts}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Concepts Learned
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3 pt-4">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleEditProfile}
                      >
                        Edit Profile
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={handleDeleteAccount}
                      >
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Full Screen Chat */}
        <div className="flex-1 flex flex-col h-[calc(100vh-80px)]">
          <ScrollArea className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((msg, index) => (
                <div
                  key={msg.id || `message-${index}`}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-4`}
                >
                  <div
                    className={`max-w-2xl ${msg.role === "user" ? "order-2" : "order-1"}`}
                  >
                    <div className={`flex items-start space-x-3 ${msg.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                      {msg.role === "assistant" && (
                        <div className="w-8 h-8 bg-gradient-to-r from-primary to-tech-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary-foreground">
                            AI
                          </span>
                        </div>
                      )}
                      {msg.role === "user" && (
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-white">
                            {user?.username?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                      )}
                      <div
                        className={`p-4 rounded-lg ${
                          msg.role === "user"
                            ? "bg-blue-500 text-white"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                        {msg.role === "assistant" && msg.timestamp && (
                          <div className="text-xs text-muted-foreground mt-2">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </div>
                        )}
                        {msg.role === "user" && msg.timestamp && (
                          <div className="text-xs text-blue-200 mt-2">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input Area - Fixed at bottom */}
          <div className="border-t border-border/50 bg-card/30 backdrop-blur-sm p-6 sticky bottom-0 z-10">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSendMessage} className="flex space-x-4">
                <div className="flex-1 relative">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask me about data structures, algorithms, or any coding problem..."
                    className="w-full pr-12 py-3 text-base bg-background"
                    autoFocus
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-gradient-to-r from-primary to-tech-500"
                    disabled={!message.trim()}
                    title={currentSession ? `Send to session ${currentSession.id}` : 'No active session'}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </Button>
                </div>
              </form>
              <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                <span>Press Enter to send, Shift+Enter for new line</span>
                <div className="flex items-center space-x-2">
                  <span>Session: {currentSession?.id ? 'Active' : 'None'}</span>
                  <span>•</span>
                  <span>Powered by DSA ChatBot AI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Search Chat View
  if (currentView === "search") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted animate-in slide-in-from-left duration-300">
        <div className="container mx-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-4 mb-8">
              <Button variant="ghost" onClick={handleBackToDashboard}>
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Dashboard
              </Button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-tech-500 bg-clip-text text-transparent">
                Search Chats
              </h1>
            </div>

            <div className="mb-6">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search through your chat history..."
                  className="pl-10 py-3 text-base"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredChats.length > 0 ? (
                filteredChats.map((chat) => (
                  <Card
                    key={chat.id}
                    className="hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{chat.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {chat.timestamp}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadSessionMessages(chat.id)}
                          >
                            Open Chat
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChat(chat.id, chat.title);
                            }}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <svg
                      className="w-12 h-12 mx-auto mb-4 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <h3 className="text-lg font-medium mb-2">No chats found</h3>
                    <p className="text-muted-foreground">
                      {searchQuery
                        ? `No chats match "${searchQuery}"`
                        : "Start typing to search your chats"}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DSA Cheatsheets View
  if (currentView === "cheatsheets") {
    const categories = dsaCheatsheets.length > 0 ? [
      ...new Set(dsaCheatsheets.map((sheet) => sheet.category)),
    ] : [];

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted animate-in slide-in-from-bottom duration-300">
        <div className="container mx-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center space-x-4 mb-8">
              <Button variant="ghost" onClick={handleBackToDashboard}>
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Dashboard
              </Button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-tech-500 bg-clip-text text-transparent">
                DSA Cheatsheets
              </h1>
            </div>

            <div className="grid gap-8">
              {categories.map((category) => (
                <div key={category}>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">
                    {category}
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dsaCheatsheets
                      .filter((sheet) => sheet.category === category)
                      .map((sheet) => (
                        <Button
                          key={sheet.id}
                          variant="outline"
                          className="h-auto p-6 text-left flex flex-col items-start space-y-2 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                        >
                          <div className="w-full">
                            <h3 className="font-semibold text-base mb-2">
                              {sheet.title}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {sheet.description}
                            </p>
                          </div>
                          <div className="flex items-center text-primary text-sm mt-4">
                            <span>View Cheatsheet</span>
                            <svg
                              className="w-4 h-4 ml-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </Button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default Dashboard View
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex">
      {/* Edit Profile Dialog */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information and learning preferences.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={editFormData.username}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editFormData.email}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <select
                id="difficulty"
                className="w-full p-2 border border-input rounded-md bg-background"
                value={editFormData.difficulty}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    difficulty: e.target.value,
                  }))
                }
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Preferred Language</Label>
              <select
                id="language"
                className="w-full p-2 border border-input rounded-md bg-background"
                value={editFormData.language}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    language: e.target.value,
                  }))
                }
              >
                <option value="JavaScript">JavaScript</option>
                <option value="Python">Python</option>
                <option value="Java">Java</option>
                <option value="C++">C++</option>
                <option value="Go">Go</option>
                <option value="Rust">Rust</option>
              </select>
            </div>
            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowEditProfile(false)}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSaveProfile}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteAccount} onOpenChange={setShowDeleteAccount}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Delete Account
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot
              be undone and will permanently remove all your data.
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowDeleteAccount(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={confirmDeleteAccount}
            >
              Delete Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
            <DialogDescription>
              View your learning progress and account information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {userProfile.user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{userProfile.user.username}</h3>
                <p className="text-sm text-muted-foreground">{userProfile.user.email}</p>
                <p className="text-xs text-muted-foreground">
                  Member since {new Date(userProfile.user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Learning Statistics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  <AnimatedCounter value={userProfile.user.stats.totalMessages} />
                </div>
                <div className="text-xs text-muted-foreground">Total Messages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  <AnimatedCounter value={userProfile.user.stats.totalTokens} />
                </div>
                <div className="text-xs text-muted-foreground">Tokens Used</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">
                  <AnimatedCounter value={userProfile.user.stats.uniqueConcepts} />
                </div>
                <div className="text-xs text-muted-foreground">Concepts Learned</div>
              </div>
            </div>

            {/* Learning Preferences */}
            <div className="space-y-2">
              <h4 className="font-medium">Learning Preferences</h4>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Difficulty Level:</span>
                <Badge variant="secondary">{userProfile.user.learningPreferences.difficulty}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Preferred Language:</span>
                <Badge variant="secondary">{userProfile.user.learningPreferences.language}</Badge>
              </div>
            </div>

            {/* Active Sessions */}
            <div className="space-y-2">
              <h4 className="font-medium">Active Sessions</h4>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Currently Active:</span>
                <Badge variant="outline">{userProfile.user.activeSessions} sessions</Badge>
              </div>
            </div>

            {/* Recent Sessions */}
            {userProfile.user.sessions && userProfile.user.sessions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Recent Sessions</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {userProfile.user.sessions.slice(0, 3).map((session) => (
                    <div key={session.id} className="flex justify-between items-center text-sm">
                      <span className="truncate">Session {session.id.slice(-6)}</span>
                      <span className="text-muted-foreground text-xs">
                        {new Date(session.lastActive).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleEditProfile}
              >
                Edit Profile
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleExportData}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sidebar */}
      <div className="w-80 bg-card/50 backdrop-blur-sm border-r border-border/50 hidden lg:flex lg:flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border/50">
          <Link to="/" className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-tech-500 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">
                DS
              </span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-tech-500 bg-clip-text text-transparent">
              DSA ChatBot
            </span>
          </Link>

          <Button
            className="w-full bg-gradient-to-r from-primary to-tech-500 hover:from-primary/90 hover:to-tech-500/90"
            onClick={handleNewChat}
          >
            + New Chat
          </Button>
        </div>

        {/* Navigation */}
        <div className="p-4 border-b border-border/50">
          <nav className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-primary hover:bg-primary/10"
            >
              <svg
                className="w-4 h-4 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v0"
                />
              </svg>
              Dashboard
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-muted"
              onClick={handleSearchChat}
            >
              <svg
                className="w-4 h-4 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Search Chat
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-muted"
              onClick={handleCheatsheets}
            >
              <svg
                className="w-4 h-4 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              DSA Cheatsheets
            </Button>
          </nav>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 min-h-0">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Recent Chats
          </h3>
          <ScrollArea className="h-full max-h-[400px]">
            <div className="space-y-2 pr-2">
              {chatHistory.length > 0 ? (
                chatHistory.map((chat, index) => (
                  <div
                    key={chat.id || `chat-${index}`}
                    className="group relative flex items-center w-full p-3 text-left hover:bg-muted rounded-md transition-colors"
                  >
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => loadSessionMessages(chat.id)}
                    >
                      <div className="text-sm font-medium truncate">
                        {chat.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {chat.timestamp}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChat(chat.id, chat.title);
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    No chat sessions yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Create a new session to start learning
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center space-x-3 mb-3">
            <Avatar className="cursor-pointer" onClick={() => setShowProfile(true)}>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {userProfile.user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 cursor-pointer" onClick={() => setShowProfile(true)}>
              <div className="text-sm font-medium">
                {userProfile.user.username}
              </div>
              <div className="text-xs text-muted-foreground">Free Plan</div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} title="Sign Out">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={handleExportData}
              title="Export Data"
            >
              <Download className="w-3 h-3 mr-1" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => setShowProfile(true)}
              title="View Profile"
            >
              <Settings className="w-3 h-3 mr-1" />
              Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-tech-500 bg-clip-text text-transparent">
                  DSA Learning Assistant
                </h1>
                <p className="text-muted-foreground">
                  Your AI-powered mentor for data structures and algorithms
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {/* Dark Mode Toggle */}
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <Switch
                    checked={isDarkMode}
                    onCheckedChange={toggleDarkMode}
                  />
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                </div>

                {/* Profile Button */}
                <Dialog open={showProfile} onOpenChange={setShowProfile}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                            {userProfile.user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-xl font-bold">
                            {userProfile.user.username}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {userProfile.user.email}
                          </div>
                        </div>
                      </DialogTitle>
                      <DialogDescription>
                        Member since {formatDate(userProfile.user.createdAt)}
                      </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="max-h-[60vh] pr-4">
                      <div className="space-y-6">
                      {/* User Stats */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">
                          Learning Statistics
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl font-bold text-primary">
                                {userProfile.user.stats.totalMessages}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Total Messages
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl font-bold text-green-500">
                                {userProfile.user.stats.totalTokens.toLocaleString()}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Tokens Used
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl font-bold text-purple-500">
                                {userProfile.user.stats.uniqueConcepts}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Concepts Learned
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      {/* Learning Preferences */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">
                          Learning Preferences
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <Label>Difficulty Level</Label>
                            <Badge variant="secondary" className="capitalize">
                              {userProfile.user.learningPreferences.difficulty}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <Label>Preferred Language</Label>
                            <Badge variant="outline">
                              {userProfile.user.learningPreferences.language}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <Label>Active Sessions</Label>
                            <Badge className="bg-green-500">
                              {userProfile.user.activeSessions} active
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Recent Sessions */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">
                          Recent Sessions
                        </h3>
                        <div className="space-y-3">
                          {userProfile.user.sessions.map((session) => (
                            <Card key={session.id} className="p-4">
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="text-sm font-medium">
                                    Session {session.id.split("-")[1]}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Created: {formatDate(session.created)} at{" "}
                                    {formatTime(session.created)}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-muted-foreground">
                                    Last Active
                                  </div>
                                  <div className="text-xs">
                                    {formatTime(session.lastActive)}
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                      </div>
                    </ScrollArea>

                    {/* Actions */}
                    <div className="flex space-x-3 pt-4">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleEditProfile}
                      >
                        Edit Profile
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={handleDeleteAccount}
                      >
                        Delete Account
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Stats Cards */}
        <div className="p-6 border-b border-border/50">
          <div className="grid grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-primary/10 to-tech-500/10 border-primary/20 animate-in slide-in-from-bottom duration-500">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  <AnimatedCounter value={247} />
                </div>
                <div className="text-sm text-muted-foreground">
                  Problems Solved
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20 animate-in slide-in-from-bottom duration-500 delay-100">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  <AnimatedCounter value={89} isPercentage={true} />
                </div>
                <div className="text-sm text-muted-foreground">
                  Success Rate
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20 animate-in slide-in-from-bottom duration-500 delay-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-1">
                  <AnimatedCounter value={12} />
                </div>
                <div className="text-sm text-muted-foreground">
                  Topics Mastered
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20 animate-in slide-in-from-bottom duration-500 delay-300">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  <AnimatedCounter value={156} suffix="h" />
                </div>
                <div className="text-sm text-muted-foreground">Study Time</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <ScrollArea className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.length === 1 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-tech-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-primary-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    Welcome to your DSA learning journey!
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Ask me anything about data structures, algorithms, or coding
                    problems.
                  </p>

                  <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                    <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                      <h4 className="font-medium mb-2">🔍 Your Learning Topics</h4>
                      <div className="flex flex-wrap gap-2">
                        {popularTopics.length > 0 ? (
                          popularTopics.map((topic, index) => (
                            <Badge
                              key={`topic-${topic}-${index}`}
                              variant="secondary"
                              className="text-xs"
                            >
                              {topic}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Start learning to see your topics here
                          </p>
                        )}
                      </div>
                    </Card>

                    <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                      <h4 className="font-medium mb-2">💡 Quick Start</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li key="complexity">• Explain algorithm complexity</li>
                        <li key="structures">• Review data structures</li>
                        <li key="problems">• Practice coding problems</li>
                        <li key="help">• Get implementation help</li>
                      </ul>
                    </Card>
                  </div>
                </div>
              )}

              {messages.map((msg, index) => (
                <div
                  key={msg.id || `message-${index}`}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-4`}
                >
                  <div
                    className={`max-w-2xl ${msg.role === "user" ? "order-2" : "order-1"}`}
                  >
                    <div className={`flex items-start space-x-3 ${msg.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                      {msg.role === "assistant" && (
                        <div className="w-8 h-8 bg-gradient-to-r from-primary to-tech-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary-foreground">
                            AI
                          </span>
                        </div>
                      )}
                      {msg.role === "user" && (
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-white">
                            {user?.username?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                      )}
                      <div
                        className={`p-4 rounded-lg ${
                          msg.role === "user"
                            ? "bg-blue-500 text-white"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                        {msg.role === "assistant" && msg.timestamp && (
                          <div className="text-xs text-muted-foreground mt-2">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </div>
                        )}
                        {msg.role === "user" && msg.timestamp && (
                          <div className="text-xs text-blue-200 mt-2">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                      {msg.role === "user" && (
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                            {userProfile.user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-border/50 bg-card/30 backdrop-blur-sm p-6">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSendMessage} className="flex space-x-4">
                <div className="flex-1 relative">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask me about data structures, algorithms, or any coding problem..."
                    className="w-full pr-12 py-3 text-base"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-gradient-to-r from-primary to-tech-500"
                    disabled={!message.trim()}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </Button>
                </div>
              </form>
              <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                <span>Press Enter to send, Shift+Enter for new line</span>
                <span>Powered by DSA ChatBot AI</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
