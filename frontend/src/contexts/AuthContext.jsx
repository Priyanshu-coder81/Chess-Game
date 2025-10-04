import { createContext, useContext, useState, useEffect } from "react";
import { apiService } from "../services/api";

const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [token, setToken] = useState(null);
  // Check if user is already logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await apiService.getCurrentUser();
      setUser(response.data);
    } catch (error) {
      console.log("User not authenticated:", error.message);
      setUser(null);
      // Clear any errors - this is expected behavior
      setError(null);
      setFormError(null);
    } finally {
      setLoading(false);
    }
  };

  /*   const guestLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const guestId = getOrCreateGuestSession();
      setUser({ id: guestId, username: `Guest_${guestId.subtring(6, 12)}` });
      setIsGuest(true);
      localStorage.removeItem("token");
      return { success: true, guestId };
    } catch (error) {
      onsole.error("Guest login failed:", error);
      setError("Failed to start guest session.");
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }; */

  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);

      const response = await apiService.login(credentials);

      setUser(response.data.user);
      setToken(response.data.accessToken);
      localStorage.setItem("token", response.data.accessToken);

      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);

      const response = await apiService.register(userData);
      setUser(response.data);

      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
      setUser(null);
      setError(null);
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, clear local state
      setUser(null);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const clearError = () => {
    setError(null);
    setFormError(null);
  };

  const setFormValidationError = (message) => {
    setFormError(message);
  };

  const value = {
    user,
    token,
    loading,
    error,
    formError,
    login,
    register,
    logout,
    updateUser,
    clearError,
    setFormValidationError,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { useAuth, AuthProvider };
