import { useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";

export const Card = ({ isOpen, onClose, onGuestPlay }) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
    onClose();
  };

  const handleSignup = () => {
    navigate("/signup");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <div className='bg-neutral-800 rounded-lg p-6 w-full max-w-md mx-4 relative'>
        {/* Close Button */}
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-white hover:text-gray-300 transition-colors duration-200'
        >
          <IoClose size={24} />
        </button>

        {/* Title */}
        <h1 className='text-white text-2xl font-bold text-center mb-6 pr-8'>
          Play Online Chess
        </h1>

        {/* Buttons Container */}
        <div className='space-y-4'>
          {/* Login Button */}
          <button
            onClick={handleLogin}
            className='w-full bg-lime-500 hover:bg-lime-600 text-white font-semibold py-3 px-4 rounded-md transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-neutral-700'
          >
            Log In
          </button>

          {/* Signup Button */}
          <button
            onClick={handleSignup}
            className='w-full bg-neutral-700 hover:bg-neutral-600 text-white font-semibold py-3 px-4 rounded-md transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-neutral-700'
          >
            Sign Up
          </button>
          <button
            onClick={onGuestPlay}
            className='w-full text-white font-semibold hover:scale-105 ease-in-out transition duration-200'
          >
            Play as Guest
          </button>
        </div>
      </div>
    </div>
  );
};
