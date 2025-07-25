import { useEffect, useState } from "react";
import { WS_URL } from "../constant";
import {io} from "socket.io-client";


export const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketInstance = io(WS_URL , {
      transports: ['websocket'],
    })

    setSocket(socketInstance);

    return ()=> {
      socketInstance.disconnect();
    }
  }, []);

  return socket;
};

