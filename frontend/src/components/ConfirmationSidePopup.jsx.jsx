import React from 'react';

const ConfirmationSidePopup = ({ showModal, title, message, onConfirm, onClose }) => {
  if (!showModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50  flex justify-end items-center z-50 p-4">
      <div className="relative w-full max-w-sm bg-white p-6 rounded-lg shadow-lg text-black animate-slideInFromRight">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationSidePopup;