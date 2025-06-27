import { useEffect, useState } from "react";
import { WS_URL } from "../constant";


export const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      setSocket(ws);
    };

    ws.onclose = () => {
      setSocket(null);
    };

    return ()=> {
        ws.close();
    }
  }, []);

  return socket;
};

