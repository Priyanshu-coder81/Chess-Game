import React, { createContext, useContext, useEffect, useState } from "react";

import { guestId } from "../utils/generateGuestId";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      const newGuest = {
        id: guestId(),
        isGuest: true,
      };
      localStorage.setItem("user", JSON.stringify(newGuest));
      setUser(newGuest);
    }
  }, []);
};
