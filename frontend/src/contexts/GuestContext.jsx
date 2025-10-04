import { createContext, useContext, useState, useEffect } from "react";
import { getOrCreateGuestSession } from "../utils/generateGuestId";

const GuestContext = createContext();

const useGuest = () => {
  const context = useContext(GuestContext);
  if (!context) {
    throw new Error("useGuest must be used within a GuestProvider");
  }
  return context;
};

const GuestProvider = ({ children }) => {
  const [guestId, setGuestId] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeGuestSession();
  }, []);

  const initializeGuestSession = () => {
    try {
      const token = localStorage.getItem("token");

      // If user has a token, they're not a guest
      if (token) {
        setIsGuest(false);
        setGuestId(null);
      } else {
        // No token, create or get guest session
        const sessionId = getOrCreateGuestSession();
        setGuestId(sessionId);
        setIsGuest(true);
      }
    } catch (error) {
      console.error("Error initializing guest session:", error);
      // Fallback: create guest session anyway
      const sessionId = getOrCreateGuestSession();
      setGuestId(sessionId);
      setIsGuest(true);
    } finally {
      setLoading(false);
    }
  };

  const createGuestSession = () => {
    try {
      const sessionId = getOrCreateGuestSession();
      setGuestId(sessionId);
      setIsGuest(true);
      return sessionId;
    } catch (error) {
      console.error("Error creating guest session:", error);
      throw error;
    }
  };

  const clearGuestSession = () => {
    setGuestId(null);
    setIsGuest(false);
    localStorage.removeItem("guestSession");
  };

  const value = {
    guestId,
    isGuest,
    loading,
    createGuestSession,
    clearGuestSession,
    initializeGuestSession,
  };

  return (
    <GuestContext.Provider value={value}>{children}</GuestContext.Provider>
  );
};

export { useGuest, GuestProvider };
