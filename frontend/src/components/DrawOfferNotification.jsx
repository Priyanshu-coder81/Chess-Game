import React from 'react';
import { DRAW_ACCEPTED, DRAW_DECLINED } from '../constant.js';

const DrawOfferNotification = ({ socket, gameId, showDrawOfferModal, currentDrawOffer, setShowDrawOfferModal, setCurrentDrawOffer }) => {
  if (!showDrawOfferModal || !currentDrawOffer) {
    return null;
  }

  const handleAcceptDrawOffer = () => {
    if (currentDrawOffer) {
      socket.emit(DRAW_ACCEPTED, { gameId: currentDrawOffer.gameId });
      setShowDrawOfferModal(false);
      setCurrentDrawOffer(null);
    }
  };

  const handleDeclineDrawOffer = () => {
    if (currentDrawOffer) {
      socket.emit(DRAW_DECLINED, { gameId: currentDrawOffer.gameId });
      setShowDrawOfferModal(false);
      setCurrentDrawOffer(null);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-white p-4 rounded-lg shadow-lg text-black max-w-sm">
      <h2 className="text-xl font-bold mb-2">Draw Offer</h2>
      <p className="mb-4">Your opponent ({currentDrawOffer.fromPlayer}) has offered a draw. Accept?</p>
      <div className="flex justify-end gap-2">
        <button
          onClick={handleAcceptDrawOffer}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          Accept
        </button>
        <button
          onClick={handleDeclineDrawOffer}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        >
          Decline
        </button>
      </div>
    </div>
  );
};

export default DrawOfferNotification;