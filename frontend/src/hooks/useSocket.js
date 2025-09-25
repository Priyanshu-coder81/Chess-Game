import { useEffect, useRef, useState } from "react";
import { WS_URL } from "../constant";
import { io } from "socket.io-client";

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      console.log("No authentication token found");
      return;
    }

    console.log("Initializing socket connection with auth token");
    
    const handleReconnect = () => {
      reconnectAttempts.current += 1;
      console.log(`Reconnect attempt ${reconnectAttempts.current}/${maxReconnectAttempts}`);
    };
    
    const newSocket = io(WS_URL, {
      transports: ["websocket"],
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: maxReconnectAttempts,
      timeout: 10000
    });

    newSocket.on("connect", () => {
      console.log("Socket connected successfully:", {
        socketId: newSocket.id,
        reconnectAttempts: reconnectAttempts.current
      });
      setIsConnected(true);
      reconnectAttempts.current = 0;
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", {
        error: error.message,
        type: error.type,
        description: error.description,
        socketId: newSocket.id
      });
      setIsConnected(false);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", {
        reason,
        socketId: newSocket.id,
        wasConnected: isConnected
      });
      setIsConnected(false);
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log("Socket reconnected:", {
        attemptNumber,
        socketId: newSocket.id
      });
      handleReconnect();
    });

    newSocket.on("reconnect_attempt", (attemptNumber) => {
      console.log("Attempting to reconnect:", {
        attemptNumber,
        maxAttempts: maxReconnectAttempts
      });
    });

    newSocket.on("reconnect_error", (error) => {
      console.error("Reconnection error:", {
        error: error.message,
        attemptNumber: reconnectAttempts.current
      });
    });

    newSocket.on("reconnect_failed", () => {
      console.error("Failed to reconnect after all attempts");
      newSocket.disconnect();
    });

    // Handle auth events
    newSocket.on("auth_success", (data) => {
      console.log("Socket authenticated:", data);
    });

    newSocket.on("auth_error", (data) => {
      console.error("Socket authentication failed:", data);
      newSocket.disconnect();
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  return socket;
};
