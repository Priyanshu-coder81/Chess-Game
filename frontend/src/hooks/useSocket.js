import { useEffect, useState } from "react";
import { WS_URL } from "../constant";
import { io } from "socket.io-client";
import { getOrCreateGuestSession, getSavedGameSession } from "../utils/generateGuestId";

export const useSocket = () => {
  const [socket, setSocket] = useState(null);

  const guestId = getOrCreateGuestSession();
const savedGameId = getSavedGameSession();

  useEffect(() => {
    const socketInstance = io(WS_URL, {
      transports: ["websocket"],
      query: {
        guestId,
        gameId: savedGameId || "",
      },
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return socket;
};
