import { useEffect, useRef, useState } from "react";
import { WS_URL } from "../constant";
import { io } from "socket.io-client";

export const useSocket = () => {
  const [socket,setSocket]= useState(null);
  

  useEffect(() => {
  
    const token = localStorage.getItem("token");

    const newSocket = io(WS_URL, {
      transports: ["websocket"],
      auth: token ? { token } : {},
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return socket;
};
