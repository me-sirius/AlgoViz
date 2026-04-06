import React, {
  createContext,
  useState,
  useEffect,
  useContext,
} from "react";
import { useNavigate } from "react-router-dom";
export const AuthContext = createContext();
import axios from "axios";
import SecureStorage from "../utils/secureStorage";
import Alert from "../../components/Alert";
import SessionModal from "../../components/SessionModal";
// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }) {
  // Core authentication state
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [connectionError, setConnectionError] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentExperience, setCurrentExperience] = useState();
  // User activity and preferences
  const navigate = useNavigate();
  const [userPreferences, setUserPreferences] = useState({
    theme: "light",
    language: "en",
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
  });
  const [sessionAlert, setSessionAlert] = useState({
    isOpen: false,
    message: "",
    type: "error",
  });
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
  // App state
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [hasCompletedTour, setHasCompletedTour] = useState(false);
  const [lastActivity, setLastActivity] = useState(null);
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    message: "",
    type: "error",
    customButtons: null,
  });
  const [sessionModal, setSessionModal] = useState({
    isOpen: false,
    type: "expired", // "expired" or "multiple_login"
  });
  // Error handling
  const [authError, setAuthError] = useState(null);

  // Initialize auth state on app load (Local Storage Check)
  useEffect(() => {
    initializeAuth();
    async function checkingConnection() {
      console.log("Checking connection to backend...");
      try {
        const response = await axios.get(`${API_BASE_URL}`);
        if (response.status !== 200) {
          setConnectionError(true);
        }
      } catch (error) {
        setConnectionError(true);
      }
    }
    checkingConnection();
  }, []);
  // Simple 24-hour inactivity tracking - just update timestamp periodically
  // No event listeners to avoid interfering with UI
  useEffect(() => {
    if (isAuthenticated) {
      // Update activity on mount
      localStorage.setItem('lastActivityTime', Date.now().toString());

      // Update every 5 minutes while app is open (proves user is active)
      const activityInterval = setInterval(() => {
        localStorage.setItem('lastActivityTime', Date.now().toString());
      }, 5 * 60 * 1000); // 5 minutes

      // Check for 24-hour expiry every 5 minutes
      const expiryCheckInterval = setInterval(() => {
        checkInactivityExpiry();
      }, 5 * 60 * 1000);

      return () => {
        clearInterval(activityInterval);
        clearInterval(expiryCheckInterval);
      };
    }
  }, [isAuthenticated]);

  // Check if user has been inactive for 24 hours
  const checkInactivityExpiry = () => {
    const lastActivityTime = localStorage.getItem('lastActivityTime');
    if (!lastActivityTime) return false;

    const lastTime = parseInt(lastActivityTime, 10);
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (now - lastTime >= twentyFourHours) {
      console.log('Session expired due to 24 hours of inactivity');
      handleInactivityLogout();
      return true;
    }
    return false;
  };

  // Handle logout due to inactivity
  const handleInactivityLogout = () => {
    clearAllUserData();
    localStorage.removeItem('lastActivityTime');
    setSessionModal({
      isOpen: true,
      type: "expired",
    });
    setSessionAlert({
      isOpen: true,
      message: "Your session has expired due to 24 hours of inactivity. Please log in again.",
      type: "warning",
    });
  };

  // Update last activity timestamp
  const updateLastActivity = () => {
    localStorage.setItem('lastActivityTime', Date.now().toString());
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        // 1. CHECK SECURE CACHE FIRST (Replaces localStorage.getItem("user"))
        // This prevents the user from seeing/editing their data in DevTools
        const cachedUser = SecureStorage.getItem("user_cache");

        if (cachedUser) {
          console.log("Restoring user from Secure Storage...");
          // Clean up any invalid blob URLs (they don't persist across sessions)
          const cleanedUser = { ...cachedUser };
          if (cleanedUser.avatar && cleanedUser.avatar.startsWith('blob:')) {
            cleanedUser.avatar = null;
          }
          setUser(cleanedUser);
          setIsAuthenticated(true);
          // If we found the user in cache, we stop here (Instant Load)
          // return;
        }

        // 2. IF NO CACHE, FETCH FROM SERVER
        const storedUserId =
          localStorage.getItem("userId") || sessionStorage.getItem("userId");
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        if (storedUserId && token) {
          const response = await axios.get(
            `${API_BASE_URL}/users/getUserDetail/${storedUserId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.status === 200) {
            console.log(response.data);
            setUser(response.data);
            setIsAuthenticated(true);

            // 3. SAVE TO SECURE STORAGE (Replaces localStorage.setItem("user"))
            // This encrypts the data before putting it in the browser
            SecureStorage.setItem("user_cache", response.data);
          }
        }
      } catch (error) {
        console.error("Error fetching user details:", error);

        // Clear ALL auth and user data when session is invalid
        // This prevents the "fake logged in" state
        clearAllUserData();

        // Show session expired modal
        setSessionModal({
          isOpen: true,
          type: "expired",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [token]);
  const initializeAuth = async () => {
    try {
      setIsLoading(true);

      // Check for 24-hour inactivity FIRST
      const lastActivityTime = localStorage.getItem('lastActivityTime');
      if (lastActivityTime) {
        const lastTime = parseInt(lastActivityTime, 10);
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;

        if (now - lastTime >= twentyFourHours) {
          console.log('Session expired on init: 24 hours of inactivity');
          clearAllUserData();
          localStorage.removeItem('lastActivityTime');
          setSessionModal({
            isOpen: true,
            type: "expired",
          });
          return;
        }
      }

      // Check for stored token
      const storedToken =
        localStorage.getItem("token") ||
        sessionStorage.getItem("authToken"); // Keep legacy support just in case
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");

      if (storedToken) {
        setToken(storedToken);
      }

      if (storedToken && storedUser) {
        // Set auth state from stored data immediately for UI responsiveness
        setToken(storedToken);
        // Clean up any invalid blob URLs
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.avatar && parsedUser.avatar.startsWith('blob:')) {
          parsedUser.avatar = null;
        }
        setUser(parsedUser);
        setIsAuthenticated(true);
        // Update activity timestamp since user is now active
        updateLastActivity();
        setIsLoading(false);
      } else if (storedToken) {
        // Token exists but user details missing/stale.
        // Let fetchUserDetails handle the fetching and turning off loading.
        setToken(storedToken);
      } else {
        // No token, finish loading as guest
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      setAuthError("Failed to initialize authentication");
      clearAuthData();
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to invalidate token server-side
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuthData();
    }
  };

  const clearAuthData = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setIsFirstLogin(false);
    setAuthError(null);
    setLastActivity(null);

    // Clear storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_cache");
    localStorage.removeItem("userId");
    localStorage.removeItem("userPreferences");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("userPreferences");
  };

  // Clear ALL user-specific data from localStorage (for session expiration)
  const clearAllUserData = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setIsFirstLogin(false);
    setAuthError(null);
    setLastActivity(null);

    // Get all localStorage keys and remove user-specific ones
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      // Remove auth keys and user-specific data keys
      // Note: currentQuestion is NOT cleared as it's not user-sensitive
      if (
        key === "token" ||
        key === "user" ||
        key === "user_cache" ||
        key === "userId" ||
        key === "authToken" ||
        key === "userPreferences" ||
        key.startsWith("submissions_") ||
        key.startsWith("unlocks_")
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    // Clear sessionStorage
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("userPreferences");

    // Clear secure storage
    SecureStorage.removeItem("user_cache");
  };

  // Context value
  const contextValue = {
    // State
    user,
    isAuthenticated,
    isLoading,
    token,
    userPreferences,
    isFirstLogin,
    hasCompletedTour,
    lastActivity,
    authError,
    currentQuestion,
    currentExperience,
    // Setter functions
    setCurrentQuestion,
    setUser,
    setIsAuthenticated,
    setToken,
    setUserPreferences,
    setIsFirstLogin,
    setHasCompletedTour,
    setCurrentExperience,
    // Actions

    logout,

    clearError: () => setAuthError(null),

    // Utility functions
    hasRole: (role) => user?.role === role,
    hasPermission: (permission) => {
      // Add your permission logic here
      return user?.permissions?.includes(permission);
    },
    isEmailVerified: () => user?.isEmailVerified || false,
    getFullName: () =>
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : user?.name || "User",
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
      <Alert
        isOpen={alertConfig.isOpen}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
        customButtons={alertConfig.customButtons}
      />
      <SessionModal
        isOpen={sessionModal.isOpen}
        type={sessionModal.type}
        onLogin={() => {
          setSessionModal((prev) => ({ ...prev, isOpen: false }));
          navigate("/signin");
        }}
        onLogout={() => {
          setSessionModal((prev) => ({ ...prev, isOpen: false }));
          navigate("/");
        }}
      />
    </AuthContext.Provider>
  );
}
