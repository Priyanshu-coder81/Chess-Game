// src/utils/guestUtils.js
import { nanoid } from 'nanoid';

const GUEST_KEY = "guestSession";
const GAME_KEY = "currentGameId";

export const getOrCreateGuestSession = () => {
  let data = localStorage.getItem(GUEST_KEY);
  const now = Date.now();

  if (data) {
    const { guestId, createdAt } = JSON.parse(data);
    if (now - createdAt < 3600000) return guestId; // valid for 1 hour
  }

  const guestId = `guest_${nanoid(8)}`;
  localStorage.setItem(GUEST_KEY, JSON.stringify({ guestId, createdAt: now }));
  return guestId;
};

export const saveGameSession = (gameId) => {
  localStorage.setItem(GAME_KEY, gameId);
};

export const getSavedGameSession = () => {
  return localStorage.getItem(GAME_KEY);
};
